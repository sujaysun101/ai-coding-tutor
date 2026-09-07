import Anthropic from '@anthropic-ai/sdk';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { demoLesson, parseTutorJson } from '$lib/tutor';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as {
		code?: string;
		question?: string;
		language?: string;
		level?: string;
	};

	const question = (body.question ?? '').trim();
	if (!question) {
		return json({ error: 'Question is required.' }, { status: 400 });
	}

	const language = body.language || 'JavaScript';
	const level = body.level || 'beginner';
	const code = body.code?.trim();

	if (!env.ANTHROPIC_API_KEY) {
		return json(
			{ ...demoLesson(question, language, level), mode: 'demo' },
			{ headers: { 'x-tutor-mode': 'demo' } }
		);
	}

	const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
	const codeContext = code
		? `\n\nStudent's code:\n\`\`\`${language}\n${code}\n\`\`\``
		: '';

	try {
		const message = await client.messages.create({
			model: 'claude-sonnet-4-6',
			max_tokens: 3000,
			messages: [
				{
					role: 'user',
					content: `You are a patient, encouraging coding tutor for bootcamp students, speaking like a night-school lab instructor sitting next to a CRT. The student is at a ${level} level learning ${language}.${codeContext}

Student question: ${question}

Provide a Socratic, guided explanation. Don't just give the answer — help them understand the concept. Return JSON only:
{
  "explanation": "clear, friendly explanation with analogies",
  "codeExample": "working code example if helpful (as a string)",
  "commonMistakes": ["mistake1", "mistake2"],
  "nextTopicsToLearn": ["topic1", "topic2"],
  "encouragement": "motivational message",
  "difficulty": "beginner|intermediate|advanced",
  "concepts": ["concept1", "concept2"]
}`
				}
			]
		});

		const content = message.content[0];
		if (content.type !== 'text') {
			return json({ error: 'No response from tutor.' }, { status: 500 });
		}

		return json({ ...parseTutorJson(content.text), mode: 'live' });
	} catch (err) {
		const fallback = demoLesson(question, language, level);
		fallback.encouragement =
			'The live tutor line is down, so this is a local lesson. Check ANTHROPIC_API_KEY and try the bench again.';
		return json(
			{
				...fallback,
				mode: 'demo',
				errorDetail: err instanceof Error ? err.message : 'tutor_failed'
			},
			{ headers: { 'x-tutor-mode': 'demo' } }
		);
	}
};
