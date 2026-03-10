import { TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StockData } from "@/data/stocks";
import { cn } from "@/lib/utils";

interface StockRowProps {
  stock: StockData;
}

export function StockRow({ stock }: StockRowProps) {
  const navigate = useNavigate();
  const isPositive = stock.change >= 0;

  return (
    <button
      onClick={() => navigate(`/analysis/${stock.symbol}`)}
      className="flex items-center justify-between w-full px-4 py-3 hover:bg-accent/50 transition-colors rounded-lg group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
          {stock.shortName.slice(0, 2).toUpperCase()}
        </div>
        <div className="text-left min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{stock.shortName}</p>
          <p className="text-[10px] text-muted-foreground">{stock.sector}</p>
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-3">
        <p className="text-sm font-semibold text-foreground tabular-nums">₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        <div className={cn("flex items-center justify-end gap-0.5 text-[11px] font-medium", isPositive ? "text-gain" : "text-loss")}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%</span>
        </div>
      </div>
    </button>
  );
}
