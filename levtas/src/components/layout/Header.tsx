// src/components/layout/Header.tsx
"use client";

import type { JSX } from "react";
import { useEffect, useState } from "react";
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
    <div className="h-2 w-full rounded-full bg-[var(--control)] overflow-hidden">
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
    <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 shadow-sm">
      <div className="grid place-items-center h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-white">
        <Gauge className="h-4 w-4" />
      </div>
      <div>
        <div className="text-xs text-[var(--text-muted)]">レベル</div>
        <div className="font-semibold leading-tight">{level.current}</div>
      </div>
      <div className="w-28">
        <ProgressBar value={pct} />
        <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
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
  const [isDark, setIsDark] = useState<boolean>(false);

   useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      const prefersDark =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

      if (saved === "dark" || (!saved && prefersDark)) {
        setIsDark(true);
      } else {
        setIsDark(false);
      }
    } catch (e) {
      // セーフティ：localStorage が使えない環境でも落ちないように
      setIsDark(false);
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
    <div className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-[var(--surface)]/70 bg-[var(--surface)]/90 border-b border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* 左：ロゴ */}
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden sm:inline text-sm text-[var(--text-muted)]">
              level × task
            </span>
          </div>
           {/* 🌙 ダークモード切り替えボタン */}
            <button onClick={() => setIsDark((p) => !p)}>
              {isDark ? <Sun /> : <Moon />}
            </button>


          {/* 中央：タブ（URLリンク） */}
          <nav className="flex items-center gap-1 rounded-2xl bg-[var(--surface-muted)] p-1 shadow-inner">
            <Link
              href="/dashboard"
              className={classNames(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-colors",
                isDashboard
                  ? "bg-[var(--surface)] shadow text-[var(--foreground)]"
                  : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
              )}
            >
              <LineChart className="h-4 w-4" /> ダッシュボード
            </Link>
            <Link
              href="/history"
              className={classNames(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-colors",
                isHistory
                  ? "bg-[var(--surface)] shadow text-[var(--foreground)]"
                  : "text-[var(--text-muted)] hover:text-[var(--foreground)]"
              )}
            >
              <HistoryIcon className="h-4 w-4" /> 履歴
            </Link>
          </nav>

          {/* 右：レベル & 新規タスク */}
          <div className="flex items-center gap-2">
            <LevelBadge level={level} />
            <button
              onClick={onOpenAdd}
              className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 text-white px-3 py-2 text-sm shadow hover:shadow-md transition-shadow dark:bg-[var(--surface-muted)] dark:text-[var(--foreground)]"
            >
              <Plus className="h-4 w-4" /> 新しいタスク
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
}
