export enum SlayerTaskPreference {
  SKIP = "SKIP",
  DO = "DO",
}

export const SLAYER_TASK_PREFERENCE_LABELS = new Map([
  [SlayerTaskPreference.SKIP, "Skip"],
  [SlayerTaskPreference.DO, "Do"],
]);
