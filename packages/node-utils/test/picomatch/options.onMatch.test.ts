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

const format = str => str.replace(/^\.\//, '');
const options = () => {
  return {
    format,
    onMatch({ pattern, regex, input, output }, matches) {
      if (output.length > 2 && (output.startsWith('./') || output.startsWith('.\\'))) {
        output = output.slice(2);
      }
      if (matches) {
        matches.add(output);
      }
    }
  };
};

describe('options.onMatch', () => {
  test('should call options.onMatch on each matching string', () => {
    const fixtures = ['a', './a', 'b', 'a/a', './a/b', 'a/c', './a/x', './a/a/a', 'a/a/b', './a/a/a/a', './a/a/a/a/a', 'x/y', './z/z'];

    expect_truthy(!isMatch('./.a', '*.a', { format }));
    expect_truthy(!isMatch('./.a', './*.a', { format }));
    expect_truthy(!isMatch('./.a', 'a/**/z/*.md', { format }));
    expect_truthy(!isMatch('./a/b/c/d/e/z/c.md', './a/**/j/**/z/*.md', { format }));
    expect_truthy(!isMatch('./a/b/c/j/e/z/c.txt', './a/**/j/**/z/*.md', { format }));
    expect_truthy(!isMatch('a/b/c/d/e/z/c.md', './a/**/j/**/z/*.md', { format }));
    expect_truthy(isMatch('./.a', './.a', { format }));
    expect_truthy(isMatch('./a/b/c.md', 'a/**/*.md', { format }));
    expect_truthy(isMatch('./a/b/c/d/e/j/n/p/o/z/c.md', './a/**/j/**/z/*.md', { format }));
    expect_truthy(isMatch('./a/b/c/d/e/z/c.md', '**/*.md', { format }));
    expect_truthy(isMatch('./a/b/c/d/e/z/c.md', './a/**/z/*.md', { format }));
    expect_truthy(isMatch('./a/b/c/d/e/z/c.md', 'a/**/z/*.md', { format }));
    expect_truthy(isMatch('./a/b/c/j/e/z/c.md', './a/**/j/**/z/*.md', { format }));
    expect_truthy(isMatch('./a/b/c/j/e/z/c.md', 'a/**/j/**/z/*.md', { format }));
    expect_truthy(isMatch('./a/b/z/.a', './a/**/z/.a', { format }));
    expect_truthy(isMatch('./a/b/z/.a', 'a/**/z/.a', { format }));
    expect_truthy(isMatch('.a', './.a', { format }));
    expect_truthy(isMatch('a/b/c.md', './a/**/*.md', { format }));
    expect_truthy(isMatch('a/b/c.md', 'a/**/*.md', { format }));
    expect_truthy(isMatch('a/b/c/d/e/z/c.md', 'a/**/z/*.md', { format }));
    expect_truthy(isMatch('a/b/c/j/e/z/c.md', 'a/**/j/**/z/*.md', { format }));

    equal(match(fixtures, '*', options()), ['a', 'b']);
    equal(match(fixtures, '**/a/**', options()), ['a', 'a/a', 'a/c', 'a/b', 'a/x', 'a/a/a', 'a/a/b', 'a/a/a/a', 'a/a/a/a/a']);
    equal(match(fixtures, '*/*', options()), ['a/a', 'a/b', 'a/c', 'a/x', 'x/y', 'z/z']);
    equal(match(fixtures, '*/*/*', options()), ['a/a/a', 'a/a/b']);
    equal(match(fixtures, '*/*/*/*', options()), ['a/a/a/a']);
    equal(match(fixtures, '*/*/*/*/*', options()), ['a/a/a/a/a']);
    equal(match(fixtures, './*', options()), ['a', 'b']);
    equal(match(fixtures, './**/a/**', options()), ['a', 'a/a', 'a/b', 'a/c', 'a/x', 'a/a/a', 'a/a/b', 'a/a/a/a', 'a/a/a/a/a']);
    equal(match(fixtures, './a/*/a', options()), ['a/a/a']);
    equal(match(fixtures, 'a/*', options()), ['a/a', 'a/b', 'a/c', 'a/x']);
    equal(match(fixtures, 'a/*/*', options()), ['a/a/a', 'a/a/b']);
    equal(match(fixtures, 'a/*/*/*', options()), ['a/a/a/a']);
    equal(match(fixtures, 'a/*/*/*/*', options()), ['a/a/a/a/a']);
    equal(match(fixtures, 'a/*/a', options()), ['a/a/a']);
  });
});
