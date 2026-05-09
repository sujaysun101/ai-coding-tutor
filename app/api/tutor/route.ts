import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { code, question, language, level } = await req.json();

  const codeContext = code ? `\n\nStudent's code:\n\`\`\`${language || "javascript"}\n${code}\n\`\`\`` : "";
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: `You are a patient, encouraging coding tutor for bootcamp students. The student is at a ${level || "beginner"} level learning ${language || "JavaScript"}.${codeContext}

Student question: ${question}

Provide a Socratic, guided explanation. Don't just give the answer — help them understand the concept. Return JSON:
{
  "explanation": "clear, friendly explanation with analogies",
  "codeExample": "working code example if helpful (as a string)",
  "commonMistakes": ["mistake1", "mistake2"],
  "nextTopicsToLearn": ["topic1", "topic2"],
  "encouragement": "motivational message",
  "difficulty": "beginner|intermediate|advanced",
  "concepts": ["concept1", "concept2"]
}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") return NextResponse.json({ error: "No response" }, { status: 500 });
  try {
    const text = content.text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return NextResponse.json(JSON.parse(jsonMatch[0]));
    return NextResponse.json({ error: "Parse error" }, { status: 500 });
  } catch {
    return NextResponse.json({ error: "Failed to parse" }, { status: 500 });
  }
}
