"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaCog } from "react-icons/fa";

export default function Navbar({ user }: { user: any }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard" className="text-xl font-bold">
          FinanceApp
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link
              href="/settings"
              className="flex items-center space-x-1 hover:text-blue-200 transition duration-200"
              title="Settings"
            >
              <FaCog />
              <span className="hidden md:inline">Settings</span>
            </Link>
            <span className="hidden md:inline">Hello, {user.name}</span>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-100 transition duration-200"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </>
        ) : (
          <div className="space-x-2">
            <Link
              href="/auth/login"
              className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-100 transition duration-200"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 border border-white text-white rounded-md hover:bg-blue-500 transition duration-200"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
