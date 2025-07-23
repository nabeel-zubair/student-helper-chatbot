import { z } from "zod";
import { QuizQuestionSchema } from "@/schema";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatPromptTemplate } from "@langchain/core/prompts";

const askQuizQuestionTool = new DynamicStructuredTool({
  name: "askQuizQuestionTool",
  description:
    "Create one multiple-choice question (4 choices) for a given topic. Mark the correct choice in the JSON but do NOT reveal it to the user.",
  schema: z.object({
    topic: z
      .string()
      .describe("The subject or topic to generate the question about."),
  }),
  func: async ({ topic }) => {
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-pro",
      apiKey: process.env.GOOGLE_API_KEY!,
      temperature: 0.5,
    });

    const structured = model.withStructuredOutput(QuizQuestionSchema);

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You create exactly ONE multiple-choice question (4 choices) for the given topic.
  Return ONLY JSON matching the schema.
  Do not include explanations, just the fields.
  Ensure exactly four choices and a correctIndex inside 0-3.`,
      ],
      ["user", "Topic: {topic}"],
    ]);

    const chain = prompt.pipe(structured);
    const result = await chain.invoke({ topic });

    return JSON.stringify(result);
  },
});

export default askQuizQuestionTool;
