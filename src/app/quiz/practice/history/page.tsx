"use client";

import { useState, useMemo, useEffect } from "react";
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
import {
  History,
  Trophy,
  Target,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Lightbulb,
  BarChart3,
} from "lucide-react";
import { useProgressStore } from "@/stores/progress-store";
import type { PracticeAttempt, PracticeAttemptQuestion } from "@/types";

export default function PracticeHistoryPage() {
  const {
    getPracticeAttempts,
    getPracticeStats,
    removePracticeAttempt,
    clearAllPracticeAttempts,
  } = useProgressStore();

  const [selectedAttempt, setSelectedAttempt] = useState<PracticeAttempt | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<PracticeAttemptQuestion | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional hydration detection
    setIsHydrated(true);
  }, []);

  const attempts = useMemo(() => {
    return isHydrated ? getPracticeAttempts() : [];
  }, [isHydrated, getPracticeAttempts]);

  const stats = isHydrated ? getPracticeStats() : {
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0,
    moduleAccuracy: {},
  };

  // Sort attempts by date (most recent first)
  const sortedAttempts = useMemo(() => {
    return [...attempts].sort((a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  }, [attempts]);

  // Generate advice based on module accuracy
  const advice = useMemo(() => {
    const adviceList: { module: string; icon: string; accuracy: number; message: string }[] = [];

    Object.values(stats.moduleAccuracy).forEach((data) => {
      const accuracy = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;

      if (accuracy < 50) {
        adviceList.push({
          module: data.title,
          icon: data.icon,
          accuracy,
          message: `${data.title} 영역이 취약합니다. 해당 모듈의 학습 자료를 다시 복습하세요.`,
        });
      } else if (accuracy < 70) {
        adviceList.push({
          module: data.title,
          icon: data.icon,
          accuracy,
          message: `${data.title} 영역의 이해도가 부족합니다. 추가 연습이 필요합니다.`,
        });
      }
    });

    // Sort by accuracy (lowest first)
    return adviceList.sort((a, b) => a.accuracy - b.accuracy);
  }, [stats.moduleAccuracy]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get grade color
  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-[color:var(--success)]";
    if (percentage >= 70) return "text-[color:var(--info)]";
    if (percentage >= 50) return "text-[color:var(--warning)]";
    return "text-destructive";
  };

  // Empty state
  if (isHydrated && attempts.length === 0) {
    return (
      <>
        <Header
          breadcrumbs={[
            { label: "홈", href: "/" },
            { label: "퀴즈", href: "/quiz" },
            { label: "실전 문제풀이", href: "/quiz/practice" },
            { label: "기록" },
          ]}
        />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <History className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-xl font-semibold">아직 기록이 없습니다</h2>
          <p className="text-muted-foreground text-center">
            실전 문제풀이를 완료하면 여기에 기록이 저장됩니다.
          </p>
          <Button asChild>
            <Link href="/quiz/practice">실전 도전하기</Link>
          </Button>
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
          { label: "실전 문제풀이", href: "/quiz/practice" },
          { label: "기록" },
        ]}
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <History className="h-6 w-6" />
              실전 문제풀이 기록
            </h1>
            <p className="text-muted-foreground mt-1">
              도전 기록을 확인하고 취약 부분을 분석하세요.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/quiz/practice">
                <Target className="h-4 w-4 mr-2" />
                새 도전
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>총 도전 횟수</CardDescription>
              <CardTitle className="text-3xl">{stats.totalAttempts}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>평균 점수</CardDescription>
              <CardTitle className={`text-3xl ${getGradeColor(stats.averageScore)}`}>
                {stats.averageScore}%
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>최고 점수</CardDescription>
              <CardTitle className="text-3xl text-[color:var(--success)] flex items-center gap-2">
                <Trophy className="h-6 w-6" />
                {stats.bestScore}%
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>취약 영역</CardDescription>
              <CardTitle className="text-xl">
                {advice.length > 0 ? (
                  <span className="flex items-center gap-1 text-[color:var(--warning)]">
                    <AlertTriangle className="h-5 w-5" />
                    {advice.length}개
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[color:var(--success)]">
                    <CheckCircle2 className="h-5 w-5" />
                    없음
                  </span>
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Module Accuracy */}
        {Object.keys(stats.moduleAccuracy).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                모듈별 정답률
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.moduleAccuracy)
                  .sort((a, b) => {
                    const accA = a[1].total > 0 ? a[1].correct / a[1].total : 0;
                    const accB = b[1].total > 0 ? b[1].correct / b[1].total : 0;
                    return accA - accB;
                  })
                  .map(([moduleId, data]) => {
                    const accuracy = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                    return (
                      <div key={moduleId} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span>{data.icon}</span>
                            <span>{data.title}</span>
                          </span>
                          <span className={`font-medium ${getGradeColor(accuracy)}`}>
                            {accuracy}% ({data.correct}/{data.total})
                          </span>
                        </div>
                        <Progress
                          value={accuracy}
                          className={`h-2 ${
                            accuracy >= 70
                              ? "[&>div]:bg-[color:var(--success)]"
                              : accuracy >= 50
                              ? "[&>div]:bg-[color:var(--warning)]"
                              : "[&>div]:bg-destructive"
                          }`}
                        />
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Advice Section */}
        {advice.length > 0 && (
          <Card className="bg-[--bg-warning-tint] border-[color:var(--warning)]/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-[color:var(--warning)]">
                <Lightbulb className="h-5 w-5" />
                학습 조언
              </CardTitle>
              <CardDescription className="text-[color:var(--warning)]">
                분석 결과를 바탕으로 한 맞춤 학습 조언입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {advice.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{item.module}</span>
                        <Badge variant="destructive" className="text-xs">
                          {item.accuracy}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.message}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/learn/${Object.keys(stats.moduleAccuracy).find(
                        k => stats.moduleAccuracy[k].title === item.module
                      )}`}>
                        학습하기
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attempt History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">도전 기록</h2>
            {attempts.length > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    전체 삭제
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>전체 기록 삭제</DialogTitle>
                    <DialogDescription>
                      모든 실전 문제풀이 기록({attempts.length}개)을 삭제합니다.
                      이 작업은 되돌릴 수 없습니다.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">취소</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button variant="destructive" onClick={clearAllPracticeAttempts}>
                        삭제
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="space-y-3">
            {sortedAttempts.map((attempt) => (
              <Card key={attempt.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${
                          attempt.percentage >= 70
                            ? "bg-[--bg-success-tint] text-[color:var(--success)]"
                            : attempt.percentage >= 50
                            ? "bg-[--bg-warning-tint] text-[color:var(--warning)]"
                            : "bg-[--bg-error-tint] text-destructive"
                        }`}
                      >
                        {attempt.percentage}%
                      </div>
                      <div>
                        <p className="font-medium">
                          {attempt.score}/{attempt.totalQuestions} 정답
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(attempt.completedAt)}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(attempt.moduleStats).map(([moduleId, stat]) => (
                            <Badge key={moduleId} variant="outline" className="text-xs">
                              {stat.moduleIcon} {stat.correct}/{stat.total}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAttempt(attempt)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        상세
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>기록 삭제</DialogTitle>
                            <DialogDescription>
                              이 도전 기록을 삭제합니다.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">취소</Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button
                                variant="destructive"
                                onClick={() => removePracticeAttempt(attempt.id)}
                              >
                                삭제
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Attempt Detail Dialog */}
        <Dialog open={!!selectedAttempt} onOpenChange={(open) => !open && setSelectedAttempt(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedAttempt && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    도전 상세 - {selectedAttempt.percentage}%
                    <Badge variant={selectedAttempt.percentage >= 70 ? "default" : "destructive"}>
                      {selectedAttempt.score}/{selectedAttempt.totalQuestions}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    {formatDate(selectedAttempt.completedAt)}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  {/* Module Summary */}
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedAttempt.moduleStats).map(([moduleId, stat]) => {
                      const accuracy = Math.round((stat.correct / stat.total) * 100);
                      return (
                        <Badge
                          key={moduleId}
                          variant="outline"
                          className={`${
                            accuracy >= 70
                              ? "border-[color:var(--success)] text-[color:var(--success)]"
                              : accuracy >= 50
                              ? "border-[color:var(--warning)] text-[color:var(--warning)]"
                              : "border-destructive text-destructive"
                          }`}
                        >
                          {stat.moduleIcon} {stat.moduleTitle}: {stat.correct}/{stat.total} ({accuracy}%)
                        </Badge>
                      );
                    })}
                  </div>

                  {/* Questions List */}
                  <div className="space-y-2">
                    <h4 className="font-medium">문제 목록</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {selectedAttempt.questions.map((q, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                            q.isCorrect
                              ? "border-[color:var(--success)]/40"
                              : "border-destructive/40"
                          }`}
                          onClick={() => setSelectedQuestion(q)}
                        >
                          <div className="flex items-start gap-3">
                            {q.isCorrect ? (
                              <CheckCircle2 className="h-5 w-5 text-[color:var(--success)] shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {q.moduleIcon} {q.moduleTitle}
                                </Badge>
                              </div>
                              <p className="text-sm line-clamp-2">{q.question}</p>
                            </div>
                            <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">닫기</Button>
                  </DialogClose>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Question Detail Dialog */}
        <Dialog open={!!selectedQuestion} onOpenChange={(open) => !open && setSelectedQuestion(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedQuestion && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">
                      {selectedQuestion.moduleIcon} {selectedQuestion.moduleTitle}
                    </Badge>
                    {selectedQuestion.isCorrect ? (
                      <Badge className="bg-[--bg-success-tint] text-[color:var(--success)] border-[color:var(--success)]/50">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        정답
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        오답
                      </Badge>
                    )}
                  </div>
                  <DialogTitle className="text-left text-base font-medium leading-relaxed">
                    {selectedQuestion.question}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  {/* Options */}
                  <div className="space-y-2">
                    {selectedQuestion.options.map((option, index) => {
                      const isCorrect = index === selectedQuestion.correctAnswer;
                      const wasSelected = index === selectedQuestion.selectedAnswer;
                      return (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border text-sm ${
                            isCorrect
                              ? "bg-[--bg-success-tint] border-[color:var(--success)]/50"
                              : wasSelected
                              ? "bg-[--bg-error-tint] border-destructive/50"
                              : "bg-muted/30 border-muted"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="font-medium shrink-0">{index + 1}.</span>
                            <span className="flex-1">{option}</span>
                            {isCorrect && (
                              <Badge className="bg-[--bg-success-tint] text-[color:var(--success)] border-[color:var(--success)]/50 shrink-0">정답</Badge>
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
                  {selectedQuestion.explanation && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        💡 해설
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 whitespace-pre-wrap">
                        {selectedQuestion.explanation}
                      </p>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">닫기</Button>
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
