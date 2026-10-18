import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { capMaxTokens, formatZodError, guardDemoRequest, MAX_OUTPUT_TOKENS } from "@/lib/demo-guard";
import { CODE_MAX, LEVELS, LANGUAGES, QUESTION_MAX } from "@/lib/tutor-limits";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const bodySchema = z
  .object({
    question: z.string().trim().min(1).max(QUESTION_MAX),
    code: z.string().max(CODE_MAX).optional().default(""),
    language: z.enum(LANGUAGES).optional().default("JavaScript"),
    level: z.enum(LEVELS).optional().default("beginner"),
  })
  .strict();

export async function POST(req: NextRequest) {
  const blocked = await guardDemoRequest(req);
  if (blocked) return blocked;

  let json: unknown;
  try {
    const raw = await req.text();
    if (raw.length > QUESTION_MAX + CODE_MAX + 1_000) {
      return NextResponse.json({ error: "Request body is too large" }, { status: 400 });
    }
    json = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
  }

  const { question, code, language, level } = parsed.data;
  const codeContext = code ? `\n\nStudent's code:\n\`\`\`${language}\n${code}\n\`\`\`` : "";

  let message;
  try {
    message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: capMaxTokens(MAX_OUTPUT_TOKENS),
      messages: [
        {
          role: "user",
          content: `You are a patient, encouraging coding tutor for bootcamp students. The student is at a ${level} level learning ${language}.${codeContext}

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
  } catch {
    // Do not log this error. Provider failures can echo request metadata.
    return NextResponse.json({ error: "The tutoring request could not be completed" }, { status: 502 });
  }

  const content = message.content[0];
  if (!content || content.type !== "text") {
    return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
  }

  try {
    const text = content.text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return NextResponse.json(JSON.parse(jsonMatch[0]));
    return NextResponse.json({ error: "Parse error" }, { status: 500 });
  } catch {
    return NextResponse.json({ error: "Failed to parse" }, { status: 500 });
  }
}
