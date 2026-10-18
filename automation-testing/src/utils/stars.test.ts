import { expect, test } from "@playwright/test";
import { gapToNextStar, starsFor } from "./stars";

const T = [2000, 4000, 7000];

test("a star per threshold reached, boundaries included", () => {
  expect(starsFor(1999, T)).toBe(0);
  expect(starsFor(2000, T)).toBe(1);
  expect(starsFor(4200, T)).toBe(2);
  expect(starsFor(7000, T)).toBe(3);
});

test("the gap is to the next threshold, none at three stars", () => {
  expect(gapToNextStar(0, T)).toBe(2000);
  expect(gapToNextStar(4200, T)).toBe(2800);
  expect(gapToNextStar(7000, T)).toBeNull();
});
