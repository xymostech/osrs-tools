import { test, expect } from "@jest/globals";

import calculateBlockStats from "./calculateBlockStats";

test("calculates available block slots", () => {
  expect(
    calculateBlockStats({
      questPoints: 40,
      lumbridgeEliteComplete: false,
    }).totalBlocksAvailable,
  ).toBe(0);

  expect(
    calculateBlockStats({
      questPoints: 50,
      lumbridgeEliteComplete: false,
    }).totalBlocksAvailable,
  ).toBe(1);

  expect(
    calculateBlockStats({
      questPoints: 300,
      lumbridgeEliteComplete: false,
    }).totalBlocksAvailable,
  ).toBe(6);

  expect(
    calculateBlockStats({
      questPoints: 120,
      lumbridgeEliteComplete: true,
    }).totalBlocksAvailable,
  ).toBe(3);

  expect(
    calculateBlockStats({
      questPoints: 313,
      lumbridgeEliteComplete: true,
    }).totalBlocksAvailable,
  ).toBe(7);
});
