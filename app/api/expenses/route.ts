import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { cookies } from "next/headers";

// Get all expenses for the logged-in user
export async function GET(request: Request) {
  try {
    // Get user ID from session
    const cookieStore = await cookies();
    const userId = cookieStore.get("session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const period = url.searchParams.get("period");
    const fromDate = url.searchParams.get("from");
    const toDate = url.searchParams.get("to");

    // Calculate date range based on period
    let startDate: Date | undefined;
    let endDate: Date = new Date();

    // Set end date to end of today
    endDate.setUTCHours(23, 59, 59, 999);

    if (fromDate && toDate) {
      // Custom date range
      startDate = new Date(fromDate);
      startDate.setUTCHours(0, 0, 0, 0);
      endDate = new Date(toDate);
      endDate.setUTCHours(23, 59, 59, 999);
    } else if (period) {
      // Predefined periods
      const now = new Date();

      switch (period) {
        case "day": {
          // Today - start of day to end of day in UTC
          startDate = new Date();
          startDate.setUTCHours(0, 0, 0, 0);
          endDate = new Date();
          endDate.setUTCHours(23, 59, 59, 999);

          console.log("Today filter - start:", startDate.toISOString());
          console.log("Today filter - end:", endDate.toISOString());
          break;
        }
        case "week": {
          // Current week (Monday to Sunday)
          startDate = new Date(now);
          const dayOfWeek = startDate.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
          const diff =
            startDate.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
          startDate.setUTCDate(diff);
          startDate.setUTCHours(0, 0, 0, 0);
          break;
        }
        case "month": {
          // Current month
          startDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1);
          startDate.setUTCHours(0, 0, 0, 0);
          break;
        }
        case "year": {
          // Current year
          startDate = new Date(now.getUTCFullYear(), 0, 1);
          startDate.setUTCHours(0, 0, 0, 0);
          break;
        }
      }
    }

    // Build where condition
    const whereCondition: any = { userId };

    if (startDate && endDate) {
      whereCondition.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Query expenses with the where condition
    const expenses = await prisma.expense.findMany({
      where: whereCondition,
      include: {
        category: true,
      },
      orderBy: {
        date: "desc", // Sort by date, newest first
      },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Something went wrong fetching expenses" },
      { status: 500 }
    );
  }
}

// Create a new expense
export async function POST(request: Request) {
  try {
    // Get user ID from session
    const cookieStore = await cookies();
    const userId = cookieStore.get("session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, description, date, categoryId } = body;

    // Validate input
    if (!amount || !date || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Parse date correctly and ensure it's in UTC
    let expenseDate: Date;
    try {
      expenseDate = new Date(date);
      // Check if valid date
      if (isNaN(expenseDate.getTime())) {
        throw new Error("Invalid date");
      }
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    // Create expense
    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        description,
        date: expenseDate,
        categoryId,
        userId,
      },
      include: {
        category: true,
      },
    });

    console.log("Created expense with date:", expense.date);
    return NextResponse.json(expense);
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Something went wrong creating expense" },
      { status: 500 }
    );
  }
}
