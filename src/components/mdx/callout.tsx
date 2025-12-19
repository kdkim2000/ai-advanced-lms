import { cn } from "@/lib/utils";
import {
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  BookOpen,
} from "lucide-react";

type CalloutType = "info" | "warning" | "success" | "error" | "tip" | "note";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const calloutConfig: Record<
  CalloutType,
  {
    icon: React.ElementType;
    bgColor: string;
    borderColor: string;
    iconColor: string;
    titleColor: string;
  }
> = {
  info: {
    icon: Info,
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    titleColor: "text-blue-800 dark:text-blue-200",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    titleColor: "text-yellow-800 dark:text-yellow-200",
  },
  success: {
    icon: CheckCircle2,
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
    iconColor: "text-green-600 dark:text-green-400",
    titleColor: "text-green-800 dark:text-green-200",
  },
  error: {
    icon: XCircle,
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    iconColor: "text-red-600 dark:text-red-400",
    titleColor: "text-red-800 dark:text-red-200",
  },
  tip: {
    icon: Lightbulb,
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    iconColor: "text-purple-600 dark:text-purple-400",
    titleColor: "text-purple-800 dark:text-purple-200",
  },
  note: {
    icon: BookOpen,
    bgColor: "bg-gray-50 dark:bg-gray-900/50",
    borderColor: "border-gray-200 dark:border-gray-700",
    iconColor: "text-gray-600 dark:text-gray-400",
    titleColor: "text-gray-800 dark:text-gray-200",
  },
};

const defaultTitles: Record<CalloutType, string> = {
  info: "정보",
  warning: "주의",
  success: "성공",
  error: "오류",
  tip: "팁",
  note: "노트",
};

export function Callout({
  type = "info",
  title,
  children,
  className,
}: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "my-4 rounded-lg border p-4",
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", config.iconColor)} />
        <div className="flex-1">
          <p className={cn("font-semibold", config.titleColor)}>
            {title || defaultTitles[type]}
          </p>
          <div className="mt-1 text-sm text-muted-foreground">{children}</div>
        </div>
      </div>
    </div>
  );
}
