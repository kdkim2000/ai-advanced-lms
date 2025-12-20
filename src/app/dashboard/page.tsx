"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
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
  const [isHydrated, setIsHydrated] = useState(false);
  const { progress, getModuleProgress } = useProgressStore();

  useEffect(() => {
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

  const completedModules = isHydrated
    ? modules.filter((m) => {
        const moduleProgress = getModuleProgress(m.id);
        return moduleProgress === m.chapters.length;
      }).length
    : 0;

  const getRecentActivity = () => {
    if (!isHydrated) return [];
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

  const getModuleProgressSafe = (moduleId: string) => {
    return isHydrated ? getModuleProgress(moduleId) : 0;
  };

  return (
    <>
      <Header
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "대시보드" }]}
      />

      <div className="flex flex-1 flex-col gap-12 p-6 md:p-10">
        {/* Page Header */}
        <section className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">대시보드</h1>
          <p className="text-muted-foreground">학습 현황을 확인하세요.</p>
        </section>

        {/* Stats Grid */}
        <section className="grid gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">전체 진행률</p>
            <p className="text-4xl font-bold">{overallProgress}%</p>
            <Progress value={overallProgress} className="h-1 mt-2" />
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">완료한 챕터</p>
            <p className="text-4xl font-bold">
              {completedChapters}
              <span className="text-lg font-normal text-muted-foreground">
                {" "}/ {totalChapters}
              </span>
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">완료한 모듈</p>
            <p className="text-4xl font-bold">
              {completedModules}
              <span className="text-lg font-normal text-muted-foreground">
                {" "}/ {modules.length}
              </span>
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">북마크</p>
            <p className="text-4xl font-bold">
              {isHydrated ? progress.bookmarks.length : 0}
            </p>
          </div>
        </section>

        <hr className="border-border" />

        {/* Module Progress */}
        <section className="space-y-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            모듈별 진행 현황
          </h2>

          <div className="space-y-6">
            {modules.map((module) => {
              const moduleProgressCount = getModuleProgressSafe(module.id);
              const progressPercent =
                module.chapters.length > 0
                  ? Math.round(
                      (moduleProgressCount / module.chapters.length) * 100
                    )
                  : 0;

              return (
                <Link
                  key={module.id}
                  href={`/learn/${module.id}`}
                  className="block group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{moduleIcons[module.id]}</span>
                      <span className="font-medium group-hover:text-primary transition-colors">
                        {module.titleKo}
                      </span>
                      {progressPercent === 100 && (
                        <span className="text-xs text-green-600 font-medium">완료</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {moduleProgressCount} / {module.chapters.length}
                      </span>
                      <span className="text-sm font-medium w-12 text-right">
                        {progressPercent}%
                      </span>
                    </div>
                  </div>
                  <Progress value={progressPercent} className="h-1" />
                </Link>
              );
            })}
          </div>
        </section>

        <hr className="border-border" />

        {/* Recent Activity */}
        <section className="space-y-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            최근 학습 활동
          </h2>

          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map(({ mod, chapterId }) => {
                const chapter = mod.chapters.find((c) => c.id === chapterId);
                if (!chapter) return null;

                return (
                  <Link
                    key={chapterId}
                    href={`/learn/${mod.id}/${chapter.slug}`}
                    className="flex items-center justify-between py-2 group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{moduleIcons[mod.id]}</span>
                      <div>
                        <p className="font-medium group-hover:text-primary transition-colors">
                          {chapter.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {mod.titleKo}
                        </p>
                      </div>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                아직 완료한 챕터가 없습니다.
              </p>
              <Button asChild>
                <Link href="/learn/python/setup">
                  학습 시작하기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
