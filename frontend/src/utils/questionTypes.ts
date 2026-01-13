export const KNOWN_QUESTION_TYPES = ['multi', 'boolean', 'slide'] as const;
export type KnownQuestionType = typeof KNOWN_QUESTION_TYPES[number];
export type QuestionType = KnownQuestionType | 'unknown';

const normalize = (value?: string | null) => String(value || '').trim().toLowerCase();

export const normalizeQuestionType = (value?: string | null): QuestionType => {
  const normalized = normalize(value);
  if (!normalized) return 'multi';
  if (normalized === 'truefalse' || normalized === 'true_false' || normalized === 'tf') return 'boolean';
  if (normalized === 'slide' || normalized === 'info' || normalized === 'info_slide') return 'slide';
  if (normalized === 'boolean' || normalized === 'two' || normalized === '2') return 'boolean';
  if (normalized === 'multi' || normalized === 'multi4' || normalized === 'four' || normalized === '4') return 'multi';
  if (KNOWN_QUESTION_TYPES.includes(normalized as KnownQuestionType)) return normalized as KnownQuestionType;
  return 'unknown';
};

export const getQuestionType = (question: any): QuestionType => {
  return normalizeQuestionType(question?.type ?? question?.question_type ?? question?.questionType);
};

export const getPlayableQuestionType = (question: any): KnownQuestionType => {
  const type = getQuestionType(question);
  return type === 'unknown' ? 'multi' : type;
};

export const isSlideQuestion = (question: any): boolean => getPlayableQuestionType(question) === 'slide';
export const isBooleanQuestion = (question: any): boolean => getPlayableQuestionType(question) === 'boolean';
