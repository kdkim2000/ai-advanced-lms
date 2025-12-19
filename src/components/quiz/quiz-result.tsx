"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface QuizResultProps {
  score: number;
  totalQuestions: number;
  moduleId: string;
  onRetry: () => void;
}

export function QuizResult({
  score,
  totalQuestions,
  moduleId,
  onRetry,
}: QuizResultProps) {
  const percentage = Math.round((score / totalQuestions) * 100);
  const isPassing = percentage >= 70;
  const isPerfect = percentage === 100;

  const getGrade = () => {
    if (percentage >= 90) return { grade: "A", color: "text-green-600" };
    if (percentage >= 80) return { grade: "B", color: "text-blue-600" };
    if (percentage >= 70) return { grade: "C", color: "text-yellow-600" };
    if (percentage >= 60) return { grade: "D", color: "text-orange-600" };
    return { grade: "F", color: "text-red-600" };
  };

  const { grade, color } = getGrade();

  const getMessage = () => {
    if (isPerfect) return "완벽합니다! 모든 문제를 맞혔습니다!";
    if (percentage >= 90) return "훌륭합니다! 거의 완벽한 점수입니다!";
    if (percentage >= 80) return "잘 하셨습니다! 좋은 점수입니다!";
    if (percentage >= 70) return "합격입니다! 조금 더 복습해보세요.";
    if (percentage >= 60) return "아쉽습니다. 복습 후 다시 도전해보세요.";
    return "더 많은 학습이 필요합니다. 강의를 다시 확인해보세요.";
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center pb-2">
        <div
          className={cn(
            "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4",
            isPerfect
              ? "bg-yellow-100 dark:bg-yellow-900/30"
              : isPassing
                ? "bg-green-100 dark:bg-green-900/30"
                : "bg-red-100 dark:bg-red-900/30"
          )}
        >
          {isPerfect ? (
            <Trophy className="h-10 w-10 text-yellow-600" />
          ) : isPassing ? (
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          ) : (
            <XCircle className="h-10 w-10 text-red-600" />
          )}
        </div>
        <CardTitle className="text-2xl">퀴즈 결과</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Score Display */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className={cn("text-6xl font-bold", color)}>{grade}</span>
            <div className="text-left">
              <p className="text-3xl font-bold">{percentage}%</p>
              <p className="text-muted-foreground text-sm">
                {score} / {totalQuestions} 정답
              </p>
            </div>
          </div>
          <Progress
            value={percentage}
            className={cn(
              "h-3",
              isPassing
                ? "[&>div]:bg-green-600"
                : "[&>div]:bg-red-600"
            )}
          />
        </div>

        {/* Message */}
        <div
          className={cn(
            "p-4 rounded-lg text-center",
            isPerfect
              ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200"
              : isPassing
                ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
          )}
        >
          <p className="font-medium">{getMessage()}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{score}</p>
            <p className="text-xs text-muted-foreground">정답</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">
              {totalQuestions - score}
            </p>
            <p className="text-xs text-muted-foreground">오답</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={onRetry} className="flex-1">
            <RotateCcw className="h-4 w-4 mr-2" />
            다시 풀기
          </Button>
          {moduleId === "practice" && (
            <Button variant="outline" asChild className="flex-1">
              <Link href="/quiz/practice/history">
                <History className="h-4 w-4 mr-2" />
                기록 보기
              </Link>
            </Button>
          )}
          <Button asChild className="flex-1">
            <Link href={moduleId === "practice" ? "/quiz" : `/learn/${moduleId}`}>
              {moduleId === "practice" ? "퀴즈 목록" : "다음 학습"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
