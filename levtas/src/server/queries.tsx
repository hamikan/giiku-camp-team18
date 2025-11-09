// src/server/queries.tsx
import { prisma } from "@/lib/prisma";
import { deriveLevelFromTotalExp } from "@/lib/leveling";

export async function getHeaderProps(userId: number) {
  const [user, categories] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, exp: true }, // ← levelは取らない
    }),
    prisma.category.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
  ]);

  const total = user?.exp ?? 0;
  const derived = deriveLevelFromTotalExp(total);

  const level = {
    current: derived.level,
    xp: derived.xpIntoLevel,
    xpForNext: derived.xpForNext,
  };

  return {
    user,
    level,
    categories: categories.map(c => c.name),
  };
}
