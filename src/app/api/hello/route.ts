import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "Hello from the MeAI API!",
    version: "1.1.0",
    timestamp: new Date().toISOString(),
    status: "healthy",
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({
    received: body,
    processedAt: new Date().toISOString(),
  });
}
