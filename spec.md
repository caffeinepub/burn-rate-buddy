# Burn Rate Buddy

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Dashboard page: shows current monthly burn rate, runway in months (plain English), and a summary card
- Expenses list page: table of categorized transactions with date, description, category, and amount
- Settings page: bank account connection (mocked), toggle for fake data mode, basic preferences (monthly starting balance / funding amount)
- Fake data mode: seed the app with realistic mock transactions when enabled
- Backend: data models for transactions, categories, settings; logic for burn rate and runway calculation; weekly summary generation; anomaly detection (spikes vs. average spending in a category)
- Navigation: sidebar or top nav linking Dashboard, Expenses, Settings

### Modify
Nothing (new project).

### Remove
Nothing (new project).

## Implementation Plan

### Backend
- `Transaction` record: id, date, description, amount (negative = expense), category, source
- `Settings` record: startingBalance, fundingAmount, fakeDataMode, connectedAccount (mocked string)
- `Category` variants: Payroll, SaaS, Infrastructure, Marketing, Legal, Office, Other
- `getTransactions()`: return all transactions
- `addTransaction(tx)`: add a transaction manually
- `getSettings()` / `saveSettings(s)`: get/set settings
- `getBurnRateSummary()`: compute monthly burn rate (avg last 3 months), runway months, plain-English summary
- `getWeeklySummary()`: total spend last 7 days, top category, anomaly flag
- `seedFakeData()`: insert realistic mock transactions
- `clearData()`: wipe transactions (for reset)
- `detectAnomalies()`: return list of anomaly alerts (category spend > 2x rolling avg)

### Frontend
- App shell with sidebar navigation (Dashboard, Expenses, Settings)
- Dashboard: burn rate card, runway card (e.g. "~8 months of runway"), weekly summary card, anomaly alert banner if anomalies exist
- Expenses: sortable/filterable table with category badge, formatted date and amount; "Add Expense" modal for manual entry
- Settings: form with funding amount, starting balance, fake data toggle, mock bank connection button
- Fake data mode: banner indicator when active; "Load Sample Data" button in settings
- Responsive, clean, minimal UI
