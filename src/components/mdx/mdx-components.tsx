import Link from "next/link";
import { cn } from "@/lib/utils";
import { Pre } from "./code-block";
import { Callout } from "./callout";
import { PythonEditor } from "@/components/code";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

// Custom MDX components
export const mdxComponents = {
  // Headings - responsive sizes for mobile
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={cn(
        "mt-8 mb-4 scroll-m-20 text-2xl sm:text-3xl font-bold tracking-tight",
        className
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className={cn(
        "mt-8 mb-4 scroll-m-20 border-b pb-2 text-xl sm:text-2xl font-semibold tracking-tight first:mt-0",
        className
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={cn(
        "mt-6 mb-3 scroll-m-20 text-lg sm:text-xl font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      className={cn(
        "mt-4 mb-2 scroll-m-20 text-base sm:text-lg font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  ),

  // Paragraphs
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn("leading-7 [&:not(:first-child)]:mt-4", className)}
      {...props}
    />
  ),

  // Lists
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className={cn("my-4 ml-6 list-disc [&>li]:mt-2", className)} {...props} />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className={cn("my-4 ml-6 list-decimal [&>li]:mt-2", className)}
      {...props}
    />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className={cn("leading-7", className)} {...props} />
  ),

  // Blockquote
  blockquote: ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className={cn(
        "mt-4 border-l-4 border-primary pl-4 italic text-muted-foreground",
        className
      )}
      {...props}
    />
  ),

  // Inline code - Simple monospace style
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => {
    // Check if it's inline code (not inside pre)
    const isInline = !className?.includes("language-");
    if (isInline) {
      return (
        <code
          className={cn(
            "font-mono text-[0.9em] text-rose-600 dark:text-rose-400",
            className
          )}
          {...props}
        />
      );
    }
    return <code className={className} {...props} />;
  },

  // Code block (pre)
  pre: Pre,

  // Links
  a: ({
    className,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isExternal = href?.startsWith("http");
    if (isExternal) {
      return (
        <a
          className={cn(
            "font-medium text-primary underline underline-offset-4 hover:no-underline",
            className
          )}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        />
      );
    }
    return (
      <Link
        className={cn(
          "font-medium text-primary underline underline-offset-4 hover:no-underline",
          className
        )}
        href={href || "#"}
        {...props}
      />
    );
  },

  // Table
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-x-auto rounded-lg border border-border/50">
      <table className={cn("w-full text-sm", className)} {...props} />
    </div>
  ),
  thead: ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className={cn("bg-muted/30 border-b border-border/50", className)} {...props} />
  ),
  tbody: ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr
      className={cn("border-b border-border/30 transition-colors hover:bg-muted/20", className)}
      {...props}
    />
  ),
  th: ({
    className,
    ...props
  }: React.ThHTMLAttributes<HTMLTableHeaderCellElement>) => (
    <th
      className={cn(
        "h-10 px-3 text-left align-middle font-semibold text-foreground/80",
        className
      )}
      {...props}
    />
  ),
  td: ({
    className,
    ...props
  }: React.TdHTMLAttributes<HTMLTableDataCellElement>) => (
    <td className={cn("px-3 py-2.5 align-middle", className)} {...props} />
  ),

  // Horizontal rule
  hr: ({ ...props }) => <hr className="my-8 border-muted" {...props} />,

  // Image
  img: ({
    className,
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={cn("rounded-lg border my-4", className)}
      alt={alt}
      {...props}
    />
  ),

  // Strong & Em
  strong: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className={cn("font-semibold", className)} {...props} />
  ),
  em: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <em className={cn("italic", className)} {...props} />
  ),

  // Custom components
  Callout,
  PythonEditor,
  Alert: ({
    children,
    variant = "default",
    title,
  }: {
    children: React.ReactNode;
    variant?: "default" | "info" | "warning" | "success" | "error";
    title?: string;
  }) => {
    const icons = {
      default: Info,
      info: Info,
      warning: AlertTriangle,
      success: CheckCircle2,
      error: XCircle,
    };
    const Icon = icons[variant];

    return (
      <Alert className="my-4">
        <Icon className="h-4 w-4" />
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>{children}</AlertDescription>
      </Alert>
    );
  },
};
