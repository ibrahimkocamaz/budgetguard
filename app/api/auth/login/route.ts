import { NextResponse } from "next/server";
import { comparePasswords } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";
import { cookies } from "next/headers";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

// Force API routes to be dynamically rendered
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    console.log("Login API route called");

    const body = await request.json();
    const { email, password } = body;

    console.log("Attempting login for email:", email);

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("User not found:", email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log("User found, verifying password");

    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password);

    if (!isPasswordValid) {
      console.log("Invalid password for user:", email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log("Password valid, setting cookie");

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
  } catch (error: unknown) {
    console.error("Error during login:", error);

    // Provide more detailed error information
    let errorMessage = "Something went wrong during login";
    let errorDetails = {};

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = {
        name: error.name,
        stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
      };
    }

    // Check for Prisma-specific errors
    if (error instanceof PrismaClientKnownRequestError) {
      errorMessage = "Database error occurred. Please try again later.";
      if (process.env.NODE_ENV !== "production") {
        errorDetails = {
          code: error.code,
          meta: error.meta,
          message: error.message,
        };
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details:
          process.env.NODE_ENV !== "production" ? errorDetails : undefined,
      },
      { status: 500 }
    );
  }
}
