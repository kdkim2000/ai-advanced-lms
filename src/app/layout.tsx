import type { Metadata, Viewport } from "next";
import { Roboto_Mono, Sora } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import "./globals.css";

// Sora + Roboto Mono: loaded via next/font for optimal performance (avoids CSS @import ordering issues)
// Noto Sans KR: loaded via @font-face in globals.css from /fonts/ (local TTFs)
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AI Advanced Learning Platform",
    template: "%s | AI Advanced",
  },
  description: "AI Advanced 자격 취득을 위한 체계적인 학습 플랫폼. Python, 데이터 분석, LLM, 프롬프트 엔지니어링, RAG, Fine-tuning을 학습하세요.",
  keywords: [
    "AI Advanced",
    "인공지능",
    "머신러닝",
    "Python",
    "LLM",
    "프롬프트 엔지니어링",
    "RAG",
    "Fine-tuning",
    "자격증",
    "학습 플랫폼",
  ],
  authors: [{ name: "AI Advanced LMS" }],
  creator: "AI Advanced LMS",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "AI Advanced Learning Platform",
    title: "AI Advanced Learning Platform",
    description: "AI Advanced 자격 취득을 위한 체계적인 학습 플랫폼",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Advanced Learning Platform",
    description: "AI Advanced 자격 취득을 위한 체계적인 학습 플랫폼",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${sora.variable} ${robotoMono.variable} font-sans antialiased`}
      >
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none"
        >
          본문으로 건너뛰기
        </a>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <main id="main-content" className="flex flex-1 flex-col">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
