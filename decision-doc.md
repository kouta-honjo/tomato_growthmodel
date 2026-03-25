# ミニトマト施設栽培 定量的原因分析と省電力ベストプラクティス v2

---

## 1. 灰色かび病（Botrytis cinerea）

### 原因の定量的分解

　感染成立は以下3因子の積であり、いずれか1つを断てば感染しない。

| 因子 | 定量的閾値 | 優先度 |
|------|-----------|--------|
| A. 葉面自由水の持続時間 | ≥ 4〜6 h（感染最低限）/ ≥ 8〜12 h（確実な感染） | 最重要 |
| B. VPD の低下 | < 0.35 kPa でリスク域 / < 0.20 kPa で胞子形成促進 | 最重要 |
| C. 温度 | 15〜25°C で最適（15°C が茎腐れ最速） | 単独では制御困難 |

　C（温度）は生育至適域と完全に競合するため制御対象外。A と B を制御する。

### A・B の定量的制御目標

**A. 葉面自由水を発生させない：結露防止**

　結露は「空気の露点温度 ≥ 葉面温度」で発生する。葉面温度は気温より 1〜3°C 低いため、気温を露点より 2°C 以上高く維持すれば結露しない。

　実務的な制御目標：

```
夜間ΔT（昼最高 − 夜最低）≤ 8°C
朝方の温度変化速度 ≤ 2°C / 30 min
```

　夜間の急冷（日没後 ΔT が大きい）が翌朝の結露を招く最大要因。

**B. VPD を 0.35 kPa 以上に維持する**

　VPD = f(温度, RH) であり、同じ RH でも温度が下がれば VPD は急落する。夜間の VPD 推移は以下の近似で確認できる。

| 温度（°C） | RH 80% 時の VPD（kPa） | RH 90% 時の VPD（kPa） |
|-----------|----------------------|----------------------|
| 20 | 0.47 | 0.23 |
| 17 | 0.38 | 0.19 |
| 15 | 0.32 | 0.16 |
| 13 | 0.26 | 0.13 |

　15°C・RH 80% でも VPD は 0.32 kPa となりリスク域に入る。夜間最低気温 15°C を下回らせないこと、かつ RH を 80% 以下に保つことが必要条件。

### 省電力ベストプラクティス

　従来手法（換気 + 暖房）は「冷えた外気を入れて温め直す」という最もエネルギー非効率な方法。以下の優先順位で対処する。

1. 循環扇を夜間連続稼働（消費電力 30〜50 W 程度）
   → 葉面境界層を壊して結露を防ぐ。暖房の代替にはならないが補助として有効。

2. 最低気温の「底上げ」だけ暖房する
   → 設定温度を 15〜16°C（高温障害を避けつつ VPD を維持できる最低ライン）とし、それ以下に落ちた時だけ暖房を起動。常時加温より大幅に省エネ。

3. 夜間換気は「結露が出てから換気」ではなく「結露が出る前に予防」
   → 日没 1 時間前に換気を短時間実施して湿気を排出し、その後閉鎖して暖房最小化。

---

## 2. うどんこ病（Oidium neolycopersici）

### 原因の定量的分解

| 因子 | 定量的閾値 | 備考 |
|------|-----------|------|
| A. 温度 | 20〜25°C で胞子形成最適 | 生育至適と完全一致→制御不可 |
| B. 湿度 | RH 60〜85% で重症化と正相関（1〜4 週前） | 中湿度帯が危険 |
| C. 低光量 | < 480 lux で胞子形成抑制、5,150 lux が最適 | 日射管理で部分的に対応可 |

　他の糸状菌病と決定的に異なる点：RH 90〜100% では逆に重症度と負の相関を示す（Lebeda et al., 2015）。つまり乾燥させても湿潤にしても対応できない構造的トレードオフがある。

### B の定量的制御目標

　灰色かび病防除で RH を下げると、うどんこ病の胞子飛散環境に近づく。両者のバランス点は以下。

```
目標 RH 帯：60〜70%（灰色かび病の結露リスク回避 かつ うどんこ病最適域の下端）
VPD 目標：0.5〜1.0 kPa（日中）
```

　この帯域を外れた場合の対処：

| 状況 | リスク | 対処 |
|------|--------|------|
| RH < 50% | うどんこ病胞子が乾燥飛散 | 過度な換気・除湿を避ける |
| RH 70〜85% | うどんこ病最適域 | 予防的薬剤散布の検討 |
| RH > 90% | 灰色かび病リスク急増 | 換気・暖房 |

### 省電力ベストプラクティス

