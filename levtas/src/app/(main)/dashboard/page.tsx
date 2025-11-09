// "use client";
// import React, { JSX, useMemo, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { TaskList } from "@/components/task-list/tasklist";
// import {
//   CheckCircle2,
//   Gauge,
//   Flame,
//   Award,
//   Plus,
//   LineChart,
//   History as HistoryIcon,
//   Filter,
//   Trash2,
//   Download,
//   Clock3,
//   Rocket,
// } from "lucide-react";
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";

// import {
//     Task,
//     Level,
//     Filters,
//     PRIORITY,
//     DIFF_LABEL
// } from "@/types/type"

// import { initialTasks } from "@/dummy-data/init"

// import {
//   History
// } from "@/app/(main)/history-page/page"

// import Header from "@/components/layout/Header"

// import {
//   AddTaskDialog
// } from "@/components/task-dialog/AddTaskDialog"

// export const xpForDifficulty = (diff: number): number => (diff + 1) * 10;

// function classNames(...xs: Array<string | false | null | undefined>): string {
//   return xs.filter(Boolean).join(" ");
// }

// export function Card({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<any>; children: React.ReactNode }): JSX.Element {
//   return (
//     <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-5">
//       <div className="flex items-center gap-2 mb-3">
//         <div className="h-8 w-8 grid place-items-center rounded-xl bg-gray-900 text-white">
//           <Icon className="h-4 w-4" />
//         </div>
//         <h3 className="font-semibold tracking-tight">{title}</h3>
//       </div>
//       {children}
//     </div>
//   );
// }

// function MetricCard({ icon: Icon, title, value, subtitle }: { icon: React.ComponentType<any>; title: string; value: number | string; subtitle?: string }): JSX.Element {
//   return (
//     <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-5">
//       <div className="flex items-center justify-between">
//         <div>
//           <div className="text-sm text-gray-500">{title}</div>
//           <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
//           <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
//         </div>
//         <div className="h-10 w-10 grid place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow">
//           <Icon className="h-5 w-5" />
//         </div>
//       </div>
//     </div>
//   );
// }

// function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }): JSX.Element {
//   return (
//     <select value={value} onChange={(e) => onChange(e.target.value)} className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm">
//       {options.map((o) => (
//         <option key={o.value} value={o.value}>{o.label}</option>
//       ))}
//     </select>
//   );
// }

// function StatsRow({ completed, todo, level }: { completed: Task[]; todo: Task[]; level: Level }): JSX.Element {
//   return (
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//       <MetricCard icon={Gauge} title="レベル" value={level.current} subtitle={`XP ${level.xp}/${level.xpForNext}`} />
//       <MetricCard icon={CheckCircle2} title="完了" value={completed.length} subtitle="今までの合計" />
//       <MetricCard icon={Filter} title="未完了" value={todo.length} subtitle="今日の ToDo かも" />
//     </div>
//   );
// }

// function Achievement({ icon: Icon, label, value, subtle }: { icon: React.ComponentType<any>; label: string; value: string; subtle?: boolean }): JSX.Element {
//   return (
//     <li className="flex items-center justify-between rounded-2xl border border-gray-100 px-3 py-2">
//       <div className="flex items-center gap-2">
//         <div className={classNames("h-8 w-8 grid place-items-center rounded-xl text-white", subtle ? "bg-gray-300" : "bg-gradient-to-br from-orange-400 to-pink-500")}>
//           <Icon className="h-4 w-4" />
//         </div>
//         <span className="text-sm">{label}</span>
//       </div>
//       <span className="text-sm text-gray-600">{value}</span>
//     </li>
//   );
// }

// type DashboardProps = {
//   tasks: Task[];
//   completed: Task[];
//   todo: Task[];
//   level: Level;
//   dailySeries: { date: string; complete: number }[];
//   categorySeries: { name: string; value: number }[];
//   filters: Filters;
//   setFilters: (f: Filters | ((prev: Filters) => Filters)) => void;
//   filteredTasks: Task[];
//   onToggleDone: (id: string) => void;
//   onDeleteTask: (id: string) => void;
// };

