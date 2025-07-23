# 🔮 AI Assistant – LangChain + Gemini + Next.js

A full-stack AI assistant using:

- **LangChain** with tools
- **Gemini 1.5 Flash** and **Gemini 1.5 Pro**
- **Next.js App Router** for backend and frontend
- **Ant Design** for clean UI

## 🧠 Features

- Gemini Flash for fast reasoning
- Gemini Pro for structured tool responses
- LangChain agent to decide when to use a tool
- `showMathsStepsTool` – step-by-step math solutions
- `askQuizQuestionTool` – auto-generated quiz questions
- Chat UI:
  - Normal answers in message bubbles
  - Math steps rendered as numbered lists
  - Quiz rendered as clickable options with answer validation

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

---

## 🔐 Environment Setup

### 1. Create `.env.local`

In your project root, create a `.env.local` file:

```bash
touch .env.local
```

### 2. Add your Google API key

```env
GOOGLE_API_KEY=your_google_api_key_here
```

> ✅ Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)  
> ✅ Enable both `gemini-2.5-flash` and `gemini-2.5-pro`  
> ⚠️ Do **not** use `NEXT_PUBLIC_` prefix

---

## ▶️ Run the App

```bash
npm run dev
# or
yarn dev
```

Visit:

```bash
http://localhost:3000/chat
```

---

## 💬 Frontend Behavior

When you visit `/chat`, the app:

- Sends input to `/api/chat`
- The agent chooses whether to:
  - Respond directly (Gemini Flash)
  - Use `showMathsStepsTool` (Gemini Pro)
  - Use `askQuizQuestionTool` (Gemini Pro)

### Render Types

| Tool Used             | UI Type                         |
| --------------------- | ------------------------------- |
| `direct`              | Plain chat bubble               |
| `showMathsStepsTool`  | Numbered list + bullet substeps |
| `askQuizQuestionTool` | Card with 4 answer buttons      |

---

## 🧪 Testing Instructions

### 1. Tool: Step-by-Step Math Solver

**Input:**

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"input": "Solve 2x + 3 = 11"}'
```

**Expected Output:**

```json
{
  "usedTool": "showMathsStepsTool",
  "output": {
    "question": "2x + 3 = 11",
    "steps": [
      {
        "stepNumber": 1,
        "explanation": "Subtract 3 from both sides.",
        "substeps": []
      },
      {
        "stepNumber": 2,
        "explanation": "Divide both sides by 2.",
        "substeps": []
      }
    ],
    "finalAnswer": "x = 4"
  }
}
```

---

### 2. Tool: Quiz Generator

**Input:**

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"input": "Can you quiz me on the water cycle?"}'
```

**Expected Output:**

```json
{
  "usedTool": "askQuizQuestionTool",
  "output": {
    "topic": "water cycle",
    "question": "Which process is part of the water cycle?",
    "choices": [
      "Evaporation",
      "Photosynthesis",
      "Condensation",
      "Fermentation"
    ],
    "correctIndex": 0
  }
}
```

---

### 3. Tool-free (direct LLM) response

**Input:**

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"input": "What is the capital of Pakistan?"}'
```

**Expected Output:**

```json
{
  "usedTool": "direct",
  "output": "The capital of Pakistan is Islamabad."
}
```

---

## 🧠 Agent Logic Summary

- Uses `gemini-2.5-flash` by default
- Receives tools as input
- If Gemini Flash determines a tool is needed:
  - It calls that tool using LangChain's tool system
  - Output is structured as JSON (Zod-enforced)
- If no tool is used, LLM gives a plain answer

---

## 🧼 Troubleshooting

- **429 Too Many Requests**

  > Your API key has hit free quota. Enable billing at [console.cloud.google.com](https://console.cloud.google.com) or try again later.

- **Missing input variable errors**

  > Ensure prompt variables (e.g., `{question}`) are provided to `chain.invoke(...)`.

- **Output not in JSON**
  > Tool schema likely not enforced. Ensure `withStructuredOutput(schema)` is used in the tool.

---
