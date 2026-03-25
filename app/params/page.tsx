"use client";

import dynamic from "next/dynamic";

const ParamsPage = dynamic(() => import("@/components/ParamsPage"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <p className="animate-pulse text-lg text-gray-500">読み込み中…</p>
    </div>
  ),
});

export default function ParamsRoute() {
  return <ParamsPage />;
}
