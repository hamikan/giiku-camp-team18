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

/**
 * Levtas – UI-only demo (TypeScript)
 * - 型注釈を追加した版
 */

// --------------------------- Types & Utils ---------------------------
type Priority = "low" | "mid" | "high";
type Status = "todo" | "doing" | "done";

export interface Task {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  difficulty: number; // 0..4
  status: Status;
  createdAt: string;
  completedAt?: string;
}

export interface Level {
  current: number;
  xp: number;
  xpForNext: number;
}

export interface Filters {
  q: string;
  status: "all" | Status;
  category: "all" | string;
}

const PRIORITY: Record<Priority, string> = { low: "低", mid: "中", high: "高" };
const DIFF_LABEL = ["かんたん", "やさしめ", "ふつう", "むずかしめ", "激ムズ"] as const;

function classNames(...xs: Array<string | false | null | undefined>): string {
  return xs.filter(Boolean).join(" ");
}

function formatDate(d?: string | number | Date): string {
  try {
    if (!d) return "-";
    const date = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
    return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
  } catch {
    return "-";
  }
}

// XP = difficulty * 10 by default
const xpForDifficulty = (diff: number): number => (diff + 1) * 10;

// --------------------------- Sample Data ---------------------------
const initialTasks: Task[] = [
  {
    id: "t1",
    title: "アルゴリズム課題 A",
    category: "大学",
    priority: "high",
    difficulty: 3, // 0..4
    status: "todo",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t2",
    title: "研究メモの整理",
    category: "リサーチ",
    priority: "mid",
    difficulty: 2,
    status: "doing",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "t3",
    title: "英語プレゼン練習",
    category: "スキル",
    priority: "low",
    difficulty: 1,
    status: "done",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: "t4",
    title: "ゼミ資料作成",
    category: "大学",
    priority: "high",
    difficulty: 4,
    status: "done",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "t5",
    title: "Next.js の復習",
    category: "スキル",
    priority: "mid",
    difficulty: 2,
    status: "todo",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
];

// --------------------------- Root Component ---------------------------
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

// --------------------------- Header & Nav ---------------------------
type HeaderProps = {
  active: "dashboard" | "history";
  onChange: (p: "dashboard" | "history") => void;
  onOpenAdd: () => void;
  level: Level;
};

function Header({ active, onChange, onOpenAdd, level }: HeaderProps): JSX.Element {
  return (
    <div className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b border-gray-100">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden sm:inline text-sm text-gray-500">level × task</span>
          </div>

          <nav className="flex items-center gap-2">
            <Segmented
              options={[
                { key: "dashboard", label: "ダッシュボード", icon: LineChart },
                { key: "history", label: "履歴", icon: HistoryIcon },
              ]}
              value={active}
              onChange={onChange}
            />
          </nav>

          <div className="flex items-center gap-2">
            <LevelBadge level={level} />
            <button onClick={onOpenAdd} className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 text-white px-3 py-2 text-sm shadow hover:shadow-md transition-shadow">
              <Plus className="h-4 w-4" /> 新しいタスク
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Logo(): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center text-white shadow">
        <Rocket className="h-5 w-5" />
      </div>
      <span className="font-semibold text-lg tracking-tight">levtas</span>
    </div>
  );
}

type SegOption = { key: "dashboard" | "history"; label: string; icon: React.ComponentType<any> };
type SegmentedProps = { options: SegOption[]; value: "dashboard" | "history"; onChange: (k: "dashboard" | "history") => void };

function Segmented({ options, value, onChange }: SegmentedProps): JSX.Element {
  return (
    <div className="inline-flex rounded-2xl bg-gray-100 p-1 shadow-inner">
      {options.map((op) => {
        const ActiveIcon = op.icon;
        const active = value === op.key;
        return (
          <button
            key={op.key}
            onClick={() => onChange(op.key)}
            className={classNames(
              "relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-colors",
              active ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-900"
            )}
          >
            <ActiveIcon className="h-4 w-4" />
            {op.label}
          </button>
        );
      })}
    </div>
  );
}

function LevelBadge({ level }: { level: Level }): JSX.Element {
  const pct = Math.min(100, Math.round((level.xp / level.xpForNext) * 100));
  return (
    <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <div className="grid place-items-center h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-white">
        <Gauge className="h-4 w-4" />
      </div>
      <div>
        <div className="text-xs text-gray-500">レベル</div>
        <div className="font-semibold leading-tight">{level.current}</div>
      </div>
      <div className="w-28">
        <ProgressBar value={pct} />
        <div className="text-[10px] text-gray-500 mt-0.5">{level.xp} / {level.xpForNext} XP</div>
      </div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }): JSX.Element {
  return (
    <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
      <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
    </div>
  );
}

// --------------------------- Dashboard ---------------------------
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

function Dashboard({ tasks, completed, todo, level, dailySeries, categorySeries, filters, setFilters, filteredTasks, onToggleDone, onDeleteTask }: DashboardProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      <div className="lg:col-span-2 space-y-6">
        <StatsRow completed={completed} todo={todo} level={level} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>

        <TaskList title="タスク" tasks={filteredTasks} filters={filters} setFilters={setFilters} onToggleDone={onToggleDone} onDeleteTask={onDeleteTask} categories={["all", ...Array.from(new Set(tasks.map((t) => t.category)))]} />
      </div>

      <div className="space-y-6">
        <Card title="アチーブメント" icon={Award}>
          <ul className="space-y-3">
            <Achievement icon={Flame} label="連続達成" value="3 日" />
            <Achievement icon={CheckCircle2} label="累計完了" value={`${completed.length} 件`} />
            <Achievement icon={Clock3} label="平均クリア時間" value="—" subtle />
          </ul>
        </Card>

        <Card title="最近の完了" icon={CheckCircle2}>
          <ul className="space-y-3">
            {completed.slice(0, 5).map((t) => (
              <li key={t.id} className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium leading-tight">{t.title}</div>
                  <div className="text-xs text-gray-500">{t.category} ・ {formatDate(t.completedAt)}</div>
                </div>
                <span className="text-xs rounded-full bg-gray-100 px-2 py-1">難度 {t.difficulty + 1}</span>
              </li>
            ))}
            {completed.length === 0 && <div className="text-sm text-gray-500">まだ完了タスクがありません</div>}
          </ul>
        </Card>
      </div>
    </div>
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

function Card({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<any>; children: React.ReactNode }): JSX.Element {
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

// --------------------------- Task List ---------------------------
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

function Badge({ children }: { children: React.ReactNode }): JSX.Element {
  return <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700">{children}</span>;
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

// --------------------------- History ---------------------------
type HistoryProps = {
  tasks: Task[];
  completed: Task[];
  categorySeries: { name: string; value: number }[];
  onToggleDone: (id: string) => void;
  onDeleteTask: (id: string) => void;
};

function History({ tasks, completed, categorySeries, onToggleDone, onDeleteTask }: HistoryProps): JSX.Element {
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="カテゴリ別 合計" icon={Filter}>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ left: -20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={24} />
                <Tooltip contentStyle={{ borderRadius: 12 }} />
                <Bar dataKey="合計" radius={[6, 6, 0, 0]} fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="完了カテゴリ比率" icon={CheckCircle2}>
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
      </div>

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
              <div className="text-xs text-gray-500 mb-2">{g.date.toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" })}</div>
              <div className="grid gap-2">
                {g.items.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-2xl border border-gray-100 px-3 py-2">
                    <div>
                      <div className="font-medium leading-tight">{t.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                        <Badge>{t.category}</Badge>
                        <span>難度 {t.difficulty + 1}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => onToggleDone(t.id)} className="px-3 py-1.5 text-sm rounded-xl bg-gray-900 text-white">戻す</button>
                      <button onClick={() => onDeleteTask(t.id)} className="p-2 rounded-xl hover:bg-gray-50">
                        <Trash2 className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </li>
          ))}
          {byDate.length === 0 && <div className="text-sm text-gray-500 py-8 text-center">まだ完了履歴がありません</div>}
        </ul>
      </div>
    </div>
  );
}

// --------------------------- Add Task Dialog ---------------------------
type AddTaskDialogProps = {
  onClose: () => void;
  onSubmit: (payload: { title: string; category: string; priority: Priority; difficulty: number }) => void;
  categories: string[];
};

function AddTaskDialog({ onClose, onSubmit, categories }: AddTaskDialogProps): JSX.Element {
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>(categories[0] || "大学");
  const [priority, setPriority] = useState<Priority>("mid");
  const [difficulty, setDifficulty] = useState<number>(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title, category, priority, difficulty });
  };

  return (
    <motion.div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold tracking-tight">新しいタスク</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm text-gray-600">タイトル</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200" placeholder="例）レポートの章立て" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm text-gray-600">カテゴリ</label>
                <input list="levtas-cats" value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200" />
                <datalist id="levtas-cats">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-gray-600">優先度</label>
                <Select value={priority} onChange={(v) => setPriority(v as Priority)} options={[{ value: "low", label: "低" }, { value: "mid", label: "中" }, { value: "high", label: "高" }]} />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-gray-600">難易度（1-5）</label>
              <input type="range" min={0} max={4} step={1} value={difficulty} onChange={(e) => setDifficulty(parseInt(e.target.value, 10))} className="w-full" />
              <div className="text-xs text-gray-500">現在: {difficulty + 1}（{DIFF_LABEL[difficulty]}）</div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="px-3 py-2 rounded-xl border border-gray-200">キャンセル</button>
              <button type="submit" className="px-3 py-2 rounded-xl bg-gray-900 text-white">追加</button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
