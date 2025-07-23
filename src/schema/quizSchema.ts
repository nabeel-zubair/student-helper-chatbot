import { z } from "zod";

const QuizQuestionSchema = z.object({
  topic: z.string().describe("The original topic provided."),
  question: z.string().describe("The multiple-choice question text."),
  choices: z
    .array(z.string())
    .length(4)
    .describe("Exactly four answer choices."),
  correctIndex: z
    .number()
    .int()
    .min(0)
    .max(3)
    .describe("0-based index of the correct choice."),
});

export default QuizQuestionSchema;
