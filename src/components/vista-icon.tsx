import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  green: "oklch(0.62 0.17 150)", blue: "oklch(0.58 0.15 245)", amber: "oklch(0.72 0.16 70)",
  red: "oklch(0.58 0.2 25)", violet: "oklch(0.55 0.16 295)", teal: "oklch(0.6 0.11 195)", slate: "oklch(0.5 0.03 250)",
};

/** Windows Vista / Aero style glossy icon tile. */
export function VistaIcon({ icon: Icon, tone = "green", size = 36, className }: { icon: LucideIcon; tone?: string | undefined; size?: number; className?: string | undefined }) {
  return (
    <span className={cn("vista-icon shrink-0", className)} style={{ width: size, height: size, "--vista": tones[tone] ?? tone } as CSSProperties} aria-hidden>
      <Icon style={{ width: size * 0.55, height: size * 0.55 }} strokeWidth={2.2} />
    </span>
  );
}
