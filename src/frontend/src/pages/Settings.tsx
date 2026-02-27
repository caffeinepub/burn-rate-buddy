import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Check, Link, Loader2, Unlink } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Settings } from "../backend.d";
import {
  useClearData,
  useSaveSettings,
  useSettings,
} from "../hooks/useQueries";

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const saveMutation = useSaveSettings();
  const clearMutation = useClearData();

  const [form, setForm] = useState<Settings>({
    fakeDataMode: false,
    connectedAccount: "",
    fundingAmount: 0,
    startingBalance: 0,
  });

  const [accountInput, setAccountInput] = useState("");

  useEffect(() => {
    if (settings) {
      setForm(settings);
      setAccountInput(settings.connectedAccount);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(form);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const handleConnectAccount = async () => {
    const updated = { ...form, connectedAccount: accountInput.trim() };
    setForm(updated);
    try {
      await saveMutation.mutateAsync(updated);
      toast.success(
        accountInput.trim() ? "Account connected" : "Account disconnected",
      );
    } catch {
      toast.error("Failed to update account");
    }
  };

  const handleFakeDataToggle = async (enabled: boolean) => {
    const updated = { ...form, fakeDataMode: enabled };
    setForm(updated);

    try {
      if (!enabled) {
        await clearMutation.mutateAsync();
        toast.success("Data cleared");
      } else {
        toast.success("Fake data mode enabled — add transactions to test");
      }
      await saveMutation.mutateAsync(updated);
    } catch {
      toast.error("Something went wrong");
      setForm((p) => ({ ...p, fakeDataMode: !enabled }));
    }
  };

  const isBusy = saveMutation.isPending || clearMutation.isPending;

  return (
    <div className="px-8 py-8 max-w-2xl mx-auto animate-fade-in">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-foreground tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your account and preferences
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-6">
          {["a", "b", "c"].map((k) => (
            <div
              key={k}
              className="bg-card border border-border rounded-lg p-5"
            >
              <Skeleton className="h-4 w-32 mb-4 bg-muted" />
              <Skeleton className="h-10 w-full bg-muted" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Bank Connection */}
          <section className="bg-card border border-border rounded-lg p-5 shadow-card">
            <h2 className="font-display text-sm font-semibold text-foreground mb-1">
              Bank Connection
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Connect a bank account to sync transactions automatically
              (mocked).
            </p>

            {form.connectedAccount && (
              <div className="flex items-center gap-2 bg-success/10 border border-success/20 rounded-md px-3 py-2 mb-3">
                <Check className="w-3.5 h-3.5 text-success shrink-0" />
                <span className="text-xs text-success/80">
                  Connected to{" "}
                  <span className="font-semibold">{form.connectedAccount}</span>
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="e.g. Chase Business Checking"
                value={accountInput}
                onChange={(e) => setAccountInput(e.target.value)}
                className="bg-accent/30 border-border focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 flex-1"
              />
              <Button
                onClick={handleConnectAccount}
                disabled={isBusy}
                variant="ghost"
                size="sm"
                className="gap-1.5 border border-border hover:border-border/60 text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                {form.connectedAccount ? (
                  <>
                    <Unlink className="w-3.5 h-3.5" />
                    Update
                  </>
                ) : (
                  <>
                    <Link className="w-3.5 h-3.5" />
                    Connect
                  </>
                )}
              </Button>
            </div>
          </section>

          {/* Financial Settings */}
          <section className="bg-card border border-border rounded-lg p-5 shadow-card">
            <h2 className="font-display text-sm font-semibold text-foreground mb-1">
              Financial Settings
            </h2>
            <p className="text-xs text-muted-foreground mb-4">
              Used to calculate runway and burn rate.
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Funding Amount (USD)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                  value={form.fundingAmount || ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      fundingAmount: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="bg-accent/30 border-border focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 tabular"
                />
                <p className="text-[11px] text-muted-foreground/60">
                  Total funds raised or available (e.g. seed round amount)
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Starting Balance (USD)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                  value={form.startingBalance || ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      startingBalance: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="bg-accent/30 border-border focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 tabular"
                />
                <p className="text-[11px] text-muted-foreground/60">
                  Current cash balance in your accounts
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <Button
                onClick={handleSave}
                disabled={isBusy}
                variant="ghost"
                size="sm"
                className="gap-1.5 bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 transition-colors"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                {saveMutation.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </section>

          {/* Fake Data Mode */}
          <section className="bg-card border border-border rounded-lg p-5 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-sm font-semibold text-foreground mb-1">
                  Fake Data Mode
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Load realistic sample transactions to explore the app. This
                  will replace all existing data.
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2.5">
                {clearMutation.isPending && (
                  <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
                )}
                <Switch
                  checked={form.fakeDataMode}
                  onCheckedChange={handleFakeDataToggle}
                  disabled={isBusy}
                  className="data-[state=checked]:bg-primary/70"
                />
              </div>
            </div>

            {form.fakeDataMode && (
              <div className="mt-3 bg-warning-bg border border-warning/15 rounded-md px-3 py-2">
                <p className="text-[11px] text-warning/70 leading-relaxed">
                  ⚡ Fake data mode is active. All data shown is simulated.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
