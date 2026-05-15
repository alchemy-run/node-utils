// @ts-nocheck — mechanically ported from upstream JS tests; bun runs them as-is.
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import path from "node:path";
import micromatch from "../../src/micromatch/index.ts";

const before = beforeAll;
const after = afterAll;

// All helpers accept an optional message arg (matching Node's assert API)
// even though we don't surface it — Bun's expect() builds its own diagnostic.
const expect_truthy = (v: unknown, _msg?: unknown) => {
  expect(Boolean(v)).toBe(true);
};
const expect_equal = (actual: unknown, expected: unknown, _msg?: unknown) => {
  expect(actual).toBe(expected as any);
};
const expect_loose_equal = (actual: unknown, expected: unknown, _msg?: unknown) => {
  expect(actual == expected).toBe(true);
};
const expect_deepEqual = (actual: unknown, expected: unknown, _msg?: unknown) => {
  expect(actual).toEqual(expected as any);
};
const expect_notDeepEqual = (actual: unknown, expected: unknown, _msg?: unknown) => {
  expect(actual).not.toEqual(expected as any);
};
const expect_notEqual = (actual: unknown, expected: unknown, _msg?: unknown) => {
  expect(actual == expected).toBe(false);
};
const expect_throws = (fn: () => unknown, matcher?: any, _msg?: unknown) => {
  if (matcher) expect(fn).toThrow(matcher);
  else expect(fn).toThrow();
};
const expect_doesNotThrow = (fn: () => unknown, _msg?: unknown) => {
  expect(fn).not.toThrow();
};


const { isMatch, makeRe } = micromatch;

if (!process.env.ORIGINAL_PATH_SEP) {
  process.env.ORIGINAL_PATH_SEP = path.sep
}

/**
 * Some of tests were converted from bash 4.3, 4.4, and minimatch unit tests.
 */

