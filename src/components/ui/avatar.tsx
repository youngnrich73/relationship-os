// src/components/ui/avatar.tsx
import * as React from "react";
import { cn } from "@/utils/cn";

export function Avatar({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-gray-700",
        className
      )}
    >
      {children}
    </div>
  );
}
export function AvatarFallback({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
