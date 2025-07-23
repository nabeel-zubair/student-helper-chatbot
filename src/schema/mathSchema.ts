import { z } from "zod";

const MathSolutionSchema = z.object({
  question: z.string().describe("The original math question."),
  steps: z
    .array(
      z.object({
        stepNumber: z.number().describe("1-based step index."),
        explanation: z
          .string()
          .describe("Plain-English explanation of what happens in this step."),
        substeps: z
          .array(z.string())
          .optional()
          .describe("Optional bullet substeps."),
      })
    )
    .min(1),
  finalAnswer: z.string().describe("The final numeric or algebraic answer."),
});

export default MathSolutionSchema;
