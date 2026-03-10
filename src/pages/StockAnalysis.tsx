import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Sparkles, Loader2, MessageCircle } from "lucide-react";
import { getStockBySymbol, generateAIExplanation, stocksData } from "@/data/stocks";
import { useYahooChartData } from "@/hooks/useYahooChart";
import { TradingViewChart } from "@/components/TradingViewChart";
import { RiskBadge } from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { YahooChartRange } from "@/lib/yahooFinance";

const RANGES: { value: YahooChartRange; label: string }[] = [
  { value: "1d", label: "1D" },
  { value: "5d", label: "5D" },
  { value: "1mo", label: "1M" },
  { value: "3mo", label: "3M" },
  { value: "1y", label: "1Y" },
];

const StockAnalysis = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const stock = symbol ? getStockBySymbol(symbol) : stocksData[0];
  const [range, setRange] = useState<YahooChartRange>("1d");
  const { ohlc, meta, loading, error } = useYahooChartData(stock?.symbol, range);

  if (!stock) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Stock not found</p>
        <Button variant="ghost" onClick={() => navigate("/")} className="mt-4">Go back</Button>
      </div>
    );
  }

  const isPositive = (meta ?? stock).change >= 0;
  const displayStock = meta
    ? { ...stock!, ...meta, name: meta.longName, shortName: meta.shortName }
    : stock!;
  const explanation = generateAIExplanation(displayStock);

  const metrics = [
    { label: "Previous Close", value: `₹${displayStock.previousClose.toLocaleString('en-IN')}` },
    { label: "Day High", value: `₹${displayStock.dayHigh.toLocaleString('en-IN')}` },
    { label: "Day Low", value: `₹${displayStock.dayLow.toLocaleString('en-IN')}` },
    { label: "52W High", value: `₹${displayStock.high52.toLocaleString('en-IN')}` },
    { label: "52W Low", value: `₹${displayStock.low52.toLocaleString('en-IN')}` },
    { label: "Volume", value: `${(displayStock.volume / 1000000).toFixed(2)}M` },
    { label: "Market Cap", value: displayStock.marketCap },
    { label: "P/E Ratio", value: displayStock.pe.toFixed(1) },
  ];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{displayStock.name}</h1>
            <RiskBadge level={displayStock.riskLevel} />
          </div>
          <p className="text-sm text-muted-foreground">{displayStock.sector} · {displayStock.symbol.replace('.NS', '')}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
            ₹{displayStock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
          <div className={cn("flex items-center justify-end gap-1 text-sm font-medium mt-1", isPositive ? "text-gain" : "text-loss")}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{isPositive ? "+" : ""}₹{displayStock.change.toFixed(2)} ({isPositive ? "+" : ""}{displayStock.changePercent.toFixed(2)}%)</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Time range</span>
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/50 border border-border/50">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors tabular-nums",
                  range === r.value
                    ? "bg-background text-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        {error && (
          <p className="text-sm text-destructive">Could not load chart data. Using sample data.</p>
        )}
        {loading ? (
          <div className="card-glass p-6 flex items-center justify-center h-[360px] rounded-xl border border-border/50">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <TradingViewChart stock={displayStock} ohlcData={ohlc.length ? ohlc : undefined} standalone />
        )}
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="card-glass p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</p>
            <p className="text-sm font-semibold text-foreground mt-1">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="card-glass p-6 animate-fade-in">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">AI Analysis</h2>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground mb-4">{explanation}</p>
        <Button
          variant="secondary"
          size="sm"
          className="text-primary hover:bg-primary/10"
          onClick={() =>
            navigate("/chat", {
              state: {
                currentContext: {
                  symbol: displayStock.symbol,
                  name: displayStock.name,
                  shortName: displayStock.shortName,
                  price: displayStock.price,
                  changePercent: displayStock.changePercent,
                  sector: displayStock.sector,
                  high52: displayStock.high52,
                  low52: displayStock.low52,
                },
              },
            })
          }
        >
          <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
          Discuss with FinPilot
        </Button>
      </div>
    </div>
  );
};

export default StockAnalysis;
