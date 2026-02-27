import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Category } from "../backend.d";
import {
  useAddTransaction,
  useDeleteTransaction,
  useTransactions,
} from "../hooks/useQueries";
import {
  categoryColor,
  categoryLabel,
  formatCurrency,
  formatDate,
} from "../utils/format";

const CATEGORIES = [
  { value: Category.payroll, label: "Payroll" },
  { value: Category.saas, label: "SaaS" },
  { value: Category.marketing, label: "Marketing" },
  { value: Category.infrastructure, label: "Infrastructure" },
  { value: Category.legal, label: "Legal" },
  { value: Category.office, label: "Office" },
  { value: Category.other, label: "Other" },
];

const FILTER_CHIPS = [
  { value: "all", label: "All" },
  { value: Category.payroll, label: "Payroll" },
  { value: Category.saas, label: "SaaS" },
  { value: Category.marketing, label: "Marketing" },
  { value: Category.infrastructure, label: "Infra" },
  { value: Category.legal, label: "Legal" },
  { value: Category.office, label: "Office" },
  { value: Category.other, label: "Other" },
];

interface AddExpenseFormData {
  date: string;
  description: string;
  amount: string;
  category: Category;
}

const defaultForm: AddExpenseFormData = {
  date: new Date().toISOString().split("T")[0],
  description: "",
  amount: "",
  category: Category.other,
};

export default function Expenses() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState<AddExpenseFormData>(defaultForm);

  const { data: transactions, isLoading } = useTransactions();
  const addMutation = useAddTransaction();
  const deleteMutation = useDeleteTransaction();

  const filtered = transactions
    ? [...transactions]
        .filter((t) =>
          activeFilter === "all" ? true : t.category === activeFilter,
        )
        .sort((a, b) => Number(b.date) - Number(a.date))
    : [];

  const handleAdd = async () => {
    if (!form.description.trim()) {
      toast.error("Description is required");
      return;
    }
    const amount = Number.parseFloat(form.amount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid positive amount");
      return;
    }
    if (!form.date) {
      toast.error("Date is required");
      return;
    }

    const dateTimestamp = BigInt(
      Math.floor(new Date(form.date).getTime() / 1000),
    );

    try {
      await addMutation.mutateAsync({
        date: dateTimestamp,
        description: form.description.trim(),
        amount: -amount, // stored as negative for expenses
        category: form.category,
        source: "manual",
      });
      toast.success("Expense added");
      setShowDialog(false);
      setForm(defaultForm);
    } catch {
      toast.error("Failed to add expense");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Expense deleted");
    } catch {
      toast.error("Failed to delete expense");
    }
  };

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <header className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground tracking-tight">
            Expenses
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {transactions ? `${transactions.length} transactions` : "Loading…"}
          </p>
        </div>
        <Button
          onClick={() => setShowDialog(true)}
          size="sm"
          className="gap-1.5 bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 hover:border-primary/50 transition-colors"
          variant="ghost"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Expense
        </Button>
      </header>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTER_CHIPS.map((chip) => (
          <button
            type="button"
            key={chip.value}
            onClick={() => setActiveFilter(chip.value)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border transition-all",
              activeFilter === chip.value
                ? "bg-primary/20 text-primary border-primary/40"
                : "bg-transparent text-muted-foreground border-border hover:border-border/80 hover:text-foreground",
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-card">
        {isLoading ? (
          <div className="divide-y divide-border">
            {["a", "b", "c", "d", "e"].map((k) => (
              <div key={k} className="px-5 py-3.5 flex items-center gap-4">
                <Skeleton className="h-4 w-20 bg-muted" />
                <Skeleton className="h-4 w-48 bg-muted" />
                <Skeleton className="h-5 w-16 rounded-full bg-muted ml-auto" />
                <Skeleton className="h-4 w-20 bg-muted" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {activeFilter === "all"
                ? "No transactions yet. Add one above or enable fake data mode in Settings."
                : `No transactions in ${categoryLabel(activeFilter)}.`}
            </p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[1fr_2fr_auto_auto_auto] gap-4 px-5 py-2.5 border-b border-border bg-accent/30">
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                Date
              </span>
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                Description
              </span>
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                Category
              </span>
              <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider text-right">
                Amount
              </span>
              <span className="w-6" />
            </div>

            <div className="divide-y divide-border">
              {filtered.map((tx) => (
                <div
                  key={tx.id.toString()}
                  className="grid grid-cols-[1fr_2fr_auto_auto_auto] gap-4 px-5 py-3.5 items-center hover:bg-accent/20 transition-colors group"
                >
                  <span className="text-sm text-muted-foreground tabular">
                    {formatDate(tx.date)}
                  </span>
                  <span className="text-sm text-foreground truncate">
                    {tx.description}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-medium px-2 py-0.5 rounded-full border",
                      categoryColor(tx.category),
                    )}
                  >
                    {categoryLabel(tx.category)}
                  </span>
                  <span className="text-sm font-medium text-destructive tabular text-right">
                    -{formatCurrency(tx.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(tx.id)}
                    disabled={deleteMutation.isPending}
                    className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground/30 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-base font-semibold">
              Add Expense
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                className="bg-accent/30 border-border focus:border-primary/50 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Description
              </Label>
              <Input
                placeholder="e.g. AWS monthly bill"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="bg-accent/30 border-border focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Amount (USD, positive)
              </Label>
              <Input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amount: e.target.value }))
                }
                className="bg-accent/30 border-border focus:border-primary/50 text-foreground placeholder:text-muted-foreground/50 tabular"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, category: v as Category }))
                }
              >
                <SelectTrigger className="bg-accent/30 border-border focus:border-primary/50 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {CATEGORIES.map((cat) => (
                    <SelectItem
                      key={cat.value}
                      value={cat.value}
                      className="text-foreground focus:bg-accent"
                    >
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowDialog(false);
                setForm(defaultForm);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={addMutation.isPending}
              className="bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors"
              variant="ghost"
            >
              {addMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5 mr-1.5" />
              )}
              {addMutation.isPending ? "Adding…" : "Add Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
