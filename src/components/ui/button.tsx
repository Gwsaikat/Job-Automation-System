import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "emerald" | "amber" | "cyan" | "violet"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px] text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
          {
            "bg-[#4F46E5] text-white shadow-xs hover:bg-[#4338CA]": variant === "default",
            "bg-[#E11D48] text-white shadow-xs hover:bg-[#BE123C]": variant === "destructive",
            "border border-[#E2E8F0] bg-white text-[#334155] shadow-xs hover:bg-[#F8FAFC] hover:text-[#0F172A] hover:border-[#CBD5E1]": variant === "outline",
            "bg-[#F1F5F9] text-[#334155] hover:bg-[#E2E8F0] hover:text-[#0F172A]": variant === "secondary",
            "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]": variant === "ghost",
            "text-[#4F46E5] underline-offset-4 hover:underline": variant === "link",
            "bg-[#10B981] text-white shadow-xs hover:bg-[#059669]": variant === "emerald",
            "bg-[#F59E0B] text-white shadow-xs hover:bg-[#D97706]": variant === "amber",
            "bg-[#0891B2] text-white shadow-xs hover:bg-[#0E7490]": variant === "cyan",
            "bg-[#7C3AED] text-white shadow-xs hover:bg-[#6D28D9]": variant === "violet",
            "h-8 px-3 text-xs": size === "default",
            "h-7 px-2.5 text-[11px]": size === "sm",
            "h-9 px-4 text-sm": size === "lg",
            "h-8 w-8 p-0": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
