import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { createToolCallingAgent, AgentExecutor } from 'langchain/agents';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';

import { showMathsStepsTool, askQuizQuestionTool } from './tools';

let executorPromise: Promise<AgentExecutor> | null = null;

async function buildExecutor() {
  const tools = [showMathsStepsTool, askQuizQuestionTool];

  const llm = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash',
    apiKey: process.env.GOOGLE_API_KEY!,
    temperature: 0,
  });

  const llmWithTools = llm.bindTools(tools);

  const toolList = tools.map((t) => `- ${t.name}: ${t.description}`).join('\n');

  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are a routing assistant. You may call AT MOST ONE tool.

TOOLS:
${toolList}

ROUTING RULES:
- If the user asks for step-by-step math, solving equations, derivations → call showMathsStepsTool.
- If the user wants a multiple-choice question / quiz / test / “quiz me on …” → call askQuizQuestionTool.
- Otherwise, answer directly without any tool.
- If you call a tool, return ONLY the tool's output with no extra words.

EXAMPLES:
User: "Can you quiz me on the water cycle?"
Assistant: (call askQuizQuestionTool)

User: "Show me the steps to solve 2x + 3 = 11"
Assistant: (call showMathsStepsTool)

User: "What's the capital of France?"
Assistant: (answer directly)`,
    ],
    ['user', '{input}'],
    new MessagesPlaceholder('agent_scratchpad'),
  ]);

  const agent = await createToolCallingAgent({
    llm: llmWithTools,
    tools,
    prompt,
  });

  return new AgentExecutor({
    agent,
    tools,
    maxIterations: 3,
    returnIntermediateSteps: true,
  });
}

export async function invokeAgent(input: string) {
  if (!executorPromise) executorPromise = buildExecutor();
  const executor = await executorPromise;
  return executor.invoke({ input });
}
