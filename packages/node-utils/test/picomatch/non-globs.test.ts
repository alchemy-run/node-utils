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

describe('non-globs', () => {
  test('should match non-globs', () => {
    expect_truthy(!isMatch('/ab', '/a'));
    expect_truthy(!isMatch('a/a', 'a/b'));
    expect_truthy(!isMatch('a/a', 'a/c'));
    expect_truthy(!isMatch('a/b', 'a/c'));
    expect_truthy(!isMatch('a/c', 'a/b'));
    expect_truthy(!isMatch('aaa', 'aa'));
    expect_truthy(!isMatch('ab', '/a'));
    expect_truthy(!isMatch('ab', 'a'));

    expect_truthy(isMatch('/a', '/a'));
    expect_truthy(isMatch('/a/', '/a/'));
    expect_truthy(isMatch('/a/a', '/a/a'));
    expect_truthy(isMatch('/a/a/', '/a/a/'));
    expect_truthy(isMatch('/a/a/a', '/a/a/a'));
    expect_truthy(isMatch('/a/a/a/', '/a/a/a/'));
    expect_truthy(isMatch('/a/a/a/a', '/a/a/a/a'));
    expect_truthy(isMatch('/a/a/a/a/a', '/a/a/a/a/a'));

    expect_truthy(isMatch('a', 'a'));
    expect_truthy(isMatch('a/', 'a/'));
    expect_truthy(isMatch('a/a', 'a/a'));
    expect_truthy(isMatch('a/a/', 'a/a/'));
    expect_truthy(isMatch('a/a/a', 'a/a/a'));
    expect_truthy(isMatch('a/a/a/', 'a/a/a/'));
    expect_truthy(isMatch('a/a/a/a', 'a/a/a/a'));
    expect_truthy(isMatch('a/a/a/a/a', 'a/a/a/a/a'));
  });

  test('should match literal dots', () => {
    expect_truthy(isMatch('.', '.'));
    expect_truthy(isMatch('..', '..'));
    expect_truthy(!isMatch('...', '..'));
    expect_truthy(isMatch('...', '...'));
    expect_truthy(isMatch('....', '....'));
    expect_truthy(!isMatch('....', '...'));
  });

  test('should handle escaped characters as literals', () => {
    expect_truthy(!isMatch('abc', 'abc\\*'));
    expect_truthy(isMatch('abc*', 'abc\\*'));
  });

  test('should match windows paths', () => {
    expect_truthy(isMatch('aaa\\bbb', 'aaa/bbb', { windows: true }));
    expect_truthy(isMatch('aaa/bbb', 'aaa/bbb', { windows: true }));
  });
});
