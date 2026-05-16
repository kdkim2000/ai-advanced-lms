"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Settings,
  Check,
  HelpCircle,
} from "lucide-react";
import modulesData from "@/content/modules.json";
import { useProgressStore } from "@/stores/progress-store";
import type { Module } from "@/types";

const modules = modulesData.modules as Module[];

// Icon mapping for modules
const moduleIcons: Record<string, string> = {
  python: "🐍",
  "data-analysis": "📊",
  llm: "🤖",
  "prompt-engineering": "⚡",
  rag: "🔍",
  "fine-tuning": "🎯",
};

export function AppSidebar() {
  const pathname = usePathname();
  const { progress, getModuleProgress } = useProgressStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for hydration to complete before showing progress
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional hydration detection
    setIsHydrated(true);
  }, []);

  // Calculate total chapters and progress
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

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GraduationCap className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">AI Advanced</span>
                  <span className="text-xs text-muted-foreground">
                    Learning Platform
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"}>
                  <Link href="/">
                    <Home className="size-4" />
                    <span>홈</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard"}
                >
                  <Link href="/dashboard">
                    <BookOpen className="size-4" />
                    <span>대시보드</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/quiz")}
                >
                  <Link href="/quiz">
                    <HelpCircle className="size-4" />
                    <span>퀴즈</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Modules */}
        <SidebarGroup>
          <SidebarGroupLabel>학습 모듈</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {modules.map((module) => {
                const moduleProgress = isHydrated ? getModuleProgress(module.id) : 0;
                const isModuleActive = pathname.startsWith(
                  `/learn/${module.id}`
                );
                const progressPercent =
                  module.chapters.length > 0
                    ? Math.round(
                        (moduleProgress / module.chapters.length) * 100
                      )
                    : 0;

                return (
                  <Collapsible
                    key={module.id}
                    asChild
                    defaultOpen={isModuleActive}
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={module.titleKo}
                          isActive={isModuleActive}
                        >
                          <span className="text-base">
                            {moduleIcons[module.id] || module.icon}
                          </span>
                          <span className="flex-1">{module.titleKo}</span>
                          {isHydrated && progressPercent === 100 ? (
                            <Check className="size-4 text-[color:var(--success)]" />
                          ) : isHydrated && progressPercent > 0 ? (
                            <Badge variant="secondary" className="text-xs">
                              {progressPercent}%
                            </Badge>
                          ) : null}
                          <ChevronRight className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {module.chapters.map((chapter) => {
                            const isChapterComplete =
                              isHydrated &&
                              progress.moduleProgress[
                                module.id
                              ]?.completedChapters.includes(chapter.id);
                            const isChapterActive =
                              pathname ===
                              `/learn/${module.id}/${chapter.slug}`;

                            return (
                              <SidebarMenuSubItem key={chapter.id}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={isChapterActive}
                                >
                                  <Link
                                    href={`/learn/${module.id}/${chapter.slug}`}
                                  >
                                    {isChapterComplete && (
                                      <Check className="size-3 text-[color:var(--success)] mr-1" />
                                    )}
                                    <span
                                      className={
                                        isChapterComplete
                                          ? "text-muted-foreground"
                                          : ""
                                      }
                                    >
                                      {chapter.title}
                                    </span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="px-2 py-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>전체 진행률</span>
                <span>{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/settings">
                <Settings className="size-4" />
                <span>설정</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
