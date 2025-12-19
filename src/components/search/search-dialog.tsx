"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, FileText, HelpCircle, ArrowRight } from "lucide-react";
import modulesData from "@/content/modules.json";
import type { Module } from "@/types";

const modules = modulesData.modules as Module[];

// Build search index
const searchItems = [
  // Modules
  ...modules.map((module) => ({
    id: module.id,
    title: module.titleKo,
    description: module.description,
    href: `/learn/${module.id}`,
    type: "module" as const,
    icon: module.icon,
  })),
  // Chapters
  ...modules.flatMap((module) =>
    module.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      description: `${module.titleKo} > ${chapter.title}`,
      href: `/learn/${module.id}/${chapter.slug}`,
      type: "chapter" as const,
      moduleId: module.id,
    }))
  ),
  // Quizzes
  ...modules.map((module) => ({
    id: `quiz-${module.id}`,
    title: `${module.titleKo} 퀴즈`,
    description: `${module.titleKo} 모듈 퀴즈`,
    href: `/quiz/${module.id}`,
    type: "quiz" as const,
  })),
];

const moduleIcons: Record<string, string> = {
  python: "🐍",
  "data-analysis": "📊",
  llm: "🤖",
  "prompt-engineering": "⚡",
  rag: "🔍",
  "fine-tuning": "🎯",
};

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");

  const filteredItems = React.useMemo(() => {
    if (!search) return searchItems;
    const searchLower = search.toLowerCase();
    return searchItems.filter(
      (item) =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
    );
  }, [search]);

  const handleSelect = React.useCallback(
    (href: string) => {
      onOpenChange(false);
      setSearch("");
      router.push(href);
    },
    [router, onOpenChange]
  );

  // Group items by type
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, typeof filteredItems> = {
      module: [],
      chapter: [],
      quiz: [],
    };
    filteredItems.forEach((item) => {
      groups[item.type].push(item);
    });
    return groups;
  }, [filteredItems]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-lg max-w-lg">
        <DialogTitle className="sr-only">검색</DialogTitle>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="학습 콘텐츠 검색..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              검색 결과가 없습니다.
            </Command.Empty>

            {groupedItems.module.length > 0 && (
              <Command.Group heading="모듈">
                {groupedItems.module.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={item.title}
                    onSelect={() => handleSelect(item.href)}
                    className="flex items-center gap-2 cursor-pointer rounded-lg aria-selected:bg-accent"
                  >
                    <span className="text-lg">
                      {moduleIcons[item.id] || "📚"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {groupedItems.chapter.length > 0 && (
              <Command.Group heading="챕터">
                {groupedItems.chapter.slice(0, 10).map((item) => (
                  <Command.Item
                    key={item.id}
                    value={`${item.title} ${item.description}`}
                    onSelect={() => handleSelect(item.href)}
                    className="flex items-center gap-2 cursor-pointer rounded-lg aria-selected:bg-accent"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Command.Item>
                ))}
                {groupedItems.chapter.length > 10 && (
                  <p className="px-2 py-2 text-xs text-muted-foreground">
                    + {groupedItems.chapter.length - 10}개 더 있습니다
                  </p>
                )}
              </Command.Group>
            )}

            {groupedItems.quiz.length > 0 && (
              <Command.Group heading="퀴즈">
                {groupedItems.quiz.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={item.title}
                    onSelect={() => handleSelect(item.href)}
                    className="flex items-center gap-2 cursor-pointer rounded-lg aria-selected:bg-accent"
                  >
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>

          <div className="border-t px-3 py-2">
            <p className="text-xs text-muted-foreground">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">↑↓</span>
              </kbd>{" "}
              이동{" "}
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                Enter
              </kbd>{" "}
              선택{" "}
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                Esc
              </kbd>{" "}
              닫기
            </p>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
