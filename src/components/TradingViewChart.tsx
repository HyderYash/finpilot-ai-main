import { useEffect, useRef, useState } from "react";
import { createChart, AreaSeries, LineSeries, CandlestickSeries, type IChartApi } from "lightweight-charts";
import { StockData } from "@/data/stocks";
import { BarChart3, TrendingUp, CandlestickChart, Grid3X3, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { OHLCPoint } from "@/lib/yahooFinance";

type ChartType = "area" | "line" | "candlestick";

interface TradingViewChartProps {
  stock: StockData;
  /** When provided, use real OHLC from Yahoo Finance instead of generated from priceHistory */
  ohlcData?: OHLCPoint[];
  standalone?: boolean;
}

function generateOHLC(priceHistory: { time: string; price: number }[]) {
  return priceHistory.map((point, i) => {
    const base = point.price;
    const volatility = base * 0.015;
    const open = i === 0 ? base * 0.998 : priceHistory[i - 1].price;
    const close = base;
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;
    const date = new Date(2025, i, 1);
    return {
      time: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01` as string,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      value: close,
    };
  });
}

export function TradingViewChart({ stock, ohlcData: externalOhlc, standalone = false }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [showGrid, setShowGrid] = useState(true);
  const [showCrosshair, setShowCrosshair] = useState(true);
  const isPositive = stock.change >= 0;
  const ohlcData = externalOhlc?.length ? externalOhlc : generateOHLC(stock.priceHistory);

  useEffect(() => {
    if (!containerRef.current) return;

    const gridColor = showGrid ? "hsl(225, 14%, 16%)" : "transparent";

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "hsl(220, 9%, 55%)",
        fontFamily: "'Inter', -apple-system, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: showCrosshair
        ? {
            vertLine: { color: "hsl(217, 91%, 60%)", width: 1, style: 2, labelBackgroundColor: "hsl(217, 91%, 60%)" },
            horzLine: { color: "hsl(217, 91%, 60%)", width: 1, style: 2, labelBackgroundColor: "hsl(217, 91%, 60%)" },
          }
        : {
            vertLine: { visible: false, labelVisible: false },
            horzLine: { visible: false, labelVisible: false },
          },
      rightPriceScale: { borderColor: "hsl(225, 14%, 18%)" },
      timeScale: { borderColor: "hsl(225, 14%, 18%)", timeVisible: false },
      handleScale: { axisPressedMouseMove: true },
      handleScroll: { vertTouchDrag: false },
    });

    chartRef.current = chart;

    const lineColor = isPositive ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)";
    const priceFormat = { type: "custom" as const, formatter: (price: number) => `₹${price.toFixed(2)}` };

    if (chartType === "candlestick") {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: "hsl(142, 71%, 45%)",
        downColor: "hsl(0, 84%, 60%)",
        borderUpColor: "hsl(142, 71%, 45%)",
        borderDownColor: "hsl(0, 84%, 60%)",
        wickUpColor: "hsl(142, 71%, 45%)",
        wickDownColor: "hsl(0, 84%, 60%)",
        priceFormat,
      });
      series.setData(ohlcData.map(({ time, open, high, low, close }) => ({ time, open, high, low, close })));
    } else if (chartType === "line") {
      const series = chart.addSeries(LineSeries, {
        color: lineColor,
        lineWidth: 2,
        priceFormat,
      });
      series.setData(ohlcData.map(({ time, value }) => ({ time, value })));
    } else {
      const topColor = isPositive ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)";
      const bottomColor = isPositive ? "rgba(34, 197, 94, 0)" : "rgba(239, 68, 68, 0)";
      const series = chart.addSeries(AreaSeries, {
        lineColor,
        topColor,
        bottomColor,
        lineWidth: 2,
        priceFormat,
      });
      series.setData(ohlcData.map(({ time, value }) => ({ time, value })));
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.remove();
    };
  }, [stock, isPositive, chartType, showGrid, showCrosshair, ohlcData]);

  const toolbar = (
    <div className="flex items-center gap-3 flex-wrap">
      <ToggleGroup type="single" value={chartType} onValueChange={(v) => v && setChartType(v as ChartType)} size="sm" className="bg-muted/50 rounded-lg p-0.5">
        <ToggleGroupItem value="candlestick" aria-label="Candlestick chart" className="data-[state=on]:bg-primary/15 data-[state=on]:text-primary rounded-md px-2.5 py-1.5 text-xs gap-1.5">
          <CandlestickChart className="w-3.5 h-3.5" /> Candles
        </ToggleGroupItem>
        <ToggleGroupItem value="area" aria-label="Area chart" className="data-[state=on]:bg-primary/15 data-[state=on]:text-primary rounded-md px-2.5 py-1.5 text-xs gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" /> Area
        </ToggleGroupItem>
        <ToggleGroupItem value="line" aria-label="Line chart" className="data-[state=on]:bg-primary/15 data-[state=on]:text-primary rounded-md px-2.5 py-1.5 text-xs gap-1.5">
          <BarChart3 className="w-3.5 h-3.5" /> Line
        </ToggleGroupItem>
      </ToggleGroup>

      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={cn("p-1.5 rounded-md text-xs transition-colors", showGrid ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground")}
          title="Toggle grid"
        >
          <Grid3X3 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setShowCrosshair(!showCrosshair)}
          className={cn("p-1.5 rounded-md text-xs transition-colors", showCrosshair ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground")}
          title="Toggle crosshair"
        >
          {showCrosshair ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );

  const chartEl = <div ref={containerRef} className="h-72 w-full" />;

  if (!standalone) {
    return (
      <div className="space-y-3">
        {toolbar}
        {chartEl}
      </div>
    );
  }

  return (
    <div className="card-glass p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Price Chart</h3>
      </div>
      {toolbar}
      <div className="mt-3">
        <div ref={containerRef} className="h-[380px] w-full" />
      </div>
    </div>
  );
}
