import React, { JSX, useMemo } from "react";
import { CheckCircle2, Filter, Trash2, Download } from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
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
    Status
} from "@/types/type"

import{
    Card
} from "@dashbord/page"

import{
    Badge
} from "@tasklist/page"
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
