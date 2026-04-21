import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI-диагностика отдела продаж",
  description: "Первичный аудит и рекомендации по росту продаж за 24 часа."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
