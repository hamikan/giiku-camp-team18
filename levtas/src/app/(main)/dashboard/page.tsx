"use client";
import React, { JSX, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Gauge,
  Flame,
  Award,
  Plus,
  LineChart,
  History as HistoryIcon,
  Filter,
  Trash2,
  Download,
  Clock3,
  Rocket,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
    Task,
    Level,
    Filters,
    Priority,
    Status,
    PRIORITY,
    DIFF_LABEL
} from "@/types/type"

import { initialTasks } from "@/dummy-data/init"

import {
  History
} from "@/app/(main)/history-page/page"

import Header from "@/components/layout/Header"

import {
  AddTaskDialog
} from "@/components/task-dialog/AddTaskDialog"

const xpForDifficulty = (diff: number): number => (diff + 1) * 10;

function formatDate(d?: string | number | Date): string {
  try {
    if (!d) return "-";
    const date = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
    return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
  } catch {
    return "-";
  }
}

function classNames(...xs: Array<string | false | null | undefined>): string {
  return xs.filter(Boolean).join(" ");
}

export function Badge({ children }: { children: React.ReactNode }): JSX.Element {
  return <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700">{children}</span>;
}

export function Card({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<any>; children: React.ReactNode }): JSX.Element {
  return (
    <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 grid place-items-center rounded-xl bg-gray-900 text-white">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-semibold tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function MetricCard({ icon: Icon, title, value, subtitle }: { icon: React.ComponentType<any>; title: string; value: number | string; subtitle?: string }): JSX.Element {
  return (
    <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{title}</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
          <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
        </div>
        <div className="h-10 w-10 grid place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }): JSX.Element {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm">
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function StatsRow({ completed, todo, level }: { completed: Task[]; todo: Task[]; level: Level }): JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard icon={Gauge} title="レベル" value={level.current} subtitle={`XP ${level.xp}/${level.xpForNext}`} />
      <MetricCard icon={CheckCircle2} title="完了" value={completed.length} subtitle="今までの合計" />
      <MetricCard icon={Filter} title="未完了" value={todo.length} subtitle="今日の ToDo かも" />
    </div>
  );
}

function Achievement({ icon: Icon, label, value, subtle }: { icon: React.ComponentType<any>; label: string; value: string; subtle?: boolean }): JSX.Element {
  return (
    <li className="flex items-center justify-between rounded-2xl border border-gray-100 px-3 py-2">
      <div className="flex items-center gap-2">
        <div className={classNames("h-8 w-8 grid place-items-center rounded-xl text-white", subtle ? "bg-gray-300" : "bg-gradient-to-br from-orange-400 to-pink-500")}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm text-gray-600">{value}</span>
    </li>
  );
}

type DashboardProps = {
  tasks: Task[];
  completed: Task[];
  todo: Task[];
  level: Level;
  dailySeries: { date: string; 完了: number }[];
  categorySeries: { name: string; value: number }[];
  filters: Filters;
  setFilters: (f: Filters | ((prev: Filters) => Filters)) => void;
  filteredTasks: Task[];
  onToggleDone: (id: string) => void;
  onDeleteTask: (id: string) => void;
};

type TaskListProps = {
  title: string;
  tasks: Task[];
  filters: Filters;
  setFilters: (f: Filters | ((prev: Filters) => Filters)) => void;
  onToggleDone: (id: string) => void;
  onDeleteTask: (id: string) => void;
  categories: string[];
};

function TaskList({ title, tasks, filters, setFilters, onToggleDone, onDeleteTask, categories }: TaskListProps): JSX.Element {
  return (
    <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="font-semibold tracking-tight">{title}</h3>
        <div className="flex flex-wrap items-center gap-2">
          <input type="text" value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} placeholder="検索" className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm" />
          <Select value={filters.status} onChange={(v) => setFilters((f) => ({ ...f, status: v as Filters["status"] }))} options={[
            { value: "all", label: "すべて" },
            { value: "todo", label: "未完了" },
            { value: "doing", label: "進行中" },
            { value: "done", label: "完了" },
          ]} />
          <Select value={filters.category} onChange={(v) => setFilters((f) => ({ ...f, category: v }))} options={categories.map((c) => ({ value: c, label: c === "all" ? "全カテゴリ" : c }))} />
        </div>
      </div>

      <ul className="divide-y divide-gray-100">
        {tasks.map((t) => (
          <motion.li key={t.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="py-3 grid sm:grid-cols-[1fr_auto] items-start gap-3">
            <div className="flex items-start gap-3">
              <input type="checkbox" checked={t.status === "done"} onChange={() => onToggleDone(t.id)} className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
              <div>
                <div className={classNames("font-medium leading-tight", t.status === "done" && "line-through text-gray-400")}>{t.title}</div>
                <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap items-center gap-2">
                  <Badge>{t.category}</Badge>
                  <span>優先度: {PRIORITY[t.priority]}</span>
                  <span>難度: {t.difficulty + 1}（{DIFF_LABEL[t.difficulty]}）</span>
                  <span>作成: {formatDate(t.createdAt)}</span>
                  {t.completedAt && <span>完了: {formatDate(t.completedAt)}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-self-end">
              <button onClick={() => onDeleteTask(t.id)} className="p-2 rounded-xl hover:bg-gray-50">
                <Trash2 className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </motion.li>
        ))}
        {tasks.length === 0 && <div className="text-sm text-gray-500 py-8 text-center">条件に一致するタスクがありません</div>}
      </ul>
    </div>
  );
}

function Dashboard({ tasks, completed, todo, level, dailySeries, categorySeries, filters, setFilters, filteredTasks, onToggleDone, onDeleteTask }: DashboardProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      <div className="lg:col-span-2 space-y-6">
        <StatsRow completed={completed} todo={todo} level={level} />
       

        <TaskList title="タスク" tasks={filteredTasks} filters={filters} setFilters={setFilters} onToggleDone={onToggleDone} onDeleteTask={onDeleteTask} categories={["all", ...Array.from(new Set(tasks.map((t) => t.category)))]} />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         
        </div>
      </div>

      <div className="space-y-6">
        <Card title="アチーブメント" icon={Award}>
          <ul className="space-y-3">
            <Achievement icon={Flame} label="連続達成" value="3 日" />
            <Achievement icon={CheckCircle2} label="累計完了" value={`${completed.length} 件`} />
            {/* 平均クリア時間存在した場所 */}
          </ul>
        </Card>
        <Card title="カテゴリ内訳" icon={Filter}>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categorySeries} dataKey="value" nameKey="name" outerRadius={80} innerRadius={48}>
                  {categorySeries.map((_, i) => (
                    <Cell key={i} fill={["#6366f1", "#f472b6", "#06b6d4", "#22c55e", "#f59e0b"][i % 5]} />
                    ))}
                </Pie>
              <Tooltip contentStyle={{ borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          </Card>
          <Card title="直近14日の完了数" icon={LineChart}>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailySeries} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="levGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#ec4899" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={24} />
                  <Tooltip contentStyle={{ borderRadius: 12 }} />
                  <Area type="monotone" dataKey="完了" stroke="#8b5cf6" fill="url(#levGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
      </div>

    </div>
  );
}

export default function LevtasUI(): JSX.Element {
  const [activePage, setActivePage] = useState<"dashboard" | "history">("dashboard");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [level, setLevel] = useState<Level>({ current: 3, xp: 25, xpForNext: 100 });
  const [filters, setFilters] = useState<Filters>({ q: "", status: "all", category: "all" });
  const [showAdd, setShowAdd] = useState<boolean>(false);

  // Derived data
  const completed = tasks.filter((t) => t.status === "done");
  const todo = tasks.filter((t) => t.status !== "done");

  const categories = useMemo<string[]>(() => Array.from(new Set(tasks.map((t) => t.category))), [tasks]);

  const filteredTasks = useMemo<Task[]>(() => {
    return tasks.filter((t) => {
      if (filters.status !== "all" && t.status !== filters.status) return false;
      if (filters.category !== "all" && t.category !== filters.category) return false;
      if (filters.q && !(`${t.title} ${t.category}`.toLowerCase().includes(filters.q.toLowerCase()))) return false;
      return true;
    });
  }, [tasks, filters]);

  type DailyPoint = { date: string; 完了: number };
  const dailySeries = useMemo<DailyPoint[]>(() => {
    // last 14 days completed per day
    const days: DailyPoint[] = [...Array(14)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const key = d.toDateString();
      const count = completed.filter((t) => new Date(t.completedAt ?? 0).toDateString() === key).length;
      return { date: `${d.getMonth() + 1}/${d.getDate()}`, 完了: count };
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