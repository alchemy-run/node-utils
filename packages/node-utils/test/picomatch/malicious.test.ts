// @ts-nocheck — mechanically ported from upstream JS tests; bun runs them as-is.
import { describe, expect, test } from "bun:test";
import picomatch from "../../src/picomatch/index.ts";

const match = (list: string | string[], pattern: string, options: any = {}): string[] => {
  const isMatch = picomatch(pattern, options, true);
  const matches: Set<string> = options.matches || new Set();
  for (const item of ([] as string[]).concat(list)) {
    const m = (isMatch as any)(item, true);
    if (m && m.output && m.isMatch === true) matches.add(m.output);
  }
  return [...matches];
};

const expect_truthy = (v: unknown, _msg?: unknown) => {
  expect(Boolean(v)).toBe(true);
};
const expect_equal = (actual: unknown, expected: unknown, _msg?: unknown) => {
  expect(actual).toBe(expected as any);
};
const expect_deepEqual = (actual: unknown, expected: unknown, _msg?: unknown) => {
  expect(actual).toEqual(expected as any);
};
const expect_throws = (fn: () => unknown, matcher?: any, _msg?: unknown) => {
  if (matcher) expect(fn).toThrow(matcher);
  else expect(fn).toThrow();
};
const expect_doesNotThrow = (fn: () => unknown, _msg?: unknown) => {
  expect(fn).not.toThrow();
};


const { isMatch, makeRe } = picomatch;
const repeat = n => '\\'.repeat(n);

/**
 * These tests are based on minimatch unit tests
 */

describe('handling of potential regex exploits', () => {
  test('should support long escape sequences', () => {
    if (process.platform !== 'win32') {
      expect_truthy(isMatch('\\A', `${repeat(65500)}A`), 'within the limits, and valid match');
    }
    expect_truthy(isMatch('A', `!${repeat(65500)}A`), 'within the limits, and valid match');
    expect_truthy(isMatch('A', `!(${repeat(65500)}A)`), 'within the limits, and valid match');
    expect_truthy(!isMatch('A', `[!(${repeat(65500)}A`), 'within the limits, but invalid regex');
  });

  test('should throw an error when the pattern is too long', () => {
    expect_throws(() => isMatch('foo', '*'.repeat(65537)), /exceeds maximum allowed/);
    expect_throws(() => {
      expect_truthy(!isMatch('A', `!(${repeat(65536)}A)`));
    }, /Input length: 65540, exceeds maximum allowed length: 65536/);
  });

  test('should allow max bytes to be customized', () => {
    expect_throws(() => {
      expect_truthy(!isMatch('A', `!(${repeat(500)}A)`, { maxLength: 499 }));
    }, /Input length: 504, exceeds maximum allowed length: 499/);
  });

  test('should be able to accept Object instance properties', () => {
    expect_truthy(isMatch('constructor', 'constructor'), 'valid match');
    expect_truthy(isMatch('__proto__', '__proto__'), 'valid match');
    expect_truthy(isMatch('toString', 'toString'), 'valid match');
  });

  test('should not expose internal prototype properties', () => {
    expect_equal(makeRe('[[:constructor:]]').toString(), '/^(?:[[:constructor:]\\])$/');
    expect_truthy(!isMatch('f }]', '[[:constructor:]]'), 'not valid match');
    expect_truthy(!isMatch('a }]', '[[:constructor:]]'),  'not valid match');
  });
});
