/**
 * FinPilot AI — Gemini integration for Innovyuh 2.0 (GDG @ MIT ACSC).
 * Uses Google Gemini 2.5 Flash (free-tier friendly) to meet "Google Technologies" criteria.
 * Set VITE_GEMINI_API_KEY (or VITE_LLM_API_KEY) in .env.local.
 */

import { GoogleGenerativeAI, type Content, type Part } from "@google/generative-ai";

const API_KEY =
  (import.meta.env.VITE_GEMINI_API_KEY as string) || (import.meta.env.VITE_LLM_API_KEY as string);

const MODEL = (import.meta.env.VITE_GEMINI_MODEL as string) || "gemini-2.5-flash";

export type ResponseLanguage = "en" | "hi" | "mr";

const BASE_SYSTEM = `You are FinPilot, acting as a **Financial Inclusion Officer** for India. Your mission is to bridge the financial literacy gap for first-time investors, college students, and small business owners.

**Core rules:**
1. **Explain simply**: Use everyday Indian analogies (e.g., inflation = rising cost of chai; SIP = recurring deposit in a mutual fund). Avoid jargon unless you explain it immediately.
2. **Be inclusive**: If the user seems confused or asks in Hinglish (Hindi + English), respond in a mix of Hindi and English so they feel at home. Prioritise clarity over formality.
3. **Context-aware**: If the user is viewing a specific stock (provided in context), reference it naturally.
4. **Small business support**: You can answer questions about GST savings, business insurance, parking business surplus, and working capital — in the same simple, jargon-free style. Suggest suitable products (e.g. FD for surplus, term insurance) when relevant.
5. **Recommend with structure**: When the user is ready for a product (e.g. "where to invest 2000 rupees", "safe for retirement", "GST saving options", or a stock question), you MUST output a recommendation in this exact JSON block so the app can show a card:

\`\`\`json
{
  "type": "RECOMMENDATION",
  "assetName": "Name (e.g. Nifty 50 Index Fund, RELIANCE.NS)",
  "assetType": "Stock | Mutual Fund | SIP | FD",
  "riskLevel": "Low | Medium | High",
  "thesis": "2-sentence simple explanation of why this fits their need."
}
\`\`\`

Do not offer financial guarantees. Be encouraging but grounded.`;

const LANGUAGE_INSTRUCTION: Record<ResponseLanguage, string> = {
  en: "IMPORTANT: You MUST respond in English only for this user.",
  hi: "IMPORTANT: You MUST respond in Hindi (Devanagari script) for this user. Use Hindi for all sentences; you may keep financial terms like SIP, Nifty, mutual fund in English if that helps clarity. Do not respond in English.",
  mr: "IMPORTANT: You MUST respond in Marathi (Devanagari script) for this user. Use Marathi for all sentences; you may keep financial terms like SIP, Nifty in English if that helps. Do not respond in English or Hindi.",
};

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface FinPilotContextData {
  symbol?: string;
  name?: string;
  shortName?: string;
  price?: number;
  changePercent?: number;
  sector?: string;
  high52?: number;
  low52?: number;
  /** Optional: simulated user profile for "why this fits you" */
  userProfile?: { type?: string; goal?: string; spareMonthly?: number };
  [key: string]: unknown;
}

