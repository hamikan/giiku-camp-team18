"use client";

// メトリックカード表示コンポーネント
// 現在のタスク完了数、レベル、XPなどの指標を表示する。
export function MetricCard({ icon: Icon, title, value, subtitle }: { icon: React.ComponentType<any>; title: string; value: number | string; subtitle?: string }) {
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