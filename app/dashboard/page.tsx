import { Suspense } from "react";
import Navbar from "@/app/components/Navbar";
import ExpenseStats from "@/app/components/ExpenseStats";
import ExpenseList from "@/app/components/ExpenseList";
import ExpenseForm from "@/app/components/ExpenseForm";
import { getSession } from "@/app/lib/session";
import DashboardTabs from "@/app/components/DashboardTabs";

export default async function DashboardPage() {
  const user = await getSession();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Stats and Expense List */}
          <div className="lg:col-span-2 space-y-6">
            <Suspense
              fallback={
                <div className="p-8 bg-white rounded-lg shadow-md">
                  Loading statistics...
                </div>
              }
            >
              <ExpenseStats />
            </Suspense>

            <Suspense
              fallback={
                <div className="p-8 bg-white rounded-lg shadow-md">
                  Loading expenses...
                </div>
              }
            >
              <DashboardTabs />
            </Suspense>
          </div>

          {/* Sidebar - Add Expense Form */}
          <div>
            <ExpenseForm />
          </div>
        </div>
      </div>
    </div>
  );
}
