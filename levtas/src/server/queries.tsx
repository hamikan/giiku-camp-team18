import { prisma } from "@/lib/prisma";
import { capForLevel } from "@/lib/leveling";

export async function getHeaderProps(userId: number) {
  const [user, categories] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, level: true, exp: true },
    }),
    prisma.category.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
  ]);

  const level = {
    current: user?.level ?? 1,
    xp: user?.exp ?? 0,
    xpForNext: capForLevel(user?.level ?? 1),
  };

  return {
    user, // 必要なら返す
    level,
    categories: categories.map(c => c.name),
  };
}
