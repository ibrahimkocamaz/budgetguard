"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { FaTrash, FaSync, FaSearch } from "react-icons/fa";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

        // Add search query to params if it exists
        if (debouncedSearchQuery.trim() !== "") {
          params.append("search", debouncedSearchQuery);
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
    [activeTab, fromDate, toDate, debouncedSearchQuery]
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

      // Remove the deleted expense from the list
      setExpenses((prev) => prev.filter((expense) => expense.id !== id));
      setDeleteSuccess(true);

      // Show success toast
      toast.success("Expense deleted successfully");

      // Hide success message after a delay
      setTimeout(() => {
        setDeleteSuccess(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete expense");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleRefresh = () => {
    setLastRefresh(Date.now());
    setRefreshing(true);
    fetchExpenses(false);
  };

  // Fetch expenses when activeTab, fromDate, toDate, lastRefresh, or debouncedSearchQuery changes
  useEffect(() => {
    if (refreshing) {
      fetchExpenses(false);
    } else {
      fetchExpenses(true);
    }
  }, [
    activeTab,
    fromDate,
    toDate,
    lastRefresh,
    debouncedSearchQuery,
    fetchExpenses,
  ]);

  return (
    <div className="bg-[#35374B] shadow rounded-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-semibold text-white mb-4 md:mb-0">
          {getPeriodTitle()}
        </h2>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-grow md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-[#50727B] rounded-md leading-5 bg-[#344955] text-white placeholder-gray-400 focus:outline-none focus:ring-[#78A083] focus:border-[#78A083] sm:text-sm"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#78A083] hover:bg-[#50727B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#78A083] transition duration-200"
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <FaSync className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Refreshing...
              </>
            ) : (
              <>
                <FaSync className="-ml-1 mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="loader text-[#78A083]">Loading expenses...</div>
        </div>
      ) : error ? (
        <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-8 text-gray-300">
          <p className="text-lg">No expenses found</p>
          <p className="text-sm mt-2">
            {debouncedSearchQuery
              ? "Try a different search term"
              : "Add some expenses to get started"}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#50727B]">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#50727B]">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-[#344955]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {expense.description || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {expense.category?.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#78A083]">
                      {formatAmount(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        disabled={deleteLoading === expense.id}
                        className="text-red-400 hover:text-red-600 disabled:opacity-50 transition-colors duration-200"
                        title="Delete expense"
                      >
                        {deleteLoading === expense.id ? (
                          <FaSync className="animate-spin h-4 w-4" />
                        ) : (
                          <FaTrash className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {deleteSuccess && (
            <div className="mt-4 p-2 bg-[#78A083] text-white text-center rounded">
              Expense deleted successfully
            </div>
          )}
        </>
      )}
    </div>
  );
}
