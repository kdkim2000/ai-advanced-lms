"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuestionCard } from "@/components/quiz/question-card";
import { QuizResult } from "@/components/quiz/quiz-result";
import { ChevronLeft, ChevronRight, Send, Shuffle, RefreshCw, PlayCircle, RotateCcw } from "lucide-react";
import { useProgressStore } from "@/stores/progress-store";
import type { QuizResult as QuizResultType, WrongAnswer, PracticeAttempt, PracticeAttemptQuestion, QuizSession } from "@/types";

// Import all quiz data
import pythonQuiz from "@/content/quizzes/python.json";
import dataAnalysisQuiz from "@/content/quizzes/data-analysis.json";
import llmQuiz from "@/content/quizzes/llm.json";
import promptEngineeringQuiz from "@/content/quizzes/prompt-engineering.json";
import ragQuiz from "@/content/quizzes/rag.json";
import fineTuningQuiz from "@/content/quizzes/fine-tuning.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const allQuizzes: Record<string, any> = {
  python: { data: pythonQuiz, title: "Python 기초", icon: "🐍" },
  "data-analysis": { data: dataAnalysisQuiz, title: "데이터 분석", icon: "📊" },
  llm: { data: llmQuiz, title: "LLM", icon: "🤖" },
  "prompt-engineering": { data: promptEngineeringQuiz, title: "프롬프트 엔지니어링", icon: "⚡" },
  rag: { data: ragQuiz, title: "RAG", icon: "🔍" },
  "fine-tuning": { data: fineTuningQuiz, title: "Fine-tuning", icon: "🎯" },
};

interface NormalizedQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  sourceModule: string;
  sourceModuleTitle: string;
  sourceModuleIcon: string;
}

