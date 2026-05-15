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

/**
 * Some of tests were converted from bash 4.3, 4.4, and minimatch unit tests.
 */

describe('extglobs (bash)', () => {
  test('should not match empty string with "*(0|1|3|5|7|9)"', () => {
    expect_truthy(!isMatch('', '*(0|1|3|5|7|9)', { bash: true, windows: true }));
  });

  test('"*(a|b[)" should not match "*(a|b\\[)"', () => {
    expect_truthy(!isMatch('*(a|b[)', '*(a|b\\[)', { bash: true, windows: true }));
  });

  test('"*(a|b[)" should not match "\\*\\(a|b\\[\\)"', () => {
    expect_truthy(!isMatch('*(a|b[)', '\\*\\(a|b\\[\\)', { bash: true, windows: true }));
  });

  test('"***" should match "\\*\\*\\*"', () => {
    expect_truthy(isMatch('***', '\\*\\*\\*', { bash: true, windows: true }));
  });

  test('"-adobe-courier-bold-o-normal--12-120-75-75-/-70-iso8859-1" should not match "-*-*-*-*-*-*-12-*-*-*-m-*-*-*"', () => {
    expect_truthy(!isMatch('-adobe-courier-bold-o-normal--12-120-75-75-/-70-iso8859-1', '-*-*-*-*-*-*-12-*-*-*-m-*-*-*', { bash: true, windows: true }));
  });

  test('"-adobe-courier-bold-o-normal--12-120-75-75-m-70-iso8859-1" should match "-*-*-*-*-*-*-12-*-*-*-m-*-*-*"', () => {
    expect_truthy(isMatch('-adobe-courier-bold-o-normal--12-120-75-75-m-70-iso8859-1', '-*-*-*-*-*-*-12-*-*-*-m-*-*-*', { bash: true, windows: true }));
  });

  test('"-adobe-courier-bold-o-normal--12-120-75-75-X-70-iso8859-1" should not match "-*-*-*-*-*-*-12-*-*-*-m-*-*-*"', () => {
    expect_truthy(!isMatch('-adobe-courier-bold-o-normal--12-120-75-75-X-70-iso8859-1', '-*-*-*-*-*-*-12-*-*-*-m-*-*-*', { bash: true, windows: true }));
  });

  test('"/dev/udp/129.22.8.102/45" should match "/dev\\/@(tcp|udp)\\/*\\/*"', () => {
    expect_truthy(isMatch('/dev/udp/129.22.8.102/45', '/dev\\/@(tcp|udp)\\/*\\/*', { bash: true, windows: true }));
  });

  test('"/x/y/z" should match "/x/y/z"', () => {
    expect_truthy(isMatch('/x/y/z', '/x/y/z', { bash: true, windows: true }));
  });

  test('"0377" should match "+([0-7])"', () => {
    expect_truthy(isMatch('0377', '+([0-7])', { bash: true, windows: true }));
  });

  test('"07" should match "+([0-7])"', () => {
    expect_truthy(isMatch('07', '+([0-7])', { bash: true, windows: true }));
  });

  test('"09" should not match "+([0-7])"', () => {
    expect_truthy(!isMatch('09', '+([0-7])', { bash: true, windows: true }));
  });

  test('"1" should match "0|[1-9]*([0-9])"', () => {
    expect_truthy(isMatch('1', '0|[1-9]*([0-9])', { bash: true, windows: true }));
  });

  test('"12" should match "0|[1-9]*([0-9])"', () => {
    expect_truthy(isMatch('12', '0|[1-9]*([0-9])', { bash: true, windows: true }));
  });

  test('"123abc" should not match "(a+|b)*"', () => {
    expect_truthy(!isMatch('123abc', '(a+|b)*', { bash: true, windows: true }));
  });

  test('"123abc" should not match "(a+|b)+"', () => {
    expect_truthy(!isMatch('123abc', '(a+|b)+', { bash: true, windows: true }));
  });

  test('"123abc" should match "*?(a)bc"', () => {
    expect_truthy(isMatch('123abc', '*?(a)bc', { bash: true, windows: true }));
  });

  test('"123abc" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('123abc', 'a(b*(foo|bar))d', { bash: true, windows: true }));
  });

  test('"123abc" should not match "ab*(e|f)"', () => {
    expect_truthy(!isMatch('123abc', 'ab*(e|f)', { bash: true, windows: true }));
  });

  test('"123abc" should not match "ab**"', () => {
    expect_truthy(!isMatch('123abc', 'ab**', { bash: true, windows: true }));
  });

  test('"123abc" should not match "ab**(e|f)"', () => {
    expect_truthy(!isMatch('123abc', 'ab**(e|f)', { bash: true, windows: true }));
  });

  test('"123abc" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('123abc', 'ab**(e|f)g', { bash: true, windows: true }));
  });

  test('"123abc" should not match "ab***ef"', () => {
    expect_truthy(!isMatch('123abc', 'ab***ef', { bash: true, windows: true }));
  });

  test('"123abc" should not match "ab*+(e|f)"', () => {
    expect_truthy(!isMatch('123abc', 'ab*+(e|f)', { bash: true, windows: true }));
  });

  test('"123abc" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('123abc', 'ab*d+(e|f)', { bash: true, windows: true }));
  });

  test('"123abc" should not match "ab?*(e|f)"', () => {
    expect_truthy(!isMatch('123abc', 'ab?*(e|f)', { bash: true, windows: true }));
  });

  test('"12abc" should not match "0|[1-9]*([0-9])"', () => {
    expect_truthy(!isMatch('12abc', '0|[1-9]*([0-9])', { bash: true, windows: true }));
  });

  test('"137577991" should match "*(0|1|3|5|7|9)"', () => {
    expect_truthy(isMatch('137577991', '*(0|1|3|5|7|9)', { bash: true, windows: true }));
  });

  test('"2468" should not match "*(0|1|3|5|7|9)"', () => {
    expect_truthy(!isMatch('2468', '*(0|1|3|5|7|9)', { bash: true, windows: true }));
  });

  test('"?a?b" should match "\\??\\?b"', () => {
    expect_truthy(isMatch('?a?b', '\\??\\?b', { bash: true, windows: true }));
  });

  test('"\\a\\b\\c" should not match "abc"', () => {
    expect_truthy(!isMatch('\\a\\b\\c', 'abc', { bash: true, windows: true }));
  });

  test('"a" should match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(isMatch('a', '!(*.a|*.b|*.c)', { bash: true, windows: true }));
  });

  test('"a" should not match "!(a)"', () => {
    expect_truthy(!isMatch('a', '!(a)', { bash: true, windows: true }));
  });

  test('"a" should not match "!(a)*"', () => {
    expect_truthy(!isMatch('a', '!(a)*', { bash: true, windows: true }));
  });

  test('"a" should match "(a)"', () => {
    expect_truthy(isMatch('a', '(a)', { bash: true, windows: true }));
  });

  test('"a" should not match "(b)"', () => {
    expect_truthy(!isMatch('a', '(b)', { bash: true, windows: true }));
  });

  test('"a" should match "*(a)"', () => {
    expect_truthy(isMatch('a', '*(a)', { bash: true, windows: true }));
  });

  test('"a" should match "+(a)"', () => {
    expect_truthy(isMatch('a', '+(a)', { bash: true, windows: true }));
  });

  test('"a" should match "?"', () => {
    expect_truthy(isMatch('a', '?', { bash: true, windows: true }));
  });

  test('"a" should match "?(a|b)"', () => {
    expect_truthy(isMatch('a', '?(a|b)', { bash: true, windows: true }));
  });

  test('"a" should not match "??"', () => {
    expect_truthy(!isMatch('a', '??', { bash: true, windows: true }));
  });

  test('"a" should match "a!(b)*"', () => {
    expect_truthy(isMatch('a', 'a!(b)*', { bash: true, windows: true }));
  });

  test('"a" should match "a?(a|b)"', () => {
    expect_truthy(isMatch('a', 'a?(a|b)', { bash: true, windows: true }));
  });

  test('"a" should match "a?(x)"', () => {
    expect_truthy(isMatch('a', 'a?(x)', { bash: true, windows: true }));
  });

  test('"a" should not match "a??b"', () => {
    expect_truthy(!isMatch('a', 'a??b', { bash: true, windows: true }));
  });

  test('"a" should not match "b?(a|b)"', () => {
    expect_truthy(!isMatch('a', 'b?(a|b)', { bash: true, windows: true }));
  });

  test('"a((((b" should match "a(*b"', () => {
    expect_truthy(isMatch('a((((b', 'a(*b', { bash: true, windows: true }));
  });

  test('"a((((b" should not match "a(b"', () => {
    expect_truthy(!isMatch('a((((b', 'a(b', { bash: true, windows: true }));
  });

  test('"a((((b" should not match "a\\(b"', () => {
    expect_truthy(!isMatch('a((((b', 'a\\(b', { bash: true, windows: true }));
  });

  test('"a((b" should match "a(*b"', () => {
    expect_truthy(isMatch('a((b', 'a(*b', { bash: true, windows: true }));
  });

  test('"a((b" should not match "a(b"', () => {
    expect_truthy(!isMatch('a((b', 'a(b', { bash: true, windows: true }));
  });

  test('"a((b" should not match "a\\(b"', () => {
    expect_truthy(!isMatch('a((b', 'a\\(b', { bash: true, windows: true }));
  });

  test('"a(b" should match "a(*b"', () => {
    expect_truthy(isMatch('a(b', 'a(*b', { bash: true, windows: true }));
  });

  test('"a(b" should match "a(b"', () => {
    expect_truthy(isMatch('a(b', 'a(b', { bash: true, windows: true }));
  });

  test('"a\\(b" should match "a\\(b"', () => {
    expect_truthy(isMatch('a\\(b', 'a\\(b', { bash: true, windows: true }));
  });

  test('"a(b" should match "a\\(b"', () => {
    expect_truthy(isMatch('a(b', 'a\\(b', { bash: true, windows: true }));
  });

  test('"a." should match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(isMatch('a.', '!(*.a|*.b|*.c)', { bash: true, windows: true }));
  });

  test('"a." should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('a.', '*!(.a|.b|.c)', { bash: true, windows: true }));
  });

  test('"a." should match "*.!(a)"', () => {
    expect_truthy(isMatch('a.', '*.!(a)', { bash: true, windows: true }));
  });

  test('"a." should match "*.!(a|b|c)"', () => {
    expect_truthy(isMatch('a.', '*.!(a|b|c)', { bash: true, windows: true }));
  });

  test('"a." should not match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(!isMatch('a.', '*.(a|b|@(ab|a*@(b))*(c)d)', { bash: true, windows: true }));
  });

  test('"a." should not match "*.+(b|d)"', () => {
    expect_truthy(!isMatch('a.', '*.+(b|d)', { bash: true, windows: true }));
  });

  test('"a.a" should not match "!(*.[a-b]*)"', () => {
    expect_truthy(!isMatch('a.a', '!(*.[a-b]*)', { bash: true, windows: true }));
  });

  test('"a.a" should not match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(!isMatch('a.a', '!(*.a|*.b|*.c)', { bash: true, windows: true }));
  });

  test('"a.a" should not match "!(*[a-b].[a-b]*)"', () => {
    expect_truthy(!isMatch('a.a', '!(*[a-b].[a-b]*)', { bash: true, windows: true }));
  });

  test('"a.a" should not match "!*.(a|b)"', () => {
    expect_truthy(!isMatch('a.a', '!*.(a|b)', { bash: true, windows: true }));
  });

  test('"a.a" should not match "!*.(a|b)*"', () => {
    expect_truthy(!isMatch('a.a', '!*.(a|b)*', { bash: true, windows: true }));
  });

  test('"a.a" should match "(a|d).(a|b)*"', () => {
    expect_truthy(isMatch('a.a', '(a|d).(a|b)*', { bash: true, windows: true }));
  });

  test('"a.a" should match "(b|a).(a)"', () => {
    expect_truthy(isMatch('a.a', '(b|a).(a)', { bash: true, windows: true }));
  });

  test('"a.a" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('a.a', '*!(.a|.b|.c)', { bash: true, windows: true }));
  });

  test('"a.a" should not match "*.!(a)"', () => {
    expect_truthy(!isMatch('a.a', '*.!(a)', { bash: true, windows: true }));
  });

  test('"a.a" should not match "*.!(a|b|c)"', () => {
    expect_truthy(!isMatch('a.a', '*.!(a|b|c)', { bash: true, windows: true }));
  });

  test('"a.a" should match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(isMatch('a.a', '*.(a|b|@(ab|a*@(b))*(c)d)', { bash: true, windows: true }));
  });

  test('"a.a" should not match "*.+(b|d)"', () => {
    expect_truthy(!isMatch('a.a', '*.+(b|d)', { bash: true, windows: true }));
  });

  test('"a.a" should match "@(b|a).@(a)"', () => {
    expect_truthy(isMatch('a.a', '@(b|a).@(a)', { bash: true, windows: true }));
  });

  test('"a.a.a" should not match "!(*.[a-b]*)"', () => {
    expect_truthy(!isMatch('a.a.a', '!(*.[a-b]*)', { bash: true, windows: true }));
  });

  test('"a.a.a" should not match "!(*[a-b].[a-b]*)"', () => {
    expect_truthy(!isMatch('a.a.a', '!(*[a-b].[a-b]*)', { bash: true, windows: true }));
  });

  test('"a.a.a" should not match "!*.(a|b)"', () => {
    expect_truthy(!isMatch('a.a.a', '!*.(a|b)', { bash: true, windows: true }));
  });

  test('"a.a.a" should not match "!*.(a|b)*"', () => {
    expect_truthy(!isMatch('a.a.a', '!*.(a|b)*', { bash: true, windows: true }));
  });

  test('"a.a.a" should match "*.!(a)"', () => {
    expect_truthy(isMatch('a.a.a', '*.!(a)', { bash: true, windows: true }));
  });

  test('"a.a.a" should not match "*.+(b|d)"', () => {
    expect_truthy(!isMatch('a.a.a', '*.+(b|d)', { bash: true, windows: true }));
  });

  test('"a.aa.a" should not match "(b|a).(a)"', () => {
    expect_truthy(!isMatch('a.aa.a', '(b|a).(a)', { bash: true, windows: true }));
  });

  test('"a.aa.a" should not match "@(b|a).@(a)"', () => {
    expect_truthy(!isMatch('a.aa.a', '@(b|a).@(a)', { bash: true, windows: true }));
  });

  test('"a.abcd" should match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(isMatch('a.abcd', '!(*.a|*.b|*.c)', { bash: true, windows: true }));
  });

  test('"a.abcd" should not match "!(*.a|*.b|*.c)*"', () => {
    expect_truthy(!isMatch('a.abcd', '!(*.a|*.b|*.c)*', { bash: true, windows: true }));
  });

  test('"a.abcd" should match "*!(*.a|*.b|*.c)*"', () => {
    expect_truthy(isMatch('a.abcd', '*!(*.a|*.b|*.c)*', { bash: true, windows: true }));
  });

  test('"a.abcd" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('a.abcd', '*!(.a|.b|.c)', { bash: true, windows: true }));
  });

  test('"a.abcd" should match "*.!(a|b|c)"', () => {
    expect_truthy(isMatch('a.abcd', '*.!(a|b|c)', { bash: true, windows: true }));
  });

  test('"a.abcd" should not match "*.!(a|b|c)*"', () => {
    expect_truthy(!isMatch('a.abcd', '*.!(a|b|c)*', { bash: true, windows: true }));
  });

  test('"a.abcd" should match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(isMatch('a.abcd', '*.(a|b|@(ab|a*@(b))*(c)d)', { bash: true, windows: true }));
  });

  test('"a.b" should not match "!(*.*)"', () => {
    expect_truthy(!isMatch('a.b', '!(*.*)', { bash: true, windows: true }));
  });

  test('"a.b" should not match "!(*.[a-b]*)"', () => {
    expect_truthy(!isMatch('a.b', '!(*.[a-b]*)', { bash: true, windows: true }));
  });

  test('"a.b" should not match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(!isMatch('a.b', '!(*.a|*.b|*.c)', { bash: true, windows: true }));
  });

  test('"a.b" should not match "!(*[a-b].[a-b]*)"', () => {
    expect_truthy(!isMatch('a.b', '!(*[a-b].[a-b]*)', { bash: true, windows: true }));
  });

  test('"a.b" should not match "!*.(a|b)"', () => {
    expect_truthy(!isMatch('a.b', '!*.(a|b)', { bash: true, windows: true }));
  });

  test('"a.b" should not match "!*.(a|b)*"', () => {
    expect_truthy(!isMatch('a.b', '!*.(a|b)*', { bash: true, windows: true }));
  });

  test('"a.b" should match "(a|d).(a|b)*"', () => {
    expect_truthy(isMatch('a.b', '(a|d).(a|b)*', { bash: true, windows: true }));
  });

  test('"a.b" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('a.b', '*!(.a|.b|.c)', { bash: true, windows: true }));
  });

  test('"a.b" should match "*.!(a)"', () => {
    expect_truthy(isMatch('a.b', '*.!(a)', { bash: true, windows: true }));
  });

  test('"a.b" should not match "*.!(a|b|c)"', () => {
    expect_truthy(!isMatch('a.b', '*.!(a|b|c)', { bash: true, windows: true }));
  });

  test('"a.b" should match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(isMatch('a.b', '*.(a|b|@(ab|a*@(b))*(c)d)', { bash: true, windows: true }));
  });

  test('"a.b" should match "*.+(b|d)"', () => {
    expect_truthy(isMatch('a.b', '*.+(b|d)', { bash: true, windows: true }));
  });

  test('"a.bb" should not match "!(*.[a-b]*)"', () => {
    expect_truthy(!isMatch('a.bb', '!(*.[a-b]*)', { bash: true, windows: true }));
  });

  test('"a.bb" should not match "!(*[a-b].[a-b]*)"', () => {
    expect_truthy(!isMatch('a.bb', '!(*[a-b].[a-b]*)', { bash: true, windows: true }));
  });

  test('"a.bb" should match "!*.(a|b)"', () => {
    expect_truthy(isMatch('a.bb', '!*.(a|b)', { bash: true, windows: true }));
  });

  test('"a.bb" should not match "!*.(a|b)*"', () => {
    expect_truthy(!isMatch('a.bb', '!*.(a|b)*', { bash: true, windows: true }));
  });

  test('"a.bb" should not match "!*.*(a|b)"', () => {
    expect_truthy(!isMatch('a.bb', '!*.*(a|b)', { bash: true, windows: true }));
  });

  test('"a.bb" should match "(a|d).(a|b)*"', () => {
    expect_truthy(isMatch('a.bb', '(a|d).(a|b)*', { bash: true, windows: true }));
  });

  test('"a.bb" should not match "(b|a).(a)"', () => {
    expect_truthy(!isMatch('a.bb', '(b|a).(a)', { bash: true, windows: true }));
  });

  test('"a.bb" should match "*.+(b|d)"', () => {
    expect_truthy(isMatch('a.bb', '*.+(b|d)', { bash: true, windows: true }));
  });

  test('"a.bb" should not match "@(b|a).@(a)"', () => {
    expect_truthy(!isMatch('a.bb', '@(b|a).@(a)', { bash: true, windows: true }));
  });

  test('"a.c" should not match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(!isMatch('a.c', '!(*.a|*.b|*.c)', { bash: true, windows: true }));
  });

  test('"a.c" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('a.c', '*!(.a|.b|.c)', { bash: true, windows: true }));
  });

  test('"a.c" should not match "*.!(a|b|c)"', () => {
    expect_truthy(!isMatch('a.c', '*.!(a|b|c)', { bash: true, windows: true }));
  });

  test('"a.c" should not match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(!isMatch('a.c', '*.(a|b|@(ab|a*@(b))*(c)d)', { bash: true, windows: true }));
  });

  test('"a.c.d" should match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(isMatch('a.c.d', '!(*.a|*.b|*.c)', { bash: true, windows: true }));
  });

  test('"a.c.d" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('a.c.d', '*!(.a|.b|.c)', { bash: true, windows: true }));
  });

  test('"a.c.d" should match "*.!(a|b|c)"', () => {
    expect_truthy(isMatch('a.c.d', '*.!(a|b|c)', { bash: true, windows: true }));
  });

  test('"a.c.d" should not match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(!isMatch('a.c.d', '*.(a|b|@(ab|a*@(b))*(c)d)', { bash: true, windows: true }));
  });

  test('"a.ccc" should match "!(*.[a-b]*)"', () => {
    expect_truthy(isMatch('a.ccc', '!(*.[a-b]*)', { bash: true, windows: true }));
  });

  test('"a.ccc" should match "!(*[a-b].[a-b]*)"', () => {
    expect_truthy(isMatch('a.ccc', '!(*[a-b].[a-b]*)', { bash: true, windows: true }));
  });

  test('"a.ccc" should match "!*.(a|b)"', () => {
    expect_truthy(isMatch('a.ccc', '!*.(a|b)', { bash: true, windows: true }));
  });

  test('"a.ccc" should match "!*.(a|b)*"', () => {
    expect_truthy(isMatch('a.ccc', '!*.(a|b)*', { bash: true, windows: true }));
  });

  test('"a.ccc" should not match "*.+(b|d)"', () => {
    expect_truthy(!isMatch('a.ccc', '*.+(b|d)', { bash: true, windows: true }));
  });

  test('"a.js" should not match "!(*.js)"', () => {
    expect_truthy(!isMatch('a.js', '!(*.js)', { bash: true, windows: true }));
  });

  test('"a.js" should match "*!(.js)"', () => {
    expect_truthy(isMatch('a.js', '*!(.js)', { bash: true, windows: true }));
  });

  test('"a.js" should not match "*.!(js)"', () => {
    expect_truthy(!isMatch('a.js', '*.!(js)', { bash: true, windows: true }));
  });

  test('"a.js" should not match "a.!(js)"', () => {
    expect_truthy(!isMatch('a.js', 'a.!(js)', { bash: true, windows: true }));
  });

  test('"a.js" should not match "a.!(js)*"', () => {
    expect_truthy(!isMatch('a.js', 'a.!(js)*', { bash: true, windows: true }));
  });

  test('"a.js.js" should not match "!(*.js)"', () => {
    expect_truthy(!isMatch('a.js.js', '!(*.js)', { bash: true, windows: true }));
  });

  test('"a.js.js" should match "*!(.js)"', () => {
    expect_truthy(isMatch('a.js.js', '*!(.js)', { bash: true, windows: true }));
  });

  test('"a.js.js" should match "*.!(js)"', () => {
    expect_truthy(isMatch('a.js.js', '*.!(js)', { bash: true, windows: true }));
  });

  test('"a.js.js" should match "*.*(js).js"', () => {
    expect_truthy(isMatch('a.js.js', '*.*(js).js', { bash: true, windows: true }));
  });

  test('"a.md" should match "!(*.js)"', () => {
    expect_truthy(isMatch('a.md', '!(*.js)', { bash: true, windows: true }));
  });

  test('"a.md" should match "*!(.js)"', () => {
    expect_truthy(isMatch('a.md', '*!(.js)', { bash: true, windows: true }));
  });

  test('"a.md" should match "*.!(js)"', () => {
    expect_truthy(isMatch('a.md', '*.!(js)', { bash: true, windows: true }));
  });

  test('"a.md" should match "a.!(js)"', () => {
    expect_truthy(isMatch('a.md', 'a.!(js)', { bash: true, windows: true }));
  });

  test('"a.md" should match "a.!(js)*"', () => {
    expect_truthy(isMatch('a.md', 'a.!(js)*', { bash: true, windows: true }));
  });

  test('"a.md.js" should not match "*.*(js).js"', () => {
    expect_truthy(!isMatch('a.md.js', '*.*(js).js', { bash: true, windows: true }));
  });

  test('"a.txt" should match "a.!(js)"', () => {
    expect_truthy(isMatch('a.txt', 'a.!(js)', { bash: true, windows: true }));
  });

  test('"a.txt" should match "a.!(js)*"', () => {
    expect_truthy(isMatch('a.txt', 'a.!(js)*', { bash: true, windows: true }));
  });

  test('"a/!(z)" should match "a/!(z)"', () => {
    expect_truthy(isMatch('a/!(z)', 'a/!(z)', { bash: true, windows: true }));
  });

  test('"a/b" should match "a/!(z)"', () => {
    expect_truthy(isMatch('a/b', 'a/!(z)', { bash: true, windows: true }));
  });

  test('"a/b/c.txt" should not match "*/b/!(*).txt"', () => {
    expect_truthy(!isMatch('a/b/c.txt', '*/b/!(*).txt', { bash: true, windows: true }));
  });

  test('"a/b/c.txt" should not match "*/b/!(c).txt"', () => {
    expect_truthy(!isMatch('a/b/c.txt', '*/b/!(c).txt', { bash: true, windows: true }));
  });

  test('"a/b/c.txt" should match "*/b/!(cc).txt"', () => {
    expect_truthy(isMatch('a/b/c.txt', '*/b/!(cc).txt', { bash: true, windows: true }));
  });

  test('"a/b/cc.txt" should not match "*/b/!(*).txt"', () => {
    expect_truthy(!isMatch('a/b/cc.txt', '*/b/!(*).txt', { bash: true, windows: true }));
  });

  test('"a/b/cc.txt" should not match "*/b/!(c).txt"', () => {
    expect_truthy(!isMatch('a/b/cc.txt', '*/b/!(c).txt', { bash: true, windows: true }));
  });

  test('"a/b/cc.txt" should not match "*/b/!(cc).txt"', () => {
    expect_truthy(!isMatch('a/b/cc.txt', '*/b/!(cc).txt', { bash: true, windows: true }));
  });

  test('"a/dir/foo.txt" should match "*/dir/**/!(bar).txt"', () => {
    expect_truthy(isMatch('a/dir/foo.txt', '*/dir/**/!(bar).txt', { bash: true, windows: true }));
  });

  test('"a/z" should not match "a/!(z)"', () => {
    expect_truthy(!isMatch('a/z', 'a/!(z)', { bash: true, windows: true }));
  });

  test('"a\\(b" should not match "a(*b"', () => {
    expect_truthy(!isMatch('a\\(b', 'a(*b', { bash: true, windows: true }));
  });

  test('"a\\(b" should not match "a(b"', () => {
    expect_truthy(!isMatch('a\\(b', 'a(b', { bash: true, windows: true }));
  });

  test('"a\\z" should match "a\\z"', () => {
    expect_truthy(isMatch('a\\\\z', 'a\\\\z', { bash: true, windows: false }));
  });

  test('"a\\z" should match "a\\z"', () => {
    expect_truthy(isMatch('a\\\\z', 'a\\\\z', { bash: true, windows: true }));
  });

  test('"a\\b" should match "a/b"', () => {
    expect_truthy(isMatch('a\\b', 'a/b', { windows: true }));
  });

  test('"a\\z" should match "a\\z"', () => {
    expect_truthy(isMatch('a\\\\z', 'a\\\\z', { bash: true, windows: true }));
    expect_truthy(isMatch('a\\z', 'a\\z', { bash: true, windows: true }));
  });

  test('"a\\z" should not match "a\\z"', () => {
    expect_truthy(isMatch('a\\z', 'a\\z', { bash: true, windows: true }));
  });

  test('"aa" should not match "!(a!(b))"', () => {
    expect_truthy(!isMatch('aa', '!(a!(b))', { bash: true, windows: true }));
  });

  test('"aa" should match "!(a)"', () => {
    expect_truthy(isMatch('aa', '!(a)', { bash: true, windows: true }));
  });

  test('"aa" should not match "!(a)*"', () => {
    expect_truthy(!isMatch('aa', '!(a)*', { bash: true, windows: true }));
  });

  test('"aa" should not match "?"', () => {
    expect_truthy(!isMatch('aa', '?', { bash: true, windows: true }));
  });

  test('"aa" should not match "@(a)b"', () => {
    expect_truthy(!isMatch('aa', '@(a)b', { bash: true, windows: true }));
  });

  test('"aa" should match "a!(b)*"', () => {
    expect_truthy(isMatch('aa', 'a!(b)*', { bash: true, windows: true }));
  });

  test('"aa" should not match "a??b"', () => {
    expect_truthy(!isMatch('aa', 'a??b', { bash: true, windows: true }));
  });

  test('"aa.aa" should not match "(b|a).(a)"', () => {
    expect_truthy(!isMatch('aa.aa', '(b|a).(a)', { bash: true, windows: true }));
  });

  test('"aa.aa" should not match "@(b|a).@(a)"', () => {
    expect_truthy(!isMatch('aa.aa', '@(b|a).@(a)', { bash: true, windows: true }));
  });

  test('"aaa" should not match "!(a)*"', () => {
    expect_truthy(!isMatch('aaa', '!(a)*', { bash: true, windows: true }));
  });

  test('"aaa" should match "a!(b)*"', () => {
    expect_truthy(isMatch('aaa', 'a!(b)*', { bash: true, windows: true }));
  });

  test('"aaaaaaabababab" should match "*ab"', () => {
    expect_truthy(isMatch('aaaaaaabababab', '*ab', { bash: true, windows: true }));
  });

  test('"aaac" should match "*(@(a))a@(c)"', () => {
    expect_truthy(isMatch('aaac', '*(@(a))a@(c)', { bash: true, windows: true }));
  });

  test('"aaaz" should match "[a*(]*z"', () => {
    expect_truthy(isMatch('aaaz', '[a*(]*z', { bash: true, windows: true }));
  });

  test('"aab" should not match "!(a)*"', () => {
    expect_truthy(!isMatch('aab', '!(a)*', { bash: true, windows: true }));
  });

  test('"aab" should not match "?"', () => {
    expect_truthy(!isMatch('aab', '?', { bash: true, windows: true }));
  });

  test('"aab" should not match "??"', () => {
    expect_truthy(!isMatch('aab', '??', { bash: true, windows: true }));
  });

  test('"aab" should not match "@(c)b"', () => {
    expect_truthy(!isMatch('aab', '@(c)b', { bash: true, windows: true }));
  });

  test('"aab" should match "a!(b)*"', () => {
    expect_truthy(isMatch('aab', 'a!(b)*', { bash: true, windows: true }));
  });

  test('"aab" should not match "a??b"', () => {
    expect_truthy(!isMatch('aab', 'a??b', { bash: true, windows: true }));
  });

  test('"aac" should match "*(@(a))a@(c)"', () => {
    expect_truthy(isMatch('aac', '*(@(a))a@(c)', { bash: true, windows: true }));
  });

  test('"aac" should not match "*(@(a))b@(c)"', () => {
    expect_truthy(!isMatch('aac', '*(@(a))b@(c)', { bash: true, windows: true }));
  });

  test('"aax" should not match "a!(a*|b)"', () => {
    expect_truthy(!isMatch('aax', 'a!(a*|b)', { bash: true, windows: true }));
  });

  test('"aax" should match "a!(x*|b)"', () => {
    expect_truthy(isMatch('aax', 'a!(x*|b)', { bash: true, windows: true }));
  });

  test('"aax" should match "a?(a*|b)"', () => {
    expect_truthy(isMatch('aax', 'a?(a*|b)', { bash: true, windows: true }));
  });

  test('"aaz" should match "[a*(]*z"', () => {
    expect_truthy(isMatch('aaz', '[a*(]*z', { bash: true, windows: true }));
  });

  test('"ab" should match "!(*.*)"', () => {
    expect_truthy(isMatch('ab', '!(*.*)', { bash: true, windows: true }));
  });

  test('"ab" should match "!(a!(b))"', () => {
    expect_truthy(isMatch('ab', '!(a!(b))', { bash: true, windows: true }));
  });

  test('"ab" should not match "!(a)*"', () => {
    expect_truthy(!isMatch('ab', '!(a)*', { bash: true, windows: true }));
  });

  test('"ab" should match "@(a+|b)*"', () => {
    expect_truthy(isMatch('ab', '@(a+|b)*', { bash: true, windows: true }));
  });

  test('"ab" should match "(a+|b)+"', () => {
    expect_truthy(isMatch('ab', '(a+|b)+', { bash: true, windows: true }));
  });

  test('"ab" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('ab', '*?(a)bc', { bash: true, windows: true }));
  });

  test('"ab" should not match "a!(*(b|B))"', () => {
    expect_truthy(!isMatch('ab', 'a!(*(b|B))', { bash: true, windows: true }));
  });

  test('"ab" should not match "a!(@(b|B))"', () => {
    expect_truthy(!isMatch('ab', 'a!(@(b|B))', { bash: true, windows: true }));
  });

  test('"aB" should not match "a!(@(b|B))"', () => {
    expect_truthy(!isMatch('aB', 'a!(@(b|B))', { bash: true, windows: true }));
  });

  test('"ab" should not match "a!(b)*"', () => {
    expect_truthy(!isMatch('ab', 'a!(b)*', { bash: true, windows: true }));
  });

  test('"ab" should not match "a(*b"', () => {
    expect_truthy(!isMatch('ab', 'a(*b', { bash: true, windows: true }));
  });

  test('"ab" should not match "a(b"', () => {
    expect_truthy(!isMatch('ab', 'a(b', { bash: true, windows: true }));
  });

  test('"ab" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('ab', 'a(b*(foo|bar))d', { bash: true, windows: true }));
  });

  test('"ab" should not match "a/b"', () => {
    expect_truthy(!isMatch('ab', 'a/b', { windows: true }));
  });

  test('"ab" should not match "a\\(b"', () => {
    expect_truthy(!isMatch('ab', 'a\\(b', { bash: true, windows: true }));
  });

  test('"ab" should match "ab*(e|f)"', () => {
    expect_truthy(isMatch('ab', 'ab*(e|f)', { bash: true, windows: true }));
  });

  test('"ab" should match "ab**"', () => {
    expect_truthy(isMatch('ab', 'ab**', { bash: true, windows: true }));
  });

  test('"ab" should match "ab**(e|f)"', () => {
    expect_truthy(isMatch('ab', 'ab**(e|f)', { bash: true, windows: true }));
  });

  test('"ab" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('ab', 'ab**(e|f)g', { bash: true, windows: true }));
  });

  test('"ab" should not match "ab***ef"', () => {
    expect_truthy(!isMatch('ab', 'ab***ef', { bash: true, windows: true }));
  });

  test('"ab" should not match "ab*+(e|f)"', () => {
    expect_truthy(!isMatch('ab', 'ab*+(e|f)', { bash: true, windows: true }));
  });

  test('"ab" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('ab', 'ab*d+(e|f)', { bash: true, windows: true }));
  });

  test('"ab" should not match "ab?*(e|f)"', () => {
    expect_truthy(!isMatch('ab', 'ab?*(e|f)', { bash: true, windows: true }));
  });

  test('"ab/cXd/efXg/hi" should match "**/*X*/**/*i"', () => {
    expect_truthy(isMatch('ab/cXd/efXg/hi', '**/*X*/**/*i', { bash: true, windows: true }));
  });

  test('"ab/cXd/efXg/hi" should match "*/*X*/*/*i"', () => {
    expect_truthy(isMatch('ab/cXd/efXg/hi', '*/*X*/*/*i', { bash: true, windows: true }));
  });

  test('"ab/cXd/efXg/hi" should match "*X*i"', () => {
    expect_truthy(isMatch('ab/cXd/efXg/hi', '*X*i', { bash: true, windows: true }));
  });

  test('"ab/cXd/efXg/hi" should match "*Xg*i"', () => {
    expect_truthy(isMatch('ab/cXd/efXg/hi', '*Xg*i', { bash: true, windows: true }));
  });

  test('"ab]" should match "a!(@(b|B))"', () => {
    expect_truthy(isMatch('ab]', 'a!(@(b|B))', { bash: true, windows: true }));
  });

  test('"abab" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('abab', '(a+|b)*', { bash: true, windows: true }));
  });

  test('"abab" should match "(a+|b)+"', () => {
    expect_truthy(isMatch('abab', '(a+|b)+', { bash: true, windows: true }));
  });

  test('"abab" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('abab', '*?(a)bc', { bash: true, windows: true }));
  });

  test('"abab" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('abab', 'a(b*(foo|bar))d', { bash: true, windows: true }));
  });

  test('"abab" should not match "ab*(e|f)"', () => {
    expect_truthy(!isMatch('abab', 'ab*(e|f)', { bash: true, windows: true }));
  });

  test('"abab" should match "ab**"', () => {
    expect_truthy(isMatch('abab', 'ab**', { bash: true, windows: true }));
  });

  test('"abab" should match "ab**(e|f)"', () => {
    expect_truthy(isMatch('abab', 'ab**(e|f)', { bash: true, windows: true }));
  });

  test('"abab" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('abab', 'ab**(e|f)g', { bash: true, windows: true }));
  });

  test('"abab" should not match "ab***ef"', () => {
    expect_truthy(!isMatch('abab', 'ab***ef', { bash: true, windows: true }));
  });

  test('"abab" should not match "ab*+(e|f)"', () => {
    expect_truthy(!isMatch('abab', 'ab*+(e|f)', { bash: true, windows: true }));
  });

  test('"abab" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('abab', 'ab*d+(e|f)', { bash: true, windows: true }));
  });

  test('"abab" should not match "ab?*(e|f)"', () => {
    expect_truthy(!isMatch('abab', 'ab?*(e|f)', { bash: true, windows: true }));
  });

  test('"abb" should match "!(*.*)"', () => {
    expect_truthy(isMatch('abb', '!(*.*)', { bash: true, windows: true }));
  });

  test('"abb" should not match "!(a)*"', () => {
    expect_truthy(!isMatch('abb', '!(a)*', { bash: true, windows: true }));
  });

  test('"abb" should not match "a!(b)*"', () => {
    expect_truthy(!isMatch('abb', 'a!(b)*', { bash: true, windows: true }));
  });

  test('"abbcd" should match "@(ab|a*(b))*(c)d"', () => {
    expect_truthy(isMatch('abbcd', '@(ab|a*(b))*(c)d', { bash: true, windows: true }));
  });

  test('"abc" should not match "\\a\\b\\c"', () => {
    expect_truthy(!isMatch('abc', '\\a\\b\\c', { bash: true, windows: true }));
  });

  test('"aBc" should match "a!(@(b|B))"', () => {
    expect_truthy(isMatch('aBc', 'a!(@(b|B))', { bash: true, windows: true }));
  });

  test('"abcd" should match "?@(a|b)*@(c)d"', () => {
    expect_truthy(isMatch('abcd', '?@(a|b)*@(c)d', { bash: true, windows: true }));
  });

  test('"abcd" should match "@(ab|a*@(b))*(c)d"', () => {
    expect_truthy(isMatch('abcd', '@(ab|a*@(b))*(c)d', { bash: true, windows: true }));
  });

  test('"abcd/abcdefg/abcdefghijk/abcdefghijklmnop.txt" should match "**/*a*b*g*n*t"', () => {
    expect_truthy(isMatch('abcd/abcdefg/abcdefghijk/abcdefghijklmnop.txt', '**/*a*b*g*n*t', { bash: true, windows: true }));
  });

  test('"abcd/abcdefg/abcdefghijk/abcdefghijklmnop.txtz" should not match "**/*a*b*g*n*t"', () => {
    expect_truthy(!isMatch('abcd/abcdefg/abcdefghijk/abcdefghijklmnop.txtz', '**/*a*b*g*n*t', { bash: true, windows: true }));
  });

  test('"abcdef" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('abcdef', '(a+|b)*', { bash: true, windows: true }));
  });

  test('"abcdef" should not match "(a+|b)+"', () => {
    expect_truthy(!isMatch('abcdef', '(a+|b)+', { bash: true, windows: true }));
  });

  test('"abcdef" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('abcdef', '*?(a)bc', { bash: true, windows: true }));
  });

  test('"abcdef" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('abcdef', 'a(b*(foo|bar))d', { bash: true, windows: true }));
  });

  test('"abcdef" should not match "ab*(e|f)"', () => {
    expect_truthy(!isMatch('abcdef', 'ab*(e|f)', { bash: true, windows: true }));
  });

  test('"abcdef" should match "ab**"', () => {
    expect_truthy(isMatch('abcdef', 'ab**', { bash: true, windows: true }));
  });

  test('"abcdef" should match "ab**(e|f)"', () => {
    expect_truthy(isMatch('abcdef', 'ab**(e|f)', { bash: true, windows: true }));
  });

  test('"abcdef" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('abcdef', 'ab**(e|f)g', { bash: true, windows: true }));
  });

  test('"abcdef" should match "ab***ef"', () => {
    expect_truthy(isMatch('abcdef', 'ab***ef', { bash: true, windows: true }));
  });

  test('"abcdef" should match "ab*+(e|f)"', () => {
    expect_truthy(isMatch('abcdef', 'ab*+(e|f)', { bash: true, windows: true }));
  });

  test('"abcdef" should match "ab*d+(e|f)"', () => {
    expect_truthy(isMatch('abcdef', 'ab*d+(e|f)', { bash: true, windows: true }));
  });

  test('"abcdef" should not match "ab?*(e|f)"', () => {
    expect_truthy(!isMatch('abcdef', 'ab?*(e|f)', { bash: true, windows: true }));
  });

  test('"abcfef" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('abcfef', '(a+|b)*', { bash: true, windows: true }));
  });

  test('"abcfef" should not match "(a+|b)+"', () => {
    expect_truthy(!isMatch('abcfef', '(a+|b)+', { bash: true, windows: true }));
  });

  test('"abcfef" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('abcfef', '*?(a)bc', { bash: true, windows: true }));
  });

  test('"abcfef" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('abcfef', 'a(b*(foo|bar))d', { bash: true, windows: true }));
  });

  test('"abcfef" should not match "ab*(e|f)"', () => {
    expect_truthy(!isMatch('abcfef', 'ab*(e|f)', { bash: true, windows: true }));
  });

  test('"abcfef" should match "ab**"', () => {
    expect_truthy(isMatch('abcfef', 'ab**', { bash: true, windows: true }));
  });

  test('"abcfef" should match "ab**(e|f)"', () => {
    expect_truthy(isMatch('abcfef', 'ab**(e|f)', { bash: true, windows: true }));
  });

  test('"abcfef" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('abcfef', 'ab**(e|f)g', { bash: true, windows: true }));
  });

  test('"abcfef" should match "ab***ef"', () => {
    expect_truthy(isMatch('abcfef', 'ab***ef', { bash: true, windows: true }));
  });

  test('"abcfef" should match "ab*+(e|f)"', () => {
    expect_truthy(isMatch('abcfef', 'ab*+(e|f)', { bash: true, windows: true }));
  });

  test('"abcfef" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('abcfef', 'ab*d+(e|f)', { bash: true, windows: true }));
  });

  test('"abcfef" should match "ab?*(e|f)"', () => {
    expect_truthy(isMatch('abcfef', 'ab?*(e|f)', { bash: true, windows: true }));
  });

  test('"abcfefg" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('abcfefg', '(a+|b)*', { bash: true, windows: true }));
  });

  test('"abcfefg" should not match "(a+|b)+"', () => {
    expect_truthy(!isMatch('abcfefg', '(a+|b)+', { bash: true, windows: true }));
  });

  test('"abcfefg" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('abcfefg', '*?(a)bc', { bash: true, windows: true }));
  });

  test('"abcfefg" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('abcfefg', 'a(b*(foo|bar))d', { bash: true, windows: true }));
  });

  test('"abcfefg" should not match "ab*(e|f)"', () => {
    expect_truthy(!isMatch('abcfefg', 'ab*(e|f)', { bash: true, windows: true }));
  });

  test('"abcfefg" should match "ab**"', () => {
    expect_truthy(isMatch('abcfefg', 'ab**', { bash: true, windows: true }));
  });

  test('"abcfefg" should match "ab**(e|f)"', () => {
    expect_truthy(isMatch('abcfefg', 'ab**(e|f)', { bash: true, windows: true }));
  });

  test('"abcfefg" should match "ab**(e|f)g"', () => {
    expect_truthy(isMatch('abcfefg', 'ab**(e|f)g', { bash: true, windows: true }));
  });

  test('"abcfefg" should not match "ab***ef"', () => {
    expect_truthy(!isMatch('abcfefg', 'ab***ef', { bash: true, windows: true }));
  });

  test('"abcfefg" should not match "ab*+(e|f)"', () => {
    expect_truthy(!isMatch('abcfefg', 'ab*+(e|f)', { bash: true, windows: true }));
  });

  test('"abcfefg" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('abcfefg', 'ab*d+(e|f)', { bash: true, windows: true }));
  });

  test('"abcfefg" should not match "ab?*(e|f)"', () => {
    expect_truthy(!isMatch('abcfefg', 'ab?*(e|f)', { bash: true, windows: true }));
  });

  test('"abcx" should match "!([[*])*"', () => {
    expect_truthy(isMatch('abcx', '!([[*])*', { bash: true, windows: true }));
  });

  test('"abcx" should match "+(a|b\\[)*"', () => {
    expect_truthy(isMatch('abcx', '+(a|b\\[)*', { bash: true, windows: true }));
  });

  test('"abcx" should not match "[a*(]*z"', () => {
    expect_truthy(!isMatch('abcx', '[a*(]*z', { bash: true, windows: true }));
  });

  test('"abcXdefXghi" should match "*X*i"', () => {
    expect_truthy(isMatch('abcXdefXghi', '*X*i', { bash: true, windows: true }));
  });

  test('"abcz" should match "!([[*])*"', () => {
    expect_truthy(isMatch('abcz', '!([[*])*', { bash: true, windows: true }));
  });

  test('"abcz" should match "+(a|b\\[)*"', () => {
    expect_truthy(isMatch('abcz', '+(a|b\\[)*', { bash: true, windows: true }));
  });

  test('"abcz" should match "[a*(]*z"', () => {
    expect_truthy(isMatch('abcz', '[a*(]*z', { bash: true, windows: true }));
  });

  test('"abd" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('abd', '(a+|b)*', { bash: true, windows: true }));
  });

  test('"abd" should not match "(a+|b)+"', () => {
    expect_truthy(!isMatch('abd', '(a+|b)+', { bash: true, windows: true }));
  });

  test('"abd" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('abd', '*?(a)bc', { bash: true, windows: true }));
  });

  test('"abd" should match "a!(*(b|B))"', () => {
    expect_truthy(isMatch('abd', 'a!(*(b|B))', { bash: true, windows: true }));
  });

  test('"abd" should match "a!(@(b|B))"', () => {
    expect_truthy(isMatch('abd', 'a!(@(b|B))', { bash: true, windows: true }));
  });

  test('"abd" should not match "a!(@(b|B))d"', () => {
    expect_truthy(!isMatch('abd', 'a!(@(b|B))d', { bash: true, windows: true }));
  });

  test('"abd" should match "a(b*(foo|bar))d"', () => {
    expect_truthy(isMatch('abd', 'a(b*(foo|bar))d', { bash: true, windows: true }));
  });

  test('"abd" should match "a+(b|c)d"', () => {
    expect_truthy(isMatch('abd', 'a+(b|c)d', { bash: true, windows: true }));
  });

  test('"abd" should match "a[b*(foo|bar)]d"', () => {
    expect_truthy(isMatch('abd', 'a[b*(foo|bar)]d', { bash: true, windows: true }));
  });

  test('"abd" should not match "ab*(e|f)"', () => {
    expect_truthy(!isMatch('abd', 'ab*(e|f)', { bash: true, windows: true }));
  });

  test('"abd" should match "ab**"', () => {
    expect_truthy(isMatch('abd', 'ab**', { bash: true, windows: true }));
  });

  test('"abd" should match "ab**(e|f)"', () => {
    expect_truthy(isMatch('abd', 'ab**(e|f)', { bash: true, windows: true }));
  });

  test('"abd" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('abd', 'ab**(e|f)g', { bash: true, windows: true }));
  });

  test('"abd" should not match "ab***ef"', () => {
    expect_truthy(!isMatch('abd', 'ab***ef', { bash: true, windows: true }));
  });

  test('"abd" should not match "ab*+(e|f)"', () => {
    expect_truthy(!isMatch('abd', 'ab*+(e|f)', { bash: true, windows: true }));
  });

  test('"abd" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('abd', 'ab*d+(e|f)', { bash: true, windows: true }));
  });

  test('"abd" should match "ab?*(e|f)"', () => {
    expect_truthy(isMatch('abd', 'ab?*(e|f)', { bash: true, windows: true }));
  });

  test('"abef" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('abef', '(a+|b)*', { bash: true, windows: true }));
  });

  test('"abef" should not match "(a+|b)+"', () => {
    expect_truthy(!isMatch('abef', '(a+|b)+', { bash: true, windows: true }));
  });

  test('"abef" should not match "*(a+|b)"', () => {
    expect_truthy(!isMatch('abef', '*(a+|b)', { bash: true, windows: true }));
  });

  test('"abef" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('abef', '*?(a)bc', { bash: true, windows: true }));
  });

  test('"abef" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('abef', 'a(b*(foo|bar))d', { bash: true, windows: true }));
  });

  test('"abef" should match "ab*(e|f)"', () => {
    expect_truthy(isMatch('abef', 'ab*(e|f)', { bash: true, windows: true }));
  });

  test('"abef" should match "ab**"', () => {
    expect_truthy(isMatch('abef', 'ab**', { bash: true, windows: true }));
  });

  test('"abef" should match "ab**(e|f)"', () => {
    expect_truthy(isMatch('abef', 'ab**(e|f)', { bash: true, windows: true }));
  });

  test('"abef" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('abef', 'ab**(e|f)g', { bash: true, windows: true }));
  });

  test('"abef" should match "ab***ef"', () => {
    expect_truthy(isMatch('abef', 'ab***ef', { bash: true, windows: true }));
  });

  test('"abef" should match "ab*+(e|f)"', () => {
    expect_truthy(isMatch('abef', 'ab*+(e|f)', { bash: true, windows: true }));
  });

  test('"abef" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('abef', 'ab*d+(e|f)', { bash: true, windows: true }));
  });

  test('"abef" should match "ab?*(e|f)"', () => {
    expect_truthy(isMatch('abef', 'ab?*(e|f)', { bash: true, windows: true }));
  });

  test('"abz" should not match "a!(*)"', () => {
    expect_truthy(!isMatch('abz', 'a!(*)', { bash: true, windows: true }));
  });

  test('"abz" should match "a!(z)"', () => {
    expect_truthy(isMatch('abz', 'a!(z)', { bash: true, windows: true }));
  });

  test('"abz" should match "a*!(z)"', () => {
    expect_truthy(isMatch('abz', 'a*!(z)', { bash: true, windows: true }));
  });

  test('"abz" should not match "a*(z)"', () => {
    expect_truthy(!isMatch('abz', 'a*(z)', { bash: true, windows: true }));
  });

  test('"abz" should match "a**(z)"', () => {
    expect_truthy(isMatch('abz', 'a**(z)', { bash: true, windows: true }));
  });

  test('"abz" should match "a*@(z)"', () => {
    expect_truthy(isMatch('abz', 'a*@(z)', { bash: true, windows: true }));
  });

  test('"abz" should not match "a+(z)"', () => {
    expect_truthy(!isMatch('abz', 'a+(z)', { bash: true, windows: true }));
  });

  test('"abz" should not match "a?(z)"', () => {
    expect_truthy(!isMatch('abz', 'a?(z)', { bash: true, windows: true }));
  });

  test('"abz" should not match "a@(z)"', () => {
    expect_truthy(!isMatch('abz', 'a@(z)', { bash: true, windows: true }));
  });

  test('"ac" should not match "!(a)*"', () => {
    expect_truthy(!isMatch('ac', '!(a)*', { bash: true, windows: true }));
  });

  test('"ac" should match "*(@(a))a@(c)"', () => {
    expect_truthy(isMatch('ac', '*(@(a))a@(c)', { bash: true, windows: true }));
  });

  test('"ac" should match "a!(*(b|B))"', () => {
    expect_truthy(isMatch('ac', 'a!(*(b|B))', { bash: true, windows: true }));
  });

  test('"ac" should match "a!(@(b|B))"', () => {
    expect_truthy(isMatch('ac', 'a!(@(b|B))', { bash: true, windows: true }));
  });

  test('"ac" should match "a!(b)*"', () => {
    expect_truthy(isMatch('ac', 'a!(b)*', { bash: true, windows: true }));
  });

  test('"accdef" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('accdef', '(a+|b)*', { bash: true, windows: true }));
  });

  test('"accdef" should not match "(a+|b)+"', () => {
    expect_truthy(!isMatch('accdef', '(a+|b)+', { bash: true, windows: true }));
  });

  test('"accdef" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('accdef', '*?(a)bc', { bash: true, windows: true }));
  });

  test('"accdef" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('accdef', 'a(b*(foo|bar))d', { bash: true, windows: true }));
  });

  test('"accdef" should not match "ab*(e|f)"', () => {
    expect_truthy(!isMatch('accdef', 'ab*(e|f)', { bash: true, windows: true }));
  });

  test('"accdef" should not match "ab**"', () => {
    expect_truthy(!isMatch('accdef', 'ab**', { bash: true, windows: true }));
  });

  test('"accdef" should not match "ab**(e|f)"', () => {
    expect_truthy(!isMatch('accdef', 'ab**(e|f)', { bash: true, windows: true }));
  });

  test('"accdef" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('accdef', 'ab**(e|f)g', { bash: true, windows: true }));
  });

  test('"accdef" should not match "ab***ef"', () => {
    expect_truthy(!isMatch('accdef', 'ab***ef', { bash: true, windows: true }));
  });

  test('"accdef" should not match "ab*+(e|f)"', () => {
    expect_truthy(!isMatch('accdef', 'ab*+(e|f)', { bash: true, windows: true }));
  });

  test('"accdef" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('accdef', 'ab*d+(e|f)', { bash: true, windows: true }));
  });

  test('"accdef" should not match "ab?*(e|f)"', () => {
    expect_truthy(!isMatch('accdef', 'ab?*(e|f)', { bash: true, windows: true }));
  });

  test('"acd" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('acd', '(a+|b)*', { bash: true, windows: true }));
  });

  test('"acd" should not match "(a+|b)+"', () => {
    expect_truthy(!isMatch('acd', '(a+|b)+', { bash: true, windows: true }));
  });

  test('"acd" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('acd', '*?(a)bc', { bash: true, windows: true }));
  });

  test('"acd" should match "@(ab|a*(b))*(c)d"', () => {
    expect_truthy(isMatch('acd', '@(ab|a*(b))*(c)d', { bash: true, windows: true }));
  });

  test('"acd" should match "a!(*(b|B))"', () => {
    expect_truthy(isMatch('acd', 'a!(*(b|B))', { bash: true, windows: true }));
  });

  test('"acd" should match "a!(@(b|B))"', () => {
    expect_truthy(isMatch('acd', 'a!(@(b|B))', { bash: true, windows: true }));
  });

  test('"acd" should match "a!(@(b|B))d"', () => {
    expect_truthy(isMatch('acd', 'a!(@(b|B))d', { bash: true, windows: true }));
  });

  test('"acd" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('acd', 'a(b*(foo|bar))d', { bash: true, windows: true }));
  });

  test('"acd" should match "a+(b|c)d"', () => {
    expect_truthy(isMatch('acd', 'a+(b|c)d', { bash: true, windows: true }));
  });

  test('"acd" should not match "a[b*(foo|bar)]d"', () => {
    expect_truthy(!isMatch('acd', 'a[b*(foo|bar)]d', { bash: true, windows: true }));
  });

  test('"acd" should not match "ab*(e|f)"', () => {
    expect_truthy(!isMatch('acd', 'ab*(e|f)', { bash: true, windows: true }));
  });

  test('"acd" should not match "ab**"', () => {
    expect_truthy(!isMatch('acd', 'ab**', { bash: true, windows: true }));
  });

  test('"acd" should not match "ab**(e|f)"', () => {
    expect_truthy(!isMatch('acd', 'ab**(e|f)', { bash: true, windows: true }));
  });

  test('"acd" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('acd', 'ab**(e|f)g', { bash: true, windows: true }));
  });

  test('"acd" should not match "ab***ef"', () => {
    expect_truthy(!isMatch('acd', 'ab***ef', { bash: true, windows: true }));
  });

  test('"acd" should not match "ab*+(e|f)"', () => {
    expect_truthy(!isMatch('acd', 'ab*+(e|f)', { bash: true, windows: true }));
  });

  test('"acd" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('acd', 'ab*d+(e|f)', { bash: true, windows: true }));
  });

  test('"acd" should not match "ab?*(e|f)"', () => {
    expect_truthy(!isMatch('acd', 'ab?*(e|f)', { bash: true, windows: true }));
  });

  test('"ax" should match "?(a*|b)"', () => {
    expect_truthy(isMatch('ax', '?(a*|b)', { bash: true, windows: true }));
  });

  test('"ax" should not match "a?(b*)"', () => {
    expect_truthy(!isMatch('ax', 'a?(b*)', { bash: true, windows: true }));
  });

  test('"axz" should not match "a+(z)"', () => {
    expect_truthy(!isMatch('axz', 'a+(z)', { bash: true, windows: true }));
  });

  test('"az" should not match "a!(*)"', () => {
    expect_truthy(!isMatch('az', 'a!(*)', { bash: true, windows: true }));
  });

  test('"az" should not match "a!(z)"', () => {
    expect_truthy(!isMatch('az', 'a!(z)', { bash: true, windows: true }));
  });

  test('"az" should match "a*!(z)"', () => {
    expect_truthy(isMatch('az', 'a*!(z)', { bash: true, windows: true }));
  });

  test('"az" should match "a*(z)"', () => {
    expect_truthy(isMatch('az', 'a*(z)', { bash: true, windows: true }));
  });

  test('"az" should match "a**(z)"', () => {
    expect_truthy(isMatch('az', 'a**(z)', { bash: true, windows: true }));
  });

  test('"az" should match "a*@(z)"', () => {
    expect_truthy(isMatch('az', 'a*@(z)', { bash: true, windows: true }));
  });

  test('"az" should match "a+(z)"', () => {
    expect_truthy(isMatch('az', 'a+(z)', { bash: true, windows: true }));
  });

  test('"az" should match "a?(z)"', () => {
    expect_truthy(isMatch('az', 'a?(z)', { bash: true, windows: true }));
  });

  test('"az" should match "a@(z)"', () => {
    expect_truthy(isMatch('az', 'a@(z)', { bash: true, windows: true }));
  });

  test('"az" should not match "a\\z"', () => {
    expect_truthy(!isMatch('az', 'a\\\\z', { bash: true, windows: false }));
  });

  test('"az" should not match "a\\z"', () => {
    expect_truthy(!isMatch('az', 'a\\\\z', { bash: true, windows: true }));
  });

  test('"b" should match "!(a)*"', () => {
    expect_truthy(isMatch('b', '!(a)*', { bash: true, windows: true }));
  });

  test('"b" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('b', '(a+|b)*', { bash: true, windows: true }));
  });

  test('"b" should not match "a!(b)*"', () => {
    expect_truthy(!isMatch('b', 'a!(b)*', { bash: true, windows: true }));
  });

  test('"b.a" should match "(b|a).(a)"', () => {
    expect_truthy(isMatch('b.a', '(b|a).(a)', { bash: true, windows: true }));
  });

  test('"b.a" should match "@(b|a).@(a)"', () => {
    expect_truthy(isMatch('b.a', '@(b|a).@(a)', { bash: true, windows: true }));
  });

  test('"b/a" should not match "!(b/a)"', () => {
    expect_truthy(!isMatch('b/a', '!(b/a)', { bash: true, windows: true }));
  });

  test('"b/b" should match "!(b/a)"', () => {
    expect_truthy(isMatch('b/b', '!(b/a)', { bash: true, windows: true }));
  });

  test('"b/c" should match "!(b/a)"', () => {
    expect_truthy(isMatch('b/c', '!(b/a)', { bash: true, windows: true }));
  });

  test('"b/c" should not match "b/!(c)"', () => {
    expect_truthy(!isMatch('b/c', 'b/!(c)', { bash: true, windows: true }));
  });

  test('"b/c" should match "b/!(cc)"', () => {
    expect_truthy(isMatch('b/c', 'b/!(cc)', { bash: true, windows: true }));
  });

  test('"b/c.txt" should not match "b/!(c).txt"', () => {
    expect_truthy(!isMatch('b/c.txt', 'b/!(c).txt', { bash: true, windows: true }));
  });

  test('"b/c.txt" should match "b/!(cc).txt"', () => {
    expect_truthy(isMatch('b/c.txt', 'b/!(cc).txt', { bash: true, windows: true }));
  });

  test('"b/cc" should match "b/!(c)"', () => {
    expect_truthy(isMatch('b/cc', 'b/!(c)', { bash: true, windows: true }));
  });

  test('"b/cc" should not match "b/!(cc)"', () => {
    expect_truthy(!isMatch('b/cc', 'b/!(cc)', { bash: true, windows: true }));
  });

  test('"b/cc.txt" should not match "b/!(c).txt"', () => {
    expect_truthy(!isMatch('b/cc.txt', 'b/!(c).txt', { bash: true, windows: true }));
  });

  test('"b/cc.txt" should not match "b/!(cc).txt"', () => {
    expect_truthy(!isMatch('b/cc.txt', 'b/!(cc).txt', { bash: true, windows: true }));
  });

  test('"b/ccc" should match "b/!(c)"', () => {
    expect_truthy(isMatch('b/ccc', 'b/!(c)', { bash: true, windows: true }));
  });

  test('"ba" should match "!(a!(b))"', () => {
    expect_truthy(isMatch('ba', '!(a!(b))', { bash: true, windows: true }));
  });

  test('"ba" should match "b?(a|b)"', () => {
    expect_truthy(isMatch('ba', 'b?(a|b)', { bash: true, windows: true }));
  });

  test('"baaac" should not match "*(@(a))a@(c)"', () => {
    expect_truthy(!isMatch('baaac', '*(@(a))a@(c)', { bash: true, windows: true }));
  });

  test('"bar" should match "!(foo)"', () => {
    expect_truthy(isMatch('bar', '!(foo)', { bash: true, windows: true }));
  });

  test('"bar" should match "!(foo)*"', () => {
    expect_truthy(isMatch('bar', '!(foo)*', { bash: true, windows: true }));
  });

  test('"bar" should match "!(foo)b*"', () => {
    expect_truthy(isMatch('bar', '!(foo)b*', { bash: true, windows: true }));
  });

  test('"bar" should match "*(!(foo))"', () => {
    expect_truthy(isMatch('bar', '*(!(foo))', { bash: true, windows: true }));
  });

  test('"baz" should match "!(foo)*"', () => {
    expect_truthy(isMatch('baz', '!(foo)*', { bash: true, windows: true }));
  });

  test('"baz" should match "!(foo)b*"', () => {
    expect_truthy(isMatch('baz', '!(foo)b*', { bash: true, windows: true }));
  });

  test('"baz" should match "*(!(foo))"', () => {
    expect_truthy(isMatch('baz', '*(!(foo))', { bash: true, windows: true }));
  });

  test('"bb" should match "!(a!(b))"', () => {
    expect_truthy(isMatch('bb', '!(a!(b))', { bash: true, windows: true }));
  });

  test('"bb" should match "!(a)*"', () => {
    expect_truthy(isMatch('bb', '!(a)*', { bash: true, windows: true }));
  });

  test('"bb" should not match "a!(b)*"', () => {
    expect_truthy(!isMatch('bb', 'a!(b)*', { bash: true, windows: true }));
  });

  test('"bb" should not match "a?(a|b)"', () => {
    expect_truthy(!isMatch('bb', 'a?(a|b)', { bash: true, windows: true }));
  });

  test('"bbc" should match "!([[*])*"', () => {
    expect_truthy(isMatch('bbc', '!([[*])*', { bash: true, windows: true }));
  });

  test('"bbc" should not match "+(a|b\\[)*"', () => {
    expect_truthy(!isMatch('bbc', '+(a|b\\[)*', { bash: true, windows: true }));
  });

  test('"bbc" should not match "[a*(]*z"', () => {
    expect_truthy(!isMatch('bbc', '[a*(]*z', { bash: true, windows: true }));
  });

  test('"bz" should not match "a+(z)"', () => {
    expect_truthy(!isMatch('bz', 'a+(z)', { bash: true, windows: true }));
  });

  test('"c" should not match "*(@(a))a@(c)"', () => {
    expect_truthy(!isMatch('c', '*(@(a))a@(c)', { bash: true, windows: true }));
  });

  test('"c.a" should not match "!(*.[a-b]*)"', () => {
    expect_truthy(!isMatch('c.a', '!(*.[a-b]*)', { bash: true, windows: true }));
  });

  test('"c.a" should match "!(*[a-b].[a-b]*)"', () => {
    expect_truthy(isMatch('c.a', '!(*[a-b].[a-b]*)', { bash: true, windows: true }));
  });

  test('"c.a" should not match "!*.(a|b)"', () => {
    expect_truthy(!isMatch('c.a', '!*.(a|b)', { bash: true, windows: true }));
  });

  test('"c.a" should not match "!*.(a|b)*"', () => {
    expect_truthy(!isMatch('c.a', '!*.(a|b)*', { bash: true, windows: true }));
  });

  test('"c.a" should not match "(b|a).(a)"', () => {
    expect_truthy(!isMatch('c.a', '(b|a).(a)', { bash: true, windows: true }));
  });

  test('"c.a" should not match "*.!(a)"', () => {
    expect_truthy(!isMatch('c.a', '*.!(a)', { bash: true, windows: true }));
  });

  test('"c.a" should not match "*.+(b|d)"', () => {
    expect_truthy(!isMatch('c.a', '*.+(b|d)', { bash: true, windows: true }));
  });

  test('"c.a" should not match "@(b|a).@(a)"', () => {
    expect_truthy(!isMatch('c.a', '@(b|a).@(a)', { bash: true, windows: true }));
  });

  test('"c.c" should not match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(!isMatch('c.c', '!(*.a|*.b|*.c)', { bash: true, windows: true }));
  });

  test('"c.c" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('c.c', '*!(.a|.b|.c)', { bash: true, windows: true }));
  });

  test('"c.c" should not match "*.!(a|b|c)"', () => {
    expect_truthy(!isMatch('c.c', '*.!(a|b|c)', { bash: true, windows: true }));
  });

  test('"c.c" should not match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(!isMatch('c.c', '*.(a|b|@(ab|a*@(b))*(c)d)', { bash: true, windows: true }));
  });

  test('"c.ccc" should match "!(*.[a-b]*)"', () => {
    expect_truthy(isMatch('c.ccc', '!(*.[a-b]*)', { bash: true, windows: true }));
  });

  test('"c.ccc" should match "!(*[a-b].[a-b]*)"', () => {
    expect_truthy(isMatch('c.ccc', '!(*[a-b].[a-b]*)', { bash: true, windows: true }));
  });

  test('"c.js" should not match "!(*.js)"', () => {
    expect_truthy(!isMatch('c.js', '!(*.js)', { bash: true, windows: true }));
  });

  test('"c.js" should match "*!(.js)"', () => {
    expect_truthy(isMatch('c.js', '*!(.js)', { bash: true, windows: true }));
  });

  test('"c.js" should not match "*.!(js)"', () => {
    expect_truthy(!isMatch('c.js', '*.!(js)', { bash: true, windows: true }));
  });

  test('"c/a/v" should match "c/!(z)/v"', () => {
    expect_truthy(isMatch('c/a/v', 'c/!(z)/v', { bash: true, windows: true }));
  });

  test('"c/a/v" should not match "c/*(z)/v"', () => {
    expect_truthy(!isMatch('c/a/v', 'c/*(z)/v', { bash: true, windows: true }));
  });

  test('"c/a/v" should not match "c/+(z)/v"', () => {
    expect_truthy(!isMatch('c/a/v', 'c/+(z)/v', { bash: true, windows: true }));
  });

  test('"c/a/v" should not match "c/@(z)/v"', () => {
    expect_truthy(!isMatch('c/a/v', 'c/@(z)/v', { bash: true, windows: true }));
  });

  test('"c/z/v" should not match "*(z)"', () => {
    expect_truthy(!isMatch('c/z/v', '*(z)', { bash: true, windows: true }));
  });

  test('"c/z/v" should not match "+(z)"', () => {
    expect_truthy(!isMatch('c/z/v', '+(z)', { bash: true, windows: true }));
  });

  test('"c/z/v" should not match "?(z)"', () => {
    expect_truthy(!isMatch('c/z/v', '?(z)', { bash: true, windows: true }));
  });

  test('"c/z/v" should not match "c/!(z)/v"', () => {
    expect_truthy(!isMatch('c/z/v', 'c/!(z)/v', { bash: true, windows: true }));
  });

  test('"c/z/v" should match "c/*(z)/v"', () => {
    expect_truthy(isMatch('c/z/v', 'c/*(z)/v', { bash: true, windows: true }));
  });

  test('"c/z/v" should match "c/+(z)/v"', () => {
    expect_truthy(isMatch('c/z/v', 'c/+(z)/v', { bash: true, windows: true }));
  });

  test('"c/z/v" should match "c/@(z)/v"', () => {
    expect_truthy(isMatch('c/z/v', 'c/@(z)/v', { bash: true, windows: true }));
  });

  test('"c/z/v" should match "c/z/v"', () => {
    expect_truthy(isMatch('c/z/v', 'c/z/v', { bash: true, windows: true }));
  });

  test('"cc.a" should not match "(b|a).(a)"', () => {
    expect_truthy(!isMatch('cc.a', '(b|a).(a)', { bash: true, windows: true }));
  });

  test('"cc.a" should not match "@(b|a).@(a)"', () => {
    expect_truthy(!isMatch('cc.a', '@(b|a).@(a)', { bash: true, windows: true }));
  });

  test('"ccc" should match "!(a)*"', () => {
    expect_truthy(isMatch('ccc', '!(a)*', { bash: true, windows: true }));
  });

  test('"ccc" should not match "a!(b)*"', () => {
    expect_truthy(!isMatch('ccc', 'a!(b)*', { bash: true, windows: true }));
  });

  test('"cow" should match "!(*.*)"', () => {
    expect_truthy(isMatch('cow', '!(*.*)', { bash: true, windows: true }));
  });

  test('"cow" should not match "!(*.*)."', () => {
    expect_truthy(!isMatch('cow', '!(*.*).', { bash: true, windows: true }));
  });

  test('"cow" should not match ".!(*.*)"', () => {
    expect_truthy(!isMatch('cow', '.!(*.*)', { bash: true, windows: true }));
  });

  test('"cz" should not match "a!(*)"', () => {
    expect_truthy(!isMatch('cz', 'a!(*)', { bash: true, windows: true }));
  });

  test('"cz" should not match "a!(z)"', () => {
    expect_truthy(!isMatch('cz', 'a!(z)', { bash: true, windows: true }));
  });

  test('"cz" should not match "a*!(z)"', () => {
    expect_truthy(!isMatch('cz', 'a*!(z)', { bash: true, windows: true }));
  });

  test('"cz" should not match "a*(z)"', () => {
    expect_truthy(!isMatch('cz', 'a*(z)', { bash: true, windows: true }));
  });

  test('"cz" should not match "a**(z)"', () => {
    expect_truthy(!isMatch('cz', 'a**(z)', { bash: true, windows: true }));
  });

  test('"cz" should not match "a*@(z)"', () => {
    expect_truthy(!isMatch('cz', 'a*@(z)', { bash: true, windows: true }));
  });

  test('"cz" should not match "a+(z)"', () => {
    expect_truthy(!isMatch('cz', 'a+(z)', { bash: true, windows: true }));
  });

  test('"cz" should not match "a?(z)"', () => {
    expect_truthy(!isMatch('cz', 'a?(z)', { bash: true, windows: true }));
  });

  test('"cz" should not match "a@(z)"', () => {
    expect_truthy(!isMatch('cz', 'a@(z)', { bash: true, windows: true }));
  });

  test('"d.a.d" should not match "!(*.[a-b]*)"', () => {
    expect_truthy(!isMatch('d.a.d', '!(*.[a-b]*)', { bash: true, windows: true }));
  });

  test('"d.a.d" should match "!(*[a-b].[a-b]*)"', () => {
    expect_truthy(isMatch('d.a.d', '!(*[a-b].[a-b]*)', { bash: true, windows: true }));
  });

  test('"d.a.d" should not match "!*.(a|b)*"', () => {
    expect_truthy(!isMatch('d.a.d', '!*.(a|b)*', { bash: true, windows: true }));
  });

  test('"d.a.d" should match "!*.*(a|b)"', () => {
    expect_truthy(isMatch('d.a.d', '!*.*(a|b)', { bash: true, windows: true }));
  });

  test('"d.a.d" should not match "!*.{a,b}*"', () => {
    expect_truthy(!isMatch('d.a.d', '!*.{a,b}*', { bash: true, windows: true }));
  });

  test('"d.a.d" should match "*.!(a)"', () => {
    expect_truthy(isMatch('d.a.d', '*.!(a)', { bash: true, windows: true }));
  });

  test('"d.a.d" should match "*.+(b|d)"', () => {
    expect_truthy(isMatch('d.a.d', '*.+(b|d)', { bash: true, windows: true }));
  });

  test('"d.d" should match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(isMatch('d.d', '!(*.a|*.b|*.c)', { bash: true, windows: true }));
  });

  test('"d.d" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('d.d', '*!(.a|.b|.c)', { bash: true, windows: true }));
  });

  test('"d.d" should match "*.!(a|b|c)"', () => {
    expect_truthy(isMatch('d.d', '*.!(a|b|c)', { bash: true, windows: true }));
  });

  test('"d.d" should not match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(!isMatch('d.d', '*.(a|b|@(ab|a*@(b))*(c)d)', { bash: true, windows: true }));
  });

  test('"d.js.d" should match "!(*.js)"', () => {
    expect_truthy(isMatch('d.js.d', '!(*.js)', { bash: true, windows: true }));
  });

  test('"d.js.d" should match "*!(.js)"', () => {
    expect_truthy(isMatch('d.js.d', '*!(.js)', { bash: true, windows: true }));
  });

  test('"d.js.d" should match "*.!(js)"', () => {
    expect_truthy(isMatch('d.js.d', '*.!(js)', { bash: true, windows: true }));
  });

  test('"dd.aa.d" should not match "(b|a).(a)"', () => {
    expect_truthy(!isMatch('dd.aa.d', '(b|a).(a)', { bash: true, windows: true }));
  });

  test('"dd.aa.d" should not match "@(b|a).@(a)"', () => {
    expect_truthy(!isMatch('dd.aa.d', '@(b|a).@(a)', { bash: true, windows: true }));
  });

  test('"def" should not match "()ef"', () => {
    expect_truthy(!isMatch('def', '()ef', { bash: true, windows: true }));
  });

  test('"e.e" should match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(isMatch('e.e', '!(*.a|*.b|*.c)', { bash: true, windows: true }));
  });

  test('"e.e" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('e.e', '*!(.a|.b|.c)', { bash: true, windows: true }));
  });

  test('"e.e" should match "*.!(a|b|c)"', () => {
    expect_truthy(isMatch('e.e', '*.!(a|b|c)', { bash: true, windows: true }));
  });

  test('"e.e" should not match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(!isMatch('e.e', '*.(a|b|@(ab|a*@(b))*(c)d)', { bash: true, windows: true }));
  });

  test('"ef" should match "()ef"', () => {
    expect_truthy(isMatch('ef', '()ef', { bash: true, windows: true }));
  });

  test('"effgz" should match "@(b+(c)d|e*(f)g?|?(h)i@(j|k))"', () => {
    expect_truthy(isMatch('effgz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))', { bash: true, windows: true }));
  });

  test('"efgz" should match "@(b+(c)d|e*(f)g?|?(h)i@(j|k))"', () => {
    expect_truthy(isMatch('efgz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))', { bash: true, windows: true }));
  });

  test('"egz" should match "@(b+(c)d|e*(f)g?|?(h)i@(j|k))"', () => {
    expect_truthy(isMatch('egz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))', { bash: true, windows: true }));
  });

  test('"egz" should not match "@(b+(c)d|e+(f)g?|?(h)i@(j|k))"', () => {
    expect_truthy(!isMatch('egz', '@(b+(c)d|e+(f)g?|?(h)i@(j|k))', { bash: true, windows: true }));
  });

  test('"egzefffgzbcdij" should match "*(b+(c)d|e*(f)g?|?(h)i@(j|k))"', () => {
    expect_truthy(isMatch('egzefffgzbcdij', '*(b+(c)d|e*(f)g?|?(h)i@(j|k))', { bash: true, windows: true }));
  });

  test('"f" should not match "!(f!(o))"', () => {
    expect_truthy(!isMatch('f', '!(f!(o))', { bash: true, windows: true }));
  });

  test('"f" should match "!(f(o))"', () => {
    expect_truthy(isMatch('f', '!(f(o))', { bash: true, windows: true }));
  });

  test('"f" should not match "!(f)"', () => {
    expect_truthy(!isMatch('f', '!(f)', { bash: true, windows: true }));
  });

  test('"f" should not match "*(!(f))"', () => {
    expect_truthy(!isMatch('f', '*(!(f))', { bash: true, windows: true }));
  });

  test('"f" should not match "+(!(f))"', () => {
    expect_truthy(!isMatch('f', '+(!(f))', { bash: true, windows: true }));
  });

  test('"f.a" should not match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(!isMatch('f.a', '!(*.a|*.b|*.c)', { bash: true, windows: true }));
  });

  test('"f.a" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('f.a', '*!(.a|.b|.c)', { bash: true, windows: true }));
  });

  test('"f.a" should not match "*.!(a|b|c)"', () => {
    expect_truthy(!isMatch('f.a', '*.!(a|b|c)', { bash: true, windows: true }));
  });

  test('"f.f" should match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(isMatch('f.f', '!(*.a|*.b|*.c)', { bash: true, windows: true }));
  });

  test('"f.f" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('f.f', '*!(.a|.b|.c)', { bash: true, windows: true }));
  });

  test('"f.f" should match "*.!(a|b|c)"', () => {
    expect_truthy(isMatch('f.f', '*.!(a|b|c)', { bash: true, windows: true }));
  });

  test('"f.f" should not match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(!isMatch('f.f', '*.(a|b|@(ab|a*@(b))*(c)d)', { bash: true, windows: true }));
  });

  test('"fa" should not match "!(f!(o))"', () => {
    expect_truthy(!isMatch('fa', '!(f!(o))', { bash: true, windows: true }));
  });

  test('"fa" should match "!(f(o))"', () => {
    expect_truthy(isMatch('fa', '!(f(o))', { bash: true, windows: true }));
  });

  test('"fb" should not match "!(f!(o))"', () => {
    expect_truthy(!isMatch('fb', '!(f!(o))', { bash: true, windows: true }));
  });

  test('"fb" should match "!(f(o))"', () => {
    expect_truthy(isMatch('fb', '!(f(o))', { bash: true, windows: true }));
  });

  test('"fff" should match "!(f)"', () => {
    expect_truthy(isMatch('fff', '!(f)', { bash: true, windows: true }));
  });

  test('"fff" should match "*(!(f))"', () => {
    expect_truthy(isMatch('fff', '*(!(f))', { bash: true, windows: true }));
  });

  test('"fff" should match "+(!(f))"', () => {
    expect_truthy(isMatch('fff', '+(!(f))', { bash: true, windows: true }));
  });

  test('"fffooofoooooffoofffooofff" should match "*(*(f)*(o))"', () => {
    expect_truthy(isMatch('fffooofoooooffoofffooofff', '*(*(f)*(o))', { bash: true, windows: true }));
  });

  test('"ffo" should match "*(f*(o))"', () => {
    expect_truthy(isMatch('ffo', '*(f*(o))', { bash: true, windows: true }));
  });

  test('"file.C" should not match "*.c?(c)"', () => {
    expect_truthy(!isMatch('file.C', '*.c?(c)', { bash: true, windows: true }));
  });

  test('"file.c" should match "*.c?(c)"', () => {
    expect_truthy(isMatch('file.c', '*.c?(c)', { bash: true, windows: true }));
  });

  test('"file.cc" should match "*.c?(c)"', () => {
    expect_truthy(isMatch('file.cc', '*.c?(c)', { bash: true, windows: true }));
  });

  test('"file.ccc" should not match "*.c?(c)"', () => {
    expect_truthy(!isMatch('file.ccc', '*.c?(c)', { bash: true, windows: true }));
  });

  test('"fo" should match "!(f!(o))"', () => {
    expect_truthy(isMatch('fo', '!(f!(o))', { bash: true, windows: true }));
  });

  test('"fo" should not match "!(f(o))"', () => {
    expect_truthy(!isMatch('fo', '!(f(o))', { bash: true, windows: true }));
  });

  test('"fofo" should match "*(f*(o))"', () => {
    expect_truthy(isMatch('fofo', '*(f*(o))', { bash: true, windows: true }));
  });

  test('"fofoofoofofoo" should match "*(fo|foo)"', () => {
    expect_truthy(isMatch('fofoofoofofoo', '*(fo|foo)', { bash: true, windows: true }));
  });

  test('"fofoofoofofoo" should match "*(fo|foo)"', () => {
    expect_truthy(isMatch('fofoofoofofoo', '*(fo|foo)', { bash: true, windows: true }));
  });

  test('"foo" should match "!(!(foo))"', () => {
    expect_truthy(isMatch('foo', '!(!(foo))', { bash: true, windows: true }));
  });

  test('"foo" should match "!(f)"', () => {
    expect_truthy(isMatch('foo', '!(f)', { bash: true, windows: true }));
  });

  test('"foo" should not match "!(foo)"', () => {
    expect_truthy(!isMatch('foo', '!(foo)', { bash: true, windows: true }));
  });

  test('"foo" should not match "!(foo)*"', () => {
    expect_truthy(!isMatch('foo', '!(foo)*', { bash: true, windows: true }));
  });

  test('"foo" should not match "!(foo)*"', () => {
    expect_truthy(!isMatch('foo', '!(foo)*', { bash: true, windows: true }));
  });

  test('"foo" should not match "!(foo)+"', () => {
    expect_truthy(!isMatch('foo', '!(foo)+', { bash: true, windows: true }));
  });

  test('"foo" should not match "!(foo)b*"', () => {
    expect_truthy(!isMatch('foo', '!(foo)b*', { bash: true, windows: true }));
  });

  test('"foo" should match "!(x)"', () => {
    expect_truthy(isMatch('foo', '!(x)', { bash: true, windows: true }));
  });

  test('"foo" should match "!(x)*"', () => {
    expect_truthy(isMatch('foo', '!(x)*', { bash: true, windows: true }));
  });

  test('"foo" should match "*"', () => {
    expect_truthy(isMatch('foo', '*', { bash: true, windows: true }));
  });

  test('"foo" should match "*(!(f))"', () => {
    expect_truthy(isMatch('foo', '*(!(f))', { bash: true, windows: true }));
  });

  test('"foo" should not match "*(!(foo))"', () => {
    expect_truthy(!isMatch('foo', '*(!(foo))', { bash: true, windows: true }));
  });

  test('"foo" should not match "*(@(a))a@(c)"', () => {
    expect_truthy(!isMatch('foo', '*(@(a))a@(c)', { bash: true, windows: true }));
  });

  test('"foo" should match "*(@(foo))"', () => {
    expect_truthy(isMatch('foo', '*(@(foo))', { bash: true, windows: true }));
  });

  test('"foo" should not match "*(a|b\\[)"', () => {
    expect_truthy(!isMatch('foo', '*(a|b\\[)', { bash: true, windows: true }));
  });

  test('"foo" should match "*(a|b\\[)|f*"', () => {
    expect_truthy(isMatch('foo', '*(a|b\\[)|f*', { bash: true, windows: true }));
  });

  test('"foo" should match "@(*(a|b\\[)|f*)"', () => {
    expect_truthy(isMatch('foo', '@(*(a|b\\[)|f*)', { bash: true, windows: true }));
  });

  test('"foo" should not match "*/*/*"', () => {
    expect_truthy(!isMatch('foo', '*/*/*', { bash: true, windows: true }));
  });

  test('"foo" should not match "*f"', () => {
    expect_truthy(!isMatch('foo', '*f', { bash: true, windows: true }));
  });

  test('"foo" should match "*foo*"', () => {
    expect_truthy(isMatch('foo', '*foo*', { bash: true, windows: true }));
  });

  test('"foo" should match "+(!(f))"', () => {
    expect_truthy(isMatch('foo', '+(!(f))', { bash: true, windows: true }));
  });

  test('"foo" should not match "??"', () => {
    expect_truthy(!isMatch('foo', '??', { bash: true, windows: true }));
  });

  test('"foo" should match "???"', () => {
    expect_truthy(isMatch('foo', '???', { bash: true, windows: true }));
  });

  test('"foo" should not match "bar"', () => {
    expect_truthy(!isMatch('foo', 'bar', { bash: true, windows: true }));
  });

  test('"foo" should match "f*"', () => {
    expect_truthy(isMatch('foo', 'f*', { bash: true, windows: true }));
  });

  test('"foo" should not match "fo"', () => {
    expect_truthy(!isMatch('foo', 'fo', { bash: true, windows: true }));
  });

  test('"foo" should match "foo"', () => {
    expect_truthy(isMatch('foo', 'foo', { bash: true, windows: true }));
  });

  test('"foo" should match "{*(a|b\\[),f*}"', () => {
    expect_truthy(isMatch('foo', '{*(a|b\\[),f*}', { bash: true, windows: true }));
  });

  test('"foo*" should match "foo\\*"', () => {
    expect_truthy(isMatch('foo*', 'foo\\*', { bash: true, windows: false }));
  });

  test('"foo*bar" should match "foo\\*bar"', () => {
    expect_truthy(isMatch('foo*bar', 'foo\\*bar', { bash: true, windows: true }));
  });

  test('"foo.js" should not match "!(foo).js"', () => {
    expect_truthy(!isMatch('foo.js', '!(foo).js', { bash: true, windows: true }));
  });

  test('"foo.js.js" should match "*.!(js)"', () => {
    expect_truthy(isMatch('foo.js.js', '*.!(js)', { bash: true, windows: true }));
  });

  test('"foo.js.js" should not match "*.!(js)*"', () => {
    expect_truthy(!isMatch('foo.js.js', '*.!(js)*', { bash: true, windows: true }));
  });

  test('"foo.js.js" should not match "*.!(js)*.!(js)"', () => {
    expect_truthy(!isMatch('foo.js.js', '*.!(js)*.!(js)', { bash: true, windows: true }));
  });

  test('"foo.js.js" should not match "*.!(js)+"', () => {
    expect_truthy(!isMatch('foo.js.js', '*.!(js)+', { bash: true, windows: true }));
  });

  test('"foo.txt" should match "**/!(bar).txt"', () => {
    expect_truthy(isMatch('foo.txt', '**/!(bar).txt', { bash: true, windows: true }));
  });

  test('"foo/bar" should not match "*/*/*"', () => {
    expect_truthy(!isMatch('foo/bar', '*/*/*', { bash: true, windows: true }));
  });

  test('"foo/bar" should match "foo/!(foo)"', () => {
    expect_truthy(isMatch('foo/bar', 'foo/!(foo)', { bash: true, windows: true }));
  });

  test('"foo/bar" should match "foo/*"', () => {
    expect_truthy(isMatch('foo/bar', 'foo/*', { bash: true, windows: true }));
  });

  test('"foo/bar" should match "foo/bar"', () => {
    expect_truthy(isMatch('foo/bar', 'foo/bar', { bash: true, windows: true }));
  });

  test('"foo/bar" should not match "foo?bar"', () => {
    expect_truthy(!isMatch('foo/bar', 'foo?bar', { bash: true, windows: true }));
  });

  test('"foo/bar" should match "foo[/]bar"', () => {
    expect_truthy(isMatch('foo/bar', 'foo[/]bar', { bash: true, windows: true }));
  });

  test('"foo/bar/baz.jsx" should match "foo/bar/**/*.+(js|jsx)"', () => {
    expect_truthy(isMatch('foo/bar/baz.jsx', 'foo/bar/**/*.+(js|jsx)', { bash: true, windows: true }));
  });

  test('"foo/bar/baz.jsx" should match "foo/bar/*.+(js|jsx)"', () => {
    expect_truthy(isMatch('foo/bar/baz.jsx', 'foo/bar/*.+(js|jsx)', { bash: true, windows: true }));
  });

  test('"foo/bb/aa/rr" should match "**/**/**"', () => {
    expect_truthy(isMatch('foo/bb/aa/rr', '**/**/**', { bash: true, windows: true }));
  });

  test('"foo/bb/aa/rr" should match "*/*/*"', () => {
    expect_truthy(isMatch('foo/bb/aa/rr', '*/*/*', { bash: true, windows: true }));
  });

  test('"foo/bba/arr" should match "*/*/*"', () => {
    expect_truthy(isMatch('foo/bba/arr', '*/*/*', { bash: true, windows: true }));
  });

  test('"foo/bba/arr" should match "foo*"', () => {
    expect_truthy(isMatch('foo/bba/arr', 'foo*', { bash: true, windows: true }));
  });

  test('"foo/bba/arr" should match "foo**"', () => {
    expect_truthy(isMatch('foo/bba/arr', 'foo**', { bash: true, windows: true }));
  });

  test('"foo/bba/arr" should match "foo/*"', () => {
    expect_truthy(isMatch('foo/bba/arr', 'foo/*', { bash: true, windows: true }));
  });

  test('"foo/bba/arr" should match "foo/**"', () => {
    expect_truthy(isMatch('foo/bba/arr', 'foo/**', { bash: true, windows: true }));
  });

  test('"foo/bba/arr" should match "foo/**arr"', () => {
    expect_truthy(isMatch('foo/bba/arr', 'foo/**arr', { bash: true, windows: true }));
  });

  test('"foo/bba/arr" should not match "foo/**z"', () => {
    expect_truthy(!isMatch('foo/bba/arr', 'foo/**z', { bash: true, windows: true }));
  });

  test('"foo/bba/arr" should match "foo/*arr"', () => {
    expect_truthy(isMatch('foo/bba/arr', 'foo/*arr', { bash: true, windows: true }));
  });

  test('"foo/bba/arr" should not match "foo/*z"', () => {
    expect_truthy(!isMatch('foo/bba/arr', 'foo/*z', { bash: true, windows: true }));
  });

  test('"foob" should not match "!(foo)b*"', () => {
    expect_truthy(!isMatch('foob', '!(foo)b*', { bash: true, windows: true }));
  });

  test('"foob" should not match "(foo)bb"', () => {
    expect_truthy(!isMatch('foob', '(foo)bb', { bash: true, windows: true }));
  });

  test('"foobar" should match "!(foo)"', () => {
    expect_truthy(isMatch('foobar', '!(foo)', { bash: true, windows: true }));
  });

  test('"foobar" should not match "!(foo)*"', () => {
    expect_truthy(!isMatch('foobar', '!(foo)*', { bash: true, windows: true }));
  });

  test('"foobar" should not match "!(foo)*"', () => {
    expect_truthy(!isMatch('foobar', '!(foo)*', { bash: true, windows: true }));
  });

  test('"foobar" should not match "!(foo)b*"', () => {
    expect_truthy(!isMatch('foobar', '!(foo)b*', { bash: true, windows: true }));
  });

  test('"foobar" should match "*(!(foo))"', () => {
    expect_truthy(isMatch('foobar', '*(!(foo))', { bash: true, windows: true }));
  });

  test('"foobar" should match "*ob*a*r*"', () => {
    expect_truthy(isMatch('foobar', '*ob*a*r*', { bash: true, windows: true }));
  });

  test('"foobar" should match "foo\\*bar"', () => {
    expect_truthy(isMatch('foobar', 'foo*bar', { bash: true, windows: true }));
  });

  test('"foobb" should not match "!(foo)b*"', () => {
    expect_truthy(!isMatch('foobb', '!(foo)b*', { bash: true, windows: true }));
  });

  test('"foobb" should match "(foo)bb"', () => {
    expect_truthy(isMatch('foobb', '(foo)bb', { bash: true, windows: true }));
  });

  test('"(foo)bb" should match "\\(foo\\)bb"', () => {
    expect_truthy(isMatch('(foo)bb', '\\(foo\\)bb', { bash: true, windows: true }));
  });

  test('"foofoofo" should match "@(foo|f|fo)*(f|of+(o))"', () => {
    expect_truthy(isMatch('foofoofo', '@(foo|f|fo)*(f|of+(o))', { bash: true, windows: true }));
  });

  test('"foofoofo" should match "@(foo|f|fo)*(f|of+(o))"', () => {
    expect_truthy(isMatch('foofoofo', '@(foo|f|fo)*(f|of+(o))', { bash: true, windows: true }));
  });

  test('"fooofoofofooo" should match "*(f*(o))"', () => {
    expect_truthy(isMatch('fooofoofofooo', '*(f*(o))', { bash: true, windows: true }));
  });

  test('"foooofo" should match "*(f*(o))"', () => {
    expect_truthy(isMatch('foooofo', '*(f*(o))', { bash: true, windows: true }));
  });

  test('"foooofof" should match "*(f*(o))"', () => {
    expect_truthy(isMatch('foooofof', '*(f*(o))', { bash: true, windows: true }));
  });

  test('"foooofof" should not match "*(f+(o))"', () => {
    expect_truthy(!isMatch('foooofof', '*(f+(o))', { bash: true, windows: true }));
  });

  test('"foooofofx" should not match "*(f*(o))"', () => {
    expect_truthy(!isMatch('foooofofx', '*(f*(o))', { bash: true, windows: true }));
  });

  test('"foooxfooxfoxfooox" should match "*(f*(o)x)"', () => {
    expect_truthy(isMatch('foooxfooxfoxfooox', '*(f*(o)x)', { bash: true, windows: true }));
  });

  test('"foooxfooxfxfooox" should match "*(f*(o)x)"', () => {
    expect_truthy(isMatch('foooxfooxfxfooox', '*(f*(o)x)', { bash: true, windows: true }));
  });

  test('"foooxfooxofoxfooox" should not match "*(f*(o)x)"', () => {
    expect_truthy(!isMatch('foooxfooxofoxfooox', '*(f*(o)x)', { bash: true, windows: true }));
  });

  test('"foot" should match "@(!(z*)|*x)"', () => {
    expect_truthy(isMatch('foot', '@(!(z*)|*x)', { bash: true, windows: true }));
  });

  test('"foox" should match "@(!(z*)|*x)"', () => {
    expect_truthy(isMatch('foox', '@(!(z*)|*x)', { bash: true, windows: true }));
  });

  test('"fz" should not match "*(z)"', () => {
    expect_truthy(!isMatch('fz', '*(z)', { bash: true, windows: true }));
  });

  test('"fz" should not match "+(z)"', () => {
    expect_truthy(!isMatch('fz', '+(z)', { bash: true, windows: true }));
  });

  test('"fz" should not match "?(z)"', () => {
    expect_truthy(!isMatch('fz', '?(z)', { bash: true, windows: true }));
  });

  test('"moo.cow" should not match "!(moo).!(cow)"', () => {
    expect_truthy(!isMatch('moo.cow', '!(moo).!(cow)', { bash: true, windows: true }));
  });

  test('"moo.cow" should not match "!(*).!(*)"', () => {
    expect_truthy(!isMatch('moo.cow', '!(*).!(*)', { bash: true, windows: true }));
  });

  test('"moo.cow" should not match "!(*.*).!(*.*)"', () => {
    expect_truthy(!isMatch('moo.cow', '!(*.*).!(*.*)', { bash: true, windows: true }));
  });

  test('"mad.moo.cow" should not match "!(*.*).!(*.*)"', () => {
    expect_truthy(!isMatch('mad.moo.cow', '!(*.*).!(*.*)', { bash: true, windows: true }));
  });

  test('"mad.moo.cow" should not match ".!(*.*)"', () => {
    expect_truthy(!isMatch('mad.moo.cow', '.!(*.*)', { bash: true, windows: true }));
  });

  test('"Makefile" should match "!(*.c|*.h|Makefile.in|config*|README)"', () => {
    expect_truthy(isMatch('Makefile', '!(*.c|*.h|Makefile.in|config*|README)', { bash: true, windows: true }));
  });

  test('"Makefile.in" should not match "!(*.c|*.h|Makefile.in|config*|README)"', () => {
    expect_truthy(!isMatch('Makefile.in', '!(*.c|*.h|Makefile.in|config*|README)', { bash: true, windows: true }));
  });

  test('"moo" should match "!(*.*)"', () => {
    expect_truthy(isMatch('moo', '!(*.*)', { bash: true, windows: true }));
  });

  test('"moo" should not match "!(*.*)."', () => {
    expect_truthy(!isMatch('moo', '!(*.*).', { bash: true, windows: true }));
  });

  test('"moo" should not match ".!(*.*)"', () => {
    expect_truthy(!isMatch('moo', '.!(*.*)', { bash: true, windows: true }));
  });

  test('"moo.cow" should not match "!(*.*)"', () => {
    expect_truthy(!isMatch('moo.cow', '!(*.*)', { bash: true, windows: true }));
  });

  test('"moo.cow" should not match "!(*.*)."', () => {
    expect_truthy(!isMatch('moo.cow', '!(*.*).', { bash: true, windows: true }));
  });

  test('"moo.cow" should not match ".!(*.*)"', () => {
    expect_truthy(!isMatch('moo.cow', '.!(*.*)', { bash: true, windows: true }));
  });

  test('"mucca.pazza" should not match "mu!(*(c))?.pa!(*(z))?"', () => {
    expect_truthy(!isMatch('mucca.pazza', 'mu!(*(c))?.pa!(*(z))?', { bash: true, windows: true }));
  });

  test('"ofoofo" should match "*(of+(o))"', () => {
    expect_truthy(isMatch('ofoofo', '*(of+(o))', { bash: true, windows: true }));
  });

  test('"ofoofo" should match "*(of+(o)|f)"', () => {
    expect_truthy(isMatch('ofoofo', '*(of+(o)|f)', { bash: true, windows: true }));
  });

  test('"ofooofoofofooo" should not match "*(f*(o))"', () => {
    expect_truthy(!isMatch('ofooofoofofooo', '*(f*(o))', { bash: true, windows: true }));
  });

  test('"ofoooxoofxo" should match "*(*(of*(o)x)o)"', () => {
    expect_truthy(isMatch('ofoooxoofxo', '*(*(of*(o)x)o)', { bash: true, windows: true }));
  });

  test('"ofoooxoofxoofoooxoofxo" should match "*(*(of*(o)x)o)"', () => {
    expect_truthy(isMatch('ofoooxoofxoofoooxoofxo', '*(*(of*(o)x)o)', { bash: true, windows: true }));
  });

  test('"ofoooxoofxoofoooxoofxofo" should not match "*(*(of*(o)x)o)"', () => {
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxofo', '*(*(of*(o)x)o)', { bash: true, windows: true }));
  });

  test('"ofoooxoofxoofoooxoofxoo" should match "*(*(of*(o)x)o)"', () => {
    expect_truthy(isMatch('ofoooxoofxoofoooxoofxoo', '*(*(of*(o)x)o)', { bash: true, windows: true }));
  });

  test('"ofoooxoofxoofoooxoofxooofxofxo" should match "*(*(of*(o)x)o)"', () => {
    expect_truthy(isMatch('ofoooxoofxoofoooxoofxooofxofxo', '*(*(of*(o)x)o)', { bash: true, windows: true }));
  });

  test('"ofxoofxo" should match "*(*(of*(o)x)o)"', () => {
    expect_truthy(isMatch('ofxoofxo', '*(*(of*(o)x)o)', { bash: true, windows: true }));
  });

  test('"oofooofo" should match "*(of|oof+(o))"', () => {
    expect_truthy(isMatch('oofooofo', '*(of|oof+(o))', { bash: true, windows: true }));
  });

  test('"ooo" should match "!(f)"', () => {
    expect_truthy(isMatch('ooo', '!(f)', { bash: true, windows: true }));
  });

  test('"ooo" should match "*(!(f))"', () => {
    expect_truthy(isMatch('ooo', '*(!(f))', { bash: true, windows: true }));
  });

  test('"ooo" should match "+(!(f))"', () => {
    expect_truthy(isMatch('ooo', '+(!(f))', { bash: true, windows: true }));
  });

  test('"oxfoxfox" should not match "*(oxf+(ox))"', () => {
    expect_truthy(!isMatch('oxfoxfox', '*(oxf+(ox))', { bash: true, windows: true }));
  });

  test('"oxfoxoxfox" should match "*(oxf+(ox))"', () => {
    expect_truthy(isMatch('oxfoxoxfox', '*(oxf+(ox))', { bash: true, windows: true }));
  });

  test('"para" should match "para*([0-9])"', () => {
    expect_truthy(isMatch('para', 'para*([0-9])', { bash: true, windows: true }));
  });

  test('"para" should not match "para+([0-9])"', () => {
    expect_truthy(!isMatch('para', 'para+([0-9])', { bash: true, windows: true }));
  });

  test('"para.38" should match "para!(*.[00-09])"', () => {
    expect_truthy(isMatch('para.38', 'para!(*.[00-09])', { bash: true, windows: true }));
  });

  test('"para.graph" should match "para!(*.[0-9])"', () => {
    expect_truthy(isMatch('para.graph', 'para!(*.[0-9])', { bash: true, windows: true }));
  });

  test('"para13829383746592" should match "para*([0-9])"', () => {
    expect_truthy(isMatch('para13829383746592', 'para*([0-9])', { bash: true, windows: true }));
  });

  test('"para381" should not match "para?([345]|99)1"', () => {
    expect_truthy(!isMatch('para381', 'para?([345]|99)1', { bash: true, windows: true }));
  });

  test('"para39" should match "para!(*.[0-9])"', () => {
    expect_truthy(isMatch('para39', 'para!(*.[0-9])', { bash: true, windows: true }));
  });

  test('"para987346523" should match "para+([0-9])"', () => {
    expect_truthy(isMatch('para987346523', 'para+([0-9])', { bash: true, windows: true }));
  });

  test('"para991" should match "para?([345]|99)1"', () => {
    expect_truthy(isMatch('para991', 'para?([345]|99)1', { bash: true, windows: true }));
  });

  test('"paragraph" should match "para!(*.[0-9])"', () => {
    expect_truthy(isMatch('paragraph', 'para!(*.[0-9])', { bash: true, windows: true }));
  });

  test('"paragraph" should not match "para*([0-9])"', () => {
    expect_truthy(!isMatch('paragraph', 'para*([0-9])', { bash: true, windows: true }));
  });

  test('"paragraph" should match "para@(chute|graph)"', () => {
    expect_truthy(isMatch('paragraph', 'para@(chute|graph)', { bash: true, windows: true }));
  });

  test('"paramour" should not match "para@(chute|graph)"', () => {
    expect_truthy(!isMatch('paramour', 'para@(chute|graph)', { bash: true, windows: true }));
  });

  test('"parse.y" should match "!(*.c|*.h|Makefile.in|config*|README)"', () => {
    expect_truthy(isMatch('parse.y', '!(*.c|*.h|Makefile.in|config*|README)', { bash: true, windows: true }));
  });

  test('"shell.c" should not match "!(*.c|*.h|Makefile.in|config*|README)"', () => {
    expect_truthy(!isMatch('shell.c', '!(*.c|*.h|Makefile.in|config*|README)', { bash: true, windows: true }));
  });

  test('"VMS.FILE;" should not match "*\\;[1-9]*([0-9])"', () => {
    expect_truthy(!isMatch('VMS.FILE;', '*\\;[1-9]*([0-9])', { bash: true, windows: true }));
  });

  test('"VMS.FILE;0" should not match "*\\;[1-9]*([0-9])"', () => {
    expect_truthy(!isMatch('VMS.FILE;0', '*\\;[1-9]*([0-9])', { bash: true, windows: true }));
  });

  test('"VMS.FILE;9" should match "*\\;[1-9]*([0-9])"', () => {
    expect_truthy(isMatch('VMS.FILE;9', '*\\;[1-9]*([0-9])', { bash: true, windows: true }));
  });

  test('"VMS.FILE;1" should match "*\\;[1-9]*([0-9])"', () => {
    expect_truthy(isMatch('VMS.FILE;1', '*\\;[1-9]*([0-9])', { bash: true, windows: true }));
  });

  test('"VMS.FILE;1" should match "*;[1-9]*([0-9])"', () => {
    expect_truthy(isMatch('VMS.FILE;1', '*;[1-9]*([0-9])', { bash: true, windows: true }));
  });

  test('"VMS.FILE;139" should match "*\\;[1-9]*([0-9])"', () => {
    expect_truthy(isMatch('VMS.FILE;139', '*\\;[1-9]*([0-9])', { bash: true, windows: true }));
  });

  test('"VMS.FILE;1N" should not match "*\\;[1-9]*([0-9])"', () => {
    expect_truthy(!isMatch('VMS.FILE;1N', '*\\;[1-9]*([0-9])', { bash: true, windows: true }));
  });

  test('"xfoooofof" should not match "*(f*(o))"', () => {
    expect_truthy(!isMatch('xfoooofof', '*(f*(o))', { bash: true, windows: true }));
  });

  test('"XXX/adobe/courier/bold/o/normal//12/120/75/75/m/70/iso8859/1" should match "XXX/*/*/*/*/*/*/12/*/*/*/m/*/*/*"', () => {
    expect_truthy(isMatch('XXX/adobe/courier/bold/o/normal//12/120/75/75/m/70/iso8859/1', 'XXX/*/*/*/*/*/*/12/*/*/*/m/*/*/*', { bash: true, windows: false }));
  });

  test('"XXX/adobe/courier/bold/o/normal//12/120/75/75/X/70/iso8859/1" should not match "XXX/*/*/*/*/*/*/12/*/*/*/m/*/*/*"', () => {
    expect_truthy(!isMatch('XXX/adobe/courier/bold/o/normal//12/120/75/75/X/70/iso8859/1', 'XXX/*/*/*/*/*/*/12/*/*/*/m/*/*/*', { bash: true, windows: true }));
  });

  test('"z" should match "*(z)"', () => {
    expect_truthy(isMatch('z', '*(z)', { bash: true, windows: true }));
  });

  test('"z" should match "+(z)"', () => {
    expect_truthy(isMatch('z', '+(z)', { bash: true, windows: true }));
  });

  test('"z" should match "?(z)"', () => {
    expect_truthy(isMatch('z', '?(z)', { bash: true, windows: true }));
  });

  test('"zf" should not match "*(z)"', () => {
    expect_truthy(!isMatch('zf', '*(z)', { bash: true, windows: true }));
  });

  test('"zf" should not match "+(z)"', () => {
    expect_truthy(!isMatch('zf', '+(z)', { bash: true, windows: true }));
  });

  test('"zf" should not match "?(z)"', () => {
    expect_truthy(!isMatch('zf', '?(z)', { bash: true, windows: true }));
  });

  test('"zoot" should not match "@(!(z*)|*x)"', () => {
    expect_truthy(!isMatch('zoot', '@(!(z*)|*x)', { bash: true, windows: true }));
  });

  test('"zoox" should match "@(!(z*)|*x)"', () => {
    expect_truthy(isMatch('zoox', '@(!(z*)|*x)', { bash: true, windows: true }));
  });

  test('"zz" should not match "(a+|b)*"', () => {
    expect_truthy(!isMatch('zz', '(a+|b)*', { bash: true, windows: true }));
  });
});

