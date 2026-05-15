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


const { braces } = micromatch;

if (!process.env.ORIGINAL_PATH_SEP) {
  process.env.ORIGINAL_PATH_SEP = path.sep
}

describe('.braces()', () => {test('should throw an error when arguments are invalid', () => {
    expect_throws(() => braces());
  });

  test('should create a regex source string from a brace pattern', () => {
    expect_deepEqual(braces('{a,b}'), ['(a|b)']);
  });

  test('should expand a brace pattern', () => {
    expect_deepEqual(braces('{a,b}', {expand: true}), ['a', 'b']);
  });
});
