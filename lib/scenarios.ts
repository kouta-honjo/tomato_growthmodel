export interface Scenario {
  label: string;
  year: number;
  co2: number;
  tempOffset: (month: number) => number;
  startDate: string;
  endDate: string;
}

export const SCENARIOS: Record<"good" | "bad", Scenario> = {
  good: {
    label: "Good条件",
    year: 2022,
    co2: 700,
    tempOffset: () => 0,
    startDate: "2022-08-01",
    endDate: "2023-06-15",
  },
  bad: {
    label: "Bad条件",
    year: 2017,
    co2: 400,
    tempOffset: (month: number) => (month === 7 || month === 8 ? 3 : 0),
    startDate: "2017-08-01",
    endDate: "2018-06-15",
  },
};
