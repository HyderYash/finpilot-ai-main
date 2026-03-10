import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { chatWithFinPilot, type ChatMessage, type FinPilotContextData } from "@/lib/llm";
import { parseAssistantContent } from "@/lib/chatParse";
import { InvestmentRecommendationCard } from "@/components/InvestmentRecommendationCard";
import { GlossaryText } from "@/components/GlossaryText";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface MiniChatProps {
  className?: string;
  /** Optional stock/market context (e.g. when user is viewing a stock) */
  currentContext?: FinPilotContextData;
}

export function MiniChat({ className, currentContext }: MiniChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! Ask me about any Indian stock or investment. I can explain simply and suggest products." },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastUserQuestionRef = useRef<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    lastUserQuestionRef.current = msg;
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setInput("");
    setIsTyping(true);
    setError(null);

    const messagesForApi: ChatMessage[] = messages.map((m) => ({ role: m.role, content: m.content }));
    messagesForApi.push({ role: "user", content: msg });

    try {
      const response = await chatWithFinPilot(messagesForApi, currentContext, "en");
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Connection error.";
      setError(errMsg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Check VITE_GEMINI_API_KEY and internet. Get key: aistudio.google.com/apikey" },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  function renderAssistantContent(content: string) {
    const segments = parseAssistantContent(content);
    return (
      <div className="space-y-2">
        {segments.map((seg, i) => {
          if (seg.type === "text") {
            return (
              <div key={i} className="prose prose-invert prose-sm max-w-none text-xs">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                    ul: ({ children }) => <ul className="list-disc pl-3 my-1 space-y-0.5">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-3 my-1 space-y-0.5">{children}</ol>,
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
              compact
            />
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("card-glass flex flex-col overflow-hidden", className)}>
      <div className="flex-1 overflow-auto p-3 space-y-2.5 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-2 animate-fade-in", msg.role === "user" ? "justify-end" : "")}>
            {msg.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-3 h-3 text-primary" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-secondary text-secondary-foreground rounded-bl-sm"
              )}
            >
              {msg.role === "user" ? (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              ) : (
                renderAssistantContent(msg.content)
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3 h-3 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3 h-3 text-primary" />
            </div>
            <div className="bg-secondary rounded-xl rounded-bl-sm px-3 py-2">
              <p className="text-[10px] text-muted-foreground mb-1">Analyzing...</p>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse-soft" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse-soft [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-pulse-soft [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        {error && <p className="text-[10px] text-destructive">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <div className="p-2.5 border-t border-border/60">
        <div className="flex gap-1.5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about stocks..."
            className="flex-1 bg-secondary rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30 transition-shadow"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
