/**
 * シミュレーションループ制御
 */

import { generateWeather } from "./weather";
import { initialState, stepDay, type DailyState } from "./model";
import { SCENARIOS, type Scenario } from "./scenarios";
import { PARAMS } from "./params";

export interface YieldResult {
  /** kg FW m⁻² */
  kgPerM2: number;
  /** t / 10a */
  tPer10a: number;
}

export interface SimulationResult {
  scenario: Scenario;
  daily: DailyState[];
  yield: YieldResult;
}

export function runSimulation(key: "good" | "bad"): SimulationResult {
  const scenario = SCENARIOS[key];
  const weather = generateWeather(
    scenario.year,
    key
  );

  const daily: DailyState[] = [];

  for (let i = 0; i < weather.length; i++) {
    const w = weather[i];
    const d = new Date(w.date);
    const month = d.getMonth() + 1; // 1-indexed
    const temp = w.temp + scenario.tempOffset(month);

    if (i === 0) {
      daily.push(initialState(w.date, temp, w.PAR, scenario.co2));
    } else {
      daily.push(
        stepDay(daily[i - 1], w.date, i, temp, w.PAR, scenario.co2)
      );
    }
  }

  const lastTDM = daily[daily.length - 1].TDM;
  const kgPerM2 = (lastTDM * PARAMS.HI) / PARAMS.DMC / 1000;
  const tPer10a = kgPerM2 * 10;

  return {
    scenario,
    daily,
    yield: { kgPerM2, tPer10a },
  };
}
