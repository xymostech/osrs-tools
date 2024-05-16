import { useState, Fragment, ReactNode } from "react";
import { set } from "lodash/fp";
import classNames from "classnames";

import NumberInput from "./NumberInput";
import Checkbox from "./Checkbox";
import Tooltip from "./Tooltip";

import {
  UnlockFactors,
  questUnlockLabels,
  slayerUnlockLabels,
} from "../utils/calculateSlayerUnlocks";
import { BlockFactors } from "../utils/calculateBlockStats";

export default function UnlockSettings({
  unlockFactors,
  setUnlockFactors,
  usedQuests,
  usedUnlocks,
  showMagic,
  showStrengthAndAgility,
  blockFactors,
  setBlockFactors,
  extraSettings,
}: {
  unlockFactors: UnlockFactors;
  setUnlockFactors: (unlockFactors: UnlockFactors) => void;
  usedQuests: Set<string>;
  usedUnlocks: Set<string>;
  showMagic: boolean;
  showStrengthAndAgility: boolean;
  blockFactors: BlockFactors;
  setBlockFactors: (blockFactors: BlockFactors) => void;
  extraSettings?: ReactNode;
}) {
  const [expandedQuests, setExpandedQuests] = useState(false);
  const [expandedUnlocks, setExpandedUnlocks] = useState(false);

  function alternatingColors(i: number) {
    return classNames({
      "bg-slate-200": i % 2 === 0,
      "bg-white": i % 2 === 1,
    });
  }

  const totalQuests = usedQuests.size;
  const completedQuests = Array.from(questUnlockLabels.keys())
    .filter((key) => unlockFactors.quests[key])
    .filter((key) => usedQuests.has(key)).length;

  const totalSlayerUnlocks = usedUnlocks.size;
  const unlockedSlayerUnlocks = Array.from(slayerUnlockLabels.keys())
    .filter((key) => unlockFactors.slayerUnlocks[key])
    .filter((key) => usedUnlocks.has(key)).length;

  return (
    <div className="bg-slate-200 overflow-y-hidden flex flex-col border-2 border-slate-300">
      <div className="text-center text-lg">
        <strong>Character Info</strong>
      </div>
      <div className="overflow-y-auto">
        <div className="grid grid-cols-3 items-center text-lg p-2 gap-y-1">
          <div className="col-span-2">Slayer level</div>
          <NumberInput
            value={unlockFactors.slayerLevel}
            onChange={(slayerLevel) =>
              setUnlockFactors(set(["slayerLevel"], slayerLevel, unlockFactors))
            }
          />
          <div className="col-span-2">
            Ignore combat level
            <Tooltip
              content={`By default, slayer masters will take into account your combat level when assigning tasks. This can be disabled by talking to a slayer master and saying "Let's talk about the difficulty of my assignments."`}
            >
              &nbsp;ℹ️
            </Tooltip>
          </div>
          <div className={"flex items-center justify-center"}>
            <Checkbox
              checked={unlockFactors.ignoreCombatLevel}
              onChange={(ignoreCombatLevel) =>
                setUnlockFactors(
                  set(["ignoreCombatLevel"], ignoreCombatLevel, unlockFactors),
                )
              }
            />
          </div>
          {!unlockFactors.ignoreCombatLevel && (
            <>
              <div className="col-span-2">Combat level</div>
              <NumberInput
                value={unlockFactors.combatLevel}
                onChange={(combatLevel) =>
                  setUnlockFactors(
                    set(["combatLevel"], combatLevel, unlockFactors),
                  )
                }
              />
            </>
          )}
          {showMagic && (
            <>
              <div className="col-span-2">Magic level</div>
              <NumberInput
                value={unlockFactors.magicLevel}
                onChange={(magicLevel) =>
                  setUnlockFactors(
                    set(["magicLevel"], magicLevel, unlockFactors),
                  )
                }
              />
            </>
          )}
          {showStrengthAndAgility && (
            <>
              <div className="col-span-2">Strength level</div>
              <NumberInput
                value={unlockFactors.strengthLevel}
                onChange={(strengthLevel) =>
                  setUnlockFactors(
                    set(["strengthLevel"], strengthLevel, unlockFactors),
                  )
                }
              />
              <div className="col-span-2">Agility level</div>
              <NumberInput
                value={unlockFactors.agilityLevel}
                onChange={(agilityLevel) =>
                  setUnlockFactors(
                    set(["agilityLevel"], agilityLevel, unlockFactors),
                  )
                }
              />
            </>
          )}
          <div className="col-span-2">Quest Points</div>
          <NumberInput
            value={blockFactors.questPoints}
            onChange={(magicLevel) =>
              setBlockFactors(set(["questPoints"], magicLevel, blockFactors))
            }
          />
          <div className="col-span-2">Lumbridge Elite Diary Complete</div>
          <div className={"flex items-center justify-center"}>
            <Checkbox
              checked={blockFactors.lumbridgeEliteComplete}
              onChange={(lumbridgeEliteComplete) =>
                setBlockFactors(
                  set(
                    ["lumbridgeEliteComplete"],
                    lumbridgeEliteComplete,
                    blockFactors,
                  ),
                )
              }
            />
          </div>
          {extraSettings}
        </div>
        <div>
          <button
            className="text-lg text-center w-full"
            onClick={() => setExpandedQuests(!expandedQuests)}
          >
            Completed Quests ({completedQuests} / {totalQuests}){" "}
            {expandedQuests ? "▲" : "▼"}
          </button>
          {expandedQuests && (
            <div className="grid grid-cols-4">
              {Array.from(questUnlockLabels.entries())
                .filter(([key, _]) => usedQuests.has(key))
                .map(([key, [label, extra]], i) => {
                  return (
                    <Fragment key={key}>
                      <div
                        className={classNames(
                          "col-span-3 p-1",
                          alternatingColors(i),
                        )}
                      >
                        {label}
                        {extra !== null && (
                          <Tooltip content={extra}>&nbsp;ℹ️</Tooltip>
                        )}
                      </div>
                      <div
                        className={classNames(
                          alternatingColors(i),
                          "flex items-center justify-center",
                        )}
                      >
                        <Checkbox
                          checked={unlockFactors.quests[key]}
                          onChange={(checked) =>
                            setUnlockFactors(
                              set(["quests", key], checked, unlockFactors),
                            )
                          }
                        />
                      </div>
                    </Fragment>
                  );
                })}
            </div>
          )}
        </div>
        <div>
          <button
            className="text-lg text-center w-full"
            onClick={() => setExpandedUnlocks(!expandedUnlocks)}
          >
            Slayer Unlocks ({unlockedSlayerUnlocks} / {totalSlayerUnlocks}){" "}
            {expandedUnlocks ? "▲" : "▼"}
          </button>
          {expandedUnlocks && (
            <div className="grid grid-cols-4">
              {Array.from(slayerUnlockLabels.entries())
                .filter(([key, _]) => usedUnlocks.has(key))
                .map(([key, label], i) => {
                  return (
                    <Fragment key={key}>
                      <div
                        className={classNames(
                          "col-span-3 p-1",
                          alternatingColors(i),
                        )}
                      >
                        {label}
                      </div>
                      <div
                        className={classNames(
                          alternatingColors(i),
                          "flex items-center justify-center",
                        )}
                      >
                        <Checkbox
                          checked={unlockFactors.slayerUnlocks[key]}
                          onChange={(checked) =>
                            setUnlockFactors(
                              set(
                                ["slayerUnlocks", key],
                                checked,
                                unlockFactors,
                              ),
                            )
                          }
                        />
                      </div>
                    </Fragment>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
