import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "トマト生育・収量予測シミュレーター",
  description:
    "NARO物質生産モデルに基づく施設トマトの生育シミュレーション。Good/Bad 2条件を比較。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
