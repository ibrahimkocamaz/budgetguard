import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    // Get user ID from session
    const cookieStore = await cookies();
    const userId = cookieStore.get("session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const period = url.searchParams.get("period") || "month";

    // Parse date range if provided
    const fromDate = url.searchParams.get("from") || null;
    const toDate = url.searchParams.get("to") || null;

    // Get current date for calculations
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date();
    endDate.setUTCHours(23, 59, 59, 999); // Set end date to end of today

    // If custom date range is provided
    if (fromDate && toDate) {
      startDate = new Date(fromDate);
      startDate.setUTCHours(0, 0, 0, 0);
      endDate = new Date(toDate);
      endDate.setUTCHours(23, 59, 59, 999);
    } else {
      // Calculate based on period
      switch (period) {
        case "day":
          // Today - full day range in UTC
          startDate = new Date();
          startDate.setUTCHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setUTCHours(23, 59, 59, 999);
          break;
        case "week": {
          // Calculate the first day of current week (Monday)
          startDate = new Date(now);
          const dayOfWeek = startDate.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
          const diff =
            startDate.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
          startDate.setUTCDate(diff);
          startDate.setUTCHours(0, 0, 0, 0);
          break;
        }
        case "month":
          // First day of current month
          startDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1);
          startDate.setUTCHours(0, 0, 0, 0);
          break;
        case "year":
          // First day of current year
          startDate = new Date(now.getUTCFullYear(), 0, 1);
          startDate.setUTCHours(0, 0, 0, 0);
          break;
        default:
          startDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1);
          startDate.setUTCHours(0, 0, 0, 0);
      }
    }

    // For debug purposes
    console.log("Period:", period);
    console.log("Start date:", startDate.toISOString());
    console.log("End date:", endDate.toISOString());

    // Get total expenses for the period
    const totalExpenses = await prisma.expense.aggregate({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get expenses by category
    const expensesByCategory = await prisma.expense.groupBy({
      by: ["categoryId"],
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get category names
    const categoryIds = expensesByCategory.map((item) => item.categoryId);
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Combine expenses with category names
    const categoryExpenses = expensesByCategory.map((item) => {
      const category = categories.find((cat) => cat.id === item.categoryId);
      return {
        category: category?.name || "Unknown",
        amount: item._sum.amount,
      };
    });

    return NextResponse.json({
      total: totalExpenses._sum.amount || 0,
      byCategory: categoryExpenses,
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Something went wrong fetching stats" },
      { status: 500 }
    );
  }
}
