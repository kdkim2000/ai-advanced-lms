import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <h2 className="mt-4 text-2xl font-semibold">페이지를 찾을 수 없습니다</h2>
        <p className="mt-2 text-muted-foreground">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              홈으로
            </Link>
          </Button>
          <Button asChild>
            <Link href="/learn">
              <ArrowLeft className="mr-2 h-4 w-4" />
              학습 목록
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
