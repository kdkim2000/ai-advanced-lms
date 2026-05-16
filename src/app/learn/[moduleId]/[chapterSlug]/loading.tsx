import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ChapterLoading() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Chapter Header Skeleton */}
      <div className="border-b bg-muted/30 px-6 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />

              <div className="space-y-2 pt-4">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              <Skeleton className="h-32 w-full rounded-lg" />

              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="border-t bg-background px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <Skeleton className="h-11 w-32" />
            <Skeleton className="h-11 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
