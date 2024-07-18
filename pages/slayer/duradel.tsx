import { useState, ReactNode, Fragment, SetStateAction, useMemo } from "react";
import { getOr, set, sum } from "lodash/fp";
import { set as setMutate } from "lodash";
import classNames from "classnames";
import { FloatingOverlay } from "@floating-ui/react";
import Link from "next/link";
import Image from "next/image";

import UnlockSettings from "@/components/UnlockSettings";
import Tooltip from "@/components/Tooltip";
import SharePanel from "@/components/SharePanel";

import useSpreadsheetData from "@/utils/useSpreadsheetData";
import useLocalStorageState from "@/utils/useLocalStorageState";
import slayerPointsPerTask from "@/utils/slayerPointsPerTask";
import calculateSlayerUnlocks, {
  UnlockFactors,
  SlayerUnlockSpreadsheetRow,
  calculateUsedQuestsAndUnlocksForMonsters,
} from "@/utils/calculateSlayerUnlocks";
import calculateBlockStats, { BlockFactors } from "@/utils/calculateBlockStats";
import {
  CharacterFactors,
  shortenCharacterFactors,
} from "@/utils/characterFactors";
import useCharacterFactors from "@/utils/useCharacterFactors";
import {
  SlayerTaskPreference,
  SLAYER_TASK_PREFERENCE_LABELS,
} from "@/utils/SlayerTaskPreference";
import { ShareLinkManager } from "@/utils/useShareLink";

type SlayerCalcRow = {
  Monster: string;
  Weight: string;
};

type SlayerCalcMonster = {
  name: string;
  weight: number;
};

function SlayerTaskMonster({
  monster,
  chance,
  blocked,
  setBlocked,
  unlocked,
  preference,
  setPreference,
}: {
  monster: SlayerCalcMonster;
  chance: number | null;
  blocked: boolean;
  setBlocked: (blocked: boolean) => void;
  unlocked: boolean;
  preference: SlayerTaskPreference;
  setPreference: (preference: SlayerTaskPreference) => void;
}) {
  const bgColor =
    unlocked && !blocked ? "bg-slate-200" : "bg-slate-400 text-white";

  return (
    <>
      <div
        className={classNames(
          bgColor,
          (!unlocked || blocked) && "font-bold",
          "pl-4 py-2 text-lg flex items-center",
        )}
      >
        {monster.name}
        {!unlocked && " (not unlocked)"}
        {unlocked && blocked && " (blocked)"}
      </div>
      <div className={classNames(bgColor, "py-2")}>
        <div className="flex justify-center">
          {blocked && (
            <button
              className="bg-slate-50 text-slate-900 px-4 py-1 rounded"
              onClick={() => setBlocked(!blocked)}
            >
              Unblock
            </button>
          )}
          {!blocked && (
            <button
              className={classNames(
                "bg-slate-50 text-slate-900 px-2 py-1 rounded",
              )}
              onClick={() => setBlocked(!blocked)}
            >
              Block
            </button>
          )}
        </div>
      </div>
      <div
        className={classNames(
          bgColor,
          "p-0.5 flex items-center justify-center",
        )}
      >
        <div className="mr-2">
          {SLAYER_TASK_PREFERENCE_LABELS.get(preference)}
        </div>
        <button
          className={"text-sm bg-slate-50 text-slate-900 px-1 rounded"}
          onClick={() =>
            setPreference(
              preference === SlayerTaskPreference.SKIP
                ? SlayerTaskPreference.DO
                : SlayerTaskPreference.SKIP,
            )
          }
        >
          Swap
        </button>
      </div>
      <div className={classNames(bgColor, "flex items-center justify-center")}>
        {chance && (chance * 100).toFixed(1) + "%"}
      </div>
    </>
  );
}

const POINTS_PER_TASK = slayerPointsPerTask(15, 75, 225, 375, 525, 750);
const COST_TO_SKIP = 30;

