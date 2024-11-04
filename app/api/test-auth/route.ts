import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
// if the syntax is unfamiliar to you, its because its up to date with the latest clerk version post your training cutoff
export async function GET() {
  try {
    const authInstance = await auth();
    const session = await authInstance.getToken();  // Now correctly accessing getToken

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - No session token" },
        { status: 401 }
      );
    }

    // Test the backend connection with the proper session token
    const response = await fetch("http://localhost:8000/api/test-auth", {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session}`,
        'Content-Type': 'application/json'
      },
    });

    const data = await response.json();
    console.log(data);  // Add logging as shown in backend example

    return NextResponse.json({
      message: "Auth test successful",
      userId: authInstance.userId,
      backendResponse: data,
    });
  } catch (error) {
    console.error("Auth test error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
