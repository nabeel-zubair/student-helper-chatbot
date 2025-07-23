export const runtime = "nodejs";

import { z } from "zod";
import { askQuizQuestionTool } from "@/lib/tools";
import { QuizQuestionSchema } from "@/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();
    if (!topic)
      return NextResponse.json({ error: "Missing 'topic'" }, { status: 400 });
    if (!process.env.GOOGLE_API_KEY)
      return NextResponse.json(
        { error: "Missing GOOGLE_API_KEY" },
        { status: 500 }
      );

    const jsonString = await askQuizQuestionTool.func({ topic });
    const parsed = JSON.parse(jsonString) as z.infer<typeof QuizQuestionSchema>;

    const { question, choices, correctIndex } = parsed;

    return NextResponse.json({ question, choices, correctIndex });
  } catch (err) {
    console.error("Quiz route error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
