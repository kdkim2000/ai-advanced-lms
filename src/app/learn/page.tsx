"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
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

export default function LearnPage() {
  const { getModuleProgress } = useProgressStore();

  return (
    <>
      <Header breadcrumbs={[{ label: "홈", href: "/" }, { label: "학습" }]} />

      <div className="flex flex-1 flex-col gap-12 p-6 md:p-10">
        {/* Page Header */}
        <section className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">학습 모듈</h1>
          <p className="text-muted-foreground">
            AI Advanced 자격 취득을 위한 6개 모듈입니다.
          </p>
        </section>

        {/* Module List */}
        <section className="space-y-8">
          {modules.map((module, index) => {
            const moduleProgressCount = getModuleProgress(module.id);
            const progressPercent =
              module.chapters.length > 0
                ? Math.round(
                    (moduleProgressCount / module.chapters.length) * 100
                  )
                : 0;

            return (
              <div key={module.id}>
                {index > 0 && <hr className="border-border mb-8" />}

                <Link
                  href={`/learn/${module.id}`}
                  className="block group"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Icon & Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{moduleIcons[module.id]}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                              {module.order}. {module.titleKo}
                            </h2>
                            {progressPercent === 100 && (
                              <span className="text-xs text-green-600 font-medium px-2 py-0.5 bg-green-50 dark:bg-green-900/20 rounded-full">
                                완료
                              </span>
                            )}
                            {progressPercent > 0 && progressPercent < 100 && (
                              <span className="text-xs text-muted-foreground">
                                진행 중
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground mt-1">
                            {module.description}
                          </p>
                        </div>
                      </div>

                      {/* Chapter Preview */}
                      <div className="pl-14 space-y-1">
                        {module.chapters.slice(0, 3).map((chapter) => (
                          <p
                            key={chapter.id}
                            className="text-sm text-muted-foreground"
                          >
                            · {chapter.title}
                          </p>
                        ))}
                        {module.chapters.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            외 {module.chapters.length - 3}개 챕터
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Progress & Action */}
                    <div className="md:w-48 space-y-3 pl-14 md:pl-0">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {moduleProgressCount} / {module.chapters.length}
                          </span>
                          <span className="font-medium">{progressPercent}%</span>
                        </div>
                        <Progress value={progressPercent} className="h-1" />
                      </div>

                      <Button className="w-full" variant="outline">
                        {progressPercent === 0
                          ? "시작하기"
                          : progressPercent === 100
                            ? "복습하기"
                            : "계속하기"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </section>
      </div>
    </>
  );
}
