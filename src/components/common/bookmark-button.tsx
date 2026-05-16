"use client";

import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { useProgressStore } from "@/stores/progress-store";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
  chapterId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
  showLabel?: boolean;
}

export function BookmarkButton({
  chapterId,
  variant = "ghost",
  size = "icon-sm",
  showLabel = false,
}: BookmarkButtonProps) {
  const { toggleBookmark, isBookmarked } = useProgressStore();
  const bookmarked = isBookmarked(chapterId);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => toggleBookmark(chapterId)}
      className={cn(
        bookmarked && "text-yellow-500 hover:text-yellow-600"
      )}
      title={bookmarked ? "북마크 해제" : "북마크 추가"}
    >
      <Bookmark
        className={cn(
          "h-4 w-4",
          showLabel && "mr-2",
          bookmarked && "fill-current"
        )}
      />
      {showLabel && (bookmarked ? "북마크됨" : "북마크")}
    </Button>
  );
}
