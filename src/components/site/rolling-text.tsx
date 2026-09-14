import { cn } from "@/lib/utils";

/** Two-line rolling text — hover rolls the label up into its accent copy. */
export function RollingText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn("relative block overflow-hidden leading-[1.15]", className)}>
      <span className="block transition-transform duration-300 ease-out group-hover/roll:-translate-y-full">
        {text}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 block translate-y-full text-primary transition-transform duration-300 ease-out group-hover/roll:translate-y-0"
      >
        {text}
      </span>
    </span>
  );
}
