import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Type__3 {
    description: string;
    category: string;
    currentSpend: number;
    averageSpend: number;
}
export interface Type__1 {
    id: bigint;
    source: string;
    date: bigint;
    description: string;
    category: Category;
    amount: number;
}
export interface Type {
    anomalyDetected: boolean;
    anomalyDetails: string;
    totalSpend: number;
    topCategory: string;
}
export interface Settings {
    fakeDataMode: boolean;
    connectedAccount: string;
    fundingAmount: number;
    startingBalance: number;
}
export interface Type__2 {
    runwayMonths: number;
    avgMonthlySpend: number;
    totalSpent: number;
    runwayText: string;
    monthlyBurnRate: number;
}
export enum Category {
    other = "other",
    marketing = "marketing",
    saas = "saas",
    office = "office",
    legal = "legal",
    infrastructure = "infrastructure",
    payroll = "payroll"
}
export interface backendInterface {
    addTransaction(date: bigint, description: string, amount: number, category: Category, source: string): Promise<bigint>;
    clearData(): Promise<void>;
    deleteTransaction(id: bigint): Promise<void>;
    detectAnomalies(): Promise<Array<Type__3>>;
    getBurnRateSummary(): Promise<Type__2>;
    getSettings(): Promise<Settings>;
    getTotalExpensesByCategory(): Promise<Array<[string, number]>>;
    getTransactions(): Promise<Array<Type__1>>;
    getWeeklySummary(): Promise<Type>;
    saveSettings(newSettings: Settings): Promise<void>;
}
