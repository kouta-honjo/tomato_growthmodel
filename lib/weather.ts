/**
 * 気象データ生成（つくば）
 *
 * 気象庁月別平年値をベースに、年ごとの偏差を加味して
 * 決定論的に日別気温・日照時間を生成する。
 */

import { dayOfYear, sunshineToPAR } from "./astronomy";

export interface DailyWeather {
  date: string; // YYYY-MM-DD
  temp: number; // 日平均気温 ℃
  sunshine: number; // 日照時間 h
  PAR: number; // MJ PAR m⁻² day⁻¹
}

// つくば月別平年値 (1月–12月)
const TEMP_NORMALS = [
  3.5, 4.2, 8.0, 13.2, 18.0, 21.0, 25.0, 26.5, 22.5, 16.5, 10.5, 5.0,
];
const SUN_NORMALS = [
  6.5, 5.8, 5.8, 5.7, 5.5, 4.3, 4.8, 6.0, 4.2, 4.3, 5.5, 6.2,
];

/** 決定論的疑似乱数 (0–1) */
function noise(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** 月別平年値をコサイン補間 */
function interpolate(normals: number[], month: number, frac: number): number {
  const next = (month + 1) % 12;
  const t = (1 - Math.cos(frac * Math.PI)) / 2;
  return normals[month] * (1 - t) + normals[next] * t;
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * 指定期間の日別気象データを生成
 * @param startYear 栽培開始年 (8月1日開始)
 * @param yearType 'good' = 2022年型, 'bad' = 2017年型
 */
export function generateWeather(
  startYear: number,
  yearType: "good" | "bad"
): DailyWeather[] {
  const start = new Date(startYear, 7, 1); // Aug 1
  const end = new Date(startYear + 1, 5, 15); // Jun 15
  const data: DailyWeather[] = [];

  const cur = new Date(start);
  while (cur <= end) {
    const month = cur.getMonth();
    const day = cur.getDate();
    const daysInMonth = new Date(
      cur.getFullYear(),
      month + 1,
      0
    ).getDate();
    const frac = (day - 1) / daysInMonth;

    let temp = interpolate(TEMP_NORMALS, month, frac);
    let sun = interpolate(SUN_NORMALS, month, frac);

    // 決定論的日変動
    const seed = cur.getFullYear() * 366 + dayOfYear(cur);
    temp += (noise(seed) - 0.5) * 6;
    sun += (noise(seed + 1000) - 0.5) * 3;

    // 年型補正
    if (yearType === "good") {
      sun *= 1.08;
    } else {
      sun *= month >= 6 && month <= 8 ? 0.7 : 0.95;
    }

    sun = Math.max(0, Math.min(sun, 13));

    const PAR = sunshineToPAR(sun, cur);

    data.push({
      date: formatDate(cur),
      temp: Math.round(temp * 10) / 10,
      sunshine: Math.round(sun * 10) / 10,
      PAR: Math.round(PAR * 100) / 100,
    });

    cur.setDate(cur.getDate() + 1);
  }

  return data;
}
