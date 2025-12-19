"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertOctagon, Home, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertOctagon className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle>오류가 발생했습니다</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            예상치 못한 오류가 발생했습니다.
            <br />
            문제가 지속되면 페이지를 새로고침 해주세요.
          </p>

          {error.digest && (
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground">
                오류 코드: {error.digest}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={reset} variant="outline" className="flex-1">
              <RotateCcw className="mr-2 h-4 w-4" />
              다시 시도
            </Button>
            <Button asChild className="flex-1">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                홈으로
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
