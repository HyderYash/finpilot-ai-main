import { TrendingUp, TrendingDown } from "lucide-react";
import { stocksData } from "@/data/stocks";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export function StockTicker() {
  const navigate = useNavigate();

  // Triple the items for seamless loop
  const items = [...stocksData, ...stocksData, ...stocksData];

  return (
    <div className="h-10 bg-card border-b border-border/50 flex items-center overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/40 to-primary/10 z-10" aria-hidden />
      <span className="flex items-center gap-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-primary/90 shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" aria-hidden /> Live
      </span>
      <div className="flex items-center animate-scroll whitespace-nowrap">
        {items.map((stock, i) => {
          const isPositive = stock.change >= 0;
          return (
            <button
              key={`${stock.symbol}-${i}`}
              onClick={() => navigate(`/analysis/${stock.symbol}`)}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity flex-shrink-0 px-4"
            >
              <span className="text-xs font-semibold text-foreground">{stock.shortName}</span>
              <span className="text-xs tabular-nums text-foreground/80">₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              <span className={cn("flex items-center gap-0.5 text-[11px] font-medium", isPositive ? "text-gain" : "text-loss")}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
