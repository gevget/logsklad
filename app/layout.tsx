import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ЛогСклад — логистическая платформа",
    template: "%s · ЛогСклад",
  },
  description: "Единая демо-платформа для управления перевозками и складскими операциями.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
