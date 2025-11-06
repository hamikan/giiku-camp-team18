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

type AddTaskDialogProps = {
  onClose: () => void;
  onSubmit: (payload: { title: string; category: string; priority: Priority; difficulty: number }) => void;
  categories: string[];
};

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }): JSX.Element {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm">
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function AddTaskDialog({ onClose, onSubmit, categories }: AddTaskDialogProps): JSX.Element {
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
