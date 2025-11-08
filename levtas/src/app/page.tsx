import React, { useMemo } from "react";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache"; // Next 13.4+ 用
import {
    Task,
    Level,
    Filters,
} from "@/types/type"

import { initialTasks } from "@/dummy-data/init"
import Header from "@/components/layout/Header"
import {  Dashboard,
          xpForDifficulty
        } from "@/app/(main)/dashboard/page"

import {
  History
} from "@/app/(main)/history-page/page"
import {
  AddTaskDialog
} from "@/components/task-dialog/AddTaskDialog"

function LevtasUI(): JSX.Element {
  const { Status, Priority } = prisma;
  const tasks: Task[] = prisma.task;

  const [showAdd, setShowAdd] = useState<boolean>(false);

  // Derived data
  const completed = tasks.filter((t) => t.status === Status.TODO);
  const todo = tasks.filter((t) => t.status === Status.DONE);

  const categories = useMemo<string[]>(() => Array.from(new Set(tasks.map((t) => t.category))), [tasks]);

  const filteredTasks = useMemo<Task[]>(() => {
    return tasks.filter((t) => {
      if (filters.status !== "all" && t.status !== filters.status) return false;
      if (filters.category !== "all" && t.category !== filters.category) return false;
      if (filters.q && !(`${t.title} ${t.category}`.toLowerCase().includes(filters.q.toLowerCase()))) return false;
      return true;
    });
  }, [tasks, filters]);

  type DailyPoint = { date: string; complete: number };
  const dailySeries = useMemo<DailyPoint[]>(() => {
    // last 14 days completed per day
    const days: DailyPoint[] = [...Array(14)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const key = d.toDateString();
      const count = completed.filter((t) => new Date(t.completedAt ?? 0).toDateString() === key).length;
      return { date: `${d.getMonth() + 1}/${d.getDate()}`, complete: count };
    });
    return days;
  }, [completed]);

  type CategoryPoint = { name: string; value: number };
  const categorySeries = useMemo<CategoryPoint[]>(() => {
    const map = new Map<string, number>();
    completed.forEach((t) => map.set(t.category, (map.get(t.category) || 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [completed]);

  const handleAddTask = (payload: Omit<Task, "id" | "createdAt" | "status"> & { title: string; priority: Priority; difficulty: number; category: string }) => {
    const id = `t${Math.random().toString(36).slice(2, 8)}`;
    const newTask: Task = { id, status: "todo", createdAt: new Date().toISOString(), ...payload };
    setTasks((xs) => [newTask, ...xs]);
    setShowAdd(false);
  };

  const handleDeleteTask = (id: string) => setTasks((xs) => xs.filter((t) => t.id !== id));

  const handleToggleDone = (id: string) => {
    setTasks((xs) =>
      xs.map((t) => {
        if (t.id !== id) return t;
        if (t.status === "done") {
          const copy = { ...t, status: "todo" as Status, completedAt: undefined };
          return copy;
        }
        return { ...t, status: "done" as Status, completedAt: new Date().toISOString() };
      })
    );

    // level/xp update (simple demo)
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const gain = task.status === "done" ? -xpForDifficulty(task.difficulty) : xpForDifficulty(task.difficulty);
    setLevel((L) => {
      let cur: Level = { ...L, xp: L.xp + gain };
      // normalize up
      while (cur.xp >= cur.xpForNext) {
        cur = { current: cur.current + 1, xp: cur.xp - cur.xpForNext, xpForNext: Math.round(cur.xpForNext * 1.2) };
      }
      // normalize down
      while (cur.xp < 0 && cur.current > 1) {
        const prevCap = Math.round(cur.xpForNext / 1.2);
        cur = { current: cur.current - 1, xp: prevCap + cur.xp, xpForNext: prevCap };
      }
      if (cur.xp < 0) cur.xp = 0;
      return cur;
    });
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-white to-gray-50 text-gray-900">
      <Header active={activePage} onChange={setActivePage} onOpenAdd={() => setShowAdd(true)} level={level} />

      <main className="mx-auto max-w-6xl px-4 pb-24">
        {activePage === "dashboard" ? (
          <Dashboard
            tasks={tasks}
            completed={completed}
            todo={todo}
            level={level}
            dailySeries={dailySeries}
            categorySeries={categorySeries}
            filters={filters}
            setFilters={setFilters}
            filteredTasks={filteredTasks}
            onToggleDone={handleToggleDone}
            onDeleteTask={handleDeleteTask}
          />
        ) : (
          <History tasks={tasks} completed={completed} categorySeries={categorySeries} onToggleDone={handleToggleDone} onDeleteTask={handleDeleteTask} />
        )}
      </main>

      <AnimatePresence>
        {showAdd && <AddTaskDialog onClose={() => setShowAdd(false)} onSubmit={handleAddTask} categories={categories} />}
      </AnimatePresence>
    </div>
  );
}

export default async function TopPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <LevtasUI />
    </main>
  );
}
