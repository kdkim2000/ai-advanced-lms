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
    bgColor: "bg-[--bg-info-tint]",
    borderColor: "border-[color:var(--info)]/30",
    iconColor: "text-[color:var(--info)]",
    titleColor: "text-[color:var(--info)]",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-[--bg-warning-tint]",
    borderColor: "border-[color:var(--warning)]/30",
    iconColor: "text-[color:var(--warning)]",
    titleColor: "text-[color:var(--warning)]",
  },
  success: {
    icon: CheckCircle2,
    bgColor: "bg-[--bg-success-tint]",
    borderColor: "border-[color:var(--success)]/30",
    iconColor: "text-[color:var(--success)]",
    titleColor: "text-[color:var(--success)]",
  },
  error: {
    icon: XCircle,
    bgColor: "bg-[--bg-error-tint]",
    borderColor: "border-destructive/30",
    iconColor: "text-destructive",
    titleColor: "text-destructive",
  },
  tip: {
    icon: Lightbulb,
    bgColor: "bg-[--bg-primary-tint]",
    borderColor: "border-[color:var(--border-primary)]/30",
    iconColor: "text-[color:var(--accent-foreground)]",
    titleColor: "text-[color:var(--accent-foreground)]",
  },
  note: {
    icon: BookOpen,
    bgColor: "bg-[--bg-subtle]",
    borderColor: "border-[--border-subtle]",
    iconColor: "text-muted-foreground",
    titleColor: "text-foreground",
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
