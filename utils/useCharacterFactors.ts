import useLocalStorageState from "@/utils/useLocalStorageState";
import {
  UnlockFactors,
  defaultUnlockFactors,
  shorthandQuestUnlockKeys,
  shorthandSlayerUnlockKeys,
  shorthandUnlockFactorKeys,
} from "@/utils/calculateSlayerUnlocks";
import {
  BlockFactors,
  defaultBlockFactors,
  shorthandBlockFactorKeys,
} from "@/utils/calculateBlockStats";
import { URLSearchParams } from "url";

export type CharacterFactors = {
  unlockFactors: UnlockFactors;
  blockFactors: BlockFactors;
};
const defaultCharacterInfo = {
  unlockFactors: defaultUnlockFactors,
  blockFactors: defaultBlockFactors,
};

export function shortenCharacterFactors(
  factors: CharacterFactors,
): Map<string, string> {
  const map = new Map<string, string>();

  for (const [key, shortKey] of shorthandUnlockFactorKeys) {
    const factorValue = factors.unlockFactors[key];
    if (typeof factorValue === "number") {
      map.set("u:" + shortKey, factorValue.toString());
    } else if (typeof factorValue === "boolean") {
      map.set("u:" + shortKey, factorValue ? "1" : "0");
    } else {
      throw new Error("Unknown shorthand key type!");
    }
  }

  for (const [key, shortKey] of shorthandQuestUnlockKeys) {
    if (!factors.unlockFactors.quests[key]) {
      map.set("u:" + shortKey, "0");
    }
  }
  for (const [key, shortKey] of shorthandSlayerUnlockKeys) {
    if (factors.unlockFactors.slayerUnlocks[key]) {
      map.set("u:" + shortKey, "1");
    }
  }

  for (const [key, shortKey] of shorthandBlockFactorKeys) {
    const factorValue = factors.blockFactors[key];
    if (typeof factorValue === "number") {
      map.set("b:" + shortKey, factorValue.toString());
    } else if (typeof factorValue === "boolean") {
      map.set("b:" + shortKey, factorValue ? "1" : "0");
    } else {
      throw new Error("Unknown shorthand key type!");
    }
  }

  return map;
}

function parseShareLink(shareData: URLSearchParams): CharacterFactors {
  const finalFactors = defaultCharacterInfo;

  for (const [key, shortKey] of shorthandUnlockFactorKeys) {
    if (shareData.has("u:" + shortKey)) {
      if (typeof finalFactors.unlockFactors[key] === "number") {
        // @ts-ignore
        finalFactors.unlockFactors[key] = parseInt(
          shareData.get("u:" + shortKey)!,
          10,
        );
      } else if (typeof finalFactors.unlockFactors[key] === "boolean") {
        // @ts-ignore
        finalFactors.unlockFactors[key] =
          shareData.get("u:" + shortKey) === "1";
      } else {
        throw new Error("Unknown shorthand key type!");
      }
    }
  }

  for (const [key, shortKey] of shorthandQuestUnlockKeys) {
    if (shareData.get("u:" + shortKey) === "0") {
      finalFactors.unlockFactors.quests[key] = false;
    }
  }
  for (const [key, shortKey] of shorthandSlayerUnlockKeys) {
    if (shareData.get("u:" + shortKey) === "1") {
      finalFactors.unlockFactors.slayerUnlocks[key] = true;
    }
  }

  for (const [key, shortKey] of shorthandBlockFactorKeys) {
    if (shareData.has("b:" + shortKey)) {
      if (typeof finalFactors.blockFactors[key] === "number") {
        // @ts-ignore
        finalFactors.blockFactors[key] = parseInt(
          shareData.get("b:" + shortKey)!,
          10,
        );
      } else if (typeof finalFactors.blockFactors[key] === "boolean") {
        // @ts-ignore
        finalFactors.blockFactors[key] = shareData.get("b:" + shortKey) === "1";
      } else {
        throw new Error("Unknown shorthand key type!");
      }
    }
  }

  return finalFactors;
}

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
    defaultCharacterInfo,
    parseShareLink,
    updateLocalStorageState,
  );
}
