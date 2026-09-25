import { Bug, Cloud, Code2, FileSearch, KeyRound, Lock, Network, Puzzle, Server, ShieldAlert, type LucideIcon } from "lucide-react";

export const CATEGORY_META: Record<string, { icon: LucideIcon; tone: string }> = {
  "Web Application Security": { icon: Bug, tone: "red" },
  "Authentication and Session": { icon: KeyRound, tone: "amber" },
  "API Security": { icon: Server, tone: "blue" },
  "Access Control and Business Logic": { icon: ShieldAlert, tone: "violet" },
  "Cryptography": { icon: Lock, tone: "teal" },
  "Cloud and Container Security": { icon: Cloud, tone: "blue" },
  "Linux and Network Basics": { icon: Network, tone: "green" },
  "Secure Code Review": { icon: Code2, tone: "slate" },
  "Forensics and Logs": { icon: FileSearch, tone: "amber" },
  "Reverse Engineering and Misc": { icon: Puzzle, tone: "violet" },
};
export const categoryMeta = (c: string) => CATEGORY_META[c] ?? { icon: Bug, tone: "green" };

export const DIFFICULTY_LABEL: Record<string, string> = { Beginner: "Easy", Intermediate: "Medium", Advanced: "Hard" };
export const DIFFICULTY_CLASS: Record<string, string> = { Beginner: "text-easy", Intermediate: "text-medium", Advanced: "text-hard" };
