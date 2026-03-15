/**
 * 天文計算：大気外日射量 Ra、可照時間 N の算出
 * FAO Penman-Monteith (FAO56) 準拠
 */

const GSC = 0.0820; // 太陽定数 MJ m⁻² min⁻¹
const TSUKUBA_LAT = 36.06; // つくば緯度 (度)

/** 年通日を算出 (1–365/366) */
export function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor(
    (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
}

/** 太陽赤緯 δ (rad) */
function solarDeclination(J: number): number {
  return 0.409 * Math.sin((2 * Math.PI * J) / 365 - 1.39);
}

/** 日没時角 ωs (rad) */
function sunsetHourAngle(latDeg: number, decl: number): number {
  const latRad = (latDeg * Math.PI) / 180;
  const cosWs = -Math.tan(latRad) * Math.tan(decl);
  return Math.acos(Math.max(-1, Math.min(1, cosWs)));
}

/** 可照時間 N (h) */
export function possibleSunshineHours(date: Date): number {
  const J = dayOfYear(date);
  const decl = solarDeclination(J);
  const ws = sunsetHourAngle(TSUKUBA_LAT, decl);
  return (24 / Math.PI) * ws;
}

/** 大気外日射量 Ra (MJ m⁻² day⁻¹) */
export function extraterrestrialRadiation(date: Date): number {
  const J = dayOfYear(date);
  const latRad = (TSUKUBA_LAT * Math.PI) / 180;
  const dr = 1 + 0.033 * Math.cos((2 * Math.PI * J) / 365);
  const decl = solarDeclination(J);
  const ws = sunsetHourAngle(TSUKUBA_LAT, decl);

  return (
    ((24 * 60) / Math.PI) *
    GSC *
    dr *
    (ws * Math.sin(latRad) * Math.sin(decl) +
      Math.cos(latRad) * Math.cos(decl) * Math.sin(ws))
  );
}

/**
 * Angström–Prescott 式で日照時間 → PAR を算出
 * @param sunshineHours 実測日照時間 (h)
 * @param date 日付
 * @returns PAR (MJ PAR m⁻² day⁻¹)
 */
export function sunshineToPAR(sunshineHours: number, date: Date): number {
  const Ra = extraterrestrialRadiation(date);
  const N = possibleSunshineHours(date);
  const aS = 0.25;
  const bS = 0.5;
  const Rs = (aS + bS * (sunshineHours / Math.max(N, 0.1))) * Ra;
  return 0.45 * Rs;
}