describe('extglobs (minimatch)', () => {
  let setup = {
    before: () => ((path as any).sep = '\\'),
    after: () => ((path as any).sep = process.env.ORIGINAL_PATH_SEP)
  };

  afterEach(() => setup.after());
  beforeEach(() => setup.before());

  test('should not match empty string with "*(0|1|3|5|7|9)"', () => {
    expect_truthy(!isMatch('', '*(0|1|3|5|7|9)'));
  });

  test('"*(a|b[)" should not match "*(a|b\\[)"', () => {
    expect_truthy(!isMatch('*(a|b[)', '*(a|b\\[)'));
  });

  test('"*(a|b[)" should not match "\\*\\(a|b\\[\\)"', () => {
    expect_truthy(isMatch('*(a|b[)', '\\*\\(a\\|b\\[\\)'));
  });

  test('"***" should match "\\*\\*\\*"', () => {
    expect_truthy(isMatch('***', '\\*\\*\\*'));
  });

  test('"-adobe-courier-bold-o-normal--12-120-75-75-/-70-iso8859-1" should not match "-*-*-*-*-*-*-12-*-*-*-m-*-*-*"', () => {
    expect_truthy(!isMatch('-adobe-courier-bold-o-normal--12-120-75-75-/-70-iso8859-1', '-*-*-*-*-*-*-12-*-*-*-m-*-*-*'));
  });

  test('"-adobe-courier-bold-o-normal--12-120-75-75-m-70-iso8859-1" should match "-*-*-*-*-*-*-12-*-*-*-m-*-*-*"', () => {
    expect_truthy(isMatch('-adobe-courier-bold-o-normal--12-120-75-75-m-70-iso8859-1', '-*-*-*-*-*-*-12-*-*-*-m-*-*-*'));
  });

  test('"-adobe-courier-bold-o-normal--12-120-75-75-X-70-iso8859-1" should not match "-*-*-*-*-*-*-12-*-*-*-m-*-*-*"', () => {
    expect_truthy(!isMatch('-adobe-courier-bold-o-normal--12-120-75-75-X-70-iso8859-1', '-*-*-*-*-*-*-12-*-*-*-m-*-*-*'));
  });

  test('"/dev/udp/129.22.8.102/45" should not match "/dev\\/@(tcp|udp)\\/*\\/*"', () => {
    expect_truthy(isMatch('/dev/udp/129.22.8.102/45', '/dev\\/@(tcp|udp)\\/*\\/*'));
  });

  test('"/x/y/z" should match "/x/y/z"', () => {
    expect_truthy(isMatch('/x/y/z', '/x/y/z'));
  });

  test('"0377" should match "+([0-7])"', () => {
    expect_truthy(isMatch('0377', '+([0-7])'));
  });

  test('"07" should match "+([0-7])"', () => {
    expect_truthy(isMatch('07', '+([0-7])'));
  });

  test('"09" should not match "+([0-7])"', () => {
    expect_truthy(!isMatch('09', '+([0-7])'));
  });

  test('"1" should match "0|[1-9]*([0-9])"', () => {
    expect_truthy(isMatch('1', '0|[1-9]*([0-9])'));
  });

  test('"12" should match "0|[1-9]*([0-9])"', () => {
    expect_truthy(isMatch('12', '0|[1-9]*([0-9])'));
  });

  test('"123abc" should not match "(a+|b)*"', () => {
    expect_truthy(!isMatch('123abc', '(a+|b)*'));
  });

  test('"123abc" should not match "(a+|b)+"', () => {
    expect_truthy(!isMatch('123abc', '(a+|b)+'));
  });

  test('"123abc" should match "*?(a)bc"', () => {
    expect_truthy(isMatch('123abc', '*?(a)bc'));
  });

  test('"123abc" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('123abc', 'a(b*(foo|bar))d'));
  });

  test('"123abc" should not match "ab*(e|f)"', () => {
    expect_truthy(!isMatch('123abc', 'ab*(e|f)'));
  });

  test('"123abc" should not match "ab**"', () => {
    expect_truthy(!isMatch('123abc', 'ab**'));
  });

  test('"123abc" should not match "ab**(e|f)"', () => {
    expect_truthy(!isMatch('123abc', 'ab**(e|f)'));
  });

  test('"123abc" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('123abc', 'ab**(e|f)g'));
  });

  test('"123abc" should not match "ab***ef"', () => {
    expect_truthy(!isMatch('123abc', 'ab***ef'));
  });

  test('"123abc" should not match "ab*+(e|f)"', () => {
    expect_truthy(!isMatch('123abc', 'ab*+(e|f)'));
  });

  test('"123abc" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('123abc', 'ab*d+(e|f)'));
  });

  test('"123abc" should not match "ab?*(e|f)"', () => {
    expect_truthy(!isMatch('123abc', 'ab?*(e|f)'));
  });

  test('"12abc" should not match "0|[1-9]*([0-9])"', () => {
    expect_truthy(!isMatch('12abc', '0|[1-9]*([0-9])'));
  });

  test('"137577991" should match "*(0|1|3|5|7|9)"', () => {
    expect_truthy(isMatch('137577991', '*(0|1|3|5|7|9)'));
  });

  test('"2468" should not match "*(0|1|3|5|7|9)"', () => {
    expect_truthy(!isMatch('2468', '*(0|1|3|5|7|9)'));
  });

  test('"?a?b" should match "\\??\\?b"', () => {
    expect_truthy(isMatch('?a?b', '\\??\\?b'));
  });

  test('"\\a\\b\\c" should not match "abc"', () => {
    expect_truthy(!isMatch('\\a\\b\\c', 'abc'));
  });

  test('"a" should match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(isMatch('a', '!(*.a|*.b|*.c)'));
  });

  test('"a" should not match "!(a)"', () => {
    expect_truthy(!isMatch('a', '!(a)'));
  });

  test('"a" should not match "!(a)*"', () => {
    expect_truthy(!isMatch('a', '!(a)*'));
  });

  test('"a" should match "(a)"', () => {
    expect_truthy(isMatch('a', '(a)'));
  });

  test('"a" should not match "(b)"', () => {
    expect_truthy(!isMatch('a', '(b)'));
  });

  test('"a" should match "*(a)"', () => {
    expect_truthy(isMatch('a', '*(a)'));
  });

  test('"a" should match "+(a)"', () => {
    expect_truthy(isMatch('a', '+(a)'));
  });

  test('"a" should match "?"', () => {
    expect_truthy(isMatch('a', '?'));
  });

  test('"a" should match "?(a|b)"', () => {
    expect_truthy(isMatch('a', '?(a|b)'));
  });

  test('"a" should not match "??"', () => {
    expect_truthy(!isMatch('a', '??'));
  });

  test('"a" should match "a!(b)*"', () => {
    expect_truthy(isMatch('a', 'a!(b)*'));
  });

  test('"a" should match "a?(a|b)"', () => {
    expect_truthy(isMatch('a', 'a?(a|b)'));
  });

  test('"a" should match "a?(x)"', () => {
    expect_truthy(isMatch('a', 'a?(x)'));
  });

  test('"a" should not match "a??b"', () => {
    expect_truthy(!isMatch('a', 'a??b'));
  });

  test('"a" should not match "b?(a|b)"', () => {
    expect_truthy(!isMatch('a', 'b?(a|b)'));
  });

  test('"a((((b" should match "a(*b"', () => {
    expect_truthy(isMatch('a((((b', 'a(*b'));
  });

  test('"a((((b" should not match "a(b"', () => {
    expect_truthy(!isMatch('a((((b', 'a(b'));
  });

  test('"a((((b" should not match "a\\(b"', () => {
    expect_truthy(!isMatch('a((((b', 'a\\(b'));
  });

  test('"a((b" should match "a(*b"', () => {
    expect_truthy(isMatch('a((b', 'a(*b'));
  });

  test('"a((b" should not match "a(b"', () => {
    expect_truthy(!isMatch('a((b', 'a(b'));
  });

  test('"a((b" should not match "a\\(b"', () => {
    expect_truthy(!isMatch('a((b', 'a\\(b'));
  });

  test('"a(b" should match "a(*b"', () => {
    expect_truthy(isMatch('a(b', 'a(*b'));
  });

  test('"a(b" should match "a(b"', () => {
    expect_truthy(isMatch('a(b', 'a(b'));
  });

  test('"a(b" should match "a\\(b"', () => {
    expect_truthy(isMatch('a(b', 'a\\(b'));
  });

  test('"a." should match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(isMatch('a.', '!(*.a|*.b|*.c)'));
  });

  test('"a." should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('a.', '*!(.a|.b|.c)'));
  });

  test('"a." should match "*.!(a)"', () => {
    expect_truthy(isMatch('a.', '*.!(a)'));
  });

  test('"a." should match "*.!(a|b|c)"', () => {
    expect_truthy(isMatch('a.', '*.!(a|b|c)'));
  });

  test('"a." should not match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(!isMatch('a.', '*.(a|b|@(ab|a*@(b))*(c)d)'));
  });

  test('"a." should not match "*.+(b|d)"', () => {
    expect_truthy(!isMatch('a.', '*.+(b|d)'));
  });

  test('"a.a" should not match "!(*.[a-b]*)"', () => {
    expect_truthy(!isMatch('a.a', '!(*.[a-b]*)'));
  });

  test('"a.a" should not match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(!isMatch('a.a', '!(*.a|*.b|*.c)'));
  });

  test('"a.a" should not match "!(*[a-b].[a-b]*)"', () => {
    expect_truthy(!isMatch('a.a', '!(*[a-b].[a-b]*)'));
  });

  test('"a.a" should not match "!*.(a|b)"', () => {
    expect_truthy(!isMatch('a.a', '!*.(a|b)'));
  });

  test('"a.a" should not match "!*.(a|b)*"', () => {
    expect_truthy(!isMatch('a.a', '!*.(a|b)*'));
  });

  test('"a.a" should match "(a|d).(a|b)*"', () => {
    expect_truthy(isMatch('a.a', '(a|d).(a|b)*'));
  });

  test('"a.a" should match "(b|a).(a)"', () => {
    expect_truthy(isMatch('a.a', '(b|a).(a)'));
  });

  test('"a.a" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('a.a', '*!(.a|.b|.c)'));
  });

  test('"a.a" should not match "*.!(a)"', () => {
    expect_truthy(!isMatch('a.a', '*.!(a)'));
  });

  test('"a.a" should not match "*.!(a|b|c)"', () => {
    expect_truthy(!isMatch('a.a', '*.!(a|b|c)'));
  });

  test('"a.a" should match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(isMatch('a.a', '*.(a|b|@(ab|a*@(b))*(c)d)'));
  });

  test('"a.a" should not match "*.+(b|d)"', () => {
    expect_truthy(!isMatch('a.a', '*.+(b|d)'));
  });

  test('"a.a" should match "@(b|a).@(a)"', () => {
    expect_truthy(isMatch('a.a', '@(b|a).@(a)'));
  });

  test('"a.a.a" should not match "!(*.[a-b]*)"', () => {
    expect_truthy(!isMatch('a.a.a', '!(*.[a-b]*)'));
  });

  test('"a.a.a" should not match "!(*[a-b].[a-b]*)"', () => {
    expect_truthy(!isMatch('a.a.a', '!(*[a-b].[a-b]*)'));
  });

  test('"a.a.a" should not match "!*.(a|b)"', () => {
    expect_truthy(!isMatch('a.a.a', '!*.(a|b)'));
  });

  test('"a.a.a" should not match "!*.(a|b)*"', () => {
    expect_truthy(!isMatch('a.a.a', '!*.(a|b)*'));
  });

  test('"a.a.a" should match "*.!(a)"', () => {
    expect_truthy(isMatch('a.a.a', '*.!(a)'));
  });

  test('"a.a.a" should not match "*.+(b|d)"', () => {
    expect_truthy(!isMatch('a.a.a', '*.+(b|d)'));
  });

  test('"a.aa.a" should not match "(b|a).(a)"', () => {
    expect_truthy(!isMatch('a.aa.a', '(b|a).(a)'));
  });

  test('"a.aa.a" should not match "@(b|a).@(a)"', () => {
    expect_truthy(!isMatch('a.aa.a', '@(b|a).@(a)'));
  });

  test('"a.abcd" should match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(isMatch('a.abcd', '!(*.a|*.b|*.c)'));
  });

  test('"a.abcd" should not match "!(*.a|*.b|*.c)*"', () => {
    expect_truthy(!isMatch('a.abcd', '!(*.a|*.b|*.c)*'));
  });

  test('"a.abcd" should match "*!(*.a|*.b|*.c)*"', () => {
    expect_truthy(isMatch('a.abcd', '*!(*.a|*.b|*.c)*'));
  });

  test('"a.abcd" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('a.abcd', '*!(.a|.b|.c)'));
  });

  test('"a.abcd" should match "*.!(a|b|c)"', () => {
    expect_truthy(isMatch('a.abcd', '*.!(a|b|c)'));
  });

  test('"a.abcd" should not match "*.!(a|b|c)*"', () => {
    expect_truthy(!isMatch('a.abcd', '*.!(a|b|c)*'));
  });

  test('"a.abcd" should match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(isMatch('a.abcd', '*.(a|b|@(ab|a*@(b))*(c)d)'));
  });

  test('"a.b" should not match "!(*.*)"', () => {
    expect_truthy(!isMatch('a.b', '!(*.*)'));
  });

  test('"a.b" should not match "!(*.[a-b]*)"', () => {
    expect_truthy(!isMatch('a.b', '!(*.[a-b]*)'));
  });

  test('"a.b" should not match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(!isMatch('a.b', '!(*.a|*.b|*.c)'));
  });

  test('"a.b" should not match "!(*[a-b].[a-b]*)"', () => {
    expect_truthy(!isMatch('a.b', '!(*[a-b].[a-b]*)'));
  });

  test('"a.b" should not match "!*.(a|b)"', () => {
    expect_truthy(!isMatch('a.b', '!*.(a|b)'));
  });

  test('"a.b" should not match "!*.(a|b)*"', () => {
    expect_truthy(!isMatch('a.b', '!*.(a|b)*'));
  });

  test('"a.b" should match "(a|d).(a|b)*"', () => {
    expect_truthy(isMatch('a.b', '(a|d).(a|b)*'));
  });

  test('"a.b" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('a.b', '*!(.a|.b|.c)'));
  });

  test('"a.b" should match "*.!(a)"', () => {
    expect_truthy(isMatch('a.b', '*.!(a)'));
  });

  test('"a.b" should not match "*.!(a|b|c)"', () => {
    expect_truthy(!isMatch('a.b', '*.!(a|b|c)'));
  });

  test('"a.b" should match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(isMatch('a.b', '*.(a|b|@(ab|a*@(b))*(c)d)'));
  });

  test('"a.b" should match "*.+(b|d)"', () => {
    expect_truthy(isMatch('a.b', '*.+(b|d)'));
  });

  test('"a.bb" should not match "!(*.[a-b]*)"', () => {
    expect_truthy(!isMatch('a.bb', '!(*.[a-b]*)'));
  });

  test('"a.bb" should not match "!(*[a-b].[a-b]*)"', () => {
    expect_truthy(!isMatch('a.bb', '!(*[a-b].[a-b]*)'));
  });

  test('"a.bb" should match "!*.(a|b)"', () => {
    expect_truthy(isMatch('a.bb', '!*.(a|b)'));
  });

  test('"a.bb" should not match "!*.(a|b)*"', () => {
    expect_truthy(!isMatch('a.bb', '!*.(a|b)*'));
  });

  test('"a.bb" should not match "!*.*(a|b)"', () => {
    expect_truthy(!isMatch('a.bb', '!*.*(a|b)'));
  });

  test('"a.bb" should match "(a|d).(a|b)*"', () => {
    expect_truthy(isMatch('a.bb', '(a|d).(a|b)*'));
  });

  test('"a.bb" should not match "(b|a).(a)"', () => {
    expect_truthy(!isMatch('a.bb', '(b|a).(a)'));
  });

  test('"a.bb" should match "*.+(b|d)"', () => {
    expect_truthy(isMatch('a.bb', '*.+(b|d)'));
  });

  test('"a.bb" should not match "@(b|a).@(a)"', () => {
    expect_truthy(!isMatch('a.bb', '@(b|a).@(a)'));
  });

  test('"a.c" should not match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(!isMatch('a.c', '!(*.a|*.b|*.c)'));
  });

  test('"a.c" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('a.c', '*!(.a|.b|.c)'));
  });

  test('"a.c" should not match "*.!(a|b|c)"', () => {
    expect_truthy(!isMatch('a.c', '*.!(a|b|c)'));
  });

  test('"a.c" should not match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(!isMatch('a.c', '*.(a|b|@(ab|a*@(b))*(c)d)'));
  });

  test('"a.c.d" should match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(isMatch('a.c.d', '!(*.a|*.b|*.c)'));
  });

  test('"a.c.d" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('a.c.d', '*!(.a|.b|.c)'));
  });

  test('"a.c.d" should match "*.!(a|b|c)"', () => {
    expect_truthy(isMatch('a.c.d', '*.!(a|b|c)'));
  });

  test('"a.c.d" should not match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(!isMatch('a.c.d', '*.(a|b|@(ab|a*@(b))*(c)d)'));
  });

  test('"a.ccc" should match "!(*.[a-b]*)"', () => {
    expect_truthy(isMatch('a.ccc', '!(*.[a-b]*)'));
  });

  test('"a.ccc" should match "!(*[a-b].[a-b]*)"', () => {
    expect_truthy(isMatch('a.ccc', '!(*[a-b].[a-b]*)'));
  });

  test('"a.ccc" should match "!*.(a|b)"', () => {
    expect_truthy(isMatch('a.ccc', '!*.(a|b)'));
  });

  test('"a.ccc" should match "!*.(a|b)*"', () => {
    expect_truthy(isMatch('a.ccc', '!*.(a|b)*'));
  });

  test('"a.ccc" should not match "*.+(b|d)"', () => {
    expect_truthy(!isMatch('a.ccc', '*.+(b|d)'));
  });

  test('"a.js" should not match "!(*.js)"', () => {
    expect_truthy(!isMatch('a.js', '!(*.js)'));
  });

  test('"a.js" should match "*!(.js)"', () => {
    expect_truthy(isMatch('a.js', '*!(.js)'));
  });

  test('"a.js" should not match "*.!(js)"', () => {
    expect_truthy(!isMatch('a.js', '*.!(js)'));
  });

  test('"a.js" should not match "a.!(js)"', () => {
    expect_truthy(!isMatch('a.js', 'a.!(js)'));
  });

  test('"a.js" should not match "a.!(js)*"', () => {
    expect_truthy(!isMatch('a.js', 'a.!(js)*'));
  });

  test('"a.js.js" should not match "!(*.js)"', () => {
    expect_truthy(!isMatch('a.js.js', '!(*.js)'));
  });

  test('"a.js.js" should match "*!(.js)"', () => {
    expect_truthy(isMatch('a.js.js', '*!(.js)'));
  });

  test('"a.js.js" should match "*.!(js)"', () => {
    expect_truthy(isMatch('a.js.js', '*.!(js)'));
  });

  test('"a.js.js" should match "*.*(js).js"', () => {
    expect_truthy(isMatch('a.js.js', '*.*(js).js'));
  });

  test('"a.md" should match "!(*.js)"', () => {
    expect_truthy(isMatch('a.md', '!(*.js)'));
  });

  test('"a.md" should match "*!(.js)"', () => {
    expect_truthy(isMatch('a.md', '*!(.js)'));
  });

  test('"a.md" should match "*.!(js)"', () => {
    expect_truthy(isMatch('a.md', '*.!(js)'));
  });

  test('"a.md" should match "a.!(js)"', () => {
    expect_truthy(isMatch('a.md', 'a.!(js)'));
  });

  test('"a.md" should match "a.!(js)*"', () => {
    expect_truthy(isMatch('a.md', 'a.!(js)*'));
  });

  test('"a.md.js" should not match "*.*(js).js"', () => {
    expect_truthy(!isMatch('a.md.js', '*.*(js).js'));
  });

  test('"a.txt" should match "a.!(js)"', () => {
    expect_truthy(isMatch('a.txt', 'a.!(js)'));
  });

  test('"a.txt" should match "a.!(js)*"', () => {
    expect_truthy(isMatch('a.txt', 'a.!(js)*'));
  });

  test('"a/!(z)" should match "a/!(z)"', () => {
    expect_truthy(isMatch('a/!(z)', 'a/!(z)'));
  });

  test('"a/b" should match "a/!(z)"', () => {
    expect_truthy(isMatch('a/b', 'a/!(z)'));
  });

  test('"a/b/c.txt" should not match "*/b/!(*).txt"', () => {
    expect_truthy(!isMatch('a/b/c.txt', '*/b/!(*).txt'));
  });

  test('"a/b/c.txt" should not match "*/b/!(c).txt"', () => {
    expect_truthy(!isMatch('a/b/c.txt', '*/b/!(c).txt'));
  });

  test('"a/b/c.txt" should match "*/b/!(cc).txt"', () => {
    expect_truthy(isMatch('a/b/c.txt', '*/b/!(cc).txt'));
  });

  test('"a/b/cc.txt" should not match "*/b/!(*).txt"', () => {
    expect_truthy(!isMatch('a/b/cc.txt', '*/b/!(*).txt'));
  });

  test('"a/b/cc.txt" should not match "*/b/!(c).txt"', () => {
    expect_truthy(!isMatch('a/b/cc.txt', '*/b/!(c).txt'));
  });

  test('"a/b/cc.txt" should not match "*/b/!(cc).txt"', () => {
    expect_truthy(!isMatch('a/b/cc.txt', '*/b/!(cc).txt'));
  });

  test('"a/dir/foo.txt" should match "*/dir/**/!(bar).txt"', () => {
    expect_truthy(isMatch('a/dir/foo.txt', '*/dir/**/!(bar).txt'));
  });

  test('"a/z" should not match "a/!(z)"', () => {
    expect_truthy(!isMatch('a/z', 'a/!(z)'));
  });

  test('"a\\(b" should not match "a(*b"', () => {
    expect_truthy(!isMatch('a\\(b', 'a(*b'));
  });

  test('"a\\(b" should not match "a(b"', () => {
    expect_truthy(!isMatch('a\\(b', 'a(b'));
  });

  test('"a\\z" should match "a\\z"', () => {
    expect_truthy(isMatch('a\\\\z', 'a\\\\z', { windows: false }));
  });

  test('"a\\z" should match "a\\z"', () => {
    expect_truthy(isMatch('a\\\\z', 'a\\\\z'));
  });

  test('"a\\b" should match "a/b"', () => {
    expect_truthy(isMatch('a\\b', 'a/b', { windows: true }));
  });

  test('"a\\z" should match "a\\z"', () => {
    expect_truthy(isMatch('a\\z', 'a\\\\z', { windows: false }));
  });

  test('"a\\z" should not match "a\\z"', () => {
    expect_truthy(!isMatch('a\\z', 'a\\\\z'));
  });

  test('"aa" should not match "!(a!(b))"', () => {
    expect_truthy(!isMatch('aa', '!(a!(b))'));
  });

  test('"aa" should match "!(a)"', () => {
    expect_truthy(isMatch('aa', '!(a)'));
  });

  test('"aa" should not match "!(a)*"', () => {
    expect_truthy(!isMatch('aa', '!(a)*'));
  });

  test('"aa" should not match "?"', () => {
    expect_truthy(!isMatch('aa', '?'));
  });

  test('"aa" should not match "@(a)b"', () => {
    expect_truthy(!isMatch('aa', '@(a)b'));
  });

  test('"aa" should match "a!(b)*"', () => {
    expect_truthy(isMatch('aa', 'a!(b)*'));
  });

  test('"aa" should not match "a??b"', () => {
    expect_truthy(!isMatch('aa', 'a??b'));
  });

  test('"aa.aa" should not match "(b|a).(a)"', () => {
    expect_truthy(!isMatch('aa.aa', '(b|a).(a)'));
  });

  test('"aa.aa" should not match "@(b|a).@(a)"', () => {
    expect_truthy(!isMatch('aa.aa', '@(b|a).@(a)'));
  });

  test('"aaa" should not match "!(a)*"', () => {
    expect_truthy(!isMatch('aaa', '!(a)*'));
  });

  test('"aaa" should match "a!(b)*"', () => {
    expect_truthy(isMatch('aaa', 'a!(b)*'));
  });

  test('"aaaaaaabababab" should match "*ab"', () => {
    expect_truthy(isMatch('aaaaaaabababab', '*ab'));
  });

  test('"aaac" should match "*(@(a))a@(c)"', () => {
    expect_truthy(isMatch('aaac', '*(@(a))a@(c)'));
  });

  test('"aaaz" should match "[a*(]*z"', () => {
    expect_truthy(isMatch('aaaz', '[a*(]*z'));
  });

  test('"aab" should not match "!(a)*"', () => {
    expect_truthy(!isMatch('aab', '!(a)*'));
  });

  test('"aab" should not match "?"', () => {
    expect_truthy(!isMatch('aab', '?'));
  });

  test('"aab" should not match "??"', () => {
    expect_truthy(!isMatch('aab', '??'));
  });

  test('"aab" should not match "@(c)b"', () => {
    expect_truthy(!isMatch('aab', '@(c)b'));
  });

  test('"aab" should match "a!(b)*"', () => {
    expect_truthy(isMatch('aab', 'a!(b)*'));
  });

  test('"aab" should not match "a??b"', () => {
    expect_truthy(!isMatch('aab', 'a??b'));
  });

  test('"aac" should match "*(@(a))a@(c)"', () => {
    expect_truthy(isMatch('aac', '*(@(a))a@(c)'));
  });

  test('"aac" should not match "*(@(a))b@(c)"', () => {
    expect_truthy(!isMatch('aac', '*(@(a))b@(c)'));
  });

  test('"aax" should not match "a!(a*|b)"', () => {
    expect_truthy(!isMatch('aax', 'a!(a*|b)'));
  });

  test('"aax" should match "a!(x*|b)"', () => {
    expect_truthy(isMatch('aax', 'a!(x*|b)'));
  });

  test('"aax" should match "a?(a*|b)"', () => {
    expect_truthy(isMatch('aax', 'a?(a*|b)'));
  });

  test('"aaz" should match "[a*(]*z"', () => {
    expect_truthy(isMatch('aaz', '[a*(]*z'));
  });

  test('"ab" should match "!(*.*)"', () => {
    expect_truthy(isMatch('ab', '!(*.*)'));
  });

  test('"ab" should match "!(a!(b))"', () => {
    expect_truthy(isMatch('ab', '!(a!(b))'));
  });

  test('"ab" should not match "!(a)*"', () => {
    expect_truthy(!isMatch('ab', '!(a)*'));
  });

  test('"ab" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('ab', '(a+|b)*'));
  });

  test('"ab" should match "(a+|b)+"', () => {
    expect_truthy(isMatch('ab', '(a+|b)+'));
  });

  test('"ab" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('ab', '*?(a)bc'));
  });

  test('"ab" should not match "a!(*(b|B))"', () => {
    expect_truthy(!isMatch('ab', 'a!(*(b|B))'));
  });

  test('"ab" should not match "a!(@(b|B))"', () => {
    expect_truthy(!isMatch('ab', 'a!(@(b|B))'));
  });

  test('"aB" should not match "a!(@(b|B))"', () => {
    expect_truthy(!isMatch('aB', 'a!(@(b|B))'));
  });

  test('"ab" should not match "a!(b)*"', () => {
    expect_truthy(!isMatch('ab', 'a!(b)*'));
  });

  test('"ab" should not match "a(*b"', () => {
    expect_truthy(!isMatch('ab', 'a(*b'));
  });

  test('"ab" should not match "a(b"', () => {
    expect_truthy(!isMatch('ab', 'a(b'));
  });

  test('"ab" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('ab', 'a(b*(foo|bar))d'));
  });

  test('"ab" should not match "a/b"', () => {
    expect_truthy(!isMatch('ab', 'a/b', { windows: true }));
  });

  test('"ab" should not match "a\\(b"', () => {
    expect_truthy(!isMatch('ab', 'a\\(b'));
  });

  test('"ab" should match "ab*(e|f)"', () => {
    expect_truthy(isMatch('ab', 'ab*(e|f)'));
  });

  test('"ab" should match "ab**"', () => {
    expect_truthy(isMatch('ab', 'ab**'));
  });

  test('"ab" should match "ab**(e|f)"', () => {
    expect_truthy(isMatch('ab', 'ab**(e|f)'));
  });

  test('"ab" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('ab', 'ab**(e|f)g'));
  });

  test('"ab" should not match "ab***ef"', () => {
    expect_truthy(!isMatch('ab', 'ab***ef'));
  });

  test('"ab" should not match "ab*+(e|f)"', () => {
    expect_truthy(!isMatch('ab', 'ab*+(e|f)'));
  });

  test('"ab" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('ab', 'ab*d+(e|f)'));
  });

  test('"ab" should not match "ab?*(e|f)"', () => {
    expect_truthy(!isMatch('ab', 'ab?*(e|f)'));
  });

  test('"ab/cXd/efXg/hi" should match "**/*X*/**/*i"', () => {
    expect_truthy(isMatch('ab/cXd/efXg/hi', '**/*X*/**/*i'));
  });

  test('"ab/cXd/efXg/hi" should match "*/*X*/*/*i"', () => {
    expect_truthy(isMatch('ab/cXd/efXg/hi', '*/*X*/*/*i'));
  });

  test('"ab/cXd/efXg/hi" should not match "*X*i"', () => {
    expect_truthy(!isMatch('ab/cXd/efXg/hi', '*X*i'));
  });

  test('"ab/cXd/efXg/hi" should not match "*Xg*i"', () => {
    expect_truthy(!isMatch('ab/cXd/efXg/hi', '*Xg*i'));
  });

  test('"ab]" should match "a!(@(b|B))"', () => {
    expect_truthy(isMatch('ab]', 'a!(@(b|B))'));
  });

  test('"abab" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('abab', '(a+|b)*'));
  });

  test('"abab" should match "(a+|b)+"', () => {
    expect_truthy(isMatch('abab', '(a+|b)+'));
  });

  test('"abab" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('abab', '*?(a)bc'));
  });

  test('"abab" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('abab', 'a(b*(foo|bar))d'));
  });

  test('"abab" should not match "ab*(e|f)"', () => {
    expect_truthy(!isMatch('abab', 'ab*(e|f)'));
  });

  test('"abab" should match "ab**"', () => {
    expect_truthy(isMatch('abab', 'ab**'));
  });

  test('"abab" should match "ab**(e|f)"', () => {
    expect_truthy(isMatch('abab', 'ab**(e|f)'));
  });

  test('"abab" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('abab', 'ab**(e|f)g'));
  });

  test('"abab" should not match "ab***ef"', () => {
    expect_truthy(!isMatch('abab', 'ab***ef'));
  });

  test('"abab" should not match "ab*+(e|f)"', () => {
    expect_truthy(!isMatch('abab', 'ab*+(e|f)'));
  });

  test('"abab" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('abab', 'ab*d+(e|f)'));
  });

  test('"abab" should not match "ab?*(e|f)"', () => {
    expect_truthy(!isMatch('abab', 'ab?*(e|f)'));
  });

  test('"abb" should match "!(*.*)"', () => {
    expect_truthy(isMatch('abb', '!(*.*)'));
  });

  test('"abb" should not match "!(a)*"', () => {
    expect_truthy(!isMatch('abb', '!(a)*'));
  });

  test('"abb" should not match "a!(b)*"', () => {
    expect_truthy(!isMatch('abb', 'a!(b)*'));
  });

  test('"abbcd" should match "@(ab|a*(b))*(c)d"', () => {
    expect_truthy(isMatch('abbcd', '@(ab|a*(b))*(c)d'));
  });

  test('"abc" should not match "\\a\\b\\c"', () => {
    expect_truthy(!isMatch('abc', '\\a\\b\\c'));
  });

  test('"aBc" should match "a!(@(b|B))"', () => {
    expect_truthy(isMatch('aBc', 'a!(@(b|B))'));
  });

  test('"abcd" should match "?@(a|b)*@(c)d"', () => {
    expect_truthy(isMatch('abcd', '?@(a|b)*@(c)d'));
  });

  test('"abcd" should match "@(ab|a*@(b))*(c)d"', () => {
    expect_truthy(isMatch('abcd', '@(ab|a*@(b))*(c)d'));
  });

  test('"abcd/abcdefg/abcdefghijk/abcdefghijklmnop.txt" should match "**/*a*b*g*n*t"', () => {
    expect_truthy(isMatch('abcd/abcdefg/abcdefghijk/abcdefghijklmnop.txt', '**/*a*b*g*n*t'));
  });

  test('"abcd/abcdefg/abcdefghijk/abcdefghijklmnop.txtz" should not match "**/*a*b*g*n*t"', () => {
    expect_truthy(!isMatch('abcd/abcdefg/abcdefghijk/abcdefghijklmnop.txtz', '**/*a*b*g*n*t'));
  });

  test('"abcdef" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('abcdef', '(a+|b)*'));
  });

  test('"abcdef" should not match "(a+|b)+"', () => {
    expect_truthy(!isMatch('abcdef', '(a+|b)+'));
  });

  test('"abcdef" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('abcdef', '*?(a)bc'));
  });

  test('"abcdef" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('abcdef', 'a(b*(foo|bar))d'));
  });

  test('"abcdef" should not match "ab*(e|f)"', () => {
    expect_truthy(!isMatch('abcdef', 'ab*(e|f)'));
  });

  test('"abcdef" should match "ab**"', () => {
    expect_truthy(isMatch('abcdef', 'ab**'));
  });

  test('"abcdef" should match "ab**(e|f)"', () => {
    expect_truthy(isMatch('abcdef', 'ab**(e|f)'));
  });

  test('"abcdef" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('abcdef', 'ab**(e|f)g'));
  });

  test('"abcdef" should match "ab***ef"', () => {
    expect_truthy(isMatch('abcdef', 'ab***ef'));
  });

  test('"abcdef" should match "ab*+(e|f)"', () => {
    expect_truthy(isMatch('abcdef', 'ab*+(e|f)'));
  });

  test('"abcdef" should match "ab*d+(e|f)"', () => {
    expect_truthy(isMatch('abcdef', 'ab*d+(e|f)'));
  });

  test('"abcdef" should not match "ab?*(e|f)"', () => {
    expect_truthy(!isMatch('abcdef', 'ab?*(e|f)'));
  });

  test('"abcfef" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('abcfef', '(a+|b)*'));
  });

  test('"abcfef" should not match "(a+|b)+"', () => {
    expect_truthy(!isMatch('abcfef', '(a+|b)+'));
  });

  test('"abcfef" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('abcfef', '*?(a)bc'));
  });

  test('"abcfef" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('abcfef', 'a(b*(foo|bar))d'));
  });

  test('"abcfef" should not match "ab*(e|f)"', () => {
    expect_truthy(!isMatch('abcfef', 'ab*(e|f)'));
  });

  test('"abcfef" should match "ab**"', () => {
    expect_truthy(isMatch('abcfef', 'ab**'));
  });

  test('"abcfef" should match "ab**(e|f)"', () => {
    expect_truthy(isMatch('abcfef', 'ab**(e|f)'));
  });

  test('"abcfef" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('abcfef', 'ab**(e|f)g'));
  });

  test('"abcfef" should match "ab***ef"', () => {
    expect_truthy(isMatch('abcfef', 'ab***ef'));
  });

  test('"abcfef" should match "ab*+(e|f)"', () => {
    expect_truthy(isMatch('abcfef', 'ab*+(e|f)'));
  });

  test('"abcfef" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('abcfef', 'ab*d+(e|f)'));
  });

  test('"abcfef" should match "ab?*(e|f)"', () => {
    expect_truthy(isMatch('abcfef', 'ab?*(e|f)'));
  });

  test('"abcfefg" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('abcfefg', '(a+|b)*'));
  });

  test('"abcfefg" should not match "(a+|b)+"', () => {
    expect_truthy(!isMatch('abcfefg', '(a+|b)+'));
  });

  test('"abcfefg" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('abcfefg', '*?(a)bc'));
  });

  test('"abcfefg" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('abcfefg', 'a(b*(foo|bar))d'));
  });

  test('"abcfefg" should not match "ab*(e|f)"', () => {
    expect_truthy(!isMatch('abcfefg', 'ab*(e|f)'));
  });

  test('"abcfefg" should match "ab**"', () => {
    expect_truthy(isMatch('abcfefg', 'ab**'));
  });

  test('"abcfefg" should match "ab**(e|f)"', () => {
    expect_truthy(isMatch('abcfefg', 'ab**(e|f)'));
  });

  test('"abcfefg" should match "ab**(e|f)g"', () => {
    expect_truthy(isMatch('abcfefg', 'ab**(e|f)g'));
  });

  test('"abcfefg" should not match "ab***ef"', () => {
    expect_truthy(!isMatch('abcfefg', 'ab***ef'));
  });

  test('"abcfefg" should not match "ab*+(e|f)"', () => {
    expect_truthy(!isMatch('abcfefg', 'ab*+(e|f)'));
  });

  test('"abcfefg" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('abcfefg', 'ab*d+(e|f)'));
  });

  test('"abcfefg" should not match "ab?*(e|f)"', () => {
    expect_truthy(!isMatch('abcfefg', 'ab?*(e|f)'));
  });

  test('"abcx" should match "!([[*])*"', () => {
    expect_truthy(isMatch('abcx', '!([[*])*'));
  });

  test('"abcx" should match "+(a|b\\[)*"', () => {
    expect_truthy(isMatch('abcx', '+(a|b\\[)*'));
  });

  test('"abcx" should not match "[a*(]*z"', () => {
    expect_truthy(!isMatch('abcx', '[a*(]*z'));
  });

  test('"abcXdefXghi" should match "*X*i"', () => {
    expect_truthy(isMatch('abcXdefXghi', '*X*i'));
  });

  test('"abcz" should match "!([[*])*"', () => {
    expect_truthy(isMatch('abcz', '!([[*])*'));
  });

  test('"abcz" should match "+(a|b\\[)*"', () => {
    expect_truthy(isMatch('abcz', '+(a|b\\[)*'));
  });

  test('"abcz" should match "[a*(]*z"', () => {
    expect_truthy(isMatch('abcz', '[a*(]*z'));
  });

  test('"abd" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('abd', '(a+|b)*'));
  });

  test('"abd" should not match "(a+|b)+"', () => {
    expect_truthy(!isMatch('abd', '(a+|b)+'));
  });

  test('"abd" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('abd', '*?(a)bc'));
  });

  test('"abd" should match "a!(*(b|B))"', () => {
    expect_truthy(isMatch('abd', 'a!(*(b|B))'));
  });

  test('"abd" should match "a!(@(b|B))"', () => {
    expect_truthy(isMatch('abd', 'a!(@(b|B))'));
  });

  test('"abd" should not match "a!(@(b|B))d"', () => {
    expect_truthy(!isMatch('abd', 'a!(@(b|B))d'));
  });

  test('"abd" should match "a(b*(foo|bar))d"', () => {
    expect_truthy(isMatch('abd', 'a(b*(foo|bar))d'));
  });

  test('"abd" should match "a+(b|c)d"', () => {
    expect_truthy(isMatch('abd', 'a+(b|c)d'));
  });

  test('"abd" should match "a[b*(foo|bar)]d"', () => {
    expect_truthy(isMatch('abd', 'a[b*(foo|bar)]d'));
  });

  test('"abd" should not match "ab*(e|f)"', () => {
    expect_truthy(!isMatch('abd', 'ab*(e|f)'));
  });

  test('"abd" should match "ab**"', () => {
    expect_truthy(isMatch('abd', 'ab**'));
  });

  test('"abd" should match "ab**(e|f)"', () => {
    expect_truthy(isMatch('abd', 'ab**(e|f)'));
  });

  test('"abd" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('abd', 'ab**(e|f)g'));
  });

  test('"abd" should not match "ab***ef"', () => {
    expect_truthy(!isMatch('abd', 'ab***ef'));
  });

  test('"abd" should not match "ab*+(e|f)"', () => {
    expect_truthy(!isMatch('abd', 'ab*+(e|f)'));
  });

  test('"abd" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('abd', 'ab*d+(e|f)'));
  });

  test('"abd" should match "ab?*(e|f)"', () => {
    expect_truthy(isMatch('abd', 'ab?*(e|f)'));
  });

  test('"abef" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('abef', '(a+|b)*'));
  });

  test('"abef" should not match "(a+|b)+"', () => {
    expect_truthy(!isMatch('abef', '(a+|b)+'));
  });

  test('"abef" should not match "*(a+|b)"', () => {
    expect_truthy(!isMatch('abef', '*(a+|b)'));
  });

  test('"abef" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('abef', '*?(a)bc'));
  });

  test('"abef" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('abef', 'a(b*(foo|bar))d'));
  });

  test('"abef" should match "ab*(e|f)"', () => {
    expect_truthy(isMatch('abef', 'ab*(e|f)'));
  });

  test('"abef" should match "ab**"', () => {
    expect_truthy(isMatch('abef', 'ab**'));
  });

  test('"abef" should match "ab**(e|f)"', () => {
    expect_truthy(isMatch('abef', 'ab**(e|f)'));
  });

  test('"abef" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('abef', 'ab**(e|f)g'));
  });

  test('"abef" should match "ab***ef"', () => {
    expect_truthy(isMatch('abef', 'ab***ef'));
  });

  test('"abef" should match "ab*+(e|f)"', () => {
    expect_truthy(isMatch('abef', 'ab*+(e|f)'));
  });

  test('"abef" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('abef', 'ab*d+(e|f)'));
  });

  test('"abef" should match "ab?*(e|f)"', () => {
    expect_truthy(isMatch('abef', 'ab?*(e|f)'));
  });

  test('"abz" should not match "a!(*)"', () => {
    expect_truthy(!isMatch('abz', 'a!(*)'));
  });

  test('"abz" should match "a!(z)"', () => {
    expect_truthy(isMatch('abz', 'a!(z)'));
  });

  test('"abz" should match "a*!(z)"', () => {
    expect_truthy(isMatch('abz', 'a*!(z)'));
  });

  test('"abz" should not match "a*(z)"', () => {
    expect_truthy(!isMatch('abz', 'a*(z)'));
  });

  test('"abz" should match "a**(z)"', () => {
    expect_truthy(isMatch('abz', 'a**(z)'));
  });

  test('"abz" should match "a*@(z)"', () => {
    expect_truthy(isMatch('abz', 'a*@(z)'));
  });

  test('"abz" should not match "a+(z)"', () => {
    expect_truthy(!isMatch('abz', 'a+(z)'));
  });

  test('"abz" should not match "a?(z)"', () => {
    expect_truthy(!isMatch('abz', 'a?(z)'));
  });

  test('"abz" should not match "a@(z)"', () => {
    expect_truthy(!isMatch('abz', 'a@(z)'));
  });

  test('"ac" should not match "!(a)*"', () => {
    expect_truthy(!isMatch('ac', '!(a)*'));
  });

  test('"ac" should match "*(@(a))a@(c)"', () => {
    expect_truthy(isMatch('ac', '*(@(a))a@(c)'));
  });

  test('"ac" should match "a!(*(b|B))"', () => {
    expect_truthy(isMatch('ac', 'a!(*(b|B))'));
  });

  test('"ac" should match "a!(@(b|B))"', () => {
    expect_truthy(isMatch('ac', 'a!(@(b|B))'));
  });

  test('"ac" should match "a!(b)*"', () => {
    expect_truthy(isMatch('ac', 'a!(b)*'));
  });

  test('"accdef" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('accdef', '(a+|b)*'));
  });

  test('"accdef" should not match "(a+|b)+"', () => {
    expect_truthy(!isMatch('accdef', '(a+|b)+'));
  });

  test('"accdef" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('accdef', '*?(a)bc'));
  });

  test('"accdef" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('accdef', 'a(b*(foo|bar))d'));
  });

  test('"accdef" should not match "ab*(e|f)"', () => {
    expect_truthy(!isMatch('accdef', 'ab*(e|f)'));
  });

  test('"accdef" should not match "ab**"', () => {
    expect_truthy(!isMatch('accdef', 'ab**'));
  });

  test('"accdef" should not match "ab**(e|f)"', () => {
    expect_truthy(!isMatch('accdef', 'ab**(e|f)'));
  });

  test('"accdef" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('accdef', 'ab**(e|f)g'));
  });

  test('"accdef" should not match "ab***ef"', () => {
    expect_truthy(!isMatch('accdef', 'ab***ef'));
  });

  test('"accdef" should not match "ab*+(e|f)"', () => {
    expect_truthy(!isMatch('accdef', 'ab*+(e|f)'));
  });

  test('"accdef" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('accdef', 'ab*d+(e|f)'));
  });

  test('"accdef" should not match "ab?*(e|f)"', () => {
    expect_truthy(!isMatch('accdef', 'ab?*(e|f)'));
  });

  test('"acd" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('acd', '(a+|b)*'));
  });

  test('"acd" should not match "(a+|b)+"', () => {
    expect_truthy(!isMatch('acd', '(a+|b)+'));
  });

  test('"acd" should not match "*?(a)bc"', () => {
    expect_truthy(!isMatch('acd', '*?(a)bc'));
  });

  test('"acd" should match "@(ab|a*(b))*(c)d"', () => {
    expect_truthy(isMatch('acd', '@(ab|a*(b))*(c)d'));
  });

  test('"acd" should match "a!(*(b|B))"', () => {
    expect_truthy(isMatch('acd', 'a!(*(b|B))'));
  });

  test('"acd" should match "a!(@(b|B))"', () => {
    expect_truthy(isMatch('acd', 'a!(@(b|B))'));
  });

  test('"acd" should match "a!(@(b|B))d"', () => {
    expect_truthy(isMatch('acd', 'a!(@(b|B))d'));
  });

  test('"acd" should not match "a(b*(foo|bar))d"', () => {
    expect_truthy(!isMatch('acd', 'a(b*(foo|bar))d'));
  });

  test('"acd" should match "a+(b|c)d"', () => {
    expect_truthy(isMatch('acd', 'a+(b|c)d'));
  });

  test('"acd" should not match "a[b*(foo|bar)]d"', () => {
    expect_truthy(!isMatch('acd', 'a[b*(foo|bar)]d'));
  });

  test('"acd" should not match "ab*(e|f)"', () => {
    expect_truthy(!isMatch('acd', 'ab*(e|f)'));
  });

  test('"acd" should not match "ab**"', () => {
    expect_truthy(!isMatch('acd', 'ab**'));
  });

  test('"acd" should not match "ab**(e|f)"', () => {
    expect_truthy(!isMatch('acd', 'ab**(e|f)'));
  });

  test('"acd" should not match "ab**(e|f)g"', () => {
    expect_truthy(!isMatch('acd', 'ab**(e|f)g'));
  });

  test('"acd" should not match "ab***ef"', () => {
    expect_truthy(!isMatch('acd', 'ab***ef'));
  });

  test('"acd" should not match "ab*+(e|f)"', () => {
    expect_truthy(!isMatch('acd', 'ab*+(e|f)'));
  });

  test('"acd" should not match "ab*d+(e|f)"', () => {
    expect_truthy(!isMatch('acd', 'ab*d+(e|f)'));
  });

  test('"acd" should not match "ab?*(e|f)"', () => {
    expect_truthy(!isMatch('acd', 'ab?*(e|f)'));
  });

  test('"ax" should match "?(a*|b)"', () => {
    expect_truthy(isMatch('ax', '?(a*|b)'));
  });

  test('"ax" should not match "a?(b*)"', () => {
    expect_truthy(!isMatch('ax', 'a?(b*)'));
  });

  test('"axz" should not match "a+(z)"', () => {
    expect_truthy(!isMatch('axz', 'a+(z)'));
  });

  test('"az" should not match "a!(*)"', () => {
    expect_truthy(!isMatch('az', 'a!(*)'));
  });

  test('"az" should not match "a!(z)"', () => {
    expect_truthy(!isMatch('az', 'a!(z)'));
  });

  test('"az" should match "a*!(z)"', () => {
    expect_truthy(isMatch('az', 'a*!(z)'));
  });

  test('"az" should match "a*(z)"', () => {
    expect_truthy(isMatch('az', 'a*(z)'));
  });

  test('"az" should match "a**(z)"', () => {
    expect_truthy(isMatch('az', 'a**(z)'));
  });

  test('"az" should match "a*@(z)"', () => {
    expect_truthy(isMatch('az', 'a*@(z)'));
  });

  test('"az" should match "a+(z)"', () => {
    expect_truthy(isMatch('az', 'a+(z)'));
  });

  test('"az" should match "a?(z)"', () => {
    expect_truthy(isMatch('az', 'a?(z)'));
  });

  test('"az" should match "a@(z)"', () => {
    expect_truthy(isMatch('az', 'a@(z)'));
  });

  test('"az" should not match "a\\z"', () => {
    expect_truthy(!isMatch('az', 'a\\\\z', { windows: false }));
  });

  test('"az" should not match "a\\z"', () => {
    expect_truthy(!isMatch('az', 'a\\\\z'));
  });

  test('"b" should match "!(a)*"', () => {
    expect_truthy(isMatch('b', '!(a)*'));
  });

  test('"b" should match "(a+|b)*"', () => {
    expect_truthy(isMatch('b', '(a+|b)*'));
  });

  test('"b" should not match "a!(b)*"', () => {
    expect_truthy(!isMatch('b', 'a!(b)*'));
  });

  test('"b.a" should match "(b|a).(a)"', () => {
    expect_truthy(isMatch('b.a', '(b|a).(a)'));
  });

  test('"b.a" should match "@(b|a).@(a)"', () => {
    expect_truthy(isMatch('b.a', '@(b|a).@(a)'));
  });

  test('"b/a" should not match "!(b/a)"', () => {
    expect_truthy(!isMatch('b/a', '!(b/a)'));
  });

  test('"b/b" should match "!(b/a)"', () => {
    expect_truthy(isMatch('b/b', '!(b/a)'));
  });

  test('"b/c" should match "!(b/a)"', () => {
    expect_truthy(isMatch('b/c', '!(b/a)'));
  });

  test('"b/c" should not match "b/!(c)"', () => {
    expect_truthy(!isMatch('b/c', 'b/!(c)'));
  });

  test('"b/c" should match "b/!(cc)"', () => {
    expect_truthy(isMatch('b/c', 'b/!(cc)'));
  });

  test('"b/c.txt" should not match "b/!(c).txt"', () => {
    expect_truthy(!isMatch('b/c.txt', 'b/!(c).txt'));
  });

  test('"b/c.txt" should match "b/!(cc).txt"', () => {
    expect_truthy(isMatch('b/c.txt', 'b/!(cc).txt'));
  });

  test('"b/cc" should match "b/!(c)"', () => {
    expect_truthy(isMatch('b/cc', 'b/!(c)'));
  });

  test('"b/cc" should not match "b/!(cc)"', () => {
    expect_truthy(!isMatch('b/cc', 'b/!(cc)'));
  });

  test('"b/cc.txt" should not match "b/!(c).txt"', () => {
    expect_truthy(!isMatch('b/cc.txt', 'b/!(c).txt'));
  });

  test('"b/cc.txt" should not match "b/!(cc).txt"', () => {
    expect_truthy(!isMatch('b/cc.txt', 'b/!(cc).txt'));
  });

  test('"b/ccc" should match "b/!(c)"', () => {
    expect_truthy(isMatch('b/ccc', 'b/!(c)'));
  });

  test('"ba" should match "!(a!(b))"', () => {
    expect_truthy(isMatch('ba', '!(a!(b))'));
  });

  test('"ba" should match "b?(a|b)"', () => {
    expect_truthy(isMatch('ba', 'b?(a|b)'));
  });

  test('"baaac" should not match "*(@(a))a@(c)"', () => {
    expect_truthy(!isMatch('baaac', '*(@(a))a@(c)'));
  });

  test('"bar" should match "!(foo)"', () => {
    expect_truthy(isMatch('bar', '!(foo)'));
  });

  test('"bar" should match "!(foo)*"', () => {
    expect_truthy(isMatch('bar', '!(foo)*'));
  });

  test('"bar" should match "!(foo)b*"', () => {
    expect_truthy(isMatch('bar', '!(foo)b*'));
  });

  test('"bar" should match "*(!(foo))"', () => {
    expect_truthy(isMatch('bar', '*(!(foo))'));
  });

  test('"baz" should match "!(foo)*"', () => {
    expect_truthy(isMatch('baz', '!(foo)*'));
  });

  test('"baz" should match "!(foo)b*"', () => {
    expect_truthy(isMatch('baz', '!(foo)b*'));
  });

  test('"baz" should match "*(!(foo))"', () => {
    expect_truthy(isMatch('baz', '*(!(foo))'));
  });

  test('"bb" should match "!(a!(b))"', () => {
    expect_truthy(isMatch('bb', '!(a!(b))'));
  });

  test('"bb" should match "!(a)*"', () => {
    expect_truthy(isMatch('bb', '!(a)*'));
  });

  test('"bb" should not match "a!(b)*"', () => {
    expect_truthy(!isMatch('bb', 'a!(b)*'));
  });

  test('"bb" should not match "a?(a|b)"', () => {
    expect_truthy(!isMatch('bb', 'a?(a|b)'));
  });

  test('"bbc" should match "!([[*])*"', () => {
    expect_truthy(isMatch('bbc', '!([[*])*'));
  });

  test('"bbc" should not match "+(a|b\\[)*"', () => {
    expect_truthy(!isMatch('bbc', '+(a|b\\[)*'));
  });

  test('"bbc" should not match "[a*(]*z"', () => {
    expect_truthy(!isMatch('bbc', '[a*(]*z'));
  });

  test('"bz" should not match "a+(z)"', () => {
    expect_truthy(!isMatch('bz', 'a+(z)'));
  });

  test('"c" should not match "*(@(a))a@(c)"', () => {
    expect_truthy(!isMatch('c', '*(@(a))a@(c)'));
  });

  test('"c.a" should not match "!(*.[a-b]*)"', () => {
    expect_truthy(!isMatch('c.a', '!(*.[a-b]*)'));
  });

  test('"c.a" should match "!(*[a-b].[a-b]*)"', () => {
    expect_truthy(isMatch('c.a', '!(*[a-b].[a-b]*)'));
  });

  test('"c.a" should not match "!*.(a|b)"', () => {
    expect_truthy(!isMatch('c.a', '!*.(a|b)'));
  });

  test('"c.a" should not match "!*.(a|b)*"', () => {
    expect_truthy(!isMatch('c.a', '!*.(a|b)*'));
  });

  test('"c.a" should not match "(b|a).(a)"', () => {
    expect_truthy(!isMatch('c.a', '(b|a).(a)'));
  });

  test('"c.a" should not match "*.!(a)"', () => {
    expect_truthy(!isMatch('c.a', '*.!(a)'));
  });

  test('"c.a" should not match "*.+(b|d)"', () => {
    expect_truthy(!isMatch('c.a', '*.+(b|d)'));
  });

  test('"c.a" should not match "@(b|a).@(a)"', () => {
    expect_truthy(!isMatch('c.a', '@(b|a).@(a)'));
  });

  test('"c.c" should not match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(!isMatch('c.c', '!(*.a|*.b|*.c)'));
  });

  test('"c.c" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('c.c', '*!(.a|.b|.c)'));
  });

  test('"c.c" should not match "*.!(a|b|c)"', () => {
    expect_truthy(!isMatch('c.c', '*.!(a|b|c)'));
  });

  test('"c.c" should not match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(!isMatch('c.c', '*.(a|b|@(ab|a*@(b))*(c)d)'));
  });

  test('"c.ccc" should match "!(*.[a-b]*)"', () => {
    expect_truthy(isMatch('c.ccc', '!(*.[a-b]*)'));
  });

  test('"c.ccc" should match "!(*[a-b].[a-b]*)"', () => {
    expect_truthy(isMatch('c.ccc', '!(*[a-b].[a-b]*)'));
  });

  test('"c.js" should not match "!(*.js)"', () => {
    expect_truthy(!isMatch('c.js', '!(*.js)'));
  });

  test('"c.js" should match "*!(.js)"', () => {
    expect_truthy(isMatch('c.js', '*!(.js)'));
  });

  test('"c.js" should not match "*.!(js)"', () => {
    expect_truthy(!isMatch('c.js', '*.!(js)'));
  });

  test('"c/a/v" should match "c/!(z)/v"', () => {
    expect_truthy(isMatch('c/a/v', 'c/!(z)/v'));
  });

  test('"c/a/v" should not match "c/*(z)/v"', () => {
    expect_truthy(!isMatch('c/a/v', 'c/*(z)/v'));
  });

  test('"c/a/v" should not match "c/+(z)/v"', () => {
    expect_truthy(!isMatch('c/a/v', 'c/+(z)/v'));
  });

  test('"c/a/v" should not match "c/@(z)/v"', () => {
    expect_truthy(!isMatch('c/a/v', 'c/@(z)/v'));
  });

  test('"c/z/v" should not match "*(z)"', () => {
    expect_truthy(!isMatch('c/z/v', '*(z)'));
  });

  test('"c/z/v" should not match "+(z)"', () => {
    expect_truthy(!isMatch('c/z/v', '+(z)'));
  });

  test('"c/z/v" should not match "?(z)"', () => {
    expect_truthy(!isMatch('c/z/v', '?(z)'));
  });

  test('"c/z/v" should not match "c/!(z)/v"', () => {
    expect_truthy(!isMatch('c/z/v', 'c/!(z)/v'));
  });

  test('"c/z/v" should match "c/*(z)/v"', () => {
    expect_truthy(isMatch('c/z/v', 'c/*(z)/v'));
  });

  test('"c/z/v" should match "c/+(z)/v"', () => {
    expect_truthy(isMatch('c/z/v', 'c/+(z)/v'));
  });

  test('"c/z/v" should match "c/@(z)/v"', () => {
    expect_truthy(isMatch('c/z/v', 'c/@(z)/v'));
  });

  test('"c/z/v" should match "c/z/v"', () => {
    expect_truthy(isMatch('c/z/v', 'c/z/v'));
  });

  test('"cc.a" should not match "(b|a).(a)"', () => {
    expect_truthy(!isMatch('cc.a', '(b|a).(a)'));
  });

  test('"cc.a" should not match "@(b|a).@(a)"', () => {
    expect_truthy(!isMatch('cc.a', '@(b|a).@(a)'));
  });

  test('"ccc" should match "!(a)*"', () => {
    expect_truthy(isMatch('ccc', '!(a)*'));
  });

  test('"ccc" should not match "a!(b)*"', () => {
    expect_truthy(!isMatch('ccc', 'a!(b)*'));
  });

  test('"cow" should match "!(*.*)"', () => {
    expect_truthy(isMatch('cow', '!(*.*)'));
  });

  test('"cow" should not match "!(*.*)."', () => {
    expect_truthy(!isMatch('cow', '!(*.*).'));
  });

  test('"cow" should not match ".!(*.*)"', () => {
    expect_truthy(!isMatch('cow', '.!(*.*)'));
  });

  test('"cz" should not match "a!(*)"', () => {
    expect_truthy(!isMatch('cz', 'a!(*)'));
  });

  test('"cz" should not match "a!(z)"', () => {
    expect_truthy(!isMatch('cz', 'a!(z)'));
  });

  test('"cz" should not match "a*!(z)"', () => {
    expect_truthy(!isMatch('cz', 'a*!(z)'));
  });

  test('"cz" should not match "a*(z)"', () => {
    expect_truthy(!isMatch('cz', 'a*(z)'));
  });

  test('"cz" should not match "a**(z)"', () => {
    expect_truthy(!isMatch('cz', 'a**(z)'));
  });

  test('"cz" should not match "a*@(z)"', () => {
    expect_truthy(!isMatch('cz', 'a*@(z)'));
  });

  test('"cz" should not match "a+(z)"', () => {
    expect_truthy(!isMatch('cz', 'a+(z)'));
  });

  test('"cz" should not match "a?(z)"', () => {
    expect_truthy(!isMatch('cz', 'a?(z)'));
  });

  test('"cz" should not match "a@(z)"', () => {
    expect_truthy(!isMatch('cz', 'a@(z)'));
  });

  test('"d.a.d" should not match "!(*.[a-b]*)"', () => {
    expect_truthy(!isMatch('d.a.d', '!(*.[a-b]*)'));
  });

  test('"d.a.d" should match "!(*[a-b].[a-b]*)"', () => {
    expect_truthy(isMatch('d.a.d', '!(*[a-b].[a-b]*)'));
  });

  test('"d.a.d" should not match "!*.(a|b)*"', () => {
    expect_truthy(!isMatch('d.a.d', '!*.(a|b)*'));
  });

  test('"d.a.d" should match "!*.*(a|b)"', () => {
    expect_truthy(isMatch('d.a.d', '!*.*(a|b)'));
  });

  test('"d.a.d" should not match "!*.{a,b}*"', () => {
    expect_truthy(!isMatch('d.a.d', '!*.{a,b}*'));
  });

  test('"d.a.d" should match "*.!(a)"', () => {
    expect_truthy(isMatch('d.a.d', '*.!(a)'));
  });

  test('"d.a.d" should match "*.+(b|d)"', () => {
    expect_truthy(isMatch('d.a.d', '*.+(b|d)'));
  });

  test('"d.d" should match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(isMatch('d.d', '!(*.a|*.b|*.c)'));
  });

  test('"d.d" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('d.d', '*!(.a|.b|.c)'));
  });

  test('"d.d" should match "*.!(a|b|c)"', () => {
    expect_truthy(isMatch('d.d', '*.!(a|b|c)'));
  });

  test('"d.d" should not match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(!isMatch('d.d', '*.(a|b|@(ab|a*@(b))*(c)d)'));
  });

  test('"d.js.d" should match "!(*.js)"', () => {
    expect_truthy(isMatch('d.js.d', '!(*.js)'));
  });

  test('"d.js.d" should match "*!(.js)"', () => {
    expect_truthy(isMatch('d.js.d', '*!(.js)'));
  });

  test('"d.js.d" should match "*.!(js)"', () => {
    expect_truthy(isMatch('d.js.d', '*.!(js)'));
  });

  test('"dd.aa.d" should not match "(b|a).(a)"', () => {
    expect_truthy(!isMatch('dd.aa.d', '(b|a).(a)'));
  });

  test('"dd.aa.d" should not match "@(b|a).@(a)"', () => {
    expect_truthy(!isMatch('dd.aa.d', '@(b|a).@(a)'));
  });

  test('"def" should not match "()ef"', () => {
    expect_truthy(!isMatch('def', '()ef'));
  });

  test('"e.e" should match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(isMatch('e.e', '!(*.a|*.b|*.c)'));
  });

  test('"e.e" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('e.e', '*!(.a|.b|.c)'));
  });

  test('"e.e" should match "*.!(a|b|c)"', () => {
    expect_truthy(isMatch('e.e', '*.!(a|b|c)'));
  });

  test('"e.e" should not match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(!isMatch('e.e', '*.(a|b|@(ab|a*@(b))*(c)d)'));
  });

  test('"ef" should match "()ef"', () => {
    expect_truthy(isMatch('ef', '()ef'));
  });

  test('"effgz" should match "@(b+(c)d|e*(f)g?|?(h)i@(j|k))"', () => {
    expect_truthy(isMatch('effgz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))'));
  });

  test('"efgz" should match "@(b+(c)d|e*(f)g?|?(h)i@(j|k))"', () => {
    expect_truthy(isMatch('efgz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))'));
  });

  test('"egz" should match "@(b+(c)d|e*(f)g?|?(h)i@(j|k))"', () => {
    expect_truthy(isMatch('egz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))'));
  });

  test('"egz" should not match "@(b+(c)d|e+(f)g?|?(h)i@(j|k))"', () => {
    expect_truthy(!isMatch('egz', '@(b+(c)d|e+(f)g?|?(h)i@(j|k))'));
  });

  test('"egzefffgzbcdij" should match "*(b+(c)d|e*(f)g?|?(h)i@(j|k))"', () => {
    expect_truthy(isMatch('egzefffgzbcdij', '*(b+(c)d|e*(f)g?|?(h)i@(j|k))'));
  });

  test('"f" should not match "!(f!(o))"', () => {
    expect_truthy(!isMatch('f', '!(f!(o))'));
  });

  test('"f" should match "!(f(o))"', () => {
    expect_truthy(isMatch('f', '!(f(o))'));
  });

  test('"f" should not match "!(f)"', () => {
    expect_truthy(!isMatch('f', '!(f)'));
  });

  test('"f" should not match "*(!(f))"', () => {
    expect_truthy(!isMatch('f', '*(!(f))'));
  });

  test('"f" should not match "+(!(f))"', () => {
    expect_truthy(!isMatch('f', '+(!(f))'));
  });

  test('"f.a" should not match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(!isMatch('f.a', '!(*.a|*.b|*.c)'));
  });

  test('"f.a" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('f.a', '*!(.a|.b|.c)'));
  });

  test('"f.a" should not match "*.!(a|b|c)"', () => {
    expect_truthy(!isMatch('f.a', '*.!(a|b|c)'));
  });

  test('"f.f" should match "!(*.a|*.b|*.c)"', () => {
    expect_truthy(isMatch('f.f', '!(*.a|*.b|*.c)'));
  });

  test('"f.f" should match "*!(.a|.b|.c)"', () => {
    expect_truthy(isMatch('f.f', '*!(.a|.b|.c)'));
  });

  test('"f.f" should match "*.!(a|b|c)"', () => {
    expect_truthy(isMatch('f.f', '*.!(a|b|c)'));
  });

  test('"f.f" should not match "*.(a|b|@(ab|a*@(b))*(c)d)"', () => {
    expect_truthy(!isMatch('f.f', '*.(a|b|@(ab|a*@(b))*(c)d)'));
  });

  test('"fa" should not match "!(f!(o))"', () => {
    expect_truthy(!isMatch('fa', '!(f!(o))'));
  });

  test('"fa" should match "!(f(o))"', () => {
    expect_truthy(isMatch('fa', '!(f(o))'));
  });

  test('"fb" should not match "!(f!(o))"', () => {
    expect_truthy(!isMatch('fb', '!(f!(o))'));
  });

  test('"fb" should match "!(f(o))"', () => {
    expect_truthy(isMatch('fb', '!(f(o))'));
  });

  test('"fff" should match "!(f)"', () => {
    expect_truthy(isMatch('fff', '!(f)'));
  });

  test('"fff" should match "*(!(f))"', () => {
    expect_truthy(isMatch('fff', '*(!(f))'));
  });

  test('"fff" should match "+(!(f))"', () => {
    expect_truthy(isMatch('fff', '+(!(f))'));
  });

  test('"fffooofoooooffoofffooofff" should match "*(*(f)*(o))"', () => {
    expect_truthy(isMatch('fffooofoooooffoofffooofff', '*(*(f)*(o))'));
  });

  test('"ffo" should match "*(f*(o))"', () => {
    expect_truthy(isMatch('ffo', '*(f*(o))'));
  });

  test('"file.C" should not match "*.c?(c)"', () => {
    expect_truthy(!isMatch('file.C', '*.c?(c)'));
  });

  test('"file.c" should match "*.c?(c)"', () => {
    expect_truthy(isMatch('file.c', '*.c?(c)'));
  });

  test('"file.cc" should match "*.c?(c)"', () => {
    expect_truthy(isMatch('file.cc', '*.c?(c)'));
  });

  test('"file.ccc" should not match "*.c?(c)"', () => {
    expect_truthy(!isMatch('file.ccc', '*.c?(c)'));
  });

  test('"fo" should match "!(f!(o))"', () => {
    expect_truthy(isMatch('fo', '!(f!(o))'));
  });

  test('"fo" should not match "!(f(o))"', () => {
    expect_truthy(!isMatch('fo', '!(f(o))'));
  });

  test('"fofo" should match "*(f*(o))"', () => {
    expect_truthy(isMatch('fofo', '*(f*(o))'));
  });

  test('"fofoofoofofoo" should match "*(fo|foo)"', () => {
    expect_truthy(isMatch('fofoofoofofoo', '*(fo|foo)'));
  });

  test('"fofoofoofofoo" should match "*(fo|foo)"', () => {
    expect_truthy(isMatch('fofoofoofofoo', '*(fo|foo)'));
  });

  test('"foo" should match "!(!(foo))"', () => {
    expect_truthy(isMatch('foo', '!(!(foo))'));
  });

  test('"foo" should match "!(f)"', () => {
    expect_truthy(isMatch('foo', '!(f)'));
  });

  test('"foo" should not match "!(foo)"', () => {
    expect_truthy(!isMatch('foo', '!(foo)'));
  });

  test('"foo" should not match "!(foo)*"', () => {
    expect_truthy(!isMatch('foo', '!(foo)*'));
  });

  test('"foo" should not match "!(foo)*"', () => {
    expect_truthy(!isMatch('foo', '!(foo)*'));
  });

  test('"foo" should not match "!(foo)+"', () => {
    expect_truthy(!isMatch('foo', '!(foo)+'));
  });

  test('"foo" should not match "!(foo)b*"', () => {
    expect_truthy(!isMatch('foo', '!(foo)b*'));
  });

  test('"foo" should match "!(x)"', () => {
    expect_truthy(isMatch('foo', '!(x)'));
  });

  test('"foo" should match "!(x)*"', () => {
    expect_truthy(isMatch('foo', '!(x)*'));
  });

  test('"foo" should match "*"', () => {
    expect_truthy(isMatch('foo', '*'));
  });

  test('"foo" should match "*(!(f))"', () => {
    expect_truthy(isMatch('foo', '*(!(f))'));
  });

  test('"foo" should not match "*(!(foo))"', () => {
    expect_truthy(!isMatch('foo', '*(!(foo))'));
  });

  test('"foo" should not match "*(@(a))a@(c)"', () => {
    expect_truthy(!isMatch('foo', '*(@(a))a@(c)'));
  });

  test('"foo" should match "*(@(foo))"', () => {
    expect_truthy(isMatch('foo', '*(@(foo))'));
  });

  test('"foo" should not match "*(a|b\\[)"', () => {
    expect_truthy(!isMatch('foo', '*(a|b\\[)'));
  });

  test('"foo" should match "*(a|b\\[)|f*"', () => {
    expect_truthy(isMatch('foo', '*(a|b\\[)|f*'));
  });

  test('"foo" should match "@(*(a|b\\[)|f*)"', () => {
    expect_truthy(isMatch('foo', '@(*(a|b\\[)|f*)'));
  });

  test('"foo" should not match "*/*/*"', () => {
    expect_truthy(!isMatch('foo', '*/*/*'));
  });

  test('"foo" should not match "*f"', () => {
    expect_truthy(!isMatch('foo', '*f'));
  });

  test('"foo" should match "*foo*"', () => {
    expect_truthy(isMatch('foo', '*foo*'));
  });

  test('"foo" should match "+(!(f))"', () => {
    expect_truthy(isMatch('foo', '+(!(f))'));
  });

  test('"foo" should not match "??"', () => {
    expect_truthy(!isMatch('foo', '??'));
  });

  test('"foo" should match "???"', () => {
    expect_truthy(isMatch('foo', '???'));
  });

  test('"foo" should not match "bar"', () => {
    expect_truthy(!isMatch('foo', 'bar'));
  });

  test('"foo" should match "f*"', () => {
    expect_truthy(isMatch('foo', 'f*'));
  });

  test('"foo" should not match "fo"', () => {
    expect_truthy(!isMatch('foo', 'fo'));
  });

  test('"foo" should match "foo"', () => {
    expect_truthy(isMatch('foo', 'foo'));
  });

  test('"foo" should match "{*(a|b\\[),f*}"', () => {
    expect_truthy(isMatch('foo', '{*(a|b\\[),f*}'));
  });

  test('"foo*" should match "foo\\*"', () => {
    expect_truthy(isMatch('foo*', 'foo\\*', { windows: false }));
  });

  test('"foo*bar" should match "foo\\*bar"', () => {
    expect_truthy(isMatch('foo*bar', 'foo\\*bar'));
  });

  test('"foo.js" should not match "!(foo).js"', () => {
    expect_truthy(!isMatch('foo.js', '!(foo).js'));
  });

  test('"foo.js.js" should match "*.!(js)"', () => {
    expect_truthy(isMatch('foo.js.js', '*.!(js)'));
  });

  test('"foo.js.js" should not match "*.!(js)*"', () => {
    expect_truthy(!isMatch('foo.js.js', '*.!(js)*'));
  });

  test('"foo.js.js" should not match "*.!(js)*.!(js)"', () => {
    expect_truthy(!isMatch('foo.js.js', '*.!(js)*.!(js)'));
  });

  test('"foo.js.js" should not match "*.!(js)+"', () => {
    expect_truthy(!isMatch('foo.js.js', '*.!(js)+'));
  });

  test('"foo.txt" should match "**/!(bar).txt"', () => {
    expect_truthy(isMatch('foo.txt', '**/!(bar).txt'));
  });

  test('"foo/bar" should not match "*/*/*"', () => {
    expect_truthy(!isMatch('foo/bar', '*/*/*'));
  });

  test('"foo/bar" should match "foo/!(foo)"', () => {
    expect_truthy(isMatch('foo/bar', 'foo/!(foo)'));
  });

  test('"foo/bar" should match "foo/*"', () => {
    expect_truthy(isMatch('foo/bar', 'foo/*'));
  });

  test('"foo/bar" should match "foo/bar"', () => {
    expect_truthy(isMatch('foo/bar', 'foo/bar'));
  });

  test('"foo/bar" should not match "foo?bar"', () => {
    expect_truthy(!isMatch('foo/bar', 'foo?bar'));
  });

  test('"foo/bar" should match "foo[/]bar"', () => {
    expect_truthy(isMatch('foo/bar', 'foo[/]bar'));
  });

  test('"foo/bar/baz.jsx" should match "foo/bar/**/*.+(js|jsx)"', () => {
    expect_truthy(isMatch('foo/bar/baz.jsx', 'foo/bar/**/*.+(js|jsx)'));
  });

  test('"foo/bar/baz.jsx" should match "foo/bar/*.+(js|jsx)"', () => {
    expect_truthy(isMatch('foo/bar/baz.jsx', 'foo/bar/*.+(js|jsx)'));
  });

  test('"foo/bb/aa/rr" should match "**/**/**"', () => {
    expect_truthy(isMatch('foo/bb/aa/rr', '**/**/**'));
  });

  test('"foo/bb/aa/rr" should not match "*/*/*"', () => {
    expect_truthy(!isMatch('foo/bb/aa/rr', '*/*/*'));
  });

  test('"foo/bba/arr" should match "*/*/*"', () => {
    expect_truthy(isMatch('foo/bba/arr', '*/*/*'));
  });

  test('"foo/bba/arr" should not match "foo*"', () => {
    expect_truthy(!isMatch('foo/bba/arr', 'foo*'));
  });

  test('"foo/bba/arr" should not match "foo**"', () => {
    expect_truthy(!isMatch('foo/bba/arr', 'foo**'));
  });

  test('"foo/bba/arr" should not match "foo/*"', () => {
    expect_truthy(!isMatch('foo/bba/arr', 'foo/*'));
  });

  test('"foo/bba/arr" should match "foo/**"', () => {
    expect_truthy(isMatch('foo/bba/arr', 'foo/**'));
  });

  test('"foo/bba/arr" should not match "foo/**arr"', () => {
    expect_truthy(!isMatch('foo/bba/arr', 'foo/**arr'));
  });

  test('"foo/bba/arr" should not match "foo/**z"', () => {
    expect_truthy(!isMatch('foo/bba/arr', 'foo/**z'));
  });

  test('"foo/bba/arr" should not match "foo/*arr"', () => {
    expect_truthy(!isMatch('foo/bba/arr', 'foo/*arr'));
  });

  test('"foo/bba/arr" should not match "foo/*z"', () => {
    expect_truthy(!isMatch('foo/bba/arr', 'foo/*z'));
  });

  test('"foob" should not match "!(foo)b*"', () => {
    expect_truthy(!isMatch('foob', '!(foo)b*'));
  });

  test('"foob" should not match "(foo)bb"', () => {
    expect_truthy(!isMatch('foob', '(foo)bb'));
  });

  test('"foobar" should match "!(foo)"', () => {
    expect_truthy(isMatch('foobar', '!(foo)'));
  });

  test('"foobar" should not match "!(foo)*"', () => {
    expect_truthy(!isMatch('foobar', '!(foo)*'));
  });

  test('"foobar" should not match "!(foo)*"', () => {
    expect_truthy(!isMatch('foobar', '!(foo)*'));
  });

  test('"foobar" should not match "!(foo)b*"', () => {
    expect_truthy(!isMatch('foobar', '!(foo)b*'));
  });

  test('"foobar" should match "*(!(foo))"', () => {
    expect_truthy(isMatch('foobar', '*(!(foo))'));
  });

  test('"foobar" should match "*ob*a*r*"', () => {
    expect_truthy(isMatch('foobar', '*ob*a*r*'));
  });

  test('"foobar" should not match "foo\\*bar"', () => {
    expect_truthy(!isMatch('foobar', 'foo\\*bar'));
  });

  test('"foobb" should not match "!(foo)b*"', () => {
    expect_truthy(!isMatch('foobb', '!(foo)b*'));
  });

  test('"foobb" should match "(foo)bb"', () => {
    expect_truthy(isMatch('foobb', '(foo)bb'));
  });

  test('"(foo)bb" should match "\\(foo\\)bb"', () => {
    expect_truthy(isMatch('(foo)bb', '\\(foo\\)bb'));
  });

  test('"foofoofo" should match "@(foo|f|fo)*(f|of+(o))"', () => {
    expect_truthy(isMatch('foofoofo', '@(foo|f|fo)*(f|of+(o))'));
  });

  test('"foofoofo" should match "@(foo|f|fo)*(f|of+(o))"', () => {
    expect_truthy(isMatch('foofoofo', '@(foo|f|fo)*(f|of+(o))'));
  });

  test('"fooofoofofooo" should match "*(f*(o))"', () => {
    expect_truthy(isMatch('fooofoofofooo', '*(f*(o))'));
  });

  test('"foooofo" should match "*(f*(o))"', () => {
    expect_truthy(isMatch('foooofo', '*(f*(o))'));
  });

  test('"foooofof" should match "*(f*(o))"', () => {
    expect_truthy(isMatch('foooofof', '*(f*(o))'));
  });

  test('"foooofof" should not match "*(f+(o))"', () => {
    expect_truthy(!isMatch('foooofof', '*(f+(o))'));
  });

  test('"foooofofx" should not match "*(f*(o))"', () => {
    expect_truthy(!isMatch('foooofofx', '*(f*(o))'));
  });

  test('"foooxfooxfoxfooox" should match "*(f*(o)x)"', () => {
    expect_truthy(isMatch('foooxfooxfoxfooox', '*(f*(o)x)'));
  });

  test('"foooxfooxfxfooox" should match "*(f*(o)x)"', () => {
    expect_truthy(isMatch('foooxfooxfxfooox', '*(f*(o)x)'));
  });

  test('"foooxfooxofoxfooox" should not match "*(f*(o)x)"', () => {
    expect_truthy(!isMatch('foooxfooxofoxfooox', '*(f*(o)x)'));
  });

  test('"foot" should match "@(!(z*)|*x)"', () => {
    expect_truthy(isMatch('foot', '@(!(z*)|*x)'));
  });

  test('"foox" should match "@(!(z*)|*x)"', () => {
    expect_truthy(isMatch('foox', '@(!(z*)|*x)'));
  });

  test('"fz" should not match "*(z)"', () => {
    expect_truthy(!isMatch('fz', '*(z)'));
  });

  test('"fz" should not match "+(z)"', () => {
    expect_truthy(!isMatch('fz', '+(z)'));
  });

  test('"fz" should not match "?(z)"', () => {
    expect_truthy(!isMatch('fz', '?(z)'));
  });

  test('"moo.cow" should not match "!(moo).!(cow)"', () => {
    expect_truthy(!isMatch('moo.cow', '!(moo).!(cow)'));
  });

  test('"moo.cow" should not match "!(*).!(*)"', () => {
    expect_truthy(!isMatch('moo.cow', '!(*).!(*)'));
  });

  test('"moo.cow" should not match "!(*.*).!(*.*)"', () => {
    expect_truthy(!isMatch('moo.cow', '!(*.*).!(*.*)'));
  });

  test('"mad.moo.cow" should not match "!(*.*).!(*.*)"', () => {
    expect_truthy(!isMatch('mad.moo.cow', '!(*.*).!(*.*)'));
  });

  test('"mad.moo.cow" should not match ".!(*.*)"', () => {
    expect_truthy(!isMatch('mad.moo.cow', '.!(*.*)'));
  });

  test('"Makefile" should match "!(*.c|*.h|Makefile.in|config*|README)"', () => {
    expect_truthy(isMatch('Makefile', '!(*.c|*.h|Makefile.in|config*|README)'));
  });

  test('"Makefile.in" should not match "!(*.c|*.h|Makefile.in|config*|README)"', () => {
    expect_truthy(!isMatch('Makefile.in', '!(*.c|*.h|Makefile.in|config*|README)'));
  });

  test('"moo" should match "!(*.*)"', () => {
    expect_truthy(isMatch('moo', '!(*.*)'));
  });

  test('"moo" should not match "!(*.*)."', () => {
    expect_truthy(!isMatch('moo', '!(*.*).'));
  });

  test('"moo" should not match ".!(*.*)"', () => {
    expect_truthy(!isMatch('moo', '.!(*.*)'));
  });

  test('"moo.cow" should not match "!(*.*)"', () => {
    expect_truthy(!isMatch('moo.cow', '!(*.*)'));
  });

  test('"moo.cow" should not match "!(*.*)."', () => {
    expect_truthy(!isMatch('moo.cow', '!(*.*).'));
  });

  test('"moo.cow" should not match ".!(*.*)"', () => {
    expect_truthy(!isMatch('moo.cow', '.!(*.*)'));
  });

  test('"mucca.pazza" should not match "mu!(*(c))?.pa!(*(z))?"', () => {
    expect_truthy(!isMatch('mucca.pazza', 'mu!(*(c))?.pa!(*(z))?'));
  });

  test('"ofoofo" should match "*(of+(o))"', () => {
    expect_truthy(isMatch('ofoofo', '*(of+(o))'));
  });

  test('"ofoofo" should match "*(of+(o)|f)"', () => {
    expect_truthy(isMatch('ofoofo', '*(of+(o)|f)'));
  });

  test('"ofooofoofofooo" should not match "*(f*(o))"', () => {
    expect_truthy(!isMatch('ofooofoofofooo', '*(f*(o))'));
  });

  test('"ofoooxoofxo" should match "*(*(of*(o)x)o)"', () => {
    expect_truthy(isMatch('ofoooxoofxo', '*(*(of*(o)x)o)'));
  });

  test('"ofoooxoofxoofoooxoofxo" should match "*(*(of*(o)x)o)"', () => {
    expect_truthy(isMatch('ofoooxoofxoofoooxoofxo', '*(*(of*(o)x)o)'));
  });

  test('"ofoooxoofxoofoooxoofxofo" should not match "*(*(of*(o)x)o)"', () => {
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxofo', '*(*(of*(o)x)o)'));
  });

  test('"ofoooxoofxoofoooxoofxoo" should match "*(*(of*(o)x)o)"', () => {
    expect_truthy(isMatch('ofoooxoofxoofoooxoofxoo', '*(*(of*(o)x)o)'));
  });

  test('"ofoooxoofxoofoooxoofxooofxofxo" should match "*(*(of*(o)x)o)"', () => {
    expect_truthy(isMatch('ofoooxoofxoofoooxoofxooofxofxo', '*(*(of*(o)x)o)'));
  });

  test('"ofxoofxo" should match "*(*(of*(o)x)o)"', () => {
    expect_truthy(isMatch('ofxoofxo', '*(*(of*(o)x)o)'));
  });

  test('"oofooofo" should match "*(of|oof+(o))"', () => {
    expect_truthy(isMatch('oofooofo', '*(of|oof+(o))'));
  });

  test('"ooo" should match "!(f)"', () => {
    expect_truthy(isMatch('ooo', '!(f)'));
  });

  test('"ooo" should match "*(!(f))"', () => {
    expect_truthy(isMatch('ooo', '*(!(f))'));
  });

  test('"ooo" should match "+(!(f))"', () => {
    expect_truthy(isMatch('ooo', '+(!(f))'));
  });

  test('"oxfoxfox" should not match "*(oxf+(ox))"', () => {
    expect_truthy(!isMatch('oxfoxfox', '*(oxf+(ox))'));
  });

  test('"oxfoxoxfox" should match "*(oxf+(ox))"', () => {
    expect_truthy(isMatch('oxfoxoxfox', '*(oxf+(ox))'));
  });

  test('"para" should match "para*([0-9])"', () => {
    expect_truthy(isMatch('para', 'para*([0-9])'));
  });

  test('"para" should not match "para+([0-9])"', () => {
    expect_truthy(!isMatch('para', 'para+([0-9])'));
  });

  test('"para.38" should match "para!(*.[00-09])"', () => {
    expect_truthy(isMatch('para.38', 'para!(*.[00-09])'));
  });

  test('"para.graph" should match "para!(*.[0-9])"', () => {
    expect_truthy(isMatch('para.graph', 'para!(*.[0-9])'));
  });

  test('"para13829383746592" should match "para*([0-9])"', () => {
    expect_truthy(isMatch('para13829383746592', 'para*([0-9])'));
  });

  test('"para381" should not match "para?([345]|99)1"', () => {
    expect_truthy(!isMatch('para381', 'para?([345]|99)1'));
  });

  test('"para39" should match "para!(*.[0-9])"', () => {
    expect_truthy(isMatch('para39', 'para!(*.[0-9])'));
  });

  test('"para987346523" should match "para+([0-9])"', () => {
    expect_truthy(isMatch('para987346523', 'para+([0-9])'));
  });

  test('"para991" should match "para?([345]|99)1"', () => {
    expect_truthy(isMatch('para991', 'para?([345]|99)1'));
  });

  test('"paragraph" should match "para!(*.[0-9])"', () => {
    expect_truthy(isMatch('paragraph', 'para!(*.[0-9])'));
  });

  test('"paragraph" should not match "para*([0-9])"', () => {
    expect_truthy(!isMatch('paragraph', 'para*([0-9])'));
  });

  test('"paragraph" should match "para@(chute|graph)"', () => {
    expect_truthy(isMatch('paragraph', 'para@(chute|graph)'));
  });

  test('"paramour" should not match "para@(chute|graph)"', () => {
    expect_truthy(!isMatch('paramour', 'para@(chute|graph)'));
  });

  test('"parse.y" should match "!(*.c|*.h|Makefile.in|config*|README)"', () => {
    expect_truthy(isMatch('parse.y', '!(*.c|*.h|Makefile.in|config*|README)'));
  });

  test('"shell.c" should not match "!(*.c|*.h|Makefile.in|config*|README)"', () => {
    expect_truthy(!isMatch('shell.c', '!(*.c|*.h|Makefile.in|config*|README)'));
  });

  test('"VMS.FILE;" should not match "*\\;[1-9]*([0-9])"', () => {
    expect_truthy(!isMatch('VMS.FILE;', '*\\;[1-9]*([0-9])'));
  });

  test('"VMS.FILE;0" should not match "*\\;[1-9]*([0-9])"', () => {
    expect_truthy(!isMatch('VMS.FILE;0', '*\\;[1-9]*([0-9])'));
  });

  test('"VMS.FILE;9" should match "*\\;[1-9]*([0-9])"', () => {
    expect_truthy(isMatch('VMS.FILE;9', '*\\;[1-9]*([0-9])'));
  });

  test('"VMS.FILE;1" should match "*\\;[1-9]*([0-9])"', () => {
    expect_truthy(isMatch('VMS.FILE;1', '*\\;[1-9]*([0-9])'));
  });

  test('"VMS.FILE;1" should match "*;[1-9]*([0-9])"', () => {
    expect_truthy(isMatch('VMS.FILE;1', '*;[1-9]*([0-9])'));
  });

  test('"VMS.FILE;139" should match "*\\;[1-9]*([0-9])"', () => {
    expect_truthy(isMatch('VMS.FILE;139', '*\\;[1-9]*([0-9])'));
  });

  test('"VMS.FILE;1N" should not match "*\\;[1-9]*([0-9])"', () => {
    expect_truthy(!isMatch('VMS.FILE;1N', '*\\;[1-9]*([0-9])'));
  });

  test('"xfoooofof" should not match "*(f*(o))"', () => {
    expect_truthy(!isMatch('xfoooofof', '*(f*(o))'));
  });

  test('"XXX/adobe/courier/bold/o/normal//12/120/75/75/m/70/iso8859/1" should match "XXX/*/*/*/*/*/*/12/*/*/*/m/*/*/*"', () => {
    expect_truthy(isMatch('XXX/adobe/courier/bold/o/normal//12/120/75/75/m/70/iso8859/1', 'XXX/*/*/*/*/*/*/12/*/*/*/m/*/*/*', { windows: false }));
  });

  test('"XXX/adobe/courier/bold/o/normal//12/120/75/75/X/70/iso8859/1" should not match "XXX/*/*/*/*/*/*/12/*/*/*/m/*/*/*"', () => {
    expect_truthy(!isMatch('XXX/adobe/courier/bold/o/normal//12/120/75/75/X/70/iso8859/1', 'XXX/*/*/*/*/*/*/12/*/*/*/m/*/*/*'));
  });

  test('"z" should match "*(z)"', () => {
    expect_truthy(isMatch('z', '*(z)'));
  });

  test('"z" should match "+(z)"', () => {
    expect_truthy(isMatch('z', '+(z)'));
  });

  test('"z" should match "?(z)"', () => {
    expect_truthy(isMatch('z', '?(z)'));
  });

  test('"zf" should not match "*(z)"', () => {
    expect_truthy(!isMatch('zf', '*(z)'));
  });

  test('"zf" should not match "+(z)"', () => {
    expect_truthy(!isMatch('zf', '+(z)'));
  });

  test('"zf" should not match "?(z)"', () => {
    expect_truthy(!isMatch('zf', '?(z)'));
  });

  test('"zoot" should not match "@(!(z*)|*x)"', () => {
    expect_truthy(!isMatch('zoot', '@(!(z*)|*x)'));
  });

  test('"zoox" should match "@(!(z*)|*x)"', () => {
    expect_truthy(isMatch('zoox', '@(!(z*)|*x)'));
  });

  test('"zz" should not match "(a+|b)*"', () => {
    expect_truthy(!isMatch('zz', '(a+|b)*'));
  });
});
