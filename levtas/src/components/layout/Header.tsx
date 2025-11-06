import { JSX } from "react";
import { Gauge, Rocket, HistoryIcon, LineChart, Plus } from "lucide-react";
import { motion } from "framer-motion";

import {
    Task,
    Level,
    Filters,
    Priority,
    Status,
    PRIORITY,
    DIFF_LABEL
} from "@/types/type"

// --------------------------- Helper Components ---------------------------
// 画面切り替え
type SegOption = { key: "dashboard" | "history"; label: string; icon: React.ComponentType<any> };
type SegmentedProps = { options: SegOption[]; value: "dashboard" | "history"; onChange: (k: "dashboard" | "history") => void };

function classNames(...xs: Array<string | false | null | undefined>): string {
  return xs.filter(Boolean).join(" ");
}

// 型指定
type HeaderProps = {
  active: "dashboard" | "history";
  onChange: (p: "dashboard" | "history") => void;
  onOpenAdd: () => void;
  level: Level;
};

// 画面左上に表示されるロゴ部分
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

// 経験値部分
function ProgressBar({ value }: { value: number }): JSX.Element {
  return (
    <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
      <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
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

// 画面上部にあるダッシュボードと履歴を切り替えるコンポーネント
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

// --------------------------- Header Component ---------------------------
export default function Header({ active, onChange, onOpenAdd, level }: HeaderProps): JSX.Element {
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