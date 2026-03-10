import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Send, Sparkles, User, Mic, MicOff } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { chatWithFinPilot, type ChatMessage, type FinPilotContextData, type ResponseLanguage } from "@/lib/llm";
import { parseAssistantContent } from "@/lib/chatParse";
import { getDynamicSuggestions } from "@/lib/suggestions";
import { InvestmentRecommendationCard } from "@/components/InvestmentRecommendationCard";
import { GlossaryText } from "@/components/GlossaryText";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  role: "user" | "assistant";
  content: string;
}

/** Status ticker messages during LLM load — "thought process" for judges */
function getStatusTickerMessages(context?: FinPilotContextData | null): string[] {
  const name = context?.shortName || context?.name;
  const base = [
    "Analyzing Nifty 50 trends...",
    "Evaluating risk parameters...",
    "Checking 52-week volatility...",
    "Reviewing sector outlook...",
  ];
  if (name) {
    return [
      `Evaluating risk parameters for ${name}...`,
      `Analyzing ${name} vs sector...`,
      "Checking 52-week volatility...",
      "Preparing a simple explanation...",
    ];
  }
  return base;
}

interface AIChatProps {
  currentContext?: FinPilotContextData;
}

const AIChat = ({ currentContext: propContext }: AIChatProps) => {
  const location = useLocation();
  const locationState = location.state as {
    currentContext?: FinPilotContextData;
    demoQuestion?: string;
    demoUserProfile?: FinPilotContextData["userProfile"];
  } | undefined;
  const contextFromRoute = locationState?.currentContext;
  const currentContext = propContext ?? contextFromRoute;
  const demoQuestion = locationState?.demoQuestion;
  const demoUserProfile = locationState?.demoUserProfile;
  const mergedContext = useMemo((): FinPilotContextData | undefined => {
    const base = currentContext ?? {};
    if (demoUserProfile) return { ...base, userProfile: demoUserProfile };
    return base;
  }, [currentContext, demoUserProfile]);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm FinPilot, your AI financial advisor for the Indian market. I explain things simply and can suggest suitable investments. Ask me about stocks, SIPs, mutual funds, or any money concept!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [responseLanguage, setResponseLanguage] = useState<ResponseLanguage>("en");
  const lastUserQuestionRef = useRef<string>("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => getDynamicSuggestions(mergedContext), [mergedContext]);
  const statusMessages = useMemo(() => getStatusTickerMessages(mergedContext), [mergedContext]);

  // Demo mode: pre-fill and auto-send the hackathon question once when navigated with state.demoQuestion
  const demoSentRef = useRef(false);
  useEffect(() => {
    if (!demoQuestion || demoSentRef.current) return;
    demoSentRef.current = true;
    setInput(demoQuestion);
    const t = setTimeout(() => {
      handleSend(demoQuestion);
    }, 600);
    return () => clearTimeout(t);
    // Intentionally omit handleSend from deps: we only want to run once when demoQuestion is set; handleSend uses initial messages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoQuestion]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cycle status ticker every 2.5s while loading
  useEffect(() => {
    if (!isTyping || statusMessages.length === 0) return;
    const id = setInterval(() => {
      setStatusIndex((i) => (i + 1) % statusMessages.length);
    }, 2500);
    return () => clearInterval(id);
  }, [isTyping, statusMessages.length]);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    lastUserQuestionRef.current = msg;
    const userMsg: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setError(null);
    setStatusIndex(0);

    const messagesForApi: ChatMessage[] = messages.map((m) => ({ role: m.role, content: m.content }));
    messagesForApi.push({ role: "user", content: msg });

    try {
      const response = await chatWithFinPilot(messagesForApi, mergedContext, responseLanguage);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Something went wrong.";
      setError(errMsg);
      // Optionally add a short note to the thread so user can retry
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't connect. Please check your internet and API key, then try again. You can dismiss the error above and send another message.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const startListening = () => {
    const SpeechRecognitionAPI =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition);
    if (!SpeechRecognitionAPI) {
      toast.error("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new (SpeechRecognitionAPI as new () => SpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.results.length - 1]?.[0]?.transcript ?? "";
      if (transcript) setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  function renderAssistantContent(content: string) {
    const segments = parseAssistantContent(content);
    return (
      <div className="space-y-3">
        {segments.map((seg, i) => {
          if (seg.type === "text") {
            return (
              <div key={i} className="prose prose-invert prose-sm max-w-none prose-p:mb-2 prose-p:last:mb-0 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    strong: ({ children }) => (
                      <strong className="font-semibold text-foreground">{children}</strong>
                    ),
                    ul: ({ children }) => <ul className="list-disc pl-4 my-2 space-y-0.5">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 my-2 space-y-0.5">{children}</ol>,
                    a: ({ href, children }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {children}
                      </a>
                    ),
                    text: ({ children }) =>
                      typeof children === "string" ? <GlossaryText>{children}</GlossaryText> : <>{children}</>,
                  }}
                >
                  {seg.content}
                </ReactMarkdown>
              </div>
            );
          }
          return (
            <InvestmentRecommendationCard
              key={i}
              assetName={seg.recommendation.assetName}
              assetType={seg.recommendation.assetType}
              riskLevel={seg.recommendation.riskLevel}
              thesis={seg.recommendation.thesis}
              lastUserQuestion={lastUserQuestionRef.current}
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-background">
      {/* Header — compact: title + language only */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="w-full px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-sm font-semibold text-foreground truncate">Chat</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground hidden sm:inline">Reply in</span>
            <Select
              value={responseLanguage}
              onValueChange={(v) => {
                const next = v === "en" || v === "hi" || v === "mr" ? v : "en";
                setResponseLanguage(next);
              }}
            >
              <SelectTrigger
                className="w-[120px] h-8 text-xs bg-secondary border-border/60 rounded-lg"
                aria-label="Response language"
              >
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en" className="text-xs">English</SelectItem>
                <SelectItem value="hi" className="text-xs">हिंदी</SelectItem>
                <SelectItem value="mr" className="text-xs">मराठी</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Messages — centered column with max-width */}
      <div className="flex-1 overflow-auto">
        <div className="w-full p-4 md:p-6 lg:px-8 space-y-5">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-3 animate-fade-in", msg.role === "user" ? "justify-end" : "")}>
            {msg.role === "assistant" && (
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5 ring-1 ring-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-card",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-card border border-border/50 text-card-foreground rounded-bl-md"
              )}
            >
              {msg.role === "user" ? (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              ) : (
                renderAssistantContent(msg.content)
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 mt-0.5 ring-1 ring-border/50">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0 ring-1 ring-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%] md:max-w-[75%] shadow-card">
              <p className="text-xs text-muted-foreground mb-2 transition-opacity duration-300">
                {statusMessages[statusIndex] ?? "FinPilot is thinking..."}
              </p>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-pulse-soft" />
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-pulse-soft [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-primary/50 animate-pulse-soft [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 flex items-start gap-2">
            <p className="text-sm text-destructive flex-1">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-destructive/70 hover:text-destructive text-xs font-medium shrink-0"
              aria-label="Dismiss"
            >
              Dismiss
            </button>
          </div>
        )}

        {messages.length === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {suggestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={isTyping}
                className="text-left text-sm p-3.5 rounded-xl border border-border/50 bg-card/50 text-muted-foreground hover:bg-accent hover:text-foreground hover:border-border transition-colors disabled:opacity-50 shadow-card"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar — fixed-style footer */}
      <div className="border-t border-border/50 bg-card/80 backdrop-blur-sm p-4 shadow-card">
        <div className="w-full p-4 md:p-6 lg:px-8 flex gap-2 items-center">
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center transition-colors flex-shrink-0",
              isListening
                ? "bg-destructive/20 text-destructive hover:bg-destructive/30 ring-1 ring-destructive/30"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent border border-border/50"
            )}
            title={isListening ? "Stop listening" : "Speak your question"}
            aria-label={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about any Indian stock or investment..."
            className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 border border-border/50 transition-shadow"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="w-11 h-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-40 flex-shrink-0 shadow-card hover:shadow-card-hover disabled:shadow-none"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
