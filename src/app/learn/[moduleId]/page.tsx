"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Check } from "lucide-react";
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

interface ModulePageProps {
  params: Promise<{ moduleId: string }>;
}

export default function ModulePage({ params }: ModulePageProps) {
  const { moduleId } = use(params);
  const currentModule = modules.find((m) => m.id === moduleId);

  const isHydrated = useIsHydrated();
  const { progress, getModuleProgress, markChapterComplete, markChapterIncomplete } =
    useProgressStore();

  if (!currentModule) {
    notFound();
  }

  const moduleProgressCount = isHydrated ? getModuleProgress(currentModule.id) : 0;
  const progressPercent =
    currentModule.chapters.length > 0
      ? Math.round((moduleProgressCount / currentModule.chapters.length) * 100)
      : 0;

  const getFirstIncompleteChapter = () => {
    if (!isHydrated) return currentModule.chapters[0];
    const moduleProgress = progress.moduleProgress[currentModule.id];
    for (const chapter of currentModule.chapters) {
      if (!moduleProgress?.completedChapters.includes(chapter.id)) {
        return chapter;
      }
    }
    return currentModule.chapters[0];
  };

  const firstIncomplete = getFirstIncompleteChapter();

  const handleToggleComplete = (chapterId: string, isComplete: boolean) => {
    if (isComplete) {
      markChapterIncomplete(currentModule.id, chapterId);
    } else {
      markChapterComplete(currentModule.id, chapterId);
    }
  };

  const isChapterComplete = (chapterId: string) => {
    if (!isHydrated) return false;
    return progress.moduleProgress[currentModule.id]?.completedChapters.includes(chapterId) ?? false;
  };

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "홈", href: "/" },
          { label: "학습", href: "/learn" },
          { label: currentModule.titleKo },
        ]}
      />

      <div className="flex flex-1 flex-col gap-12 p-6 md:p-10">
        {/* Module Header */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="text-5xl">
                {moduleIcons[currentModule.id] || currentModule.icon}
              </span>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">
                    {currentModule.order}. {currentModule.titleKo}
                  </h1>
                  {progressPercent === 100 && (
                    <span className="text-xs text-[color:var(--success)] font-medium px-2 py-0.5 bg-[--bg-success-tint] rounded-full">
                      완료
                    </span>
                  )}
                </div>
                <p className="mt-1 text-muted-foreground">{currentModule.description}</p>
              </div>
            </div>
            {progressPercent < 100 && (
              <Button asChild>
                <Link href={`/learn/${currentModule.id}/${firstIncomplete?.slug}`}>
                  {progressPercent === 0 ? "학습 시작" : "이어서 학습"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">학습 진행률</span>
              <span className="font-medium">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-1" />
            <p className="text-sm text-muted-foreground">
              {moduleProgressCount} / {currentModule.chapters.length} 챕터 완료
            </p>
          </div>
        </section>

        <hr className="border-border" />

        {/* Chapter List */}
        <section className="space-y-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            챕터 목록
          </h2>

          <div className="space-y-2">
            {currentModule.chapters.map((chapter, index) => {
              const isComplete = isChapterComplete(chapter.id);

              return (
                <div
                  key={chapter.id}
                  className={`flex items-center gap-4 rounded-lg p-4 transition-colors hover:bg-muted/50 ${
                    isComplete ? "bg-muted/30" : ""
                  }`}
                >
                  <Checkbox
                    checked={isComplete}
                    onCheckedChange={() =>
                      handleToggleComplete(chapter.id, isComplete)
                    }
                    className="h-5 w-5"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/learn/${currentModule.id}/${chapter.slug}`}
                      className="block group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {index + 1}.
                        </span>
                        <span
                          className={`font-medium group-hover:text-primary transition-colors ${
                            isComplete ? "text-muted-foreground line-through" : ""
                          }`}
                        >
                          {chapter.title}
                        </span>
                        {isComplete && (
                          <Check className="h-4 w-4 text-[color:var(--success)]" />
                        )}
                      </div>
                      {chapter.description && (
                        <p className="mt-1 text-sm text-muted-foreground truncate pl-6">
                          {chapter.description}
                        </p>
                      )}
                    </Link>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/learn/${currentModule.id}/${chapter.slug}`}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
