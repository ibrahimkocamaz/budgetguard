import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { cookies } from "next/headers";

// DELETE a category by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First check if the category exists
    const category = await prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if any expenses are using this category
    const expensesUsingCategory = await prisma.expense.count({
      where: {
        categoryId: id,
      },
    });

    if (expensesUsingCategory > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete category with expenses",
          count: expensesUsingCategory,
        },
        { status: 409 }
      );
    }

    // Delete the category
    await prisma.category.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
