/** Shared with the tutor form so the client cannot submit more than the API accepts. */
export const QUESTION_MAX = 2_000;
export const CODE_MAX = 12_000;

export const LANGUAGES = [
  "JavaScript",
  "Python",
  "TypeScript",
  "HTML/CSS",
  "React",
  "SQL",
  "Java",
  "C++",
] as const;

export const LEVELS = ["beginner", "intermediate", "advanced"] as const;
