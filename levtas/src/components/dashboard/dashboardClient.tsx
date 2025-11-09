// app/(main)/dashboard/DashboardClient.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "./DashboardView";
import { toggleTask, deleteTask } from "@/server/actions/taskActions";
import { Status } from "@prisma/client";

type Level = { current: number; xp: number; xpForNext: number };

type UITask = {
  id: number;
  title: string;
  status: Status;
  difficulty: number;
  priority: any;
  category: string;
  createdAt: string;
  completedAt?: string;
};

type Filters = { q: string; status: "all" | Status; category: string };

export default function DashboardClient({
  initialTasks,
  initialLevel,
  initialDailySeries,
  initialCategorySeries,
}: {
  initialTasks: UITask[];
  initialLevel: Level;
  initialDailySeries: Array<{ date: string; complete: number; 完了: number }>;
  initialCategorySeries: Array<{ name: string; value: number }>;
  initialCategories: string[];
}) {
  const router = useRouter();

  const [tasks, setTasks] = useState<UITask[]>(initialTasks);
  const [level] = useState<Level>(initialLevel);

  const [filters, setFilters] = useState<Filters>({ q: "", status: "all", category: "all" });

  const completed = useMemo(() => tasks.filter((t) => t.status === Status.DONE), [tasks]);
  const todo = useMemo(() => tasks.filter((t) => t.status !== Status.DONE), [tasks]);

  const filteredTasks = useMemo(() => {
    const list = tasks;
    return list.filter((t) => {
      if (filters.status !== "all" && t.status !== filters.status) return false;
      if (filters.category !== "all" && t.category !== filters.category) return false;
      if (filters.q) {
        const hay = `${t.title} ${t.category}`.toLowerCase();
        if (!hay.includes(filters.q.toLowerCase())) return false;
      }
      return true;
    });
  }, [tasks, filters]);

  // サーバー更新 + 楽観更新（UI形状はそのまま）
  const onToggleDone = async (id: number) => {
  setTasks(prev => prev.map(t => t.id === id
      ? { ...t,
          status: t.status === Status.DONE ? Status.TODO : Status.DONE,
          completedAt: t.status === Status.DONE ? undefined : new Date().toISOString()
        }
      : t));
    await toggleTask(id);
    router.refresh();
  };

  const onDeleteTask = async (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await deleteTask(id);
    router.refresh();
  };

  return (
    <Dashboard
      tasks={tasks}
      completed={completed}
      todo={todo}
      level={level}
      dailySeries={initialDailySeries}
      categorySeries={initialCategorySeries}
      filters={filters}
      setFilters={setFilters}
      filteredTasks={filteredTasks}
      onToggleDone={onToggleDone}
      onDeleteTask={onDeleteTask}
    />
  );
}
