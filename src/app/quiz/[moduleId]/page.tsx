"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { QuizContainer } from "@/components/quiz";

// Import quiz data
import pythonQuiz from "@/content/quizzes/python.json";
import dataAnalysisQuiz from "@/content/quizzes/data-analysis.json";
import llmQuiz from "@/content/quizzes/llm.json";
import promptEngineeringQuiz from "@/content/quizzes/prompt-engineering.json";
import ragQuiz from "@/content/quizzes/rag.json";
import fineTuningQuiz from "@/content/quizzes/fine-tuning.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const quizzes: Record<string, any> = {
  python: pythonQuiz,
  "data-analysis": dataAnalysisQuiz,
  llm: llmQuiz,
  "prompt-engineering": promptEngineeringQuiz,
  rag: ragQuiz,
  "fine-tuning": fineTuningQuiz,
};

const moduleTitles: Record<string, string> = {
  python: "Python 기초",
  "data-analysis": "데이터 분석",
  llm: "LLM",
  "prompt-engineering": "프롬프트 엔지니어링",
  rag: "RAG",
  "fine-tuning": "Fine-tuning",
};

interface QuizPageProps {
  params: Promise<{ moduleId: string }>;
}

export default function QuizPage({ params }: QuizPageProps) {
  const { moduleId } = use(params);
  const quiz = quizzes[moduleId];

  if (!quiz) {
    notFound();
  }

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "홈", href: "/" },
          { label: "학습", href: "/learn" },
          { label: moduleTitles[moduleId] || moduleId, href: `/learn/${moduleId}` },
          { label: "퀴즈" },
        ]}
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="mx-auto w-full max-w-3xl">
          <QuizContainer quiz={quiz} moduleId={moduleId} />
        </div>
      </div>
    </>
  );
}
