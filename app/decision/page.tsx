"use client";

import dynamic from "next/dynamic";

const DecisionAdvisor = dynamic(() => import("@/components/DecisionAdvisor"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="animate-pulse text-lg text-gray-500">読み込み中…</p>
    </div>
  ),
});

export default function DecisionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1a5632] text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-2xl">
            🍅
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              意思決定支援アドバイザー
            </h1>
            <p className="mt-0.5 text-xs text-green-200">
              翌日の気象予測から病害リスクを算出し、制御手段のシミュレーションを行います
            </p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <DecisionAdvisor />
      </main>
    </div>
  );
}
