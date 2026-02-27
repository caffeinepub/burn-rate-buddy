import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Loader2,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Page } from "../App";
import {
  useAnomalies,
  useBurnRateSummary,
  useClearData,
  useSaveSettings,
  useSeedFakeData,
  useSettings,
  useWeeklySummary,
} from "../hooks/useQueries";
import { categoryLabel, formatCurrency } from "../utils/format";

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

function StatCard({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg p-5 shadow-card",
        className,
      )}
    >
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">
        {label}
      </p>
      {children}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {["a", "b", "c", "d"].map((k) => (
        <div key={k} className="bg-card border border-border rounded-lg p-5">
          <Skeleton className="h-3 w-24 mb-4 bg-muted" />
          <Skeleton className="h-8 w-40 mb-2 bg-muted" />
          <Skeleton className="h-3 w-32 bg-muted" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onNavigate }: { onNavigate: (page: Page) => void }) {
  const { data: settings } = useSettings();
  const seedFakeData = useSeedFakeData();
  const saveSettings = useSaveSettings();
  const [isEnabling, setIsEnabling] = useState(false);

  async function handleEnableDemo() {
    setIsEnabling(true);
    try {
      await seedFakeData.mutateAsync();
      await saveSettings.mutateAsync({
        ...(settings ?? {
          fakeDataMode: false,
          connectedAccount: "",
          fundingAmount: 500000,
          startingBalance: 500000,
        }),
        fakeDataMode: true,
      });
      toast.success("Demo data loaded");
    } catch {
      toast.error("Failed to load demo data");
    } finally {
      setIsEnabling(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
        <Sparkles className="w-6 h-6 text-primary" />
      </div>
      <h2 className="font-display text-xl font-semibold text-foreground mb-2">
        Welcome to Burn Rate Buddy
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm mb-7 leading-relaxed">
        Connect your bank account or try the demo with sample data to see your
        burn rate and runway.
      </p>
      <div className="flex items-center gap-3">
        <Button
          onClick={handleEnableDemo}
          disabled={isEnabling}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isEnabling ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          {isEnabling ? "Loading demo…" : "Enable Demo Mode"}
        </Button>
        <Button
          onClick={() => onNavigate("settings")}
          variant="outline"
          className="gap-2 border-border hover:border-primary/50 hover:text-primary transition-colors"
        >
          Go to Settings
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { data: burnRate, isLoading: burnLoading } = useBurnRateSummary();
  const { data: weekly, isLoading: weeklyLoading } = useWeeklySummary();
  const { data: anomalies, isLoading: anomaliesLoading } = useAnomalies();
  const { data: settings } = useSettings();
  const seedFakeData = useSeedFakeData();
  const saveSettings = useSaveSettings();
  const clearData = useClearData();

  const isLoading = burnLoading || weeklyLoading;

  const isEmpty =
    !isLoading &&
    (!burnRate || burnRate.totalSpent === 0) &&
    !settings?.fakeDataMode;

  const isBusy =
    seedFakeData.isPending || saveSettings.isPending || clearData.isPending;

  async function handleDemoToggle(checked: boolean) {
    if (checked) {
      try {
        await seedFakeData.mutateAsync();
        await saveSettings.mutateAsync({
          ...(settings ?? {
            fakeDataMode: false,
            connectedAccount: "",
            fundingAmount: 500000,
            startingBalance: 500000,
          }),
          fakeDataMode: true,
        });
        toast.success("Demo data loaded");
      } catch {
        toast.error("Failed to load demo data");
      }
    } else {
      try {
        await clearData.mutateAsync();
        await saveSettings.mutateAsync({
          ...(settings ?? {
            fakeDataMode: false,
            connectedAccount: "",
            fundingAmount: 500000,
            startingBalance: 500000,
          }),
          fakeDataMode: false,
        });
        toast.success("Demo data cleared");
      } catch {
        toast.error("Failed to clear demo data");
      }
    }
  }

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your financial health at a glance
          </p>
        </div>
        {/* Demo mode toggle — only show when not in onboarding */}
        {!isEmpty && (
          <div className="flex items-center gap-2 shrink-0 pt-1">
            {isBusy && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground">Demo mode</span>
            <Switch
              checked={settings?.fakeDataMode ?? false}
              onCheckedChange={handleDemoToggle}
              disabled={isBusy}
            />
          </div>
        )}
      </header>

      {isLoading ? (
        <LoadingSkeleton />
      ) : isEmpty ? (
        <EmptyState onNavigate={onNavigate} />
      ) : (
        <div className="space-y-4">
          {/* Top row: Burn Rate + Runway */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Burn Rate */}
            <StatCard label="Monthly Burn Rate">
              <div className="flex items-end gap-2 mb-1">
                <span className="font-display text-3xl font-bold text-foreground tabular">
                  {burnRate ? formatCurrency(burnRate.monthlyBurnRate) : "—"}
                </span>
                <span className="text-muted-foreground text-sm mb-1 font-medium">
                  /mo
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Average over last 3 months
              </p>
              {burnRate && burnRate.totalSpent > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Total spent:{" "}
                  <span className="text-foreground/70">
                    {formatCurrency(burnRate.totalSpent)}
                  </span>
                </p>
              )}
            </StatCard>

            {/* Runway */}
            <StatCard label="Runway">
              <div className="mb-1">
                <span className="font-display text-2xl font-bold text-primary">
                  {burnRate?.runwayText ?? "—"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {burnRate?.runwayMonths != null
                  ? `${burnRate.runwayMonths.toFixed(1)} months remaining`
                  : "Configure funding in Settings"}
              </p>
              <div className="bg-accent/50 border border-border rounded-md px-3 py-2">
                <p className="text-[11px] text-muted-foreground font-mono leading-relaxed">
                  Runway = funding ÷ monthly burn
                </p>
                {settings && (
                  <p className="text-[11px] text-muted-foreground/60 font-mono mt-0.5">
                    = {formatCurrency(settings.fundingAmount)} ÷{" "}
                    {burnRate ? formatCurrency(burnRate.monthlyBurnRate) : "…"}
                  </p>
                )}
              </div>
            </StatCard>
          </div>

          {/* Second row: Weekly Summary + Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weekly Summary */}
            <StatCard label="Weekly Summary">
              {weeklyLoading ? (
                <>
                  <Skeleton className="h-7 w-32 mb-2 bg-muted" />
                  <Skeleton className="h-3 w-48 bg-muted" />
                </>
              ) : weekly ? (
                <>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="font-display text-2xl font-bold text-foreground tabular">
                      {formatCurrency(weekly.totalSpend)}
                    </span>
                    <span className="text-xs text-muted-foreground mb-1">
                      last 7 days
                    </span>
                  </div>
                  {weekly.topCategory && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <CalendarDays className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Top category:{" "}
                        <span className="text-foreground font-medium">
                          {categoryLabel(weekly.topCategory)}
                        </span>
                      </span>
                    </div>
                  )}
                  {weekly.anomalyDetected && (
                    <div className="flex items-center gap-1.5 mt-2 bg-warning-bg border border-warning/20 rounded-md px-2.5 py-1.5">
                      <AlertTriangle className="w-3 h-3 text-warning shrink-0" />
                      <span className="text-xs text-warning/90">
                        {weekly.anomalyDetails || "Unusual spending detected"}
                      </span>
                    </div>
                  )}
                  {!weekly.anomalyDetected && weekly.totalSpend > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-success" />
                      <span className="text-xs text-success/80">
                        Spending looks normal
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No data available
                </p>
              )}
            </StatCard>

            {/* Alerts Panel */}
            <StatCard label="Anomaly Alerts">
              {anomaliesLoading ? (
                <div className="space-y-2">
                  {["x", "y"].map((k) => (
                    <Skeleton key={k} className="h-12 w-full bg-muted" />
                  ))}
                </div>
              ) : !anomalies || anomalies.length === 0 ? (
                <div className="flex items-center gap-2 py-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    No alerts — all clear
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {anomalies.map((alert) => (
                    <div
                      key={`${alert.category}-${alert.currentSpend}`}
                      className="bg-warning-bg border border-warning/15 rounded-md px-3 py-2.5"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-semibold text-warning uppercase tracking-wide">
                              {categoryLabel(alert.category)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {alert.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-warning/70 tabular">
                              {formatCurrency(alert.currentSpend)} this period
                            </span>
                            <span className="text-[11px] text-muted-foreground/50">
                              vs
                            </span>
                            <span className="text-[11px] text-muted-foreground/70 tabular">
                              {formatCurrency(alert.averageSpend)} avg
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </StatCard>
          </div>

          {/* Quick link to expenses */}
          {burnRate && burnRate.totalSpent > 0 && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate("expenses")}
                className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
              >
                <TrendingDown className="w-3.5 h-3.5" />
                View all expenses
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
