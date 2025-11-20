export interface Question {
  num1: number;
  num2: number;
  answer: number;
  userAnswer?: number;
  isCorrect?: boolean;
}

export interface QuizHistory {
  date: string;
  score: number;
  totalQuestions: number;
}

export enum AppView {
  HOME = 'HOME',
  PRACTICE = 'PRACTICE',
  TWO_PLAYER = 'TWO_PLAYER',
  GRID = 'GRID',
  STATS = 'STATS'
}

export interface MathTipResponse {
  tip: string;
  trick: string;
}