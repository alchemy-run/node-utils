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

describe('.matchKeys()', () => {
  describe('error handling', () => {
    test('should throw when the first argument is not an object', () => {
      expect_throws(() => mm.matchKeys(), /Expected the first argument to be an object/);
      expect_throws(() => mm.matchKeys('foo'), /Expected the first argument to be an object/);
      expect_throws(() => mm.matchKeys(['foo']), /Expected the first argument to be an object/);
    });
  });

  describe('match object keys', () => {
    test('should return a new object with only keys that match the given glob pattern', () => {
      expect_deepEqual(mm.matchKeys({ a: 'a', b: 'b', c: 'c' }, '*'), { a: 'a', b: 'b', c: 'c' });
      expect_deepEqual(mm.matchKeys({ a: 'a', b: 'b', c: 'c' }, 'a'), { a: 'a' });
      expect_deepEqual(mm.matchKeys({ a: 'a', b: 'b', c: 'c' }, '[a-b]'), { a: 'a', b: 'b' });
      expect_deepEqual(mm.matchKeys({ a: 'a', b: 'b', c: 'c' }, '(a|c)'), { a: 'a', c: 'c' });
      expect_notDeepEqual(mm.matchKeys({ a: 'a', b: 'b', c: 'c' }, 'a'), { b: 'b' });
    });
  });
});
