import { cn } from "@/lib/utils";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";

interface RiskBadgeProps {
  level: "Low" | "Medium" | "High";
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const config = {
    Low: { icon: ShieldCheck, bg: "bg-gain-subtle", text: "text-gain", label: "Low Risk" },
    Medium: { icon: Shield, bg: "bg-[hsl(var(--warning)/0.1)]", text: "text-[hsl(var(--warning-foreground))]", label: "Medium Risk" },
    High: { icon: ShieldAlert, bg: "bg-loss-subtle", text: "text-loss", label: "High Risk" },
  };

  const { icon: Icon, bg, text, label } = config[level];

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", bg, text, className)}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
