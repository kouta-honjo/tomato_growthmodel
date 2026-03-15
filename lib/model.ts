/**
 * 1日ステップ計算ロジック
 * 東出・Heuvelink (2009) の物質生産モデル
 */

import { PARAMS } from "./params";

export interface DailyState {
  date: string;
  dat: number; // Days After Transplanting
  temp: number; // ℃
  PAR: number; // MJ PAR m⁻² day⁻¹
  CO2: number; // µmol/mol
  n_leaves: number; // 枚/株
  A_leaf: number; // cm²
  LAI: number;
  f_int: number;
  IL_d: number; // MJ m⁻² day⁻¹
  IL_c: number; // MJ m⁻² (累積)
  LUE: number; // g DW MJ⁻¹
  TDM: number; // g DW m⁻²
}

export function initialState(date: string, temp: number, PAR: number, CO2: number): DailyState {
  const { k, c, rho, n_0, A_0, a_co2, b_co2, LUE_o } = PARAMS;

  const LAI = n_0 * A_0 * c * rho * 1e-4;
  const f_int = 1 - Math.exp(-k * LAI);
  const IL_d = PAR * f_int;
  let LUE = a_co2 * Math.log(CO2) + b_co2;
  LUE = Math.max(LUE, LUE_o);
  const TDM = LUE * IL_d;

  return {
    date,
    dat: 0,
    temp,
    PAR,
    CO2,
    n_leaves: n_0,
    A_leaf: A_0,
    LAI,
    f_int,
    IL_d,
    IL_c: IL_d,
    LUE,
    TDM,
  };
}

export function stepDay(
  prev: DailyState,
  date: string,
  dat: number,
  temp: number,
  PAR: number,
  CO2: number
): DailyState {
  const { k, alpha, T_base, c, rho, A_0, A_max, a_co2, b_co2, LUE_o } =
    PARAMS;

  // Step 1: 展葉
  const deltaN = alpha * Math.max(temp - T_base, 0);
  const n_leaves = prev.n_leaves + deltaN;

  // Step 2: 個葉面積（線形漸増、頭打ち）
  const A_leaf = Math.min(A_0 + ((A_max - A_0) * dat) / 200, A_max);

  // Step 3: LAI
  const LAI = n_leaves * A_leaf * c * rho * 1e-4;

  // Step 4: 群落光吸収
  const f_int = 1 - Math.exp(-k * LAI);

  // Step 5: 日受光量
  const IL_d = PAR * f_int;
  const IL_c = prev.IL_c + IL_d;

  // Step 6: LUE CO₂補正
  let LUE = a_co2 * Math.log(CO2) + b_co2;
  LUE = Math.max(LUE, LUE_o);

  // Step 7: 乾物生産
  const TDM = prev.TDM + LUE * IL_d;

  return { date, dat, temp, PAR, CO2, n_leaves, A_leaf, LAI, f_int, IL_d, IL_c, LUE, TDM };
}
