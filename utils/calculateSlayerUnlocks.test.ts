import { set } from "lodash/fp";
import { test, expect } from "@jest/globals";

import calculateSlayerUnlocks, {
  UnlockFactors,
  SlayerUnlockSpreadsheetRow,
  SlayerUnlockSpreadsheetRowCols,
} from "./calculateSlayerUnlocks";

const emptyUnlockFactors: UnlockFactors = {
  ignoreCombatLevel: false,
  combatLevel: 3,
  slayerLevel: 1,
  magicLevel: 1,
  strengthLevel: 1,
  agilityLevel: 1,
  quests: {
    barbarianTraining: false,
    boneVoyage: false,
    desertTreasureI: false,
    dragonSlayerI: false,
    dragonSlayerII: false,
    elementalWorkshopI: false,
    horrorFromTheDeep: false,
    lostCity: false,
    mourningsEndPartII: false,
    olafsQuest: false,
    perilousMoons: false,
    priestInPeril: false,
    lunarDiplomacy: false,
    deathPlateau: false,
    cabinFever: false,
    regicide: false,
  },
  slayerUnlocks: {
    seeingRed: false,
    iHopeYouMithMe: false,
    watchTheBirdie: false,
    reptileGotRipped: false,
    likeABoss: false,
    stopTheWyvern: false,
    basilocked: false,
    actualVampyreSlayer: false,
    warpedReality: false,
    hotStuff: false,
  },
};

function generateUnlockFactors(properties: [string[], any][]): UnlockFactors {
  let result = emptyUnlockFactors;

  for (const [key, value] of properties) {
    result = set(key, value, result);
  }

  return result;
}

const emptySpreadsheetRow: SlayerUnlockSpreadsheetRow = {
  Monster: "",
  "Slayer level": "0",
  "Combat level": "0",
  "Magic level": "0",
  "Strength/Agility level": "0",
  "q:Dragon Slayer II": "",
  "q:Lost City": "",
  "q:Barbarian Training": "",
  "q:Perilous Moons": "",
  "q:Bone Voyage": "",
  "q:Elemental Workshop I": "",
  "q:Desert Treasure I": "",
  "q:Mourning's End Part II": "",
  "q:Horror from the Deep": "",
  "q:Olaf's Quest": "",
  "q:Priest in Peril": "",
  "q:Dragon Slayer I": "",
  "q:Lunar Diplomacy": "",
  "q:Death Plateau": "",
  "q:Cabin Fever": "",
  "q:Regicide": "",
  "ul:Seeing red": "",
  "ul:Warped Reality": "",
  "ul:Actual Vampyre Slayer": "",
  "ul:I hope you mith me": "",
  "ul:Stop the Wyvern": "",
  "ul:Reptile got ripped": "",
  "ul:Watch the birdie": "",
  "ul:Basilocked": "",
  "ul:Like a Boss": "",
  "ul:Hot stuff": "",
};

function generateSpreadsheetRows(monsters: {
  [monster: string]: { [row in SlayerUnlockSpreadsheetRowCols]+?: string };
}): SlayerUnlockSpreadsheetRow[] {
  return Object.entries(monsters).map(([monster, rows]) => {
    return {
      ...emptySpreadsheetRow,
      Monster: monster,
      ...rows,
    };
  });
}

test("calculates unlocks from quests", () => {
  const unlocks = calculateSlayerUnlocks(
    generateUnlockFactors([
      [["quests", "barbarianTraining"], true],
      [["quests", "lostCity"], true],
    ]),
    generateSpreadsheetRows({
      Waterfiends: {
        "q:Barbarian Training": "x",
      },
      "Mutated zygomites": {
        "q:Lost City": "x",
      },
      "Blue dragons": {
        "q:Dragon Slayer I": "x",
      },
    }),
  );

  expect(unlocks["Waterfiends"]).toBe(true);
  expect(unlocks["Mutated zygomites"]).toBe(true);
  expect(unlocks["Blue dragons"]).toBe(false);
});

test("calculates unlocks from slayer unlocks", () => {
  const unlocks = calculateSlayerUnlocks(
    generateUnlockFactors([
      [["slayerUnlocks", "reptileGotRipped"], true],
      [["slayerUnlocks", "stopTheWyvern"], true],
    ]),
    generateSpreadsheetRows({
      Lizardmen: {
        "ul:Reptile got ripped": "x",
      },
      "Fossil Island Wyverns": {
        "ul:Stop the Wyvern": "!",
      },
      Basilisks: {
        "ul:Basilocked": "x",
      },
    }),
  );

  expect(unlocks["Lizardmen"]).toBe(true);
  expect(unlocks["Fossil Island Wyverns"]).toBe(false);
  expect(unlocks["Basilisks"]).toBe(false);
});

test("calculates unlocks from levels", () => {
  const unlockRows = generateSpreadsheetRows({
    Ankou: {
      "Combat level": "40",
    },
    "Black demons": {
      "Combat level": "80",
    },
    "Lesser Nagua": {
      "Slayer level": "48",
    },
    Wyrms: {
      "Slayer level": "62",
    },
    "Cave Kraken": {
      "Magic level": "50",
    },
    Waterfiends: {
      // Not real
      "Magic level": "90",
    },
    "Spiritual creatures": {
      "Strength/Agility level": "60",
    },
    Aviansies: {
      // Not real
      "Strength/Agility level": "80",
    },
  });

  const unlocks = calculateSlayerUnlocks(
    generateUnlockFactors([
      [["combatLevel"], 60],
      [["slayerLevel"], 55],
      [["magicLevel"], 60],
      [["strengthLevel"], 70],
      [["agilityLevel"], 1],
    ]),
    unlockRows,
  );

  expect(unlocks["Ankou"]).toBe(true);
  expect(unlocks["Black demons"]).toBe(false);
  expect(unlocks["Lesser Nagua"]).toBe(true);
  expect(unlocks["Wyrms"]).toBe(false);
  expect(unlocks["Cave Kraken"]).toBe(true);
  expect(unlocks["Waterfiends"]).toBe(false);
  expect(unlocks["Spiritual creatures"]).toBe(true);
  expect(unlocks["Aviansies"]).toBe(false);

  const agilityUnlocks = calculateSlayerUnlocks(
    generateUnlockFactors([
      [["combatLevel"], 60],
      [["slayerLevel"], 55],
      [["magicLevel"], 60],
      [["strengthLevel"], 1],
      [["agilityLevel"], 70],
    ]),
    unlockRows,
  );

  expect(agilityUnlocks["Spiritual creatures"]).toBe(true);
  expect(agilityUnlocks["Aviansies"]).toBe(false);
});

test("handles ignoring combat level", () => {
  const unlocks = calculateSlayerUnlocks(
    generateUnlockFactors([
      [["ignoreCombatLevel"], true],
      [["combatLevel"], 50],
    ]),
    generateSpreadsheetRows({
      Ankou: {
        "Combat level": "40",
      },
      "Black demons": {
        "Combat level": "80",
      },
    }),
  );

  expect(unlocks["Ankou"]).toBe(true);
  expect(unlocks["Black demons"]).toBe(true);
});
