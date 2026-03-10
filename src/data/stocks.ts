export interface StockData {
  symbol: string;
  name: string;
  shortName: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  high52: number;
  low52: number;
  volume: number;
  dayHigh: number;
  dayLow: number;
  marketCap: string;
  pe: number;
  sector: string;
  riskLevel: "Low" | "Medium" | "High";
  priceHistory: { time: string; price: number }[];
}

function generatePriceHistory(basePrice: number, volatility: number): { time: string; price: number }[] {
  const points: { time: string; price: number }[] = [];
  let price = basePrice * 0.92;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  for (let i = 0; i < 12; i++) {
    price += (Math.random() - 0.4) * volatility * basePrice * 0.01;
    price = Math.max(price, basePrice * 0.8);
    points.push({ time: months[i], price: Math.round(price * 100) / 100 });
  }
  return points;
}

function calculateRisk(price: number, high52: number, low52: number): "Low" | "Medium" | "High" {
  const range = high52 - low52;
  const volatilityRatio = range / price;
  if (volatilityRatio < 0.25) return "Low";
  if (volatilityRatio < 0.45) return "Medium";
  return "High";
}

export const stocksData: StockData[] = [
  {
    symbol: "RELIANCE.NS",
    name: "Reliance Industries Limited",
    shortName: "Reliance",
    price: 2934.50,
    previousClose: 2918.75,
    change: 15.75,
    changePercent: 0.54,
    high52: 3217.60,
    low52: 2220.30,
    volume: 8945230,
    dayHigh: 2948.00,
    dayLow: 2910.15,
    marketCap: "₹19.8L Cr",
    pe: 28.4,
    sector: "Energy & Conglomerate",
    riskLevel: "Medium",
    priceHistory: generatePriceHistory(2934.50, 3),
  },
  {
    symbol: "TCS.NS",
    name: "Tata Consultancy Services",
    shortName: "TCS",
    price: 3856.20,
    previousClose: 3872.10,
    change: -15.90,
    changePercent: -0.41,
    high52: 4243.85,
    low52: 3311.00,
    volume: 2134560,
    dayHigh: 3880.00,
    dayLow: 3842.50,
    marketCap: "₹14.1L Cr",
    pe: 32.1,
    sector: "IT Services",
    riskLevel: "Low",
    priceHistory: generatePriceHistory(3856.20, 2),
  },
  {
    symbol: "INFY.NS",
    name: "Infosys Limited",
    shortName: "Infosys",
    price: 1587.35,
    previousClose: 1572.90,
    change: 14.45,
    changePercent: 0.92,
    high52: 1953.90,
    low52: 1358.35,
    volume: 5678900,
    dayHigh: 1595.00,
    dayLow: 1570.00,
    marketCap: "₹6.6L Cr",
    pe: 27.8,
    sector: "IT Services",
    riskLevel: "Medium",
    priceHistory: generatePriceHistory(1587.35, 4),
  },
  {
    symbol: "HDFCBANK.NS",
    name: "HDFC Bank Limited",
    shortName: "HDFC Bank",
    price: 1724.80,
    previousClose: 1731.25,
    change: -6.45,
    changePercent: -0.37,
    high52: 1880.00,
    low52: 1460.00,
    volume: 7234100,
    dayHigh: 1735.00,
    dayLow: 1718.50,
    marketCap: "₹13.1L Cr",
    pe: 19.6,
    sector: "Banking",
    riskLevel: "Low",
    priceHistory: generatePriceHistory(1724.80, 2.5),
  },
  {
    symbol: "ICICIBANK.NS",
    name: "ICICI Bank Limited",
    shortName: "ICICI Bank",
    price: 1245.60,
    previousClose: 1238.90,
    change: 6.70,
    changePercent: 0.54,
    high52: 1362.35,
    low52: 970.05,
    volume: 6123450,
    dayHigh: 1252.00,
    dayLow: 1235.00,
    marketCap: "₹8.7L Cr",
    pe: 18.2,
    sector: "Banking",
    riskLevel: "Medium",
    priceHistory: generatePriceHistory(1245.60, 3),
  },
];

export function getStockBySymbol(symbol: string): StockData | undefined {
  return stocksData.find(s => s.symbol === symbol);
}

export function generateAIExplanation(stock: StockData): string {
  const positionInRange = ((stock.price - stock.low52) / (stock.high52 - stock.low52)) * 100;
  const isUp = stock.change >= 0;
  
  let explanation = "";
  
  if (positionInRange > 75) {
    explanation = `${stock.shortName} is currently trading near its 52-week high of ₹${stock.high52.toLocaleString('en-IN')}, which suggests strong bullish momentum. `;
  } else if (positionInRange > 40) {
    explanation = `${stock.shortName} is trading near the middle of its 52-week range, suggesting relatively stable performance. `;
  } else {
    explanation = `${stock.shortName} is trading closer to its 52-week low of ₹${stock.low52.toLocaleString('en-IN')}, which might represent a buying opportunity for long-term investors. `;
  }

  if (isUp) {
    explanation += `Today, the stock is up ${stock.changePercent.toFixed(2)}%, showing positive investor sentiment. `;
  } else {
    explanation += `Today, the stock is down ${Math.abs(stock.changePercent).toFixed(2)}%, which could indicate some profit-taking or broader market weakness. `;
  }

  if (stock.volume > 5000000) {
    explanation += `Trading volume of ${(stock.volume / 1000000).toFixed(1)}M shares indicates high investor activity today.`;
  } else {
    explanation += `Trading volume is moderate at ${(stock.volume / 1000000).toFixed(1)}M shares.`;
  }

  return explanation;
}

export function generateMarketSummary(): string {
  const gainers = stocksData.filter(s => s.change > 0);
  const losers = stocksData.filter(s => s.change < 0);

  return `Today's Indian market shows a mixed picture. ${gainers.length} out of ${stocksData.length} tracked stocks are in the green, led by ${gainers.sort((a, b) => b.changePercent - a.changePercent)[0]?.shortName || 'N/A'} with a ${gainers[0]?.changePercent.toFixed(2)}% gain. IT stocks are showing moderate growth while banking stocks are experiencing slight volatility. Overall market sentiment leans cautiously optimistic with healthy trading volumes across major indices.`;
}

export function generateDailyInsight(): string {
  return "IT stocks are showing moderate growth while banking stocks are experiencing slight volatility. Reliance continues its upward trend supported by strong quarterly results. Investors should keep an eye on global tech sentiment as it may impact TCS and Infosys in the coming sessions.";
}
