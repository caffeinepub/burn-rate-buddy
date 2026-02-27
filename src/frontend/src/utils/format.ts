export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
}

export function formatCurrencyFull(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));
}

export function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateInput(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toISOString().split("T")[0];
}

export function categoryLabel(category: string): string {
  const map: Record<string, string> = {
    payroll: "Payroll",
    saas: "SaaS",
    marketing: "Marketing",
    infrastructure: "Infra",
    legal: "Legal",
    office: "Office",
    other: "Other",
  };
  return map[category] ?? category;
}

export function categoryColor(category: string): string {
  const map: Record<string, string> = {
    payroll: "bg-blue-500/15 text-blue-300 border-blue-500/20",
    saas: "bg-violet-500/15 text-violet-300 border-violet-500/20",
    marketing: "bg-pink-500/15 text-pink-300 border-pink-500/20",
    infrastructure: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
    legal: "bg-orange-500/15 text-orange-300 border-orange-500/20",
    office: "bg-green-500/15 text-green-300 border-green-500/20",
    other: "bg-slate-500/15 text-slate-300 border-slate-500/20",
  };
  return map[category] ?? "bg-slate-500/15 text-slate-300 border-slate-500/20";
}
