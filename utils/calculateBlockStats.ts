export type BlockFactors = {
  questPoints: number;
  lumbridgeEliteComplete: boolean;
};

export const shorthandBlockFactorKeys: [keyof BlockFactors, string][] = [
  ["questPoints", "qp"],
  ["lumbridgeEliteComplete", "le"],
];

export const defaultBlockFactors: BlockFactors = {
  questPoints: 308,
  lumbridgeEliteComplete: true,
};

type BlockStats = {
  totalBlocksAvailable: number;
};

export default function calculateBlockStats(factors: BlockFactors): BlockStats {
  return {
    totalBlocksAvailable:
      Math.floor(factors.questPoints / 50) +
      (factors.lumbridgeEliteComplete ? 1 : 0),
  };
}
