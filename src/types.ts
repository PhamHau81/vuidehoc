export type GradeNumber = 10 | 11 | 12;

export type QuestionFormat = 'multiple_choice_4' | 'true_false_4' | 'short_answer';

export type QuestionDifficulty = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';

export interface MultipleChoiceOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface TrueFalseStatement {
  id: 'a' | 'b' | 'c' | 'd';
  statement: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  grade: GradeNumber;
  chapterId: string;
  format: QuestionFormat;
  difficulty: QuestionDifficulty;
  content: string;
  options?: MultipleChoiceOption[];
  subQuestions?: TrueFalseStatement[];
  correctAnswer?: string; // e.g. 'A' or '13.27'
  hints: string[];
  solution: string;
}

export interface Chapter {
  id: string;
  grade: GradeNumber;
  name: string;
  lessons?: string[];
  theory: string;
  questions: Question[];
}

export interface StatGroup {
  min: number;
  max: number;
  freq: number;
}

export interface ExamQuestion {
  id: string;
  part: 'I' | 'II' | 'III';
  format: QuestionFormat;
  content: string;
  difficulty: QuestionDifficulty;
  options?: MultipleChoiceOption[];
  subQuestions?: TrueFalseStatement[];
  correctAnswer?: string;
  solution?: string;
}

export interface ExamSubmission {
  scoreOutOf10: number;
  totalCorrect: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  completedAt: string;
}
