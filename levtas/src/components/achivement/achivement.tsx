"use client";
import React, { JSX, useMemo, useState } from "react";

// 共通で使うクラス名結合関数
function classNames(...xs: Array<string | false | null | undefined>): string {
  return xs.filter(Boolean).join(" ");
}

// アチーブメント表示コンポーネント
// 例えば連続達成日数とか累計完了数などを表示する。
export function Achievement({ icon: Icon, label, value, subtle }: { icon: React.ComponentType<any>; label: string; value: string; subtle?: boolean }): JSX.Element {
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