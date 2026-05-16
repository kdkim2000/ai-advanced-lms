"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  selectedAnswer: number | null;
  isSubmitted: boolean;
  onSelectAnswer: (index: number) => void;
}

export function QuestionCard({
  questionNumber,
  totalQuestions,
  question,
  options,
  correctAnswer,
  explanation,
  selectedAnswer,
  isSubmitted,
  onSelectAnswer,
}: QuestionCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            문제 {questionNumber} / {totalQuestions}
          </Badge>
          {isSubmitted && (
            <Badge
              variant={isCorrect ? "default" : "destructive"}
              className={cn(
                "text-xs",
                isCorrect && "bg-[color:var(--success)] hover:bg-[color:var(--success)]/90"
              )}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  정답
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  오답
                </>
              )}
            </Badge>
          )}
        </div>
        <CardTitle className="text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
          {question}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <fieldset>
          <legend className="sr-only">답변 선택</legend>
          <div className="space-y-2" role="radiogroup" aria-label="답변 선택">
          {options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectOption = correctAnswer === index;
            const showCorrectHighlight = isSubmitted && isCorrectOption;
            const showWrongHighlight = isSubmitted && isSelected && !isCorrect;

            const optionLabel = String.fromCharCode(65 + index);
            const ariaLabel = `${optionLabel}. ${option}${isSelected ? " (선택됨)" : ""}${isSubmitted && isCorrectOption ? " (정답)" : ""}${showWrongHighlight ? " (오답)" : ""}`;

            return (
              <button
                key={index}
                onClick={() => !isSubmitted && onSelectAnswer(index)}
                disabled={isSubmitted}
                role="radio"
                aria-checked={isSelected}
                aria-label={ariaLabel}
                className={cn(
                  "w-full p-3 sm:p-4 text-left rounded-lg border transition-all text-sm sm:text-base",
                  "hover:border-primary hover:bg-primary/5",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  "disabled:cursor-not-allowed",
                  isSelected && !isSubmitted && "border-primary bg-primary/10",
                  showCorrectHighlight &&
                    "border-[color:var(--success)] bg-[--bg-success-tint]",
                  showWrongHighlight &&
                    "border-destructive bg-[--bg-error-tint]"
                )}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex-shrink-0 w-8 h-8 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-sm sm:text-sm font-medium border",
                      isSelected && !isSubmitted
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted border-border",
                      showCorrectHighlight &&
                        "bg-[color:var(--success)] text-white border-[color:var(--success)]",
                      showWrongHighlight &&
                        "bg-destructive text-white border-destructive"
                    )}
                  >
                    {optionLabel}
                  </span>
                  <span className="flex-1 pt-0.5 break-words">{option}</span>
                  {isSubmitted && isCorrectOption && (
                    <CheckCircle2 className="h-5 w-5 text-[color:var(--success)] flex-shrink-0" aria-hidden="true" />
                  )}
                  {showWrongHighlight && (
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0" aria-hidden="true" />
                  )}
                </div>
              </button>
            );
          })}
          </div>
        </fieldset>

        {isSubmitted && (
          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-muted-foreground hover:text-foreground"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              {showExplanation ? "해설 숨기기" : "해설 보기"}
            </Button>

            {showExplanation && (
              <div className="mt-3 p-4 bg-muted/50 rounded-lg border">
                <p className="text-sm leading-relaxed">{explanation}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
