"use client";

import React, { useState } from "react";
import {
  Layout,
  Input,
  Button,
  List,
  Typography,
  Card,
  Radio,
  Space,
  message as antdMessage,
} from "antd";

const { Header, Content, Footer } = Layout;
const { Text, Paragraph } = Typography;
const { TextArea } = Input;

type DirectPayload = string;

type MathStep = {
  stepNumber: number;
  explanation: string;
  substeps?: string[];
};

type MathPayload = {
  question: string;
  steps: MathStep[];
  finalAnswer: string;
};

type QuizPayload = {
  topic: string;
  question: string;
  choices: string[];
  correctIndex: number;
};

type UsedTool = "direct" | "showMathsStepsTool" | "askQuizQuestionTool";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  usedTool?: UsedTool;
  payload: DirectPayload | MathPayload | QuizPayload;
  selectedIndex?: number;
  isCorrect?: boolean;
};

const uuid = () => crypto.randomUUID();

function MathStepsRenderer({ data }: { data: MathPayload }) {
  return (
    <Card size="small" title={data.question} style={{ width: "100%" }}>
      <ol style={{ paddingLeft: 20 }}>
        {data.steps.map((s) => (
          <li key={s.stepNumber}>
            <Paragraph style={{ marginBottom: 4 }}>{s.explanation}</Paragraph>
            {s.substeps && s.substeps.length > 0 && (
              <ul style={{ paddingLeft: 20, marginBottom: 8 }}>
                {s.substeps.map((sub, idx) => (
                  <li key={idx}>
                    <Text>{sub}</Text>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
      <Paragraph strong>Final Answer: {data.finalAnswer}</Paragraph>
    </Card>
  );
}

function QuizRenderer({
  data,
  onSelect,
  selectedIndex,
  isCorrect,
}: {
  data: QuizPayload;
  onSelect: (i: number) => void;
  selectedIndex?: number;
  isCorrect?: boolean;
}) {
  return (
    <Card size="small" title={data.question} style={{ width: "100%" }}>
      <Radio.Group
        onChange={(e) => onSelect(e.target.value)}
        value={selectedIndex}
        style={{ width: "100%" }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {data.choices.map((choice, idx) => {
            const chosen = selectedIndex === idx;
            const showColor =
              typeof isCorrect === "boolean" && chosen
                ? isCorrect
                  ? "green"
                  : "red"
                : undefined;
            return (
              <Card
                key={idx}
                size="small"
                style={{
                  borderColor: showColor,
                  background: chosen ? "#fafafa" : undefined,
                  cursor: "pointer",
                }}
              >
                <Radio value={idx}>
                  <Text style={{ color: showColor }}>{choice}</Text>
                </Radio>
              </Card>
            );
          })}
        </Space>
      </Radio.Group>
      {typeof isCorrect === "boolean" && (
        <Paragraph
          style={{ marginTop: 12 }}
          type={isCorrect ? "success" : "danger"}
        >
          {isCorrect ? "Correct!" : "Incorrect."}
        </Paragraph>
      )}
    </Card>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setSending(true);

    const userMsg: ChatMessage = {
      id: uuid(),
      role: "user",
      payload: trimmed,
    };
    setMessages((m) => [...m, userMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: trimmed }),
      });
      const data = await res.json();

      // data: { usedTool, output }
      const assistantMsg: ChatMessage = {
        id: uuid(),
        role: "assistant",
        usedTool: data.usedTool ?? "direct",
        payload: data.output,
      };
      setMessages((m) => [...m, assistantMsg]);
    } catch (err) {
      console.error(err);
      antdMessage.error("Failed to send");
    } finally {
      setSending(false);
      setInput("");
    }
  };

  const handleQuizSelect = (msgId: string, index: number) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const p = m.payload as QuizPayload;
        const correct = p.correctIndex === index;
        return { ...m, selectedIndex: index, isCorrect: correct };
      })
    );
  };

  return (
    <Layout style={{ height: "100vh" }}>
      <Header style={{ color: "#fff" }}>Chat Demo</Header>
      <Content style={{ padding: 24, overflowY: "auto" }}>
        <List
          dataSource={messages}
          renderItem={(msg) => {
            const isUser = msg.role === "user";
            return (
              <List.Item style={{ border: "none", padding: "8px 0" }}>
                <div
                  style={{
                    width: "100%",
                    textAlign: isUser ? "right" : "left",
                  }}
                >
                  {isUser ? (
                    <Card
                      size="small"
                      style={{
                        display: "inline-block",
                        background: "#e6f7ff",
                        maxWidth: "80%",
                        textAlign: "left",
                      }}
                    >
                      <Text>{msg.payload as string}</Text>
                    </Card>
                  ) : (
                    renderAssistantMessage(msg, handleQuizSelect)
                  )}
                </div>
              </List.Item>
            );
          }}
        />
      </Content>
      <Footer style={{ padding: 12 }}>
        <Space.Compact style={{ width: "100%" }}>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoSize={{ minRows: 1, maxRows: 4 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask something..."
          />
          <Button type="primary" loading={sending} onClick={send}>
            Send
          </Button>
        </Space.Compact>
      </Footer>
    </Layout>
  );
}

function renderAssistantMessage(
  msg: ChatMessage,
  onQuizSelect: (msgId: string, idx: number) => void
) {
  switch (msg.usedTool) {
    case "showMathsStepsTool":
      return <MathStepsRenderer data={msg.payload as MathPayload} />;

    case "askQuizQuestionTool": {
      const quiz = msg.payload as QuizPayload;
      return (
        <QuizRenderer
          data={quiz}
          selectedIndex={msg.selectedIndex}
          isCorrect={msg.isCorrect}
          onSelect={(i) => onQuizSelect(msg.id, i)}
        />
      );
    }

    default:
      return (
        <Card size="small" style={{ display: "inline-block", maxWidth: "80%" }}>
          <Text>{msg.payload as string}</Text>
        </Card>
      );
  }
}
