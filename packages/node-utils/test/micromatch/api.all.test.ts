import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import path from "node:path";
import micromatch from "../../src/micromatch/index.ts";

const before = beforeAll;
const after = afterAll;

const expect_truthy = (v: unknown) => { expect(Boolean(v)).toBe(true); };
const expect_equal = (actual: unknown, expected: unknown) => {
  expect(actual).toBe(expected as any);
};
const expect_loose_equal = (actual: unknown, expected: unknown) => {
  // Mirrors assert.equal (== loose equality)
  expect(actual == expected).toBe(true);
};
const expect_deepEqual = (actual: unknown, expected: unknown) => {
  expect(actual).toEqual(expected as any);
};
const expect_notDeepEqual = (actual: unknown, expected: unknown) => {
  expect(actual).not.toEqual(expected as any);
};
const expect_notEqual = (actual: unknown, expected: unknown) => {
  expect(actual == expected).toBe(false);
};
const expect_throws = (fn: () => unknown, matcher?: any) => {
  if (matcher) expect(fn).toThrow(matcher);
  else expect(fn).toThrow();
};
const expect_doesNotThrow = (fn: () => unknown) => {
  expect(fn).not.toThrow();
};


process.env.PICOMATCH_NO_CACHE = 'true';

import path from "node:path";
const { all } = micromatch;

if (!process.env.ORIGINAL_PATH_SEP) {
  process.env.ORIGINAL_PATH_SEP = path.sep;
}

describe('.all()', () => {test('should throw an error when value is not a string', () => {
    expect_throws(() => all());
  });

  test('should return true when all patterns match the given string', () => {
    expect_truthy(all('z', ['z', '*', '[a-z]']));
    expect_truthy(all('b', 'b'));
    expect_truthy(all('b', '*'));
  });

  test('should return false when some patterns do not match', () => {
    expect_truthy(!all('a', ['a', 'b', '*']));
    expect_truthy(!all('a', ['a*', 'z*']));
  });

  test('should arrayify a string pattern', () => {
    expect_truthy(all('a', '*'));
  });
});
