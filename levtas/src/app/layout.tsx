import "@/app/globals.css";
import type { ReactNode } from "react";
import ClientShell from "@/app/(main)/ClientShell";
import { getHeaderProps } from "@/server/queries";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const userId = 1; // TODO: 認証から取得
  // getHeaderProps は { user, level, categories } を返す実装にしてある前提
  const { level, categories } = await getHeaderProps(userId);

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
