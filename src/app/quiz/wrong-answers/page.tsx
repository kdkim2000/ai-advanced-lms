"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { QuestionCard } from "@/components/quiz/question-card";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Trash2,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { useProgressStore } from "@/stores/progress-store";
import type { WrongAnswer } from "@/types";

export default function WrongAnswersPage() {
  const {
    progress,
    getUnsolvedWrongAnswers,
    markWrongAnswerSolved,
    removeWrongAnswer,
    clearSolvedWrongAnswers,
    clearAllWrongAnswers,
  } = useProgressStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number | null>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<"list" | "practice">("list");
  const [selectedSolvedQuestion, setSelectedSolvedQuestion] = useState<WrongAnswer | null>(null);

  const wrongAnswers = useMemo(() => getUnsolvedWrongAnswers(), [getUnsolvedWrongAnswers]);
  const solvedWrongAnswers = useMemo(
    () => (progress.wrongAnswers || []).filter((wa) => wa.solvedAt),
    [progress.wrongAnswers]
  );
  const solvedCount = solvedWrongAnswers.length;

  const currentQuestion = wrongAnswers[currentQuestionIndex];

  // Group wrong answers by module
  const groupedByModule = useMemo(() => {
    const grouped: Record<string, { icon: string; title: string; questions: WrongAnswer[] }> = {};
    wrongAnswers.forEach((wa) => {
      if (!grouped[wa.moduleId]) {
        grouped[wa.moduleId] = {
          icon: wa.moduleIcon,
          title: wa.moduleTitle,
          questions: [],
        };
      }
      grouped[wa.moduleId].questions.push(wa);
    });
    return grouped;
  }, [wrongAnswers]);

  // Group solved wrong answers by module
  const groupedSolvedByModule = useMemo(() => {
    const grouped: Record<string, { icon: string; title: string; questions: WrongAnswer[] }> = {};
    solvedWrongAnswers.forEach((wa) => {
      if (!grouped[wa.moduleId]) {
        grouped[wa.moduleId] = {
          icon: wa.moduleIcon,
          title: wa.moduleTitle,
          questions: [],
        };
      }
      grouped[wa.moduleId].questions.push(wa);
    });
    return grouped;
  }, [solvedWrongAnswers]);

  const handleSelectAnswer = useCallback(
    (answerIndex: number) => {
      if (!currentQuestion) return;
      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: answerIndex,
      }));
    },
    [currentQuestion]
  );

  const handleRevealAnswer = useCallback(() => {
    if (!currentQuestion) return;
    setRevealedAnswers((prev) => new Set(prev).add(currentQuestion.id));

    // If user got it right, mark as solved
    const userAnswer = userAnswers[currentQuestion.id];
    if (userAnswer === currentQuestion.correctAnswer) {
      markWrongAnswerSolved(currentQuestion.id);
    }
  }, [currentQuestion, userAnswers, markWrongAnswerSolved]);

  const handlePrevious = useCallback(() => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentQuestionIndex((prev) => Math.min(wrongAnswers.length - 1, prev + 1));
  }, [wrongAnswers.length]);

  const handleStartPractice = useCallback(() => {
    setMode("practice");
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setRevealedAnswers(new Set());
  }, []);

  const handleBackToList = useCallback(() => {
    setMode("list");
  }, []);

  const handleDeleteQuestion = useCallback(
    (id: string) => {
      removeWrongAnswer(id);
      if (currentQuestionIndex >= wrongAnswers.length - 1) {
        setCurrentQuestionIndex(Math.max(0, wrongAnswers.length - 2));
      }
    },
    [removeWrongAnswer, currentQuestionIndex, wrongAnswers.length]
  );

  // Empty state
  if (wrongAnswers.length === 0 && solvedCount === 0) {
    return (
      <>
        <Header
          breadcrumbs={[
            { label: "홈", href: "/" },
            { label: "퀴즈", href: "/quiz" },
            { label: "오답노트" },
          ]}
        />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <BookOpen className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">오답노트가 비어있습니다</h2>
          <p className="text-muted-foreground text-center">
            퀴즈를 풀고 틀린 문제가 있으면 여기에 자동으로 추가됩니다.
          </p>
          <Button asChild>
            <Link href="/quiz">퀴즈 풀러 가기</Link>
          </Button>
        </div>
      </>
    );
  }

  // List view
  if (mode === "list") {
    return (
      <>
        <Header
          breadcrumbs={[
            { label: "홈", href: "/" },
            { label: "퀴즈", href: "/quiz" },
            { label: "오답노트" },
          ]}
        />
        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                오답노트
              </h1>
              <p className="text-muted-foreground mt-1">
                틀린 문제를 다시 풀어보세요. 반복 학습이 실력 향상의 핵심입니다.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>풀어야 할 문제</CardDescription>
                <CardTitle className="text-3xl">{wrongAnswers.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>해결한 문제</CardDescription>
                <CardTitle className="text-3xl text-green-600">{solvedCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>총 오답</CardDescription>
                <CardTitle className="text-3xl">
                  {wrongAnswers.length + solvedCount}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {wrongAnswers.length > 0 && (
              <Button onClick={handleStartPractice}>
                <RotateCcw className="h-4 w-4 mr-2" />
                오답 다시 풀기 ({wrongAnswers.length}문제)
              </Button>
            )}
            {solvedCount > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    해결된 문제 삭제
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>해결된 문제 삭제</DialogTitle>
                    <DialogDescription>
                      이미 맞춘 {solvedCount}개의 문제를 오답노트에서 삭제합니다.
                      이 작업은 되돌릴 수 없습니다.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">취소</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button onClick={clearSolvedWrongAnswers}>
                        삭제
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            {(wrongAnswers.length > 0 || solvedCount > 0) && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    전체 삭제
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>전체 삭제</DialogTitle>
                    <DialogDescription>
                      오답노트의 모든 문제({wrongAnswers.length + solvedCount}개)를
                      삭제합니다. 이 작업은 되돌릴 수 없습니다.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">취소</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        onClick={clearAllWrongAnswers}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        삭제
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Grouped by Module */}
          {Object.entries(groupedByModule).length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">모듈별 오답</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(groupedByModule).map(([moduleId, { icon, title, questions }]) => (
                  <Card key={moduleId}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{icon}</span>
                        <div>
                          <CardTitle className="text-base">{title}</CardTitle>
                          <CardDescription>{questions.length}문제</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Solved Questions */}
          {solvedCount > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                해결한 문제 ({solvedCount})
              </h2>
              <div className="space-y-3">
                {Object.entries(groupedSolvedByModule).map(([moduleId, { icon, title, questions }]) => (
                  <Card key={moduleId}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{icon}</span>
                        <CardTitle className="text-sm">{title}</CardTitle>
                        <Badge variant="secondary" className="ml-auto">
                          {questions.length}문제
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {questions.map((wa) => (
                          <div
                            key={wa.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                            onClick={() => setSelectedSolvedQuestion(wa)}
                          >
                            <p className="text-sm line-clamp-1 flex-1 pr-2">
                              {wa.question}
                            </p>
                            <Button variant="ghost" size="sm" className="shrink-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Solved Question Detail Dialog */}
          <Dialog open={!!selectedSolvedQuestion} onOpenChange={(open) => !open && setSelectedSolvedQuestion(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              {selectedSolvedQuestion && (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        {selectedSolvedQuestion.moduleIcon} {selectedSolvedQuestion.moduleTitle}
                      </Badge>
                      <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        해결됨
                      </Badge>
                    </div>
                    <DialogTitle className="text-left text-base font-medium leading-relaxed">
                      {selectedSolvedQuestion.question}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    {/* Options */}
                    <div className="space-y-2">
                      {selectedSolvedQuestion.options.map((option, index) => {
                        const isCorrect = index === selectedSolvedQuestion.correctAnswer;
                        const wasSelected = index === selectedSolvedQuestion.selectedAnswer;
                        return (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border text-sm ${
                              isCorrect
                                ? "bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-700"
                                : wasSelected
                                ? "bg-red-50 border-red-300 dark:bg-red-950 dark:border-red-700"
                                : "bg-muted/30 border-muted"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className="font-medium shrink-0">
                                {index + 1}.
                              </span>
                              <span className="flex-1">{option}</span>
                              {isCorrect && (
                                <Badge className="bg-green-500 shrink-0">정답</Badge>
                              )}
                              {wasSelected && !isCorrect && (
                                <Badge variant="destructive" className="shrink-0">내 선택</Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {selectedSolvedQuestion.explanation && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                          💡 해설
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 whitespace-pre-wrap">
                          {selectedSolvedQuestion.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                  <DialogFooter className="mt-4">
                    <DialogClose asChild>
                      <Button variant="outline">닫기</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        variant="destructive"
                        onClick={() => removeWrongAnswer(selectedSolvedQuestion.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        삭제
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </>
    );
  }

  // Practice mode
  const isAnswered = currentQuestion && userAnswers[currentQuestion.id] !== undefined;
  const isRevealed = currentQuestion && revealedAnswers.has(currentQuestion.id);
  const isCorrect =
    currentQuestion && userAnswers[currentQuestion.id] === currentQuestion.correctAnswer;
  const progressValue =
    wrongAnswers.length > 0 ? ((currentQuestionIndex + 1) / wrongAnswers.length) * 100 : 0;

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "홈", href: "/" },
          { label: "퀴즈", href: "/quiz" },
          { label: "오답노트", href: "/quiz/wrong-answers" },
          { label: "다시 풀기" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="mx-auto w-full max-w-3xl space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                오답 다시 풀기
              </h1>
              <p className="text-sm text-muted-foreground">
                틀렸던 문제를 다시 풀어보세요.
              </p>
            </div>
            <Button variant="outline" onClick={handleBackToList}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">
                진행률: {currentQuestionIndex + 1} / {wrongAnswers.length}
              </span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>

          {/* Question Navigation */}
          <nav aria-label="문제 탐색" className="py-1">
            <div className="flex flex-wrap gap-1.5" role="list">
              {wrongAnswers.map((wa, index) => {
                const isCurrent = index === currentQuestionIndex;
                const isAnsweredQ = userAnswers[wa.id] !== undefined;
                const isRevealedQ = revealedAnswers.has(wa.id);
                const isCorrectQ = userAnswers[wa.id] === wa.correctAnswer;

                return (
                  <button
                    key={wa.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-7 h-7 rounded-full text-xs font-medium transition-all flex-shrink-0 ${
                      isCurrent ? "ring-2 ring-primary ring-offset-1" : ""
                    } ${
                      isRevealedQ
                        ? isCorrectQ
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                        : isAnsweredQ
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Question Source */}
          {currentQuestion && (
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {currentQuestion.moduleIcon} {currentQuestion.moduleTitle}
              </Badge>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>문제 삭제</DialogTitle>
                    <DialogDescription>
                      이 문제를 오답노트에서 삭제합니다.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">취소</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        onClick={() => handleDeleteQuestion(currentQuestion.id)}
                      >
                        삭제
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Question Card */}
          {currentQuestion && (
            <QuestionCard
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={wrongAnswers.length}
              question={currentQuestion.question}
              options={currentQuestion.options}
              correctAnswer={currentQuestion.correctAnswer}
              explanation={currentQuestion.explanation}
              selectedAnswer={userAnswers[currentQuestion.id] ?? null}
              isSubmitted={isRevealed}
              onSelectAnswer={handleSelectAnswer}
            />
          )}

          {/* Show original wrong answer */}
          {currentQuestion && isRevealed && !isCorrect && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm">
              <p className="text-yellow-800 dark:text-yellow-200">
                <strong>이전에 선택한 답:</strong>{" "}
                {currentQuestion.options[currentQuestion.selectedAnswer]}
              </p>
            </div>
          )}

          {/* Reveal Answer Button */}
          {currentQuestion && isAnswered && !isRevealed && (
            <div className="flex justify-center">
              <Button onClick={handleRevealAnswer}>정답 확인</Button>
            </div>
          )}

          {/* Solved Message */}
          {currentQuestion && isRevealed && isCorrect && (
            <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-sm text-center">
              <p className="text-green-800 dark:text-green-200 font-medium">
                🎉 정답입니다! 이 문제는 해결됨으로 표시되었습니다.
              </p>
            </div>
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

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentQuestionIndex === wrongAnswers.length - 1}
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
