// app/tasks/new/page.tsx
import { prisma } from "@/lib/prisma";
import NewTaskClient from "@/components/tasks/new/NewTaskClient";

const USER_ID = 1; // TODO: 認証に置き換え

export default async function Page() {
  const categories = await prisma.category.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  });

  return (
    <NewTaskClient
      userId={USER_ID}
      categories={categories.map((c) => c.name)}
    />
  );
}
