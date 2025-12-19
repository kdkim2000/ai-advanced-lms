"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { StickyNote, ChevronDown, Save, Trash2 } from "lucide-react";
import { useProgressStore } from "@/stores/progress-store";
import { cn } from "@/lib/utils";

interface NoteEditorProps {
  chapterId: string;
}

export function NoteEditor({ chapterId }: NoteEditorProps) {
  const { progress, setNote } = useProgressStore();
  const savedNote = progress.notes[chapterId] || "";

  const [isOpen, setIsOpen] = useState(false);
  const [note, setNoteText] = useState(savedNote);
  const [isSaved, setIsSaved] = useState(true);

  // Sync with store when chapterId changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing local state with store
    setNoteText(progress.notes[chapterId] || "");
    setIsSaved(true);
  }, [chapterId, progress.notes]);

  const handleChange = useCallback((value: string) => {
    setNoteText(value);
    setIsSaved(false);
  }, []);

  const handleSave = useCallback(() => {
    setNote(chapterId, note);
    setIsSaved(true);
  }, [chapterId, note, setNote]);

  const handleClear = useCallback(() => {
    setNoteText("");
    setNote(chapterId, "");
    setIsSaved(true);
  }, [chapterId, setNote]);

  // Auto-save on blur
  const handleBlur = useCallback(() => {
    if (!isSaved && note !== savedNote) {
      handleSave();
    }
  }, [isSaved, note, savedNote, handleSave]);

  const hasNote = savedNote.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-full justify-between",
            hasNote && "border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-950/20"
          )}
        >
          <span className="flex items-center gap-2">
            <StickyNote className={cn("h-4 w-4", hasNote && "text-yellow-600")} />
            내 메모
            {hasNote && (
              <span className="text-xs text-muted-foreground">
                ({savedNote.length}자)
              </span>
            )}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="space-y-2">
          <Textarea
            placeholder="이 챕터에 대한 메모를 작성하세요..."
            value={note}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            className="min-h-[100px] resize-y"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {isSaved ? (
                note ? "저장됨" : "메모가 없습니다"
              ) : (
                "저장되지 않음"
              )}
            </span>
            <div className="flex gap-2">
              {note && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-7 text-xs text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  삭제
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={isSaved}
                className="h-7 text-xs"
              >
                <Save className="h-3 w-3 mr-1" />
                저장
              </Button>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
