// app/(main)/history-page/HistoryClient.tsx
"use client";

import React, { useMemo, useState } from "react";
import { Trash2, Download } from "lucide-react";
import { Badge } from "@/components/task-list/tasklist";
import type { Task } from "@/types/type";
import { Status } from "@prisma/client";
import { useRouter } from "next/navigation";

import { toggleTask, deleteTask } from "@/server/actions/taskActions"; 

export default function HistoryClient({
  initialTasks,
  initialCategorySeries,
}: {
  initialTasks: Task[];
  initialCategorySeries: { name: string; value: number }[];
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // enum 比較で完了のみ
  const completed = useMemo(
    () => tasks.filter((t) => t.status === Status.DONE),
    [tasks]
  );

  const categorySeries = initialCategorySeries;

  const onToggleDone = async (id: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === Status.DONE ? Status.TODO : Status.DONE,
              completedAt:
                t.status === Status.DONE ? undefined : new Date().toISOString(),
            }
          : t
      )
    );

    try {
      if (typeof toggleTask === "function") {
        await toggleTask(id);
        router.refresh();
      }
    } catch {
      // 失敗時は必要ならロールバック処理を追加
    }
  };

  const onDeleteTask = async (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      if (typeof deleteTask === "function") {
        await deleteTask(id);
        router.refresh();
      }
    } catch {
      // 失敗時は必要ならロールバック処理を追加
    }
  };

  return (
    <HistoryView
      tasks={tasks}
      completed={completed}
      categorySeries={categorySeries}
      onToggleDone={onToggleDone}
      onDeleteTask={onDeleteTask}
    />
  );
}

function HistoryView({
  tasks,
  completed,
  onToggleDone,
  onDeleteTask,
}: {
  tasks: Task[];
  completed: Task[];
  categorySeries: { name: string; value: number }[];
  onToggleDone: (id: number) => void;
  onDeleteTask: (id: number) => void;
}) {
  const byDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    completed.forEach((t) => {
      const k = new Date(t.completedAt ?? "").toDateString();
      map.set(k, (map.get(k) || []).concat(t));
    });
    const rows = Array.from(map.entries())
      .map(([k, arr]) => ({ date: new Date(k), items: arr }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    return rows;
  }, [completed]);

  const barData = useMemo(() => {
    const map = new Map<string, number>();
    tasks.forEach((t) => map.set(t.category, (map.get(t.category) || 0) + 1));
    return Array.from(map.entries()).map(([name, 合計]) => ({ name, 合計 }));
  }, [tasks]);

  return (
    <div className="space-y-6 mt-8">
      <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold tracking-tight">完了履歴</h3>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4" /> エクスポート
            </button>
          </div>
        </div>

        <ul className="space-y-6">
          {byDate.map((g) => (
            <li key={g.date.toISOString()}>
              <div className="text-xs text-gray-500 mb-2">
                {g.date.toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <div className="grid gap-2">
                {g.items.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-2xl border border-gray-100 px-3 py-2"
                  >
                    <div>
                      <div className="font-medium leading-tight">{t.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                        <Badge>{t.category}</Badge>
                        <span>難度 {t.difficulty + 1}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleDone(t.id)}
                        className="px-3 py-1.5 text-sm rounded-xl bg-gray-900 text-white"
                      >
                        戻す
                      </button>
                      <button
                        onClick={() => onDeleteTask(t.id)}
                        className="p-2 rounded-xl hover:bg-gray-50"
                      >
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </li>
          ))}
          {byDate.length === 0 && (
            <div className="text-sm text-gray-500 py-8 text-center">
              まだ完了履歴がありません
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}
