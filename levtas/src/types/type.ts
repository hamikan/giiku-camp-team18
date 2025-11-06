export type Priority = "low" | "mid" | "high";
export type Status = "todo" | "doing" | "done";

export interface Task {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  difficulty: number; // 0..4
  status: Status;
  createdAt: string;
  completedAt?: string;
}

export interface Level {
  current: number;
  xp: number;
  xpForNext: number;
}

export interface Filters {
  q: string;
  status: "all" | Status;
  category: "all" | string;
}

export const PRIORITY: Record<Priority, string> = { low: "低", mid: "中", high: "高" };
export const DIFF_LABEL = ["かんたん", "やさしめ", "ふつう", "むずかしめ", "激ムズ"] as const;