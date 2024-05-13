export default function slayerPointsPerTask(
  perTask: number,
  per10thTask: number,
  per50thTask: number,
  per100thTask: number,
  per250thTask: number,
  per1000thTask: number,
) {
  return (
    (per1000thTask * 1 +
      per250thTask * 3 +
      per100thTask * 8 +
      per50thTask * 8 +
      per10thTask * 80 +
      perTask * 900) /
    1000
  );
}
