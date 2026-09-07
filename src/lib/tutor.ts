export const LANGUAGES = [
	'JavaScript',
	'Python',
	'TypeScript',
	'HTML/CSS',
	'SQL',
	'Java',
	'C++',
	'Go',
	'Rust'
] as const;

export const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export type Language = (typeof LANGUAGES)[number];
export type Level = (typeof LEVELS)[number];
export type PhosphorTheme = 'phosphor' | 'amber' | 'cyan';

export interface TutorRequest {
	question: string;
	code?: string;
	language?: string;
	level?: string;
}

export interface TutorResponse {
	explanation: string;
	codeExample?: string;
	commonMistakes: string[];
	nextTopicsToLearn: string[];
	encouragement: string;
	difficulty: string;
	concepts: string[];
}

export function parseTutorJson(text: string): TutorResponse {
	const match = text.trim().match(/\{[\s\S]*\}/);
	if (!match) {
		throw new Error('PARSE_ERROR');
	}
	const raw = JSON.parse(match[0]) as Partial<TutorResponse>;
	return {
		explanation: String(raw.explanation ?? ''),
		codeExample: raw.codeExample ? String(raw.codeExample) : undefined,
		commonMistakes: Array.isArray(raw.commonMistakes)
			? raw.commonMistakes.map(String)
			: [],
		nextTopicsToLearn: Array.isArray(raw.nextTopicsToLearn)
			? raw.nextTopicsToLearn.map(String)
			: [],
		encouragement: String(raw.encouragement ?? ''),
		difficulty: String(raw.difficulty ?? 'beginner'),
		concepts: Array.isArray(raw.concepts) ? raw.concepts.map(String) : []
	};
}

export function demoLesson(question: string, language: string, level: string): TutorResponse {
	return {
		explanation:
			`Night school is running in LOCAL DEMO MODE (no ANTHROPIC_API_KEY).\n\n` +
			`You asked about ${language} at a ${level} level:\n“${question}”\n\n` +
			`A Socratic tutor would not dump the answer. First: what does the computer actually do, step by step, with the values you already know? Trace one tiny input on paper. Then compare that trace to what you expected. The gap between those two stories is the lesson.`,
		codeExample:
			`// Trace first, then code.\nfunction greet(name) {\n  return \`hello, \${name}\`;\n}\n\nconsole.log(greet('night school'));`,
		commonMistakes: [
			'Reading the whole program instead of one line at a time.',
			'Assuming the computer remembers intent instead of state.',
			'Skipping the smallest failing example.'
		],
		nextTopicsToLearn: [
			'How values move through a call stack',
			'The difference between syntax errors and logic errors',
			'Writing a failing test before the fix'
		],
		encouragement:
			'The lab is empty and the CRT is warm. Stay with the smallest question until it clicks.',
		difficulty: level || 'beginner',
		concepts: ['mental models', 'tracing', language.toLowerCase()]
	};
}
