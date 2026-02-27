import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import { useSettings } from "./hooks/useQueries";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import SettingsPage from "./pages/Settings";

export type Page = "dashboard" | "expenses" | "settings";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const { data: settings } = useSettings();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Fake Data Mode Banner */}
      {settings?.fakeDataMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b border-amber-200 text-amber-700 text-xs font-medium text-center py-1.5 tracking-wide">
          Demo mode active — data shown is simulated
        </div>
      )}

      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        hasBanner={settings?.fakeDataMode}
      />

      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingTop: settings?.fakeDataMode ? "2rem" : 0 }}
      >
        {currentPage === "dashboard" && (
          <Dashboard onNavigate={setCurrentPage} />
        )}
        {currentPage === "expenses" && <Expenses />}
        {currentPage === "settings" && <SettingsPage />}
      </main>

      <Toaster theme="light" position="bottom-right" />
    </div>
  );
}
