// app/tasks/new/NewTaskClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { AddTaskDialog } from "@/components/task-dialog/AddTaskDialog";
import { createTask } from "@/server/actions/taskActions";
import type { $Enums } from "@prisma/client";

type Payload = {
  title: string;
  priority: $Enums.Priority
  difficulty: number;
  category: string;
};

export default function NewTaskClient({
  userId,
  categories,
}: {
  userId: number;
  categories: string[];
}) {
  const router = useRouter();

  const handleSubmit = async (p: Payload) => {
    await createTask({
      userId,
      title: p.title,
      priority: p.priority as $Enums.Priority,
      difficulty: p.difficulty,
      categoryName: p.category,
    });
    router.replace("/dashboard");
    router.refresh();
  };

  const handleClose = () => {
    router.replace("/dashboard"); // 閉じたら戻る
  };

  return (
    <AddTaskDialog
      categories={categories}
      onSubmit={handleSubmit}
      onClose={handleClose}
    />
  );
}
