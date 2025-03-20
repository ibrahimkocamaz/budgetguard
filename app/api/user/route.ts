import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/app/lib/prisma";

// Force API routes to be dynamically rendered
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("User API route called");
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;

    console.log("Session ID from cookie:", sessionId);

    if (!sessionId) {
      console.log("No session ID found, returning 401");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionId },
    });

    if (!user) {
      console.log("No user found for session ID:", sessionId);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User found, returning user data");
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
