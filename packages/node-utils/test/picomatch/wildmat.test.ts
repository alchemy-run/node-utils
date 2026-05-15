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

describe('Wildmat (git) tests', () => {
  test('Basic wildmat features', () => {
    expect_truthy(!isMatch('foo', '*f'));
    expect_truthy(!isMatch('foo', '??'));
    expect_truthy(!isMatch('foo', 'bar'));
    expect_truthy(!isMatch('foobar', 'foo\\*bar'));
    expect_truthy(isMatch('?a?b', '\\??\\?b'));
    expect_truthy(isMatch('aaaaaaabababab', '*ab'));
    expect_truthy(isMatch('foo', '*'));
    expect_truthy(isMatch('foo', '*foo*'));
    expect_truthy(isMatch('foo', '???'));
    expect_truthy(isMatch('foo', 'f*'));
    expect_truthy(isMatch('foo', 'foo'));
    expect_truthy(isMatch('foobar', '*ob*a*r*'));
  });

  test('should support recursion', () => {
    expect_truthy(!isMatch('-adobe-courier-bold-o-normal--12-120-75-75-/-70-iso8859-1', '-*-*-*-*-*-*-12-*-*-*-m-*-*-*'));
    expect_truthy(!isMatch('-adobe-courier-bold-o-normal--12-120-75-75-X-70-iso8859-1', '-*-*-*-*-*-*-12-*-*-*-m-*-*-*'));
    expect_truthy(!isMatch('ab/cXd/efXg/hi', '*X*i'));
    expect_truthy(!isMatch('ab/cXd/efXg/hi', '*Xg*i'));
    expect_truthy(!isMatch('abcd/abcdefg/abcdefghijk/abcdefghijklmnop.txtz', '**/*a*b*g*n*t'));
    expect_truthy(!isMatch('foo', '*/*/*'));
    expect_truthy(!isMatch('foo', 'fo'));
    expect_truthy(!isMatch('foo/bar', '*/*/*'));
    expect_truthy(!isMatch('foo/bar', 'foo?bar'));
    expect_truthy(!isMatch('foo/bb/aa/rr', '*/*/*'));
    expect_truthy(!isMatch('foo/bba/arr', 'foo*'));
    expect_truthy(!isMatch('foo/bba/arr', 'foo**'));
    expect_truthy(!isMatch('foo/bba/arr', 'foo/*'));
    expect_truthy(!isMatch('foo/bba/arr', 'foo/**arr'));
    expect_truthy(!isMatch('foo/bba/arr', 'foo/**z'));
    expect_truthy(!isMatch('foo/bba/arr', 'foo/*arr'));
    expect_truthy(!isMatch('foo/bba/arr', 'foo/*z'));
    expect_truthy(!isMatch('XXX/adobe/courier/bold/o/normal//12/120/75/75/X/70/iso8859/1', 'XXX/*/*/*/*/*/*/12/*/*/*/m/*/*/*'));
    expect_truthy(isMatch('-adobe-courier-bold-o-normal--12-120-75-75-m-70-iso8859-1', '-*-*-*-*-*-*-12-*-*-*-m-*-*-*'));
    expect_truthy(isMatch('ab/cXd/efXg/hi', '**/*X*/**/*i'));
    expect_truthy(isMatch('ab/cXd/efXg/hi', '*/*X*/*/*i'));
    expect_truthy(isMatch('abcd/abcdefg/abcdefghijk/abcdefghijklmnop.txt', '**/*a*b*g*n*t'));
    expect_truthy(isMatch('abcXdefXghi', '*X*i'));
    expect_truthy(isMatch('foo', 'foo'));
    expect_truthy(isMatch('foo/bar', 'foo/*'));
    expect_truthy(isMatch('foo/bar', 'foo/bar'));
    expect_truthy(isMatch('foo/bar', 'foo[/]bar'));
    expect_truthy(isMatch('foo/bb/aa/rr', '**/**/**'));
    expect_truthy(isMatch('foo/bba/arr', '*/*/*'));
    expect_truthy(isMatch('foo/bba/arr', 'foo/**'));
  });
});
