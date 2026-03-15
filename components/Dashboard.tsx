"use client";

import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { runSimulation, type SimulationResult } from "@/lib/simulator";
import { PARAM_TABLE } from "@/lib/params";

/* ── colour tokens ─────────────────────────────── */
const C_GOOD = "#16a34a"; // green-600
const C_BAD = "#dc2626"; // red-600

/* ── types ──────────────────────────────────────── */
interface MergedRow {
  dat: number;
  dateGood: string;
  dateBad: string;
  temp_good: number;
  temp_bad: number;
  PAR_good: number;
  PAR_bad: number;
  LAI_good: number;
  LAI_bad: number;
  LUE_good: number;
  LUE_bad: number;
  IL_c_good: number;
  IL_c_bad: number;
  TDM_good: number;
  TDM_bad: number;
}

/* ── reusable chart panel ──────────────────────── */
function ChartPanel({
  title,
  description,
  data,
  goodKey,
  badKey,
  unit,
  precision = 1,
}: {
  title: string;
  description: string;
  data: MergedRow[];
  goodKey: keyof MergedRow;
  badKey: keyof MergedRow;
  unit: string;
  precision?: number;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-1 text-sm font-semibold text-gray-700">{title}</h3>
      <p className="mb-2 text-[11px] leading-snug text-gray-400">
        {description}
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart
          data={data}
          margin={{ top: 4, right: 16, bottom: 4, left: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="dat"
            tick={{ fontSize: 10 }}
            label={{
              value: "DAT",
              position: "insideBottomRight",
              offset: -4,
              fontSize: 10,
            }}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            label={{
              value: unit,
              angle: -90,
              position: "insideLeft",
              offset: 10,
              fontSize: 10,
            }}
          />
          <Tooltip
            formatter={(v: number) => v.toFixed(precision)}
            labelFormatter={(l: number) => `DAT ${l}`}
          />
          <Legend
            verticalAlign="top"
            height={28}
            wrapperStyle={{ fontSize: 11 }}
          />
          <Line
            type="monotone"
            dataKey={goodKey}
            stroke={C_GOOD}
            name="Good"
            dot={false}
            strokeWidth={1.4}
          />
          <Line
            type="monotone"
            dataKey={badKey}
            stroke={C_BAD}
            name="Bad"
            dot={false}
            strokeWidth={1.4}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── main dashboard ────────────────────────────── */
export default function Dashboard() {
  const [results, setResults] = useState<{
    good: SimulationResult | null;
    bad: SimulationResult | null;
  }>({ good: null, bad: null });

  const [error, setError] = useState<string | null>(null);
  const [showParams, setShowParams] = useState(false);

  useEffect(() => {
    try {
      const good = runSimulation("good");
      const bad = runSimulation("bad");
      setResults({ good, bad });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const merged = useMemo<MergedRow[]>(() => {
    if (!results.good || !results.bad) return [];
    return results.good.daily.map((g, i) => {
      const b = results.bad!.daily[i];
      return {
        dat: g.dat,
        dateGood: g.date,
        dateBad: b?.date ?? "",
        temp_good: g.temp,
        temp_bad: b?.temp ?? 0,
        PAR_good: g.PAR,
        PAR_bad: b?.PAR ?? 0,
        LAI_good: g.LAI,
        LAI_bad: b?.LAI ?? 0,
        LUE_good: g.LUE,
        LUE_bad: b?.LUE ?? 0,
        IL_c_good: g.IL_c,
        IL_c_bad: b?.IL_c ?? 0,
        TDM_good: g.TDM,
        TDM_bad: b?.TDM ?? 0,
      };
    });
  }, [results]);

  /* error */
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <p className="font-bold text-red-700">シミュレーションエラー</p>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  /* loading */
  if (!results.good || !results.bad) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="animate-pulse text-lg text-gray-500">
          シミュレーション実行中…
        </p>
      </div>
    );
  }

  const yG = results.good.yield;
  const yB = results.bad.yield;
  const diffPct = ((yG.kgPerM2 - yB.kgPerM2) / yB.kgPerM2) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── header ── */}
      <header className="bg-[#1a5632] text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-2xl">
            🍅
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              トマト生育・収量予測シミュレーター
            </h1>
            <p className="mt-0.5 text-xs text-green-200">
              NARO 物質生産モデル（東出・Heuvelink 2009）｜ Angström–Prescott
              式による PAR 換算
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        {/* ── scenario cards ── */}
        <section className="grid gap-4 md:grid-cols-3">
          {/* Good */}
          <div className="rounded-xl border-t-4 border-green-600 bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-bold text-green-700">Good 条件</h3>
            <dl className="space-y-1.5 text-sm">
              {[
                ["気象年", "2022 年（日照多）"],
                ["CO₂ 濃度", "700 µmol mol⁻¹"],
                ["気温補正", "なし"],
                ["栽培期間", "2022/8/1 – 2023/6/15"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-gray-500">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Bad */}
          <div className="rounded-xl border-t-4 border-red-600 bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-bold text-red-600">Bad 条件</h3>
            <dl className="space-y-1.5 text-sm">
              {[
                ["気象年", "2017 年（日照不足）"],
                ["CO₂ 濃度", "400 µmol mol⁻¹"],
                ["気温補正", "7・8 月 +3 ℃"],
                ["栽培期間", "2017/8/1 – 2018/6/15"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-gray-500">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* yield summary */}
          <div className="rounded-xl border-t-4 border-blue-600 bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-bold text-blue-700">最終収量比較</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Good</span>
                <p className="text-2xl font-extrabold text-green-600">
                  {yG.kgPerM2.toFixed(1)}{" "}
                  <span className="text-base font-normal">kg m⁻²</span>
                </p>
                <p className="text-xs text-gray-400">
                  {yG.tPer10a.toFixed(1)} t / 10 a
                </p>
              </div>
              <div>
                <span className="text-gray-500">Bad</span>
                <p className="text-2xl font-extrabold text-red-600">
                  {yB.kgPerM2.toFixed(1)}{" "}
                  <span className="text-base font-normal">kg m⁻²</span>
                </p>
                <p className="text-xs text-gray-400">
                  {yB.tPer10a.toFixed(1)} t / 10 a
                </p>
              </div>
              <div className="border-t pt-2">
                <span className="text-gray-500">差</span>
                <p className="text-lg font-bold text-blue-600">
                  +{diffPct.toFixed(1)} %
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6-panel charts ── */}
        <section className="grid gap-4 lg:grid-cols-2">
          <ChartPanel
            title="日平均気温 — temp (℃)"
            description="気象庁つくば観測点の日平均気温。Bad条件では7・8月にハウス内高温を想定し +3℃ 補正。"
            data={merged}
            goodKey="temp_good"
            badKey="temp_bad"
            unit="℃"
          />
          <ChartPanel
            title="光合成有効放射 — PAR (MJ m⁻² day⁻¹)"
            description="日照時間から Angström–Prescott 式で全天日射量 Rs を算出し、PAR = 0.45 × Rs で換算した日積算値。"
            data={merged}
            goodKey="PAR_good"
            badKey="PAR_bad"
            unit="MJ/m²/d"
            precision={2}
          />
          <ChartPanel
            title="葉面積指数 — LAI"
            description="単位地表面積あたりの葉面積（m² 葉 / m² 地面）。展葉速度 α と栽植密度 ρ から日次更新。群落の光吸収能力を示す。"
            data={merged}
            goodKey="LAI_good"
            badKey="LAI_bad"
            unit=""
            precision={2}
          />
          <ChartPanel
            title="光利用効率 — LUE (g DW MJ⁻¹)"
            description="吸収光 1 MJ あたりの乾物生産量。CO₂ 濃度の対数関数で算出（LUE = a·ln(CO₂) + b）。Good: 700 ppm → 2.76、Bad: 400 ppm → 1.91。"
            data={merged}
            goodKey="LUE_good"
            badKey="LUE_bad"
            unit="g/MJ"
            precision={2}
          />
          <ChartPanel
            title="積算受光量 — IL_c (MJ m⁻²)"
            description="群落が吸収した光の累積量。IL_c = Σ(PAR × f_int)。f_int は Beer–Lambert 則による群落光吸収割合。"
            data={merged}
            goodKey="IL_c_good"
            badKey="IL_c_bad"
            unit="MJ/m²"
            precision={0}
          />
          <ChartPanel
            title="総乾物重 — TDM (g DW m⁻²)"
            description="地上部乾物生産量の累積値。TDM = Σ(LUE × IL_d)。最終的に HI（果実分配率）と DMC（乾物率）で生果収量に換算。"
            data={merged}
            goodKey="TDM_good"
            badKey="TDM_bad"
            unit="g/m²"
            precision={0}
          />
        </section>

        {/* ── parameter table ── */}
        <section>
          <button
            onClick={() => setShowParams((p) => !p)}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100"
          >
            <span className={`transition ${showParams ? "rotate-90" : ""}`}>
              ▶
            </span>
            品種パラメータ一覧（日本大玉トマト代表値）
          </button>

          {showParams && (
            <div className="mt-3 overflow-x-auto rounded-xl bg-white shadow-sm">
              <table className="min-w-full text-sm">
                <thead className="border-b bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="px-4 py-2">記号</th>
                    <th className="px-4 py-2">パラメータ</th>
                    <th className="px-4 py-2 text-right">値</th>
                    <th className="px-4 py-2">単位</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {PARAM_TABLE.map((p) => (
                    <tr key={p.symbol} className="hover:bg-gray-50">
                      <td className="px-4 py-1.5 font-mono text-xs">
                        {p.symbol}
                      </td>
                      <td className="px-4 py-1.5">{p.name}</td>
                      <td className="px-4 py-1.5 text-right font-medium">
                        {p.value}
                      </td>
                      <td className="px-4 py-1.5 text-gray-500">{p.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── model description ── */}
        <section className="rounded-xl border border-gray-200 bg-white p-5 text-xs leading-relaxed text-gray-500 shadow-sm">
          <p className="font-semibold text-gray-700">モデル概要</p>
          <p className="mt-1">
            本シミュレーターは農研機構の物質生産モデル（東出・Heuvelink
            2009；東出 2018）を TypeScript
            に移植したものです。日照時間から Angström–Prescott
            式で日射量を換算し、Beer–Lambert
            則で群落光吸収、CO₂濃度依存の光利用効率（LUE）で乾物生産量を日ステップで積算します。
          </p>
          <p className="mt-1 text-gray-400">
            ※ 個葉面積は単純線形近似。高温着果不良（日平均 28℃ 超）は未組込のため
            Bad 条件の収量は過大推定の可能性があります。
          </p>
        </section>
      </main>

      <footer className="border-t bg-gray-100 py-4 text-center text-xs text-gray-400">
        Tomato Growth Model v0.1 — OpenClaw / NARO 物質生産モデル準拠
      </footer>
    </div>
  );
}