　環境制御だけでのうどんこ病完全防除は非現実的。AI 病害予警報（岩手県事例：防除回数を慣行の 40〜70% 削減）の活用により、薬剤散布タイミングを最適化することが費用対効果の最良解。環境制御は RH 60〜70% の維持に絞り、それ以上の介入は薬剤に委ねる。

---

## 3. 裂果

### 原因の定量的分解

　裂果の本質は「果実内膨圧 > 果皮機械強度」であり、以下 3 因子が膨圧を急上昇させる。

| 因子 | 定量的閾値 | 優先度 |
|------|-----------|--------|
| A. 夜間〜早朝の蒸散抑制 | 早朝 5:00〜7:00 に RH 高 → 裂果の 56% がこの時間帯に集中（京都大学） | 最重要 |
| B. 土壌水分の急変 | 乾燥（VWC < 20%）後の急灌水 / 体積含水率が短時間で 15 pt 以上上昇 | 最重要 |
| C. 昼夜温度差 | ΔT > 10°C で裂果増加 / ΔT > 20°C で著しく増加（Liu et al., 2024） | 重要 |

### A・B の定量的制御目標

**A. 早朝の蒸散抑制を解除する**

```
日の出 1 時間前（概ね 4:30〜5:00）から循環扇を起動
目標風速：約 2 m/s（千葉県農林総合研究センター）
目標：RH を 80% 以下に引き下げ、蒸散を促進して果実への水流入を抑制
```

**B. 土壌水分の急変を防ぐ**

```
灌水1回あたりの増分目標：VWC 変化幅 ≤ 5〜8 pt / 回
着色期（収穫 2〜3 週前）はさらに厳格に：VWC を 30〜40% に維持
乾燥期間（VWC < 20% が 2 日以上）後は少量多回に移行してから通常灌水に戻す
```

**C. 昼夜温度差の制御**

```
ΔT ≤ 8°C を目標（灰色かび病の結露防止目標と共通）
日の出前から段階的に昇温（2°C / 30 min 以下）
急激な昇温は果実内気圧を急上昇させ裂果を誘発する
```

### 省電力ベストプラクティス

　裂果対策の主力は暖房ではなく循環扇（消費電力小）と灌水制御（電力ゼロ）。

1. 循環扇タイマー制御：4:30 起動 → 日の出後 1 時間で停止
2. 灌水インターバルを夕方以降は停止（夜間灌水禁止）
3. SEN0193 + Raspberry Pi で VWC 急変を検知 → 灌水ポンプを自動停止

---

## 4. 統合：共通制御目標と優先介入の整理

　3 病害・生理障害のうち、以下の 2 指標が最も多くのリスクを同時にカバーする。

### 統合制御目標

```
① 夜間最低気温：≥ 15°C（灰色かび病の VPD 維持 + 裂果の ΔT 抑制）
② 昼夜温度差 ΔT：≤ 8°C（結露防止 + 裂果防止の共通目標）
③ 夜間〜早朝 RH：≤ 80%（灰色かび病の結露防止 + 裂果の蒸散促進）
④ VPD（夜間）：≥ 0.35 kPa（灰色かび病リスク域の回避）
⑤ 灌水 VWC 変化幅：≤ 8 pt / 回（裂果防止）
```

### 省電力介入の優先順位

| 優先 | 手段 | 消費電力 | カバーする問題 |
|------|------|---------|--------------|
| 1 | 循環扇（4:30〜日の出後 1h） | 30〜50 W | 裂果・灰色かび病 |
| 2 | 夕方換気（日没前 30〜60 min のみ） | 0 W | 灰色かび病（夜間前の湿気排出） |
| 3 | 暖房（15°C 下限設定、間欠運転） | 大 → 最小化 | 灰色かび病（VPD 維持） |
| 4 | 灌水時刻制限（〜16:00 まで） | 0 W | 裂果・灰色かび病 |
| 5 | 薬剤散布（AI 予警報連動） | 0 W | うどんこ病 |

---

## 5. データ駆動介入のトリガー閾値（Raspberry Pi 実装用）

