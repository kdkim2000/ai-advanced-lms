"use client";

import { useTheme } from "next-themes";
import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Moon, Sun, Monitor, Trash2 } from "lucide-react";
import { useProgressStore } from "@/stores/progress-store";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { resetProgress, progress } = useProgressStore();

  const handleResetProgress = () => {
    if (
      confirm(
        "정말로 모든 학습 진행 상황을 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다."
      )
    ) {
      resetProgress();
    }
  };

  const totalCompleted = Object.values(progress.moduleProgress).reduce(
    (sum, mp) => sum + mp.completedChapters.length,
    0
  );

  return (
    <>
      <Header
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "설정" }]}
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div>
          <h1 className="text-2xl font-bold">설정</h1>
          <p className="text-muted-foreground">앱 설정을 관리합니다.</p>
        </div>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle>테마</CardTitle>
            <CardDescription>앱의 테마를 선택합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                라이트
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                다크
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                onClick={() => setTheme("system")}
                className="flex items-center gap-2"
              >
                <Monitor className="h-4 w-4" />
                시스템
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Data */}
        <Card>
          <CardHeader>
            <CardTitle>학습 데이터</CardTitle>
            <CardDescription>
              학습 진행 상황 데이터를 관리합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">현재 진행 상황</p>
                  <p className="text-sm text-muted-foreground">
                    완료한 챕터: {totalCompleted}개
                  </p>
                  <p className="text-sm text-muted-foreground">
                    북마크: {progress.bookmarks.length}개
                  </p>
                  <p className="text-sm text-muted-foreground">
                    메모: {Object.keys(progress.notes).length}개
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
              <div>
                <p className="font-medium text-destructive">진행 상황 초기화</p>
                <p className="text-sm text-muted-foreground">
                  모든 학습 진행 상황, 북마크, 메모를 삭제합니다.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleResetProgress}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                초기화
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>정보</CardTitle>
            <CardDescription>AI Advanced Learning Platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>버전: 1.0.0</p>
            <p>
              AI Advanced 자격 취득을 위한 체계적인 학습 플랫폼입니다.
            </p>
            <p>
              6개 모듈 (Python, Data Analysis, LLM, Prompt Engineering, RAG,
              Fine-Tuning)으로 구성되어 있습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
