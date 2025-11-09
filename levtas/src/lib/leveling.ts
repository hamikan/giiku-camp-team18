// src/lib/leveling.ts
import { Priority } from "@prisma/client";

export const XP_BASE = 100;
export const XP_GROWTH = 1.2;

export function capForLevel(level: number): number {
  const lv = Math.max(1, level);
  return Math.round(XP_BASE * Math.pow(XP_GROWTH, lv - 1));
}

export function xpForDifficulty(diff: number): number {
  return (diff + 1) * 10;
}

export function priorityMultiplier(p: Priority): number {
  switch (p) {
    case Priority.LOW:  return 1;
    case Priority.MID:  return 1.5;
    case Priority.HIGH: return 2;
    default:     return 1;
  }
}

export function xpForTask(diff: number, priority: Priority): number {
  return Math.round(xpForDifficulty(diff) * priorityMultiplier(priority));
}

/** 重要：累計EXP(totalExp)から {level, レベル内の残XP, 次必要XP} を導出 */
export function deriveLevelFromTotalExp(totalExp: number): {
  level: number;
  xpIntoLevel: number;  // そのレベル内での現在XP
  xpForNext: number;    // 次レベル到達に必要なXP
} {
  let level = 1;
  let remaining = Math.max(0, totalExp || 0);

  while (true) {
    const cap = capForLevel(level);
    if (remaining < cap) {
      return { level, xpIntoLevel: remaining, xpForNext: cap };
    }
    remaining -= cap;
    level += 1;
  }
}

/** 差分XPを累計に足してからレベルを再計算したい時用のユーティリティ */
export function applyTotalXp(totalExp: number, deltaXp: number) {
  return deriveLevelFromTotalExp(Math.max(0, (totalExp || 0) + deltaXp));
}
