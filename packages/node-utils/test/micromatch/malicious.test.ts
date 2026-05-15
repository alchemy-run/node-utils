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


const mm = micromatch;
const generate = n => '\\'.repeat(n);

/**
 * These tests are based on minimatch unit tests
 */

describe('handling of potential regex exploits', () => {

  test('should support long escape sequences', () => {
    expect_truthy(mm.isMatch('A', `!(${generate(65500)}A)`), 'within the limits, and valid match');
    expect_truthy(!mm.isMatch('A', `[!(${generate(65500)}A`), 'within the limits, but invalid regex');
  });

  test('should throw an error when the pattern is too long', () => {
    expect_throws(() => {
      expect_truthy(!mm.isMatch('A', `!(${generate(65536)}A)`));
    }, /Input length: 65540, exceeds maximum allowed length: 65536/);
  });

  test('should allow max bytes to be customized', () => {
    expect_throws(() => {
      expect_truthy(!mm.isMatch('A', `!(${generate(500)}A)`, { maxLength: 499 }));
    }, /Input length: 504, exceeds maximum allowed length: 499/);
  });
});
