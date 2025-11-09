import "@/app/globals.css";
import type { ReactNode } from "react";
import ClientShell from "@/app/(main)/ClientShell";
import { getHeaderProps } from "@/server/queries";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const userId = 1; // TODO: 認証で取得
  const { user, categories } = await getHeaderProps(userId); // ← もう string[] で来る
  const level = { current: user?.level ?? 1, xp: user?.exp ?? 0, xpForNext: 100 };

  return (
    <html lang="ja">
      <body>
        <ClientShell level={level} categories={categories}>
          {children}
        </ClientShell>
      </body>
    </html>
  );
}
