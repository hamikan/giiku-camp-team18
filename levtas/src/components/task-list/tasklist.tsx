"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  History as HistoryIcon,
  Trash2,
} from "lucide-react";

import {
    Task,
    Filters,
    PRIORITY,
    DIFF_LABEL
} from "@/types/type";

import { Status } from '@/generated/prisma';

// 共通で使うコンポーネント
type TaskListProps = {
  title: string;
  tasks: Task[];
  filters: Filters;
  setFilters: (f: Filters | ((prev: Filters) => Filters)) => void;
  onToggleDone: (id: number) => void;
  onDeleteTask: (id: number) => void;
  categories: string[];
};

// カテゴリ選択を適用する関数
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm">
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// クラス名を宣言するときにクラス名の中身にTrue Falseがあったとしてもそれを反映することが反映することができるもの
function classNames(...xs: Array<string | false | null | undefined>): string {
  return xs.filter(Boolean).join(" ");
}

// スキルとかリサーチとかを宣言するもの
export function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700">{children}</span>;
}

// 日付フォーマット関数
function formatDate(d?: string | number | Date): string {
  try {
    if (!d) return "-";
    const date = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
    return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
  } catch {
    return "-";
  }
}

// 画面表示用のコンポーネントリスト
export function TaskList({ title, tasks, filters, setFilters, onToggleDone, onDeleteTask, categories }: TaskListProps) {
  return (
    // 
    <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-5">
      {/* 現在のタスク一覧表示画面。title = タスク */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="font-semibold tracking-tight">{title}</h3>
        {/* 現在のタスク状態を選択できる。 */}
        <div className="flex flex-wrap items-center gap-2">
          <input type="text" value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} placeholder="検索" className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm" />
          <Select value={filters.status} onChange={(v) => setFilters((f) => ({ ...f, status: v as Filters["status"] }))} options={[
            { value: "all", label: "すべて" },
            { value: "todo", label: "未完了" },
            { value: "doing", label: "進行中" },
            { value: "done", label: "完了" },
          ]} />
          {/* カテゴリ場面。例えば宿題とか自己研鑽とかそいう類のやつ */}
          <Select value={filters.category} onChange={(v) => setFilters((f) => ({ ...f, category: v }))} options={categories.map((c) => ({ value: c, label: c === "all" ? "全カテゴリ" : c }))} />
        </div>
      </div>

      {/* 実際のタスク一覧表示 */}
      <ul className="divide-y divide-gray-100">
        {tasks.map((t) => (
          <motion.li key={t.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="py-3 grid sm:grid-cols-[1fr_auto] items-start gap-3">
            <div className="flex items-start gap-3">
              <input type="checkbox" checked={t.status === Status.DONE} onChange={() => onToggleDone(t.id)} className="mt-1 h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
              <div>
                <div className={classNames("font-medium leading-tight", t.status === Status.DONE && "line-through text-gray-400")}>{t.title}</div>
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