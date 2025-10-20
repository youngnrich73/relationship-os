// src/components/ui/button.tsx
import * as React from "react";
import { cn } from "@/utils/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "ghost";
};

export function Button({ className, variant = "default", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none h-9 px-3";
  const styles =
    variant === "ghost"
      ? "bg-transparent hover:bg-gray-100 text-gray-900"
      : "bg-primary text-white hover:opacity-90";
  return <button className={cn(base, styles, className)} {...props} />;
}
