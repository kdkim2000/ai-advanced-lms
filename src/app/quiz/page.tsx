"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Trophy, Shuffle, BookOpen, History } from "lucide-react";
import { useProgressStore } from "@/stores/progress-store";

const practiceQuiz = {
  moduleId: "practice",
  title: "실전 문제풀이",
  description: "모든 챕터에서 랜덤으로 20문제를 출제합니다.",
  icon: "🎲",
  questionCount: 20,
};

const quizList = [
  {
    moduleId: "python",
    title: "Python 기초",
    description: "Python 프로그래밍 기초 지식",
    icon: "🐍",
    questionCount: 67,
  },
  {
    moduleId: "data-analysis",
    title: "데이터 분석",
    description: "Pandas, NumPy 등 데이터 분석 라이브러리",
    icon: "📊",
    questionCount: 30,
  },
  {
    moduleId: "llm",
    title: "LLM 기초",
    description: "Large Language Model의 기본 개념",
    icon: "🤖",
    questionCount: 324,
  },
  {
    moduleId: "prompt-engineering",
    title: "프롬프트 엔지니어링",
    description: "효과적인 프롬프트 작성 기법",
    icon: "⚡",
    questionCount: 310,
  },
  {
    moduleId: "rag",
    title: "RAG",
    description: "Retrieval-Augmented Generation",
    icon: "🔍",
    questionCount: 75,
  },
  {
    moduleId: "fine-tuning",
    title: "Fine-tuning",
    description: "모델 파인튜닝 기법",
    icon: "🎯",
    questionCount: 245,
  },
];

export default function QuizListPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { progress, getWrongAnswerCount, getPracticeAttempts } = useProgressStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const wrongAnswerCount = isHydrated ? getWrongAnswerCount() : 0;
  const practiceAttempts = isHydrated ? getPracticeAttempts() : [];

  const getQuizScore = (moduleId: string) => {
    if (!isHydrated) return null;
    const moduleProgress = progress.moduleProgress[moduleId];
    if (!moduleProgress?.quizScores?.length) return null;
    const latestScore = moduleProgress.quizScores[moduleProgress.quizScores.length - 1];
    return latestScore;
  };

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "홈", href: "/" },
          { label: "퀴즈" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-12 p-6 md:p-10">
        {/* Page Header */}
        <section className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">퀴즈</h1>
          <p className="text-muted-foreground">
            각 모듈별 학습 내용을 퀴즈로 확인해보세요.
          </p>
        </section>

        {/* Featured Section */}
        <section className="grid gap-6 md:grid-cols-2">
          {/* Practice Quiz */}
          <Link href="/quiz/practice" className="block group">
            <div className="space-y-3 p-6 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-4xl">{practiceQuiz.icon}</span>
                {practiceAttempts.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {practiceAttempts.length}회 도전
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2 group-hover:text-primary transition-colors">
                  {practiceQuiz.title}
                  <Shuffle className="h-4 w-4 text-muted-foreground" />
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {practiceQuiz.description}
                </p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">
                  {practiceQuiz.questionCount}문제
                </span>
                <div className="flex gap-2">
                  {practiceAttempts.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link href="/quiz/practice/history">
                        <History className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  <Button size="sm">
                    실전 도전
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </Link>

          {/* Wrong Answers */}
          <Link href="/quiz/wrong-answers" className="block group">
            <div className="space-y-3 p-6 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-4xl">📝</span>
                {wrongAnswerCount > 0 && (
                  <span className="text-xs font-medium text-orange-600">
                    {wrongAnswerCount}문제
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2 group-hover:text-primary transition-colors">
                  오답노트
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  틀린 문제를 다시 풀어보며 실력을 향상시키세요.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">
                  {wrongAnswerCount > 0
                    ? `${wrongAnswerCount}개의 문제가 대기 중`
                    : "아직 틀린 문제 없음"}
                </span>
                <Button size="sm" variant={wrongAnswerCount > 0 ? "default" : "outline"}>
                  오답노트
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </Link>
        </section>

        <hr className="border-border" />

        {/* Module Quizzes */}
        <section className="space-y-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            모듈별 퀴즈
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quizList.map((quiz) => {
              const score = getQuizScore(quiz.moduleId);
              const hasAttempted = score !== null;
              const percentage = hasAttempted
                ? Math.round((score.score / score.totalQuestions) * 100)
                : 0;
              const isPassing = percentage >= 70;

              return (
                <Link
                  key={quiz.moduleId}
                  href={`/quiz/${quiz.moduleId}`}
                  className="block group space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{quiz.icon}</span>
                    {hasAttempted && (
                      <span
                        className={`text-xs font-medium ${
                          isPassing ? "text-green-600" : "text-muted-foreground"
                        }`}
                      >
                        {isPassing && <Trophy className="h-3 w-3 inline mr-1" />}
                        {percentage}%
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {quiz.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {quiz.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {quiz.questionCount}문제
                      </span>
                      {hasAttempted && (
                        <span className="text-xs">
                          {score.score}/{score.totalQuestions}
                        </span>
                      )}
                    </div>
                    {hasAttempted && (
                      <Progress value={percentage} className="h-1" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
