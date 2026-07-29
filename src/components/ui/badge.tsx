import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "indigo" | "emerald" | "amber" | "cyan" | "violet" | "rose"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-[6px] border px-2.5 py-0.5 text-[11px] font-semibold transition-colors",
        {
          "border-transparent bg-[#6366f1]/15 text-[#a5b4fc]": variant === "default",
          "border-transparent bg-[#151820] text-[#9CA3AF]": variant === "secondary",
          "border-transparent bg-[#f43f5e]/15 text-[#fb7185]": variant === "destructive",
          "border-[rgba(255,255,255,0.08)] text-[#9CA3AF]": variant === "outline",
          "border-transparent bg-[#10b981]/15 text-[#34d399]": variant === "success",
          "border-transparent bg-[#f59e0b]/15 text-[#fbbf24]": variant === "warning",
          "border-[rgba(99,102,241,0.25)] bg-[rgba(99,102,241,0.12)] text-[#a5b4fc]": variant === "indigo",
          "border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.12)] text-[#34d399]": variant === "emerald",
          "border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.12)] text-[#fbbf24]": variant === "amber",
          "border-[rgba(6,182,212,0.25)] bg-[rgba(6,182,212,0.12)] text-[#22d3ee]": variant === "cyan",
          "border-[rgba(139,92,246,0.25)] bg-[rgba(139,92,246,0.12)] text-[#a78bfa]": variant === "violet",
          "border-[rgba(244,63,94,0.25)] bg-[rgba(244,63,94,0.12)] text-[#fb7185]": variant === "rose",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
