"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#344955] text-white">
      {/* Header */}
      <header className="bg-[#35374B]">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">BudgetGuard</div>
          <div className="space-x-2">
            <Link
              href="/auth/login"
              className="px-4 py-2 bg-[#78A083] text-white rounded-md hover:bg-[#50727B] transition duration-200"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 border border-[#50727B] text-white rounded-md hover:bg-[#50727B] transition duration-200"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-[#35374B]">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Take Control of Your Finances
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Track your expenses, manage your budget, and gain insights into your
            spending habits with our easy-to-use finance management app.
          </p>
          <Link
            href="/auth/signup"
            className="px-8 py-3 bg-[#78A083] text-white rounded-md hover:bg-[#50727B] transition duration-200 text-lg font-medium"
          >
            Get Started — It&apos;s Free
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#344955]">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-white mb-16">
            Everything You Need to Manage Your Finances
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="bg-[#35374B] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-[#78A083]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">
                Track Expenses
              </h3>
              <p className="text-gray-300">
                Easily log your expenses and categorize them for better
                organization.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#35374B] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-[#78A083]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">
                Visual Analytics
              </h3>
              <p className="text-gray-300">
                See where your money goes with clear charts and spending
                breakdowns.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-[#35374B] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-[#78A083]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">
                Time-Based Reports
              </h3>
              <p className="text-gray-300">
                View your spending over time with daily, weekly, monthly, and
                yearly reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#35374B] text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Sign up today and start tracking your expenses.
          </p>
          <Link
            href="/auth/signup"
            className="px-8 py-3 bg-[#78A083] text-white rounded-md hover:bg-[#50727B] transition duration-200 text-lg font-medium"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-[#35374B]">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <p>© 2025 BudgetGuard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
