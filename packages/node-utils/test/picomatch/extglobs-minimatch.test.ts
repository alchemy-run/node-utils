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

/**
 * Some of tests were converted from bash 4.3, 4.4, and minimatch unit tests.
 */

describe('extglobs (minimatch)', () => {
  test('should not match empty string with "*(0|1|3|5|7|9)"', () => {
    expect_truthy(!isMatch('', '*(0|1|3|5|7|9)', { windows: true }));
  });

  test('"*(a|b[)" should not match "*(a|b\\[)"', () => {
    expect_truthy(!isMatch('*(a|b[)', '*(a|b\\[)', { windows: true }));
  });

  test('"*(a|b[)" should match "\\*\\(a\\|b\\[\\)"', () => {
    expect_truthy(isMatch('*(a|b[)', '\\*\\(a\\|b\\[\\)', { windows: true }));
  });

  test('"***" should match "\\*\\*\\*"', () => {
    expect_truthy(isMatch('***', '\\*\\*\\*', { windows: true }));
  });

  test('"-adobe-courier-bold-o-normal--12-120-75-75-/-70-iso8859-1" should not match "-*-*-*-*-*-*-12-*-*-*-m-*-*-*"', () => {
    expect_truthy(!isMatch('-adobe-courier-bold-o-normal--12-120-75-75-/-70-iso8859-1', '-*-*-*-*-*-*-12-*-*-*-m-*-*-*', { windows: true }));
  });

  test('"-adobe-courier-bold-o-normal--12-120-75-75-m-70-iso8859-1" should match "-*-*-*-*-*-*-12-*-*-*-m-*-*-*"', () => {
    expect_truthy(isMatch('-adobe-courier-bold-o-normal--12-120-75-75-m-70-iso8859-1', '-*-*-*-*-*-*-12-*-*-*-m-*-*-*', { windows: true }));
  });

  test('"-adobe-courier-bold-o-normal--12-120-75-75-X-70-iso8859-1" should not match "-*-*-*-*-*-*-12-*-*-*-m-*-*-*"', () => {
    expect_truthy(!isMatch('-adobe-courier-bold-o-normal--12-120-75-75-X-70-iso8859-1', '-*-*-*-*-*-*-12-*-*-*-m-*-*-*', { windows: true }));
  });

  test('"/dev/udp/129.22.8.102/45" should match "/dev\\/@(tcp|udp)\\/*\\/*"', () => {
    expect_truthy(isMatch('/dev/udp/129.22.8.102/45', '/dev\\/@(tcp|udp)\\/*\\/*', { windows: true }));
  });

  test('"/x/y/z" should match "/x/y/z"', () => {
    expect_truthy(isMatch('/x/y/z', '/x/y/z', { windows: true }));
  });

  test('"0377" should match "+([0-7])"', () => {
    expect_truthy(isMatch('0377', '+([0-7])', { windows: true }));
  });

  test('"07" should match "+([0-7])"', () => {
    expect_truthy(isMatch('07', '+([0-7])', { windows: true }));
  });

  test('"09" should not match "+([0-7])"', () => {
    expect_truthy(!isMatch('09', '+([0-7])', { windows: true }));
  });

  test('"1" should match "0|[1-9]*([0-9])"', () => {
    expect_truthy(isMatch('1', '0|[1-9]*([0-9])', { windows: true }));
  });

  test('"12" should match "0|[1-9]*([0-9])"', () => {
    expect_truthy(isMatch('12', '0|[1-9]*([0-9])', { windows: true }));
  });

  test('"123abc" should not match "(a+|b)*"', () => {
    expect_truthy(!isMatch('123abc', '(a+|b)*', { windows: true }));
  });

  test('"123abc" should not match "(a+|b)+"', () => {
    expect_truthy(!isMatch('123abc', '(a+|b)+', { windows: true }));
  });

  test('"123abc" should match "*?(a)bc"', () => {
    expect_truthy(isMatch('123abc', '*?(a)bc', { windows: true }));
  });

  test('"123abc" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('123abc', 'a(b*(foo|bar))d', { windows: true }));
  });

  test('"123abc" should not match "ab*(e|f)"', () => {
    expect_truthy(!isMatch('123abc', 'ab*(e|f)', { windows: true }));
  });

  test('"123abc" should not match "ab**"', () => {
    expect_truthy(!isMatch('123abc', 'ab**', { windows: true }));
  });

  test('"123abc" should not match "ab**(e|f)"', () => {
    expect_truthy(!isMatch('123abc', 'ab**(e|f)', { windows: true }));
  });

  test('"123abc" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('123abc', 'ab**(e|f)g', { windows: true }));
  });

  test('"123abc" should not match "ab***ef"', () => {
    expect_truthy(!isMatch('123abc', 'ab***ef', { windows: true }));
  });

  test('"123abc" should not match "ab*+(e|f)"', () => {
    expect_truthy(!isMatch('123abc', 'ab*+(e|f)', { windows: true }));
  });

  test('"123abc" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('123abc', 'ab*d+(e|f)', { windows: true }));
  });

  test('"123abc" should not match "ab?*(e|f)"', () => {
    expect_truthy(!isMatch('123abc', 'ab?*(e|f)', { windows: true }));
  });

  test('"12abc" should not match "0|[1-9]*([0-9])"', () => {
    expect_truthy(!isMatch('12abc', '0|[1-9]*([0-9])', { windows: true }));
  });

  test('"137577991" should match "*(0|1|3|5|7|9)"', () => {
    expect_truthy(isMatch('137577991', '*(0|1|3|5|7|9)', { windows: true }));
  });

  test('"2468" should not match "*(0|1|3|5|7|9)"', () => {
    expect_truthy(!isMatch('2468', '*(0|1|3|5|7|9)', { windows: true }));
  });

  test('"?a?b" should match "\\??\\?b"', () => {
    expect_truthy(isMatch('?a?b', '\\??\\?b', { windows: true }));
  });

  test('"\\a\\b\\c" should not match "abc"', () => {
    expect_truthy(!isMatch('\\a\\b\\c', 'abc', { windows: true }));
  });

  test('"a" should match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(isMatch('a', '!(*.a|*.b|*.c)', { windows: true }));
  });

  test('"a" should not match "!(a)"', () => {
    expect_truthy(!isMatch('a', '!(a)', { windows: true }));
  });

  test('"a" should not match "!(a)*"', () => {
    expect_truthy(!isMatch('a', '!(a)*', { windows: true }));
  });

  test('"a" should match "(a)"', () => {
    expect_truthy(isMatch('a', '(a)', { windows: true }));
  });

  test('"a" should not match "(b)"', () => {
    expect_truthy(!isMatch('a', '(b)', { windows: true }));
  });

  test('"a" should match "*(a)"', () => {
    expect_truthy(isMatch('a', '*(a)', { windows: true }));
  });

  test('"a" should match "+(a)"', () => {
    expect_truthy(isMatch('a', '+(a)', { windows: true }));
  });

  test('"a" should match "?"', () => {
    expect_truthy(isMatch('a', '?', { windows: true }));
  });

  test('"a" should match "?(a|b)"', () => {
    expect_truthy(isMatch('a', '?(a|b)', { windows: true }));
  });

  test('"a" should not match "??"', () => {
    expect_truthy(!isMatch('a', '??', { windows: true }));
  });

  test('"a" should match "a!(b)*"', () => {
    expect_truthy(isMatch('a', 'a!(b)*', { windows: true }));
  });

  test('"a" should match "a?(a|b)"', () => {
    expect_truthy(isMatch('a', 'a?(a|b)', { windows: true }));
  });

  test('"a" should match "a?(x)"', () => {
    expect_truthy(isMatch('a', 'a?(x)', { windows: true }));
  });

  test('"a" should not match "a??b"', () => {
    expect_truthy(!isMatch('a', 'a??b', { windows: true }));
  });

  test('"a" should not match "b?(a|b)"', () => {
    expect_truthy(!isMatch('a', 'b?(a|b)', { windows: true }));
  });

  test('"a((((b" should match "a(*b"', () => {
    expect_truthy(isMatch('a((((b', 'a(*b', { windows: true }));
  });

  test('"a((((b" should not match "a(b"', () => {
    expect_truthy(!isMatch('a((((b', 'a(b', { windows: true }));
  });

  test('"a((((b" should not match "a\\(b"', () => {
    expect_truthy(!isMatch('a((((b', 'a\\(b', { windows: true }));
  });

  test('"a((b" should match "a(*b"', () => {
    expect_truthy(isMatch('a((b', 'a(*b', { windows: true }));
  });

  test('"a((b" should not match "a(b"', () => {
    expect_truthy(!isMatch('a((b', 'a(b', { windows: true }));
  });

  test('"a((b" should not match "a\\(b"', () => {
    expect_truthy(!isMatch('a((b', 'a\\(b', { windows: true }));
  });

  test('"a(b" should match "a(*b"', () => {
    expect_truthy(isMatch('a(b', 'a(*b', { windows: true }));
  });

  test('"a(b" should match "a(b"', () => {
    expect_truthy(isMatch('a(b', 'a(b', { windows: true }));
  });

  test('"a(b" should match "a\\(b"', () => {
    expect_truthy(isMatch('a(b', 'a\\(b', { windows: true }));
  });

  test('"a." should match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(isMatch('a.', '!(*.a|*.b|*.c)', { windows: true }));
  });

  test('"a." should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('a.', '*!(.a|.b|.c)', { windows: true }));
  });

  test('"a." should match "*.!(a)"', () => {
    expect_truthy(isMatch('a.', '*.!(a)', { windows: true }));
  });

  test('"a." should match "*.!(a|b|c)"', () => {
    expect_truthy(isMatch('a.', '*.!(a|b|c)', { windows: true }));
  });

  test('"a." should not match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(!isMatch('a.', '*.(a|b|@(ab|a*@(b))*(c)d)', { windows: true }));
  });

  test('"a." should not match "*.+(b|d)"', () => {
    expect_truthy(!isMatch('a.', '*.+(b|d)', { windows: true }));
  });

  test('"a.a" should not match "!(*.[a-b]*)"', () => {
    expect_truthy(!isMatch('a.a', '!(*.[a-b]*)', { windows: true }));
  });

  test('"a.a" should not match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(!isMatch('a.a', '!(*.a|*.b|*.c)', { windows: true }));
  });

  test('"a.a" should not match "!(*[a-b].[a-b]*)"', () => {
    expect_truthy(!isMatch('a.a', '!(*[a-b].[a-b]*)', { windows: true }));
  });

  test('"a.a" should not match "!*.(a|b)"', () => {
    expect_truthy(!isMatch('a.a', '!*.(a|b)', { windows: true }));
  });

  test('"a.a" should not match "!*.(a|b)*"', () => {
    expect_truthy(!isMatch('a.a', '!*.(a|b)*', { windows: true }));
  });

  test('"a.a" should match "(a|d).(a|b)*"', () => {
    expect_truthy(isMatch('a.a', '(a|d).(a|b)*', { windows: true }));
  });

  test('"a.a" should match "(b|a).(a)"', () => {
    expect_truthy(isMatch('a.a', '(b|a).(a)', { windows: true }));
  });

  test('"a.a" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('a.a', '*!(.a|.b|.c)', { windows: true }));
  });

  test('"a.a" should not match "*.!(a)"', () => {
    expect_truthy(!isMatch('a.a', '*.!(a)', { windows: true }));
  });

  test('"a.a" should not match "*.!(a|b|c)"', () => {
    expect_truthy(!isMatch('a.a', '*.!(a|b|c)', { windows: true }));
  });

  test('"a.a" should match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(isMatch('a.a', '*.(a|b|@(ab|a*@(b))*(c)d)', { windows: true }));
  });

  test('"a.a" should not match "*.+(b|d)"', () => {
    expect_truthy(!isMatch('a.a', '*.+(b|d)', { windows: true }));
  });

  test('"a.a" should match "@(b|a).@(a)"', () => {
    expect_truthy(isMatch('a.a', '@(b|a).@(a)', { windows: true }));
  });

  test('"a.a.a" should not match "!(*.[a-b]*)"', () => {
    expect_truthy(!isMatch('a.a.a', '!(*.[a-b]*)', { windows: true }));
  });

  test('"a.a.a" should not match "!(*[a-b].[a-b]*)"', () => {
    expect_truthy(!isMatch('a.a.a', '!(*[a-b].[a-b]*)', { windows: true }));
  });

  test('"a.a.a" should not match "!*.(a|b)"', () => {
    expect_truthy(!isMatch('a.a.a', '!*.(a|b)', { windows: true }));
  });

  test('"a.a.a" should not match "!*.(a|b)*"', () => {
    expect_truthy(!isMatch('a.a.a', '!*.(a|b)*', { windows: true }));
  });

  test('"a.a.a" should match "*.!(a)"', () => {
    expect_truthy(isMatch('a.a.a', '*.!(a)', { windows: true }));
  });

  test('"a.a.a" should not match "*.+(b|d)"', () => {
    expect_truthy(!isMatch('a.a.a', '*.+(b|d)', { windows: true }));
  });

  test('"a.aa.a" should not match "(b|a).(a)"', () => {
    expect_truthy(!isMatch('a.aa.a', '(b|a).(a)', { windows: true }));
  });

  test('"a.aa.a" should not match "@(b|a).@(a)"', () => {
    expect_truthy(!isMatch('a.aa.a', '@(b|a).@(a)', { windows: true }));
  });

  test('"a.abcd" should match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(isMatch('a.abcd', '!(*.a|*.b|*.c)', { windows: true }));
  });

  test('"a.abcd" should not match "!(*.a|*.b|*.c)*"', () => {
    expect_truthy(!isMatch('a.abcd', '!(*.a|*.b|*.c)*', { windows: true }));
  });

  test('"a.abcd" should match "*!(*.a|*.b|*.c)*"', () => {
    expect_truthy(isMatch('a.abcd', '*!(*.a|*.b|*.c)*', { windows: true }));
  });

  test('"a.abcd" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('a.abcd', '*!(.a|.b|.c)', { windows: true }));
  });

  test('"a.abcd" should match "*.!(a|b|c)"', () => {
    expect_truthy(isMatch('a.abcd', '*.!(a|b|c)', { windows: true }));
  });

  test('"a.abcd" should not match "*.!(a|b|c)*"', () => {
    expect_truthy(!isMatch('a.abcd', '*.!(a|b|c)*', { windows: true }));
  });

  test('"a.abcd" should match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(isMatch('a.abcd', '*.(a|b|@(ab|a*@(b))*(c)d)', { windows: true }));
  });

  test('"a.b" should not match "!(*.*)"', () => {
    expect_truthy(!isMatch('a.b', '!(*.*)', { windows: true }));
  });

  test('"a.b" should not match "!(*.[a-b]*)"', () => {
    expect_truthy(!isMatch('a.b', '!(*.[a-b]*)', { windows: true }));
  });

  test('"a.b" should not match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(!isMatch('a.b', '!(*.a|*.b|*.c)', { windows: true }));
  });

  test('"a.b" should not match "!(*[a-b].[a-b]*)"', () => {
    expect_truthy(!isMatch('a.b', '!(*[a-b].[a-b]*)', { windows: true }));
  });

  test('"a.b" should not match "!*.(a|b)"', () => {
    expect_truthy(!isMatch('a.b', '!*.(a|b)', { windows: true }));
  });

  test('"a.b" should not match "!*.(a|b)*"', () => {
    expect_truthy(!isMatch('a.b', '!*.(a|b)*', { windows: true }));
  });

  test('"a.b" should match "(a|d).(a|b)*"', () => {
    expect_truthy(isMatch('a.b', '(a|d).(a|b)*', { windows: true }));
  });

  test('"a.b" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('a.b', '*!(.a|.b|.c)', { windows: true }));
  });

  test('"a.b" should match "*.!(a)"', () => {
    expect_truthy(isMatch('a.b', '*.!(a)', { windows: true }));
  });

  test('"a.b" should not match "*.!(a|b|c)"', () => {
    expect_truthy(!isMatch('a.b', '*.!(a|b|c)', { windows: true }));
  });

  test('"a.b" should match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(isMatch('a.b', '*.(a|b|@(ab|a*@(b))*(c)d)', { windows: true }));
  });

  test('"a.b" should match "*.+(b|d)"', () => {
    expect_truthy(isMatch('a.b', '*.+(b|d)', { windows: true }));
  });

  test('"a.bb" should not match "!(*.[a-b]*)"', () => {
    expect_truthy(!isMatch('a.bb', '!(*.[a-b]*)', { windows: true }));
  });

  test('"a.bb" should not match "!(*[a-b].[a-b]*)"', () => {
    expect_truthy(!isMatch('a.bb', '!(*[a-b].[a-b]*)', { windows: true }));
  });

  test('"a.bb" should match "!*.(a|b)"', () => {
    expect_truthy(isMatch('a.bb', '!*.(a|b)', { windows: true }));
  });

  test('"a.bb" should not match "!*.(a|b)*"', () => {
    expect_truthy(!isMatch('a.bb', '!*.(a|b)*', { windows: true }));
  });

  test('"a.bb" should not match "!*.*(a|b)"', () => {
    expect_truthy(!isMatch('a.bb', '!*.*(a|b)', { windows: true }));
  });

  test('"a.bb" should match "(a|d).(a|b)*"', () => {
    expect_truthy(isMatch('a.bb', '(a|d).(a|b)*', { windows: true }));
  });

  test('"a.bb" should not match "(b|a).(a)"', () => {
    expect_truthy(!isMatch('a.bb', '(b|a).(a)', { windows: true }));
  });

  test('"a.bb" should match "*.+(b|d)"', () => {
    expect_truthy(isMatch('a.bb', '*.+(b|d)', { windows: true }));
  });

  test('"a.bb" should not match "@(b|a).@(a)"', () => {
    expect_truthy(!isMatch('a.bb', '@(b|a).@(a)', { windows: true }));
  });

  test('"a.c" should not match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(!isMatch('a.c', '!(*.a|*.b|*.c)', { windows: true }));
  });

  test('"a.c" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('a.c', '*!(.a|.b|.c)', { windows: true }));
  });

  test('"a.c" should not match "*.!(a|b|c)"', () => {
    expect_truthy(!isMatch('a.c', '*.!(a|b|c)', { windows: true }));
  });

  test('"a.c" should not match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(!isMatch('a.c', '*.(a|b|@(ab|a*@(b))*(c)d)', { windows: true }));
  });

  test('"a.c.d" should match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(isMatch('a.c.d', '!(*.a|*.b|*.c)', { windows: true }));
  });

  test('"a.c.d" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('a.c.d', '*!(.a|.b|.c)', { windows: true }));
  });

  test('"a.c.d" should match "*.!(a|b|c)"', () => {
    expect_truthy(isMatch('a.c.d', '*.!(a|b|c)', { windows: true }));
  });

  test('"a.c.d" should not match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(!isMatch('a.c.d', '*.(a|b|@(ab|a*@(b))*(c)d)', { windows: true }));
  });

  test('"a.ccc" should match "!(*.[a-b]*)"', () => {
    expect_truthy(isMatch('a.ccc', '!(*.[a-b]*)', { windows: true }));
  });

  test('"a.ccc" should match "!(*[a-b].[a-b]*)"', () => {
    expect_truthy(isMatch('a.ccc', '!(*[a-b].[a-b]*)', { windows: true }));
  });

  test('"a.ccc" should match "!*.(a|b)"', () => {
    expect_truthy(isMatch('a.ccc', '!*.(a|b)', { windows: true }));
  });

  test('"a.ccc" should match "!*.(a|b)*"', () => {
    expect_truthy(isMatch('a.ccc', '!*.(a|b)*', { windows: true }));
  });

  test('"a.ccc" should not match "*.+(b|d)"', () => {
    expect_truthy(!isMatch('a.ccc', '*.+(b|d)', { windows: true }));
  });

  test('"a.js" should not match "!(*.js)"', () => {
    expect_truthy(!isMatch('a.js', '!(*.js)', { windows: true }));
  });

  test('"a.js" should match "*!(.js)"', () => {
    expect_truthy(isMatch('a.js', '*!(.js)', { windows: true }));
  });

  test('"a.js" should not match "*.!(js)"', () => {
    expect_truthy(!isMatch('a.js', '*.!(js)', { windows: true }));
  });

  test('"a.js" should not match "a.!(js)"', () => {
    expect_truthy(!isMatch('a.js', 'a.!(js)', { windows: true }));
  });

  test('"a.js" should not match "a.!(js)*"', () => {
    expect_truthy(!isMatch('a.js', 'a.!(js)*', { windows: true }));
  });

  test('"a.js.js" should not match "!(*.js)"', () => {
    expect_truthy(!isMatch('a.js.js', '!(*.js)', { windows: true }));
  });

  test('"a.js.js" should match "*!(.js)"', () => {
    expect_truthy(isMatch('a.js.js', '*!(.js)', { windows: true }));
  });

  test('"a.js.js" should match "*.!(js)"', () => {
    expect_truthy(isMatch('a.js.js', '*.!(js)', { windows: true }));
  });

  test('"a.js.js" should match "*.*(js).js"', () => {
    expect_truthy(isMatch('a.js.js', '*.*(js).js', { windows: true }));
  });

  test('"a.md" should match "!(*.js)"', () => {
    expect_truthy(isMatch('a.md', '!(*.js)', { windows: true }));
  });

  test('"a.md" should match "*!(.js)"', () => {
    expect_truthy(isMatch('a.md', '*!(.js)', { windows: true }));
  });

  test('"a.md" should match "*.!(js)"', () => {
    expect_truthy(isMatch('a.md', '*.!(js)', { windows: true }));
  });

  test('"a.md" should match "a.!(js)"', () => {
    expect_truthy(isMatch('a.md', 'a.!(js)', { windows: true }));
  });

  test('"a.md" should match "a.!(js)*"', () => {
    expect_truthy(isMatch('a.md', 'a.!(js)*', { windows: true }));
  });

  test('"a.md.js" should not match "*.*(js).js"', () => {
    expect_truthy(!isMatch('a.md.js', '*.*(js).js', { windows: true }));
  });

  test('"a.txt" should match "a.!(js)"', () => {
    expect_truthy(isMatch('a.txt', 'a.!(js)', { windows: true }));
  });

  test('"a.txt" should match "a.!(js)*"', () => {
    expect_truthy(isMatch('a.txt', 'a.!(js)*', { windows: true }));
  });

  test('"a/!(z)" should match "a/!(z)"', () => {
    expect_truthy(isMatch('a/!(z)', 'a/!(z)', { windows: true }));
  });

  test('"a/b" should match "a/!(z)"', () => {
    expect_truthy(isMatch('a/b', 'a/!(z)', { windows: true }));
  });

  test('"a/b/c.txt" should not match "*/b/!(*).txt"', () => {
    expect_truthy(!isMatch('a/b/c.txt', '*/b/!(*).txt', { windows: true }));
  });

  test('"a/b/c.txt" should not match "*/b/!(c).txt"', () => {
    expect_truthy(!isMatch('a/b/c.txt', '*/b/!(c).txt', { windows: true }));
  });

  test('"a/b/c.txt" should match "*/b/!(cc).txt"', () => {
    expect_truthy(isMatch('a/b/c.txt', '*/b/!(cc).txt', { windows: true }));
  });

  test('"a/b/cc.txt" should not match "*/b/!(*).txt"', () => {
    expect_truthy(!isMatch('a/b/cc.txt', '*/b/!(*).txt', { windows: true }));
  });

  test('"a/b/cc.txt" should not match "*/b/!(c).txt"', () => {
    expect_truthy(!isMatch('a/b/cc.txt', '*/b/!(c).txt', { windows: true }));
  });

  test('"a/b/cc.txt" should not match "*/b/!(cc).txt"', () => {
    expect_truthy(!isMatch('a/b/cc.txt', '*/b/!(cc).txt', { windows: true }));
  });

  test('"a/dir/foo.txt" should match "*/dir/**/!(bar).txt"', () => {
    expect_truthy(isMatch('a/dir/foo.txt', '*/dir/**/!(bar).txt', { windows: true }));
  });

  test('"a/z" should not match "a/!(z)"', () => {
    expect_truthy(!isMatch('a/z', 'a/!(z)', { windows: true }));
  });

  test('"a\\(b" should not match "a(*b"', () => {
    expect_truthy(!isMatch('a\\(b', 'a(*b', { windows: true }));
  });

  test('"a\\(b" should not match "a(b"', () => {
    expect_truthy(!isMatch('a\\(b', 'a(b', { windows: true }));
  });

  test('"a\\z" should match "a\\z"', () => {
    expect_truthy(isMatch('a\\\\z', 'a\\\\z', { windows: false }));
  });

  test('"a\\z" should match "a\\z"', () => {
    expect_truthy(isMatch('a\\\\z', 'a\\\\z', { windows: true }));
  });

  test('"a\\b" should match "a/b"', () => {
    expect_truthy(isMatch('a\\b', 'a/b', { windows: true }));
  });

  test('"a\\z" should match "a\\z"', () => {
    expect_truthy(isMatch('a\\z', 'a\\\\z', { windows: false }));
  });

  test('"a\\z" should not match "a\\z"', () => {
    expect_truthy(isMatch('a\\z', 'a\\z', { windows: true }));
  });

  test('"aa" should not match "!(a!(b))"', () => {
    expect_truthy(!isMatch('aa', '!(a!(b))', { windows: true }));
  });

  test('"aa" should match "!(a)"', () => {
    expect_truthy(isMatch('aa', '!(a)', { windows: true }));
  });

  test('"aa" should not match "!(a)*"', () => {
    expect_truthy(!isMatch('aa', '!(a)*', { windows: true }));
  });

  test('"aa" should not match "?"', () => {
    expect_truthy(!isMatch('aa', '?', { windows: true }));
  });

  test('"aa" should not match "@(a)b"', () => {
    expect_truthy(!isMatch('aa', '@(a)b', { windows: true }));
  });

  test('"aa" should match "a!(b)*"', () => {
    expect_truthy(isMatch('aa', 'a!(b)*', { windows: true }));
  });

  test('"aa" should not match "a??b"', () => {
    expect_truthy(!isMatch('aa', 'a??b', { windows: true }));
  });

  test('"aa.aa" should not match "(b|a).(a)"', () => {
    expect_truthy(!isMatch('aa.aa', '(b|a).(a)', { windows: true }));
  });

  test('"aa.aa" should not match "@(b|a).@(a)"', () => {
    expect_truthy(!isMatch('aa.aa', '@(b|a).@(a)', { windows: true }));
  });

  test('"aaa" should not match "!(a)*"', () => {
    expect_truthy(!isMatch('aaa', '!(a)*', { windows: true }));
  });

  test('"aaa" should match "a!(b)*"', () => {
    expect_truthy(isMatch('aaa', 'a!(b)*', { windows: true }));
  });

  test('"aaaaaaabababab" should match "*ab"', () => {
    expect_truthy(isMatch('aaaaaaabababab', '*ab', { windows: true }));
  });

  test('"aaac" should match "*(@(a))a@(c)"', () => {
    expect_truthy(isMatch('aaac', '*(@(a))a@(c)', { windows: true }));
  });

  test('"aaaz" should match "[a*(]*z"', () => {
    expect_truthy(isMatch('aaaz', '[a*(]*z', { windows: true }));
  });

  test('"aab" should not match "!(a)*"', () => {
    expect_truthy(!isMatch('aab', '!(a)*', { windows: true }));
  });

  test('"aab" should not match "?"', () => {
    expect_truthy(!isMatch('aab', '?', { windows: true }));
  });

  test('"aab" should not match "??"', () => {
    expect_truthy(!isMatch('aab', '??', { windows: true }));
  });

  test('"aab" should not match "@(c)b"', () => {
    expect_truthy(!isMatch('aab', '@(c)b', { windows: true }));
  });

  test('"aab" should match "a!(b)*"', () => {
    expect_truthy(isMatch('aab', 'a!(b)*', { windows: true }));
  });

  test('"aab" should not match "a??b"', () => {
    expect_truthy(!isMatch('aab', 'a??b', { windows: true }));
  });

  test('"aac" should match "*(@(a))a@(c)"', () => {
    expect_truthy(isMatch('aac', '*(@(a))a@(c)', { windows: true }));
  });

  test('"aac" should not match "*(@(a))b@(c)"', () => {
    expect_truthy(!isMatch('aac', '*(@(a))b@(c)', { windows: true }));
  });

  test('"aax" should not match "a!(a*|b)"', () => {
    expect_truthy(!isMatch('aax', 'a!(a*|b)', { windows: true }));
  });

  test('"aax" should match "a!(x*|b)"', () => {
    expect_truthy(isMatch('aax', 'a!(x*|b)', { windows: true }));
  });

  test('"aax" should match "a?(a*|b)"', () => {
    expect_truthy(isMatch('aax', 'a?(a*|b)', { windows: true }));
  });

  test('"aaz" should match "[a*(]*z"', () => {
    expect_truthy(isMatch('aaz', '[a*(]*z', { windows: true }));
  });

  test('"ab" should match "!(*.*)"', () => {
    expect_truthy(isMatch('ab', '!(*.*)', { windows: true }));
  });

  test('"ab" should match "!(a!(b))"', () => {
    expect_truthy(isMatch('ab', '!(a!(b))', { windows: true }));
  });

  test('"ab" should not match "!(a)*"', () => {
    expect_truthy(!isMatch('ab', '!(a)*', { windows: true }));
  });

  test('"ab" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('ab', '(a+|b)*', { windows: true }));
  });

  test('"ab" should match "(a+|b)+"', () => {
    expect_truthy(isMatch('ab', '(a+|b)+', { windows: true }));
  });

  test('"ab" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('ab', '*?(a)bc', { windows: true }));
  });

  test('"ab" should not match "a!(*(b|B))"', () => {
    expect_truthy(!isMatch('ab', 'a!(*(b|B))', { windows: true }));
  });

  test('"ab" should not match "a!(@(b|B))"', () => {
    expect_truthy(!isMatch('ab', 'a!(@(b|B))', { windows: true }));
  });

  test('"aB" should not match "a!(@(b|B))"', () => {
    expect_truthy(!isMatch('aB', 'a!(@(b|B))', { windows: true }));
  });

  test('"ab" should not match "a!(b)*"', () => {
    expect_truthy(!isMatch('ab', 'a!(b)*', { windows: true }));
  });

  test('"ab" should not match "a(*b"', () => {
    expect_truthy(!isMatch('ab', 'a(*b', { windows: true }));
  });

  test('"ab" should not match "a(b"', () => {
    expect_truthy(!isMatch('ab', 'a(b', { windows: true }));
  });

  test('"ab" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('ab', 'a(b*(foo|bar))d', { windows: true }));
  });

  test('"ab" should not match "a/b"', () => {
    expect_truthy(!isMatch('ab', 'a/b', { windows: true }));
  });

  test('"ab" should not match "a\\(b"', () => {
    expect_truthy(!isMatch('ab', 'a\\(b', { windows: true }));
  });

  test('"ab" should match "ab*(e|f)"', () => {
    expect_truthy(isMatch('ab', 'ab*(e|f)', { windows: true }));
  });

  test('"ab" should match "ab**"', () => {
    expect_truthy(isMatch('ab', 'ab**', { windows: true }));
  });

  test('"ab" should match "ab**(e|f)"', () => {
    expect_truthy(isMatch('ab', 'ab**(e|f)', { windows: true }));
  });

  test('"ab" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('ab', 'ab**(e|f)g', { windows: true }));
  });

  test('"ab" should not match "ab***ef"', () => {
    expect_truthy(!isMatch('ab', 'ab***ef', { windows: true }));
  });

  test('"ab" should not match "ab*+(e|f)"', () => {
    expect_truthy(!isMatch('ab', 'ab*+(e|f)', { windows: true }));
  });

  test('"ab" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('ab', 'ab*d+(e|f)', { windows: true }));
  });

  test('"ab" should not match "ab?*(e|f)"', () => {
    expect_truthy(!isMatch('ab', 'ab?*(e|f)', { windows: true }));
  });

  test('"ab/cXd/efXg/hi" should match "**/*X*/**/*i"', () => {
    expect_truthy(isMatch('ab/cXd/efXg/hi', '**/*X*/**/*i', { windows: true }));
  });

  test('"ab/cXd/efXg/hi" should match "*/*X*/*/*i"', () => {
    expect_truthy(isMatch('ab/cXd/efXg/hi', '*/*X*/*/*i', { windows: true }));
  });

  test('"ab/cXd/efXg/hi" should not match "*X*i"', () => {
    expect_truthy(!isMatch('ab/cXd/efXg/hi', '*X*i', { windows: true }));
  });

  test('"ab/cXd/efXg/hi" should not match "*Xg*i"', () => {
    expect_truthy(!isMatch('ab/cXd/efXg/hi', '*Xg*i', { windows: true }));
  });

  test('"ab]" should match "a!(@(b|B))"', () => {
    expect_truthy(isMatch('ab]', 'a!(@(b|B))', { windows: true }));
  });

  test('"abab" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('abab', '(a+|b)*', { windows: true }));
  });

  test('"abab" should match "(a+|b)+"', () => {
    expect_truthy(isMatch('abab', '(a+|b)+', { windows: true }));
  });

  test('"abab" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('abab', '*?(a)bc', { windows: true }));
  });

  test('"abab" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('abab', 'a(b*(foo|bar))d', { windows: true }));
  });

  test('"abab" should not match "ab*(e|f)"', () => {
    expect_truthy(!isMatch('abab', 'ab*(e|f)', { windows: true }));
  });

  test('"abab" should match "ab**"', () => {
    expect_truthy(isMatch('abab', 'ab**', { windows: true }));
  });

  test('"abab" should match "ab**(e|f)"', () => {
    expect_truthy(isMatch('abab', 'ab**(e|f)', { windows: true }));
  });

  test('"abab" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('abab', 'ab**(e|f)g', { windows: true }));
  });

  test('"abab" should not match "ab***ef"', () => {
    expect_truthy(!isMatch('abab', 'ab***ef', { windows: true }));
  });

  test('"abab" should not match "ab*+(e|f)"', () => {
    expect_truthy(!isMatch('abab', 'ab*+(e|f)', { windows: true }));
  });

  test('"abab" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('abab', 'ab*d+(e|f)', { windows: true }));
  });

  test('"abab" should not match "ab?*(e|f)"', () => {
    expect_truthy(!isMatch('abab', 'ab?*(e|f)', { windows: true }));
  });

  test('"abb" should match "!(*.*)"', () => {
    expect_truthy(isMatch('abb', '!(*.*)', { windows: true }));
  });

  test('"abb" should not match "!(a)*"', () => {
    expect_truthy(!isMatch('abb', '!(a)*', { windows: true }));
  });

  test('"abb" should not match "a!(b)*"', () => {
    expect_truthy(!isMatch('abb', 'a!(b)*', { windows: true }));
  });

  test('"abbcd" should match "@(ab|a*(b))*(c)d"', () => {
    expect_truthy(isMatch('abbcd', '@(ab|a*(b))*(c)d', { windows: true }));
  });

  test('"abc" should not match "\\a\\b\\c"', () => {
    expect_truthy(!isMatch('abc', '\\a\\b\\c', { windows: true }));
  });

  test('"aBc" should match "a!(@(b|B))"', () => {
    expect_truthy(isMatch('aBc', 'a!(@(b|B))', { windows: true }));
  });

  test('"abcd" should match "?@(a|b)*@(c)d"', () => {
    expect_truthy(isMatch('abcd', '?@(a|b)*@(c)d', { windows: true }));
  });

  test('"abcd" should match "@(ab|a*@(b))*(c)d"', () => {
    expect_truthy(isMatch('abcd', '@(ab|a*@(b))*(c)d', { windows: true }));
  });

  test('"abcd/abcdefg/abcdefghijk/abcdefghijklmnop.txt" should match "**/*a*b*g*n*t"', () => {
    expect_truthy(isMatch('abcd/abcdefg/abcdefghijk/abcdefghijklmnop.txt', '**/*a*b*g*n*t', { windows: true }));
  });

  test('"abcd/abcdefg/abcdefghijk/abcdefghijklmnop.txtz" should not match "**/*a*b*g*n*t"', () => {
    expect_truthy(!isMatch('abcd/abcdefg/abcdefghijk/abcdefghijklmnop.txtz', '**/*a*b*g*n*t', { windows: true }));
  });

  test('"abcdef" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('abcdef', '(a+|b)*', { windows: true }));
  });

  test('"abcdef" should not match "(a+|b)+"', () => {
    expect_truthy(!isMatch('abcdef', '(a+|b)+', { windows: true }));
  });

  test('"abcdef" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('abcdef', '*?(a)bc', { windows: true }));
  });

  test('"abcdef" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('abcdef', 'a(b*(foo|bar))d', { windows: true }));
  });

  test('"abcdef" should not match "ab*(e|f)"', () => {
    expect_truthy(!isMatch('abcdef', 'ab*(e|f)', { windows: true }));
  });

  test('"abcdef" should match "ab**"', () => {
    expect_truthy(isMatch('abcdef', 'ab**', { windows: true }));
  });

  test('"abcdef" should match "ab**(e|f)"', () => {
    expect_truthy(isMatch('abcdef', 'ab**(e|f)', { windows: true }));
  });

  test('"abcdef" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('abcdef', 'ab**(e|f)g', { windows: true }));
  });

  test('"abcdef" should match "ab***ef"', () => {
    expect_truthy(isMatch('abcdef', 'ab***ef', { windows: true }));
  });

  test('"abcdef" should match "ab*+(e|f)"', () => {
    expect_truthy(isMatch('abcdef', 'ab*+(e|f)', { windows: true }));
  });

  test('"abcdef" should match "ab*d+(e|f)"', () => {
    expect_truthy(isMatch('abcdef', 'ab*d+(e|f)', { windows: true }));
  });

  test('"abcdef" should not match "ab?*(e|f)"', () => {
    expect_truthy(!isMatch('abcdef', 'ab?*(e|f)', { windows: true }));
  });

  test('"abcfef" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('abcfef', '(a+|b)*', { windows: true }));
  });

  test('"abcfef" should not match "(a+|b)+"', () => {
    expect_truthy(!isMatch('abcfef', '(a+|b)+', { windows: true }));
  });

  test('"abcfef" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('abcfef', '*?(a)bc', { windows: true }));
  });

  test('"abcfef" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('abcfef', 'a(b*(foo|bar))d', { windows: true }));
  });

  test('"abcfef" should not match "ab*(e|f)"', () => {
    expect_truthy(!isMatch('abcfef', 'ab*(e|f)', { windows: true }));
  });

  test('"abcfef" should match "ab**"', () => {
    expect_truthy(isMatch('abcfef', 'ab**', { windows: true }));
  });

  test('"abcfef" should match "ab**(e|f)"', () => {
    expect_truthy(isMatch('abcfef', 'ab**(e|f)', { windows: true }));
  });

  test('"abcfef" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('abcfef', 'ab**(e|f)g', { windows: true }));
  });

  test('"abcfef" should match "ab***ef"', () => {
    expect_truthy(isMatch('abcfef', 'ab***ef', { windows: true }));
  });

  test('"abcfef" should match "ab*+(e|f)"', () => {
    expect_truthy(isMatch('abcfef', 'ab*+(e|f)', { windows: true }));
  });

  test('"abcfef" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('abcfef', 'ab*d+(e|f)', { windows: true }));
  });

  test('"abcfef" should match "ab?*(e|f)"', () => {
    expect_truthy(isMatch('abcfef', 'ab?*(e|f)', { windows: true }));
  });

  test('"abcfefg" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('abcfefg', '(a+|b)*', { windows: true }));
  });

  test('"abcfefg" should not match "(a+|b)+"', () => {
    expect_truthy(!isMatch('abcfefg', '(a+|b)+', { windows: true }));
  });

  test('"abcfefg" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('abcfefg', '*?(a)bc', { windows: true }));
  });

  test('"abcfefg" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('abcfefg', 'a(b*(foo|bar))d', { windows: true }));
  });

  test('"abcfefg" should not match "ab*(e|f)"', () => {
    expect_truthy(!isMatch('abcfefg', 'ab*(e|f)', { windows: true }));
  });

  test('"abcfefg" should match "ab**"', () => {
    expect_truthy(isMatch('abcfefg', 'ab**', { windows: true }));
  });

  test('"abcfefg" should match "ab**(e|f)"', () => {
    expect_truthy(isMatch('abcfefg', 'ab**(e|f)', { windows: true }));
  });

  test('"abcfefg" should match "ab**(e|f)g"', () => {
    expect_truthy(isMatch('abcfefg', 'ab**(e|f)g', { windows: true }));
  });

  test('"abcfefg" should not match "ab***ef"', () => {
    expect_truthy(!isMatch('abcfefg', 'ab***ef', { windows: true }));
  });

  test('"abcfefg" should not match "ab*+(e|f)"', () => {
    expect_truthy(!isMatch('abcfefg', 'ab*+(e|f)', { windows: true }));
  });

  test('"abcfefg" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('abcfefg', 'ab*d+(e|f)', { windows: true }));
  });

  test('"abcfefg" should not match "ab?*(e|f)"', () => {
    expect_truthy(!isMatch('abcfefg', 'ab?*(e|f)', { windows: true }));
  });

  test('"abcx" should match "!([[*])*"', () => {
    expect_truthy(isMatch('abcx', '!([[*])*', { windows: true }));
  });

  test('"abcx" should match "+(a|b\\[)*"', () => {
    expect_truthy(isMatch('abcx', '+(a|b\\[)*', { windows: true }));
  });

  test('"abcx" should not match "[a*(]*z"', () => {
    expect_truthy(!isMatch('abcx', '[a*(]*z', { windows: true }));
  });

  test('"abcXdefXghi" should match "*X*i"', () => {
    expect_truthy(isMatch('abcXdefXghi', '*X*i', { windows: true }));
  });

  test('"abcz" should match "!([[*])*"', () => {
    expect_truthy(isMatch('abcz', '!([[*])*', { windows: true }));
  });

  test('"abcz" should match "+(a|b\\[)*"', () => {
    expect_truthy(isMatch('abcz', '+(a|b\\[)*', { windows: true }));
  });

  test('"abcz" should match "[a*(]*z"', () => {
    expect_truthy(isMatch('abcz', '[a*(]*z', { windows: true }));
  });

  test('"abd" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('abd', '(a+|b)*', { windows: true }));
  });

  test('"abd" should not match "(a+|b)+"', () => {
    expect_truthy(!isMatch('abd', '(a+|b)+', { windows: true }));
  });

  test('"abd" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('abd', '*?(a)bc', { windows: true }));
  });

  test('"abd" should match "a!(*(b|B))"', () => {
    expect_truthy(isMatch('abd', 'a!(*(b|B))', { windows: true }));
  });

  test('"abd" should match "a!(@(b|B))"', () => {
    expect_truthy(isMatch('abd', 'a!(@(b|B))', { windows: true }));
  });

  test('"abd" should not match "a!(@(b|B))d"', () => {
    expect_truthy(!isMatch('abd', 'a!(@(b|B))d', { windows: true }));
  });

  test('"abd" should match "a(b*(foo|bar))d"', () => {
    expect_truthy(isMatch('abd', 'a(b*(foo|bar))d', { windows: true }));
  });

  test('"abd" should match "a+(b|c)d"', () => {
    expect_truthy(isMatch('abd', 'a+(b|c)d', { windows: true }));
  });

  test('"abd" should match "a[b*(foo|bar)]d"', () => {
    expect_truthy(isMatch('abd', 'a[b*(foo|bar)]d', { windows: true }));
  });

  test('"abd" should not match "ab*(e|f)"', () => {
    expect_truthy(!isMatch('abd', 'ab*(e|f)', { windows: true }));
  });

  test('"abd" should match "ab**"', () => {
    expect_truthy(isMatch('abd', 'ab**', { windows: true }));
  });

  test('"abd" should match "ab**(e|f)"', () => {
    expect_truthy(isMatch('abd', 'ab**(e|f)', { windows: true }));
  });

  test('"abd" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('abd', 'ab**(e|f)g', { windows: true }));
  });

  test('"abd" should not match "ab***ef"', () => {
    expect_truthy(!isMatch('abd', 'ab***ef', { windows: true }));
  });

  test('"abd" should not match "ab*+(e|f)"', () => {
    expect_truthy(!isMatch('abd', 'ab*+(e|f)', { windows: true }));
  });

  test('"abd" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('abd', 'ab*d+(e|f)', { windows: true }));
  });

  test('"abd" should match "ab?*(e|f)"', () => {
    expect_truthy(isMatch('abd', 'ab?*(e|f)', { windows: true }));
  });

  test('"abef" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('abef', '(a+|b)*', { windows: true }));
  });

  test('"abef" should not match "(a+|b)+"', () => {
    expect_truthy(!isMatch('abef', '(a+|b)+', { windows: true }));
  });

  test('"abef" should not match "*(a+|b)"', () => {
    expect_truthy(!isMatch('abef', '*(a+|b)', { windows: true }));
  });

  test('"abef" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('abef', '*?(a)bc', { windows: true }));
  });

  test('"abef" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('abef', 'a(b*(foo|bar))d', { windows: true }));
  });

  test('"abef" should match "ab*(e|f)"', () => {
    expect_truthy(isMatch('abef', 'ab*(e|f)', { windows: true }));
  });

  test('"abef" should match "ab**"', () => {
    expect_truthy(isMatch('abef', 'ab**', { windows: true }));
  });

  test('"abef" should match "ab**(e|f)"', () => {
    expect_truthy(isMatch('abef', 'ab**(e|f)', { windows: true }));
  });

  test('"abef" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('abef', 'ab**(e|f)g', { windows: true }));
  });

  test('"abef" should match "ab***ef"', () => {
    expect_truthy(isMatch('abef', 'ab***ef', { windows: true }));
  });

  test('"abef" should match "ab*+(e|f)"', () => {
    expect_truthy(isMatch('abef', 'ab*+(e|f)', { windows: true }));
  });

  test('"abef" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('abef', 'ab*d+(e|f)', { windows: true }));
  });

  test('"abef" should match "ab?*(e|f)"', () => {
    expect_truthy(isMatch('abef', 'ab?*(e|f)', { windows: true }));
  });

  test('"abz" should not match "a!(*)"', () => {
    expect_truthy(!isMatch('abz', 'a!(*)', { windows: true }));
  });

  test('"abz" should match "a!(z)"', () => {
    expect_truthy(isMatch('abz', 'a!(z)', { windows: true }));
  });

  test('"abz" should match "a*!(z)"', () => {
    expect_truthy(isMatch('abz', 'a*!(z)', { windows: true }));
  });

  test('"abz" should not match "a*(z)"', () => {
    expect_truthy(!isMatch('abz', 'a*(z)', { windows: true }));
  });

  test('"abz" should match "a**(z)"', () => {
    expect_truthy(isMatch('abz', 'a**(z)', { windows: true }));
  });

  test('"abz" should match "a*@(z)"', () => {
    expect_truthy(isMatch('abz', 'a*@(z)', { windows: true }));
  });

  test('"abz" should not match "a+(z)"', () => {
    expect_truthy(!isMatch('abz', 'a+(z)', { windows: true }));
  });

  test('"abz" should not match "a?(z)"', () => {
    expect_truthy(!isMatch('abz', 'a?(z)', { windows: true }));
  });

  test('"abz" should not match "a@(z)"', () => {
    expect_truthy(!isMatch('abz', 'a@(z)', { windows: true }));
  });

  test('"ac" should not match "!(a)*"', () => {
    expect_truthy(!isMatch('ac', '!(a)*', { windows: true }));
  });

  test('"ac" should match "*(@(a))a@(c)"', () => {
    expect_truthy(isMatch('ac', '*(@(a))a@(c)', { windows: true }));
  });

  test('"ac" should match "a!(*(b|B))"', () => {
    expect_truthy(isMatch('ac', 'a!(*(b|B))', { windows: true }));
  });

  test('"ac" should match "a!(@(b|B))"', () => {
    expect_truthy(isMatch('ac', 'a!(@(b|B))', { windows: true }));
  });

  test('"ac" should match "a!(b)*"', () => {
    expect_truthy(isMatch('ac', 'a!(b)*', { windows: true }));
  });

  test('"accdef" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('accdef', '(a+|b)*', { windows: true }));
  });

  test('"accdef" should not match "(a+|b)+"', () => {
    expect_truthy(!isMatch('accdef', '(a+|b)+', { windows: true }));
  });

  test('"accdef" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('accdef', '*?(a)bc', { windows: true }));
  });

  test('"accdef" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('accdef', 'a(b*(foo|bar))d', { windows: true }));
  });

  test('"accdef" should not match "ab*(e|f)"', () => {
    expect_truthy(!isMatch('accdef', 'ab*(e|f)', { windows: true }));
  });

  test('"accdef" should not match "ab**"', () => {
    expect_truthy(!isMatch('accdef', 'ab**', { windows: true }));
  });

  test('"accdef" should not match "ab**(e|f)"', () => {
    expect_truthy(!isMatch('accdef', 'ab**(e|f)', { windows: true }));
  });

  test('"accdef" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('accdef', 'ab**(e|f)g', { windows: true }));
  });

  test('"accdef" should not match "ab***ef"', () => {
    expect_truthy(!isMatch('accdef', 'ab***ef', { windows: true }));
  });

  test('"accdef" should not match "ab*+(e|f)"', () => {
    expect_truthy(!isMatch('accdef', 'ab*+(e|f)', { windows: true }));
  });

  test('"accdef" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('accdef', 'ab*d+(e|f)', { windows: true }));
  });

  test('"accdef" should not match "ab?*(e|f)"', () => {
    expect_truthy(!isMatch('accdef', 'ab?*(e|f)', { windows: true }));
  });

  test('"acd" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('acd', '(a+|b)*', { windows: true }));
  });

  test('"acd" should not match "(a+|b)+"', () => {
    expect_truthy(!isMatch('acd', '(a+|b)+', { windows: true }));
  });

  test('"acd" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('acd', '*?(a)bc', { windows: true }));
  });

  test('"acd" should match "@(ab|a*(b))*(c)d"', () => {
    expect_truthy(isMatch('acd', '@(ab|a*(b))*(c)d', { windows: true }));
  });

  test('"acd" should match "a!(*(b|B))"', () => {
    expect_truthy(isMatch('acd', 'a!(*(b|B))', { windows: true }));
  });

  test('"acd" should match "a!(@(b|B))"', () => {
    expect_truthy(isMatch('acd', 'a!(@(b|B))', { windows: true }));
  });

  test('"acd" should match "a!(@(b|B))d"', () => {
    expect_truthy(isMatch('acd', 'a!(@(b|B))d', { windows: true }));
  });

  test('"acd" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('acd', 'a(b*(foo|bar))d', { windows: true }));
  });

  test('"acd" should match "a+(b|c)d"', () => {
    expect_truthy(isMatch('acd', 'a+(b|c)d', { windows: true }));
  });

  test('"acd" should not match "a[b*(foo|bar)]d"', () => {
    expect_truthy(!isMatch('acd', 'a[b*(foo|bar)]d', { windows: true }));
  });

  test('"acd" should not match "ab*(e|f)"', () => {
    expect_truthy(!isMatch('acd', 'ab*(e|f)', { windows: true }));
  });

  test('"acd" should not match "ab**"', () => {
    expect_truthy(!isMatch('acd', 'ab**', { windows: true }));
  });

  test('"acd" should not match "ab**(e|f)"', () => {
    expect_truthy(!isMatch('acd', 'ab**(e|f)', { windows: true }));
  });

  test('"acd" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('acd', 'ab**(e|f)g', { windows: true }));
  });

  test('"acd" should not match "ab***ef"', () => {
    expect_truthy(!isMatch('acd', 'ab***ef', { windows: true }));
  });

  test('"acd" should not match "ab*+(e|f)"', () => {
    expect_truthy(!isMatch('acd', 'ab*+(e|f)', { windows: true }));
  });

  test('"acd" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('acd', 'ab*d+(e|f)', { windows: true }));
  });

  test('"acd" should not match "ab?*(e|f)"', () => {
    expect_truthy(!isMatch('acd', 'ab?*(e|f)', { windows: true }));
  });

  test('"axz" should not match "a+(z)"', () => {
    expect_truthy(!isMatch('axz', 'a+(z)', { windows: true }));
  });

  test('"az" should not match "a!(*)"', () => {
    expect_truthy(!isMatch('az', 'a!(*)', { windows: true }));
  });

  test('"az" should not match "a!(z)"', () => {
    expect_truthy(!isMatch('az', 'a!(z)', { windows: true }));
  });

  test('"az" should match "a*!(z)"', () => {
    expect_truthy(isMatch('az', 'a*!(z)', { windows: true }));
  });

  test('"az" should match "a*(z)"', () => {
    expect_truthy(isMatch('az', 'a*(z)', { windows: true }));
  });

  test('"az" should match "a**(z)"', () => {
    expect_truthy(isMatch('az', 'a**(z)', { windows: true }));
  });

  test('"az" should match "a*@(z)"', () => {
    expect_truthy(isMatch('az', 'a*@(z)', { windows: true }));
  });

  test('"az" should match "a+(z)"', () => {
    expect_truthy(isMatch('az', 'a+(z)', { windows: true }));
  });

  test('"az" should match "a?(z)"', () => {
    expect_truthy(isMatch('az', 'a?(z)', { windows: true }));
  });

  test('"az" should match "a@(z)"', () => {
    expect_truthy(isMatch('az', 'a@(z)', { windows: true }));
  });

  test('"az" should not match "a\\z"', () => {
    expect_truthy(!isMatch('az', 'a\\\\z', { windows: false }));
  });

  test('"az" should not match "a\\z"', () => {
    expect_truthy(!isMatch('az', 'a\\\\z', { windows: true }));
  });

  test('"b" should match "!(a)*"', () => {
    expect_truthy(isMatch('b', '!(a)*', { windows: true }));
  });

  test('"b" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('b', '(a+|b)*', { windows: true }));
  });

  test('"b" should not match "a!(b)*"', () => {
    expect_truthy(!isMatch('b', 'a!(b)*', { windows: true }));
  });

  test('"b.a" should match "(b|a).(a)"', () => {
    expect_truthy(isMatch('b.a', '(b|a).(a)', { windows: true }));
  });

  test('"b.a" should match "@(b|a).@(a)"', () => {
    expect_truthy(isMatch('b.a', '@(b|a).@(a)', { windows: true }));
  });

  test('"b/a" should not match "!(b/a)"', () => {
    expect_truthy(!isMatch('b/a', '!(b/a)', { windows: true }));
  });

  test('"b/b" should match "!(b/a)"', () => {
    expect_truthy(isMatch('b/b', '!(b/a)', { windows: true }));
  });

  test('"b/c" should match "!(b/a)"', () => {
    expect_truthy(isMatch('b/c', '!(b/a)', { windows: true }));
  });

  test('"b/c" should not match "b/!(c)"', () => {
    expect_truthy(!isMatch('b/c', 'b/!(c)', { windows: true }));
  });

  test('"b/c" should match "b/!(cc)"', () => {
    expect_truthy(isMatch('b/c', 'b/!(cc)', { windows: true }));
  });

  test('"b/c.txt" should not match "b/!(c).txt"', () => {
    expect_truthy(!isMatch('b/c.txt', 'b/!(c).txt', { windows: true }));
  });

  test('"b/c.txt" should match "b/!(cc).txt"', () => {
    expect_truthy(isMatch('b/c.txt', 'b/!(cc).txt', { windows: true }));
  });

  test('"b/cc" should match "b/!(c)"', () => {
    expect_truthy(isMatch('b/cc', 'b/!(c)', { windows: true }));
  });

  test('"b/cc" should not match "b/!(cc)"', () => {
    expect_truthy(!isMatch('b/cc', 'b/!(cc)', { windows: true }));
  });

  test('"b/cc.txt" should not match "b/!(c).txt"', () => {
    expect_truthy(!isMatch('b/cc.txt', 'b/!(c).txt', { windows: true }));
  });

  test('"b/cc.txt" should not match "b/!(cc).txt"', () => {
    expect_truthy(!isMatch('b/cc.txt', 'b/!(cc).txt', { windows: true }));
  });

  test('"b/ccc" should match "b/!(c)"', () => {
    expect_truthy(isMatch('b/ccc', 'b/!(c)', { windows: true }));
  });

  test('"ba" should match "!(a!(b))"', () => {
    expect_truthy(isMatch('ba', '!(a!(b))', { windows: true }));
  });

  test('"ba" should match "b?(a|b)"', () => {
    expect_truthy(isMatch('ba', 'b?(a|b)', { windows: true }));
  });

  test('"baaac" should not match "*(@(a))a@(c)"', () => {
    expect_truthy(!isMatch('baaac', '*(@(a))a@(c)', { windows: true }));
  });

  test('"bar" should match "!(foo)"', () => {
    expect_truthy(isMatch('bar', '!(foo)', { windows: true }));
  });

  test('"bar" should match "!(foo)*"', () => {
    expect_truthy(isMatch('bar', '!(foo)*', { windows: true }));
  });

  test('"bar" should match "!(foo)b*"', () => {
    expect_truthy(isMatch('bar', '!(foo)b*', { windows: true }));
  });

  test('"bar" should match "*(!(foo))"', () => {
    expect_truthy(isMatch('bar', '*(!(foo))', { windows: true }));
  });

  test('"baz" should match "!(foo)*"', () => {
    expect_truthy(isMatch('baz', '!(foo)*', { windows: true }));
  });

  test('"baz" should match "!(foo)b*"', () => {
    expect_truthy(isMatch('baz', '!(foo)b*', { windows: true }));
  });

  test('"baz" should match "*(!(foo))"', () => {
    expect_truthy(isMatch('baz', '*(!(foo))', { windows: true }));
  });

  test('"bb" should match "!(a!(b))"', () => {
    expect_truthy(isMatch('bb', '!(a!(b))', { windows: true }));
  });

  test('"bb" should match "!(a)*"', () => {
    expect_truthy(isMatch('bb', '!(a)*', { windows: true }));
  });

  test('"bb" should not match "a!(b)*"', () => {
    expect_truthy(!isMatch('bb', 'a!(b)*', { windows: true }));
  });

  test('"bb" should not match "a?(a|b)"', () => {
    expect_truthy(!isMatch('bb', 'a?(a|b)', { windows: true }));
  });

  test('"bbc" should match "!([[*])*"', () => {
    expect_truthy(isMatch('bbc', '!([[*])*', { windows: true }));
  });

  test('"bbc" should not match "+(a|b\\[)*"', () => {
    expect_truthy(!isMatch('bbc', '+(a|b\\[)*', { windows: true }));
  });

  test('"bbc" should not match "[a*(]*z"', () => {
    expect_truthy(!isMatch('bbc', '[a*(]*z', { windows: true }));
  });

  test('"bz" should not match "a+(z)"', () => {
    expect_truthy(!isMatch('bz', 'a+(z)', { windows: true }));
  });

  test('"c" should not match "*(@(a))a@(c)"', () => {
    expect_truthy(!isMatch('c', '*(@(a))a@(c)', { windows: true }));
  });

  test('"c.a" should not match "!(*.[a-b]*)"', () => {
    expect_truthy(!isMatch('c.a', '!(*.[a-b]*)', { windows: true }));
  });

  test('"c.a" should match "!(*[a-b].[a-b]*)"', () => {
    expect_truthy(isMatch('c.a', '!(*[a-b].[a-b]*)', { windows: true }));
  });

  test('"c.a" should not match "!*.(a|b)"', () => {
    expect_truthy(!isMatch('c.a', '!*.(a|b)', { windows: true }));
  });

  test('"c.a" should not match "!*.(a|b)*"', () => {
    expect_truthy(!isMatch('c.a', '!*.(a|b)*', { windows: true }));
  });

  test('"c.a" should not match "(b|a).(a)"', () => {
    expect_truthy(!isMatch('c.a', '(b|a).(a)', { windows: true }));
  });

  test('"c.a" should not match "*.!(a)"', () => {
    expect_truthy(!isMatch('c.a', '*.!(a)', { windows: true }));
  });

  test('"c.a" should not match "*.+(b|d)"', () => {
    expect_truthy(!isMatch('c.a', '*.+(b|d)', { windows: true }));
  });

  test('"c.a" should not match "@(b|a).@(a)"', () => {
    expect_truthy(!isMatch('c.a', '@(b|a).@(a)', { windows: true }));
  });

  test('"c.c" should not match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(!isMatch('c.c', '!(*.a|*.b|*.c)', { windows: true }));
  });

  test('"c.c" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('c.c', '*!(.a|.b|.c)', { windows: true }));
  });

  test('"c.c" should not match "*.!(a|b|c)"', () => {
    expect_truthy(!isMatch('c.c', '*.!(a|b|c)', { windows: true }));
  });

  test('"c.c" should not match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(!isMatch('c.c', '*.(a|b|@(ab|a*@(b))*(c)d)', { windows: true }));
  });

  test('"c.ccc" should match "!(*.[a-b]*)"', () => {
    expect_truthy(isMatch('c.ccc', '!(*.[a-b]*)', { windows: true }));
  });

  test('"c.ccc" should match "!(*[a-b].[a-b]*)"', () => {
    expect_truthy(isMatch('c.ccc', '!(*[a-b].[a-b]*)', { windows: true }));
  });

  test('"c.js" should not match "!(*.js)"', () => {
    expect_truthy(!isMatch('c.js', '!(*.js)', { windows: true }));
  });

  test('"c.js" should match "*!(.js)"', () => {
    expect_truthy(isMatch('c.js', '*!(.js)', { windows: true }));
  });

  test('"c.js" should not match "*.!(js)"', () => {
    expect_truthy(!isMatch('c.js', '*.!(js)', { windows: true }));
  });

  test('"c/a/v" should match "c/!(z)/v"', () => {
    expect_truthy(isMatch('c/a/v', 'c/!(z)/v', { windows: true }));
  });

  test('"c/a/v" should not match "c/*(z)/v"', () => {
    expect_truthy(!isMatch('c/a/v', 'c/*(z)/v', { windows: true }));
  });

  test('"c/a/v" should not match "c/+(z)/v"', () => {
    expect_truthy(!isMatch('c/a/v', 'c/+(z)/v', { windows: true }));
  });

  test('"c/a/v" should not match "c/@(z)/v"', () => {
    expect_truthy(!isMatch('c/a/v', 'c/@(z)/v', { windows: true }));
  });

  test('"c/z/v" should not match "*(z)"', () => {
    expect_truthy(!isMatch('c/z/v', '*(z)', { windows: true }));
  });

  test('"c/z/v" should not match "+(z)"', () => {
    expect_truthy(!isMatch('c/z/v', '+(z)', { windows: true }));
  });

  test('"c/z/v" should not match "?(z)"', () => {
    expect_truthy(!isMatch('c/z/v', '?(z)', { windows: true }));
  });

  test('"c/z/v" should not match "c/!(z)/v"', () => {
    expect_truthy(!isMatch('c/z/v', 'c/!(z)/v', { windows: true }));
  });

  test('"c/z/v" should match "c/*(z)/v"', () => {
    expect_truthy(isMatch('c/z/v', 'c/*(z)/v', { windows: true }));
  });

  test('"c/z/v" should match "c/+(z)/v"', () => {
    expect_truthy(isMatch('c/z/v', 'c/+(z)/v', { windows: true }));
  });

  test('"c/z/v" should match "c/@(z)/v"', () => {
    expect_truthy(isMatch('c/z/v', 'c/@(z)/v', { windows: true }));
  });

  test('"c/z/v" should match "c/z/v"', () => {
    expect_truthy(isMatch('c/z/v', 'c/z/v', { windows: true }));
  });

  test('"cc.a" should not match "(b|a).(a)"', () => {
    expect_truthy(!isMatch('cc.a', '(b|a).(a)', { windows: true }));
  });

  test('"cc.a" should not match "@(b|a).@(a)"', () => {
    expect_truthy(!isMatch('cc.a', '@(b|a).@(a)', { windows: true }));
  });

  test('"ccc" should match "!(a)*"', () => {
    expect_truthy(isMatch('ccc', '!(a)*', { windows: true }));
  });

  test('"ccc" should not match "a!(b)*"', () => {
    expect_truthy(!isMatch('ccc', 'a!(b)*', { windows: true }));
  });

  test('"cow" should match "!(*.*)"', () => {
    expect_truthy(isMatch('cow', '!(*.*)', { windows: true }));
  });

  test('"cow" should not match "!(*.*)."', () => {
    expect_truthy(!isMatch('cow', '!(*.*).', { windows: true }));
  });

  test('"cow" should not match ".!(*.*)"', () => {
    expect_truthy(!isMatch('cow', '.!(*.*)', { windows: true }));
  });

  test('"cz" should not match "a!(*)"', () => {
    expect_truthy(!isMatch('cz', 'a!(*)', { windows: true }));
  });

  test('"cz" should not match "a!(z)"', () => {
    expect_truthy(!isMatch('cz', 'a!(z)', { windows: true }));
  });

  test('"cz" should not match "a*!(z)"', () => {
    expect_truthy(!isMatch('cz', 'a*!(z)', { windows: true }));
  });

  test('"cz" should not match "a*(z)"', () => {
    expect_truthy(!isMatch('cz', 'a*(z)', { windows: true }));
  });

  test('"cz" should not match "a**(z)"', () => {
    expect_truthy(!isMatch('cz', 'a**(z)', { windows: true }));
  });

  test('"cz" should not match "a*@(z)"', () => {
    expect_truthy(!isMatch('cz', 'a*@(z)', { windows: true }));
  });

  test('"cz" should not match "a+(z)"', () => {
    expect_truthy(!isMatch('cz', 'a+(z)', { windows: true }));
  });

  test('"cz" should not match "a?(z)"', () => {
    expect_truthy(!isMatch('cz', 'a?(z)', { windows: true }));
  });

  test('"cz" should not match "a@(z)"', () => {
    expect_truthy(!isMatch('cz', 'a@(z)', { windows: true }));
  });

  test('"d.a.d" should not match "!(*.[a-b]*)"', () => {
    expect_truthy(!isMatch('d.a.d', '!(*.[a-b]*)', { windows: true }));
  });

  test('"d.a.d" should match "!(*[a-b].[a-b]*)"', () => {
    expect_truthy(isMatch('d.a.d', '!(*[a-b].[a-b]*)', { windows: true }));
  });

  test('"d.a.d" should not match "!*.(a|b)*"', () => {
    expect_truthy(!isMatch('d.a.d', '!*.(a|b)*', { windows: true }));
  });

  test('"d.a.d" should match "!*.*(a|b)"', () => {
    expect_truthy(isMatch('d.a.d', '!*.*(a|b)', { windows: true }));
  });

  test('"d.a.d" should not match "!*.{a,b}*"', () => {
    expect_truthy(!isMatch('d.a.d', '!*.{a,b}*', { windows: true }));
  });

  test('"d.a.d" should match "*.!(a)"', () => {
    expect_truthy(isMatch('d.a.d', '*.!(a)', { windows: true }));
  });

  test('"d.a.d" should match "*.+(b|d)"', () => {
    expect_truthy(isMatch('d.a.d', '*.+(b|d)', { windows: true }));
  });

  test('"d.d" should match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(isMatch('d.d', '!(*.a|*.b|*.c)', { windows: true }));
  });

  test('"d.d" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('d.d', '*!(.a|.b|.c)', { windows: true }));
  });

  test('"d.d" should match "*.!(a|b|c)"', () => {
    expect_truthy(isMatch('d.d', '*.!(a|b|c)', { windows: true }));
  });

  test('"d.d" should not match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(!isMatch('d.d', '*.(a|b|@(ab|a*@(b))*(c)d)', { windows: true }));
  });

  test('"d.js.d" should match "!(*.js)"', () => {
    expect_truthy(isMatch('d.js.d', '!(*.js)', { windows: true }));
  });

  test('"d.js.d" should match "*!(.js)"', () => {
    expect_truthy(isMatch('d.js.d', '*!(.js)', { windows: true }));
  });

  test('"d.js.d" should match "*.!(js)"', () => {
    expect_truthy(isMatch('d.js.d', '*.!(js)', { windows: true }));
  });

  test('"dd.aa.d" should not match "(b|a).(a)"', () => {
    expect_truthy(!isMatch('dd.aa.d', '(b|a).(a)', { windows: true }));
  });

  test('"dd.aa.d" should not match "@(b|a).@(a)"', () => {
    expect_truthy(!isMatch('dd.aa.d', '@(b|a).@(a)', { windows: true }));
  });

  test('"def" should not match "()ef"', () => {
    expect_truthy(!isMatch('def', '()ef', { windows: true }));
  });

  test('"e.e" should match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(isMatch('e.e', '!(*.a|*.b|*.c)', { windows: true }));
  });

  test('"e.e" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('e.e', '*!(.a|.b|.c)', { windows: true }));
  });

  test('"e.e" should match "*.!(a|b|c)"', () => {
    expect_truthy(isMatch('e.e', '*.!(a|b|c)', { windows: true }));
  });

  test('"e.e" should not match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(!isMatch('e.e', '*.(a|b|@(ab|a*@(b))*(c)d)', { windows: true }));
  });

  test('"ef" should match "()ef"', () => {
    expect_truthy(isMatch('ef', '()ef', { windows: true }));
  });

  test('"effgz" should match "@(b+(c)d|e*(f)g?|?(h)i@(j|k))"', () => {
    expect_truthy(isMatch('effgz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))', { windows: true }));
  });

  test('"efgz" should match "@(b+(c)d|e*(f)g?|?(h)i@(j|k))"', () => {
    expect_truthy(isMatch('efgz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))', { windows: true }));
  });

  test('"egz" should match "@(b+(c)d|e*(f)g?|?(h)i@(j|k))"', () => {
    expect_truthy(isMatch('egz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))', { windows: true }));
  });

  test('"egz" should not match "@(b+(c)d|e+(f)g?|?(h)i@(j|k))"', () => {
    expect_truthy(!isMatch('egz', '@(b+(c)d|e+(f)g?|?(h)i@(j|k))', { windows: true }));
  });

  test('"egzefffgzbcdij" should match "*(b+(c)d|e*(f)g?|?(h)i@(j|k))"', () => {
    expect_truthy(isMatch('egzefffgzbcdij', '*(b+(c)d|e*(f)g?|?(h)i@(j|k))', { windows: true }));
  });

  test('"f" should not match "!(f!(o))"', () => {
    expect_truthy(!isMatch('f', '!(f!(o))', { windows: true }));
  });

  test('"f" should match "!(f(o))"', () => {
    expect_truthy(isMatch('f', '!(f(o))', { windows: true }));
  });

  test('"f" should not match "!(f)"', () => {
    expect_truthy(!isMatch('f', '!(f)', { windows: true }));
  });

  test('"f" should not match "*(!(f))"', () => {
    expect_truthy(!isMatch('f', '*(!(f))', { windows: true }));
  });

  test('"f" should not match "+(!(f))"', () => {
    expect_truthy(!isMatch('f', '+(!(f))', { windows: true }));
  });

  test('"f.a" should not match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(!isMatch('f.a', '!(*.a|*.b|*.c)', { windows: true }));
  });

  test('"f.a" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('f.a', '*!(.a|.b|.c)', { windows: true }));
  });

  test('"f.a" should not match "*.!(a|b|c)"', () => {
    expect_truthy(!isMatch('f.a', '*.!(a|b|c)', { windows: true }));
  });

  test('"f.f" should match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(isMatch('f.f', '!(*.a|*.b|*.c)', { windows: true }));
  });

  test('"f.f" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('f.f', '*!(.a|.b|.c)', { windows: true }));
  });

  test('"f.f" should match "*.!(a|b|c)"', () => {
    expect_truthy(isMatch('f.f', '*.!(a|b|c)', { windows: true }));
  });

  test('"f.f" should not match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(!isMatch('f.f', '*.(a|b|@(ab|a*@(b))*(c)d)', { windows: true }));
  });

  test('"fa" should not match "!(f!(o))"', () => {
    expect_truthy(!isMatch('fa', '!(f!(o))', { windows: true }));
  });

  test('"fa" should match "!(f(o))"', () => {
    expect_truthy(isMatch('fa', '!(f(o))', { windows: true }));
  });

  test('"fb" should not match "!(f!(o))"', () => {
    expect_truthy(!isMatch('fb', '!(f!(o))', { windows: true }));
  });

  test('"fb" should match "!(f(o))"', () => {
    expect_truthy(isMatch('fb', '!(f(o))', { windows: true }));
  });

  test('"fff" should match "!(f)"', () => {
    expect_truthy(isMatch('fff', '!(f)', { windows: true }));
  });

  test('"fff" should match "*(!(f))"', () => {
    expect_truthy(isMatch('fff', '*(!(f))', { windows: true }));
  });

  test('"fff" should match "+(!(f))"', () => {
    expect_truthy(isMatch('fff', '+(!(f))', { windows: true }));
  });

  test('"fffooofoooooffoofffooofff" should match "*(*(f)*(o))"', () => {
    expect_truthy(isMatch('fffooofoooooffoofffooofff', '*(*(f)*(o))', { windows: true }));
  });

  test('"ffo" should match "*(f*(o))"', () => {
    expect_truthy(isMatch('ffo', '*(f*(o))', { windows: true }));
  });

  test('"file.C" should not match "*.c?(c)"', () => {
    expect_truthy(!isMatch('file.C', '*.c?(c)', { windows: true }));
  });

  test('"file.c" should match "*.c?(c)"', () => {
    expect_truthy(isMatch('file.c', '*.c?(c)', { windows: true }));
  });

  test('"file.cc" should match "*.c?(c)"', () => {
    expect_truthy(isMatch('file.cc', '*.c?(c)', { windows: true }));
  });

  test('"file.ccc" should not match "*.c?(c)"', () => {
    expect_truthy(!isMatch('file.ccc', '*.c?(c)', { windows: true }));
  });

  test('"fo" should match "!(f!(o))"', () => {
    expect_truthy(isMatch('fo', '!(f!(o))', { windows: true }));
  });

  test('"fo" should not match "!(f(o))"', () => {
    expect_truthy(!isMatch('fo', '!(f(o))', { windows: true }));
  });

  test('"fofo" should match "*(f*(o))"', () => {
    expect_truthy(isMatch('fofo', '*(f*(o))', { windows: true }));
  });

  test('"fofoofoofofoo" should match "*(fo|foo)"', () => {
    expect_truthy(isMatch('fofoofoofofoo', '*(fo|foo)', { windows: true }));
  });

  test('"fofoofoofofoo" should match "*(fo|foo)"', () => {
    expect_truthy(isMatch('fofoofoofofoo', '*(fo|foo)', { windows: true }));
  });

  test('"foo" should match "!(!(foo))"', () => {
    expect_truthy(isMatch('foo', '!(!(foo))', { windows: true }));
  });

  test('"foo" should match "!(f)"', () => {
    expect_truthy(isMatch('foo', '!(f)', { windows: true }));
  });

  test('"foo" should not match "!(foo)"', () => {
    expect_truthy(!isMatch('foo', '!(foo)', { windows: true }));
  });

  test('"foo" should not match "!(foo)*"', () => {
    expect_truthy(!isMatch('foo', '!(foo)*', { windows: true }));
  });

  test('"foo" should not match "!(foo)*"', () => {
    expect_truthy(!isMatch('foo', '!(foo)*', { windows: true }));
  });

  test('"foo" should not match "!(foo)+"', () => {
    expect_truthy(!isMatch('foo', '!(foo)+', { windows: true }));
  });

  test('"foo" should not match "!(foo)b*"', () => {
    expect_truthy(!isMatch('foo', '!(foo)b*', { windows: true }));
  });

  test('"foo" should match "!(x)"', () => {
    expect_truthy(isMatch('foo', '!(x)', { windows: true }));
  });

  test('"foo" should match "!(x)*"', () => {
    expect_truthy(isMatch('foo', '!(x)*', { windows: true }));
  });

  test('"foo" should match "*"', () => {
    expect_truthy(isMatch('foo', '*', { windows: true }));
  });

  test('"foo" should match "*(!(f))"', () => {
    expect_truthy(isMatch('foo', '*(!(f))', { windows: true }));
  });

  test('"foo" should not match "*(!(foo))"', () => {
    expect_truthy(!isMatch('foo', '*(!(foo))', { windows: true }));
  });

  test('"foo" should not match "*(@(a))a@(c)"', () => {
    expect_truthy(!isMatch('foo', '*(@(a))a@(c)', { windows: true }));
  });

  test('"foo" should match "*(@(foo))"', () => {
    expect_truthy(isMatch('foo', '*(@(foo))', { windows: true }));
  });

  test('"foo" should not match "*(a|b\\[)"', () => {
    expect_truthy(!isMatch('foo', '*(a|b\\[)', { windows: true }));
  });

  test('"foo" should match "*(a|b\\[)|f*"', () => {
    expect_truthy(isMatch('foo', '*(a|b\\[)|f*', { windows: true }));
  });

  test('"foo" should match "@(*(a|b\\[)|f*)"', () => {
    expect_truthy(isMatch('foo', '@(*(a|b\\[)|f*)', { windows: true }));
  });

  test('"foo" should not match "*/*/*"', () => {
    expect_truthy(!isMatch('foo', '*/*/*', { windows: true }));
  });

  test('"foo" should not match "*f"', () => {
    expect_truthy(!isMatch('foo', '*f', { windows: true }));
  });

  test('"foo" should match "*foo*"', () => {
    expect_truthy(isMatch('foo', '*foo*', { windows: true }));
  });

  test('"foo" should match "+(!(f))"', () => {
    expect_truthy(isMatch('foo', '+(!(f))', { windows: true }));
  });

  test('"foo" should not match "??"', () => {
    expect_truthy(!isMatch('foo', '??', { windows: true }));
  });

  test('"foo" should match "???"', () => {
    expect_truthy(isMatch('foo', '???', { windows: true }));
  });

  test('"foo" should not match "bar"', () => {
    expect_truthy(!isMatch('foo', 'bar', { windows: true }));
  });

  test('"foo" should match "f*"', () => {
    expect_truthy(isMatch('foo', 'f*', { windows: true }));
  });

  test('"foo" should not match "fo"', () => {
    expect_truthy(!isMatch('foo', 'fo', { windows: true }));
  });

  test('"foo" should match "foo"', () => {
    expect_truthy(isMatch('foo', 'foo', { windows: true }));
  });

  test('"foo" should match "{*(a|b\\[),f*}"', () => {
    expect_truthy(isMatch('foo', '{*(a|b\\[),f*}', { windows: true }));
  });

  test('"foo*" should match "foo\\*"', () => {
    expect_truthy(isMatch('foo*', 'foo\\*', { windows: false }));
  });

  test('"foo*bar" should match "foo\\*bar"', () => {
    expect_truthy(isMatch('foo*bar', 'foo\\*bar', { windows: true }));
  });

  test('"foo.js" should not match "!(foo).js"', () => {
    expect_truthy(!isMatch('foo.js', '!(foo).js', { windows: true }));
  });

  test('"foo.js.js" should match "*.!(js)"', () => {
    expect_truthy(isMatch('foo.js.js', '*.!(js)', { windows: true }));
  });

  test('"foo.js.js" should not match "*.!(js)*"', () => {
    expect_truthy(!isMatch('foo.js.js', '*.!(js)*', { windows: true }));
  });

  test('"foo.js.js" should not match "*.!(js)*.!(js)"', () => {
    expect_truthy(!isMatch('foo.js.js', '*.!(js)*.!(js)', { windows: true }));
  });

  test('"foo.js.js" should not match "*.!(js)+"', () => {
    expect_truthy(!isMatch('foo.js.js', '*.!(js)+', { windows: true }));
  });

  test('"foo.txt" should match "**/!(bar).txt"', () => {
    expect_truthy(isMatch('foo.txt', '**/!(bar).txt', { windows: true }));
  });

  test('"foo/bar" should not match "*/*/*"', () => {
    expect_truthy(!isMatch('foo/bar', '*/*/*', { windows: true }));
  });

  test('"foo/bar" should match "foo/!(foo)"', () => {
    expect_truthy(isMatch('foo/bar', 'foo/!(foo)', { windows: true }));
  });

  test('"foo/bar" should match "foo/*"', () => {
    expect_truthy(isMatch('foo/bar', 'foo/*', { windows: true }));
  });

  test('"foo/bar" should match "foo/bar"', () => {
    expect_truthy(isMatch('foo/bar', 'foo/bar', { windows: true }));
  });

  test('"foo/bar" should not match "foo?bar"', () => {
    expect_truthy(!isMatch('foo/bar', 'foo?bar', { windows: true }));
  });

  test('"foo/bar" should match "foo[/]bar"', () => {
    expect_truthy(isMatch('foo/bar', 'foo[/]bar', { windows: true }));
  });

  test('"foo/bar/baz.jsx" should match "foo/bar/**/*.+(js|jsx)"', () => {
    expect_truthy(isMatch('foo/bar/baz.jsx', 'foo/bar/**/*.+(js|jsx)', { windows: true }));
  });

  test('"foo/bar/baz.jsx" should match "foo/bar/*.+(js|jsx)"', () => {
    expect_truthy(isMatch('foo/bar/baz.jsx', 'foo/bar/*.+(js|jsx)', { windows: true }));
  });

  test('"foo/bb/aa/rr" should match "**/**/**"', () => {
    expect_truthy(isMatch('foo/bb/aa/rr', '**/**/**', { windows: true }));
  });

  test('"foo/bb/aa/rr" should not match "*/*/*"', () => {
    expect_truthy(!isMatch('foo/bb/aa/rr', '*/*/*', { windows: true }));
  });

  test('"foo/bba/arr" should match "*/*/*"', () => {
    expect_truthy(isMatch('foo/bba/arr', '*/*/*', { windows: true }));
  });

  test('"foo/bba/arr" should not match "foo*"', () => {
    expect_truthy(!isMatch('foo/bba/arr', 'foo*', { windows: true }));
  });

  test('"foo/bba/arr" should not match "foo**"', () => {
    expect_truthy(!isMatch('foo/bba/arr', 'foo**', { windows: true }));
  });

  test('"foo/bba/arr" should not match "foo/*"', () => {
    expect_truthy(!isMatch('foo/bba/arr', 'foo/*', { windows: true }));
  });

  test('"foo/bba/arr" should match "foo/**"', () => {
    expect_truthy(isMatch('foo/bba/arr', 'foo/**', { windows: true }));
  });

  test('"foo/bba/arr" should not match "foo/**arr"', () => {
    expect_truthy(!isMatch('foo/bba/arr', 'foo/**arr', { windows: true }));
  });

  test('"foo/bba/arr" should not match "foo/**z"', () => {
    expect_truthy(!isMatch('foo/bba/arr', 'foo/**z', { windows: true }));
  });

  test('"foo/bba/arr" should not match "foo/*arr"', () => {
    expect_truthy(!isMatch('foo/bba/arr', 'foo/*arr', { windows: true }));
  });

  test('"foo/bba/arr" should not match "foo/*z"', () => {
    expect_truthy(!isMatch('foo/bba/arr', 'foo/*z', { windows: true }));
  });

  test('"foob" should not match "!(foo)b*"', () => {
    expect_truthy(!isMatch('foob', '!(foo)b*', { windows: true }));
  });

  test('"foob" should not match "(foo)bb"', () => {
    expect_truthy(!isMatch('foob', '(foo)bb', { windows: true }));
  });

  test('"foobar" should match "!(foo)"', () => {
    expect_truthy(isMatch('foobar', '!(foo)', { windows: true }));
  });

  test('"foobar" should not match "!(foo)*"', () => {
    expect_truthy(!isMatch('foobar', '!(foo)*', { windows: true }));
  });

  test('"foobar" should not match "!(foo)b*"', () => {
    expect_truthy(!isMatch('foobar', '!(foo)b*', { windows: true }));
  });

  test('"foobar" should match "*(!(foo))"', () => {
    expect_truthy(isMatch('foobar', '*(!(foo))', { windows: true }));
  });

  test('"foobar" should match "*ob*a*r*"', () => {
    expect_truthy(isMatch('foobar', '*ob*a*r*', { windows: true }));
  });

  test('"foobar" should not match "foo\\*bar"', () => {
    expect_truthy(!isMatch('foobar', 'foo\\*bar', { windows: true }));
  });

  test('"foobb" should not match "!(foo)b*"', () => {
    expect_truthy(!isMatch('foobb', '!(foo)b*', { windows: true }));
  });

  test('"foobb" should match "(foo)bb"', () => {
    expect_truthy(isMatch('foobb', '(foo)bb', { windows: true }));
  });

  test('"(foo)bb" should match "\\(foo\\)bb"', () => {
    expect_truthy(isMatch('(foo)bb', '\\(foo\\)bb', { windows: true }));
  });

  test('"foofoofo" should match "@(foo|f|fo)*(f|of+(o))"', () => {
    expect_truthy(isMatch('foofoofo', '@(foo|f|fo)*(f|of+(o))', { windows: true }));
  });

  test('"foofoofo" should match "@(foo|f|fo)*(f|of+(o))"', () => {
    expect_truthy(isMatch('foofoofo', '@(foo|f|fo)*(f|of+(o))', { windows: true }));
  });

  test('"fooofoofofooo" should match "*(f*(o))"', () => {
    expect_truthy(isMatch('fooofoofofooo', '*(f*(o))', { windows: true }));
  });

  test('"foooofo" should match "*(f*(o))"', () => {
    expect_truthy(isMatch('foooofo', '*(f*(o))', { windows: true }));
  });

  test('"foooofof" should match "*(f*(o))"', () => {
    expect_truthy(isMatch('foooofof', '*(f*(o))', { windows: true }));
  });

  test('"foooofof" should not match "*(f+(o))"', () => {
    expect_truthy(!isMatch('foooofof', '*(f+(o))', { windows: true }));
  });

  test('"foooofofx" should not match "*(f*(o))"', () => {
    expect_truthy(!isMatch('foooofofx', '*(f*(o))', { windows: true }));
  });

  test('"foooxfooxfoxfooox" should match "*(f*(o)x)"', () => {
    expect_truthy(isMatch('foooxfooxfoxfooox', '*(f*(o)x)', { windows: true }));
  });

  test('"foooxfooxfxfooox" should match "*(f*(o)x)"', () => {
    expect_truthy(isMatch('foooxfooxfxfooox', '*(f*(o)x)', { windows: true }));
  });

  test('"foooxfooxofoxfooox" should not match "*(f*(o)x)"', () => {
    expect_truthy(!isMatch('foooxfooxofoxfooox', '*(f*(o)x)', { windows: true }));
  });

  test('"foot" should match "@(!(z*)|*x)"', () => {
    expect_truthy(isMatch('foot', '@(!(z*)|*x)', { windows: true }));
  });

  test('"foox" should match "@(!(z*)|*x)"', () => {
    expect_truthy(isMatch('foox', '@(!(z*)|*x)', { windows: true }));
  });

  test('"fz" should not match "*(z)"', () => {
    expect_truthy(!isMatch('fz', '*(z)', { windows: true }));
  });

  test('"fz" should not match "+(z)"', () => {
    expect_truthy(!isMatch('fz', '+(z)', { windows: true }));
  });

  test('"fz" should not match "?(z)"', () => {
    expect_truthy(!isMatch('fz', '?(z)', { windows: true }));
  });

  test('"moo.cow" should not match "!(moo).!(cow)"', () => {
    expect_truthy(!isMatch('moo.cow', '!(moo).!(cow)', { windows: true }));
  });

  test('"moo.cow" should not match "!(*).!(*)"', () => {
    expect_truthy(!isMatch('moo.cow', '!(*).!(*)', { windows: true }));
  });

  test('"mad.moo.cow" should not match "!(*.*).!(*.*)"', () => {
    expect_truthy(!isMatch('mad.moo.cow', '!(*.*).!(*.*)', { windows: true }));
  });

  test('"mad.moo.cow" should not match ".!(*.*)"', () => {
    expect_truthy(!isMatch('mad.moo.cow', '.!(*.*)', { windows: true }));
  });

  test('"Makefile" should match "!(*.c|*.h|Makefile.in|config*|README)"', () => {
    expect_truthy(isMatch('Makefile', '!(*.c|*.h|Makefile.in|config*|README)', { windows: true }));
  });

  test('"Makefile.in" should not match "!(*.c|*.h|Makefile.in|config*|README)"', () => {
    expect_truthy(!isMatch('Makefile.in', '!(*.c|*.h|Makefile.in|config*|README)', { windows: true }));
  });

  test('"moo" should match "!(*.*)"', () => {
    expect_truthy(isMatch('moo', '!(*.*)', { windows: true }));
  });

  test('"moo" should not match "!(*.*)."', () => {
    expect_truthy(!isMatch('moo', '!(*.*).', { windows: true }));
  });

  test('"moo" should not match ".!(*.*)"', () => {
    expect_truthy(!isMatch('moo', '.!(*.*)', { windows: true }));
  });

  test('"moo.cow" should not match "!(*.*)"', () => {
    expect_truthy(!isMatch('moo.cow', '!(*.*)', { windows: true }));
  });

  test('"moo.cow" should not match "!(*.*)."', () => {
    expect_truthy(!isMatch('moo.cow', '!(*.*).', { windows: true }));
  });

  test('"moo.cow" should not match ".!(*.*)"', () => {
    expect_truthy(!isMatch('moo.cow', '.!(*.*)', { windows: true }));
  });

  test('"mucca.pazza" should not match "mu!(*(c))?.pa!(*(z))?"', () => {
    expect_truthy(!isMatch('mucca.pazza', 'mu!(*(c))?.pa!(*(z))?', { windows: true }));
  });

  test('"ofoofo" should match "*(of+(o))"', () => {
    expect_truthy(isMatch('ofoofo', '*(of+(o))', { windows: true }));
  });

  test('"ofoofo" should match "*(of+(o)|f)"', () => {
    expect_truthy(isMatch('ofoofo', '*(of+(o)|f)', { windows: true }));
  });

  test('"ofooofoofofooo" should not match "*(f*(o))"', () => {
    expect_truthy(!isMatch('ofooofoofofooo', '*(f*(o))', { windows: true }));
  });

  test('"ofoooxoofxo" should match "*(*(of*(o)x)o)"', () => {
    expect_truthy(isMatch('ofoooxoofxo', '*(*(of*(o)x)o)', { windows: true }));
  });

  test('"ofoooxoofxoofoooxoofxo" should match "*(*(of*(o)x)o)"', () => {
    expect_truthy(isMatch('ofoooxoofxoofoooxoofxo', '*(*(of*(o)x)o)', { windows: true }));
  });

  test('"ofoooxoofxoofoooxoofxofo" should not match "*(*(of*(o)x)o)"', () => {
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxofo', '*(*(of*(o)x)o)', { windows: true }));
  });

  test('"ofoooxoofxoofoooxoofxoo" should match "*(*(of*(o)x)o)"', () => {
    expect_truthy(isMatch('ofoooxoofxoofoooxoofxoo', '*(*(of*(o)x)o)', { windows: true }));
  });

  test('"ofoooxoofxoofoooxoofxooofxofxo" should match "*(*(of*(o)x)o)"', () => {
    expect_truthy(isMatch('ofoooxoofxoofoooxoofxooofxofxo', '*(*(of*(o)x)o)', { windows: true }));
  });

  test('"ofxoofxo" should match "*(*(of*(o)x)o)"', () => {
    expect_truthy(isMatch('ofxoofxo', '*(*(of*(o)x)o)', { windows: true }));
  });

  test('"oofooofo" should match "*(of|oof+(o))"', () => {
    expect_truthy(isMatch('oofooofo', '*(of|oof+(o))', { windows: true }));
  });

  test('"ooo" should match "!(f)"', () => {
    expect_truthy(isMatch('ooo', '!(f)', { windows: true }));
  });

  test('"ooo" should match "*(!(f))"', () => {
    expect_truthy(isMatch('ooo', '*(!(f))', { windows: true }));
  });

  test('"ooo" should match "+(!(f))"', () => {
    expect_truthy(isMatch('ooo', '+(!(f))', { windows: true }));
  });

  test('"oxfoxfox" should not match "*(oxf+(ox))"', () => {
    expect_truthy(!isMatch('oxfoxfox', '*(oxf+(ox))', { windows: true }));
  });

  test('"oxfoxoxfox" should match "*(oxf+(ox))"', () => {
    expect_truthy(isMatch('oxfoxoxfox', '*(oxf+(ox))', { windows: true }));
  });

  test('"para" should match "para*([0-9])"', () => {
    expect_truthy(isMatch('para', 'para*([0-9])', { windows: true }));
  });

  test('"para" should not match "para+([0-9])"', () => {
    expect_truthy(!isMatch('para', 'para+([0-9])', { windows: true }));
  });

  test('"para.38" should match "para!(*.[00-09])"', () => {
    expect_truthy(isMatch('para.38', 'para!(*.[00-09])', { windows: true }));
  });

  test('"para.graph" should match "para!(*.[0-9])"', () => {
    expect_truthy(isMatch('para.graph', 'para!(*.[0-9])', { windows: true }));
  });

  test('"para13829383746592" should match "para*([0-9])"', () => {
    expect_truthy(isMatch('para13829383746592', 'para*([0-9])', { windows: true }));
  });

  test('"para381" should not match "para?([345]|99)1"', () => {
    expect_truthy(!isMatch('para381', 'para?([345]|99)1', { windows: true }));
  });

  test('"para39" should match "para!(*.[0-9])"', () => {
    expect_truthy(isMatch('para39', 'para!(*.[0-9])', { windows: true }));
  });

  test('"para987346523" should match "para+([0-9])"', () => {
    expect_truthy(isMatch('para987346523', 'para+([0-9])', { windows: true }));
  });

  test('"para991" should match "para?([345]|99)1"', () => {
    expect_truthy(isMatch('para991', 'para?([345]|99)1', { windows: true }));
  });

  test('"paragraph" should match "para!(*.[0-9])"', () => {
    expect_truthy(isMatch('paragraph', 'para!(*.[0-9])', { windows: true }));
  });

  test('"paragraph" should not match "para*([0-9])"', () => {
    expect_truthy(!isMatch('paragraph', 'para*([0-9])', { windows: true }));
  });

  test('"paragraph" should match "para@(chute|graph)"', () => {
    expect_truthy(isMatch('paragraph', 'para@(chute|graph)', { windows: true }));
  });

  test('"paramour" should not match "para@(chute|graph)"', () => {
    expect_truthy(!isMatch('paramour', 'para@(chute|graph)', { windows: true }));
  });

  test('"parse.y" should match "!(*.c|*.h|Makefile.in|config*|README)"', () => {
    expect_truthy(isMatch('parse.y', '!(*.c|*.h|Makefile.in|config*|README)', { windows: true }));
  });

  test('"shell.c" should not match "!(*.c|*.h|Makefile.in|config*|README)"', () => {
    expect_truthy(!isMatch('shell.c', '!(*.c|*.h|Makefile.in|config*|README)', { windows: true }));
  });

  test('"VMS.FILE;" should not match "*\\;[1-9]*([0-9])"', () => {
    expect_truthy(!isMatch('VMS.FILE;', '*\\;[1-9]*([0-9])', { windows: true }));
  });

  test('"VMS.FILE;0" should not match "*\\;[1-9]*([0-9])"', () => {
    expect_truthy(!isMatch('VMS.FILE;0', '*\\;[1-9]*([0-9])', { windows: true }));
  });

  test('"VMS.FILE;1" should match "*\\;[1-9]*([0-9])"', () => {
    expect_truthy(isMatch('VMS.FILE;1', '*\\;[1-9]*([0-9])', { windows: true }));
  });

  test('"VMS.FILE;1" should match "*;[1-9]*([0-9])"', () => {
    expect_truthy(isMatch('VMS.FILE;1', '*;[1-9]*([0-9])', { windows: true }));
  });

  test('"VMS.FILE;139" should match "*\\;[1-9]*([0-9])"', () => {
    expect_truthy(isMatch('VMS.FILE;139', '*\\;[1-9]*([0-9])', { windows: true }));
  });

  test('"VMS.FILE;1N" should not match "*\\;[1-9]*([0-9])"', () => {
    expect_truthy(!isMatch('VMS.FILE;1N', '*\\;[1-9]*([0-9])', { windows: true }));
  });

  test('"xfoooofof" should not match "*(f*(o))"', () => {
    expect_truthy(!isMatch('xfoooofof', '*(f*(o))', { windows: true }));
  });

  test('"XXX/adobe/courier/bold/o/normal//12/120/75/75/m/70/iso8859/1" should match "XXX/*/*/*/*/*/*/12/*/*/*/m/*/*/*"', () => {
    expect_truthy(isMatch('XXX/adobe/courier/bold/o/normal//12/120/75/75/m/70/iso8859/1', 'XXX/*/*/*/*/*/*/12/*/*/*/m/*/*/*', { windows: false }));
  });

  test('"XXX/adobe/courier/bold/o/normal//12/120/75/75/X/70/iso8859/1" should not match "XXX/*/*/*/*/*/*/12/*/*/*/m/*/*/*"', () => {
    expect_truthy(!isMatch('XXX/adobe/courier/bold/o/normal//12/120/75/75/X/70/iso8859/1', 'XXX/*/*/*/*/*/*/12/*/*/*/m/*/*/*', { windows: true }));
  });

  test('"z" should match "*(z)"', () => {
    expect_truthy(isMatch('z', '*(z)', { windows: true }));
  });

  test('"z" should match "+(z)"', () => {
    expect_truthy(isMatch('z', '+(z)', { windows: true }));
  });

  test('"z" should match "?(z)"', () => {
    expect_truthy(isMatch('z', '?(z)', { windows: true }));
  });

  test('"zf" should not match "*(z)"', () => {
    expect_truthy(!isMatch('zf', '*(z)', { windows: true }));
  });

  test('"zf" should not match "+(z)"', () => {
    expect_truthy(!isMatch('zf', '+(z)', { windows: true }));
  });

  test('"zf" should not match "?(z)"', () => {
    expect_truthy(!isMatch('zf', '?(z)', { windows: true }));
  });

  test('"zoot" should not match "@(!(z*)|*x)"', () => {
    expect_truthy(!isMatch('zoot', '@(!(z*)|*x)', { windows: true }));
  });

  test('"zoox" should match "@(!(z*)|*x)"', () => {
    expect_truthy(isMatch('zoox', '@(!(z*)|*x)', { windows: true }));
  });

  test('"zz" should not match "(a+|b)*"', () => {
    expect_truthy(!isMatch('zz', '(a+|b)*', { windows: true }));
  });
});
