import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[clamp(0.8rem,0.76rem+0.2vw,0.92rem)] font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[clamp(0.95rem,0.86rem+0.35vw,1.1rem)] shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_0_28px_var(--cta-glow-soft)] hover:bg-primary/92 hover:shadow-[0_0_38px_var(--cta-glow)]",
        destructive:
          "bg-destructive text-white shadow-[0_0_18px_rgba(220,38,38,0.18)] hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border border-white/28 bg-white/4 text-white/78 shadow-none hover:bg-white/8 hover:text-white dark:bg-white/4 dark:border-white/20 dark:hover:bg-white/8",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "text-white/72 hover:bg-white/7 hover:text-white dark:hover:bg-white/8",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-3.5 py-2 has-[>svg]:px-3 sm:h-9",
        sm: "h-9 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 sm:h-8",
        lg: "h-11 rounded-xl px-5 text-[clamp(0.95rem,0.9rem+0.35vw,1.08rem)] has-[>svg]:px-4 sm:h-12 sm:px-7",
        icon: "size-10 sm:size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
