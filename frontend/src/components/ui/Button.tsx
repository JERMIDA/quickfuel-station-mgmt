import * as React from "react";
import { cn } from "@/src/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300",
          {
            "bg-amber-600 text-white shadow-sm hover:bg-amber-700 hover:shadow-md dark:bg-amber-600 dark:hover:bg-amber-700":
              variant === "default",
            "bg-red-500 text-white shadow-sm hover:bg-red-600 hover:shadow-md dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/90": variant === "destructive",
            "border border-slate-200 bg-white shadow-sm hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50":
              variant === "outline",
            "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80":
              variant === "secondary",
            "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50": variant === "ghost",
            "text-amber-600 underline-offset-4 hover:underline dark:text-amber-500":
              variant === "link",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
