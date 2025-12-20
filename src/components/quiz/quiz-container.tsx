"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuestionCard } from "./question-card";
import { QuizResult } from "./quiz-result";
import { ChevronLeft, ChevronRight, Send, PlayCircle, RotateCcw } from "lucide-react";
import { useProgressStore } from "@/stores/progress-store";
import type { QuizResult as QuizResultType, WrongAnswer, QuizSession } from "@/types";

// Module metadata for wrong answers
const moduleInfo: Record<string, { title: string; icon: string }> = {
  python: { title: "Python 기초", icon: "🐍" },
  "data-analysis": { title: "데이터 분석", icon: "📊" },
  llm: { title: "LLM", icon: "🤖" },
  "prompt-engineering": { title: "프롬프트 엔지니어링", icon: "⚡" },
  rag: { title: "RAG", icon: "🔍" },
  "fine-tuning": { title: "Fine-tuning", icon: "🎯" },
  practice: { title: "실전 문제풀이", icon: "🎲" },
};

// New exam format question
interface ExamQuestion {
  id: number;
  question: string;
  points?: number;
  options: Record<string, string>;
  answer: number;
  category?: string;
  explanation: string;
}

// Old format question
interface LegacyQuestion {
  id: string;
  type?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// Normalized question for internal use
interface NormalizedQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// New exam format
interface ExamData {
  moduleId: string;
  exam_info: {
    title: string;
    description: string;
    total_questions?: number;
    points_per_question?: number;
    total_points?: number;
  };
  questions: ExamQuestion[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QuizData = any;

// Normalized quiz data
interface NormalizedQuizData {
  moduleId: string;
  title: string;
  description: string;
  questions: NormalizedQuestion[];
}

// Helper to check if quiz is in exam format
function isExamFormat(quiz: QuizData): quiz is ExamData {
  return "exam_info" in quiz;
}

// Transform question to normalized format
function normalizeQuestion(q: ExamQuestion | LegacyQuestion): NormalizedQuestion {
  if ("answer" in q && typeof q.options === "object" && !Array.isArray(q.options)) {
    const examQ = q as ExamQuestion;
    const optionKeys = Object.keys(examQ.options).sort((a, b) => Number(a) - Number(b));
    const optionsArray = optionKeys.map(key => examQ.options[key]);
    return {
      id: String(examQ.id),
      question: examQ.question,
      options: optionsArray,
      correctAnswer: examQ.answer - 1,
      explanation: examQ.explanation,
    };
  } else {
    const legacy = q as LegacyQuestion;
    return {
      id: legacy.id,
      question: legacy.question,
      options: legacy.options,
      correctAnswer: legacy.correctAnswer,
      explanation: legacy.explanation,
    };
  }
}

// Normalize entire quiz data
function normalizeQuiz(quiz: QuizData, moduleId: string): NormalizedQuizData {
  if (isExamFormat(quiz)) {
    return {
      moduleId, // Use the passed moduleId from URL params
      title: quiz.exam_info.title,
      description: quiz.exam_info.description || "",
      questions: quiz.questions.map(normalizeQuestion),
    };
  } else {
    return {
      moduleId, // Use the passed moduleId from URL params
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions.map(normalizeQuestion),
    };
  }
}

interface QuizContainerProps {
  quiz: QuizData;
  moduleId: string;
}

export function QuizContainer({ quiz: rawQuiz, moduleId }: QuizContainerProps) {
  const quiz = useMemo(() => normalizeQuiz(rawQuiz, moduleId), [rawQuiz, moduleId]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(quiz.questions.length).fill(null)
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { addQuizResult, addWrongAnswers, saveQuizSession, getQuizSession, clearQuizSession, hasQuizSession } = useProgressStore();

  // Check for existing session on mount
  useEffect(() => {
    if (hasQuizSession(quiz.moduleId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Session restore needs state updates
      setShowResumePrompt(true);
    } else {
      setIsInitialized(true);
    }
  }, [quiz.moduleId, hasQuizSession]);

  // Save session whenever state changes (only after initialization)
  useEffect(() => {
    if (!isInitialized || isSubmitted) return;

    const session: QuizSession = {
      moduleId: quiz.moduleId,
      currentQuestionIndex,
      answers,
      startedAt: new Date().toISOString(),
    };
    saveQuizSession(quiz.moduleId, session);
  }, [quiz.moduleId, currentQuestionIndex, answers, isInitialized, isSubmitted, saveQuizSession]);

  const handleResume = useCallback(() => {
    const session = getQuizSession(quiz.moduleId);
    if (session) {
      setCurrentQuestionIndex(session.currentQuestionIndex);
      // Ensure answers array matches question count
      const restoredAnswers = new Array(quiz.questions.length).fill(null);
      session.answers.forEach((answer, index) => {
        if (index < quiz.questions.length) {
          restoredAnswers[index] = answer;
        }
      });
      setAnswers(restoredAnswers);
    }
    setShowResumePrompt(false);
    setIsInitialized(true);
  }, [quiz.moduleId, quiz.questions.length, getQuizSession]);

  const handleStartFresh = useCallback(() => {
    clearQuizSession(quiz.moduleId);
    setCurrentQuestionIndex(0);
    setAnswers(new Array(quiz.questions.length).fill(null));
    setShowResumePrompt(false);
    setIsInitialized(true);
  }, [quiz.moduleId, quiz.questions.length, clearQuizSession]);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const answeredCount = answers.filter((a) => a !== null).length;
  const allAnswered = answeredCount === quiz.questions.length;

  const handleSelectAnswer = useCallback((answerIndex: number) => {
    setAnswers((prev) => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = answerIndex;
      return newAnswers;
    });
  }, [currentQuestionIndex]);

  const handlePrevious = useCallback(() => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentQuestionIndex((prev) =>
      Math.min(quiz.questions.length - 1, prev + 1)
    );
  }, [quiz.questions.length]);

  const handleSubmit = useCallback(() => {
    setIsSubmitted(true);
    // Clear the saved session when quiz is submitted
    clearQuizSession(quiz.moduleId);

    const correctCount = quiz.questions.reduce((count, question, index) => {
      return count + (answers[index] === question.correctAnswer ? 1 : 0);
    }, 0);

    const result: QuizResultType = {
      quizId: quiz.moduleId,
      score: correctCount,
      totalQuestions: quiz.questions.length,
      completedAt: new Date().toISOString(),
      answers: quiz.questions.map((question, index) => ({
        questionId: question.id,
        selectedAnswer: answers[index] ?? -1,
        isCorrect: answers[index] === question.correctAnswer,
      })),
    };

    addQuizResult(quiz.moduleId, result);

    // Save wrong answers to wrong answer notebook
    const info = moduleInfo[quiz.moduleId] || { title: quiz.title, icon: "📝" };
    const wrongAnswersList: WrongAnswer[] = quiz.questions
      .map((question, index) => {
        if (answers[index] !== question.correctAnswer && answers[index] !== null) {
          return {
            id: `${quiz.moduleId}-${question.id}-${Date.now()}`,
            questionId: question.id,
            moduleId: quiz.moduleId,
            moduleTitle: info.title,
            moduleIcon: info.icon,
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            selectedAnswer: answers[index] as number,
            explanation: question.explanation,
            addedAt: new Date().toISOString(),
          };
        }
        return null;
      })
      .filter((wa): wa is WrongAnswer => wa !== null);

    if (wrongAnswersList.length > 0) {
      addWrongAnswers(wrongAnswersList);
    }
  }, [quiz, answers, addQuizResult, addWrongAnswers, clearQuizSession]);

  const handleShowResults = useCallback(() => {
    setShowResults(true);
  }, []);

  const handleRetry = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers(new Array(quiz.questions.length).fill(null));
    setIsSubmitted(false);
    setShowResults(false);
  }, [quiz.questions.length]);

