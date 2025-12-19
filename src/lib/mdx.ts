import fs from "fs";
import path from "path";
import matter from "gray-matter";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

// Content directory path
const CONTENT_DIR = path.join(process.cwd(), "src/content/chapters");

export interface ChapterFrontmatter {
  title: string;
  description?: string;
  order?: number;
  summary?: string;
}

export interface ChapterContent {
  frontmatter: ChapterFrontmatter;
  content: string;
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
}

/**
 * Get MDX file path for a chapter
 */
export function getChapterPath(moduleId: string, chapterSlug: string): string {
  return path.join(CONTENT_DIR, moduleId, `${chapterSlug}.mdx`);
}

/**
 * Check if MDX content exists for a chapter
 */
export function chapterContentExists(
  moduleId: string,
  chapterSlug: string
): boolean {
  const filePath = getChapterPath(moduleId, chapterSlug);
  return fs.existsSync(filePath);
}

/**
 * Get raw MDX content for a chapter
 */
export function getChapterContent(
  moduleId: string,
  chapterSlug: string
): ChapterContent | null {
  const filePath = getChapterPath(moduleId, chapterSlug);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  return {
    frontmatter: data as ChapterFrontmatter,
    content,
  };
}

/**
 * Get all chapter slugs for a module (for static generation)
 */
export function getChapterSlugs(moduleId: string): string[] {
  const moduleDir = path.join(CONTENT_DIR, moduleId);

  if (!fs.existsSync(moduleDir)) {
    return [];
  }

  return fs
    .readdirSync(moduleDir)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

/**
 * Get all modules that have content
 */
export function getModulesWithContent(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  return fs
    .readdirSync(CONTENT_DIR)
    .filter((dir) => {
      const dirPath = path.join(CONTENT_DIR, dir);
      return fs.statSync(dirPath).isDirectory();
    });
}

/**
 * Extract table of contents from MDX content
 */
export function extractTableOfContents(content: string): TableOfContentsItem[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const toc: TableOfContentsItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const id = title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s]/g, "")
      .replace(/\s+/g, "-");

    toc.push({ id, title, level });
  }

  return toc;
}

/**
 * MDX compile options
 */
export const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: {
            className: ["anchor"],
          },
        },
      ],
    ],
  },
};
