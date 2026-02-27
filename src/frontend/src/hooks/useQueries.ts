import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Category, Settings, Type__1 } from "../backend.d";
import { useActor } from "./useActor";

const FAKE_TRANSACTIONS: Array<{
  date: number;
  description: string;
  amount: number;
  category: Category;
  source: string;
}> = [
  {
    date: Date.now() - 2 * 24 * 60 * 60 * 1000,
    description: "AWS Infrastructure",
    amount: 4200,
    category: "infrastructure" as unknown as Category,
    source: "bank",
  },
  {
    date: Date.now() - 4 * 24 * 60 * 60 * 1000,
    description: "Monthly Payroll",
    amount: 42000,
    category: "payroll" as unknown as Category,
    source: "bank",
  },
  {
    date: Date.now() - 6 * 24 * 60 * 60 * 1000,
    description: "Figma Team Plan",
    amount: 180,
    category: "saas" as unknown as Category,
    source: "bank",
  },
  {
    date: Date.now() - 8 * 24 * 60 * 60 * 1000,
    description: "Google Workspace",
    amount: 340,
    category: "saas" as unknown as Category,
    source: "bank",
  },
  {
    date: Date.now() - 10 * 24 * 60 * 60 * 1000,
    description: "Legal Counsel — Series A",
    amount: 8500,
    category: "legal" as unknown as Category,
    source: "bank",
  },
  {
    date: Date.now() - 14 * 24 * 60 * 60 * 1000,
    description: "LinkedIn Ads",
    amount: 2800,
    category: "marketing" as unknown as Category,
    source: "bank",
  },
  {
    date: Date.now() - 18 * 24 * 60 * 60 * 1000,
    description: "Office Supplies & Equipment",
    amount: 950,
    category: "office" as unknown as Category,
    source: "bank",
  },
  {
    date: Date.now() - 22 * 24 * 60 * 60 * 1000,
    description: "Stripe Processing Fees",
    amount: 320,
    category: "other" as unknown as Category,
    source: "bank",
  },
  {
    date: Date.now() - 32 * 24 * 60 * 60 * 1000,
    description: "Monthly Payroll",
    amount: 42000,
    category: "payroll" as unknown as Category,
    source: "bank",
  },
  {
    date: Date.now() - 35 * 24 * 60 * 60 * 1000,
    description: "AWS Infrastructure",
    amount: 3900,
    category: "infrastructure" as unknown as Category,
    source: "bank",
  },
  {
    date: Date.now() - 38 * 24 * 60 * 60 * 1000,
    description: "HubSpot CRM",
    amount: 450,
    category: "saas" as unknown as Category,
    source: "bank",
  },
  {
    date: Date.now() - 42 * 24 * 60 * 60 * 1000,
    description: "Google Ads Campaign",
    amount: 3200,
    category: "marketing" as unknown as Category,
    source: "bank",
  },
  {
    date: Date.now() - 55 * 24 * 60 * 60 * 1000,
    description: "Monthly Payroll",
    amount: 42000,
    category: "payroll" as unknown as Category,
    source: "bank",
  },
  {
    date: Date.now() - 58 * 24 * 60 * 60 * 1000,
    description: "AWS Infrastructure",
    amount: 3700,
    category: "infrastructure" as unknown as Category,
    source: "bank",
  },
  {
    date: Date.now() - 62 * 24 * 60 * 60 * 1000,
    description: "Slack Business",
    amount: 210,
    category: "saas" as unknown as Category,
    source: "bank",
  },
];

export function useSettings() {
  const { actor, isFetching } = useActor();
  return useQuery<Settings>({
    queryKey: ["settings"],
    queryFn: async () => {
      if (!actor) {
        return {
          fakeDataMode: false,
          connectedAccount: "",
          fundingAmount: 0,
          startingBalance: 0,
        };
      }
      return actor.getSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBurnRateSummary() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["burnRateSummary"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getBurnRateSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWeeklySummary() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["weeklySummary"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getWeeklySummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAnomalies() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["anomalies"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.detectAnomalies();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTransactions() {
  const { actor, isFetching } = useActor();
  return useQuery<Type__1[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useExpensesByCategory() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[string, number]>>({
    queryKey: ["expensesByCategory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTotalExpensesByCategory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (params: {
      date: bigint;
      description: string;
      amount: number;
      category: Category;
      source: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addTransaction(
        params.date,
        params.description,
        params.amount,
        params.category,
        params.source,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["burnRateSummary"] });
      queryClient.invalidateQueries({ queryKey: ["weeklySummary"] });
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
      queryClient.invalidateQueries({ queryKey: ["expensesByCategory"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteTransaction(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["burnRateSummary"] });
      queryClient.invalidateQueries({ queryKey: ["weeklySummary"] });
      queryClient.invalidateQueries({ queryKey: ["anomalies"] });
      queryClient.invalidateQueries({ queryKey: ["expensesByCategory"] });
    },
  });
}

export function useSaveSettings() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (settings: Settings) => {
      if (!actor) throw new Error("No actor");
      return actor.saveSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["burnRateSummary"] });
    },
  });
}

export function useClearData() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.clearData();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useSeedFakeData() {
  const queryClient = useQueryClient();
  const { actor } = useActor();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      // Clear existing data first
      await actor.clearData();
      // Seed demo transactions sequentially
      for (const tx of FAKE_TRANSACTIONS) {
        await actor.addTransaction(
          BigInt(tx.date),
          tx.description,
          tx.amount,
          tx.category,
          tx.source,
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}
