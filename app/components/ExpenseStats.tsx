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
          color: "#ffffff",
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
      <div className="bg-[#35374B] p-6 rounded-lg shadow-md h-80 flex justify-center items-center">
        <div className="loader text-white">Loading statistics...</div>
      </div>
    );
  }

  if (error && !statData) {
    return (
      <div className="bg-[#35374B] p-6 rounded-lg shadow-md">
        <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() =>
            isCustomDate
              ? fetchStats(period, startDate, endDate)
              : fetchStats(period)
          }
          className="px-4 py-2 bg-[#78A083] text-white rounded hover:bg-[#50727B] transition duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#35374B] p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-white">Expense Breakdown</h2>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <select
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="border border-[#50727B] rounded px-3 py-1 text-sm text-white bg-[#344955] focus:outline-none focus:ring-2 focus:ring-[#78A083]"
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
                <label className="block text-xs text-gray-300 mb-1">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-[#50727B] rounded px-3 py-1 text-sm text-white bg-[#344955] focus:outline-none focus:ring-2 focus:ring-[#78A083]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-300 mb-1">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-[#50727B] rounded px-3 py-1 text-sm text-white bg-[#344955] focus:outline-none focus:ring-2 focus:ring-[#78A083]"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1 bg-[#78A083] text-white rounded hover:bg-[#50727B] transition duration-200"
              >
                Apply
              </button>
            </form>
          )}
        </div>
      </div>

      {!statData || !statData.byCategory.length ? (
        <div className="h-60 flex flex-col items-center justify-center text-center text-gray-300">
          <p className="mb-4">No expense data available for this period.</p>
          <p className="text-sm">
            Try a different time period or add some expenses.
          </p>
        </div>
      ) : (
        <div>
          <div className="h-60 mb-4">
            <Pie data={getChartData()} options={chartOptions} />
          </div>

          <div className="mt-6 border-t border-[#50727B] pt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-white">
                {getPeriodLabel(period)}
              </h3>
              <p className="text-[#78A083] font-bold">
                {formatCurrency(statData.total)}
              </p>
            </div>

            <p className="text-xs text-gray-300">
              {new Date(statData.startDate).toLocaleDateString()} -{" "}
              {new Date(statData.endDate).toLocaleDateString()}
            </p>
          </div>

          <div className="mt-4">
            <h3 className="font-medium text-white mb-2">Category Breakdown</h3>
            <ul className="space-y-2">
              {statData.byCategory.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-2 rounded bg-[#344955]"
                >
                  <span className="text-white">{item.category}</span>
                  <span className="text-[#78A083] font-medium">
                    {formatCurrency(item.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
