import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { stocksData } from "@/data/stocks";
import { MarketSummary } from "@/components/MarketSummary";
import { MiniChat } from "@/components/MiniChat";
import { TradingViewChart } from "@/components/TradingViewChart";
import { MarketNews } from "@/components/MarketNews";
import { HistoricalData } from "@/components/HistoricalData";
import { RiskBadge } from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, MessageCircle, X, Sparkles, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_DEMO_PROFILE, MOCK_SMALL_BUSINESS_OWNER } from "@/data/mockUser";

const Dashboard = () => {
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const topStock = stocksData.reduce((a, b) => (a.changePercent > b.changePercent ? a : b));
  const isPositive = topStock.change >= 0;

  return (
    <div className="flex h-[calc(100vh-6rem)]">
      {/* Main scrollable content */}
      <div className={cn("flex-1 overflow-auto transition-all duration-300", chatOpen ? "mr-0" : "")}>
        <div className="p-4 md:p-6 max-w-[1440px] mx-auto">
          {/* Bento-style grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-5">
            <section className="hero-gradient rounded-2xl border border-primary/20 p-6 md:p-8 hero-glow animate-fade-in lg:col-span-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1">Built for Innovyuh 2.0 · GDG @ MIT ACSC</p>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                    Your AI copilot for Indian markets
                  </h1>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                    Get simple explanations, SIP & mutual fund ideas, and stock insights—in your language. Powered by Google Gemini.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <Button
                    onClick={() =>
                      navigate("/chat", {
                        state: {
                          demoQuestion: DEFAULT_DEMO_PROFILE.demoQuestion,
                          demoUserProfile: {
                            type: DEFAULT_DEMO_PROFILE.type,
                            goal: DEFAULT_DEMO_PROFILE.goal,
                            spareMonthly: DEFAULT_DEMO_PROFILE.spareMonthly,
                          },
                        },
                      })
                    }
                    className="btn-cta-glow bg-primary text-primary-foreground hover:bg-primary/90 text-base px-6 py-6 shrink-0 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Try the demo — 30 sec
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigate("/chat", {
                        state: {
                          demoQuestion: MOCK_SMALL_BUSINESS_OWNER.demoQuestion,
                          demoUserProfile: {
                            type: MOCK_SMALL_BUSINESS_OWNER.type,
                            goal: MOCK_SMALL_BUSINESS_OWNER.goal,
                            spareMonthly: MOCK_SMALL_BUSINESS_OWNER.spareMonthly,
                          },
                        },
                      })
                    }
                    className="border-primary/40 text-primary hover:bg-primary/10 text-sm px-4 py-6 rounded-xl font-medium"
                  >
                    Small business demo
                  </Button>
                </div>
              </div>
            </section>

            <div className="lg:col-span-4">
              <MarketSummary />
            </div>

            {/* Top performer chart — large bento cell */}
            <div className="card-glass p-5 animate-fade-in overflow-hidden relative lg:col-span-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" aria-hidden />
              <div className="flex items-center justify-between mb-4 relative">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/15 px-2 py-0.5 rounded-md">Top performer</span>
                    <h2 className="text-lg font-semibold text-foreground">{topStock.shortName}</h2>
                    <RiskBadge level={topStock.riskLevel} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{topStock.sector}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-foreground tabular-nums">
                    ₹{topStock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                  <div className={cn("flex items-center justify-end gap-1 text-sm font-medium", isPositive ? "text-gain" : "text-loss")}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span>{isPositive ? "+" : ""}{topStock.changePercent.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
              <TradingViewChart stock={topStock} />
            </div>

            {/* News + Historical — bento bottom row */}
            <div className="lg:col-span-2">
              <MarketNews />
            </div>
            <div className="lg:col-span-2">
              <HistoricalData />
            </div>
          </div>
        </div>
      </div>

      {/* Right-side AI chat panel */}
      <div className={cn(
        "h-full border-l border-border/60 bg-card flex flex-col transition-all duration-300 overflow-hidden",
        chatOpen ? "w-80 min-w-[320px]" : "w-0 min-w-0 border-l-0"
      )}>
        {chatOpen && (
          <>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-primary" />
                </div>
                <span className="text-xs font-semibold text-foreground">AI Assistant</span>
              </div>
              <button onClick={() => setChatOpen(false)} className="w-6 h-6 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <MiniChat className="flex-1 border-0 rounded-none shadow-none bg-card min-h-0" />
          </>
        )}
      </div>

      {/* Toggle button — fixed bottom right */}
      {!chatOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 group">
          <span className="text-xs font-medium text-muted-foreground bg-card/95 backdrop-blur px-2.5 py-1 rounded-lg border border-border/50 shadow-card opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Try AI Assistant
          </span>
          <button
            onClick={() => setChatOpen(true)}
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-card-hover flex items-center justify-center transition-all duration-200 hover:scale-105 hover:bg-primary/90 active:scale-100 btn-cta-glow"
            aria-label="Open AI Assistant"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
