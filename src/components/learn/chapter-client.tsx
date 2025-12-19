"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Check,
} from "lucide-react";
import { useProgressStore } from "@/stores/progress-store";
import { NoteEditor } from "@/components/common/note-editor";
import type { Module, Chapter } from "@/types";

interface ChapterClientProps {
  module: Module;
  chapter: Chapter;
  chapterIndex: number;
  prevChapter: Chapter | null;
  nextChapter: Chapter | null;
  nextModule: Module | null;
  nextModuleFirstChapter: Chapter | null;
}

export function ChapterClient(props: ChapterClientProps) {
  const { chapter } = props;
  const {
    toggleBookmark,
    setLastAccessed,
    isBookmarked,
  } = useProgressStore();

  useEffect(() => {
    setLastAccessed(chapter.id);
  }, [chapter.id, setLastAccessed]);

  const isBookmarkedChapter = isBookmarked(chapter.id);

  return (
    <>
      {/* Bookmark Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => toggleBookmark(chapter.id)}
        title={isBookmarkedChapter ? "북마크 해제" : "북마크"}
      >
        {isBookmarkedChapter ? (
          <BookmarkCheck className="h-5 w-5 text-primary" />
        ) : (
          <Bookmark className="h-5 w-5" />
        )}
      </Button>
    </>
  );
}

export function ChapterFooter({
  module,
  chapter,
  prevChapter,
  nextChapter,
  nextModule,
  nextModuleFirstChapter,
}: Omit<ChapterClientProps, "chapterIndex">) {
  const { progress, markChapterComplete, markChapterIncomplete } =
    useProgressStore();

  const isComplete =
    progress.moduleProgress[module.id]?.completedChapters.includes(chapter.id) ??
    false;

  const handleToggleComplete = () => {
    if (isComplete) {
      markChapterIncomplete(module.id, chapter.id);
    } else {
      markChapterComplete(module.id, chapter.id);
    }
  };

  return (
    <div className="border-t bg-background px-6 py-4">
      <div className="max-w-4xl mx-auto">
        {/* Note Editor */}
        <div className="mb-4">
          <NoteEditor chapterId={chapter.id} />
        </div>

        <Separator className="my-4" />

        {/* Completion Toggle */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <Checkbox
            id="complete"
            checked={isComplete}
            onCheckedChange={handleToggleComplete}
            className="h-5 w-5"
          />
          <label
            htmlFor="complete"
            className="text-sm font-medium cursor-pointer flex items-center gap-2"
          >
            {isComplete ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                학습 완료
              </>
            ) : (
              "이 챕터를 완료로 표시"
            )}
          </label>
        </div>

        <Separator className="my-4" />

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {prevChapter ? (
            <Button variant="outline" asChild>
              <Link href={`/learn/${module.id}/${prevChapter.slug}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">이전: </span>
                <span className="max-w-32 truncate">{prevChapter.title}</span>
              </Link>
            </Button>
          ) : (
            <div />
          )}

          {nextChapter ? (
            <Button asChild>
              <Link href={`/learn/${module.id}/${nextChapter.slug}`}>
                <span className="hidden sm:inline">다음: </span>
                <span className="max-w-32 truncate">{nextChapter.title}</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : nextModuleFirstChapter && nextModule ? (
            <Button asChild>
              <Link href={`/learn/${nextModule.id}/${nextModuleFirstChapter.slug}`}>
                <span className="hidden sm:inline">다음 모듈: </span>
                {nextModule.titleKo}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/dashboard">
                학습 완료!
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