type SlayerStats = {
  skipChance: number;
  pointsPerTask: number;
  skipPointsPerTask: number;
  averagePointsPerTask: number;
  chanceByMonster: { [monster: string]: number };
};

function calculateSlayerStats(
  monsters: SlayerCalcMonster[],
  state: SlayerCalcUserState,
  unlocks: { [key: string]: boolean },
): SlayerStats {
  const availableMonsters = monsters.filter((monster) => {
    const blocked = getOr(false, monster.name, state.blocked);
    if (!(monster.name in unlocks)) {
      throw new Error(`Missing unlock for monster! "${monster.name}"`);
    }
    const unlocked = unlocks[monster.name];

    return unlocked && !blocked;
  });

  const totalAvailableWeight = sum(
    availableMonsters.map((monster) => monster.weight),
  );

  const totalDoWeight = sum(
    availableMonsters.map((monster) => {
      const willDo =
        getOr(SlayerTaskPreference.SKIP, monster.name, state.preference) ===
        SlayerTaskPreference.DO;
      if (willDo) {
        return monster.weight;
      } else {
        return 0;
      }
    }),
  );

  const chanceByMonster = {};
  for (const monster of availableMonsters) {
    const willDo =
      getOr(SlayerTaskPreference.SKIP, [monster.name], state.preference) ===
      SlayerTaskPreference.DO;

    if (willDo) {
      setMutate(
        chanceByMonster,
        [monster.name],
        monster.weight / totalDoWeight,
      );
    }
  }

  const skipChance =
    (totalAvailableWeight - totalDoWeight) / totalAvailableWeight;
  const pointsPerTask = POINTS_PER_TASK;
  const skipPointsPerTask = (COST_TO_SKIP * skipChance) / (1 - skipChance);
  const averagePointsPerTask = pointsPerTask - skipPointsPerTask;

  return {
    skipChance,
    pointsPerTask,
    skipPointsPerTask,
    averagePointsPerTask,
    chanceByMonster,
  };
}

function ColumnHeader({ children }: { children: ReactNode }) {
  return (
    <div className="font-bold sticky top-0 p-1 bg-white text-center">
      {children}
    </div>
  );
}

type SlayerCalcUserState = {
  blocked: { [monster: string]: boolean };
  preference: {
    [monster: string]: SlayerTaskPreference;
  };
};

const defaultTaskState: SlayerCalcUserState = {
  blocked: {},
  preference: {},
};

const parseShareLink =
  (slayerData: SlayerCalcRow[]) =>
  (shareData: URLSearchParams): SlayerCalcUserState => {
    const calcState = defaultTaskState;

    const blockData = shareData.get("block");
    const doData = shareData.get("dos");

    const blocks =
      blockData === ""
        ? []
        : blockData?.split(",")?.map((val) => parseInt(val)) || [];
    const dos =
      doData === ""
        ? []
        : doData?.split(",")?.map((val) => parseInt(val)) || [];

    for (const block of blocks) {
      calcState.blocked[slayerData[block].Monster] = true;
    }

    for (const doIndex of dos) {
      calcState.preference[slayerData[doIndex].Monster] =
        SlayerTaskPreference.DO;
    }

    return calcState;
  };

