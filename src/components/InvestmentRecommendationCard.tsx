import { RiskBadge } from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TrendingUp, Share2, Heart } from "lucide-react";
import { toast } from "sonner";

export type RecommendationRiskLevel = "Low" | "Medium" | "High";
export type RecommendationAssetType = "Stock" | "Mutual Fund" | "SIP" | "FD";

/** Beginner-friendly benchmark: Low = 1, Medium = 2, High = 3. Score 1–3 = beginner friendly. */
function getRiskScore(riskLevel: RecommendationRiskLevel): { score: number; label: string } {
  const map: Record<RecommendationRiskLevel, { score: number; label: string }> = {
    Low: { score: 1, label: "Beginner-friendly" },
    Medium: { score: 2, label: "Moderate — review before investing" },
    High: { score: 3, label: "Higher risk — suited to experienced investors" },
  };
  return map[riskLevel];
}

interface InvestmentRecommendationCardProps {
  assetName: string;
  assetType: RecommendationAssetType;
  riskLevel: RecommendationRiskLevel;
  thesis: string;
  className?: string;
  compact?: boolean;
  /** Last user question — shown in "Why this fits you" for personalisation */
  lastUserQuestion?: string;
}

export function InvestmentRecommendationCard({
  assetName,
  assetType,
  riskLevel,
  thesis,
  className,
  compact = false,
  lastUserQuestion,
}: InvestmentRecommendationCardProps) {
  const riskScore = getRiskScore(riskLevel);
  const handleExplore = () => {
    if (assetType === "Stock" && assetName.includes(".NS")) {
      window.location.href = `/analysis/${assetName.trim()}`;
    } else {
      // For MF/SIP/FD could open a search or external link
      window.open(`https://www.google.com/search?q=${encodeURIComponent(assetName + " India invest")}`, "_blank");
    }
  };

  const handleShareInsight = async () => {
    const text = `FinPilot AI recommended: ${assetName} (${assetType})\nRisk: ${riskLevel} — ${riskScore.label}\n\nWhy: ${thesis}\n\n— Shared from FinPilot AI (Innovyuh 2.0)`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        toast.success("Copied to clipboard");
      } catch {
        toast.error("Could not copy");
      }
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card text-card-foreground overflow-hidden shadow-card",
        compact ? "p-3" : "p-4",
        className
      )}
    >
      <div className={cn("flex items-start justify-between gap-2", compact ? "mb-2" : "mb-3")}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className={cn("font-semibold text-foreground truncate", compact ? "text-xs" : "text-sm")}>
              {assetName}
            </p>
            <p className={cn("text-muted-foreground", compact ? "text-[10px]" : "text-xs")}>{assetType}</p>
          </div>
        </div>
        <RiskBadge level={riskLevel} className="flex-shrink-0" />
      </div>
      {/* Risk score vs beginner benchmark — Innovyuh 2.0 impact metric */}
      <div className={cn("flex items-center gap-2 mb-2", compact ? "text-[10px]" : "text-xs")}>
        <span className="text-muted-foreground">Risk score:</span>
        <span className="font-medium text-foreground">
          {riskScore.score}/3 — {riskScore.label}
        </span>
      </div>
      <p className={cn("text-muted-foreground leading-relaxed mb-2", compact ? "text-[11px]" : "text-xs")}>
        {thesis}
      </p>
      {lastUserQuestion && (
        <div className={cn("rounded-lg bg-primary/5 border border-primary/20 p-2 mb-3", compact ? "p-1.5" : "p-2")}>
          <div className="flex items-center gap-1.5 mb-1">
            <Heart className="w-3 h-3 text-primary" />
            <span className={cn("font-medium text-primary", compact ? "text-[10px]" : "text-xs")}>
              Why this fits you
            </span>
          </div>
          <p className={cn("text-muted-foreground italic", compact ? "text-[10px]" : "text-xs")}>
            Based on your question: &ldquo;{lastUserQuestion.length > 60 ? lastUserQuestion.slice(0, 60) + "…" : lastUserQuestion}&rdquo;
          </p>
        </div>
      )}
<div className={cn("flex flex-wrap gap-2", compact ? "flex-col" : "flex-row")}>
        <Button
          variant="secondary"
          size={compact ? "sm" : "default"}
          className={cn("text-primary hover:bg-primary/10", !compact && "flex-1")}
          onClick={handleExplore}
        >
          Explore {assetType}
        </Button>
        {!compact && (
          <Button
            variant="default"
            size="default"
            className="flex-1 bg-primary/90 hover:bg-primary"
            onClick={() => window.open("https://groww.in", "_blank")}
            title="Open partner platform to invest"
          >
            Invest via Groww
          </Button>
        )}
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          className={cn("border-border/60", compact ? "" : "flex-1")}
          onClick={handleShareInsight}
          title="Copy advice to clipboard"
        >
          <Share2 className={cn("text-muted-foreground", compact ? "w-3 h-3" : "w-4 h-4")} />
          {!compact && <span className="ml-1.5">Share Insight</span>}
        </Button>
      </div>
    </div>
  );
}
