import { fromPairs } from "lodash";

const questUnlockValues = [
  "barbarianTraining",
  "boneVoyage",
  "desertTreasureI",
  "dragonSlayerI",
  "dragonSlayerII",
  "elementalWorkshopI",
  "horrorFromTheDeep",
  "lostCity",
  "mourningsEndPartII",
  "olafsQuest",
  "perilousMoons",
  "priestInPeril",
] as const;

type QuestUnlocks = (typeof questUnlockValues)[number];
type QuestUnlockFactors = { [Property in QuestUnlocks]: boolean };

export const questUnlockLabels = new Map<QuestUnlocks, [string, string | null]>(
  [
    ["elementalWorkshopI", ["Elemental Workshop I", null]],
    ["olafsQuest", ["Olaf's Quest", null]],
    [
      "mourningsEndPartII",
      [
        "Partial completion of Mourning's End Part II",
        "After receiving the key from Essyllt",
      ],
    ],
    [
      "desertTreasureI",
      [
        "Partial completion of Desert Treasure I",
        "After constructing the mirrors",
      ],
    ],
    [
      "barbarianTraining",
      [
        "Partial completion of Barbarian Training",
        "After learning to light fires with a bow and gaining access to the Ancient Cavern",
      ],
    ],
    ["boneVoyage", ["Bone Voyage", null]],
    [
      "dragonSlayerI",
      ["Starting Dragon Slayer I", "Immediately after starting"],
    ],
    ["dragonSlayerII", ["Dragon Slayer II", null]],
    ["horrorFromTheDeep", ["Horror from the Deep", null]],
    ["lostCity", ["Lost City", null]],
    ["perilousMoons", ["Perilous Moons", null]],
    ["priestInPeril", ["Priest in Peril", null]],
  ],
);

for (const val of questUnlockValues) {
  if (!questUnlockLabels.has(val)) {
    throw new Error(`Missing label for quest unlock! "${val}"`);
  }
}

const slayerUnlockValues = [
  "seeingRed",
  "iHopeYouMithMe",
  "watchTheBirdie",
  "reptileGotRipped",
  "likeABoss",
  "stopTheWyvern",
  "basilocked",
  "actualVampyreSlayer",
  "warpedReality",
] as const;

type SlayerUnlocks = (typeof slayerUnlockValues)[number];
type SlayerUnlockFactors = { [Property in SlayerUnlocks]: boolean };

export const slayerUnlockLabels = new Map<SlayerUnlocks, string>([
  ["seeingRed", "Seeing Red (Red dragons)"],
  ["iHopeYouMithMe", "I Hope You Mith Me (Mithril dragons)"],
  ["watchTheBirdie", "Watch the Birdie (Aviansies)"],
  ["reptileGotRipped", "Reptile Got Ripped (Lizardmen)"],
  ["likeABoss", "Like a Boss (Boss monsters)"],
  ["stopTheWyvern", "Stop the Wyvern (Blocks Fossil Island Wyverns)"],
  ["basilocked", "Basilocked (Basilisks)"],
  ["actualVampyreSlayer", "Actual Vampyre Slayer (Vampyres)"],
  ["warpedReality", "Warped Reality (Warped creatures)"],
]);

for (const val of slayerUnlockValues) {
  if (!slayerUnlockLabels.has(val)) {
    throw new Error(`Missing label for slayer unlock! "${val}"`);
  }
}

export type UnlockFactors = {
  ignoreCombatLevel: boolean;
  combatLevel: number;
  slayerLevel: number;
  magicLevel: number;
  quests: QuestUnlockFactors;
  slayerUnlocks: SlayerUnlockFactors;
};

