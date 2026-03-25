/**
 * decision.ts
 * decision-doc.md のThresholds をもとに、
 * 翌日の気象予測から「病害罹患リスク(%)」と
 * 「介入後の推定リスク低減幅」を算出する。
 */

/* ── 基本閾値（decision-doc §5 THRESHOLDS より） ── */
export const THRESHOLDS = {
  // 灰色かび病
  vpd_risk: 0.35,
  vpd_critical: 0.20,
  rh_botrytis_risk: 80,
  free_water_min_h: 4,
  free_water_certain_h: 8,
  temp_night_min: 15,
  delta_t_caution: 8,
  delta_t_risk: 10,

  // 裂果
  rh_morning_risk: 80,
  vwc_change_max: 8,

  // 高温障害
  temp_pollen_stress: 32,
  temp_flower_drop: 35,
  temp_night_max: 24,

  // うどんこ病
  pm_risk_rh_low: 60,
  pm_risk_rh_high: 85,
  pm_risk_temp_low: 20,
  pm_risk_temp_high: 25,
} as const;

/* ── 物理計算 ───────────────────────────────────── */

/** Buck式による飽和水蒸気圧 (kPa) */
export function satVP(tempC: number): number {
  return 0.61121 * Math.exp((18.678 - tempC / 234.5) * (tempC / (257.14 + tempC)));
}

/** VPD (kPa) を気温とRHから算出 */
export function calcVPD(tempC: number, rh: number): number {
  return Math.max(0, satVP(tempC) * (1 - rh / 100));
}

/* ── 入力型 ────────────────────────────────────── */

/**
 * 翌日の気象予測と現在の環境状態を表す入力型。
 * 実際のセンサー値またはアメダス予測値を想定。
 */
export interface ForecastInput {
  /** 翌日の予測夜間最低気温 (°C) */
  tempNightMin: number;
  /** 翌日の予測昼間最高気温 (°C) */
  tempDayMax: number;
  /** 翌日の予測夜間RH (%) */
  rhNight: number;
  /** 翌朝5〜7時の予測RH (%) */
  rhMorning: number;
  /** 葉面に自由水が残ると推定される時間 (h) ※降雨・結露由来 */
  freeWaterHours: number;
  /** 現在の土壌体積含水率 (%) */
  vwc: number;
  /** 翌日の灌水で生じる予測VWC変化幅 (pt/回) */
  vwcDelta: number;
}

/* ── リスクスコア（0〜100） ─────────────────────── */

/**
 * 灰色かび病 罹患リスク (0〜100)。
 * VPD・RH・葉面自由水・夜温の4因子から算出。
 * 根拠: O'Neill et al. (1997), Broome et al. (1995), Hua et al. (2023)
 */
export function botrytisRisk(f: ForecastInput): number {
  const vpd = calcVPD(f.tempNightMin, f.rhNight);

  // VPD 寄与（最大45pt）
  let vpdPt = 0;
  if (vpd < THRESHOLDS.vpd_critical) {
    vpdPt = 45;
  } else if (vpd < THRESHOLDS.vpd_risk) {
    vpdPt = 45 * (THRESHOLDS.vpd_risk - vpd) / (THRESHOLDS.vpd_risk - THRESHOLDS.vpd_critical);
  }

  // 葉面自由水 寄与（最大35pt）
  let fwPt = 0;
  if (f.freeWaterHours >= THRESHOLDS.free_water_certain_h) {
    fwPt = 35;
  } else if (f.freeWaterHours >= THRESHOLDS.free_water_min_h) {
    fwPt = 35 * (f.freeWaterHours - THRESHOLDS.free_water_min_h) /
      (THRESHOLDS.free_water_certain_h - THRESHOLDS.free_water_min_h);
  }

  // 夜温 寄与（最大15pt）
  const tempPt = f.tempNightMin < THRESHOLDS.temp_night_min
    ? 15 * Math.min(1, (THRESHOLDS.temp_night_min - f.tempNightMin) / 5)
    : 0;

  // RH 寄与（最大10pt、vpdと二重計上を抑制するため補助的）
  const rhPt = f.rhNight > 90
    ? 10
    : f.rhNight > THRESHOLDS.rh_botrytis_risk
      ? 10 * (f.rhNight - THRESHOLDS.rh_botrytis_risk) / (90 - THRESHOLDS.rh_botrytis_risk)
      : 0;

  return Math.min(100, Math.round(vpdPt + fwPt + tempPt + rhPt));
}

/**
 * 裂果リスク (0〜100)。
 * 早朝RH・昼夜温度差・灌水VWC急変の3因子。
 * 根拠: Liu et al. (2024), decision-doc §3
 */
export function crackingRisk(f: ForecastInput): number {
  const deltaT = f.tempDayMax - f.tempNightMin;

  // 早朝RH 寄与（最大40pt）
  const rhPt = f.rhMorning > THRESHOLDS.rh_morning_risk
    ? 40 * Math.min(1, (f.rhMorning - THRESHOLDS.rh_morning_risk) / 15)
    : 0;

  // ΔT 寄与（最大35pt）
  let dtPt = 0;
  if (deltaT >= THRESHOLDS.delta_t_risk) {
    dtPt = 35 * Math.min(1, (deltaT - THRESHOLDS.delta_t_risk) / 10 + 0.5);
  } else if (deltaT >= THRESHOLDS.delta_t_caution) {
    dtPt = 35 * (deltaT - THRESHOLDS.delta_t_caution) /
      (THRESHOLDS.delta_t_risk - THRESHOLDS.delta_t_caution) * 0.5;
  }

  // VWC急変 寄与（最大25pt）
  const vwcPt = f.vwcDelta > THRESHOLDS.vwc_change_max
    ? 25 * Math.min(1, (f.vwcDelta - THRESHOLDS.vwc_change_max) / 10 + 0.4)
    : 0;

  return Math.min(100, Math.round(rhPt + dtPt + vwcPt));
}

