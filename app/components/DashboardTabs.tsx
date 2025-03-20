"use client";

import { useState, useEffect } from "react";
import ExpenseList from "./ExpenseList";

export default function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [triggerRefresh, setTriggerRefresh] = useState(Date.now());

  // Listen for expense added events
  useEffect(() => {
    const handleExpenseAdded = () => {
      console.log("Expense added event detected, refreshing tabs");
      setTriggerRefresh(Date.now());
    };

    // Add event listener
    window.addEventListener("expenseAdded", handleExpenseAdded);

    // Clean up listener
    return () => {
      window.removeEventListener("expenseAdded", handleExpenseAdded);
    };
  }, []);

  const tabs = [
    { id: "all", label: "All" },
    { id: "day", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "year", label: "This Year" },
    { id: "custom", label: "Custom" },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "custom") {
      setShowCustomDatePicker(true);
    } else {
      setShowCustomDatePicker(false);
    }
  };

  const handleCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation would go here
    if (fromDate && toDate) {
      // Custom date period is set, it will be used by ExpenseList
      setTriggerRefresh(Date.now());
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#35374B] shadow rounded-lg overflow-hidden">
        <div className="border-b border-[#50727B]">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap focus:outline-none ${
                  activeTab === tab.id
                    ? "border-b-2 border-[#78A083] text-[#78A083]"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {showCustomDatePicker && (
          <div className="p-4 bg-[#344955] border-b border-[#50727B]">
            <form
              onSubmit={handleCustomDateSubmit}
              className="flex flex-wrap gap-4 items-end"
            >
              <div>
                <label
                  htmlFor="fromDate"
                  className="block text-xs text-gray-300 mb-1"
                >
                  From
                </label>
                <input
                  type="date"
                  id="fromDate"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="border border-[#50727B] rounded px-3 py-2 bg-[#344955] text-white focus:outline-none focus:ring-1 focus:ring-[#78A083]"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="toDate"
                  className="block text-xs text-gray-300 mb-1"
                >
                  To
                </label>
                <input
                  type="date"
                  id="toDate"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="border border-[#50727B] rounded px-3 py-2 bg-[#344955] text-white focus:outline-none focus:ring-1 focus:ring-[#78A083]"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-[#78A083] text-white rounded px-4 py-2 hover:bg-[#50727B] focus:outline-none focus:ring-2 focus:ring-[#78A083] transition duration-200"
              >
                Apply
              </button>
            </form>
          </div>
        )}
      </div>

      <ExpenseList
        activeTab={activeTab}
        fromDate={fromDate}
        toDate={toDate}
        key={`${activeTab}-${triggerRefresh}`}
      />
    </div>
  );
}
