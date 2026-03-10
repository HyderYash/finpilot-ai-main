import { Sparkles, LayoutDashboard, TrendingUp, MessageCircle } from "lucide-react";
import { NavLink } from "@/components/NavLink";

export function TopNav() {
  return (
    <nav className="h-14 border-b border-border/50 bg-card/90 backdrop-blur-xl sticky top-0 z-50 flex items-center px-6 gap-8 shadow-card">
      <div className="flex items-center gap-3 mr-4">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="text-base font-semibold tracking-tight text-foreground">FinPilot AI</span>
        <span className="badge-event text-[10px] font-semibold px-2 py-0.5 rounded-full text-primary tracking-wide hidden sm:inline-flex">
          Innovyuh 2.0
        </span>
      </div>

      <div className="flex items-center gap-1">
        {[
          { to: "/", label: "Dashboard", icon: LayoutDashboard },
          { to: "/analysis", label: "Analysis", icon: TrendingUp },
          { to: "/chat", label: "AI Assistant", icon: MessageCircle },
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
            activeClassName="bg-accent text-foreground font-medium shadow-sm"
          >
            <item.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
