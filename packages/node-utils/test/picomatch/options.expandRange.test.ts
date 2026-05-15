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


import { fill } from "../../src/fill-range.ts";
const { isMatch } = picomatch;

describe('options.expandRange', () => {
  test('should support a custom function for expanding ranges in brace patterns', () => {
    expect_truthy(isMatch('a/c', 'a/{a..c}', { expandRange: (a, b) => `([${a}-${b}])` }));
    expect_truthy(!isMatch('a/z', 'a/{a..c}', { expandRange: (a, b) => `([${a}-${b}])` }));
    expect_truthy(isMatch('a/99', 'a/{1..100}', {
      expandRange(a, b) {
        return `(${fill(a, b, { toRegex: true })})`;
      }
    }));
  });
});