type SlayerUnlockSpreadsheetRowCols =
  | "Monster"
  | "Slayer level"
  | "Combat level"
  | "Magic level"
  | "q:Dragon Slayer II"
  | "q:Lost City"
  | "q:Barbarian Training"
  | "q:Perilous Moons"
  | "q:Bone Voyage"
  | "q:Elemental Workshop I"
  | "q:Desert Treasure I"
  | "q:Mourning's End Part II"
  | "q:Horror from the Deep"
  | "q:Olaf's Quest"
  | "q:Priest in Peril"
  | "q:Dragon Slayer I"
  | "ul:Seeing red"
  | "ul:Warped Reality"
  | "ul:Actual Vampyre Slayer"
  | "ul:I hope you mith me"
  | "ul:Stop the Wyvern"
  | "ul:Reptile got ripped"
  | "ul:Watch the birdie"
  | "ul:Basilocked"
  | "ul:Like a Boss";

export type SlayerUnlockSpreadsheetRow = {
  [Property in SlayerUnlockSpreadsheetRowCols]: string;
};

export const defaultUnlockFactors = {
  ignoreCombatLevel: true,
  combatLevel: 126,
  slayerLevel: 99,
  magicLevel: 99,
  quests: {
    barbarianTraining: true,
    boneVoyage: true,
    desertTreasureI: true,
    dragonSlayerI: true,
    dragonSlayerII: true,
    elementalWorkshopI: true,
    horrorFromTheDeep: true,
    lostCity: true,
    mourningsEndPartII: true,
    olafsQuest: true,
    perilousMoons: true,
    priestInPeril: true,
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
  },
};

const questToColName: [QuestUnlocks, SlayerUnlockSpreadsheetRowCols][] = [
  ["elementalWorkshopI", "q:Elemental Workshop I"],
  ["olafsQuest", "q:Olaf's Quest"],
  ["mourningsEndPartII", "q:Mourning's End Part II"],
  ["desertTreasureI", "q:Desert Treasure I"],
  ["dragonSlayerII", "q:Dragon Slayer II"],
  ["boneVoyage", "q:Bone Voyage"],
  ["dragonSlayerI", "q:Dragon Slayer I"],
  ["horrorFromTheDeep", "q:Horror from the Deep"],
  ["lostCity", "q:Lost City"],
  ["priestInPeril", "q:Priest in Peril"],
  ["barbarianTraining", "q:Barbarian Training"],
  ["perilousMoons", "q:Perilous Moons"],
];

const slayerUnlockToColName: [SlayerUnlocks, SlayerUnlockSpreadsheetRowCols][] =
  [
    ["seeingRed", "ul:Seeing red"],
    ["iHopeYouMithMe", "ul:I hope you mith me"],
    ["watchTheBirdie", "ul:Watch the birdie"],
    ["reptileGotRipped", "ul:Reptile got ripped"],
    ["stopTheWyvern", "ul:Stop the Wyvern"],
    ["basilocked", "ul:Basilocked"],
    ["actualVampyreSlayer", "ul:Actual Vampyre Slayer"],
    ["warpedReality", "ul:Warped Reality"],
    ["likeABoss", "ul:Like a Boss"],
  ];

function calculateUnlockFromFactors(
  row: SlayerUnlockSpreadsheetRow,
  factors: UnlockFactors,
) {
  if (
    !factors.ignoreCombatLevel &&
    factors.combatLevel < parseInt(row["Combat level"])
  ) {
    return false;
  }
  if (factors.slayerLevel < parseInt(row["Slayer level"])) {
    return false;
  }
  if (factors.magicLevel < parseInt(row["Magic level"])) {
    return false;
  }
  for (const [questKey, colName] of questToColName) {
    if (!factors.quests[questKey] && row[colName] === "x") {
      return false;
    }
  }

  for (const [slayerUnlockKey, colName] of slayerUnlockToColName) {
    if (!factors.slayerUnlocks[slayerUnlockKey] && row[colName] === "x") {
      return false;
    }
    if (factors.slayerUnlocks[slayerUnlockKey] && row[colName] === "!") {
      return false;
    }
  }

  return true;
}

export default function calculateSlayerUnlocks(
  factors: UnlockFactors,
  slayerUnlockData: SlayerUnlockSpreadsheetRow[],
): { [name: string]: boolean } {
  return fromPairs(
    slayerUnlockData.map((row: SlayerUnlockSpreadsheetRow) => {
      return [row["Monster"], calculateUnlockFromFactors(row, factors)];
    }),
  );
}
