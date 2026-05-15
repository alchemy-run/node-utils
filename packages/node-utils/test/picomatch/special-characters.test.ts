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


const { isMatch, makeRe } = picomatch;

describe('special characters', () => {
  describe('numbers', () => {
    test('should match numbers in the input string', () => {
      expect_truthy(!isMatch('1', '*/*'));
      expect_truthy(isMatch('1/1', '*/*'));
      expect_truthy(isMatch('1/2', '*/*'));
      expect_truthy(!isMatch('1/1/1', '*/*'));
      expect_truthy(!isMatch('1/1/2', '*/*'));

      expect_truthy(!isMatch('1', '*/*/1'));
      expect_truthy(!isMatch('1/1', '*/*/1'));
      expect_truthy(!isMatch('1/2', '*/*/1'));
      expect_truthy(isMatch('1/1/1', '*/*/1'));
      expect_truthy(!isMatch('1/1/2', '*/*/1'));

      expect_truthy(!isMatch('1', '*/*/2'));
      expect_truthy(!isMatch('1/1', '*/*/2'));
      expect_truthy(!isMatch('1/2', '*/*/2'));
      expect_truthy(!isMatch('1/1/1', '*/*/2'));
      expect_truthy(isMatch('1/1/2', '*/*/2'));
    });
  });

  describe('qmarks', () => {
    test('should match literal ? in the input string', () => {
      expect_truthy(isMatch('?', '*'));
      expect_truthy(isMatch('/?', '/*'));
      expect_truthy(isMatch('?/?', '*/*'));
      expect_truthy(isMatch('?/?/', '*/*/'));
      expect_truthy(isMatch('/?', '/?'));
      expect_truthy(isMatch('?/?', '?/?'));
      expect_truthy(isMatch('foo?/bar?', '*/*'));
    });

    test('should not match slashes with qmarks', () => {
      expect_truthy(!isMatch('aaa/bbb', 'aaa?bbb'));
    });

    test('should match literal ? with qmarks', () => {
      expect_truthy(!isMatch('?', '??'));
      expect_truthy(!isMatch('?', '???'));
      expect_truthy(!isMatch('??', '?'));
      expect_truthy(!isMatch('??', '???'));
      expect_truthy(!isMatch('???', '?'));
      expect_truthy(!isMatch('???', '??'));
      expect_truthy(!isMatch('ac?', 'ab?'));
      expect_truthy(isMatch('?', '?*'));
      expect_truthy(isMatch('??', '?*'));
      expect_truthy(isMatch('???', '?*'));
      expect_truthy(isMatch('????', '?*'));
      expect_truthy(isMatch('?', '?'));
      expect_truthy(isMatch('??', '??'));
      expect_truthy(isMatch('???', '???'));
      expect_truthy(isMatch('ab?', 'ab?'));
    });

    test('should match other non-slash characters with qmarks', () => {
      expect_truthy(!isMatch('/a/', '?'));
      expect_truthy(!isMatch('/a/', '??'));
      expect_truthy(!isMatch('/a/', '???'));
      expect_truthy(!isMatch('/a/b/', '??'));
      expect_truthy(!isMatch('aaa/bbb', 'aaa?bbb'));
      expect_truthy(!isMatch('aaa//bbb', 'aaa?bbb'));
      expect_truthy(!isMatch('aaa\\\\bbb', 'aaa?bbb'));
      expect_truthy(isMatch('acb/', 'a?b/'));
      expect_truthy(isMatch('acdb/', 'a??b/'));
      expect_truthy(isMatch('/acb', '/a?b'));
    });

    test('should match non-slash characters when ? is escaped', () => {
      expect_truthy(!isMatch('acb/', 'a\\?b/'));
      expect_truthy(!isMatch('acdb/', 'a\\?\\?b/'));
      expect_truthy(!isMatch('/acb', '/a\\?b'));
    });

    test('should match one character per question mark', () => {
      expect_truthy(isMatch('a', '?'));
      expect_truthy(!isMatch('aa', '?'));
      expect_truthy(!isMatch('ab', '?'));
      expect_truthy(!isMatch('aaa', '?'));
      expect_truthy(!isMatch('abcdefg', '?'));

      expect_truthy(!isMatch('a', '??'));
      expect_truthy(isMatch('aa', '??'));
      expect_truthy(isMatch('ab', '??'));
      expect_truthy(!isMatch('aaa', '??'));
      expect_truthy(!isMatch('abcdefg', '??'));

      expect_truthy(!isMatch('a', '???'));
      expect_truthy(!isMatch('aa', '???'));
      expect_truthy(!isMatch('ab', '???'));
      expect_truthy(isMatch('aaa', '???'));
      expect_truthy(!isMatch('abcdefg', '???'));

      expect_truthy(!isMatch('aaa', 'a?c'));
      expect_truthy(isMatch('aac', 'a?c'));
      expect_truthy(isMatch('abc', 'a?c'));
      expect_truthy(!isMatch('a', 'ab?'));
      expect_truthy(!isMatch('aa', 'ab?'));
      expect_truthy(!isMatch('ab', 'ab?'));
      expect_truthy(!isMatch('ac', 'ab?'));
      expect_truthy(!isMatch('abcd', 'ab?'));
      expect_truthy(!isMatch('abbb', 'ab?'));
      expect_truthy(isMatch('acb', 'a?b'));

      expect_truthy(!isMatch('a/bb/c/dd/e.md', 'a/?/c/?/e.md'));
      expect_truthy(isMatch('a/bb/c/dd/e.md', 'a/??/c/??/e.md'));
      expect_truthy(!isMatch('a/bbb/c.md', 'a/??/c.md'));
      expect_truthy(isMatch('a/b/c.md', 'a/?/c.md'));
      expect_truthy(isMatch('a/b/c/d/e.md', 'a/?/c/?/e.md'));
      expect_truthy(!isMatch('a/b/c/d/e.md', 'a/?/c/???/e.md'));
      expect_truthy(isMatch('a/b/c/zzz/e.md', 'a/?/c/???/e.md'));
      expect_truthy(!isMatch('a/bb/c.md', 'a/?/c.md'));
      expect_truthy(isMatch('a/bb/c.md', 'a/??/c.md'));
      expect_truthy(isMatch('a/bbb/c.md', 'a/???/c.md'));
      expect_truthy(isMatch('a/bbbb/c.md', 'a/????/c.md'));
    });

    test('should enforce one character per qmark even when preceded by stars', () => {
      expect_truthy(!isMatch('a', '*??'));
      expect_truthy(!isMatch('aa', '*???'));
      expect_truthy(isMatch('aaa', '*???'));
      expect_truthy(!isMatch('a', '*****??'));
      expect_truthy(!isMatch('aa', '*****???'));
      expect_truthy(isMatch('aaa', '*****???'));
    });

    test('should support qmarks and stars', () => {
      expect_truthy(!isMatch('aaa', 'a*?c'));
      expect_truthy(isMatch('aac', 'a*?c'));
      expect_truthy(isMatch('abc', 'a*?c'));

      expect_truthy(isMatch('abc', 'a**?c'));
      expect_truthy(!isMatch('abb', 'a**?c'));
      expect_truthy(isMatch('acc', 'a**?c'));
      expect_truthy(isMatch('abc', 'a*****?c'));

      expect_truthy(isMatch('a', '*****?'));
      expect_truthy(isMatch('aa', '*****?'));
      expect_truthy(isMatch('abc', '*****?'));
      expect_truthy(isMatch('zzz', '*****?'));
      expect_truthy(isMatch('bbb', '*****?'));
      expect_truthy(isMatch('aaaa', '*****?'));

      expect_truthy(!isMatch('a', '*****??'));
      expect_truthy(isMatch('aa', '*****??'));
      expect_truthy(isMatch('abc', '*****??'));
      expect_truthy(isMatch('zzz', '*****??'));
      expect_truthy(isMatch('bbb', '*****??'));
      expect_truthy(isMatch('aaaa', '*****??'));

      expect_truthy(!isMatch('a', '?*****??'));
      expect_truthy(!isMatch('aa', '?*****??'));
      expect_truthy(isMatch('abc', '?*****??'));
      expect_truthy(isMatch('zzz', '?*****??'));
      expect_truthy(isMatch('bbb', '?*****??'));
      expect_truthy(isMatch('aaaa', '?*****??'));

      expect_truthy(isMatch('abc', '?*****?c'));
      expect_truthy(!isMatch('abb', '?*****?c'));
      expect_truthy(!isMatch('zzz', '?*****?c'));

      expect_truthy(isMatch('abc', '?***?****c'));
      expect_truthy(!isMatch('bbb', '?***?****c'));
      expect_truthy(!isMatch('zzz', '?***?****c'));

      expect_truthy(isMatch('abc', '?***?****?'));
      expect_truthy(isMatch('bbb', '?***?****?'));
      expect_truthy(isMatch('zzz', '?***?****?'));

      expect_truthy(isMatch('abc', '?***?****'));
      expect_truthy(isMatch('abc', '*******c'));
      expect_truthy(isMatch('abc', '*******?'));
      expect_truthy(isMatch('abcdecdhjk', 'a*cd**?**??k'));
      expect_truthy(isMatch('abcdecdhjk', 'a**?**cd**?**??k'));
      expect_truthy(isMatch('abcdecdhjk', 'a**?**cd**?**??k***'));
      expect_truthy(isMatch('abcdecdhjk', 'a**?**cd**?**??***k'));
      expect_truthy(isMatch('abcdecdhjk', 'a**?**cd**?**??***k**'));
      expect_truthy(isMatch('abcdecdhjk', 'a****c**?**??*****'));
    });

    test('should support qmarks, stars and slashes', () => {
      expect_truthy(!isMatch('a/b/c/d/e.md', 'a/?/c/?/*/e.md'));
      expect_truthy(isMatch('a/b/c/d/e/e.md', 'a/?/c/?/*/e.md'));
      expect_truthy(isMatch('a/b/c/d/efghijk/e.md', 'a/?/c/?/*/e.md'));
      expect_truthy(isMatch('a/b/c/d/efghijk/e.md', 'a/?/**/e.md'));
      expect_truthy(!isMatch('a/bb/e.md', 'a/?/e.md'));
      expect_truthy(isMatch('a/bb/e.md', 'a/??/e.md'));
      expect_truthy(!isMatch('a/bb/e.md', 'a/?/**/e.md'));
      expect_truthy(isMatch('a/b/ccc/e.md', 'a/?/**/e.md'));
      expect_truthy(isMatch('a/b/c/d/efghijk/e.md', 'a/*/?/**/e.md'));
      expect_truthy(isMatch('a/b/c/d/efgh.ijk/e.md', 'a/*/?/**/e.md'));
      expect_truthy(isMatch('a/b.bb/c/d/efgh.ijk/e.md', 'a/*/?/**/e.md'));
      expect_truthy(isMatch('a/bbb/c/d/efgh.ijk/e.md', 'a/*/?/**/e.md'));
    });

    test('should match non-leading dots', () => {
      expect_truthy(isMatch('aaa.bbb', 'aaa?bbb'));
    });

    test('should not match leading dots', () => {
      expect_truthy(!isMatch('.aaa/bbb', '?aaa/bbb'));
      expect_truthy(!isMatch('aaa/.bbb', 'aaa/?bbb'));
    });

    test('should match characters preceding a dot', () => {
      expect_truthy(isMatch('a/bbb/abcd.md', 'a/*/ab??.md'));
      expect_truthy(isMatch('a/bbb/abcd.md', 'a/bbb/ab??.md'));
      expect_truthy(isMatch('a/bbb/abcd.md', 'a/bbb/ab???md'));
    });
  });

  describe('parentheses ()', () => {
    test('should match literal parentheses in the input string', () => {
      expect_truthy(!isMatch('my/folder (Work, Accts)', '/*'));
      expect_truthy(isMatch('my/folder (Work, Accts)', '*/*'));
      expect_truthy(isMatch('my/folder (Work, Accts)', '*/*,*'));
      expect_truthy(isMatch('my/folder (Work, Accts)', '*/*(W*, *)*'));
      expect_truthy(isMatch('my/folder/(Work, Accts)', '**/*(W*, *)*'));
      expect_truthy(!isMatch('my/folder/(Work, Accts)', '*/*(W*, *)*'));
      expect_truthy(isMatch('foo(bar)baz', 'foo*baz'));
    });

    test('should match literal parens with brackets', async () => {
      expect_truthy(isMatch('foo(bar)baz', 'foo[bar()]+baz'));
    });

    test('should throw an error on imbalanced, unescaped parens', () => {
      const opts = { strictBrackets: true };
      expect_throws(() => makeRe('*)', opts), /Missing opening: "\("/);
      expect_throws(() => makeRe('*(', opts), /Missing closing: "\)"/);
    });

    test('should throw an error on imbalanced, unescaped brackets', () => {
      const opts = { strictBrackets: true };
      expect_throws(() => makeRe('*]', opts), /Missing opening: "\["/);
      expect_throws(() => makeRe('*[', opts), /Missing closing: "\]"/);
    });
  });

  describe('path characters', () => {
    test('should match windows drives with globstars', () => {
      expect_truthy(isMatch('bar/', '**'));
      expect_truthy(isMatch('A://', '**'));
      expect_truthy(isMatch('B:foo/a/b/c/d', '**'));
      expect_truthy(isMatch('C:/Users/', '**'));
      expect_truthy(isMatch('c:\\', '**'));
      expect_truthy(isMatch('C:\\Users\\', '**'));
      expect_truthy(isMatch('C:cwd/another', '**'));
      expect_truthy(isMatch('C:cwd\\another', '**'));
    });

    test('should not match multiple windows directories with a single star', () => {
      expect_truthy(isMatch('c:\\', '*{,/}', { windows: true }));
      expect_truthy(!isMatch('C:\\Users\\', '*', { windows: true }));
      expect_truthy(!isMatch('C:cwd\\another', '*', { windows: true }));
    });

    test('should match mixed slashes on windows', () => {
      expect_truthy(isMatch('//C://user\\docs\\Letter.txt', '**', { windows: true }));
      expect_truthy(isMatch('//C:\\\\user/docs/Letter.txt', '**', { windows: true }));
      expect_truthy(isMatch(':\\', '*{,/}', { windows: true }));
      expect_truthy(isMatch(':\\', ':*{,/}', { windows: true }));
      expect_truthy(isMatch('\\\\foo/bar', '**', { windows: true }));
      expect_truthy(isMatch('\\\\foo/bar', '//*/*', { windows: true }));
      expect_truthy(isMatch('\\\\unc\\admin$', '**', { windows: true }));
      expect_truthy(isMatch('\\\\unc\\admin$', '//*/*$', { windows: true }));
      expect_truthy(isMatch('\\\\unc\\admin$\\system32', '//*/*$/*32', { windows: true }));
      expect_truthy(isMatch('\\\\unc\\share\\foo', '//u*/s*/f*', { windows: true }));
      expect_truthy(isMatch('foo\\bar\\baz', 'f*/*/*', { windows: true }));
    });

    test('should match mixed slashes when options.windows is true', () => {
      expect_truthy(isMatch('//C://user\\docs\\Letter.txt', '**', { windows: true }));
      expect_truthy(isMatch('//C:\\\\user/docs/Letter.txt', '**', { windows: true }));
      expect_truthy(isMatch(':\\', '*{,/}', { windows: true }));
      expect_truthy(isMatch(':\\', ':*{,/}', { windows: true }));
      expect_truthy(isMatch('\\\\foo/bar', '**', { windows: true }));
      expect_truthy(isMatch('\\\\foo/bar', '//*/*', { windows: true }));
      expect_truthy(isMatch('\\\\unc\\admin$', '//**', { windows: true }));
      expect_truthy(isMatch('\\\\unc\\admin$', '//*/*$', { windows: true }));
      expect_truthy(isMatch('\\\\unc\\admin$\\system32', '//*/*$/*32', { windows: true }));
      expect_truthy(isMatch('\\\\unc\\share\\foo', '//u*/s*/f*', { windows: true }));
      expect_truthy(isMatch('\\\\\\\\\\\\unc\\share\\foo', '/\\{1,\\}u*/s*/f*', { windows: true, unescape: true }));
      expect_truthy(isMatch('foo\\bar\\baz', 'f*/*/*', { windows: true }));
      expect_truthy(isMatch('//*:/**', '**'));
      expect_truthy(!isMatch('//server/file', '//*'));
      expect_truthy(isMatch('//server/file', '/**'));
      expect_truthy(isMatch('//server/file', '//**'));
      expect_truthy(isMatch('//server/file', '**'));
      expect_truthy(isMatch('//UNC//Server01//user//docs//Letter.txt', '**'));
      expect_truthy(isMatch('/foo', '**'));
      expect_truthy(isMatch('/foo/a/b/c/d', '**'));
      expect_truthy(isMatch('/foo/bar', '**'));
      expect_truthy(isMatch('/home/foo', '**'));
      expect_truthy(isMatch('/home/foo/..', '**/..'));
      expect_truthy(isMatch('/user/docs/Letter.txt', '**'));
      expect_truthy(isMatch('directory\\directory', '**'));
      expect_truthy(isMatch('a/b/c.js', '**'));
      expect_truthy(isMatch('directory/directory', '**'));
      expect_truthy(isMatch('foo/bar', '**'));
    });

    test('should match any character zero or more times, except for /', () => {
      expect_truthy(!isMatch('foo', '*a*'));
      expect_truthy(!isMatch('foo', '*r'));
      expect_truthy(!isMatch('foo', 'b*'));
      expect_truthy(!isMatch('foo/bar', '*'));
      expect_truthy(isMatch('foo/bar', '*/*'));
      expect_truthy(!isMatch('foo/bar/baz', '*/*'));
      expect_truthy(isMatch('bar', '*a*'));
      expect_truthy(isMatch('bar', '*r'));
      expect_truthy(isMatch('bar', 'b*'));
      expect_truthy(isMatch('foo/bar/baz', '*/*/*'));
    });

    test('should match dashes surrounded by spaces', () => {
      expect_truthy(isMatch('my/folder - 1', '*/*'));
      expect_truthy(isMatch('my/folder - copy (1)', '*/*'));
      expect_truthy(isMatch('my/folder - copy [1]', '*/*'));
      expect_truthy(isMatch('my/folder - foo + bar - copy [1]', '*/*'));
      expect_truthy(!isMatch('my/folder - foo + bar - copy [1]', '*'));

      expect_truthy(isMatch('my/folder - 1', '*/*-*'));
      expect_truthy(isMatch('my/folder - copy (1)', '*/*-*'));
      expect_truthy(isMatch('my/folder - copy [1]', '*/*-*'));
      expect_truthy(isMatch('my/folder - foo + bar - copy [1]', '*/*-*'));

      expect_truthy(isMatch('my/folder - 1', '*/*1'));
      expect_truthy(!isMatch('my/folder - copy (1)', '*/*1'));
    });
  });

  describe('brackets', () => {
    test('should support square brackets in globs', () => {
      expect_truthy(isMatch('foo/bar - 1', '**/*[1]'));
      expect_truthy(!isMatch('foo/bar - copy (1)', '**/*[1]'));
      expect_truthy(!isMatch('foo/bar (1)', '**/*[1]'));
      expect_truthy(!isMatch('foo/bar (4)', '**/*[1]'));
      expect_truthy(!isMatch('foo/bar (7)', '**/*[1]'));
      expect_truthy(!isMatch('foo/bar (42)', '**/*[1]'));
      expect_truthy(isMatch('foo/bar - copy [1]', '**/*[1]'));
      expect_truthy(isMatch('foo/bar - foo + bar - copy [1]', '**/*[1]'));
    });

    test('should match (escaped) bracket literals', () => {
      expect_truthy(isMatch('a [b]', 'a \\[b\\]'));
      expect_truthy(isMatch('a [b] c', 'a [b] c'));
      expect_truthy(isMatch('a [b]', 'a \\[b\\]*'));
      expect_truthy(isMatch('a [bc]', 'a \\[bc\\]*'));
      expect_truthy(!isMatch('a [b]', 'a \\[b\\].*'));
      expect_truthy(isMatch('a [b].js', 'a \\[b\\].*'));
      expect_truthy(!isMatch('foo/bar - 1', '**/*\\[*\\]'));
      expect_truthy(!isMatch('foo/bar - copy (1)', '**/*\\[*\\]'));
      expect_truthy(!isMatch('foo/bar (1)', '**/*\\[*\\]'));
      expect_truthy(!isMatch('foo/bar (4)', '**/*\\[*\\]'));
      expect_truthy(!isMatch('foo/bar (7)', '**/*\\[*\\]'));
      expect_truthy(!isMatch('foo/bar (42)', '**/*\\[*\\]'));
      expect_truthy(isMatch('foo/bar - copy [1]', '**/*\\[*\\]'));
      expect_truthy(isMatch('foo/bar - foo + bar - copy [1]', '**/*\\[*\\]'));

      expect_truthy(!isMatch('foo/bar - 1', '**/*\\[1\\]'));
      expect_truthy(!isMatch('foo/bar - copy (1)', '**/*\\[1\\]'));
      expect_truthy(!isMatch('foo/bar (1)', '**/*\\[1\\]'));
      expect_truthy(!isMatch('foo/bar (4)', '**/*\\[1\\]'));
      expect_truthy(!isMatch('foo/bar (7)', '**/*\\[1\\]'));
      expect_truthy(!isMatch('foo/bar (42)', '**/*\\[1\\]'));
      expect_truthy(isMatch('foo/bar - copy [1]', '**/*\\[1\\]'));
      expect_truthy(isMatch('foo/bar - foo + bar - copy [1]', '**/*\\[1\\]'));

      expect_truthy(!isMatch('foo/bar - 1', '*/*\\[*\\]'));
      expect_truthy(!isMatch('foo/bar - copy (1)', '*/*\\[*\\]'));
      expect_truthy(!isMatch('foo/bar (1)', '*/*\\[*\\]'));
      expect_truthy(!isMatch('foo/bar (4)', '*/*\\[*\\]'));
      expect_truthy(!isMatch('foo/bar (7)', '*/*\\[*\\]'));
      expect_truthy(!isMatch('foo/bar (42)', '*/*\\[*\\]'));
      expect_truthy(isMatch('foo/bar - copy [1]', '*/*\\[*\\]'));
      expect_truthy(isMatch('foo/bar - foo + bar - copy [1]', '*/*\\[*\\]'));

      expect_truthy(isMatch('a [b]', 'a \\[b\\]'));
      expect_truthy(isMatch('a [b] c', 'a [b] c'));
      expect_truthy(isMatch('a [b]', 'a \\[b\\]*'));
      expect_truthy(isMatch('a [bc]', 'a \\[bc\\]*'));
      expect_truthy(!isMatch('a [b]', 'a \\[b\\].*'));
      expect_truthy(isMatch('a [b].js', 'a \\[b\\].*'));
    });
  });

  describe('star - "*"', () => {
    test('should match literal *', () => {
      expect_truthy(isMatch('*', '*'));
      expect_truthy(isMatch('*/*', '*/*'));
      expect_truthy(isMatch('*/*', '?/?'));
      expect_truthy(isMatch('*/*/', '*/*/'));
      expect_truthy(isMatch('/*', '/*'));
      expect_truthy(isMatch('/*', '/?'));
      expect_truthy(isMatch('foo*/bar*', '*/*'));
    });

    test('should support stars following brackets', () => {
      expect_truthy(isMatch('a', '[a]*'));
      expect_truthy(isMatch('aa', '[a]*'));
      expect_truthy(isMatch('aaa', '[a]*'));
      expect_truthy(isMatch('az', '[a-z]*'));
      expect_truthy(isMatch('zzz', '[a-z]*'));
    });

    test('should support stars following parens', () => {
      expect_truthy(isMatch('a', '(a)*'));
      expect_truthy(isMatch('ab', '(a|b)*'));
      expect_truthy(isMatch('aa', '(a)*'));
      expect_truthy(isMatch('aaab', '(a|b)*'));
      expect_truthy(isMatch('aaabbb', '(a|b)*'));
    });

    test('should not match slashes with single stars', () => {
      expect_truthy(!isMatch('a/b', '(a)*'));
      expect_truthy(!isMatch('a/b', '[a]*'));
      expect_truthy(!isMatch('a/b', 'a*'));
      expect_truthy(!isMatch('a/b', '(a|b)*'));
    });

    test('should not match dots with stars by default', () => {
      expect_truthy(!isMatch('.a', '(a)*'));
      expect_truthy(!isMatch('.a', '*[a]*'));
      expect_truthy(!isMatch('.a', '*[a]'));
      expect_truthy(!isMatch('.a', '*a*'));
      expect_truthy(!isMatch('.a', '*a'));
      expect_truthy(!isMatch('.a', '*(a|b)'));
    });
  });

  describe('plus - "+"', () => {
    test('should match literal +', () => {
      expect_truthy(isMatch('+', '*'));
      expect_truthy(isMatch('/+', '/*'));
      expect_truthy(isMatch('+/+', '*/*'));
      expect_truthy(isMatch('+/+/', '*/*/'));
      expect_truthy(isMatch('/+', '/+'));
      expect_truthy(isMatch('/+', '/?'));
      expect_truthy(isMatch('+/+', '?/?'));
      expect_truthy(isMatch('+/+', '+/+'));
      expect_truthy(isMatch('foo+/bar+', '*/*'));
    });

    test('should support plus signs that follow brackets (and not escape them)', () => {
      expect_truthy(isMatch('a', '[a]+'));
      expect_truthy(isMatch('aa', '[a]+'));
      expect_truthy(isMatch('aaa', '[a]+'));
      expect_truthy(isMatch('az', '[a-z]+'));
      expect_truthy(isMatch('zzz', '[a-z]+'));
    });

    test('should not escape plus signs that follow parens', () => {
      expect_truthy(isMatch('a', '(a)+'));
      expect_truthy(isMatch('ab', '(a|b)+'));
      expect_truthy(isMatch('aa', '(a)+'));
      expect_truthy(isMatch('aaab', '(a|b)+'));
      expect_truthy(isMatch('aaabbb', '(a|b)+'));
    });

    test('should escape plus signs to match string literals', () => {
      expect_truthy(isMatch('a+b/src/glimini.js', 'a+b/src/*.js'));
      expect_truthy(isMatch('+b/src/glimini.js', '+b/src/*.js'));
      expect_truthy(isMatch('coffee+/src/glimini.js', 'coffee+/src/*.js'));
      expect_truthy(isMatch('coffee+/src/glimini.js', 'coffee+/src/*.js'));
      expect_truthy(isMatch('coffee+/src/glimini.js', 'coffee+/src/*'));
    });

    test('should not escape + following brackets', () => {
      expect_truthy(isMatch('a', '[a]+'));
      expect_truthy(isMatch('aa', '[a]+'));
      expect_truthy(isMatch('aaa', '[a]+'));
      expect_truthy(isMatch('az', '[a-z]+'));
      expect_truthy(isMatch('zzz', '[a-z]+'));
    });

    test('should not escape + following parens', () => {
      expect_truthy(isMatch('a', '(a)+'));
      expect_truthy(isMatch('ab', '(a|b)+'));
      expect_truthy(isMatch('aa', '(a)+'));
      expect_truthy(isMatch('aaab', '(a|b)+'));
      expect_truthy(isMatch('aaabbb', '(a|b)+'));
    });
  });

  describe('dollar $', () => {
    test('should match dollar signs', () => {
      expect_truthy(!isMatch('$', '!($)'));
      expect_truthy(!isMatch('$', '!$'));
      expect_truthy(isMatch('$$', '!$'));
      expect_truthy(isMatch('$$', '!($)'));
      expect_truthy(isMatch('$$$', '!($)'));
      expect_truthy(isMatch('^', '!($)'));

      expect_truthy(isMatch('$', '!($$)'));
      expect_truthy(!isMatch('$$', '!($$)'));
      expect_truthy(isMatch('$$$', '!($$)'));
      expect_truthy(isMatch('^', '!($$)'));

      expect_truthy(!isMatch('$', '!($*)'));
      expect_truthy(!isMatch('$$', '!($*)'));
      expect_truthy(!isMatch('$$$', '!($*)'));
      expect_truthy(isMatch('^', '!($*)'));

      expect_truthy(isMatch('$', '*'));
      expect_truthy(isMatch('$$', '*'));
      expect_truthy(isMatch('$$$', '*'));
      expect_truthy(isMatch('^', '*'));

      expect_truthy(isMatch('$', '$*'));
      expect_truthy(isMatch('$$', '$*'));
      expect_truthy(isMatch('$$$', '$*'));
      expect_truthy(!isMatch('^', '$*'));

      expect_truthy(isMatch('$', '*$*'));
      expect_truthy(isMatch('$$', '*$*'));
      expect_truthy(isMatch('$$$', '*$*'));
      expect_truthy(!isMatch('^', '*$*'));

      expect_truthy(isMatch('$', '*$'));
      expect_truthy(isMatch('$$', '*$'));
      expect_truthy(isMatch('$$$', '*$'));
      expect_truthy(!isMatch('^', '*$'));

      expect_truthy(!isMatch('$', '?$'));
      expect_truthy(isMatch('$$', '?$'));
      expect_truthy(!isMatch('$$$', '?$'));
      expect_truthy(!isMatch('^', '?$'));
    });
  });

  describe('caret ^', () => {
    test('should match carets', () => {
      expect_truthy(isMatch('^', '^'));
      expect_truthy(isMatch('^/foo', '^/*'));
      expect_truthy(isMatch('^/foo', '^/*'));
      expect_truthy(isMatch('foo^', '*^'));
      expect_truthy(isMatch('^foo/foo', '^foo/*'));
      expect_truthy(isMatch('foo^/foo', 'foo^/*'));

      expect_truthy(!isMatch('^', '!(^)'));
      expect_truthy(isMatch('^^', '!(^)'));
      expect_truthy(isMatch('^^^', '!(^)'));
      expect_truthy(isMatch('&', '!(^)'));

      expect_truthy(isMatch('^', '!(^^)'));
      expect_truthy(!isMatch('^^', '!(^^)'));
      expect_truthy(isMatch('^^^', '!(^^)'));
      expect_truthy(isMatch('&', '!(^^)'));

      expect_truthy(!isMatch('^', '!(^*)'));
      expect_truthy(!isMatch('^^', '!(^*)'));
      expect_truthy(!isMatch('^^^', '!(^*)'));
      expect_truthy(isMatch('&', '!(^*)'));

      expect_truthy(isMatch('^', '*'));
      expect_truthy(isMatch('^^', '*'));
      expect_truthy(isMatch('^^^', '*'));
      expect_truthy(isMatch('&', '*'));

      expect_truthy(isMatch('^', '^*'));
      expect_truthy(isMatch('^^', '^*'));
      expect_truthy(isMatch('^^^', '^*'));
      expect_truthy(!isMatch('&', '^*'));

      expect_truthy(isMatch('^', '*^*'));
      expect_truthy(isMatch('^^', '*^*'));
      expect_truthy(isMatch('^^^', '*^*'));
      expect_truthy(!isMatch('&', '*^*'));

      expect_truthy(isMatch('^', '*^'));
      expect_truthy(isMatch('^^', '*^'));
      expect_truthy(isMatch('^^^', '*^'));
      expect_truthy(!isMatch('&', '*^'));

      expect_truthy(!isMatch('^', '?^'));
      expect_truthy(isMatch('^^', '?^'));
      expect_truthy(!isMatch('^^^', '?^'));
      expect_truthy(!isMatch('&', '?^'));
    });
  });

  describe('mixed special characters', () => {
    test('should match special characters in paths', () => {
      expect_truthy(isMatch('my/folder +1', '*/*'));
      expect_truthy(isMatch('my/folder -1', '*/*'));
      expect_truthy(isMatch('my/folder *1', '*/*'));
      expect_truthy(isMatch('my/folder', '*/*'));
      expect_truthy(isMatch('my/folder+foo+bar&baz', '*/*'));
      expect_truthy(isMatch('my/folder - $1.00', '*/*'));
      expect_truthy(isMatch('my/folder - ^1.00', '*/*'));
      expect_truthy(isMatch('my/folder - %1.00', '*/*'));

      expect_truthy(isMatch('my/folder +1', '*/!(*%)*'));
      expect_truthy(isMatch('my/folder -1', '*/!(*%)*'));
      expect_truthy(isMatch('my/folder *1', '*/!(*%)*'));
      expect_truthy(isMatch('my/folder', '*/!(*%)*'));
      expect_truthy(isMatch('my/folder+foo+bar&baz', '*/!(*%)*'));
      expect_truthy(isMatch('my/folder - $1.00', '*/!(*%)*'));
      expect_truthy(isMatch('my/folder - ^1.00', '*/!(*%)*'));
      expect_truthy(!isMatch('my/folder - %1.00', '*/!(*%)*'));

      expect_truthy(!isMatch('my/folder +1', '*/*$*'));
      expect_truthy(!isMatch('my/folder -1', '*/*$*'));
      expect_truthy(!isMatch('my/folder *1', '*/*$*'));
      expect_truthy(!isMatch('my/folder', '*/*$*'));
      expect_truthy(!isMatch('my/folder+foo+bar&baz', '*/*$*'));
      expect_truthy(isMatch('my/folder - $1.00', '*/*$*'));
      expect_truthy(!isMatch('my/folder - ^1.00', '*/*$*'));
      expect_truthy(!isMatch('my/folder - %1.00', '*/*$*'));

      expect_truthy(!isMatch('my/folder +1', '*/*^*'));
      expect_truthy(!isMatch('my/folder -1', '*/*^*'));
      expect_truthy(!isMatch('my/folder *1', '*/*^*'));
      expect_truthy(!isMatch('my/folder', '*/*^*'));
      expect_truthy(!isMatch('my/folder+foo+bar&baz', '*/*^*'));
      expect_truthy(!isMatch('my/folder - $1.00', '*/*^*'));
      expect_truthy(isMatch('my/folder - ^1.00', '*/*^*'));
      expect_truthy(!isMatch('my/folder - %1.00', '*/*^*'));

      expect_truthy(!isMatch('my/folder +1', '*/*&*'));
      expect_truthy(!isMatch('my/folder -1', '*/*&*'));
      expect_truthy(!isMatch('my/folder *1', '*/*&*'));
      expect_truthy(!isMatch('my/folder', '*/*&*'));
      expect_truthy(isMatch('my/folder+foo+bar&baz', '*/*&*'));
      expect_truthy(!isMatch('my/folder - $1.00', '*/*&*'));
      expect_truthy(!isMatch('my/folder - ^1.00', '*/*&*'));
      expect_truthy(!isMatch('my/folder - %1.00', '*/*&*'));

      expect_truthy(isMatch('my/folder +1', '*/*+*'));
      expect_truthy(!isMatch('my/folder -1', '*/*+*'));
      expect_truthy(!isMatch('my/folder *1', '*/*+*'));
      expect_truthy(!isMatch('my/folder', '*/*+*'));
      expect_truthy(isMatch('my/folder+foo+bar&baz', '*/*+*'));
      expect_truthy(!isMatch('my/folder - $1.00', '*/*+*'));
      expect_truthy(!isMatch('my/folder - ^1.00', '*/*+*'));
      expect_truthy(!isMatch('my/folder - %1.00', '*/*+*'));

      expect_truthy(!isMatch('my/folder +1', '*/*-*'));
      expect_truthy(isMatch('my/folder -1', '*/*-*'));
      expect_truthy(!isMatch('my/folder *1', '*/*-*'));
      expect_truthy(!isMatch('my/folder', '*/*-*'));
      expect_truthy(!isMatch('my/folder+foo+bar&baz', '*/*-*'));
      expect_truthy(isMatch('my/folder - $1.00', '*/*-*'));
      expect_truthy(isMatch('my/folder - ^1.00', '*/*-*'));
      expect_truthy(isMatch('my/folder - %1.00', '*/*-*'));

      expect_truthy(!isMatch('my/folder +1', '*/*\\**'));
      expect_truthy(!isMatch('my/folder -1', '*/*\\**'));
      expect_truthy(isMatch('my/folder *1', '*/*\\**'));
      expect_truthy(!isMatch('my/folder', '*/*\\**'));
      expect_truthy(!isMatch('my/folder+foo+bar&baz', '*/*\\**'));
      expect_truthy(!isMatch('my/folder - $1.00', '*/*\\**'));
      expect_truthy(!isMatch('my/folder - ^1.00', '*/*\\**'));
      expect_truthy(!isMatch('my/folder - %1.00', '*/*\\**'));
    });
  });
});