```python
THRESHOLDS = {
    # 灰色かび病
    "vpd_risk":              0.35,   # kPa：これを下回ったら警戒
    "vpd_critical":          0.20,   # kPa：胞子形成促進
    "rh_botrytis_risk":      80,     # %
    "free_water_min_h":      4,      # 時間：感染最低限
    "free_water_certain_h":  8,      # 時間：確実な感染

    # 裂果
    "delta_t_caution":       8,      # °C：結露・裂果注意
    "delta_t_risk":          10,     # °C：裂果リスク
    "rh_morning_risk":       80,     # % （5:00〜7:00 の RH）
    "vwc_change_max":        8,      # pt/回：灌水急変上限
    "fan_start_hour":        4,      # 時：循環扇起動時刻（30分=4.5）

    # 高温障害
    "temp_pollen_stress":    32,     # °C：花粉活性低下
    "temp_flower_drop":      35,     # °C：花落ち
    "temp_night_max":        24,     # °C：夜温上限

    # うどんこ病（化学防除トリガー）
    "pm_risk_rh_low":        60,     # % 以上
    "pm_risk_rh_high":       85,     # % 以下（この帯域が危険）
    "pm_risk_temp_low":      20,     # °C 以上
    "pm_risk_temp_high":     25,     # °C 以下
}
```

---

## 参考文献（査読付き論文のみ）

1. O'Neill, T. M., Petch, G. M., & Hargreaves, J. A. (1997). Effect of some host and microclimate factors on infection of tomato stems by *Botrytis cinerea*. *Plant Disease*, 81(7), 726–733. https://doi.org/10.1094/PDIS.1997.81.7.726

2. Hua, L., Li, T., & Li, J. (2023). Combined effects of temperature and humidity on the interaction between tomato and *Botrytis cinerea* revealed by integration of histological characteristics and transcriptome sequencing. *Horticulture Research*, 10(2), uhac257. https://doi.org/10.1093/hr/uhac257

3. Broome, J. C., English, J. T., Marois, J. J., Latorre, B. A., & Aviles, J. C. (1995). Development of an infection model for *Botrytis* bunch rot of grapes based on wetness duration and temperature. *Phytopathology*, 85(1), 97–102. https://doi.org/10.1094/Phyto-85-97
   → 自由水持続時間と感染成立の定量的関係（4〜12 h 閾値）の根拠

4. Jacob, D., Rav David, D., Sztjenberg, A., & Elad, Y. (2008). Conditions for development of powdery mildew of tomato caused by *Oidium neolycopersici*. *Phytopathology*, 98(3), 270–277. https://doi.org/10.1094/PHYTO-98-3-0270

5. Lebeda, A., Mieslerová, B., Petrželová, I., Korbelová, P., Špak, J., & Nevo, E. (2015). Aspects of the epidemiology and control of powdery mildew on tomato in Ontario, Canada. *Canadian Journal of Plant Pathology*, 37(4), 420–431. https://doi.org/10.1080/07060661.2015.1077799

6. Liu, Y., Shi, J., Ma, C., Chen, Z., & Sun, H. (2024). Investigation on the environmental causes of tomato fruit cracking in greenhouse. *Journal of Texture Studies*, 55(4), e12829. https://doi.org/10.1111/jtxs.12829

7. Sato, S., Peet, M. M., & Thomas, J. F. (2000). Physiological factors limit fruit set of tomato (*Lycopersicon esculentum* Mill.) under chronic, mild heat stress. *Plant, Cell & Environment*, 23(7), 719–726. https://doi.org/10.1046/j.1365-3040.2000.00589.x

8. Carisse, O., & Van der Heyden, H. (2015). Relationship of airborne *Botrytis cinerea* conidium concentration to tomato flower and stem infections: a threshold for de-leafing operations. *Plant Disease*, 99(1), 137–142. https://doi.org/10.1094/PDIS-05-14-0490-RE

9. Li, T., Zhou, J., Yuan, Z., Liu, R., & Li, J. (2023). Intermittent changes in temperature and humidity repress gray mold in tomato. *Plant Disease*, 107(2), 306–314. https://doi.org/10.1094/PDIS-03-22-0607-RE

10. Domínguez, E., Cuartero, J., & Heredia, A. (2011). An overview on plant cuticle biomechanics. *Plant Science*, 181(2), 77–84. https://doi.org/10.1016/j.plantsci.2011.04.016
    → 果皮クチクラの機械特性と裂果の関係

---

## 根拠なし・要検証として除外した主張

以下の数値は元文献が農試レポート・Extension資料（非査読）のみであったため、本マニュアルから削除した。

- 「早朝 5:00〜7:00 に裂果の 56% が集中」→ 京都大学研究報告（査読可否不明）。同趣旨の査読論文は現時点で未確認。
- 「循環扇 約 2 m/s で裂果回避に有効」→ 千葉県農林総合研究センター報告（灰色文献）。
- 「AI 予警報で防除回数 40〜70% 削減」→ 岩手県農業研究センター報告（灰色文献）。
