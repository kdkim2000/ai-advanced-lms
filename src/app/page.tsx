"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight } from "lucide-react";
import modulesData from "@/content/modules.json";
import { useProgressStore } from "@/stores/progress-store";
import { useIsHydrated } from "@/hooks/use-hydrated";
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

const moduleColorVars: Record<string, { bg: string; text: string }> = {
  "python":              { bg: "var(--module-python-bg)",  text: "var(--module-python-text)" },
  "data-analysis":       { bg: "var(--module-data-bg)",    text: "var(--module-data-text)" },
  "llm":                 { bg: "var(--module-llm-bg)",     text: "var(--module-llm-text)" },
  "prompt-engineering":  { bg: "var(--module-prompt-bg)",  text: "var(--module-prompt-text)" },
  "rag":                 { bg: "var(--module-rag-bg)",     text: "var(--module-rag-text)" },
  "fine-tuning":         { bg: "var(--module-fine-bg)",    text: "var(--module-fine-text)" },
};

export default function HomePage() {
  const isHydrated = useIsHydrated();
  const { progress, getModuleProgress } = useProgressStore();

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

  const getRecommendedChapter = () => {
    if (!isHydrated) {
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

  const getModuleProgressSafe = (moduleId: string) => {
    return isHydrated ? getModuleProgress(moduleId) : 0;
  };

  return (
    <>
      <Header breadcrumbs={[{ label: "홈" }]} />

      <div className="flex flex-1 flex-col gap-12 p-6 md:p-10">
        {/* Hero Section - Clean & Minimal */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              AI Advanced
            </h1>
            <p className="text-lg text-muted-foreground">
              자격 취득을 위한 학습 플랫폼
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>{modules.length}개 모듈</span>
            <span>{totalChapters}개 챕터</span>
            <span>{completedChapters}개 완료</span>
          </div>

          {recommended && (
            <Button asChild size="lg">
              <Link
                href={`/learn/${recommended.module.id}/${recommended.chapter.slug}`}
              >
                {isHydrated && progress.lastAccessed ? "이어서 학습하기" : "학습 시작하기"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </section>

        {/* Progress Section */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              전체 진행률
            </h2>
            <span className="text-3xl font-bold">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {completedChapters} / {totalChapters} 챕터 완료
          </p>
        </section>

        {/* Divider */}
        <hr className="border-border" />

        {/* Module List - Simple & Clean */}
        <section className="space-y-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            학습 모듈
          </h2>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
                  className="group block space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <span
                      className="text-3xl w-12 h-12 flex items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: moduleColorVars[module.id]?.bg ?? "var(--bg-subtle)",
                        color: moduleColorVars[module.id]?.text ?? "var(--foreground)",
                      }}
                    >
                      {moduleIcons[module.id]}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {progressPercent}%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {module.titleKo}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {module.description}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Progress value={progressPercent} className="h-1" />
                    <p className="text-xs text-muted-foreground">
                      {moduleProgressCount} / {module.chapters.length} 챕터
                    </p>
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
