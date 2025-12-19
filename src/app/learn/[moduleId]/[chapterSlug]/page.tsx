import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { ChapterClient, ChapterFooter } from "@/components/learn/chapter-client";
import { MDXContent } from "@/components/mdx";
import { getChapterContent, chapterContentExists } from "@/lib/mdx";
import modulesData from "@/content/modules.json";
import type { Module } from "@/types";

const modules = modulesData.modules as Module[];

// Generate dynamic metadata for each chapter
export async function generateMetadata({
  params,
}: {
  params: Promise<{ moduleId: string; chapterSlug: string }>;
}): Promise<Metadata> {
  const { moduleId, chapterSlug } = await params;
  const currentModule = modules.find((m) => m.id === moduleId);
  const chapter = currentModule?.chapters.find((c) => c.slug === chapterSlug);

  if (!currentModule || !chapter) {
    return {
      title: "챕터를 찾을 수 없습니다",
    };
  }

  return {
    title: `${chapter.title} - ${currentModule.titleKo}`,
    description: chapter.description || `${currentModule.titleKo} 모듈의 ${chapter.title} 챕터를 학습합니다.`,
    openGraph: {
      title: `${chapter.title} - ${currentModule.titleKo}`,
      description: chapter.description || `${currentModule.titleKo} 모듈의 ${chapter.title} 챕터를 학습합니다.`,
    },
  };
}

const moduleIcons: Record<string, string> = {
  python: "🐍",
  "data-analysis": "📊",
  llm: "🤖",
  "prompt-engineering": "⚡",
  rag: "🔍",
  "fine-tuning": "🎯",
};

interface ChapterPageProps {
  params: Promise<{ moduleId: string; chapterSlug: string }>;
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { moduleId, chapterSlug } = await params;
  const currentModule = modules.find((m) => m.id === moduleId);
  const chapter = currentModule?.chapters.find((c) => c.slug === chapterSlug);

  if (!currentModule || !chapter) {
    notFound();
  }

  const chapterIndex = currentModule.chapters.findIndex((c) => c.id === chapter.id);
  const prevChapter = chapterIndex > 0 ? currentModule.chapters[chapterIndex - 1] : null;
  const nextChapter =
    chapterIndex < currentModule.chapters.length - 1
      ? currentModule.chapters[chapterIndex + 1]
      : null;

  const currentModuleIndex = modules.findIndex((m) => m.id === currentModule.id);
  const nextModule =
    currentModuleIndex < modules.length - 1
      ? modules[currentModuleIndex + 1]
      : null;
  const nextModuleFirstChapter = nextModule?.chapters[0] || null;

  // Get MDX content if available
  const hasContent = chapterContentExists(moduleId, chapterSlug);
  const chapterContent = hasContent ? getChapterContent(moduleId, chapterSlug) : null;

  return (
    <>
      <Header
        breadcrumbs={[
          { label: "홈", href: "/" },
          { label: "학습", href: "/learn" },
          { label: currentModule.titleKo, href: `/learn/${currentModule.id}` },
          { label: chapter.title },
        ]}
      />

      <div className="flex flex-1 flex-col">
        {/* Chapter Header */}
        <div className="border-b bg-muted/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {moduleIcons[currentModule.id] || currentModule.icon}
              </span>
              <div>
                <p className="text-sm text-muted-foreground">
                  {currentModule.titleKo} • 챕터 {chapterIndex + 1} / {currentModule.chapters.length}
                </p>
                <h1 className="text-xl font-bold">{chapter.title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ChapterClient
                module={currentModule}
                chapter={chapter}
                chapterIndex={chapterIndex}
                prevChapter={prevChapter}
                nextChapter={nextChapter}
                nextModule={nextModule}
                nextModuleFirstChapter={nextModuleFirstChapter}
              />
            </div>
          </div>
        </div>

        {/* Chapter Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {chapterContent ? (
              <Card>
                <CardContent className="p-8">
                  <MDXContent source={chapterContent.content} />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8">
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
                      <p className="text-lg font-medium text-muted-foreground">
                        콘텐츠 준비 중
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        이 챕터의 콘텐츠가 아직 준비되지 않았습니다.
                      </p>
                      <p className="mt-4 text-sm text-muted-foreground">
                        Notebook 변환 스크립트를 실행하여 콘텐츠를 생성하세요:
                      </p>
                      <code className="mt-2 block rounded bg-muted px-4 py-2 text-sm">
                        node scripts/convert-notebooks.js
                      </code>
                    </div>

                    {chapter.description && (
                      <div className="mt-6 rounded-lg bg-muted p-4">
                        <h3 className="font-semibold">이 챕터에서 배울 내용</h3>
                        <p className="mt-1 text-muted-foreground">
                          {chapter.description}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Chapter Footer */}
        <ChapterFooter
          module={currentModule}
          chapter={chapter}
          prevChapter={prevChapter}
          nextChapter={nextChapter}
          nextModule={nextModule}
          nextModuleFirstChapter={nextModuleFirstChapter}
        />
      </div>
    </>
  );
}

// Generate static params for all chapters
export async function generateStaticParams() {
  const params: { moduleId: string; chapterSlug: string }[] = [];

  for (const mod of modules) {
    for (const chapter of mod.chapters) {
      params.push({
        moduleId: mod.id,
        chapterSlug: chapter.slug,
      });
    }
  }

  return params;
}
