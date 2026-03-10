import { Sparkles, Lightbulb } from "lucide-react";
import { generateMarketSummary, generateDailyInsight } from "@/data/stocks";

export function MarketSummary() {
  const summary = generateMarketSummary();
  const insight = generateDailyInsight();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="card-glass p-6 animate-fade-in border-l-4 border-l-primary/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center ring-1 ring-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">AI Market Summary</h2>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
      </div>

      <div className="card-glass p-6 animate-fade-in border-l-4 border-l-[hsl(var(--warning)/0.6)]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-[hsl(var(--warning)/0.1)] flex items-center justify-center ring-1 ring-[hsl(var(--warning)/0.2)]">
            <Lightbulb className="w-4 h-4 text-[hsl(var(--warning-foreground))]" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Today's Market Insight</h2>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{insight}</p>
      </div>
    </div>
  );
}
