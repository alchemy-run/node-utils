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

describe('slash handling - windows', () => {
  test('should match absolute windows paths with regex from makeRe', () => {
    const regex = makeRe('**/path/**', { windows: true });
    expect_truthy(regex.test('C:\\Users\\user\\Projects\\project\\path\\image.jpg', { windows: true }));
  });

  test('should match windows path separators with a string literal', () => {
    expect_truthy(!isMatch('a\\a', '(a/b)', { windows: true }));
    expect_truthy(isMatch('a\\b', '(a/b)', { windows: true }));
    expect_truthy(!isMatch('a\\c', '(a/b)', { windows: true }));
    expect_truthy(!isMatch('b\\a', '(a/b)', { windows: true }));
    expect_truthy(!isMatch('b\\b', '(a/b)', { windows: true }));
    expect_truthy(!isMatch('b\\c', '(a/b)', { windows: true }));

    expect_truthy(!isMatch('a\\a', 'a/b', { windows: true }));
    expect_truthy(isMatch('a\\b', 'a/b', { windows: true }));
    expect_truthy(!isMatch('a\\c', 'a/b', { windows: true }));
    expect_truthy(!isMatch('b\\a', 'a/b', { windows: true }));
    expect_truthy(!isMatch('b\\b', 'a/b', { windows: true }));
    expect_truthy(!isMatch('b\\c', 'a/b', { windows: true }));
  });

  test('should not match literal backslashes with literal forward slashes when windows is disabled', () => {
    expect_truthy(!isMatch('a\\a', 'a\\b', { windows: false }));
    expect_truthy(isMatch('a\\b', 'a\\b', { windows: false }));
    expect_truthy(!isMatch('a\\c', 'a\\b', { windows: false }));
    expect_truthy(!isMatch('b\\a', 'a\\b', { windows: false }));
    expect_truthy(!isMatch('b\\b', 'a\\b', { windows: false }));
    expect_truthy(!isMatch('b\\c', 'a\\b', { windows: false }));

    expect_truthy(!isMatch('a\\a', 'a/b', { windows: false }));
    expect_truthy(!isMatch('a\\b', 'a/b', { windows: false }));
    expect_truthy(!isMatch('a\\c', 'a/b', { windows: false }));
    expect_truthy(!isMatch('b\\a', 'a/b', { windows: false }));
    expect_truthy(!isMatch('b\\b', 'a/b', { windows: false }));
    expect_truthy(!isMatch('b\\c', 'a/b', { windows: false }));
  });

  test('should match an array of literal strings', () => {
    expect_truthy(!isMatch('a\\a', '(a/b)', { windows: true }));
    expect_truthy(isMatch('a\\b', '(a/b)', { windows: true }));
    expect_truthy(!isMatch('a\\c', '(a/b)', { windows: true }));
    expect_truthy(!isMatch('b\\a', '(a/b)', { windows: true }));
    expect_truthy(!isMatch('b\\b', '(a/b)', { windows: true }));
    expect_truthy(!isMatch('b\\c', '(a/b)', { windows: true }));
  });

  test('should not match backslashes with forward slashes when windows is disabled', () => {
    expect_truthy(!isMatch('a\\a', 'a/(a|c)', { windows: false }));
    expect_truthy(!isMatch('a\\b', 'a/(a|c)', { windows: false }));
    expect_truthy(!isMatch('a\\c', 'a/(a|c)', { windows: false }));
    expect_truthy(!isMatch('a\\a', 'a/(a|b|c)', { windows: false }));
    expect_truthy(!isMatch('a\\b', 'a/(a|b|c)', { windows: false }));
    expect_truthy(!isMatch('a\\c', 'a/(a|b|c)', { windows: false }));
    expect_truthy(!isMatch('a\\a', '(a\\b)', { windows: false }));
    expect_truthy(isMatch('a\\b', '(a\\\\b)', { windows: false }));
    expect_truthy(!isMatch('a\\c', '(a\\b)', { windows: false }));
    expect_truthy(!isMatch('b\\a', '(a\\b)', { windows: false }));
    expect_truthy(!isMatch('b\\b', '(a\\b)', { windows: false }));
    expect_truthy(!isMatch('b\\c', '(a\\b)', { windows: false }));
    expect_truthy(!isMatch('a\\a', '(a/b)', { windows: false }));
    expect_truthy(!isMatch('a\\b', '(a/b)', { windows: false }));
    expect_truthy(!isMatch('a\\c', '(a/b)', { windows: false }));
    expect_truthy(!isMatch('b\\a', '(a/b)', { windows: false }));
    expect_truthy(!isMatch('b\\b', '(a/b)', { windows: false }));
    expect_truthy(!isMatch('b\\c', '(a/b)', { windows: false }));

    expect_truthy(!isMatch('a\\a', 'a/c', { windows: false }));
    expect_truthy(!isMatch('a\\b', 'a/c', { windows: false }));
    expect_truthy(!isMatch('a\\c', 'a/c', { windows: false }));
    expect_truthy(!isMatch('b\\a', 'a/c', { windows: false }));
    expect_truthy(!isMatch('b\\b', 'a/c', { windows: false }));
    expect_truthy(!isMatch('b\\c', 'a/c', { windows: false }));
  });

  test('should match backslashes when followed by regex logical "or"', () => {
    expect_truthy(isMatch('a\\a', 'a/(a|c)', { windows: true }));
    expect_truthy(!isMatch('a\\b', 'a/(a|c)', { windows: true }));
    expect_truthy(isMatch('a\\c', 'a/(a|c)', { windows: true }));

    expect_truthy(isMatch('a\\a', 'a/(a|b|c)', { windows: true }));
    expect_truthy(isMatch('a\\b', 'a/(a|b|c)', { windows: true }));
    expect_truthy(isMatch('a\\c', 'a/(a|b|c)', { windows: true }));
  });

  test('should support matching backslashes with regex ranges', () => {
    expect_truthy(!isMatch('a\\a', 'a/[b-c]', { windows: true }));
    expect_truthy(isMatch('a\\b', 'a/[b-c]', { windows: true }));
    expect_truthy(isMatch('a\\c', 'a/[b-c]', { windows: true }));
    expect_truthy(!isMatch('a\\x\\y', 'a/[b-c]', { windows: true }));
    expect_truthy(!isMatch('a\\x', 'a/[b-c]', { windows: true }));

    expect_truthy(isMatch('a\\a', 'a/[a-z]', { windows: true }));
    expect_truthy(isMatch('a\\b', 'a/[a-z]', { windows: true }));
    expect_truthy(isMatch('a\\c', 'a/[a-z]', { windows: true }));
    expect_truthy(!isMatch('a\\x\\y', 'a/[a-z]', { windows: true }));
    expect_truthy(isMatch('a\\x\\y', 'a/[a-z]/y', { windows: true }));
    expect_truthy(isMatch('a\\x', 'a/[a-z]', { windows: true }));

    expect_truthy(!isMatch('a\\a', 'a/[b-c]', { windows: false }));
    expect_truthy(!isMatch('a\\b', 'a/[b-c]', { windows: false }));
    expect_truthy(!isMatch('a\\c', 'a/[b-c]', { windows: false }));
    expect_truthy(!isMatch('a\\x\\y', 'a/[b-c]', { windows: false }));
    expect_truthy(!isMatch('a\\x', 'a/[b-c]', { windows: false }));

    expect_truthy(!isMatch('a\\a', 'a/[a-z]', { windows: false }));
    expect_truthy(!isMatch('a\\b', 'a/[a-z]', { windows: false }));
    expect_truthy(!isMatch('a\\c', 'a/[a-z]', { windows: false }));
    expect_truthy(!isMatch('a\\x\\y', 'a/[a-z]', { windows: false }));
    expect_truthy(!isMatch('a\\x', 'a/[a-z]', { windows: false }));
  });

  test('should not match slashes with single stars', () => {
    expect_truthy(isMatch('a', '*', { windows: true }));
    expect_truthy(isMatch('b', '*', { windows: true }));
    expect_truthy(!isMatch('a\\a', '*', { windows: true }));
    expect_truthy(!isMatch('a\\b', '*', { windows: true }));
    expect_truthy(!isMatch('a\\c', '*', { windows: true }));
    expect_truthy(!isMatch('a\\x', '*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a', '*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\b', '*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a\\a', '*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a\\a\\a', '*', { windows: true }));
    expect_truthy(!isMatch('x\\y', '*', { windows: true }));
    expect_truthy(!isMatch('z\\z', '*', { windows: true }));

    expect_truthy(!isMatch('a', '*/*', { windows: true }));
    expect_truthy(!isMatch('b', '*/*', { windows: true }));
    expect_truthy(isMatch('a\\a', '*/*', { windows: true }));
    expect_truthy(isMatch('a\\b', '*/*', { windows: true }));
    expect_truthy(isMatch('a\\c', '*/*', { windows: true }));
    expect_truthy(isMatch('a\\x', '*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a', '*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\b', '*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a\\a', '*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a\\a\\a', '*/*', { windows: true }));
    expect_truthy(isMatch('x\\y', '*/*', { windows: true }));
    expect_truthy(isMatch('z\\z', '*/*', { windows: true }));

    expect_truthy(!isMatch('a', '*/*/*', { windows: true }));
    expect_truthy(!isMatch('b', '*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a', '*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\b', '*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\c', '*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\x', '*/*/*', { windows: true }));
    expect_truthy(isMatch('a\\a\\a', '*/*/*', { windows: true }));
    expect_truthy(isMatch('a\\a\\b', '*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a\\a', '*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a\\a\\a', '*/*/*', { windows: true }));
    expect_truthy(!isMatch('x\\y', '*/*/*', { windows: true }));
    expect_truthy(!isMatch('z\\z', '*/*/*', { windows: true }));

    expect_truthy(!isMatch('a', '*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('b', '*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a', '*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\b', '*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\c', '*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\x', '*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a', '*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\b', '*/*/*/*', { windows: true }));
    expect_truthy(isMatch('a\\a\\a\\a', '*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a\\a\\a', '*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('x\\y', '*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('z\\z', '*/*/*/*', { windows: true }));

    expect_truthy(!isMatch('a', '*/*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('b', '*/*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a', '*/*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\b', '*/*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\c', '*/*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\x', '*/*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a', '*/*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\b', '*/*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a\\a', '*/*/*/*/*', { windows: true }));
    expect_truthy(isMatch('a\\a\\a\\a\\a', '*/*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('x\\y', '*/*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('z\\z', '*/*/*/*/*', { windows: true }));

    expect_truthy(!isMatch('a', 'a/*', { windows: true }));
    expect_truthy(!isMatch('b', 'a/*', { windows: true }));
    expect_truthy(isMatch('a\\a', 'a/*', { windows: true }));
    expect_truthy(isMatch('a\\b', 'a/*', { windows: true }));
    expect_truthy(isMatch('a\\c', 'a/*', { windows: true }));
    expect_truthy(isMatch('a\\x', 'a/*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a', 'a/*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\b', 'a/*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a\\a', 'a/*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a\\a\\a', 'a/*', { windows: true }));
    expect_truthy(!isMatch('x\\y', 'a/*', { windows: true }));
    expect_truthy(!isMatch('z\\z', 'a/*', { windows: true }));

    expect_truthy(!isMatch('a', 'a/*/*', { windows: true }));
    expect_truthy(!isMatch('b', 'a/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a', 'a/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\b', 'a/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\c', 'a/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\x', 'a/*/*', { windows: true }));
    expect_truthy(isMatch('a\\a\\a', 'a/*/*', { windows: true }));
    expect_truthy(isMatch('a\\a\\b', 'a/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a\\a', 'a/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a\\a\\a', 'a/*/*', { windows: true }));
    expect_truthy(!isMatch('x\\y', 'a/*/*', { windows: true }));
    expect_truthy(!isMatch('z\\z', 'a/*/*', { windows: true }));

    expect_truthy(!isMatch('a', 'a/*/*/*', { windows: true }));
    expect_truthy(!isMatch('b', 'a/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a', 'a/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\b', 'a/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\c', 'a/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\x', 'a/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a', 'a/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\b', 'a/*/*/*', { windows: true }));
    expect_truthy(isMatch('a\\a\\a\\a', 'a/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a\\a\\a', 'a/*/*/*', { windows: true }));
    expect_truthy(!isMatch('x\\y', 'a/*/*/*', { windows: true }));
    expect_truthy(!isMatch('z\\z', 'a/*/*/*', { windows: true }));

    expect_truthy(!isMatch('a', 'a/*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('b', 'a/*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a', 'a/*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\b', 'a/*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\c', 'a/*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\x', 'a/*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a', 'a/*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\b', 'a/*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a\\a', 'a/*/*/*/*', { windows: true }));
    expect_truthy(isMatch('a\\a\\a\\a\\a', 'a/*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('x\\y', 'a/*/*/*/*', { windows: true }));
    expect_truthy(!isMatch('z\\z', 'a/*/*/*/*', { windows: true }));

    expect_truthy(!isMatch('a', 'a/*/a', { windows: true }));
    expect_truthy(!isMatch('b', 'a/*/a', { windows: true }));
    expect_truthy(!isMatch('a\\a', 'a/*/a', { windows: true }));
    expect_truthy(!isMatch('a\\b', 'a/*/a', { windows: true }));
    expect_truthy(!isMatch('a\\c', 'a/*/a', { windows: true }));
    expect_truthy(!isMatch('a\\x', 'a/*/a', { windows: true }));
    expect_truthy(isMatch('a\\a\\a', 'a/*/a', { windows: true }));
    expect_truthy(!isMatch('a\\a\\b', 'a/*/a', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a\\a', 'a/*/a', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a\\a\\a', 'a/*/a', { windows: true }));
    expect_truthy(!isMatch('x\\y', 'a/*/a', { windows: true }));
    expect_truthy(!isMatch('z\\z', 'a/*/a', { windows: true }));

    expect_truthy(!isMatch('a', 'a/*/b', { windows: true }));
    expect_truthy(!isMatch('b', 'a/*/b', { windows: true }));
    expect_truthy(!isMatch('a\\a', 'a/*/b', { windows: true }));
    expect_truthy(!isMatch('a\\b', 'a/*/b', { windows: true }));
    expect_truthy(!isMatch('a\\c', 'a/*/b', { windows: true }));
    expect_truthy(!isMatch('a\\x', 'a/*/b', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a', 'a/*/b', { windows: true }));
    expect_truthy(isMatch('a\\a\\b', 'a/*/b', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a\\a', 'a/*/b', { windows: true }));
    expect_truthy(!isMatch('a\\a\\a\\a\\a', 'a/*/b', { windows: true }));
    expect_truthy(!isMatch('x\\y', 'a/*/b', { windows: true }));
    expect_truthy(!isMatch('z\\z', 'a/*/b', { windows: true }));

    expect_truthy(!isMatch('a', '*/*', { windows: false }));
    expect_truthy(!isMatch('b', '*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a', '*/*', { windows: false }));
    expect_truthy(!isMatch('a\\b', '*/*', { windows: false }));
    expect_truthy(!isMatch('a\\c', '*/*', { windows: false }));
    expect_truthy(!isMatch('a\\x', '*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a', '*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\b', '*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a\\a', '*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a\\a\\a', '*/*', { windows: false }));
    expect_truthy(!isMatch('x\\y', '*/*', { windows: false }));
    expect_truthy(!isMatch('z\\z', '*/*', { windows: false }));

    expect_truthy(!isMatch('a', '*/*/*', { windows: false }));
    expect_truthy(!isMatch('b', '*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a', '*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\b', '*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\c', '*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\x', '*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a', '*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\b', '*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a\\a', '*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a\\a\\a', '*/*/*', { windows: false }));
    expect_truthy(!isMatch('x\\y', '*/*/*', { windows: false }));
    expect_truthy(!isMatch('z\\z', '*/*/*', { windows: false }));

    expect_truthy(!isMatch('a', '*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('b', '*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a', '*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\b', '*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\c', '*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\x', '*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a', '*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\b', '*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a\\a', '*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a\\a\\a', '*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('x\\y', '*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('z\\z', '*/*/*/*', { windows: false }));

    expect_truthy(!isMatch('a', '*/*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('b', '*/*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a', '*/*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\b', '*/*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\c', '*/*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\x', '*/*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a', '*/*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\b', '*/*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a\\a', '*/*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a\\a\\a', '*/*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('x\\y', '*/*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('z\\z', '*/*/*/*/*', { windows: false }));

    expect_truthy(!isMatch('a', 'a/*', { windows: false }));
    expect_truthy(!isMatch('b', 'a/*', { windows: false }));
    expect_truthy(!isMatch('a\\a', 'a/*', { windows: false }));
    expect_truthy(!isMatch('a\\b', 'a/*', { windows: false }));
    expect_truthy(!isMatch('a\\c', 'a/*', { windows: false }));
    expect_truthy(!isMatch('a\\x', 'a/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a', 'a/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\b', 'a/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a\\a', 'a/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a\\a\\a', 'a/*', { windows: false }));
    expect_truthy(!isMatch('x\\y', 'a/*', { windows: false }));
    expect_truthy(!isMatch('z\\z', 'a/*', { windows: false }));

    expect_truthy(!isMatch('a', 'a/*/*', { windows: false }));
    expect_truthy(!isMatch('b', 'a/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a', 'a/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\b', 'a/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\c', 'a/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\x', 'a/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a', 'a/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\b', 'a/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a\\a', 'a/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a\\a\\a', 'a/*/*', { windows: false }));
    expect_truthy(!isMatch('x\\y', 'a/*/*', { windows: false }));
    expect_truthy(!isMatch('z\\z', 'a/*/*', { windows: false }));

    expect_truthy(!isMatch('a', 'a/*/*/*', { windows: false }));
    expect_truthy(!isMatch('b', 'a/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a', 'a/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\b', 'a/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\c', 'a/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\x', 'a/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a', 'a/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\b', 'a/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a\\a', 'a/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a\\a\\a', 'a/*/*/*', { windows: false }));
    expect_truthy(!isMatch('x\\y', 'a/*/*/*', { windows: false }));
    expect_truthy(!isMatch('z\\z', 'a/*/*/*', { windows: false }));

    expect_truthy(!isMatch('a', 'a/*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('b', 'a/*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a', 'a/*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\b', 'a/*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\c', 'a/*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\x', 'a/*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a', 'a/*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\b', 'a/*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a\\a', 'a/*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a\\a\\a', 'a/*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('x\\y', 'a/*/*/*/*', { windows: false }));
    expect_truthy(!isMatch('z\\z', 'a/*/*/*/*', { windows: false }));

    expect_truthy(!isMatch('a', 'a/*/a', { windows: false }));
    expect_truthy(!isMatch('b', 'a/*/a', { windows: false }));
    expect_truthy(!isMatch('a\\a', 'a/*/a', { windows: false }));
    expect_truthy(!isMatch('a\\b', 'a/*/a', { windows: false }));
    expect_truthy(!isMatch('a\\c', 'a/*/a', { windows: false }));
    expect_truthy(!isMatch('a\\x', 'a/*/a', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a', 'a/*/a', { windows: false }));
    expect_truthy(!isMatch('a\\a\\b', 'a/*/a', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a\\a', 'a/*/a', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a\\a\\a', 'a/*/a', { windows: false }));
    expect_truthy(!isMatch('x\\y', 'a/*/a', { windows: false }));
    expect_truthy(!isMatch('z\\z', 'a/*/a', { windows: false }));

    expect_truthy(!isMatch('a', 'a/*/b', { windows: false }));
    expect_truthy(!isMatch('b', 'a/*/b', { windows: false }));
    expect_truthy(!isMatch('a\\a', 'a/*/b', { windows: false }));
    expect_truthy(!isMatch('a\\b', 'a/*/b', { windows: false }));
    expect_truthy(!isMatch('a\\c', 'a/*/b', { windows: false }));
    expect_truthy(!isMatch('a\\x', 'a/*/b', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a', 'a/*/b', { windows: false }));
    expect_truthy(!isMatch('a\\a\\b', 'a/*/b', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a\\a', 'a/*/b', { windows: false }));
    expect_truthy(!isMatch('a\\a\\a\\a\\a', 'a/*/b', { windows: false }));
    expect_truthy(!isMatch('x\\y', 'a/*/b', { windows: false }));
    expect_truthy(!isMatch('z\\z', 'a/*/b', { windows: false }));
  });

  test('should support globstars (**)', () => {
    expect_truthy(isMatch('a\\a', 'a/**', { windows: true }));
    expect_truthy(isMatch('a\\b', 'a/**', { windows: true }));
    expect_truthy(isMatch('a\\c', 'a/**', { windows: true }));
    expect_truthy(isMatch('a\\x', 'a/**', { windows: true }));
    expect_truthy(isMatch('a\\x\\y', 'a/**', { windows: true }));
    expect_truthy(isMatch('a\\x\\y\\z', 'a/**', { windows: true }));

    expect_truthy(isMatch('a\\a', 'a/**/*', { windows: true }));
    expect_truthy(isMatch('a\\b', 'a/**/*', { windows: true }));
    expect_truthy(isMatch('a\\c', 'a/**/*', { windows: true }));
    expect_truthy(isMatch('a\\x', 'a/**/*', { windows: true }));
    expect_truthy(isMatch('a\\x\\y', 'a/**/*', { windows: true }));
    expect_truthy(isMatch('a\\x\\y\\z', 'a/**/*', { windows: true }));

    expect_truthy(isMatch('a\\a', 'a/**/**/*', { windows: true }));
    expect_truthy(isMatch('a\\b', 'a/**/**/*', { windows: true }));
    expect_truthy(isMatch('a\\c', 'a/**/**/*', { windows: true }));
    expect_truthy(isMatch('a\\x', 'a/**/**/*', { windows: true }));
    expect_truthy(isMatch('a\\x\\y', 'a/**/**/*', { windows: true }));
    expect_truthy(isMatch('a\\x\\y\\z', 'a/**/**/*', { windows: true }));
  });

  test('should not match backslashes with globstars when disabled', () => {
    expect_truthy(!isMatch('a\\a', 'a/**', { windows: false }));
    expect_truthy(!isMatch('a\\b', 'a/**', { windows: false }));
    expect_truthy(!isMatch('a\\c', 'a/**', { windows: false }));
    expect_truthy(!isMatch('a\\x', 'a/**', { windows: false }));
    expect_truthy(!isMatch('a\\x\\y', 'a/**', { windows: false }));
    expect_truthy(!isMatch('a\\x\\y\\z', 'a/**', { windows: false }));

    expect_truthy(!isMatch('a\\a', 'a/**/*', { windows: false }));
    expect_truthy(!isMatch('a\\b', 'a/**/*', { windows: false }));
    expect_truthy(!isMatch('a\\c', 'a/**/*', { windows: false }));
    expect_truthy(!isMatch('a\\x', 'a/**/*', { windows: false }));
    expect_truthy(!isMatch('a\\x\\y', 'a/**/*', { windows: false }));
    expect_truthy(!isMatch('a\\x\\y\\z', 'a/**/*', { windows: false }));

    expect_truthy(!isMatch('a\\a', 'a/**/**/*', { windows: false }));
    expect_truthy(!isMatch('a\\b', 'a/**/**/*', { windows: false }));
    expect_truthy(!isMatch('a\\c', 'a/**/**/*', { windows: false }));
    expect_truthy(!isMatch('a\\x', 'a/**/**/*', { windows: false }));
    expect_truthy(!isMatch('a\\x\\y', 'a/**/**/*', { windows: false }));
    expect_truthy(!isMatch('a\\x\\y\\z', 'a/**/**/*', { windows: false }));
  });

  test('should work with file extensions', () => {
    expect_truthy(isMatch('a.txt', 'a*.txt', { windows: true }));
    expect_truthy(!isMatch('a\\b.txt', 'a*.txt', { windows: true }));
    expect_truthy(!isMatch('a\\x\\y.txt', 'a*.txt', { windows: true }));
    expect_truthy(!isMatch('a\\x\\y\\z', 'a*.txt', { windows: true }));

    expect_truthy(isMatch('a.txt', 'a.txt', { windows: true }));
    expect_truthy(!isMatch('a\\b.txt', 'a.txt', { windows: true }));
    expect_truthy(!isMatch('a\\x\\y.txt', 'a.txt', { windows: true }));
    expect_truthy(!isMatch('a\\x\\y\\z', 'a.txt', { windows: true }));

    expect_truthy(!isMatch('a.txt', 'a/**/*.txt', { windows: true }));
    expect_truthy(isMatch('a\\b.txt', 'a/**/*.txt', { windows: true }));
    expect_truthy(isMatch('a\\x\\y.txt', 'a/**/*.txt', { windows: true }));
    expect_truthy(!isMatch('a\\x\\y\\z', 'a/**/*.txt', { windows: true }));

    expect_truthy(!isMatch('a.txt', 'a/**/*.txt', { windows: false }));
    expect_truthy(!isMatch('a\\b.txt', 'a/**/*.txt', { windows: false }));
    expect_truthy(!isMatch('a\\x\\y.txt', 'a/**/*.txt', { windows: false }));
    expect_truthy(!isMatch('a\\x\\y\\z', 'a/**/*.txt', { windows: false }));

    expect_truthy(!isMatch('a.txt', 'a/*.txt', { windows: true }));
    expect_truthy(isMatch('a\\b.txt', 'a/*.txt', { windows: true }));
    expect_truthy(!isMatch('a\\x\\y.txt', 'a/*.txt', { windows: true }));
    expect_truthy(!isMatch('a\\x\\y\\z', 'a/*.txt', { windows: true }));

    expect_truthy(!isMatch('a.txt', 'a/*.txt', { windows: false }));
    expect_truthy(!isMatch('a\\b.txt', 'a/*.txt', { windows: false }));
    expect_truthy(!isMatch('a\\x\\y.txt', 'a/*.txt', { windows: false }));
    expect_truthy(!isMatch('a\\x\\y\\z', 'a/*.txt', { windows: false }));

    expect_truthy(!isMatch('a.txt', 'a/*/*.txt', { windows: true }));
    expect_truthy(!isMatch('a\\b.txt', 'a/*/*.txt', { windows: true }));
    expect_truthy(isMatch('a\\x\\y.txt', 'a/*/*.txt', { windows: true }));
    expect_truthy(!isMatch('a\\x\\y\\z', 'a/*/*.txt', { windows: true }));

    expect_truthy(!isMatch('a.txt', 'a/*/*.txt', { windows: false }));
    expect_truthy(!isMatch('a\\b.txt', 'a/*/*.txt', { windows: false }));
    expect_truthy(!isMatch('a\\x\\y.txt', 'a/*/*.txt', { windows: false }));
    expect_truthy(!isMatch('a\\x\\y\\z', 'a/*/*.txt', { windows: false }));
  });

  test('should support negation patterns', () => {
    expect_truthy(isMatch('a', '!a/b', { windows: true }));
    expect_truthy(isMatch('a\\a', '!a/b', { windows: true }));
    expect_truthy(!isMatch('a\\b', '!a/b', { windows: true }));
    expect_truthy(isMatch('a\\c', '!a/b', { windows: true }));
    expect_truthy(isMatch('b\\a', '!a/b', { windows: true }));
    expect_truthy(isMatch('b\\b', '!a/b', { windows: true }));
    expect_truthy(isMatch('b\\c', '!a/b', { windows: true }));

    expect_truthy(isMatch('a', '!*/c', { windows: true }));
    expect_truthy(isMatch('a\\a', '!*/c', { windows: true }));
    expect_truthy(isMatch('a\\b', '!*/c', { windows: true }));
    expect_truthy(!isMatch('a\\c', '!*/c', { windows: true }));
    expect_truthy(isMatch('b\\a', '!*/c', { windows: true }));
    expect_truthy(isMatch('b\\b', '!*/c', { windows: true }));
    expect_truthy(!isMatch('b\\c', '!*/c', { windows: true }));

    expect_truthy(isMatch('a', '!a/b', { windows: true }));
    expect_truthy(isMatch('a\\a', '!a/b', { windows: true }));
    expect_truthy(!isMatch('a\\b', '!a/b', { windows: true }));
    expect_truthy(isMatch('a\\c', '!a/b', { windows: true }));
    expect_truthy(isMatch('b\\a', '!a/b', { windows: true }));
    expect_truthy(isMatch('b\\b', '!a/b', { windows: true }));
    expect_truthy(isMatch('b\\c', '!a/b', { windows: true }));

    expect_truthy(isMatch('a', '!*/c', { windows: true }));
    expect_truthy(isMatch('a\\a', '!*/c', { windows: true }));
    expect_truthy(isMatch('a\\b', '!*/c', { windows: true }));
    expect_truthy(!isMatch('a\\c', '!*/c', { windows: true }));
    expect_truthy(isMatch('b\\a', '!*/c', { windows: true }));
    expect_truthy(isMatch('b\\b', '!*/c', { windows: true }));
    expect_truthy(!isMatch('b\\c', '!*/c', { windows: true }));

    expect_truthy(isMatch('a', '!a/(b)', { windows: true }));
    expect_truthy(isMatch('a\\a', '!a/(b)', { windows: true }));
    expect_truthy(!isMatch('a\\b', '!a/(b)', { windows: true }));
    expect_truthy(isMatch('a\\c', '!a/(b)', { windows: true }));
    expect_truthy(isMatch('b\\a', '!a/(b)', { windows: true }));
    expect_truthy(isMatch('b\\b', '!a/(b)', { windows: true }));
    expect_truthy(isMatch('b\\c', '!a/(b)', { windows: true }));

    expect_truthy(isMatch('a', '!(a/b)', { windows: true }));
    expect_truthy(isMatch('a\\a', '!(a/b)', { windows: true }));
    expect_truthy(!isMatch('a\\b', '!(a/b)', { windows: true }));
    expect_truthy(isMatch('a\\c', '!(a/b)', { windows: true }));
    expect_truthy(isMatch('b\\a', '!(a/b)', { windows: true }));
    expect_truthy(isMatch('b\\b', '!(a/b)', { windows: true }));
    expect_truthy(isMatch('b\\c', '!(a/b)', { windows: true }));
  });
});
