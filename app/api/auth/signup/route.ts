import { NextResponse } from "next/server";
import { hashPassword } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Create default categories for the user
    const defaultCategories = [
      "Bills",
      "Food",
      "Transportation",
      "Entertainment",
      "Shopping",
    ];

    await Promise.all(
      defaultCategories.map((categoryName) =>
        prisma.category.create({
          data: {
            name: categoryName,
            userId: user.id,
          },
        })
      )
    );

    // Return the user without the password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Error during signup:", error);
    return NextResponse.json(
      { error: "Something went wrong during signup" },
      { status: 500 }
    );
  }
}
