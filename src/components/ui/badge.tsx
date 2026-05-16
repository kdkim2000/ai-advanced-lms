import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[--bg-primary-tint] text-accent-foreground",
        secondary:
          "border-transparent bg-[--bg-neutral-tint] text-muted-foreground",
        destructive:
          "border-transparent bg-[--bg-error-tint] text-destructive",
        outline:
          "border-[--border-neutral] text-foreground",
        success:
          "border-transparent bg-[--bg-success-tint] text-[color:var(--success)]",
        warning:
          "border-transparent bg-[--bg-warning-tint] text-[color:var(--warning)]",
        info:
          "border-transparent bg-[--bg-info-tint] text-[color:var(--info)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
