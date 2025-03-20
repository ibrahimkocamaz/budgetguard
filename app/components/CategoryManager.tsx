"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FaTrash, FaPlus } from "react-icons/fa";

interface Category {
  id: string;
  name: string;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/categories");

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError("Failed to load categories.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      setIsSubmitting(true);
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
      setNewCategory("");
      toast.success("Category added successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      setDeleteLoading(id);
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();

        // Special handling for categories with expenses
        if (response.status === 409) {
          toast.error(`Cannot delete category with ${data.count} expenses`);
          return;
        }

        throw new Error(data.error || "Failed to delete category");
      }

      // Remove the deleted category from the list
      setCategories(categories.filter((cat) => cat.id !== id));
      toast.success("Category deleted successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Manage Categories
      </h2>

      {error && (
        <div className="p-4 bg-red-50 text-red-500 rounded-md mb-4">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleAddCategory} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Enter new category name"
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-1 hover:bg-blue-600 disabled:bg-blue-300"
            disabled={isSubmitting || !newCategory.trim()}
          >
            <FaPlus className="w-3 h-3" />
            <span>Add</span>
          </button>
        </div>
      </form>

      <div className="border rounded-md overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b">
          <h3 className="font-medium text-gray-700">Your Categories</h3>
        </div>

        {categories.length === 0 ? (
          <div className="p-4 text-gray-500 text-center">
            No categories found. Add your first category!
          </div>
        ) : (
          <ul className="divide-y">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex justify-between items-center px-4 py-3 hover:bg-gray-50"
              >
                <span className="text-gray-700">{category.name}</span>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  disabled={deleteLoading === category.id}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50"
                  title="Delete category"
                >
                  {deleteLoading === category.id ? (
                    <div className="w-4 h-4 border-t-2 border-red-500 rounded-full animate-spin" />
                  ) : (
                    <FaTrash className="w-4 h-4" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
