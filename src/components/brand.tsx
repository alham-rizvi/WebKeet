import { cn } from "@/lib/utils";

type BrandProps = {
  className?: string | undefined;
  markClassName?: string | undefined;
};

type BrandMarkProps = {
  className?: string | undefined;
  imgClassName?: string | undefined;
};

/**
 * The WebKeet mark, always presented on its original white field so the dark
 * grey "W" keeps its contrast in both colour modes. The artwork is never
 * recoloured or redrawn — only resized.
 */
export function BrandMark({ className, imgClassName }: BrandMarkProps) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center overflow-hidden rounded-sm border border-brand-surface-border bg-brand-surface",
        className,
      )}
      aria-hidden="true"
    >
      <img
        src="/favicon.png"
        alt=""
        width={256}
        height={256}
        loading="eager"
        className={cn("size-6 object-contain", imgClassName)}
      />
    </span>
  );
}

export function Brand({ className, markClassName }: BrandProps) {
  return (
    <span className={cn("flex min-w-0 items-center gap-2", className)}>
      <BrandMark className={markClassName} />
      <span className="truncate text-lg font-semibold tracking-tight">
        WebKeet<span className="text-signal">.</span>
      </span>
    </span>
  );
}
