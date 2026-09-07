import { describe, expect, it } from 'vitest';
import { parseTutorJson } from './tutor';

describe('parseTutorJson', () => {
	it('extracts JSON from a surrounding prose blob', () => {
		const parsed = parseTutorJson(
			'Sure.\n{"explanation":"hi","codeExample":"x","commonMistakes":["a"],"nextTopicsToLearn":["b"],"encouragement":"go","difficulty":"beginner","concepts":["c"]}\n'
		);
		expect(parsed.explanation).toBe('hi');
		expect(parsed.codeExample).toBe('x');
		expect(parsed.commonMistakes).toEqual(['a']);
	});

	it('throws when no object is present', () => {
		expect(() => parseTutorJson('no json here')).toThrow('PARSE_ERROR');
	});
});
