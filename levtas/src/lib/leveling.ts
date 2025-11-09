// src/lib/leveling.ts
import { Priority } from "@prisma/client";

/** レベルNの必要XP（例: レベル1→100、以後×1.2で増加） */
export const XP_BASE = 100;
export const XP_GROWTH = 1.2;

export function capForLevel(level: number): number {
  const lv = Math.max(1, level);
  return Math.round(XP_BASE * Math.pow(XP_GROWTH, lv - 1));
}

/** 既存UIに合わせた難易度→XP。priorityで倍率をかける */
export function xpForDifficulty(diff: number): number {
  return (diff + 1) * 10;
}

export function priorityMultiplier(p: Priority): number {
  switch (p) {
    case "LOW":
      return 1;
    case "MID":
      return 1.5;
    case "HIGH":
      return 2;
    default:
      return 1;
  }
}

/** タスク1件で得られるXP（難易度×優先度） */
export function xpForTask(diff: number, priority: Priority): number {
  return Math.round(xpForDifficulty(diff) * priorityMultiplier(priority));
}

/** XPの増減を現在の(level, exp)に適用して正規化（レベリング） */
export function applyXp(
  currentLevel: number,
  currentExp: number,
  deltaXp: number
): { level: number; exp: number } {
  let level = Math.max(1, currentLevel || 1);
  let exp = Math.max(0, currentExp || 0);

  exp += deltaXp;

  // レベルアップ
  while (exp >= capForLevel(level)) {
    exp -= capForLevel(level);
    level += 1;
  }

  // レベルダウン（expがマイナスの間）
  while (exp < 0 && level > 1) {
    level -= 1;
    exp += capForLevel(level);
  }

  // レベル1でさらにマイナスなら0に丸める
  if (level === 1 && exp < 0) exp = 0;

  return { level, exp };
}
