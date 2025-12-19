"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Trophy, Clock } from "lucide-react";
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

export default function HomePage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const { progress, getModuleProgress } = useProgressStore();

  // Prevent hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional hydration detection
    setIsHydrated(true);
  }, []);

  const totalChapters = modules.reduce((sum, m) => sum + m.chapters.length, 0);
  const completedChapters = isHydrated
    ? Object.values(progress.moduleProgress).reduce(
        (sum, mp) => sum + mp.completedChapters.length,
        0
      )
    : 0;
  const overallProgress =
    totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0;

  // Find last accessed or first incomplete chapter
  const getRecommendedChapter = () => {
    if (!isHydrated) {
      // Return first chapter when not hydrated
      if (modules.length > 0 && modules[0].chapters.length > 0) {
        return { module: modules[0], chapter: modules[0].chapters[0] };
      }
      return null;
    }

    if (progress.lastAccessed) {
      for (const mod of modules) {
        const chapter = mod.chapters.find(
          (c) => c.id === progress.lastAccessed
        );
        if (chapter) {
          return { module: mod, chapter };
        }
      }
    }

    // Find first incomplete chapter
    for (const mod of modules) {
      const moduleProgress = progress.moduleProgress[mod.id];
      for (const chapter of mod.chapters) {
        if (!moduleProgress?.completedChapters.includes(chapter.id)) {
          return { module: mod, chapter };
        }
      }
    }

    return null;
  };

  const recommended = getRecommendedChapter();

  // Helper to get module progress with hydration safety
  const getModuleProgressSafe = (moduleId: string) => {
    return isHydrated ? getModuleProgress(moduleId) : 0;
  };

  return (
    <>
      <Header breadcrumbs={[{ label: "홈" }]} />

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Hero Section */}
        <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-background p-8">
          <h1 className="text-3xl font-bold tracking-tight">
            AI Advanced Learning Platform
          </h1>
          <p className="mt-2 text-muted-foreground">
            AI Advanced 자격 취득을 위한 체계적인 학습 플랫폼입니다.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="text-sm">
                <strong>{modules.length}</strong> 모듈
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm">
                <strong>{totalChapters}</strong> 챕터
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="text-sm">
                <strong>{completedChapters}</strong> 완료
              </span>
            </div>
          </div>

          {recommended && (
            <div className="mt-6">
              <Button asChild>
                <Link
                  href={`/learn/${recommended.module.id}/${recommended.chapter.slug}`}
                >
                  {isHydrated && progress.lastAccessed ? "이어서 학습하기" : "학습 시작하기"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">전체 학습 진행률</CardTitle>
            <CardDescription>
              {completedChapters} / {totalChapters} 챕터 완료
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={overallProgress} className="flex-1" />
              <span className="text-2xl font-bold">{overallProgress}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Module Cards */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">학습 모듈</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => {
              const moduleProgressCount = getModuleProgressSafe(module.id);
              const progressPercent =
                module.chapters.length > 0
                  ? Math.round(
                      (moduleProgressCount / module.chapters.length) * 100
                    )
                  : 0;
              const isCompleted = progressPercent === 100;

              return (
                <Card
                  key={module.id}
                  className="group transition-shadow hover:shadow-md"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <span className="text-3xl">
                        {moduleIcons[module.id] || module.icon}
                      </span>
                      {isCompleted ? (
                        <Badge variant="default" className="bg-green-500">
                          완료
                        </Badge>
                      ) : progressPercent > 0 ? (
                        <Badge variant="secondary">{progressPercent}%</Badge>
                      ) : (
                        <Badge variant="outline">미시작</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{module.titleKo}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3">
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>
                          {moduleProgressCount} / {module.chapters.length} 챕터
                        </span>
                        <span>{progressPercent}%</span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                      size="sm"
                    >
                      <Link href={`/learn/${module.id}`}>
                        {progressPercent === 0
                          ? "시작하기"
                          : progressPercent === 100
                            ? "복습하기"
                            : "계속하기"}
                        <ArrowRight className="ml-2 h-4 w-4" />
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
