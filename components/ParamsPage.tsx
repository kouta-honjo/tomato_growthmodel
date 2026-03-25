"use client";

import { useState, useEffect, useCallback } from "react";
import { PARAMS } from "@/lib/params";

/* ── デフォルト値 ── */
const DEFAULT_MODEL = {
  k: PARAMS.k,
  LUE_o: PARAMS.LUE_o,
  a_co2: PARAMS.a_co2,
  b_co2: PARAMS.b_co2,
  HI: PARAMS.HI,
  DMC: PARAMS.DMC,
  alpha: PARAMS.alpha,
  T_base: PARAMS.T_base,
  c: PARAMS.c,
  rho: PARAMS.rho,
  n_0: PARAMS.n_0,
  A_0: PARAMS.A_0,
  A_max: PARAMS.A_max,
};

const DEFAULT_ECONOMIC = {
  electricity: 27,       // 円/kWh
  kerosene: 110,         // 円/L
  fanWatt: 40,           // W（循環扇1台）
  heaterLh: 0.35,        // L/h（暖房機）
  houseArea: 1000,       // m²
  yieldPer10a: 20000,    // kg/10a
  tomatoPrice: 250,      // 円/kg
  crackBaseRate: 5,      // %（裂果基準率）
};

const MODEL_DEFS: { key: keyof typeof DEFAULT_MODEL; label: string; unit: string; step: number }[] = [
  { key: "k",       label: "吸光係数",           unit: "—",              step: 0.01 },
  { key: "LUE_o",   label: "基準光利用効率",      unit: "g DW MJ⁻¹",     step: 0.01 },
  { key: "a_co2",   label: "CO₂回帰係数 a",       unit: "—",              step: 0.01 },
  { key: "b_co2",   label: "CO₂回帰係数 b",       unit: "—",              step: 0.1  },
  { key: "HI",      label: "果実分配率",           unit: "g DW / g DW",   step: 0.01 },
  { key: "DMC",     label: "果実乾物率",           unit: "g DW / g FW",   step: 0.001 },
  { key: "alpha",   label: "展葉速度係数",         unit: "枚 株⁻¹ d⁻¹ ℃⁻¹", step: 0.01 },
  { key: "T_base",  label: "ベース温度",           unit: "℃",             step: 0.1  },
  { key: "c",       label: "個葉面積係数",         unit: "—",              step: 0.01 },
  { key: "rho",     label: "栽植密度",             unit: "株/m²",          step: 0.1  },
  { key: "n_0",     label: "初期葉数",             unit: "枚/株",          step: 1    },
  { key: "A_0",     label: "初期個葉面積",         unit: "cm²",            step: 1    },
  { key: "A_max",   label: "最大個葉面積",         unit: "cm²",            step: 1    },
];

const ECONOMIC_DEFS: { key: keyof typeof DEFAULT_ECONOMIC; label: string; unit: string; step: number }[] = [
  { key: "electricity",   label: "電気料金",           unit: "円/kWh",  step: 0.1  },
  { key: "kerosene",      label: "灯油単価",           unit: "円/L",    step: 1    },
  { key: "fanWatt",       label: "循環扇消費電力",     unit: "W",       step: 1    },
  { key: "heaterLh",      label: "暖房機消費量",       unit: "L/h",     step: 0.01 },
  { key: "houseArea",     label: "ハウス面積",         unit: "m²",      step: 10   },
  { key: "yieldPer10a",   label: "収量",               unit: "kg/10a",  step: 100  },
  { key: "tomatoPrice",   label: "トマト単価",         unit: "円/kg",   step: 1    },
  { key: "crackBaseRate", label: "裂果基準率",         unit: "%",       step: 0.1  },
];

/* ── 数値入力フィールド ── */
function NumberField({
  label,
  unit,
  value,
  step,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-700">{label}</p>
        <p className="text-[10px] text-gray-400">{unit}</p>
      </div>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v)) onChange(v);
        }}
        className="w-24 rounded border border-gray-300 px-2 py-1 text-right text-sm font-mono focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
      />
    </div>
  );
}

/* ── メインコンポーネント ── */
export default function ParamsPage() {
  const [model, setModel] = useState({ ...DEFAULT_MODEL });
  const [economic, setEconomic] = useState({ ...DEFAULT_ECONOMIC });
  const [saved, setSaved] = useState(false);

  // localStorageから読み込み
  useEffect(() => {
    try {
      const m = localStorage.getItem("tomato-model-params");
      if (m) setModel({ ...DEFAULT_MODEL, ...JSON.parse(m) });
      const e = localStorage.getItem("tomato-decision-params");
      if (e) setEconomic({ ...DEFAULT_ECONOMIC, ...JSON.parse(e) });
    } catch {
      // ignore
    }
  }, []);

  const save = useCallback(() => {
    localStorage.setItem("tomato-model-params", JSON.stringify(model));
    localStorage.setItem("tomato-decision-params", JSON.stringify(economic));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [model, economic]);

  const reset = useCallback(() => {
    setModel({ ...DEFAULT_MODEL });
    setEconomic({ ...DEFAULT_ECONOMIC });
    localStorage.removeItem("tomato-model-params");
    localStorage.removeItem("tomato-decision-params");
  }, []);

  const setModelKey = (key: keyof typeof DEFAULT_MODEL) => (v: number) =>
    setModel((m) => ({ ...m, [key]: v }));

  const setEconomicKey = (key: keyof typeof DEFAULT_ECONOMIC) => (v: number) =>
    setEconomic((e) => ({ ...e, [key]: v }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1a5632] text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-2xl">
            🍅
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">パラメータ設定</h1>
            <p className="mt-0.5 text-xs text-green-200">
              モデルパラメータおよび経済パラメータを編集・保存します
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            変更はブラウザのlocalStorageに保存されます。シミュレーションへの即時反映は今後対応予定です。
          </p>
          <div className="flex gap-2">
            <button
              onClick={reset}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              デフォルトに戻す
            </button>
            <button
              onClick={save}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              {saved ? "保存しました" : "保存"}
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* モデルパラメータ */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-1 text-base font-bold text-gray-800">モデルパラメータ</h2>
            <p className="mb-4 text-[11px] text-gray-400">
              品種パラメータ：日本大玉トマト代表値（NARO 物質生産モデル）
            </p>
            <div className="space-y-2">
              {MODEL_DEFS.map((d) => (
                <NumberField
                  key={d.key}
                  label={d.label}
                  unit={d.unit}
                  step={d.step}
                  value={model[d.key]}
                  onChange={setModelKey(d.key)}
                />
              ))}
            </div>
          </section>

          {/* 経済パラメータ */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-1 text-base font-bold text-gray-800">経済パラメータ</h2>
            <p className="mb-4 text-[11px] text-gray-400">
              コスト・収益計算に使用する経済条件パラメータ
            </p>
            <div className="space-y-2">
              {ECONOMIC_DEFS.map((d) => (
                <NumberField
                  key={d.key}
                  label={d.label}
                  unit={d.unit}
                  step={d.step}
                  value={economic[d.key]}
                  onChange={setEconomicKey(d.key)}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