function buildSystemInstruction(
  contextData?: FinPilotContextData,
  responseLanguage: ResponseLanguage = "en"
): string {
  const lang: ResponseLanguage = ["en", "hi", "mr"].includes(responseLanguage) ? responseLanguage : "en";
  let system = BASE_SYSTEM + "\n\n" + LANGUAGE_INSTRUCTION[lang];

  if (contextData?.symbol || contextData?.name) {
    system += `\n\n[Current context: User is viewing ${contextData.name || contextData.shortName || contextData.symbol || "a stock"}`;
    if (contextData.symbol) system += ` (${contextData.symbol})`;
    if (contextData.price != null) system += `. Price: ₹${contextData.price.toLocaleString("en-IN")}`;
    if (contextData.changePercent != null)
      system += `, change today: ${contextData.changePercent >= 0 ? "+" : ""}${contextData.changePercent.toFixed(2)}%`;
    if (contextData.sector) system += `. Sector: ${contextData.sector}`;
    if (contextData.high52 != null && contextData.low52 != null)
      system += `. 52W: ₹${contextData.low52.toLocaleString("en-IN")} – ₹${contextData.high52.toLocaleString("en-IN")}`;
    system += ".]";
  }

  if (contextData?.userProfile?.type || contextData?.userProfile?.goal) {
    const p = contextData.userProfile;
    system += `\n\n[User profile (for personalisation): ${p.type || "Investor"}. ${p.goal ? `Goal: ${p.goal}.` : ""} ${p.spareMonthly ? `Spare monthly: ₹${p.spareMonthly}.` : ""}]`;
    if (p.type && /small business|shop|business owner/i.test(String(p.type))) {
      system += ` This user is a small business owner — you may suggest GST-saving instruments, business insurance, or safe parking for business surplus when relevant.`;
    }
  }

  return system;
}

/** Convert our chat history to Gemini parts (user/model alternation). */
function toGeminiHistory(messages: ChatMessage[]): Content[] {
  const out: Content[] = [];
  let currentRole: "user" | "model" | null = null;
  let currentParts: Part[] = [];

  for (const m of messages) {
    if (m.role === "system") continue;
    const nextRole = m.role === "user" ? "user" : "model";
    if (currentRole === nextRole) {
      currentParts.push({ text: m.content });
      continue;
    }
    if (currentRole !== null) {
      out.push({ role: currentRole, parts: currentParts });
    }
    currentRole = nextRole;
    currentParts = [{ text: m.content }];
  }
  if (currentRole !== null) {
    out.push({ role: currentRole, parts: currentParts });
  }
  return out;
}

/** Gemini requires history to start with role 'user'. Drop any leading 'model' turns. */
function dropLeadingModel(history: Content[]): Content[] {
  let i = 0;
  while (i < history.length && history[i].role === "model") i++;
  return history.slice(i);
}

const MAX_RETRIES = 2;

export async function chatWithFinPilot(
  messages: ChatMessage[],
  contextData?: FinPilotContextData,
  responseLanguage: ResponseLanguage = "en"
): Promise<string> {
  if (!API_KEY?.trim()) {
    throw new Error(
      "Missing Gemini API key. Set VITE_GEMINI_API_KEY or VITE_LLM_API_KEY in .env.local. Get one at https://aistudio.google.com/apikey"
    );
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const systemInstruction = buildSystemInstruction(contextData, responseLanguage);
  const allHistory = toGeminiHistory(messages.filter((m) => m.role !== "system"));
  const lastMsg = messages.filter((m) => m.role === "user" || m.role === "assistant").pop();
  const lastUserMessage =
    lastMsg?.role === "user" ? lastMsg.content : "";
  const rawHistory =
    lastMsg?.role === "user" && allHistory.length >= 2
      ? allHistory.slice(0, -1)
      : allHistory;
  const historyForChat = dropLeadingModel(rawHistory);

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const model = genAI.getGenerativeModel({
        model: MODEL,
        systemInstruction,
      });

      if (historyForChat.length === 0) {
        const result = await model.generateContent(lastUserMessage);
        const response = result.response;
        const text = response.text();
        if (typeof text === "string" && text.trim()) return text;
        throw new Error("Empty response from Gemini");
      }

      const chat = model.startChat({
        history: historyForChat,
      });
      const result = await chat.sendMessage(lastUserMessage);
      const response = result.response;
      const text = response.text();
      if (typeof text === "string" && text.trim()) return text;
      throw new Error("Empty response from Gemini");
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      const msg = lastError.message.toLowerCase();
      if (attempt < MAX_RETRIES && (msg.includes("network") || msg.includes("fetch") || msg.includes("503") || msg.includes("429"))) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      if (msg.includes("api key") || msg.includes("invalid") || msg.includes("401")) break;
      throw lastError;
    }
  }

  throw lastError ?? new Error("Gemini request failed. Check your API key and network.");
}
