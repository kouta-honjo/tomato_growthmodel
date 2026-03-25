"use client";

import { useState, useMemo } from "react";
import {
  analyzeRisk,
  calcVPD,
  INTERVENTIONS,
  type ForecastInput,
  type RiskProfile,
  type InterventionResult,
} from "@/lib/decision";

/* ── リスクカラー ─────────────────────────────── */
function riskColor(pct: number): string {
  if (pct >= 60) return "text-red-600";
  if (pct >= 35) return "text-amber-600";
  return "text-green-700";
}
function riskBg(pct: number): string {
  if (pct >= 60) return "bg-red-500";
  if (pct >= 35) return "bg-amber-400";
  return "bg-green-500";
}
function riskLabel(pct: number): string {
  if (pct >= 60) return "高リスク";
  if (pct >= 35) return "要注意";
  return "低リスク";
}

/* ── リスクバー ──────────────────────────────── */
function RiskBar({
  label,
  base,
  after,
}: {
  label: string;
  base: number;
  after?: number;
}) {
  const current = after ?? base;
  const diff = after !== undefined ? base - after : 0;
  return (
    <div className="mb-1">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-gray-500">{label}</span>
        <div className="flex items-baseline gap-2">
          {diff > 0 && (
            <span className="text-[10px] font-semibold text-green-600">▼{diff}pt</span>
          )}
          <span className={`text-sm font-bold ${riskColor(current)}`}>{current}%</span>
        </div>
      </div>
      <div className="relative h-2.5 overflow-hidden rounded-full bg-gray-200">
        {after !== undefined && (
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gray-300 opacity-40"
            style={{ width: `${base}%` }}
          />
        )}
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${riskBg(current)}`}
          style={{ width: `${current}%` }}
        />
      </div>
    </div>
  );
}

/* ── スライダー ──────────────────────────────── */
function Slider({
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
  note,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  note?: string;
}) {
  return (
    <div>
      <div className="mb-0.5 flex items-baseline justify-between">
        <label className="text-xs font-medium text-gray-600">{label}</label>
        <span className="text-sm font-bold text-gray-800">
          {value.toFixed(step < 1 ? 1 : 0)}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-green-700"
      />
      {note && <p className="mt-0.5 text-[10px] text-gray-400">{note}</p>}
    </div>
  );
}

/* ── 介入カード ──────────────────────────────── */
function InterventionCard({
  result,
  base,
  selected,
  onToggle,
}: {
  result: InterventionResult;
  base: RiskProfile;
  selected: boolean;
  onToggle: () => void;
}) {
  const botDiff = base.botrytis - result.risk.botrytis;
  const crDiff = base.cracking - result.risk.cracking;
  const pmDiff = base.powderyMildew - result.risk.powderyMildew;
  const totalDiff = botDiff + crDiff + pmDiff;

  return (
    <div
      onClick={onToggle}
      className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
        selected ? "border-green-500 bg-green-50" : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-xs font-bold ${selected ? "text-green-700" : "text-gray-700"}`}>
              {result.intervention.label}
            </span>
            <span className="rounded bg-gray-100 px-1 py-0.5 text-[9px] text-gray-500">
              {result.intervention.watt}
            </span>
          </div>
          <p className="mt-0.5 text-[10px] leading-snug text-gray-400">
            {result.intervention.description}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {totalDiff > 0 ? (
            <span className="text-sm font-extrabold text-green-600">計▼{totalDiff}pt</span>
          ) : (
            <span className="text-xs text-gray-400">効果なし</span>
          )}
        </div>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1 border-t border-gray-100 pt-2">
        {[
          { label: "灰色かび", diff: botDiff, after: result.risk.botrytis },
          { label: "裂果", diff: crDiff, after: result.risk.cracking },
          { label: "うどんこ", diff: pmDiff, after: result.risk.powderyMildew },
        ].map(({ label, diff, after }) => (
          <div key={label} className="text-center">
            <p className="text-[9px] text-gray-400">{label}</p>
            <p className={`text-xs font-bold ${riskColor(after)}`}>
              {after}%
              {diff > 0 && (
                <span className="ml-0.5 text-[9px] text-green-600">▼{diff}</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── メインコンポーネント ─────────────────────── */
export default function DecisionAdvisor() {
  const [forecast, setForecast] = useState<ForecastInput>({
    tempNightMin: 13,
    tempDayMax: 24,
    rhNight: 82,
    rhMorning: 85,
    freeWaterHours: 3,
    vwc: 30,
    vwcDelta: 6,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const set = (key: keyof ForecastInput) => (v: number) =>
    setForecast((f) => ({ ...f, [key]: v }));

  const toggleIntv = (id: string) =>
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    );

  // ベースリスクと各介入の単体効果
  const { base, singleInterventions, allCombined } = useMemo(
    () => analyzeRisk(forecast),
    [forecast]
  );

  // 選択した介入を重ねて適用したリスク
  const selectedCombined = useMemo((): RiskProfile | null => {
    if (selectedIds.length === 0) return null;
    const applied = selectedIds.reduce<ForecastInput>((f, id) => {
      const intv = INTERVENTIONS.find((i) => i.id === id);
      return intv ? { ...f, ...intv.effect(f) } : f;
    }, forecast);
    return analyzeRisk(applied).base;
  }, [selectedIds, forecast]);

  const vpd = calcVPD(forecast.tempNightMin, forecast.rhNight);
  const deltaT = forecast.tempDayMax - forecast.tempNightMin;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-1 text-base font-bold text-gray-800">
        翌日リスク予測 &amp; 意思決定アドバイザー
      </h2>
      <p className="mb-4 text-[11px] text-gray-400">
        翌日の気象予測を入力すると病害罹患リスク(%)を算出し、制御手段を選択することでリスク低減効果をシミュレーションします。
        （根拠: decision-doc v2 §1〜5）
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── 入力 ── */}
        <div className="space-y-3 rounded-lg bg-gray-50 p-4 lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            翌日の気象予測
          </p>
          <Slider label="夜間最低気温" unit="°C" value={forecast.tempNightMin}
            min={0} max={30} step={0.5} onChange={set("tempNightMin")} />
          <Slider label="昼間最高気温" unit="°C" value={forecast.tempDayMax}
            min={10} max={45} step={0.5} onChange={set("tempDayMax")}
            note={`昼夜ΔT: ${deltaT.toFixed(1)}°C`} />
          <Slider label="夜間RH" unit="%" value={forecast.rhNight}
            min={30} max={100} step={1} onChange={set("rhNight")}
            note={`夜間VPD: ${vpd.toFixed(3)} kPa`} />
          <Slider label="早朝(5〜7時)RH" unit="%" value={forecast.rhMorning}
            min={30} max={100} step={1} onChange={set("rhMorning")} />
          <Slider label="葉面自由水の予測持続時間" unit="h"
            value={forecast.freeWaterHours} min={0} max={12} step={0.5}
            onChange={set("freeWaterHours")} note="降雨・結露の見込みから推定" />
          <Slider label="現在VWC" unit="%" value={forecast.vwc}
            min={0} max={60} step={1} onChange={set("vwc")} />
          <Slider label="灌水1回あたりVWC変化幅" unit="pt"
            value={forecast.vwcDelta} min={0} max={20} step={0.5}
            onChange={set("vwcDelta")} note="灌水なし → 0" />
        </div>

        {/* ── リスク & 介入 ── */}
        <div className="space-y-4 lg:col-span-2">
          {/* ベースリスク */}
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              予測リスク（制御なし）
            </p>
            <div className="space-y-3">
              <RiskBar label="灰色かび病（Botrytis cinerea）" base={base.botrytis} />
              <RiskBar label="裂果" base={base.cracking} />
              <RiskBar label="うどんこ病（参考値）" base={base.powderyMildew} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 border-t pt-3 text-center">
              {[
                { label: "灰色かび病", val: base.botrytis },
                { label: "裂果", val: base.cracking },
                { label: "うどんこ病", val: base.powderyMildew },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p className={`text-3xl font-extrabold ${riskColor(val)}`}>{val}%</p>
                  <p className="text-[10px] text-gray-500">{label}</p>
                  <p className={`text-[10px] font-semibold ${riskColor(val)}`}>{riskLabel(val)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 介入シミュレーション */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              制御手段を選択してリスク低減をシミュレーション
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {singleInterventions.map((r) => (
                <InterventionCard
                  key={r.intervention.id}
                  result={r}
                  base={base}
                  selected={selectedIds.includes(r.intervention.id)}
                  onToggle={() => toggleIntv(r.intervention.id)}
                />
              ))}
            </div>
          </div>

          {/* 選択した介入の合算結果 */}
          {selectedCombined && (
            <div className="rounded-lg border-2 border-green-400 bg-green-50 p-4">
              <p className="mb-3 text-xs font-semibold text-green-700">
                選択した制御（{selectedIds.length}手段）を実施した場合の予測リスク
              </p>
              <div className="space-y-2">
                <RiskBar label="灰色かび病" base={base.botrytis} after={selectedCombined.botrytis} />
                <RiskBar label="裂果" base={base.cracking} after={selectedCombined.cracking} />
                <RiskBar label="うどんこ病" base={base.powderyMildew} after={selectedCombined.powderyMildew} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-green-200 pt-3 text-center">
                {([
                  ["灰色かび病", base.botrytis, selectedCombined.botrytis],
                  ["裂果", base.cracking, selectedCombined.cracking],
                  ["うどんこ病", base.powderyMildew, selectedCombined.powderyMildew],
                ] as [string, number, number][]).map(([label, b, a]) => (
                  <div key={label}>
                    <p className={`text-3xl font-extrabold ${riskColor(a)}`}>{a}%</p>
                    <p className="text-[9px] text-gray-500">{label}</p>
                    {b !== a && (
                      <p className="text-[10px] font-bold text-green-600">
                        {b}% → {a}%（▼{b - a}pt）
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 全手段を実施した場合の参考値 */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
            <p className="mb-2 text-[10px] font-semibold text-gray-500">
              参考: 全手段を実施した場合の理論的最低リスク
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {([
                ["灰色かび病", base.botrytis, allCombined.risk.botrytis],
                ["裂果", base.cracking, allCombined.risk.cracking],
                ["うどんこ病", base.powderyMildew, allCombined.risk.powderyMildew],
              ] as [string, number, number][]).map(([label, b, a]) => (
                <div key={label}>
                  <p className={`text-xl font-extrabold ${riskColor(a)}`}>{a}%</p>
                  <p className="text-[9px] text-gray-400">{label}</p>
                  <p className="text-[9px] text-gray-400">{b}% → {a}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
