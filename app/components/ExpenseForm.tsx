"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

// We'll create the custom event in useEffect to ensure it only runs in browser
let expenseAddedEvent: CustomEvent;

export default function ExpenseForm() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(getTodayDateString());
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Create custom event only in browser
  useEffect(() => {
    // Only create the event in the browser, not during SSR
    expenseAddedEvent = new CustomEvent("expenseAdded", { detail: {} });
  }, []);

  // Helper function to get today's date in the format YYYY-MM-DD
  function getTodayDateString() {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }

  useEffect(() => {
    // Fetch categories when component mounts
    fetchCategories();
  }, []);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
      if (data.length > 0 && !categoryId) {
        setCategoryId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const addNewCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newCategory.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add category");
      }

      const category = await response.json();
      setCategories([...categories, category]);
      setCategoryId(category.id);
      setNewCategory("");
      setShowNewCategory(false);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) {
      setError("Amount and category are required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      // Format date properly
      const dateObj = new Date(date);
      // Set to noon UTC to avoid timezone issues
      dateObj.setUTCHours(12, 0, 0, 0);

      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          description,
          categoryId,
          date: dateObj.toISOString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add expense");
      }

      // Reset form
      setAmount("");
      setDescription("");
      setDate(getTodayDateString());

      // Show success message
      setSuccessMessage("Expense added successfully!");

      // Emit custom event for expense added
      window.dispatchEvent(expenseAddedEvent);

      // Refresh the page to show the new expense
      router.refresh();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#35374B] p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-white">Add New Expense</h2>

      {error && (
        <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-[#78A083] border border-[#50727B] text-white px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-gray-300 mb-1" htmlFor="amount">
              Amount*
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border border-[#50727B] rounded bg-[#344955] text-white focus:outline-none focus:ring-2 focus:ring-[#78A083]"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 mb-1" htmlFor="date">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border border-[#50727B] rounded bg-[#344955] text-white focus:outline-none focus:ring-2 focus:ring-[#78A083]"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 mb-1" htmlFor="description">
            Description
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-[#50727B] rounded bg-[#344955] text-white focus:outline-none focus:ring-2 focus:ring-[#78A083]"
            placeholder="What was this expense for?"
          />
        </div>

        {!showNewCategory ? (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-gray-300" htmlFor="category">
                Category*
              </label>
              <button
                type="button"
                onClick={() => setShowNewCategory(true)}
                className="text-[#78A083] text-sm hover:underline"
              >
                + Add New Category
              </button>
            </div>

            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-2 border border-[#50727B] rounded bg-[#344955] text-white focus:outline-none focus:ring-2 focus:ring-[#78A083]"
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-gray-300 mb-1" htmlFor="newCategory">
              New Category Name*
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="newCategory"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 p-2 border border-[#50727B] rounded bg-[#344955] text-white focus:outline-none focus:ring-2 focus:ring-[#78A083]"
                placeholder="Enter category name"
              />
              <button
                type="button"
                onClick={addNewCategory}
                className="px-4 py-2 bg-[#78A083] text-white rounded hover:bg-[#50727B] transition duration-200"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowNewCategory(false)}
                className="px-4 py-2 border border-[#50727B] text-white rounded hover:bg-[#50727B] transition duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-4 px-4 py-2 bg-[#78A083] text-white rounded hover:bg-[#50727B] transition duration-200 disabled:opacity-50"
        >
          {isSubmitting ? "Adding..." : "Add Expense"}
        </button>
      </form>
    </div>
  );
}
