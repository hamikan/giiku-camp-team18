import { Task } from "@/types/type";

export const initialTasks: Task[] = [
  {
    id: "t1",
    title: "アルゴリズム課題 A",
    category: "大学",
    priority: "high",
    difficulty: 3, // 0..4
    status: "todo",
    createdAt: new Date().toISOString(),
  },
  {
    id: "t2",
    title: "研究メモの整理",
    category: "リサーチ",
    priority: "mid",
    difficulty: 2,
    status: "doing",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "t3",
    title: "英語プレゼン練習",
    category: "スキル",
    priority: "low",
    difficulty: 1,
    status: "done",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
  },
  {
    id: "t4",
    title: "ゼミ資料作成",
    category: "大学",
    priority: "high",
    difficulty: 4,
    status: "done",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "t5",
    title: "Next.js の復習",
    category: "スキル",
    priority: "mid",
    difficulty: 2,
    status: "todo",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
];