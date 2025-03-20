"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { FaTrash, FaSync } from "react-icons/fa";

interface Category {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  categoryId: string;
  category?: Category;
}

interface ExpenseListProps {
  activeTab?: string;
  fromDate?: string;
  toDate?: string;
}

export default function ExpenseList({
  activeTab = "all",
  fromDate,
  toDate,
}: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getPeriodTitle = () => {
    switch (activeTab) {
      case "day":
        return "Today's Expenses";
      case "week":
        return "This Week's Expenses";
      case "month":
        return "This Month's Expenses";
      case "year":
        return "This Year's Expenses";
      case "custom":
        if (fromDate && toDate) {
          return `Expenses from ${formatDate(fromDate)} to ${formatDate(
            toDate
          )}`;
        }
        return "Custom Period Expenses";
      default:
        return "All Expenses";
    }
  };

  const fetchExpenses = useCallback(
    async (showLoadingSpinner = true) => {
      if (showLoadingSpinner) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError("");

      try {
        let url = "/api/expenses";
        const params = new URLSearchParams();

        if (activeTab !== "all" && activeTab !== "custom") {
          params.append("period", activeTab);
        } else if (activeTab === "custom" && fromDate && toDate) {
          params.append("from", fromDate);
          params.append("to", toDate);
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        console.log("Fetching expenses from URL:", url);
        const response = await fetch(url, {
          // Add a cache-busting parameter to ensure fresh data
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch expenses");
        }

        const data = await response.json();

        // Sort expenses by date, newest first
        data.sort((a: Expense, b: Expense) => {
          // First sort by date
          const dateCompare =
            new Date(b.date).getTime() - new Date(a.date).getTime();

          if (dateCompare !== 0) {
            return dateCompare; // If dates are different, return date comparison
          }

          // If dates are the same, sort by ID (assuming newer expenses have higher IDs)
          // This ensures consistent ordering even with same dates
          return b.id.localeCompare(a.id);
        });

        setExpenses(data);
      } catch (err) {
        setError("Failed to load expenses. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeTab, fromDate, toDate]
  );

  const handleDelete = async (id: string) => {
    try {
      setDeleteLoading(id);
      const response = await fetch(`/api/expenses/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }

      // Show success message
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 3000);

      // Remove the deleted expense from the list
      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
      toast.success("Expense deleted successfully");

      // Trigger a refresh to ensure our data is current
      setLastRefresh(Date.now());
    } catch (err) {
      console.error("Error deleting expense:", err);
      toast.error("Failed to delete expense");
    } finally {
      setDeleteLoading(null);
    }
  };

  // Manual refresh handler
  const handleRefresh = () => {
    setLastRefresh(Date.now());
  };

  // Set up auto-refresh every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setLastRefresh(Date.now());
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Fetch expenses when activeTab, fromDate, toDate, or lastRefresh changes
  useEffect(() => {
    if (lastRefresh === Date.now()) {
      // Full loading state for initial load or tab changes
      fetchExpenses(true);
    } else {
      // Background refresh - don't show full loading state
      fetchExpenses(false);
    }
  }, [activeTab, fromDate, toDate, lastRefresh, fetchExpenses]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-500 rounded-md">
        <p>{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="p-4 bg-gray-50 text-gray-500 rounded-md">
        <p>No expenses found for this period.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          {getPeriodTitle()}
        </h2>
        <button
          onClick={handleRefresh}
          className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
          disabled={refreshing}
        >
          <FaSync className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
          <span className="text-sm">
            {refreshing ? "Refreshing..." : "Refresh"}
          </span>
        </button>
      </div>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {deleteSuccess && (
          <div className="p-4 bg-green-50 text-green-600 border-b">
            Expense deleted successfully.
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(expense.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {expense.category?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatAmount(expense.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <button
                      onClick={() => handleDelete(expense.id)}
                      disabled={deleteLoading === expense.id}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                      title="Delete expense"
                    >
                      {deleteLoading === expense.id ? (
                        <div className="w-4 h-4 border-t-2 border-red-500 rounded-full animate-spin mx-auto" />
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
