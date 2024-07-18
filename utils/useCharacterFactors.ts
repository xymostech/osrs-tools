import useLocalStorageState from "@/utils/useLocalStorageState";
import { defaultUnlockFactors } from "@/utils/calculateSlayerUnlocks";
import { defaultBlockFactors } from "@/utils/calculateBlockStats";

import {
  CharacterFactors,
  defaultCharacterFactors,
  parseShareLink,
} from "./characterFactors";

function addDefaultKeys<T extends object>(oldValue: T, defaultValues: T): T {
  const result = { ...oldValue };
  for (const k of Object.keys(defaultValues)) {
    const key: keyof T = k as keyof T;
    if (result[key] == null) {
      result[key] = defaultValues[key];
    }
  }
  return result;
}

function updateLocalStorageState(
  oldLocalStorageValue: CharacterFactors,
): CharacterFactors {
  const updatedLocalStorageValue = {
    ...oldLocalStorageValue,
    unlockFactors: oldLocalStorageValue.unlockFactors ?? defaultBlockFactors,
    blockFactors: oldLocalStorageValue.blockFactors ?? defaultBlockFactors,
  };
  updatedLocalStorageValue.unlockFactors = {
    ...addDefaultKeys(
      updatedLocalStorageValue.unlockFactors,
      defaultUnlockFactors,
    ),
    quests: addDefaultKeys(
      updatedLocalStorageValue.unlockFactors.quests,
      defaultUnlockFactors.quests,
    ),
    slayerUnlocks: addDefaultKeys(
      updatedLocalStorageValue.unlockFactors.slayerUnlocks,
      defaultUnlockFactors.slayerUnlocks,
    ),
  };

  return updatedLocalStorageValue;
}

export default function useCharacterFactors() {
  return useLocalStorageState<CharacterFactors>(
    "CHARACTER_INFO",
    defaultCharacterFactors,
    parseShareLink,
    updateLocalStorageState,
  );
}
