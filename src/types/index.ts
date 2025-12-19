// =====================================================
// AI Advanced LMS - Type Definitions
// =====================================================

// -----------------------------------------------------
// Module & Chapter Types
// -----------------------------------------------------

export interface Module {
  id: string;
  title: string;
  titleKo: string;
  description: string;
  icon: string;
  order: number;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  moduleId: string;
  title: string;
  slug: string;
  order: number;
  description?: string;
  content?: string;
  summary?: string;
  codeBlocks?: CodeBlock[];
  quiz?: Quiz;
}

// -----------------------------------------------------
// Code Execution Types
// -----------------------------------------------------

export interface CodeBlock {
  id: string;
  code: string;
  language: "python" | "javascript" | "bash" | "json" | "markdown";
  editable: boolean;
  expectedOutput?: string;
  title?: string;
}

export interface CodeExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime?: number;
}

// -----------------------------------------------------
// Quiz Types
// -----------------------------------------------------

export interface Quiz {
  id: string;
  chapterId: string;
  title: string;
  questions: Question[];
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  answers: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
  }[];
}

export interface WrongAnswer {
  id: string; // unique identifier
  questionId: string;
  moduleId: string;
  moduleTitle: string;
  moduleIcon: string;
  question: string;
  options: string[];
  correctAnswer: number;
  selectedAnswer: number;
  explanation: string;
  addedAt: string;
  solvedAt?: string; // when user solved it correctly in wrong answers review
}

// Practice attempt question with full details for review
export interface PracticeAttemptQuestion {
  questionId: string;
  moduleId: string;
  moduleTitle: string;
  moduleIcon: string;
  question: string;
  options: string[];
  correctAnswer: number;
  selectedAnswer: number;
  isCorrect: boolean;
  explanation: string;
}

// Quiz session for saving in-progress state
export interface QuizSession {
  moduleId: string;
  currentQuestionIndex: number;
  answers: (number | null)[];
  startedAt: string;
  // For practice quiz, we need to save the questions since they're randomly generated
  practiceQuestions?: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    sourceModule: string;
    sourceModuleTitle: string;
    sourceModuleIcon: string;
  }[];
}

// Practice quiz attempt record
export interface PracticeAttempt {
  id: string;
  completedAt: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  questions: PracticeAttemptQuestion[];
  // Statistics by module
  moduleStats: {
    [moduleId: string]: {
      moduleTitle: string;
      moduleIcon: string;
      correct: number;
      total: number;
    };
  };
}

// -----------------------------------------------------
// User Progress Types
// -----------------------------------------------------

export interface UserProgress {
  moduleProgress: {
    [moduleId: string]: ModuleProgress;
  };
  bookmarks: string[];
  notes: {
    [chapterId: string]: string;
  };
  wrongAnswers: WrongAnswer[];
  practiceAttempts: PracticeAttempt[];
  quizSessions: {
    [moduleId: string]: QuizSession;
  };
  lastAccessed?: string;
  updatedAt: string;
}

export interface ModuleProgress {
  completedChapters: string[];
  quizScores: QuizResult[];
  startedAt?: string;
  completedAt?: string;
}

export interface ChapterProgress {
  chapterId: string;
  isCompleted: boolean;
  completedAt?: string;
  timeSpent?: number;
}

// -----------------------------------------------------
// Navigation Types
// -----------------------------------------------------

export interface NavigationItem {
  title: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
  isActive?: boolean;
  isCompleted?: boolean;
}

export interface Breadcrumb {
  label: string;
  href: string;
}

// -----------------------------------------------------
// UI State Types
// -----------------------------------------------------

export interface ThemeConfig {
  mode: "light" | "dark" | "system";
}

export interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
}

export interface SearchResult {
  chapterId: string;
  moduleId: string;
  title: string;
  excerpt: string;
  matchType: "title" | "content" | "code";
}

// -----------------------------------------------------
// API Response Types
// -----------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// -----------------------------------------------------
// Statistics Types
// -----------------------------------------------------

export interface LearningStats {
  totalModules: number;
  completedModules: number;
  totalChapters: number;
  completedChapters: number;
  overallProgress: number;
  quizAverage: number;
  totalTimeSpent?: number;
  streak?: number;
}

// -----------------------------------------------------
// Module Metadata Type (for modules.json)
// -----------------------------------------------------

export interface ModuleMetadata {
  modules: Module[];
  version: string;
  lastUpdated: string;
}