function SlayerTaskList({
  slayerData,
  slayerUnlockData,
  error,
  isLoading,
  taskState,
  setTaskState,
  characterFactors,
  setCharacterFactors,
}: {
  slayerData?: SlayerCalcRow[];
  slayerUnlockData?: SlayerUnlockSpreadsheetRow[];
  error: any;
  isLoading: boolean;
  taskState: SlayerCalcUserState;
  setTaskState: (state: SetStateAction<SlayerCalcUserState>) => void;
  characterFactors: CharacterFactors;
  setCharacterFactors: (factors: SetStateAction<CharacterFactors>) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center mt-40">
        <span className="mb-2">Loading task info...</span>
        <Image src="/spinner.gif" alt="" width={64} height={64} />
      </div>
    );
  }

  if (!slayerData || !slayerUnlockData || error) {
    return <div>An error occurred</div>;
  }

  const monsters = slayerData
    .map((row) => ({
      name: row.Monster,
      weight: parseInt(row.Weight),
    }))
    .sort((monsterA, monsterB) => {
      if (monsterA.weight === monsterB.weight) {
        return monsterA.name.localeCompare(monsterB.name);
      }
      return monsterB.weight - monsterA.weight;
    });

  const { totalBlocksAvailable } = calculateBlockStats(
    characterFactors.blockFactors,
  );
  const blocksUsed = monsters.filter((monster) =>
    getOr(false, monster.name, taskState.blocked),
  ).length;

  const unlocks = calculateSlayerUnlocks(
    characterFactors.unlockFactors,
    slayerUnlockData,
  );

  const stats = calculateSlayerStats(monsters, taskState, unlocks);
  const [usedQuests, usedUnlocks] = calculateUsedQuestsAndUnlocksForMonsters(
    monsters.map((m) => m.name),
    slayerUnlockData,
  );

  return (
    <div className="flex lg:flex-row flex-col-reverse m-4 gap-4">
      <div className="lg:flex-[3_3_0%]">
        <div
          className="grid"
          style={{
            gridTemplateColumns:
              "minmax(min-content, 1fr) minmax(max-content, 1fr) minmax(140px, max-content) minmax(100px, max-content)",
          }}
        >
          <ColumnHeader>Monster</ColumnHeader>
          <ColumnHeader>
            {blocksUsed > totalBlocksAvailable && (
              <span className="text-red-500">
                <Tooltip content="You have blocked more monsters than you have available according to settings. Unblock some creatures or adjust your settings.">
                  ⚠️ Blocked ({blocksUsed} / {totalBlocksAvailable})
                </Tooltip>
              </span>
            )}
            {blocksUsed <= totalBlocksAvailable && (
              <span>
                Blocked ({blocksUsed} / {totalBlocksAvailable})
              </span>
            )}
          </ColumnHeader>
          <ColumnHeader>Task Preference</ColumnHeader>
          <ColumnHeader>% Done</ColumnHeader>
          {monsters.map((monster) => (
            <Fragment key={monster.name}>
              <div className="h-2 col-span-5"></div>
              <SlayerTaskMonster
                key={monster.name}
                monster={monster}
                chance={getOr(null, monster.name, stats.chanceByMonster)}
                blocked={getOr(false, monster.name, taskState.blocked)}
                setBlocked={(blocked) =>
                  setTaskState(set(["blocked", monster.name], blocked))
                }
                unlocked={unlocks[monster.name]}
                preference={getOr(
                  SlayerTaskPreference.SKIP,
                  monster.name,
                  taskState.preference,
                )}
                setPreference={(preference) =>
                  setTaskState(set(["preference", monster.name], preference))
                }
              />
            </Fragment>
          ))}
        </div>
      </div>
      <div className="lg:flex-[1_0_0%]">
        <div className="sticky top-0 max-h-[calc(100vh-theme(spacing.16))] flex flex-col">
          <div className=" bg-slate-200 p-2 border-2 border-slate-300">
            <div className="text-center text-lg">
              <strong>Results</strong>
            </div>
            <div className="h-2" />
            <div>
              <strong>Chance of skipping</strong>:{" "}
              {(stats.skipChance * 100).toFixed(1)}%
            </div>
            <div className="h-2" />
            <div>
              <strong>Cost of skipping</strong>:{" "}
              {stats.skipPointsPerTask.toFixed(1)}
            </div>
            <div className="h-2" />
            <div>
              <strong>Average gained points per task</strong>:{" "}
              {stats.averagePointsPerTask.toFixed(1)}
            </div>
          </div>
          <div className="mt-2" />
          <UnlockSettings
            unlockFactors={characterFactors.unlockFactors}
            setUnlockFactors={(unlockFactors: UnlockFactors) =>
              setCharacterFactors(set(["unlockFactors"], unlockFactors))
            }
            usedQuests={usedQuests}
            usedUnlocks={usedUnlocks}
            showMagic={true}
            showStrengthAndAgility={true}
            blockFactors={characterFactors.blockFactors}
            setBlockFactors={(blockFactors: BlockFactors) =>
              setCharacterFactors(set(["blockFactors"], blockFactors))
            }
          />
        </div>
      </div>
    </div>
  );
}

