"use client";

import dynamic from "next/dynamic";

const Dashboard = dynamic(() => import("@/components/Dashboard"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="animate-pulse text-lg text-gray-500">読み込み中…</p>
    </div>
  ),
});

export default function Home() {
  return <Dashboard />;
}