// type TaskListProps = {
//   title: string;
//   tasks: Task[];
//   filters: Filters;
//   setFilters: (f: Filters | ((prev: Filters) => Filters)) => void;
//   onToggleDone: (id: string) => void;
//   onDeleteTask: (id: string) => void;
//   categories: string[];
// };

// export default function Dashboard({ tasks, completed, todo, level, dailySeries, categorySeries, filters, setFilters, filteredTasks, onToggleDone, onDeleteTask }: DashboardProps): JSX.Element {
//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
//       <div className="lg:col-span-2 space-y-6">
//         <StatsRow completed={completed} todo={todo} level={level} />
       

//         <TaskList title="タスク" tasks={filteredTasks} filters={filters} setFilters={setFilters} onToggleDone={onToggleDone} onDeleteTask={onDeleteTask} categories={["all", ...Array.from(new Set(tasks.map((t) => t.category)))]} />
//            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         
//         </div>
//       </div>

//       <div className="space-y-6">
//         <Card title="アチーブメント" icon={Award}>
//           <ul className="space-y-3">
//             <Achievement icon={Flame} label="連続達成" value="3 日" />
//             <Achievement icon={CheckCircle2} label="累計完了" value={`${completed.length} 件`} />
//             {/* 平均クリア時間存在した場所 */}
//           </ul>
//         </Card>
//         <Card title="カテゴリ内訳" icon={Filter}>
//           <div className="h-52">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie data={categorySeries} dataKey="value" nameKey="name" outerRadius={80} innerRadius={48}>
//                   {categorySeries.map((_, i) => (
//                     <Cell key={i} fill={["#6366f1", "#f472b6", "#06b6d4", "#22c55e", "#f59e0b"][i % 5]} />
//                     ))}
//                 </Pie>
//               <Tooltip contentStyle={{ borderRadius: 12 }} />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//           </Card>
//           <Card title="直近14日の完了数" icon={LineChart}>
//             <div className="h-52">
//               <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart data={dailySeries} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
//                   <defs>
//                     <linearGradient id="levGradient" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
//                       <stop offset="100%" stopColor="#ec4899" stopOpacity={0.05} />
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
//                   <XAxis dataKey="date" tickLine={false} axisLine={false} />
//                   <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={24} />
//                   <Tooltip contentStyle={{ borderRadius: 12 }} />
//                   <Area type="monotone" dataKey="完了" stroke="#8b5cf6" fill="url(#levGradient)" strokeWidth={2} />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>
//           </Card>
//       </div>

//     </div>
//   );
// }

// app/(main)/dashboard/page.tsx
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/dashboard/dashboardClient";
import { Task } from '@/types/type';
import { $Enums } from "@/generated/prisma";
import { Status, Priority } from '@/generated/prisma';

// ここは認証に置き換えてOK
const USER_ID = 1;

type Level = { current: number; xp: number; xpForNext: number };

export default async function Page() {
  // ユーザのレベル（ヘッダーと同じロジックでOK）
  const user = await prisma.user.findUnique({
    where: { id: USER_ID },
    select: { level: true, exp: true },
  });
  const level: Level = {
    current: user?.level ?? 1,
    xp: user?.exp ?? 0,
    xpForNext: 100,
  };

  // タスク本体（カテゴリ名を include）
  const tasksDb = await prisma.task.findMany({
    where: { userId: USER_ID },
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  // UI の Task 形に整形（category は string に正規化）
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
  const todo = tasks.filter((t) => t.status !== Status.DONE);

  // 直近14日の完了数
  const today = new Date();
  const dailySeries = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (13 - i));
    const key = d.toDateString();
    const count = completed.filter((t) =>
      t.completedAt ? new Date(t.completedAt).toDateString() === key : false
    ).length;
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      complete: count, // 型定義に合わせる
      // Recharts 側が dataKey="完了" を参照するので同値を重複持たせる
      完了: count as unknown as number,
    };
  });

  // カテゴリ内訳（完了のみ）
  const catCount = new Map<string, number>();
  for (const t of completed) {
    catCount.set(t.category, (catCount.get(t.category) ?? 0) + 1);
  }
  const categorySeries = Array.from(catCount.entries()).map(([name, value]) => ({ name, value }));

  // 初期カテゴリ一覧（Dashboard 側は tasks からも生成するが安全のため送る）
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
