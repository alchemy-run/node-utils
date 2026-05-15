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

const equal = (actual, expected, msg) => {
  expect_deepEqual([].concat(actual).sort(), [].concat(expected).sort(), msg);
};

describe('options.format', () => {

  // see https://github.com/isaacs/minimatch/issues/30
  test('should match the string returned by options.format', () => {
    const opts = { format: str => str.replace(/\\/g, '/').replace(/^\.\//, ''), strictSlashes: true };
    const fixtures = ['a', './a', 'b', 'a/a', './a/b', 'a/c', './a/x', './a/a/a', 'a/a/b', './a/a/a/a', './a/a/a/a/a', 'x/y', './z/z'];

    expect_truthy(!isMatch('./.a', '*.a', opts));
    expect_truthy(!isMatch('./.a', './*.a', opts));
    expect_truthy(!isMatch('./.a', 'a/**/z/*.md', opts));
    expect_truthy(!isMatch('./a/b/c/d/e/z/c.md', './a/**/j/**/z/*.md', opts));
    expect_truthy(!isMatch('./a/b/c/j/e/z/c.txt', './a/**/j/**/z/*.md', opts));
    expect_truthy(!isMatch('a/b/c/d/e/z/c.md', './a/**/j/**/z/*.md', opts));
    expect_truthy(isMatch('./.a', './.a', opts));
    expect_truthy(isMatch('./a/b/c.md', 'a/**/*.md', opts));
    expect_truthy(isMatch('./a/b/c/d/e/j/n/p/o/z/c.md', './a/**/j/**/z/*.md', opts));
    expect_truthy(isMatch('./a/b/c/d/e/z/c.md', '**/*.md', opts));
    expect_truthy(isMatch('./a/b/c/d/e/z/c.md', './a/**/z/*.md', opts));
    expect_truthy(isMatch('./a/b/c/d/e/z/c.md', 'a/**/z/*.md', opts));
    expect_truthy(isMatch('./a/b/c/j/e/z/c.md', './a/**/j/**/z/*.md', opts));
    expect_truthy(isMatch('./a/b/c/j/e/z/c.md', 'a/**/j/**/z/*.md', opts));
    expect_truthy(isMatch('./a/b/z/.a', './a/**/z/.a', opts));
    expect_truthy(isMatch('./a/b/z/.a', 'a/**/z/.a', opts));
    expect_truthy(isMatch('.a', './.a', opts));
    expect_truthy(isMatch('a/b/c.md', './a/**/*.md', opts));
    expect_truthy(isMatch('a/b/c.md', 'a/**/*.md', opts));
    expect_truthy(isMatch('a/b/c/d/e/z/c.md', 'a/**/z/*.md', opts));
    expect_truthy(isMatch('a/b/c/j/e/z/c.md', 'a/**/j/**/z/*.md', opts));
    expect_truthy(isMatch('./a', '*', opts));

    expect_truthy(isMatch('./foo/bar.js', '**/foo/**', opts));
    expect_truthy(isMatch('./foo/bar.js', './**/foo/**', opts));
    expect_truthy(isMatch('.\\foo\\bar.js', '**/foo/**', { ...opts, windows: false }));
    expect_truthy(isMatch('.\\foo\\bar.js', './**/foo/**', opts));
    equal(match(fixtures, '*', opts), ['a', 'b']);
    equal(match(fixtures, '**/a/**', opts), ['a/a', 'a/c', 'a/b', 'a/x', 'a/a/a', 'a/a/b', 'a/a/a/a', 'a/a/a/a/a']);
    equal(match(fixtures, '*/*', opts), ['a/a', 'a/b', 'a/c', 'a/x', 'x/y', 'z/z']);
    equal(match(fixtures, '*/*/*', opts), ['a/a/a', 'a/a/b']);
    equal(match(fixtures, '*/*/*/*', opts), ['a/a/a/a']);
    equal(match(fixtures, '*/*/*/*/*', opts), ['a/a/a/a/a']);
    equal(match(fixtures, '*', opts), ['a', 'b']);
    equal(match(fixtures, '**/a/**', opts), ['a/a', 'a/c', 'a/b', 'a/x', 'a/a/a', 'a/a/b', 'a/a/a/a', 'a/a/a/a/a']);
    equal(match(fixtures, 'a/*/a', opts), ['a/a/a']);
    equal(match(fixtures, 'a/*', opts), ['a/a', 'a/b', 'a/c', 'a/x']);
    equal(match(fixtures, 'a/*/*', opts), ['a/a/a', 'a/a/b']);
    equal(match(fixtures, 'a/*/*/*', opts), ['a/a/a/a']);
    equal(match(fixtures, 'a/*/*/*/*', opts), ['a/a/a/a/a']);
    equal(match(fixtures, 'a/*/a', opts), ['a/a/a']);
  });
});
