import { useQuery } from "@tanstack/react-query";
import {
  fetchYahooChart,
  transformChartToPriceHistory,
  transformChartToOHLC,
  transformMetaToStockFields,
  type YahooChartRange,
  type PriceHistoryPoint,
  type OHLCPoint,
} from "@/lib/yahooFinance";

export interface YahooChartData {
  priceHistory: PriceHistoryPoint[];
  ohlc: OHLCPoint[];
  meta: ReturnType<typeof transformMetaToStockFields> | null;
}

export function useYahooChartData(symbol: string | undefined, range: YahooChartRange = "1d") {
  const query = useQuery({
    queryKey: ["yahoo-chart", symbol, range],
    queryFn: async (): Promise<YahooChartData> => {
      if (!symbol) throw new Error("No symbol");
      const res = await fetchYahooChart(symbol, range);
      const result = res.chart?.result?.[0];
      if (!result) throw new Error("No chart data");
      return {
        priceHistory: transformChartToPriceHistory(result),
        ohlc: transformChartToOHLC(result),
        meta: result.meta ? transformMetaToStockFields(result.meta) : null,
      };
    },
    enabled: !!symbol,
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    priceHistory: query.data?.priceHistory ?? [],
    ohlc: query.data?.ohlc ?? [],
    meta: query.data?.meta ?? null,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
