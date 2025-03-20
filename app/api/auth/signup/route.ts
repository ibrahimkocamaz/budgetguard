import { NextResponse } from "next/server";
import { hashPassword } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { cookies } from "next/headers";

// Force API routes to be dynamically rendered
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    console.log("Signup API route called");

    const body = await request.json();
    const { email, password, name } = body;

    console.log("Attempting signup for email:", email);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("User already exists:", email);
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    console.log("Email available, hashing password");

    // Hash password
    const hashedPassword = await hashPassword(password);

    console.log("Creating new user");

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    console.log("User created, creating default categories");

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

    console.log("Default categories created, setting cookie");

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("session", user.id, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: "lax", // Changed from 'strict' to 'lax' for better cross-domain compatibility
      secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS in production
    });

    console.log("Session cookie set, returning user data");

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Error during signup:", error);
    return NextResponse.json(
      { error: "Something went wrong during signup" },
      { status: 500 }
    );
  }
}
