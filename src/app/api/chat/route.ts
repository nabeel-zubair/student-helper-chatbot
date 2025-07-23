import { NextRequest, NextResponse } from "next/server";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export async function POST(req: NextRequest) {
  const { input } = await req.json();

  if (!process.env.GOOGLE_API_KEY) {
    return NextResponse.json(
      { error: "Missing Google API key" },
      { status: 500 }
    );
  }

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    apiKey: process.env.GOOGLE_API_KEY!,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant."],
    ["user", "{input}"],
  ]);

  const chain = prompt.pipe(model).pipe(new StringOutputParser());

  try {
    const response = (await chain.invoke({ input })).trim();
    return NextResponse.json({ output: response });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error generating response" },
      { status: 500 }
    );
  }
}
