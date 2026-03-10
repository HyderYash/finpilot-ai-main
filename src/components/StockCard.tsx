import { TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StockData } from "@/data/stocks";
import { RiskBadge } from "@/components/RiskBadge";
import { cn } from "@/lib/utils";

interface StockCardProps {
  stock: StockData;
}

export function StockCard({ stock }: StockCardProps) {
  const navigate = useNavigate();
  const isPositive = stock.change >= 0;

  return (
    <button
      onClick={() => navigate(`/analysis/${stock.symbol}`)}
      className="card-glass-hover p-5 text-left w-full animate-fade-in"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{stock.shortName}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{stock.symbol.replace('.NS', '')}</p>
        </div>
        <RiskBadge level={stock.riskLevel} />
      </div>

      <div className="flex items-end justify-between mb-4">
        <span className="text-2xl font-semibold tracking-tight text-foreground">
          ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
        <div className={cn("flex items-center gap-1 text-sm font-medium", isPositive ? "text-gain" : "text-loss")}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">52W High</p>
          <p className="text-xs font-medium text-foreground mt-0.5">₹{stock.high52.toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">52W Low</p>
          <p className="text-xs font-medium text-foreground mt-0.5">₹{stock.low52.toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Volume</p>
          <p className="text-xs font-medium text-foreground mt-0.5">{(stock.volume / 1000000).toFixed(1)}M</p>
        </div>
      </div>
    </button>
  );
}
