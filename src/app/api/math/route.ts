export const runtime = "nodejs";

import { showMathsStepsTool } from "@/lib/tools";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    if (!question) {
      return NextResponse.json(
        { error: "Missing 'question' field" },
        { status: 400 }
      );
    }
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: "Missing GOOGLE_API_KEY" },
        { status: 500 }
      );
    }

    const jsonString = await showMathsStepsTool.func({ question });

    const payload = JSON.parse(jsonString);
    return NextResponse.json(payload);
  } catch (err) {
    console.error("Math route error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
