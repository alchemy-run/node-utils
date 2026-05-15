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


const { isMatch } = picomatch;

describe('brackets', () => {
  describe('trailing stars', () => {
    test('should support stars following brackets', () => {
      expect_truthy(isMatch('a', '[a]*'));
      expect_truthy(isMatch('aa', '[a]*'));
      expect_truthy(isMatch('aaa', '[a]*'));
      expect_truthy(isMatch('az', '[a-z]*'));
      expect_truthy(isMatch('zzz', '[a-z]*'));
    });

    test('should match slashes defined in brackets', () => {
      expect_truthy(isMatch('foo/bar', 'foo[/]bar'));
      expect_truthy(isMatch('foo/bar/', 'foo[/]bar[/]'));
      expect_truthy(isMatch('foo/bar/baz', 'foo[/]bar[/]baz'));
    });

    test('should not match slashes following brackets', () => {
      expect_truthy(!isMatch('a/b', '[a]*'));
    });
  });
});
