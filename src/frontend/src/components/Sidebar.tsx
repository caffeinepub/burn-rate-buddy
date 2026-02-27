import { cn } from "@/lib/utils";
import { Flame, LayoutDashboard, ListOrdered, Settings } from "lucide-react";
import type { Page } from "../App";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  hasBanner?: boolean;
}

const navItems: {
  id: Page;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "expenses", label: "Expenses", icon: ListOrdered },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({
  currentPage,
  onNavigate,
  hasBanner,
}: SidebarProps) {
  return (
    <aside
      className="flex flex-col w-52 bg-sidebar border-r border-sidebar-border shrink-0"
      style={{ paddingTop: hasBanner ? "2rem" : 0 }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="font-display text-sm font-semibold text-sidebar-foreground tracking-tight">
            Burn Rate Buddy
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all",
                isActive
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  isActive ? "text-primary" : "text-current",
                )}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-sidebar-border">
        <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors"
          >
            Built with caffeine.ai
          </a>
        </p>
      </div>
    </aside>
  );
}
