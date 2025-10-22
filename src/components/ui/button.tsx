// src/components/ui/button.tsx
import * as React from "react";
import { cn } from "@/utils/cn";

type Variant = "default"|"ghost"|"outline"|"subtle";
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export function Button({ className, variant="default", ...props }: Props){
  const base =
    "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors " +
    "focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none " +
    "h-10 px-4";
  const styles =
    variant==="ghost"  ? "bg-transparent text-gray-700 hover:bg-primary/10 hover:text-primary"
  : variant==="outline"? "bg-white border border-gray-200 text-gray-800 hover:bg-gray-50"
  : variant==="subtle" ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
  :                     "bg-primary text-white hover:opacity-90";
  return <button className={cn(base, styles, className)} {...props} />;
}
