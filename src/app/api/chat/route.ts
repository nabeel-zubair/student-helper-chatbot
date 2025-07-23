import { NextRequest, NextResponse } from "next/server";
import { invokeAgent } from "@/lib/agent";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();

    const result = await invokeAgent(input);

    let usedTool = "direct";
    let output = result.output;

    if (result.intermediateSteps?.length) {
      const last =
        result.intermediateSteps[result.intermediateSteps.length - 1];
      usedTool = last.action.tool;
      try {
        output = JSON.parse(last.observation);
      } catch {
        output = last.observation;
      }
    }

    return NextResponse.json({ usedTool, output });
  } catch (e) {
    console.error("Agent error:", e);
    return NextResponse.json({ error: "Agent failed" }, { status: 500 });
  }
}
