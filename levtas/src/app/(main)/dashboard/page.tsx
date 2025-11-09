// app/(main)/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/dashboard/dashboardClient";
import type { Task } from "@/types/type";
import { Status } from "@prisma/client";
import { deriveLevelFromTotalExp } from "@/lib/leveling";

const USER_ID = 1;

type Level = { current: number; xp: number; xpForNext: number };

export default async function Page() {
  // Userの累計EXPのみ取得
  const user = await prisma.user.findUnique({
    where: { id: USER_ID },
    select: { exp: true },
  });

  const total = user?.exp ?? 0;
  const derived = deriveLevelFromTotalExp(total);
  const level: Level = {
    current: derived.level,
    xp: derived.xpIntoLevel,
    xpForNext: derived.xpForNext,
  };

  const tasksDb = await prisma.task.findMany({
    where: { userId: USER_ID },
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const tasks: Task[] = tasksDb.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    difficulty: t.difficulty,
    priority: t.priority,
    category: t.category?.name ?? "uncategorized",
    createdAt: t.createdAt.toISOString(),
    completedAt: t.completedAt?.toISOString(),
  }));

  const completed = tasks.filter((t) => t.status === Status.DONE);

  const today = new Date();
  const dailySeries = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (13 - i));
    const key = d.toDateString();
    const count = completed.filter((t) =>
      t.completedAt ? new Date(t.completedAt).toDateString() === key : false
    ).length;
    return { date: `${d.getMonth() + 1}/${d.getDate()}`, complete: count, 完了: count as unknown as number };
  });

  const catCount = new Map<string, number>();
  for (const t of completed) {
    catCount.set(t.category, (catCount.get(t.category) ?? 0) + 1);
  }
  const categorySeries = Array.from(catCount.entries()).map(([name, value]) => ({ name, value }));
  const categories = ["all", ...Array.from(new Set(tasks.map((t) => t.category)))];

  return (
    <DashboardClient
      initialTasks={tasks}
      initialLevel={level}
      initialDailySeries={dailySeries}
      initialCategorySeries={categorySeries}
      initialCategories={categories}
    />
  );
}
