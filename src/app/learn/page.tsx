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

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold">학습 모듈</h1>
          <p className="text-muted-foreground">
            AI Advanced 자격 취득을 위한 6개 모듈입니다.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {modules.map((module) => {
            const moduleProgressCount = getModuleProgress(module.id);
            const progressPercent =
              module.chapters.length > 0
                ? Math.round(
                    (moduleProgressCount / module.chapters.length) * 100
                  )
                : 0;
            const isCompleted = progressPercent === 100;

            return (
              <Card key={module.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <span className="text-4xl">
                      {moduleIcons[module.id] || module.icon}
                    </span>
                    {isCompleted ? (
                      <Badge variant="default" className="bg-green-500">
                        완료
                      </Badge>
                    ) : progressPercent > 0 ? (
                      <Badge variant="secondary">진행 중</Badge>
                    ) : (
                      <Badge variant="outline">미시작</Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">
                    {module.order}. {module.titleKo}
                  </CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="mb-4">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {moduleProgressCount} / {module.chapters.length} 챕터
                        완료
                      </span>
                      <span className="font-medium">{progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">챕터 목록</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {module.chapters.slice(0, 3).map((chapter) => (
                        <li key={chapter.id} className="truncate">
                          • {chapter.title}
                        </li>
                      ))}
                      {module.chapters.length > 3 && (
                        <li className="text-xs">
                          ... 외 {module.chapters.length - 3}개
                        </li>
                      )}
                    </ul>
                  </div>

                  <Button asChild className="mt-4 w-full">
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
    </>
  );
}
