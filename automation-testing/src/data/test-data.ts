// Constants for test input. No .env, no network: values only.

export type Color = "red" | "blue" | "green" | "yellow" | "purple" | "orange";

export interface Level {
  id: number;
  rows: number;
  cols: number;
  colors: number;
  moves: number;
  /** Score target, when the level has a score goal. */
  scoreTarget?: number;
  /** Collect targets per colour, when the level has a collect goal. */
  collect?: Partial<Record<Color, number>>;
  stars: [number, number, number];
}

// The six levels, copied from ../client/src/levels/levels.ts. Retuning a level (FR-12) is updated here.
export const LEVELS: readonly Level[] = [
  { id: 1, rows: 7, cols: 7, colors: 5, moves: 15, scoreTarget: 2000, stars: [2000, 4000, 7000] },
  { id: 2, rows: 7, cols: 7, colors: 5, moves: 15, scoreTarget: 4000, stars: [4000, 6000, 9000] },
  { id: 3, rows: 7, cols: 7, colors: 5, moves: 18, collect: { red: 12 }, stars: [4000, 7000, 11000] },
  { id: 4, rows: 8, cols: 8, colors: 5, moves: 20, collect: { blue: 12, yellow: 12 }, scoreTarget: 4000, stars: [4000, 6500, 9000] },
  { id: 5, rows: 8, cols: 8, colors: 6, moves: 16, scoreTarget: 6000, stars: [6000, 8000, 11000] },
  { id: 6, rows: 9, cols: 9, colors: 6, moves: 18, collect: { purple: 12 }, scoreTarget: 4000, stars: [5000, 7000, 10000] },
];

export function level(id: number): Level {
  const found = LEVELS.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`no level ${id}`);
  return found;
}

// The one localStorage key the game owns: ../client/src/storage/local.ts STORAGE_KEY (NFR-DATA-04).
export const PROGRESS_KEY = "match3.progress.v1";

export interface Progress {
  version: 1;
  levels: Record<number, { stars: 0 | 1 | 2 | 3; bestScore: number }>;
  unlockedUpTo: number;
}

// Points per cleared piece in a first cascade: ../client/src/engine/scoring.ts POINTS_PER_PIECE. A three-match is 180.
export const POINTS_PER_PIECE = 60;

// The idle hint appears after this long without input: ../client/src/game/useGameSession.ts HINT_AFTER_MS.
export const HINT_AFTER_MS = 5_000;

// The flag-on e2e export (../client/scripts/build-e2e-auth.mjs) signs in against this fake issuer. It is never
// resolved: the issuer fixture answers every request to it (ADR-0012).
export const DUCKER = {
  issuer: "http://ducker.test",
  profilePath: "/profile",
  user: { sub: "u1", name: "Lê Văn Anh Đức", email: "duc@ducker.id" },
  pkceKey: "ducker.pkce",
} as const;
