"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, Check, BookOpen } from "lucide-react";
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

interface ModulePageProps {
  params: Promise<{ moduleId: string }>;
}

export default function ModulePage({ params }: ModulePageProps) {
  const { moduleId } = use(params);
  const currentModule = modules.find((m) => m.id === moduleId);

  const { progress, getModuleProgress, markChapterComplete, markChapterIncomplete } =
    useProgressStore();

  if (!currentModule) {
    notFound();
  }

  const moduleProgressCount = getModuleProgress(currentModule.id);
  const progressPercent =
    currentModule.chapters.length > 0
      ? Math.round((moduleProgressCount / currentModule.chapters.length) * 100)
      : 0;

  const getFirstIncompleteChapter = () => {
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

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "홈", href: "/" },
          { label: "학습", href: "/learn" },
          { label: currentModule.titleKo },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Module Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <span className="text-5xl">
              {moduleIcons[currentModule.id] || currentModule.icon}
            </span>
            <div>
              <h1 className="text-2xl font-bold">
                {currentModule.order}. {currentModule.titleKo}
              </h1>
              <p className="mt-1 text-muted-foreground">{currentModule.description}</p>
            </div>
          </div>
          {progressPercent === 100 ? (
            <Badge variant="default" className="bg-green-500 text-base px-4 py-1">
              완료
            </Badge>
          ) : (
            <Button asChild>
              <Link href={`/learn/${currentModule.id}/${firstIncomplete?.slug}`}>
                {progressPercent === 0 ? "학습 시작" : "이어서 학습"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {/* Progress Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">학습 진행률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={progressPercent} className="flex-1" />
              <span className="text-xl font-bold">{progressPercent}%</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {moduleProgressCount} / {currentModule.chapters.length} 챕터 완료
            </p>
          </CardContent>
        </Card>

        {/* Chapter List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              챕터 목록
            </CardTitle>
            <CardDescription>
              순서대로 학습하는 것을 권장합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentModule.chapters.map((chapter, index) => {
                const isComplete =
                  progress.moduleProgress[currentModule.id]?.completedChapters.includes(
                    chapter.id
                  ) ?? false;

                return (
                  <div
                    key={chapter.id}
                    className={`flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
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
                        className="block"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {index + 1}.
                          </span>
                          <span
                            className={`font-medium ${
                              isComplete ? "text-muted-foreground line-through" : ""
                            }`}
                          >
                            {chapter.title}
                          </span>
                          {isComplete && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        {chapter.description && (
                          <p className="mt-1 text-sm text-muted-foreground truncate">
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
          </CardContent>
        </Card>
      </div>
    </>
  );
}
