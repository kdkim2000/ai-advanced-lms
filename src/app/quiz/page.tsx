"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Trophy, HelpCircle, Shuffle, BookOpen, History } from "lucide-react";
import { useProgressStore } from "@/stores/progress-store";

const practiceQuiz = {
  moduleId: "practice",
  title: "실전 문제풀이",
  description: "모든 챕터에서 랜덤으로 20문제를 출제합니다. 실전처럼 풀어보세요!",
  icon: "🎲",
  questionCount: 20,
  isPractice: true,
};

const quizList = [
  {
    moduleId: "python",
    title: "Python 기초 퀴즈",
    description: "Python 프로그래밍 기초 지식을 확인하는 퀴즈입니다.",
    icon: "🐍",
    questionCount: 67,
  },
  {
    moduleId: "data-analysis",
    title: "데이터 분석 퀴즈",
    description: "Pandas, NumPy 등 데이터 분석 라이브러리에 대한 퀴즈입니다.",
    icon: "📊",
    questionCount: 30,
  },
  {
    moduleId: "llm",
    title: "LLM 기초 퀴즈",
    description: "Large Language Model의 기본 개념에 대한 퀴즈입니다.",
    icon: "🤖",
    questionCount: 324,
  },
  {
    moduleId: "prompt-engineering",
    title: "프롬프트 엔지니어링 퀴즈",
    description: "효과적인 프롬프트 작성 기법에 대한 퀴즈입니다.",
    icon: "⚡",
    questionCount: 310,
  },
  {
    moduleId: "rag",
    title: "RAG 퀴즈",
    description: "Retrieval-Augmented Generation에 대한 퀴즈입니다.",
    icon: "🔍",
    questionCount: 75,
  },
  {
    moduleId: "fine-tuning",
    title: "Fine-tuning 퀴즈",
    description: "모델 파인튜닝에 대한 퀴즈입니다.",
    icon: "🎯",
    questionCount: 245,
  },
];

export default function QuizListPage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { progress, getWrongAnswerCount, getPracticeAttempts } = useProgressStore();

  // Prevent hydration mismatch by only showing progress after client mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional hydration detection
    setIsHydrated(true);
  }, []);

  const wrongAnswerCount = isHydrated ? getWrongAnswerCount() : 0;
  const practiceAttempts = isHydrated ? getPracticeAttempts() : [];

  const getQuizScore = (moduleId: string) => {
    if (!isHydrated) return null;
    const moduleProgress = progress.moduleProgress[moduleId];
    if (!moduleProgress?.quizScores?.length) return null;
    // Get the latest quiz score
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

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="h-6 w-6" />
            퀴즈
          </h1>
          <p className="text-muted-foreground mt-1">
            각 모듈별 학습 내용을 퀴즈로 확인해보세요.
          </p>
        </div>

        {/* Featured Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Practice Quiz - Featured */}
          <Card className="border-2 border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{practiceQuiz.icon}</span>
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {practiceQuiz.title}
                    <Badge variant="outline" className="ml-2">
                      <Shuffle className="h-3 w-3 mr-1" />
                      랜덤
                    </Badge>
                    {practiceAttempts.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {practiceAttempts.length}회 도전
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {practiceQuiz.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {practiceQuiz.questionCount}문제
                  </span>
                  {(() => {
                    const score = getQuizScore(practiceQuiz.moduleId);
                    if (score) {
                      const percentage = Math.round((score.score / score.totalQuestions) * 100);
                      return (
                        <span className="text-sm font-medium">
                          최근: {score.score}/{score.totalQuestions} ({percentage}%)
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
                <div className="flex gap-2">
                  {practiceAttempts.length > 0 && (
                    <Button variant="outline" asChild>
                      <Link href="/quiz/practice/history">
                        <History className="h-4 w-4 mr-1" />
                        기록
                      </Link>
                    </Button>
                  )}
                  <Button asChild>
                    <Link href="/quiz/practice">
                      실전 도전
                      <Shuffle className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wrong Answers - Featured */}
          <Card className="border-2 border-orange-500/50 bg-gradient-to-r from-orange-500/5 to-orange-500/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-4xl">📝</span>
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    오답노트
                    {wrongAnswerCount > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {wrongAnswerCount}문제
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    틀린 문제를 다시 풀어보며 실력을 향상시키세요.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {wrongAnswerCount > 0
                    ? `${wrongAnswerCount}개의 문제가 대기 중입니다`
                    : "아직 틀린 문제가 없습니다"}
                </span>
                <Button asChild variant={wrongAnswerCount > 0 ? "default" : "outline"}>
                  <Link href="/quiz/wrong-answers">
                    <BookOpen className="h-4 w-4 mr-2" />
                    오답노트
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Module Quizzes */}
        <div>
          <h2 className="text-lg font-semibold mb-4">모듈별 퀴즈</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizList.map((quiz) => {
              const score = getQuizScore(quiz.moduleId);
              const hasAttempted = score !== null;
              const percentage = hasAttempted
                ? Math.round((score.score / score.totalQuestions) * 100)
                : 0;
              const isPassing = percentage >= 70;

              return (
                <Card key={quiz.moduleId} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <span className="text-3xl">{quiz.icon}</span>
                      {hasAttempted && (
                        <Badge
                          variant={isPassing ? "default" : "secondary"}
                          className={isPassing ? "bg-green-600" : ""}
                        >
                          {isPassing ? (
                            <>
                              <Trophy className="h-3 w-3 mr-1" />
                              합격
                            </>
                          ) : (
                            "재도전 필요"
                          )}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    <CardDescription>{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {quiz.questionCount}문제
                        </span>
                        {hasAttempted && (
                          <span className="font-medium">
                            최고 점수: {score.score}/{score.totalQuestions}
                          </span>
                        )}
                      </div>
                      {hasAttempted && (
                        <Progress
                          value={percentage}
                          className={
                            isPassing
                              ? "[&>div]:bg-green-600"
                              : "[&>div]:bg-yellow-600"
                          }
                        />
                      )}
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/quiz/${quiz.moduleId}`}>
                        {hasAttempted ? "다시 풀기" : "퀴즈 시작"}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
