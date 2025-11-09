"use client";
import React, { JSX, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
    Task,
    Level,
    Filters,
    PRIORITY,
    DIFF_LABEL
} from "@/types/type";

import { Priority } from "@prisma/client";

type AddTaskDialogProps = {
  onClose: () => void;
  onSubmit: (payload: { title: string; category: string; priority: Priority; difficulty: number }) => void;
  categories: string[];
};

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }): JSX.Element {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 rounded-xl bg-[var(--control)] border border-[var(--border)] text-sm text-[var(--foreground)]"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function AddTaskDialog({ onClose, onSubmit, categories }: AddTaskDialogProps): JSX.Element {
  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>(categories[0] || "大学");
  const [priority, setPriority] = useState<Priority>(Priority.MID);
  const [difficulty, setDifficulty] = useState<number>(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title, category, priority, difficulty });
  };

  return (
    <motion.div className="fixed inset-0 z-50 text-[var(--foreground)]">
      <div className="absolute inset-0 bg-black/30 dark:bg-black/70" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="w-full max-w-lg rounded-3xl bg-[var(--surface)] p-6 shadow-xl border border-[var(--border)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold tracking-tight">新しいタスク</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm text-[var(--text-muted)]">タイトル</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[var(--control)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--text-muted)]"
                placeholder="例）レポートの章立て"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm text-[var(--text-muted)]">カテゴリ</label>
                <input
                  list="levtas-cats"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[var(--control)] border border-[var(--border)] text-[var(--foreground)]"
                />
                <datalist id="levtas-cats">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-[var(--text-muted)]">優先度</label>
                <Select value={priority} onChange={(v) => setPriority(v as Priority)} options={[{ value: Priority.LOW, label: "低" }, { value: Priority.MID, label: "中" }, { value: Priority.HIGH, label: "高" }]} />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-[var(--text-muted)]">難易度（1-5）</label>
              <input type="range" min={0} max={4} step={1} value={difficulty} onChange={(e) => setDifficulty(parseInt(e.target.value, 10))} className="w-full" />
              <div className="text-xs text-[var(--text-muted)]">現在: {difficulty + 1}（{DIFF_LABEL[difficulty]}）</div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="px-3 py-2 rounded-xl border border-[var(--border)] text-[var(--foreground)]">キャンセル</button>
              <button type="submit" className="px-3 py-2 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-black">追加</button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
