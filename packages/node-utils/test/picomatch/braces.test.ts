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

describe('braces', () => {
  test('should not match with brace patterns when disabled', () => {
    expect_deepEqual(match(['a', 'b', 'c'], '{a,b,c,d}'), ['a', 'b', 'c']);
    expect_deepEqual(match(['a', 'b', 'c'], '{a,b,c,d}', { nobrace: true }), []);
    expect_deepEqual(match(['1', '2', '3'], '{1..2}', { nobrace: true }), []);
    expect_truthy(!isMatch('a/a', 'a/{a,b}', { nobrace: true }));
    expect_truthy(!isMatch('a/b', 'a/{a,b}', { nobrace: true }));
    expect_truthy(!isMatch('a/c', 'a/{a,b}', { nobrace: true }));
    expect_truthy(!isMatch('b/b', 'a/{a,b}', { nobrace: true }));
    expect_truthy(!isMatch('b/b', 'a/{a,b,c}', { nobrace: true }));
    expect_truthy(!isMatch('a/c', 'a/{a,b,c}', { nobrace: true }));
    expect_truthy(!isMatch('a/a', 'a/{a..c}', { nobrace: true }));
    expect_truthy(!isMatch('a/b', 'a/{a..c}', { nobrace: true }));
    expect_truthy(!isMatch('a/c', 'a/{a..c}', { nobrace: true }));
  });

  test('should treat single-set braces as literals', () => {
    expect_truthy(isMatch('a {abc} b', 'a {abc} b'));
    expect_truthy(isMatch('a {a-b-c} b', 'a {a-b-c} b'));
    expect_truthy(isMatch('a {a.c} b', 'a {a.c} b'));
  });

  test('should match literal braces when escaped', () => {
    expect_truthy(isMatch('a {1,2}', 'a \\{1,2\\}'));
    expect_truthy(isMatch('a {a..b}', 'a \\{a..b\\}'));
  });

  test('should match using brace patterns', () => {
    expect_truthy(!isMatch('a/c', 'a/{a,b}'));
    expect_truthy(!isMatch('b/b', 'a/{a,b,c}'));
    expect_truthy(!isMatch('b/b', 'a/{a,b}'));
    expect_truthy(isMatch('a/a', 'a/{a,b}'));
    expect_truthy(isMatch('a/b', 'a/{a,b}'));
    expect_truthy(isMatch('a/c', 'a/{a,b,c}'));
  });

  test('should support brace ranges', () => {
    expect_truthy(isMatch('a/a', 'a/{a..c}'));
    expect_truthy(isMatch('a/b', 'a/{a..c}'));
    expect_truthy(isMatch('a/c', 'a/{a..c}'));
  });

  test('should support Kleene stars', () => {
    expect_truthy(isMatch('ab', '{ab,c}*'));
    expect_truthy(isMatch('abab', '{ab,c}*'));
    expect_truthy(isMatch('abc', '{ab,c}*'));
    expect_truthy(isMatch('c', '{ab,c}*'));
    expect_truthy(isMatch('cab', '{ab,c}*'));
    expect_truthy(isMatch('cc', '{ab,c}*'));
    expect_truthy(isMatch('ababab', '{ab,c}*'));
    expect_truthy(isMatch('ababc', '{ab,c}*'));
    expect_truthy(isMatch('abcab', '{ab,c}*'));
    expect_truthy(isMatch('abcc', '{ab,c}*'));
    expect_truthy(isMatch('cabab', '{ab,c}*'));
    expect_truthy(isMatch('cabc', '{ab,c}*'));
    expect_truthy(isMatch('ccab', '{ab,c}*'));
    expect_truthy(isMatch('ccc', '{ab,c}*'));
  });

  test('should not convert braces inside brackets', () => {
    expect_truthy(isMatch('foo{}baz', 'foo[{a,b}]+baz'));
    expect_truthy(isMatch('{a}{b}{c}', '[abc{}]+'));
  });

  test('should support braces containing slashes', () => {
    expect_truthy(isMatch('a', '{/,}a/**'));
    expect_truthy(isMatch('aa.txt', 'a{a,b/}*.txt'));
    expect_truthy(isMatch('ab/.txt', 'a{a,b/}*.txt'));
    expect_truthy(isMatch('ab/a.txt', 'a{a,b/}*.txt'));
    expect_truthy(isMatch('a/', 'a/**{/,}'));
    expect_truthy(isMatch('a/a', 'a/**{/,}'));
    expect_truthy(isMatch('a/a/', 'a/**{/,}'));
  });

  test('should support braces with empty elements', () => {
    expect_truthy(!isMatch('abc.txt', 'a{,b}.txt'));
    expect_truthy(!isMatch('abc.txt', 'a{a,b,}.txt'));
    expect_truthy(!isMatch('abc.txt', 'a{b,}.txt'));
    expect_truthy(isMatch('a.txt', 'a{,b}.txt'));
    expect_truthy(isMatch('a.txt', 'a{b,}.txt'));
    expect_truthy(isMatch('aa.txt', 'a{a,b,}.txt'));
    expect_truthy(isMatch('aa.txt', 'a{a,b,}.txt'));
    expect_truthy(isMatch('ab.txt', 'a{,b}.txt'));
    expect_truthy(isMatch('ab.txt', 'a{b,}.txt'));
  });

  test('should support braces with slashes and empty elements', () => {
    expect_truthy(isMatch('a.txt', 'a{,/}*.txt'));
    expect_truthy(isMatch('ab.txt', 'a{,/}*.txt'));
    expect_truthy(isMatch('a/b.txt', 'a{,/}*.txt'));
    expect_truthy(isMatch('a/ab.txt', 'a{,/}*.txt'));
  });

  test('should support braces with stars', () => {
    expect_truthy(isMatch('a.txt', 'a{,.*{foo,db},\\(bar\\)}.txt'));
    expect_truthy(!isMatch('adb.txt', 'a{,.*{foo,db},\\(bar\\)}.txt'));
    expect_truthy(isMatch('a.db.txt', 'a{,.*{foo,db},\\(bar\\)}.txt'));

    expect_truthy(isMatch('a.txt', 'a{,*.{foo,db},\\(bar\\)}.txt'));
    expect_truthy(!isMatch('adb.txt', 'a{,*.{foo,db},\\(bar\\)}.txt'));
    expect_truthy(isMatch('a.db.txt', 'a{,*.{foo,db},\\(bar\\)}.txt'));

    expect_truthy(isMatch('a', 'a{,.*{foo,db},\\(bar\\)}'));
    expect_truthy(!isMatch('adb', 'a{,.*{foo,db},\\(bar\\)}'));
    expect_truthy(isMatch('a.db', 'a{,.*{foo,db},\\(bar\\)}'));

    expect_truthy(isMatch('a', 'a{,*.{foo,db},\\(bar\\)}'));
    expect_truthy(!isMatch('adb', 'a{,*.{foo,db},\\(bar\\)}'));
    expect_truthy(isMatch('a.db', 'a{,*.{foo,db},\\(bar\\)}'));

    expect_truthy(!isMatch('a', '{,.*{foo,db},\\(bar\\)}'));
    expect_truthy(!isMatch('adb', '{,.*{foo,db},\\(bar\\)}'));
    expect_truthy(!isMatch('a.db', '{,.*{foo,db},\\(bar\\)}'));
    expect_truthy(isMatch('.db', '{,.*{foo,db},\\(bar\\)}'));

    expect_truthy(!isMatch('a', '{,*.{foo,db},\\(bar\\)}'));
    expect_truthy(isMatch('a', '{*,*.{foo,db},\\(bar\\)}'));
    expect_truthy(!isMatch('adb', '{,*.{foo,db},\\(bar\\)}'));
    expect_truthy(isMatch('a.db', '{,*.{foo,db},\\(bar\\)}'));
  });

  test('should support braces in patterns with globstars', () => {
    expect_truthy(!isMatch('a/b/c/xyz.md', 'a/b/**/c{d,e}/**/xyz.md'));
    expect_truthy(!isMatch('a/b/d/xyz.md', 'a/b/**/c{d,e}/**/xyz.md'));
    expect_truthy(isMatch('a/b/cd/xyz.md', 'a/b/**/c{d,e}/**/xyz.md'));
    expect_truthy(isMatch('a/b/c/xyz.md', 'a/b/**/{c,d,e}/**/xyz.md'));
    expect_truthy(isMatch('a/b/d/xyz.md', 'a/b/**/{c,d,e}/**/xyz.md'));
  });

  test('should support braces with globstars, slashes and empty elements', () => {
    expect_truthy(isMatch('a.txt', 'a{,/**/}*.txt'));
    expect_truthy(isMatch('a/b.txt', 'a{,/**/,/}*.txt'));
    expect_truthy(isMatch('a/x/y.txt', 'a{,/**/}*.txt'));
    expect_truthy(!isMatch('a/x/y/z', 'a{,/**/}*.txt'));
  });

  test('should support braces with globstars and empty elements', () => {
    expect_truthy(isMatch('a/b/foo/bar/baz.qux', 'a/b{,/**}/bar{,/**}/*.*'));
    expect_truthy(isMatch('a/b/bar/baz.qux', 'a/b{,/**}/bar{,/**}/*.*'));
  });

  test('should support Kleene plus', () => {
    expect_truthy(isMatch('ab', '{ab,c}+'));
    expect_truthy(isMatch('abab', '{ab,c}+'));
    expect_truthy(isMatch('abc', '{ab,c}+'));
    expect_truthy(isMatch('c', '{ab,c}+'));
    expect_truthy(isMatch('cab', '{ab,c}+'));
    expect_truthy(isMatch('cc', '{ab,c}+'));
    expect_truthy(isMatch('ababab', '{ab,c}+'));
    expect_truthy(isMatch('ababc', '{ab,c}+'));
    expect_truthy(isMatch('abcab', '{ab,c}+'));
    expect_truthy(isMatch('abcc', '{ab,c}+'));
    expect_truthy(isMatch('cabab', '{ab,c}+'));
    expect_truthy(isMatch('cabc', '{ab,c}+'));
    expect_truthy(isMatch('ccab', '{ab,c}+'));
    expect_truthy(isMatch('ccc', '{ab,c}+'));
    expect_truthy(isMatch('ccc', '{a,b,c}+'));

    expect_truthy(isMatch('a', '{a,b,c}+'));
    expect_truthy(isMatch('b', '{a,b,c}+'));
    expect_truthy(isMatch('c', '{a,b,c}+'));
    expect_truthy(isMatch('aa', '{a,b,c}+'));
    expect_truthy(isMatch('ab', '{a,b,c}+'));
    expect_truthy(isMatch('ac', '{a,b,c}+'));
    expect_truthy(isMatch('ba', '{a,b,c}+'));
    expect_truthy(isMatch('bb', '{a,b,c}+'));
    expect_truthy(isMatch('bc', '{a,b,c}+'));
    expect_truthy(isMatch('ca', '{a,b,c}+'));
    expect_truthy(isMatch('cb', '{a,b,c}+'));
    expect_truthy(isMatch('cc', '{a,b,c}+'));
    expect_truthy(isMatch('aaa', '{a,b,c}+'));
    expect_truthy(isMatch('aab', '{a,b,c}+'));
    expect_truthy(isMatch('abc', '{a,b,c}+'));
  });

  test('should support braces', () => {
    expect_truthy(isMatch('a', '{a,b,c}'));
    expect_truthy(isMatch('b', '{a,b,c}'));
    expect_truthy(isMatch('c', '{a,b,c}'));
    expect_truthy(!isMatch('aa', '{a,b,c}'));
    expect_truthy(!isMatch('bb', '{a,b,c}'));
    expect_truthy(!isMatch('cc', '{a,b,c}'));
  });

  test('should match special chars and expand ranges in parentheses', () => {
    const expandRange = (a, b) => `(${fill(a, b, { toRegex: true })})`;

    expect_truthy(!isMatch('foo/bar - 1', '*/* {4..10}', { expandRange }));
    expect_truthy(!isMatch('foo/bar - copy (1)', '*/* - * \\({4..10}\\)', { expandRange }));
    expect_truthy(!isMatch('foo/bar (1)', '*/* \\({4..10}\\)', { expandRange }));
    expect_truthy(isMatch('foo/bar (4)', '*/* \\({4..10}\\)', { expandRange }));
    expect_truthy(isMatch('foo/bar (7)', '*/* \\({4..10}\\)', { expandRange }));
    expect_truthy(!isMatch('foo/bar (42)', '*/* \\({4..10}\\)', { expandRange }));
    expect_truthy(isMatch('foo/bar (42)', '*/* \\({4..43}\\)', { expandRange }));
    expect_truthy(isMatch('foo/bar - copy [1]', '*/* \\[{0..5}\\]', { expandRange }));
    expect_truthy(isMatch('foo/bar - foo + bar - copy [1]', '*/* \\[{0..5}\\]', { expandRange }));
    expect_truthy(!isMatch('foo/bar - 1', '*/* \\({4..10}\\)', { expandRange }));
    expect_truthy(!isMatch('foo/bar - copy (1)', '*/* \\({4..10}\\)', { expandRange }));
    expect_truthy(!isMatch('foo/bar (1)', '*/* \\({4..10}\\)', { expandRange }));
    expect_truthy(isMatch('foo/bar (4)', '*/* \\({4..10}\\)', { expandRange }));
    expect_truthy(isMatch('foo/bar (7)', '*/* \\({4..10}\\)', { expandRange }));
    expect_truthy(!isMatch('foo/bar (42)', '*/* \\({4..10}\\)', { expandRange }));
    expect_truthy(!isMatch('foo/bar - copy [1]', '*/* \\({4..10}\\)', { expandRange }));
    expect_truthy(!isMatch('foo/bar - foo + bar - copy [1]', '*/* \\({4..10}\\)', { expandRange }));
  });
});
