import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { StockData } from "@/data/stocks";
import type { PriceHistoryPoint } from "@/lib/yahooFinance";

interface StockChartProps {
  stock: StockData;
  /** When provided, use this instead of stock.priceHistory (e.g. from Yahoo Finance) */
  priceHistory?: PriceHistoryPoint[];
  standalone?: boolean;
}

export function StockChart({ stock, priceHistory: externalHistory, standalone = false }: StockChartProps) {
  const isPositive = stock.change >= 0;
  const data = (externalHistory?.length ? externalHistory : stock.priceHistory) as { time: string; price: number }[];
  const color = isPositive ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)";

  const chart = (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 14%, 18%)" vertical={false} />
          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "hsl(220, 9%, 55%)", fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(220, 9%, 55%)", fontSize: 11 }} domain={["auto", "auto"]} tickFormatter={(v) => `₹${v}`} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(228, 14%, 11%)",
              border: "1px solid hsl(225, 14%, 18%)",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              fontSize: "12px",
              color: "hsl(210, 20%, 95%)",
            }}
            formatter={(value: number) => [`₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, "Price"]}
          />
          <Area type="monotone" dataKey="price" stroke={color} strokeWidth={2} fill={`url(#gradient-${stock.symbol})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  if (!standalone) return chart;

  return (
    <div className="card-glass p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">Price History (12 Months)</h3>
      {chart}
    </div>
  );
}