/**
 * うどんこ病リスク (0〜100)。
 * 環境制御だけでは完全防除不可のため参考値として提供。
 * 根拠: Jacob et al. (2008), Lebeda et al. (2015)
 */
export function powderyMildewRisk(f: ForecastInput): number {
  // 気温リスク係数（20〜25°C が最大）
  const tMid = (THRESHOLDS.pm_risk_temp_low + THRESHOLDS.pm_risk_temp_high) / 2; // 22.5
  const tRange = THRESHOLDS.pm_risk_temp_high - THRESHOLDS.pm_risk_temp_low; // 5
  const tFactor = Math.max(0, 1 - Math.abs(f.tempDayMax - tMid) / tRange);

  // RH リスク係数（60〜85% が最大）
  const rhMid = (THRESHOLDS.pm_risk_rh_low + THRESHOLDS.pm_risk_rh_high) / 2; // 72.5
  const rhRange = THRESHOLDS.pm_risk_rh_high - THRESHOLDS.pm_risk_rh_low; // 25
  let rhFactor = 0;
  if (f.rhNight >= THRESHOLDS.pm_risk_rh_low && f.rhNight <= THRESHOLDS.pm_risk_rh_high) {
    rhFactor = 1 - Math.abs(f.rhNight - rhMid) / (rhRange / 2);
  }

  return Math.min(100, Math.round(tFactor * rhFactor * 80));
}

/* ── 介入効果モデル ─────────────────────────────── */

export interface Intervention {
  id: string;
  label: string;
  /** 消費電力目安 */
  watt: string;
  /** 制御内容の説明 */
  description: string;
  /** 環境への効果（推定） */
  effect: (f: ForecastInput) => Partial<ForecastInput>;
}

export const INTERVENTIONS: Intervention[] = [
  {
    id: "fan",
    label: "循環扇（夜間〜早朝）",
    watt: "30〜50 W",
    description: "葉面境界層を破壊して結露を防ぎ、早朝RHを低下させる。4:30〜日の出後1hの自動タイマー運転が有効。",
    effect: (f) => ({
      freeWaterHours: Math.max(0, f.freeWaterHours - 3),
      rhMorning: Math.max(f.rhMorning - 8, 40),
      rhNight: Math.max(f.rhNight - 5, 40),
    }),
  },
  {
    id: "heating",
    label: "暖房（15°C 下限・間欠運転）",
    watt: "大→最小化",
    description: "夜温が15°C以下に落ちた時のみ起動。気温を上げることでVPDが回復し結露リスクが低下する。常時加温は不要。",
    effect: (f) => ({
      tempNightMin: Math.max(f.tempNightMin, 15),
      rhNight: Math.max(f.rhNight - 5, 40), // 温度上昇による相対湿度の低下
    }),
  },
  {
    id: "ventilation",
    label: "日没前換気（30〜60 min のみ）",
    watt: "0 W",
    description: "夜間前に湿気を排出し、その後閉鎖して暖房を最小化。換気で温度が下がるため夜間RH上昇に注意。",
    effect: (f) => ({
      rhNight: Math.max(f.rhNight - 10, 40),
      freeWaterHours: Math.max(0, f.freeWaterHours - 1),
    }),
  },
  {
    id: "irrigation",
    label: "灌水制御（少量多回・〜16:00）",
    watt: "0 W",
    description: "夕方以降の灌水禁止 + 1回あたりのVWC変化幅を8pt以内に制限。乾燥期後は段階的に戻す。",
    effect: (f) => ({
      vwcDelta: Math.min(f.vwcDelta, THRESHOLDS.vwc_change_max),
      rhMorning: Math.max(f.rhMorning - 4, 40),
    }),
  },
];

/* ── 出力型 ────────────────────────────────────── */

export interface RiskProfile {
  botrytis: number;
  cracking: number;
  powderyMildew: number;
}

export interface InterventionResult {
  intervention: Intervention;
  applied: ForecastInput;
  risk: RiskProfile;
}

/** 介入を適用した後のForecastInputを生成 */
function applyInterventions(base: ForecastInput, ids: string[]): ForecastInput {
  return ids.reduce((f, id) => {
    const intv = INTERVENTIONS.find((i) => i.id === id);
    return intv ? { ...f, ...intv.effect(f) } : f;
  }, base);
}

/** ベースリスクと各介入後のリスクをまとめて返す */
export function analyzeRisk(f: ForecastInput): {
  base: RiskProfile;
  singleInterventions: InterventionResult[];
  allCombined: { applied: ForecastInput; risk: RiskProfile };
} {
  const base: RiskProfile = {
    botrytis: botrytisRisk(f),
    cracking: crackingRisk(f),
    powderyMildew: powderyMildewRisk(f),
  };

  const singleInterventions: InterventionResult[] = INTERVENTIONS.map((intv) => {
    const applied = applyInterventions(f, [intv.id]);
    return {
      intervention: intv,
      applied,
      risk: {
        botrytis: botrytisRisk(applied),
        cracking: crackingRisk(applied),
        powderyMildew: powderyMildewRisk(applied),
      },
    };
  });

  const allApplied = applyInterventions(f, INTERVENTIONS.map((i) => i.id));
  const allCombined = {
    applied: allApplied,
    risk: {
      botrytis: botrytisRisk(allApplied),
      cracking: crackingRisk(allApplied),
      powderyMildew: powderyMildewRisk(allApplied),
    },
  };

  return { base, singleInterventions, allCombined };
}
