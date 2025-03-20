import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/app/components/Navbar";
import ExpenseList from "@/app/components/ExpenseList";
import ExpenseStats from "@/app/components/ExpenseStats";
import ExpenseForm from "@/app/components/ExpenseForm";
import DashboardTabs from "@/app/components/DashboardTabs";
import { getSession } from "@/app/lib/session";

export default async function DashboardPage() {
  const user = await getSession();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-[#344955] text-white">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Stats and Expense List */}
          <div className="lg:col-span-2 space-y-6">
            <Suspense
              fallback={
                <div className="p-8 bg-[#35374B] rounded-lg shadow-md">
                  Loading statistics...
                </div>
              }
            >
              <ExpenseStats />
            </Suspense>

            <Suspense
              fallback={
                <div className="p-8 bg-[#35374B] rounded-lg shadow-md">
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