// Normalize question from different formats
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeQuestion(q: any, moduleId: string, moduleTitle: string, moduleIcon: string): NormalizedQuestion {
  // Check if it's the new exam format (options as object, answer as 1-indexed number)
  if ("answer" in q && typeof q.options === "object" && !Array.isArray(q.options)) {
    const optionKeys = Object.keys(q.options).sort((a, b) => Number(a) - Number(b));
    const optionsArray = optionKeys.map(key => q.options[key]);
    return {
      id: `${moduleId}-${q.id}`,
      question: q.question,
      options: optionsArray,
      correctAnswer: q.answer - 1, // Convert to 0-indexed
      explanation: q.explanation || "",
      sourceModule: moduleId,
      sourceModuleTitle: moduleTitle,
      sourceModuleIcon: moduleIcon,
    };
  } else {
    // Legacy format (options as array, correctAnswer as 0-indexed)
    return {
      id: `${moduleId}-${q.id}`,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
      sourceModule: moduleId,
      sourceModuleTitle: moduleTitle,
      sourceModuleIcon: moduleIcon,
    };
  }
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate random questions from all modules
function generateRandomQuestions(count: number): NormalizedQuestion[] {
  const allQuestions: NormalizedQuestion[] = [];

  // Collect all questions from all modules
  Object.entries(allQuizzes).forEach(([moduleId, { data, title, icon }]) => {
    data.questions.forEach((q: unknown) => {
      allQuestions.push(normalizeQuestion(q, moduleId, title, icon));
    });
  });

  // Shuffle and take the requested number
  const shuffled = shuffleArray(allQuestions);
  return shuffled.slice(0, count);
}

const QUESTION_COUNT = 20;

export default function PracticeQuizPage() {
  const [questions, setQuestions] = useState<NormalizedQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { addQuizResult, addWrongAnswers, addPracticeAttempt, saveQuizSession, getQuizSession, clearQuizSession, hasQuizSession } = useProgressStore();

  // Check for existing session on mount
  useEffect(() => {
    if (hasQuizSession("practice")) {
      const session = getQuizSession("practice");
      // Only show resume prompt if session has saved questions
      if (session?.practiceQuestions && session.practiceQuestions.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Session restore needs state updates
        setShowResumePrompt(true);
        setIsLoading(false);
        return;
      }
    }
    // Generate new questions if no valid session
    const randomQuestions = generateRandomQuestions(QUESTION_COUNT);
    setQuestions(randomQuestions);
    setAnswers(new Array(QUESTION_COUNT).fill(null));
    setIsLoading(false);
    setIsInitialized(true);
  }, [hasQuizSession, getQuizSession]);

  // Save session whenever state changes (only after initialization)
  useEffect(() => {
    if (!isInitialized || isSubmitted || questions.length === 0) return;

    const session: QuizSession = {
      moduleId: "practice",
      currentQuestionIndex,
      answers,
      startedAt: new Date().toISOString(),
      practiceQuestions: questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        sourceModule: q.sourceModule,
        sourceModuleTitle: q.sourceModuleTitle,
        sourceModuleIcon: q.sourceModuleIcon,
      })),
    };
    saveQuizSession("practice", session);
  }, [currentQuestionIndex, answers, isInitialized, isSubmitted, questions, saveQuizSession]);

  const handleResume = useCallback(() => {
    const session = getQuizSession("practice");
    if (session?.practiceQuestions) {
      // Restore questions from session
      const restoredQuestions: NormalizedQuestion[] = session.practiceQuestions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        sourceModule: q.sourceModule,
        sourceModuleTitle: q.sourceModuleTitle,
        sourceModuleIcon: q.sourceModuleIcon,
      }));
      setQuestions(restoredQuestions);
      setCurrentQuestionIndex(session.currentQuestionIndex);
      // Restore answers
      const restoredAnswers = new Array(restoredQuestions.length).fill(null);
      session.answers.forEach((answer, index) => {
        if (index < restoredQuestions.length) {
          restoredAnswers[index] = answer;
        }
      });
      setAnswers(restoredAnswers);
    }
    setShowResumePrompt(false);
    setIsInitialized(true);
  }, [getQuizSession]);

  const handleStartFresh = useCallback(() => {
    clearQuizSession("practice");
    const randomQuestions = generateRandomQuestions(QUESTION_COUNT);
    setQuestions(randomQuestions);
    setCurrentQuestionIndex(0);
    setAnswers(new Array(QUESTION_COUNT).fill(null));
    setShowResumePrompt(false);
    setIsInitialized(true);
  }, [clearQuizSession]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const answeredCount = answers.filter((a) => a !== null).length;
  const allAnswered = answeredCount === questions.length;

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
      Math.min(questions.length - 1, prev + 1)
    );
  }, [questions.length]);

  const handleSubmit = useCallback(() => {
    setIsSubmitted(true);
    // Clear the saved session when quiz is submitted
    clearQuizSession("practice");

    const completedAt = new Date().toISOString();
    const correctCount = questions.reduce((count, question, index) => {
      return count + (answers[index] === question.correctAnswer ? 1 : 0);
    }, 0);

    const result: QuizResultType = {
      quizId: "practice",
      score: correctCount,
      totalQuestions: questions.length,
      completedAt,
      answers: questions.map((question, index) => ({
        questionId: question.id,
        selectedAnswer: answers[index] ?? -1,
        isCorrect: answers[index] === question.correctAnswer,
      })),
    };

    addQuizResult("practice", result);

    // Create practice attempt with full question details
    const attemptQuestions: PracticeAttemptQuestion[] = questions.map((question, index) => ({
      questionId: question.id,
      moduleId: question.sourceModule,
      moduleTitle: question.sourceModuleTitle,
      moduleIcon: question.sourceModuleIcon,
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      selectedAnswer: answers[index] ?? -1,
      isCorrect: answers[index] === question.correctAnswer,
      explanation: question.explanation,
    }));

    // Calculate module stats
    const moduleStats: PracticeAttempt["moduleStats"] = {};
    attemptQuestions.forEach((q) => {
      if (!moduleStats[q.moduleId]) {
        moduleStats[q.moduleId] = {
          moduleTitle: q.moduleTitle,
          moduleIcon: q.moduleIcon,
          correct: 0,
          total: 0,
        };
      }
      moduleStats[q.moduleId].total++;
      if (q.isCorrect) {
        moduleStats[q.moduleId].correct++;
      }
    });

    const practiceAttempt: PracticeAttempt = {
      id: `practice-${Date.now()}`,
      completedAt,
      score: correctCount,
      totalQuestions: questions.length,
      percentage: Math.round((correctCount / questions.length) * 100),
      questions: attemptQuestions,
      moduleStats,
    };

    addPracticeAttempt(practiceAttempt);

    // Save wrong answers to wrong answer notebook
    const wrongAnswersList: WrongAnswer[] = questions
      .map((question, index) => {
        if (answers[index] !== question.correctAnswer && answers[index] !== null) {
          return {
            id: `${question.sourceModule}-${question.id}-${Date.now()}`,
            questionId: question.id,
            moduleId: question.sourceModule,
            moduleTitle: question.sourceModuleTitle,
            moduleIcon: question.sourceModuleIcon,
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            selectedAnswer: answers[index] as number,
            explanation: question.explanation,
            addedAt: completedAt,
          };
        }
        return null;
      })
      .filter((wa): wa is WrongAnswer => wa !== null);

    if (wrongAnswersList.length > 0) {
      addWrongAnswers(wrongAnswersList);
    }
  }, [questions, answers, addQuizResult, addWrongAnswers, addPracticeAttempt, clearQuizSession]);

  const handleShowResults = useCallback(() => {
    setShowResults(true);
  }, []);

  const handleRetry = useCallback(() => {
    // Generate new random questions
    const randomQuestions = generateRandomQuestions(QUESTION_COUNT);
    setQuestions(randomQuestions);
    setCurrentQuestionIndex(0);
    setAnswers(new Array(QUESTION_COUNT).fill(null));
    setIsSubmitted(false);
    setShowResults(false);
  }, []);

  const score = questions.reduce((count, question, index) => {
    return count + (answers[index] === question.correctAnswer ? 1 : 0);
  }, 0);

  // Count questions by module
  const moduleBreakdown = useMemo(() => {
    const breakdown: Record<string, { count: number; icon: string }> = {};
    questions.forEach((q) => {
      if (!breakdown[q.sourceModuleTitle]) {
        breakdown[q.sourceModuleTitle] = { count: 0, icon: q.sourceModuleIcon };
      }
      breakdown[q.sourceModuleTitle].count++;
    });
    return breakdown;
  }, [questions]);

  if (isLoading) {
    return (
      <>
        <Header
          breadcrumbs={[
            { label: "홈", href: "/" },
            { label: "퀴즈", href: "/quiz" },
            { label: "실전 문제풀이" },
          ]}
        />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">문제를 생성하는 중...</p>
        </div>
      </>
    );
  }

  // Show resume prompt if there's a saved session
  if (showResumePrompt) {
    const savedSession = getQuizSession("practice");
    const savedAnsweredCount = savedSession?.answers.filter(a => a !== null).length || 0;
    const totalQuestions = savedSession?.practiceQuestions?.length || QUESTION_COUNT;

    return (
      <>
        <Header
          breadcrumbs={[
            { label: "홈", href: "/" },
            { label: "퀴즈", href: "/quiz" },
            { label: "실전 문제풀이" },
          ]}
        />
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">진행 중인 퀴즈가 있습니다</CardTitle>
              <CardDescription>
                이전에 풀던 실전 문제풀이를 이어서 풀거나 새로운 문제로 시작할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">{savedAnsweredCount} / {totalQuestions}</p>
                <p className="text-sm text-muted-foreground">문제 답변 완료</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button onClick={handleResume} className="w-full">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  이어서 풀기
                </Button>
                <Button variant="outline" onClick={handleStartFresh} className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  새 문제로 시작
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (showResults) {
    return (
      <>
        <Header
          breadcrumbs={[
            { label: "홈", href: "/" },
            { label: "퀴즈", href: "/quiz" },
            { label: "실전 문제풀이" },
          ]}
        />
        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="mx-auto w-full max-w-3xl">
            <QuizResult
              score={score}
              totalQuestions={questions.length}
              moduleId="practice"
              onRetry={handleRetry}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "홈", href: "/" },
          { label: "퀴즈", href: "/quiz" },
          { label: "실전 문제풀이" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="mx-auto w-full max-w-3xl space-y-4 sm:space-y-6">
          {/* Title and Info */}
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <Shuffle className="h-6 w-6" />
              실전 문제풀이
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              모든 모듈에서 랜덤으로 선택된 {QUESTION_COUNT}문제입니다.
            </p>
          </div>

          {/* Module Breakdown */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(moduleBreakdown).map(([title, { count, icon }]) => (
              <Badge key={title} variant="secondary" className="text-xs">
                {icon} {title}: {count}문제
              </Badge>
            ))}
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">
                진행률: {currentQuestionIndex + 1} / {questions.length}
              </span>
              <span className="text-muted-foreground">
                답변: {answeredCount} / {questions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Navigation */}
          <nav aria-label="문제 탐색" className="py-1">
            <div className="flex flex-wrap gap-1.5" role="list">
              {questions.map((_, index) => {
                const isAnswered = answers[index] !== null;
                const isCurrent = index === currentQuestionIndex;
                const isCorrectAfterSubmit =
                  isSubmitted && answers[index] === questions[index].correctAnswer;
                const isWrongAfterSubmit =
                  isSubmitted &&
                  answers[index] !== null &&
                  answers[index] !== questions[index].correctAnswer;

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

          {/* Current Question Source Badge */}
          {currentQuestion && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {currentQuestion.sourceModuleIcon} {currentQuestion.sourceModuleTitle}
              </Badge>
            </div>
          )}

          {/* Question Card */}
          {currentQuestion && (
            <QuestionCard
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              question={currentQuestion.question}
              options={currentQuestion.options}
              correctAnswer={currentQuestion.correctAnswer}
              explanation={currentQuestion.explanation}
              selectedAnswer={answers[currentQuestionIndex]}
              isSubmitted={isSubmitted}
              onSelectAnswer={handleSelectAnswer}
            />
          )}

          {/* Navigation Buttons */}
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
              disabled={currentQuestionIndex === questions.length - 1}
            >
              <span className="hidden sm:inline">다음</span>
              <ChevronRight className="h-4 w-4 sm:ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
