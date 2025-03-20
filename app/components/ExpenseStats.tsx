"use client";

import { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
} from "chart.js";

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, Tooltip, Legend);

interface StatData {
  total: number;
  byCategory: { category: string; amount: number }[];
  period: string;
  startDate: string;
  endDate: string;
}

export default function ExpenseStats() {
  const [statData, setStatData] = useState<StatData | null>(null);
  const [period, setPeriod] = useState("month");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  // Set today's date as the default end date, and 30 days ago as the default start date
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
  }, []);

  // Set up polling for data refresh (every 10 seconds)
  useEffect(() => {
    const intervalId = setInterval(() => {
      setLastRefresh(Date.now());
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  // Fetch data when period, date range, or refresh trigger changes
  useEffect(() => {
    if (isCustomDate) {
      if (startDate && endDate) {
        fetchStats(period, startDate, endDate);
      }
    } else {
      fetchStats(period);
    }
  }, [period, isCustomDate, startDate, endDate, lastRefresh]);

  const fetchStats = async (
    selectedPeriod: string,
    fromDate?: string,
    toDate?: string
  ) => {
    try {
      setIsLoading(true);
      setError("");

      let url = `/api/stats?period=${selectedPeriod}`;
      if (fromDate && toDate) {
        url += `&from=${fromDate}&to=${toDate}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }

      const data = await response.json();
      setStatData(data);
    } catch (error: any) {
      setError(error.message);
      console.error("Error fetching statistics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    setIsCustomDate(newPeriod === "custom");
  };

  const handleDateRangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStats(period, startDate, endDate);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getPeriodLabel = (periodKey: string) => {
    switch (periodKey) {
      case "day":
        return "Today";
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "year":
        return "This Year";
      case "custom":
        return "Custom Range";
      default:
        return "This Month";
    }
  };

  const getChartData = () => {
    if (!statData || !statData.byCategory.length) {
      return {
        labels: ["No Data"],
        datasets: [
          {
            data: [1],
            backgroundColor: ["#e2e8f0"],
            borderWidth: 0,
          },
        ],
      };
    }

    const chartColors = [
      "#4299e1", // blue-500
      "#38b2ac", // teal-500
      "#ed8936", // orange-500
      "#9f7aea", // purple-500
      "#f56565", // red-500
      "#48bb78", // green-500
      "#ecc94b", // yellow-500
      "#667eea", // indigo-500
      "#fc8181", // red-400
      "#4fd1c5", // teal-400
      "#a0aec0", // gray-500
    ];

    return {
      labels: statData.byCategory.map((item) => item.category),
      datasets: [
        {
          data: statData.byCategory.map((item) => item.amount),
          backgroundColor: statData.byCategory.map(
            (_, index) => chartColors[index % chartColors.length]
          ),
          borderWidth: 1,
          borderColor: "#ffffff",
        },
      ],
    };
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 11,
          },
          color: "#333333",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.chart.getDatasetMeta(0).total;
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  if (isLoading && !statData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-80 flex justify-center items-center">
        <div className="loader text-gray-700">Loading statistics...</div>
      </div>
    );
  }

  if (error && !statData) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() =>
            isCustomDate
              ? fetchStats(period, startDate, endDate)
              : fetchStats(period)
          }
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Expense Breakdown
        </h2>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <select
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="border rounded px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Date Range</option>
          </select>

          {isCustomDate && (
            <form
              onSubmit={handleDateRangeSubmit}
              className="flex flex-col md:flex-row gap-2 items-end"
            >
              <div>
                <label className="block text-xs text-gray-600">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border rounded px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border rounded px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
              >
                Apply
              </button>
            </form>
          )}
        </div>
      </div>

      {statData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="flex flex-col justify-center">
            <div className="mb-2">
              <div className="text-sm text-gray-600">Total Expenses</div>
              <div className="text-2xl font-bold text-gray-800">
                {formatCurrency(statData.total)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {isCustomDate
                  ? `${new Date(
                      statData.startDate
                    ).toLocaleDateString()} - ${new Date(
                      statData.endDate
                    ).toLocaleDateString()}`
                  : getPeriodLabel(statData.period)}
              </div>
            </div>

            {statData.byCategory.length > 0 ? (
              <div className="mt-6">
                <div className="text-sm text-gray-600 mb-2">Top Categories</div>
                <div className="space-y-2">
                  {statData.byCategory
                    .sort((a, b) => b.amount - a.amount)
                    .slice(0, 3)
                    .map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <div className="text-sm text-gray-700">
                          {item.category}
                        </div>
                        <div className="text-sm font-medium text-gray-800">
                          {formatCurrency(item.amount)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 text-gray-500 text-sm">
                No expense data available
              </div>
            )}
          </div>

          <div className="lg:col-span-2 h-64">
            {statData.byCategory.length > 0 ? (
              <Pie data={getChartData()} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No data to display
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
