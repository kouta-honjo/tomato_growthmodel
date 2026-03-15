/** 品種パラメータ：桃太郎ファイト近似値（日本大玉トマト代表値） */
export const PARAMS = {
  /** 吸光係数 (無次元) */
  k: 0.75,
  /** 基準光利用効率 (g DW MJ⁻¹ PAR) — 大気CO₂下 */
  LUE_o: 2.5,
  /** CO₂回帰係数 a */
  a_co2: 1.52,
  /** CO₂回帰係数 b */
  b_co2: -7.2,
  /** 果実分配率 (g DW / g DW) */
  HI: 0.65,
  /** 果実乾物率 (g DW / g FW) — 糖度5°Brix相当 */
  DMC: 0.06,
  /** 展葉速度係数 (枚 株⁻¹ day⁻¹ ℃⁻¹) */
  alpha: 0.28,
  /** 展葉速度ベース温度 (℃) */
  T_base: 10.0,
  /** 個葉面積係数 */
  c: 0.65,
  /** 栽植密度 (株/m²) */
  rho: 2.5,
  /** 初期葉数 (枚/株) */
  n_0: 8,
  /** 初期個葉面積 (cm²) */
  A_0: 150,
  /** 最大個葉面積 (cm²) */
  A_max: 400,
} as const;

/** パラメータの説明テーブル（UI表示用） */
export const PARAM_TABLE: {
  symbol: string;
  name: string;
  value: string;
  unit: string;
}[] = [
  { symbol: "k", name: "吸光係数", value: "0.75", unit: "—" },
  { symbol: "LUE₀", name: "基準光利用効率", value: "2.5", unit: "g DW MJ⁻¹" },
  { symbol: "a", name: "CO₂回帰係数 a", value: "1.52", unit: "—" },
  { symbol: "b", name: "CO₂回帰係数 b", value: "−7.20", unit: "—" },
  { symbol: "HI", name: "果実分配率", value: "0.65", unit: "g DW / g DW" },
  { symbol: "DMC", name: "果実乾物率", value: "0.060", unit: "g DW / g FW" },
  { symbol: "α", name: "展葉速度係数", value: "0.28", unit: "枚 株⁻¹ d⁻¹ ℃⁻¹" },
  { symbol: "T_base", name: "ベース温度", value: "10.0", unit: "℃" },
  { symbol: "c", name: "個葉面積係数", value: "0.65", unit: "—" },
  { symbol: "ρ", name: "栽植密度", value: "2.5", unit: "株/m²" },
  { symbol: "n₀", name: "初期葉数", value: "8", unit: "枚/株" },
  { symbol: "A₀", name: "初期個葉面積", value: "150", unit: "cm²" },
  { symbol: "A_max", name: "最大個葉面積", value: "400", unit: "cm²" },
];