function Instructions() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Instructions</button>
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-200/50 z-10"
          />
          <div className="absolute inset-0 z-20 flex justify-center items-center pointer-events-none">
            <div className="bg-white w-1/2 text-black p-4">
              <h2 className="text-xl">Instructions</h2>
              <br />
              Set up your character&apos;s information in the sidebar.
              <br />
              <br />
              Next, in the &quot;Task Preference&quot; column, choose your
              preferences about which monsters you are willing to do and which
              ones you would want to skip.
              <br />
              <br />
              Then, pick the monsters you want to block. Monsters are ordered
              from most to least frequent, so choose based on which ones you are
              already going to skip.
              <br />
              <br />
              The results will show you how often you will have to skip tasks,
              the average cost of skipping, and the average number of points you
              will gain per task (taking into account task streaks).
            </div>
          </div>
          <FloatingOverlay lockScroll />
        </>
      )}
    </>
  );
}

function DuradelSlayerCalculator() {
  const {
    data: slayerData,
    error: error1,
    isLoading: isLoading1,
  } = useSpreadsheetData<SlayerCalcRow>("943606230");
  const {
    data: slayerUnlockData,
    error: error2,
    isLoading: isLoading2,
  } = useSpreadsheetData<SlayerUnlockSpreadsheetRow>("1527618709");

  const parseShareLinkWithData = useMemo(
    () => slayerData && parseShareLink(slayerData),
    [slayerData],
  );

  const [taskState, setTaskState, saveTaskState] =
    useLocalStorageState<SlayerCalcUserState>(
      "DURADEL_CALC_STATE",
      defaultTaskState,
      parseShareLinkWithData,
    );
  const [characterFactors, setCharacterFactors, saveCharacterFactors] =
    useCharacterFactors();

  function generateShareLinkData(): Map<string, string> | null {
    if (!slayerData) {
      return null;
    }

    const urlMap = shortenCharacterFactors(characterFactors);

    const monsterOrder = slayerData.map((row) => row.Monster);
    const blocks = Object.entries(taskState.blocked)
      .filter(([monster, blocked]) => !!blocked)
      .map(([monster, blocked]) => monsterOrder.indexOf(monster));

    const dos = Object.entries(taskState.preference)
      .filter(([monster, preference]) => preference === SlayerTaskPreference.DO)
      .map(([monster, preference]) => monsterOrder.indexOf(monster));

    urlMap.set("block", blocks.join(","));
    urlMap.set("dos", dos.join(","));

    return urlMap;
  }

  return (
    <div>
      <div className="flex px-2 h-12 bg-slate-500 text-white items-stretch">
        <Link href="/" className="flex flex-row items-center">
          <div>
            <div className="inline-block rotate-180">⮕</div> Home
          </div>
        </Link>
        <h1 className="flex-1 flex flex-row items-center justify-center text-xl font-bold">
          Duradel Slayer Calculator
        </h1>
        <SharePanel
          generateShareLinkData={generateShareLinkData}
          saveStates={() => {
            saveTaskState();
            saveCharacterFactors();
          }}
        />
        <Instructions />
      </div>
      <SlayerTaskList
        slayerData={slayerData}
        slayerUnlockData={slayerUnlockData}
        error={error1 || error2}
        isLoading={isLoading1 || isLoading2}
        taskState={taskState}
        setTaskState={setTaskState}
        characterFactors={characterFactors}
        setCharacterFactors={setCharacterFactors}
      />
    </div>
  );
}

export default function DuradelSlayerCalculatorWithShareData() {
  return (
    <ShareLinkManager>
      <DuradelSlayerCalculator />
    </ShareLinkManager>
  );
}
