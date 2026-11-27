import * as becker from "./becker";
import * as bakery from "./bakery";

export const DEMOS = { becker, bakery } as const;
export type DemoId = keyof typeof DEMOS;
export const DEMO_LABELS: Record<DemoId, string> = {
  becker: "Painter, 14 people",
  bakery: "Bakery, 2 shops",
};
