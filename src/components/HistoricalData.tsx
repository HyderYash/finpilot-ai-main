import { History } from "lucide-react";
import { stocksData } from "@/data/stocks";
import { cn } from "@/lib/utils";

export function HistoricalData() {
  return (
    <div className="card-glass animate-fade-in">
      <div className="px-5 py-3.5 border-b border-border/60 flex items-center gap-2">
        <History className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-foreground">Historical Performance</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/40">
              <th className="text-left px-5 py-2.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Stock</th>
              <th className="text-right px-3 py-2.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Price</th>
              <th className="text-right px-3 py-2.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Change</th>
              <th className="text-right px-3 py-2.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">52W High</th>
              <th className="text-right px-3 py-2.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">52W Low</th>
              <th className="text-right px-5 py-2.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {stocksData.map((stock) => {
              const isPositive = stock.change >= 0;
              return (
                <tr key={stock.symbol} className="hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-2.5">
                    <span className="font-medium text-foreground">{stock.shortName}</span>
                  </td>
                  <td className="text-right px-3 py-2.5 tabular-nums text-foreground">₹{stock.price.toLocaleString('en-IN')}</td>
                  <td className={cn("text-right px-3 py-2.5 tabular-nums font-medium", isPositive ? "text-gain" : "text-loss")}>
                    {isPositive ? "+" : ""}{stock.changePercent.toFixed(2)}%
                  </td>
                  <td className="text-right px-3 py-2.5 tabular-nums text-muted-foreground">₹{stock.high52.toLocaleString('en-IN')}</td>
                  <td className="text-right px-3 py-2.5 tabular-nums text-muted-foreground">₹{stock.low52.toLocaleString('en-IN')}</td>
                  <td className="text-right px-5 py-2.5 tabular-nums text-muted-foreground">{(stock.volume / 1000000).toFixed(1)}M</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
