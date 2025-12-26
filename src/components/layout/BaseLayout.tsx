// components/layouts/BaseLayout.tsx
import type { ReactNode } from "react";

interface BaseLayoutProps {
  children: ReactNode;
  maxWidth?: string;
  background?: string;
  height?: string;
}

export default function BaseLayout({
  children,
  maxWidth = "max-w-screen",
  background = "bg-white dark:bg-black",
  height = "min-h-screen",
}: BaseLayoutProps) {
  return (
    <div
      className={`flex w-full items-center justify-center ${background} ${height}`}
    >
      <main className={`w-full ${maxWidth}`}>{children}</main>
    </div>
  );
}
