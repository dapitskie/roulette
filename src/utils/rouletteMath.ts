import type { RouletteEntry, WinnerItem } from '../types/roulette';

/**
 * Normalizes any angle to [0, 360)
 */
export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/**
 * Calculates number of full 360-degree rotations based on spin duration (seconds)
 * Duration: 2s -> ~4 spins, 7s -> ~8 spins, 15s -> ~14 spins
 */
export function getRotationsForDuration(durationSeconds: number): number {
  return Math.max(4, Math.round(3 + durationSeconds * 0.75));
}

/**
 * Given N entries and a target index, computes the rotation angle (in degrees)
 * required so that the target segment is positioned directly under the top pointer (12 o'clock).
 * 
 * Segment 0 starts at 12 o'clock and extends clockwise.
 * Center of segment i is at: i * sliceAngle + sliceAngle / 2
 * When the wheel rotates clockwise by R degrees, the angle originally at (360 - (R % 360)) is at 12 o'clock.
 * 
 * To land target segment at 12 o'clock:
 * requiredModulo = 360 - (targetIndex * sliceAngle + sliceAngle / 2)
 */
export function calculateRotationToTarget(
  entriesCount: number,
  targetIndex: number,
  currentTotalRotation: number,
  durationSeconds: number,
  naturalJitter: boolean = true
): { targetAngle: number; finalRotation: number } {
  if (entriesCount <= 0) {
    return { targetAngle: 0, finalRotation: currentTotalRotation };
  }

  const sliceAngle = 360 / entriesCount;
  
  // Center of the target segment measured clockwise from 12 o'clock
  const segmentCenter = targetIndex * sliceAngle + sliceAngle / 2;

  // Add a slight natural jitter so it doesn't land with machine-like micro-perfection every time,
  // but stays safely within 35% of the slice center.
  let jitter = 0;
  if (naturalJitter && entriesCount > 1) {
    const maxJitter = (sliceAngle * 0.35);
    jitter = (Math.random() * 2 - 1) * maxJitter;
  }

  const landingPointOnWheel = segmentCenter + jitter;
  const targetModulo = normalizeAngle(360 - landingPointOnWheel);

  const currentModulo = normalizeAngle(currentTotalRotation);
  let forwardDelta = normalizeAngle(targetModulo - currentModulo);

  // Ensure there's a significant minimum turn for physics feel
  if (forwardDelta < 45) {
    forwardDelta += 360;
  }

  const fullSpins = getRotationsForDuration(durationSeconds);
  const finalRotation = currentTotalRotation + (fullSpins * 360) + forwardDelta;

  return {
    targetAngle: targetModulo,
    finalRotation,
  };
}

/**
 * Picks a random index and calculates target rotation
 */
export function calculateRandomRotation(
  entries: RouletteEntry[],
  currentTotalRotation: number,
  durationSeconds: number
): { winnerIndex: number; finalRotation: number } {
  if (entries.length === 0) {
    return { winnerIndex: -1, finalRotation: currentTotalRotation };
  }

  // If weights are present, perform weighted random, else uniform random
  const hasWeights = entries.some(e => (e.weight ?? 1) !== 1);
  let chosenIndex = 0;

  if (hasWeights) {
    const totalWeight = entries.reduce((acc, e) => acc + Math.max(1, e.weight ?? 1), 0);
    let rand = Math.random() * totalWeight;
    for (let i = 0; i < entries.length; i++) {
      const w = Math.max(1, entries[i].weight ?? 1);
      if (rand < w) {
        chosenIndex = i;
        break;
      }
      rand -= w;
    }
  } else {
    chosenIndex = Math.floor(Math.random() * entries.length);
  }

  const { finalRotation } = calculateRotationToTarget(
    entries.length,
    chosenIndex,
    currentTotalRotation,
    durationSeconds,
    true
  );

  return {
    winnerIndex: chosenIndex,
    finalRotation,
  };
}

/**
 * Returns the index of the segment currently directly under the top pointer (12 o'clock)
 */
export function getEntryIndexAtRotation(totalRotation: number, entriesCount: number): number {
  if (entriesCount <= 0) return -1;
  const sliceAngle = 360 / entriesCount;
  const wheelAngleAtPointer = normalizeAngle(360 - normalizeAngle(totalRotation));
  const index = Math.floor(wheelAngleAtPointer / sliceAngle) % entriesCount;
  return index;
}

/**
 * Given a primary winner (the segment landing under the top pointer),
 * picks the remaining (winnerCount - 1) distinct winners randomly from the other entries.
 */
export function calculateMultiWinners(
  entries: RouletteEntry[],
  winnerCount: number,
  primaryWinnerIndex: number
): WinnerItem[] {
  if (entries.length === 0 || primaryWinnerIndex < 0 || primaryWinnerIndex >= entries.length) {
    return [];
  }

  const primary = entries[primaryWinnerIndex];
  const winners: WinnerItem[] = [
    { id: primary.id, name: primary.label, rank: 1 },
  ];

  const totalDesired = Math.min(winnerCount, entries.length);
  if (totalDesired <= 1) {
    return winners;
  }

  // Filter out the primary winner to sample remaining candidates
  const remaining = entries.filter((_, idx) => idx !== primaryWinnerIndex);

  // Shuffle the remaining list
  const pool = [...remaining];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // Pick up to (totalDesired - 1)
  const additional = pool.slice(0, totalDesired - 1);
  additional.forEach((item, idx) => {
    winners.push({
      id: item.id,
      name: item.label,
      rank: idx + 2,
    });
  });

  return winners;
}

