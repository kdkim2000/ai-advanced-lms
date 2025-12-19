"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Trophy,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Clock,
} from "lucide-react";
import modulesData from "@/content/modules.json";
import { useProgressStore } from "@/stores/progress-store";
import type { Module } from "@/types";

const modules = modulesData.modules as Module[];

const moduleIcons: Record<string, string> = {
  python: "🐍",
  "data-analysis": "📊",
  llm: "🤖",
  "prompt-engineering": "⚡",
  rag: "🔍",
  "fine-tuning": "🎯",
};

export default function DashboardPage() {
  const { progress, getModuleProgress } = useProgressStore();

  const totalChapters = modules.reduce((sum, m) => sum + m.chapters.length, 0);
  const completedChapters = Object.values(progress.moduleProgress).reduce(
    (sum, mp) => sum + mp.completedChapters.length,
    0
  );
  const overallProgress =
    totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0;

  const completedModules = modules.filter((m) => {
    const moduleProgress = getModuleProgress(m.id);
    return moduleProgress === m.chapters.length;
  }).length;

  const getRecentActivity = () => {
    const activities: { mod: Module; chapterId: string }[] = [];
    for (const mod of modules) {
      const moduleProgress = progress.moduleProgress[mod.id];
      if (moduleProgress) {
        for (const chapterId of moduleProgress.completedChapters) {
          activities.push({ mod, chapterId });
        }
      }
    }
    return activities.slice(-5).reverse();
  };

  const recentActivity = getRecentActivity();

  return (
    <>
      <Header
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "대시보드" }]}
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold">대시보드</h1>
          <p className="text-muted-foreground">학습 현황을 확인하세요.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">전체 진행률</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallProgress}%</div>
              <Progress value={overallProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">완료한 챕터</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completedChapters}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}/ {totalChapters}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalChapters - completedChapters}개 챕터 남음
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">완료한 모듈</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completedModules}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}/ {modules.length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {modules.length - completedModules}개 모듈 남음
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">북마크</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {progress.bookmarks.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">저장된 챕터</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>모듈별 진행 현황</CardTitle>
            <CardDescription>각 모듈의 학습 진행 상태입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {modules.map((module) => {
                const moduleProgressCount = getModuleProgress(module.id);
                const progressPercent =
                  module.chapters.length > 0
                    ? Math.round(
                        (moduleProgressCount / module.chapters.length) * 100
                      )
                    : 0;

                return (
                  <div key={module.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{moduleIcons[module.id] || module.icon}</span>
                        <span className="font-medium">{module.titleKo}</span>
                        {progressPercent === 100 && (
                          <Badge variant="default" className="bg-green-500">
                            완료
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {moduleProgressCount} / {module.chapters.length}
                        </span>
                        <span className="text-sm font-medium w-12 text-right">
                          {progressPercent}%
                        </span>
                      </div>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>최근 학습 활동</CardTitle>
            <CardDescription>최근 완료한 챕터 목록입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map(({ mod, chapterId }) => {
                  const chapter = mod.chapters.find(
                    (c) => c.id === chapterId
                  );
                  if (!chapter) return null;

                  return (
                    <div
                      key={chapterId}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {moduleIcons[mod.id] || mod.icon}
                        </span>
                        <div>
                          <p className="font-medium">{chapter.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {mod.titleKo}
                          </p>
                        </div>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>아직 완료한 챕터가 없습니다.</p>
                <Button asChild className="mt-4">
                  <Link href="/learn/python/setup">
                    학습 시작하기
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
