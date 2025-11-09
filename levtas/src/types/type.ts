import { $Enums } from "@prisma/client";

export type Task = {
  id: number;
  title: string;
  status: $Enums.Status ;
  difficulty: number;
  priority: $Enums.Priority ;
  category: string;
  createdAt: string;
  completedAt?: string;
};

export interface Level {
  current: number;
  xp: number;
  xpForNext: number;
}

export interface Filters {
  q: string;
  status: "all" | $Enums.Status;
  category: "all" | string;
}

export const PRIORITY: Record<$Enums.Priority, string> = { LOW: "低", MID: "中", HIGH: "高" };
export const DIFF_LABEL = ["かんたん", "やさしめ", "ふつう", "むずかしめ", "激ムズ"] as const;