/**
 * Financial literacy: one-sentence definitions for tooltips in chat.
 * Keys are matched case-insensitively in assistant text.
 */
export const GLOSSARY: Record<string, string> = {
  "SIP": "Systematic Investment Plan: invest a fixed amount regularly (e.g. monthly) in a mutual fund to average out market ups and downs.",
  "P/E ratio": "Price-to-Earnings ratio: how much you pay per rupee of a company's annual profit. Lower can mean cheaper or troubled; higher can mean growth expected.",
  "P/E": "Price-to-Earnings ratio: how much you pay per rupee of a company's annual profit.",
  "Bull market": "A phase when stock prices are rising and investors are optimistic.",
  "Bear market": "A phase when stock prices are falling and sentiment is negative.",
  "Nifty 50": "India's benchmark index of 50 large companies on the NSE. Reflects overall market mood.",
  "Sensex": "India's benchmark index of 30 large companies on the BSE.",
  "52-week high": "The highest price a stock touched in the last year. Helps gauge current level vs history.",
  "52-week low": "The lowest price a stock touched in the last year.",
  "Mutual fund": "A fund that pools money from many investors and invests in stocks, bonds, or both. Managed by professionals.",
  "Index fund": "A mutual fund that simply tracks an index (e.g. Nifty 50) with low fees.",
  "Diversification": "Spreading your money across different assets so one bad pick doesn't hurt your whole portfolio.",
  "Volatility": "How much a price moves up and down. High volatility means bigger swings.",
  "Dividend": "A share of a company's profit paid to shareholders in cash or more shares.",
  "Market cap": "Total value of a company's shares (price × number of shares). Large cap = big, stable; small cap = smaller, riskier.",
  "NSE": "National Stock Exchange of India, where most equity trading happens.",
  "BSE": "Bombay Stock Exchange, India's oldest stock exchange.",
  "FD": "Fixed Deposit: you lock money with a bank for a period and get a fixed interest rate. Very safe, low return.",
};

/** Ordered by length (longest first) so we match phrases before single words */
const GLOSSARY_KEYS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);

export function getGlossaryRegex(): RegExp {
  const escaped = GLOSSARY_KEYS.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  return new RegExp(`\\b(${escaped})\\b`, "gi");
}

export function getGlossaryDefinition(term: string): string | undefined {
  const lower = term.toLowerCase();
  for (const key of GLOSSARY_KEYS) {
    if (key.toLowerCase() === lower) return GLOSSARY[key];
  }
  return undefined;
}
