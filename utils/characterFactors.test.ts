import { set } from "lodash/fp";
import { test, expect } from "@jest/globals";

import {
  CharacterFactors,
  defaultCharacterFactors,
  shortenCharacterFactors,
  parseShareLink,
} from "./characterFactors";

function generateCharacterFactors(
  properties: [string[], any][],
): CharacterFactors {
  let result = defaultCharacterFactors;

  for (const [key, value] of properties) {
    result = set(key, value, result);
  }

  return result;
}

function shortenAndParseFactors(factors: CharacterFactors): CharacterFactors {
  const shortened = shortenCharacterFactors(factors);
  const params = new URLSearchParams();
  for (const [key, value] of shortened.entries()) {
    params.append(key, value);
  }
  return parseShareLink(params);
}

test("shortens character factor boolean and number values", () => {
  const returnedFactors = shortenAndParseFactors(
    generateCharacterFactors([
      [["unlockFactors", "combatLevel"], 60],
      [["unlockFactors", "magicLevel"], 40],
      [["unlockFactors", "ignoreCombatLevel"], false],
      [["blockFactors", "lumbridgeEliteComplete"], false],
      [["blockFactors", "questPoints"], 160],
    ]),
  );

  expect(returnedFactors.unlockFactors.combatLevel).toBe(60);
  expect(returnedFactors.unlockFactors.magicLevel).toBe(40);
  expect(returnedFactors.unlockFactors.ignoreCombatLevel).toBe(false);
  expect(returnedFactors.blockFactors.lumbridgeEliteComplete).toBe(false);
  expect(returnedFactors.blockFactors.questPoints).toBe(160);
});

test("shortens quest and slayer unlocks", () => {
  const returnedFactors = shortenAndParseFactors(
    generateCharacterFactors([
      [["unlockFactors", "quests", "boneVoyage"], true],
      [["unlockFactors", "quests", "dragonSlayerI"], true],
      [["unlockFactors", "quests", "priestInPeril"], false],
      [["unlockFactors", "quests", "regicide"], false],
      [["unlockFactors", "slayerUnlocks", "seeingRed"], true],
      [["unlockFactors", "slayerUnlocks", "likeABoss"], true],
      [["unlockFactors", "slayerUnlocks", "basilocked"], false],
      [["unlockFactors", "slayerUnlocks", "hotStuff"], false],
    ]),
  );

  expect(returnedFactors.unlockFactors.quests.boneVoyage).toBe(true);
  expect(returnedFactors.unlockFactors.quests.dragonSlayerI).toBe(true);
  expect(returnedFactors.unlockFactors.quests.priestInPeril).toBe(false);
  expect(returnedFactors.unlockFactors.quests.regicide).toBe(false);

  expect(returnedFactors.unlockFactors.slayerUnlocks.seeingRed).toBe(true);
  expect(returnedFactors.unlockFactors.slayerUnlocks.likeABoss).toBe(true);
  expect(returnedFactors.unlockFactors.slayerUnlocks.basilocked).toBe(false);
  expect(returnedFactors.unlockFactors.slayerUnlocks.hotStuff).toBe(false);
});
