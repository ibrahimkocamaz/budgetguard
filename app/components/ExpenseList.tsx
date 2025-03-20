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
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 md:mb-0">
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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

      {/* Show error message if there is one */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Show loading spinner if loading */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-12">
          <p>No expenses found for this period.</p>
          {debouncedSearchQuery && (
            <p className="text-gray-500 mt-2">
              Try adjusting your search or date range.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4">
          {deleteSuccess && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Expense deleted successfully
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.description || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.category?.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatAmount(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={deleteLoading === expense.id}
                      >
                        {deleteLoading === expense.id ? (
                          <span className="inline-flex items-center">
                            <FaTrash className="animate-pulse h-4 w-4" />
                            <span className="ml-1">Deleting...</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center">
                            <FaTrash className="h-4 w-4" />
                            <span className="ml-1">Delete</span>
                          </span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
