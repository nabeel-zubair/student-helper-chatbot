import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { MathSolutionSchema } from "@/schema";

const showMathsStepsTool = new DynamicStructuredTool({
  name: "showMathsStepsTool",
  description:
    "Takes a math question and returns a structured, numbered solution with optional bullet substeps.",
  schema: z.object({
    question: z.string().describe("The exact math question to solve."),
  }),
  func: async ({ question }) => {
    const pro = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-pro",
      apiKey: process.env.GOOGLE_API_KEY!,
      temperature: 0,
    });

    const structuredModel = pro.withStructuredOutput(MathSolutionSchema);

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You solve math problems step-by-step.
  Use the model's built-in code execution to do exact calculations (no hand-wavy arithmetic).
  Return ONLY valid JSON that matches the provided schema.`,
      ],
      ["user", "Question: {question}"],
    ]);

    const chain = prompt.pipe(structuredModel);

    const result = await chain.invoke({ question });
    return JSON.stringify(result);
  },
});

export default showMathsStepsTool;
