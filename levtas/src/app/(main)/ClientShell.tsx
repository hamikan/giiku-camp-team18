"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { AddTaskDialog } from "@/components/task-dialog/AddTaskDialog";
import type { Level } from "@/types/type";
import type { ReactNode } from "react";
import type { Priority } from "@prisma/client";
import { createTask } from "@/server/actions/taskActions";

export default function ClientShell({
  level,
  categories,
  children,
}: {
  level: Level;
  categories: string[];
  children: ReactNode;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const router = useRouter();

  const handleSubmit = async (p: {
    title: string;
    priority: Priority;
    difficulty: number;
    category: string;
  }) => {
    await createTask({
      userId: 1, // TODO: 認証連動
      title: p.title,
      priority: p.priority,
      difficulty: p.difficulty,
      categoryName: p.category,
    });
    setShowAdd(false);
    router.refresh();
  };

  return (
    <>
      {/* onOpenAdd を渡すとヘッダー側でモーダルを開くボタン動作にできます */}
      <Header level={level} categories={categories} onOpenAdd={() => setShowAdd(true)} />
      <main className="mx-auto max-w-6xl px-4 pb-24">{children}</main>
      {showAdd && (
        <AddTaskDialog
          categories={categories}
          onSubmit={handleSubmit}
          onClose={() => setShowAdd(false)}
        />
      )}
    </>
  );
}
