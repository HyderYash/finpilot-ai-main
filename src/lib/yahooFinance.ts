/**
 * Yahoo Finance Chart API v8
 * @see https://query1.finance.yahoo.com/v8/finance/chart/{symbol}
 */

export type YahooChartRange = "1d" | "5d" | "1mo" | "3mo" | "6mo" | "1y" | "2y" | "5y" | "10y" | "ytd" | "max";

export interface YahooChartMeta {
  currency: string;
  symbol: string;
  exchangeName: string;
  fullExchangeName: string;
  instrumentType: string;
  regularMarketPrice: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  longName: string;
  shortName: string;
  chartPreviousClose: number;
  previousClose: number;
  dataGranularity: string;
  range: string;
  validRanges: YahooChartRange[];
}

export interface YahooChartQuote {
  open: (number | null)[];
  high: (number | null)[];
  low: (number | null)[];
  close: (number | null)[];
  volume: number[];
}

export interface YahooChartResult {
  meta: YahooChartMeta;
  timestamp: number[];
  indicators: {
    quote: YahooChartQuote[];
  };
}

export interface YahooChartResponse {
  chart: {
    result: YahooChartResult[] | null;
    error: { message: string; description: string } | null;
  };
}

const CHART_BASE =
  import.meta.env.DEV
    ? "/api/yahoo/v8/finance/chart"
    : (import.meta.env.VITE_YAHOO_CHART_PROXY as string) ||
      "https://query1.finance.yahoo.com/v8/finance/chart";

function getIntervalForRange(range: YahooChartRange): string {
  if (range === "1d" || range === "5d") return "1m";
  return "1d";
}

export async function fetchYahooChart(
  symbol: string,
  range: YahooChartRange = "1d"
): Promise<YahooChartResponse> {
  const interval = getIntervalForRange(range);
  const url = `${CHART_BASE}/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Yahoo Chart API error: ${res.status}`);
  const data: YahooChartResponse = await res.json();
  if (data.chart?.error) {
    throw new Error(data.chart.error.message || "Chart API error");
  }
  return data;
}

/** Recharts / StockChart: { time, price }[] */
export interface PriceHistoryPoint {
  time: string;
  price: number;
}

/** lightweight-charts: OHLC with time as Unix seconds */
export interface OHLCPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  value: number;
}

function formatTimeForRecharts(ts: number, granularity: string): string {
  const d = new Date(ts * 1000);
  if (granularity === "1m" || granularity === "2m" || granularity === "5m" || granularity === "15m" || granularity === "30m" || granularity === "1h") {
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: d.getFullYear() !== new Date().getFullYear() ? "2-digit" : undefined });
}

export function transformChartToPriceHistory(result: YahooChartResult): PriceHistoryPoint[] {
  const quote = result.indicators?.quote?.[0];
  if (!quote || !result.timestamp?.length) return [];
  const granularity = result.meta?.dataGranularity ?? "1d";
  return result.timestamp
    .map((ts, i) => {
      const close = quote.close?.[i];
      if (close == null) return null;
      return {
        time: formatTimeForRecharts(ts, granularity),
        price: Math.round(close * 100) / 100,
      };
    })
    .filter((p): p is PriceHistoryPoint => p !== null);
}

/** lightweight-charts accepts time as Unix seconds (number) for intraday */
export function transformChartToOHLC(result: YahooChartResult): OHLCPoint[] {
  const quote = result.indicators?.quote?.[0];
  if (!quote || !result.timestamp?.length) return [];
  return result.timestamp
    .map((ts, i) => {
      const o = quote.open?.[i];
      const h = quote.high?.[i];
      const l = quote.low?.[i];
      const c = quote.close?.[i];
      if (o == null || h == null || l == null || c == null) return null;
      return {
        time: ts,
        open: Math.round(o * 100) / 100,
        high: Math.round(h * 100) / 100,
        low: Math.round(l * 100) / 100,
        close: Math.round(c * 100) / 100,
        value: Math.round(c * 100) / 100,
      };
    })
    .filter((p): p is OHLCPoint => p !== null);
}

/** Partial stock fields we can fill from chart meta (for display enrichment) */
export function transformMetaToStockFields(meta: YahooChartMeta): {
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  high52: number;
  low52: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  longName: string;
  shortName: string;
} {
  const price = meta.regularMarketPrice;
  const prev = meta.previousClose ?? meta.chartPreviousClose ?? price;
  const change = price - prev;
  const changePercent = prev ? (change / prev) * 100 : 0;
  return {
    price,
    previousClose: prev,
    change,
    changePercent,
    high52: meta.fiftyTwoWeekHigh,
    low52: meta.fiftyTwoWeekLow,
    dayHigh: meta.regularMarketDayHigh,
    dayLow: meta.regularMarketDayLow,
    volume: meta.regularMarketVolume,
    longName: meta.longName,
    shortName: meta.shortName,
  };
}