  const score = quiz.questions.reduce((count, question, index) => {
    return count + (answers[index] === question.correctAnswer ? 1 : 0);
  }, 0);

  if (showResults) {
    return (
      <QuizResult
        score={score}
        totalQuestions={quiz.questions.length}
        moduleId={quiz.moduleId}
        onRetry={handleRetry}
      />
    );
  }

  // Show resume prompt if there's a saved session
  if (showResumePrompt) {
    const savedSession = getQuizSession(quiz.moduleId);
    const savedAnsweredCount = savedSession?.answers.filter(a => a !== null).length || 0;

    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">진행 중인 퀴즈가 있습니다</CardTitle>
          <CardDescription>
            이전에 풀던 퀴즈를 이어서 풀거나 처음부터 다시 시작할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-2xl font-bold text-primary">{savedAnsweredCount} / {quiz.questions.length}</p>
            <p className="text-sm text-muted-foreground">문제 답변 완료</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button onClick={handleResume} className="w-full">
              <PlayCircle className="h-4 w-4 mr-2" />
              이어서 풀기
            </Button>
            <Button variant="outline" onClick={handleStartFresh} className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              처음부터 시작
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold">{quiz.title}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">{quiz.description}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">
            진행률: {currentQuestionIndex + 1} / {quiz.questions.length}
          </span>
          <span className="text-muted-foreground">
            답변: {answeredCount} / {quiz.questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <nav aria-label="문제 탐색" className="py-1">
        <div className="flex flex-wrap gap-1.5" role="list">
        {quiz.questions.map((_, index) => {
          const isAnswered = answers[index] !== null;
          const isCurrent = index === currentQuestionIndex;
          const isCorrectAfterSubmit =
            isSubmitted && answers[index] === quiz.questions[index].correctAnswer;
          const isWrongAfterSubmit =
            isSubmitted &&
            answers[index] !== null &&
            answers[index] !== quiz.questions[index].correctAnswer;

          return (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-9 h-9 sm:w-7 sm:h-7 rounded-full text-sm sm:text-xs font-medium transition-all flex-shrink-0 ${isCurrent ? "ring-2 ring-primary ring-offset-1" : ""} ${isSubmitted ? (isCorrectAfterSubmit ? "bg-green-500 text-white" : isWrongAfterSubmit ? "bg-red-500 text-white" : "bg-muted text-muted-foreground") : isAnswered ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              {index + 1}
            </button>
          );
        })}
        </div>
      </nav>

      <QuestionCard
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={quiz.questions.length}
        question={currentQuestion.question}
        options={currentQuestion.options}
        correctAnswer={currentQuestion.correctAnswer}
        explanation={currentQuestion.explanation}
        selectedAnswer={answers[currentQuestionIndex]}
        isSubmitted={isSubmitted}
        onSelectAnswer={handleSelectAnswer}
      />

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">이전</span>
        </Button>

        <div className="flex gap-2">
          {!isSubmitted && allAnswered && (
            <Button onClick={handleSubmit} size="sm">
              <Send className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">제출하기</span>
              <span className="sm:hidden">제출</span>
            </Button>
          )}
          {isSubmitted && (
            <Button onClick={handleShowResults} size="sm">
              결과 보기
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentQuestionIndex === quiz.questions.length - 1}
        >
          <span className="hidden sm:inline">다음</span>
          <ChevronRight className="h-4 w-4 sm:ml-1" />
        </Button>
      </div>
    </div>
  );
}
