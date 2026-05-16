"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

interface ProgressProps
  extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  size?: "thin" | "default" | "thick"
}

function Progress({
  className,
  value,
  size = "default",
  ...props
}: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-secondary overflow-hidden rounded-full",
        size === "thin" && "h-1",
        size === "default" && "h-2",
        size === "thick" && "h-2.5",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full bg-primary transition-all duration-[var(--duration-slow,320ms)] ease-[var(--ease-standard)]"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
