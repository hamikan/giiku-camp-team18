// src/server/actions/taskActions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Status, Priority } from "@prisma/client";
import { xpForTask, applyXp } from "@/lib/leveling";

// 文字列→Prisma enum への正規化マップ
const PRIORITY_MAP: Record<string, Priority> = {
  low: Priority.LOW,
  mid: Priority.MID,
  high: Priority.HIGH,
  LOW: Priority.LOW,
  MID: Priority.MID,
  HIGH: Priority.HIGH,
};

export async function toggleTask(id: number) {
  await prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({
      where: { id },
      select: { id: true, status: true, difficulty: true, priority: true, userId: true },
    });
    if (!task) return;

    // 今回のトグルで発生するXP
    const delta = task.status === Status.DONE
      ? -xpForTask(task.difficulty, task.priority as Priority)
      : +xpForTask(task.difficulty, task.priority as Priority);

    // タスク側を更新
    await tx.task.update({
      where: { id: task.id },
      data: {
        status: task.status === Status.DONE ? Status.TODO : Status.DONE,
        completedAt: task.status === Status.DONE ? null : new Date(),
      },
    });

    // ユーザーの現在レベル/XPを取得
    const user = await tx.user.findUnique({
      where: { id: task.userId },
      select: { level: true, exp: true },
    });
    if (!user) throw new Error(`User not found for userId=${task.userId}`);

    // XP適用→正規化
    const { level, exp } = applyXp(user.level, user.exp, delta);

    // ユーザーを更新
    await tx.user.update({
      where: { id: task.userId },
      data: { level, exp },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/history");
}

export async function deleteTask(id: number) {
  // （任意）完了済みタスクを削除したらXPを減らす運用にしたい場合は
  // ここでも同様に delta を計算し、applyXp してから削除する。
  await prisma.task.delete({ where: { id } });
  revalidatePath("/dashboard");
  revalidatePath("/history");
}

/** 既存の createTask はそのままでOK（レベリングはトグル時にのみ） */
export async function createTask(input: {
  userId: number;
  title: string;
  priority: Priority;          // ここは既にenumで来る想定（小文字なら正規化してから呼ぶ）
  difficulty: number;
  categoryName: string;
}) {
  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) throw new Error(`User not found (userId=${input.userId})`);

  const cat = await prisma.category.upsert({
    where: { name: input.categoryName },
    update: {},
    create: { name: input.categoryName },
    select: { id: true },
  });

  await prisma.task.create({
    data: {
      userId: input.userId,
      title: input.title,
      priority: input.priority,
      difficulty: input.difficulty,
      status: Status.TODO,
      categoryId: cat.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/history");
}