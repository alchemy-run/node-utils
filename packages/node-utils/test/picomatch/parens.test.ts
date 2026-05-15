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

const expect_truthy = (v: unknown) => { expect(Boolean(v)).toBe(true); };
const expect_equal = (actual: unknown, expected: unknown) => {
  expect(actual).toBe(expected as any);
};
const expect_deepEqual = (actual: unknown, expected: unknown) => {
  expect(actual).toEqual(expected as any);
};
const expect_throws = (fn: () => unknown, matcher?: any) => {
  if (matcher) expect(fn).toThrow(matcher);
  else expect(fn).toThrow();
};
const expect_doesNotThrow = (fn: () => unknown) => {
  expect(fn).not.toThrow();
};


const { isMatch } = picomatch;

describe('parens (non-extglobs)', () => {
  test('should support stars following parens', () => {
    expect_truthy(isMatch('a', '(a)*'));
    expect_truthy(isMatch('az', '(a)*'));
    expect_truthy(!isMatch('zz', '(a)*'));
    expect_truthy(isMatch('ab', '(a|b)*'));
    expect_truthy(isMatch('abc', '(a|b)*'));
    expect_truthy(isMatch('aa', '(a)*'));
    expect_truthy(isMatch('aaab', '(a|b)*'));
    expect_truthy(isMatch('aaabbb', '(a|b)*'));
  });

  test('should not match slashes with single stars', () => {
    expect_truthy(!isMatch('a/b', '(a)*'));
    expect_truthy(!isMatch('a/b', '(a|b)*'));
  });
});
