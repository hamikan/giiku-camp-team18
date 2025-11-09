"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Status, type Priority } from "@prisma/client";
import { xpForTask } from "@/lib/leveling";

/**
 * タスクの完了/未完了をトグルし、それに応じてユーザーの exp を増減させる。
 * level は DB に持たないため、exp だけ更新（レベル表示は読み出し側で導出）。
 */
export async function toggleTask(id: number) {
  await prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({
      where: { id },
      select: { id: true, status: true, difficulty: true, priority: true, userId: true },
    });
    if (!task) return;

    // 完了→未完 ならマイナス、未完→完了 ならプラス
    const sign = task.status === Status.DONE ? -1 : 1;
    const delta = sign * xpForTask(task.difficulty, task.priority as Priority);

    // タスク更新
    await tx.task.update({
      where: { id: task.id },
      data: {
        status: task.status === Status.DONE ? Status.TODO : Status.DONE,
        completedAt: task.status === Status.DONE ? null : new Date(),
      },
    });

    // exp のみ更新（負にならないように下限 0）
    const u = await tx.user.findUnique({
      where: { id: task.userId },
      select: { exp: true },
    });
    if (!u) throw new Error(`User not found (id=${task.userId})`);

    const nextExp = Math.max(0, u.exp + delta);
    await tx.user.update({
      where: { id: task.userId },
      data: { exp: nextExp },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/history");
}

export async function deleteTask(id: number) {
  // ※完了済み削除時に XP を戻したい運用なら、ここでも delta を計算して exp を調整する
  await prisma.task.delete({ where: { id } });
  revalidatePath("/dashboard");
  revalidatePath("/history");
}

/**
 * 追加は従来どおり。priority は Prisma の enum を受け取る。
 */
export async function createTask(input: {
  userId: number;
  title: string;
  priority: Priority;      // 小文字が来る場合は呼び出し側で正規化してから渡す
  difficulty: number;
  categoryName: string;
}) {
  const user = await prisma.user.findUnique({ where: { id: input.userId }, select: { id: true } });
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
