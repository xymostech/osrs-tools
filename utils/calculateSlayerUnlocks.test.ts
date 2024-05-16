import { set } from "lodash/fp";

const assert = {
  equals: (a: any, b: any) => {
    if (a !== b) {
      throw new Error(`"${a}" !== "${b}"`);
    }
  },
};

import calculateSlayerUnlocks, {
  UnlockFactors,
  SlayerUnlockSpreadsheetRow,
} from "./calculateSlayerUnlocks";

function it(name: string, test: () => void) {
  try {
    test();
    console.log(name, "passed");
  } catch (e) {
    console.log(name, "failed");
    console.log(e);
  }
}

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

it("calculates unlocks from quests", () => {
  const questUnlockFactors = set(
    ["quests", "barbarianTraining"],
    true,
    set(["quests", "lostCity"], true, emptyUnlockFactors),
  );

  const unlocks = calculateSlayerUnlocks(questUnlockFactors, [
    {
      ...emptySpreadsheetRow,
      Monster: "Waterfiends",
      "q:Barbarian Training": "x",
    },
    {
      ...emptySpreadsheetRow,
      Monster: "Mutated zygomites",
      "q:Lost City": "x",
    },
    {
      ...emptySpreadsheetRow,
      Monster: "Blue dragons",
      "q:Dragon Slayer I": "x",
    },
  ]);

  assert.equals(unlocks["Waterfiends"], true);
  assert.equals(unlocks["Mutated zygomites"], true);
  assert.equals(unlocks["Blue dragons"], true);
});

it("calculates unlocks from slayer unlocks", () => {
  const unlockFactors = set(
    ["slayerUnlocks", "reptileGotRipped"],
    true,
    set(["slayerUnlocks", "stopTheWyvern"], true, emptyUnlockFactors),
  );

  const unlocks = calculateSlayerUnlocks(unlockFactors, [
    {
      ...emptySpreadsheetRow,
      Monster: "Lizardmen",
    },
    {
      ...emptySpreadsheetRow,
    },
    {
      ...emptySpreadsheetRow,
    },
  ]);
});
