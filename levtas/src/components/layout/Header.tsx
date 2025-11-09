// src/components/layout/Header.tsx
"use client";

import type { JSX } from "react";
import { useEffect } from "react";
import { Moon, Sun } from "lucide-react"; //アイコンの追加
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge, Rocket, History as HistoryIcon, LineChart, Plus } from "lucide-react";
import { motion } from "framer-motion";
import type { Level } from "@/types/type";

type HeaderProps = {
  level: Level;
  categories: string[];
  onOpenAdd?: () => void; // ← 追加
};

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function ProgressBar({ value }: { value: number }): JSX.Element {
  return (
    <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      />
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
        <div className="text-[10px] text-gray-500 mt-0.5">
          {level.xp} / {level.xpForNext} XP
        </div>
      </div>
    </div>
  );
}

export function Logo(): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 grid place-items-center text-white shadow">
        <Rocket className="h-5 w-5" />
      </div>
      <span className="font-semibold text-lg tracking-tight">levtas</span>
    </div>
  );
}

export default function Header({ level, categories, onOpenAdd }: HeaderProps): JSX.Element {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");
  const isHistory = pathname.startsWith("/history");
   let isDark: Boolean = false;
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (saved === "dark" || (!saved && prefersDark)) {
      document.documentElement.classList.add("dark");
      isDark = true;
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);
  return (
    <div className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b border-gray-100 dark:bg-gray-900 dark:border-gray-800">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* 左：ロゴ */}
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden sm:inline text-sm text-gray-500 dark:text-gray-400">
              level × task
            </span>
          </div>
           {/* 🌙 ダークモード切り替えボタン */}
            <button
              onClick={() => isDark = !isDark}
              className="p-2 rounded-2xl bg-gray-200 dark:bg-gray-700 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* ➕ 新しいタスクボタン */}
            <button
              onClick={onOpenAdd}
              className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 text-white px-3 py-2 text-sm shadow hover:shadow-md transition-shadow dark:bg-white dark:text-gray-900"
            ></button>

          {/* 中央：タブ（URLリンク） */}
          <nav className="flex items-center gap-1 rounded-2xl bg-gray-100 p-1 shadow-inner">
            <Link
              href="/dashboard"
              className={classNames(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-colors",
                isDashboard ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-900"
              )}
            >
              <LineChart className="h-4 w-4" /> ダッシュボード
            </Link>
            <Link
              href="/history"
              className={classNames(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-colors",
                isHistory ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-900"
              )}
            >
              <HistoryIcon className="h-4 w-4" /> 履歴
            </Link>
          </nav>

          {/* 右：レベル & 新規タスク */}
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
