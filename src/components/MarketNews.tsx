import { Newspaper } from "lucide-react";

const newsItems = [
  {
    title: "Reliance Q3 results beat expectations, stock rallies",
    time: "2 hours ago",
    summary: "Reliance Industries reported a 12% YoY increase in net profit, driven by strong performance in retail and digital services segments.",
  },
  {
    title: "IT sector outlook positive amid global AI spending boom",
    time: "4 hours ago",
    summary: "Analysts expect TCS and Infosys to benefit from increased enterprise AI adoption, with deal pipelines showing strong momentum.",
  },
  {
    title: "HDFC Bank maintains steady growth trajectory",
    time: "5 hours ago",
    summary: "HDFC Bank's asset quality remains robust with NPA levels at historic lows. Credit growth continues to outpace industry averages.",
  },
  {
    title: "ICICI Bank expands digital banking footprint",
    time: "6 hours ago",
    summary: "ICICI Bank launched new digital lending products targeting MSMEs, expected to drive loan growth in coming quarters.",
  },
];

export function MarketNews() {
  return (
    <div className="card-glass animate-fade-in">
      <div className="px-5 py-3.5 border-b border-border/60 flex items-center gap-2">
        <Newspaper className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-foreground">Market News</span>
      </div>
      <div className="divide-y divide-border/40">
        {newsItems.map((item, i) => (
          <div key={i} className="px-5 py-3.5 hover:bg-accent/30 transition-colors cursor-pointer">
            <div className="flex items-start justify-between gap-3">
              <h4 className="text-sm font-medium text-foreground leading-snug">{item.title}</h4>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">{item.time}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{item.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
