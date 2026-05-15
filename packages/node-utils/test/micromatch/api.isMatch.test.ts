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


const { isMatch, any } = micromatch;

describe('.isMatch():', () => {
  describe('error handling:', () => {
    test('should throw on bad args', () => {
      expect_throws(() => isMatch({}), /Expected/i);
    });
  });

  describe('alias:', () => {
    test('should have the alias .any(...)', () => {
      expect_equal(isMatch, any);
    });
  });

  describe('matching:', () => {
    test('should escape plus signs to match string literals', () => {
      expect_truthy(isMatch('a+b/src/glimini.js', 'a+b/src/*.js'));
      expect_truthy(isMatch('+b/src/glimini.js', '+b/src/*.js'));
      expect_truthy(isMatch('coffee+/src/glimini.js', 'coffee+/src/*.js'));
      expect_truthy(isMatch('coffee+/src/glimini.js', 'coffee+/src/*.js'));
      expect_truthy(isMatch('coffee+/src/glimini.js', 'coffee+/src/*'));
    });

    test('should not escape plus signs that follow brackets', () => {
      expect_truthy(isMatch('a', '[a]+'));
      expect_truthy(isMatch('aa', '[a]+'));
      expect_truthy(isMatch('aaa', '[a]+'));
      expect_truthy(isMatch('az', '[a-z]+'));
      expect_truthy(isMatch('zzz', '[a-z]+'));
    });

    test('should support stars following brackets', () => {
      expect_truthy(isMatch('a', '[a]*'));
      expect_truthy(isMatch('aa', '[a]*'));
      expect_truthy(isMatch('aaa', '[a]*'));
      expect_truthy(isMatch('az', '[a-z]*'));
      expect_truthy(isMatch('zzz', '[a-z]*'));
    });

    test('should not escape plus signs that follow parens', () => {
      expect_truthy(isMatch('a', '(a)+'));
      expect_truthy(isMatch('ab', '(a|b)+'));
      expect_truthy(isMatch('aa', '(a)+'));
      expect_truthy(isMatch('aaab', '(a|b)+'));
      expect_truthy(isMatch('aaabbb', '(a|b)+'));
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

    test('should match with non-glob patterns', () => {
      expect_truthy(isMatch('.', '.'));
      expect_truthy(isMatch('/a', '/a'));
      expect_truthy(!isMatch('/ab', '/a'));
      expect_truthy(isMatch('a', 'a'));
      expect_truthy(!isMatch('ab', '/a'));
      expect_truthy(!isMatch('ab', 'a'));
      expect_truthy(isMatch('ab', 'ab'));
      expect_truthy(!isMatch('abcd', 'cd'));
      expect_truthy(!isMatch('abcd', 'bc'));
      expect_truthy(!isMatch('abcd', 'ab'));
    });

    test('should match non-leading dots', () => {
      expect_truthy(isMatch('a.b', 'a.b'));
      expect_truthy(isMatch('a.b', '*.b'));
      expect_truthy(isMatch('a.b', 'a.*'));
      expect_truthy(isMatch('a.b', '*.*'));
      expect_truthy(isMatch('a-b.c-d', 'a*.c*'));
      expect_truthy(isMatch('a-b.c-d', '*b.*d'));
      expect_truthy(isMatch('a-b.c-d', '*.*'));
      expect_truthy(isMatch('a-b.c-d', '*.*-*'));
      expect_truthy(isMatch('a-b.c-d', '*-*.*-*'));
      expect_truthy(isMatch('a-b.c-d', '*.c-*'));
      expect_truthy(isMatch('a-b.c-d', '*.*-d'));
      expect_truthy(isMatch('a-b.c-d', 'a-*.*-d'));
      expect_truthy(isMatch('a-b.c-d', '*-b.c-*'));
      expect_truthy(isMatch('a-b.c-d', '*-b*c-*'));

      // false
      expect_truthy(!isMatch('a-b.c-d', '*-bc-*'));
    });

    test('should match with common glob patterns', () => {
      expect_truthy(!isMatch('/ab', './*/'));
      expect_truthy(!isMatch('/ef', '*'));
      expect_truthy(!isMatch('ab', './*/'));
      expect_truthy(!isMatch('ef', '/*'));
      expect_truthy(isMatch('/ab', '/*'));
      expect_truthy(isMatch('/cd', '/*'));
      expect_truthy(isMatch('ab', '*'));
      expect_truthy(isMatch('ab', './*'));
      expect_truthy(isMatch('ab', 'ab'));
      expect_truthy(isMatch('ab/', './*/'));
    });

    test('should exactly match leading slash', () => {
      expect_truthy(!isMatch('ef', '/*'));
      expect_truthy(isMatch('/ef', '/*'));
    });

    test('should match files with the given extension', () => {
      expect_truthy(!isMatch('.c.md', '*.md'));
      expect_truthy(!isMatch('.md', '*.md'));
      expect_truthy(!isMatch('a/b/c.md', 'a/*.md'));
      expect_truthy(!isMatch('a/b/c/c.md', '*.md'));
      expect_truthy(isMatch('.c.md', '.*.md'));
      expect_truthy(isMatch('.md', '.md'));
      expect_truthy(isMatch('a/b/c.js', 'a/**/*.*'));
      expect_truthy(isMatch('a/b/c.md', '**/*.md'));
      expect_truthy(isMatch('a/b/c.md', 'a/*/*.md'));
      expect_truthy(isMatch('c.md', '*.md'));
      expect_truthy(isMatch('c.md', '*.md'));
    });

    test('should match wildcards', () => {
      expect_truthy(!isMatch('a/b/c/z.js', '*.js'));
      expect_truthy(!isMatch('a/b/z.js', '*.js'));
      expect_truthy(!isMatch('a/z.js', '*.js'));
      expect_truthy(isMatch('z.js', '*.js'));

      expect_truthy(isMatch('z.js', 'z*.js'));
      expect_truthy(isMatch('a/z.js', 'a/z*.js'));
      expect_truthy(isMatch('a/z.js', '*/z*.js'));
      expect_truthy(isMatch('a/b', 'a/b*'));
      expect_truthy(isMatch('a/b', 'a/b*', { dot: true }));
    });

    test('should match globstars', () => {
      expect_truthy(isMatch('a/b/c/z.js', '**/*.js'));
      expect_truthy(isMatch('a/b/z.js', '**/*.js'));
      expect_truthy(isMatch('a/z.js', '**/*.js'));
      expect_truthy(isMatch('a/b/c/d/e/z.js', 'a/b/**/*.js'));
      expect_truthy(isMatch('a/b/c/d/z.js', 'a/b/**/*.js'));
      expect_truthy(isMatch('a/b/c/z.js', 'a/b/c/**/*.js'));
      expect_truthy(isMatch('a/b/c/z.js', 'a/b/c**/*.js'));
      expect_truthy(isMatch('a/b/c/z.js', 'a/b/**/*.js'));
      expect_truthy(isMatch('a/b/z.js', 'a/b/**/*.js'));

      expect_truthy(!isMatch('a/z.js', 'a/b/**/*.js'));
      expect_truthy(!isMatch('z.js', 'a/b/**/*.js'));

      // https://github.com/micromatch/micromatch/issues/15
      expect_truthy(isMatch('z.js', 'z*'));
      expect_truthy(isMatch('z.js', '**/z*'));
      expect_truthy(isMatch('z.js', '**/z*.js'));
      expect_truthy(isMatch('z.js', '**/*.js'));
      expect_truthy(isMatch('foo', '**/foo'));
    });

    test('issue #23', () => {
      expect_truthy(!isMatch('zzjs', 'z*.js'));
      expect_truthy(!isMatch('zzjs', '*z.js'));
    });

    test('issue #24', () => {
      expect_truthy(isMatch('a', '**'));
      expect_truthy(isMatch('a', 'a/**'));
      expect_truthy(isMatch('a/', '**'));
      expect_truthy(isMatch('a/b/c/d', '**'));
      expect_truthy(isMatch('a/b/c/d/', '**'));
      expect_truthy(isMatch('a/b/c/d/', '**/**'));
      expect_truthy(isMatch('a/b/c/d/', '**/b/**'));
      expect_truthy(isMatch('a/b/c/d/', 'a/b/**'));
      expect_truthy(isMatch('a/b/c/d/', 'a/b/**/'));
      expect_truthy(isMatch('a/b/c/d/', 'a/b/**/c/**/'));
      expect_truthy(isMatch('a/b/c/d/', 'a/b/**/c/**/d/'));
      expect_truthy(!isMatch('a/b/c/d/', 'a/b/**/f'));
      expect_truthy(isMatch('a/b/c/d/e.f', 'a/b/**/**/*.*'));
      expect_truthy(isMatch('a/b/c/d/e.f', 'a/b/**/*.*'));
      expect_truthy(isMatch('a/b/c/d/e.f', 'a/b/**/c/**/d/*.*'));
      expect_truthy(isMatch('a/b/c/d/e.f', 'a/b/**/d/**/*.*'));
      expect_truthy(isMatch('a/b/c/d/g/e.f', 'a/b/**/d/**/*.*'));
      expect_truthy(isMatch('a/b/c/d/g/g/e.f', 'a/b/**/d/**/*.*'));
      expect_truthy(isMatch('a/b-c/z.js', 'a/b-*/**/z.js'));
      expect_truthy(isMatch('a/b-c/d/e/z.js', 'a/b-*/**/z.js'));
    });

    test('should match slashes', () => {
      expect_truthy(!isMatch('bar/baz/foo', '*/foo'));
      expect_truthy(!isMatch('deep/foo/bar', '**/bar/*'));
      expect_truthy(!isMatch('deep/foo/bar/baz/x', '*/bar/**'));
      expect_truthy(!isMatch('foo/bar', 'foo?bar'));
      expect_truthy(!isMatch('foo/bar/baz', '**/bar*'));
      expect_truthy(!isMatch('foo/bar/baz', '**/bar**'));
      expect_truthy(!isMatch('foo/baz/bar', 'foo**bar'));
      expect_truthy(!isMatch('foo/baz/bar', 'foo*bar'));
      expect_truthy(isMatch('foo', 'foo/**'));
      expect_truthy(isMatch('a/b/j/c/z/x.md', 'a/**/j/**/z/*.md'));
      expect_truthy(isMatch('a/j/z/x.md', 'a/**/j/**/z/*.md'));
      expect_truthy(isMatch('bar/baz/foo', '**/foo'));
      expect_truthy(isMatch('deep/foo/bar/', '**/bar/**'));
      expect_truthy(isMatch('deep/foo/bar/baz', '**/bar/*'));
      expect_truthy(isMatch('deep/foo/bar/baz/', '**/bar/*/'));
      expect_truthy(isMatch('deep/foo/bar/baz/', '**/bar/**'));
      expect_truthy(isMatch('deep/foo/bar/baz/x', '**/bar/*/*'));
      expect_truthy(isMatch('foo/b/a/z/bar', 'foo/**/**/bar'));
      expect_truthy(isMatch('foo/b/a/z/bar', 'foo/**/bar'));
      expect_truthy(isMatch('foo/bar', 'foo/**/**/bar'));
      expect_truthy(isMatch('foo/bar', 'foo/**/bar'));
      expect_truthy(isMatch('foo/bar', 'foo[/]bar'));
      expect_truthy(isMatch('foo/bar/baz/x', '*/bar/**'));
      expect_truthy(isMatch('foo/baz/bar', 'foo/**/**/bar'));
      expect_truthy(isMatch('foo/baz/bar', 'foo/**/bar'));
      expect_truthy(isMatch('foobazbar', 'foo**bar'));
      expect_truthy(isMatch('XXX/foo', '**/foo'));

      // https://github.com/micromatch/micromatch/issues/89
      expect_truthy(isMatch('foo//baz.md', 'foo//baz.md'));
      expect_truthy(isMatch('foo//baz.md', 'foo//*baz.md'));
      expect_truthy(!isMatch('foo//baz.md', 'foo/baz.md'));
      expect_truthy(!isMatch('foo/baz.md', 'foo//baz.md'));
    });

    test('question marks should not match slashes', () => {
      expect_truthy(!isMatch('aaa/bbb', 'aaa?bbb'));
    });

    test('should not match dotfiles when `dot` or `dotfiles` are not set', () => {
      expect_truthy(!isMatch('.c.md', '*.md'));
      expect_truthy(!isMatch('a/.c.md', '*.md'));
      expect_truthy(isMatch('a/.c.md', 'a/.c.md'));
      expect_truthy(!isMatch('.a', '*.md'));
      expect_truthy(!isMatch('.verb.txt', '*.md'));
      expect_truthy(isMatch('a/b/c/.xyz.md', 'a/b/c/.*.md'));
      expect_truthy(isMatch('.md', '.md'));
      expect_truthy(!isMatch('.txt', '.md'));
      expect_truthy(isMatch('.md', '.md'));
      expect_truthy(isMatch('.a', '.a'));
      expect_truthy(isMatch('.b', '.b*'));
      expect_truthy(isMatch('.ab', '.a*'));
      expect_truthy(isMatch('.ab', '.*'));
      expect_truthy(!isMatch('.ab', '*.*'));
      expect_truthy(!isMatch('.md', 'a/b/c/*.md'));
      expect_truthy(!isMatch('.a.md', 'a/b/c/*.md'));
      expect_truthy(isMatch('a/b/c/d.a.md', 'a/b/c/*.md'));
      expect_truthy(!isMatch('a/b/d/.md', 'a/b/c/*.md'));
    });

    test('should match dotfiles when `dot` or `dotfiles` is set', () => {
      expect_truthy(isMatch('.c.md', '*.md', { dot: true }));
      expect_truthy(isMatch('.c.md', '.*', { dot: true }));
      expect_truthy(isMatch('a/b/c/.xyz.md', 'a/b/c/.*.md', { dot: true }));
      expect_truthy(isMatch('a/b/c/.xyz.md', 'a/b/c/*.md', { dot: true }));
    });

    test('should match file paths', () => {
      expect_truthy(isMatch('a/b/c/xyz.md', 'a/b/c/*.md'));
      expect_truthy(isMatch('a/bb/c/xyz.md', 'a/*/c/*.md'));
      expect_truthy(isMatch('a/bbbb/c/xyz.md', 'a/*/c/*.md'));
      expect_truthy(isMatch('a/bb.bb/c/xyz.md', 'a/*/c/*.md'));
      expect_truthy(isMatch('a/bb.bb/aa/bb/aa/c/xyz.md', 'a/**/c/*.md'));
      expect_truthy(isMatch('a/bb.bb/aa/b.b/aa/c/xyz.md', 'a/**/c/*.md'));
    });

    test('should match full file paths', () => {
      expect_truthy(!isMatch('a/.b', 'a/**/z/*.md'));
      expect_truthy(isMatch('a/.b', 'a/.*'));
      expect_truthy(!isMatch('a/b/z/.a', 'a/**/z/*.a'));
      expect_truthy(!isMatch('a/b/z/.a', 'a/*/z/*.a'));
      expect_truthy(isMatch('a/b/z/.a', 'a/*/z/.a'));
      expect_truthy(isMatch('a/b/c/d/e/z/c.md', 'a/**/z/*.md'));
      expect_truthy(isMatch('a/b/c/d/e/j/n/p/o/z/c.md', 'a/**/j/**/z/*.md'));
      expect_truthy(!isMatch('a/b/c/j/e/z/c.txt', 'a/**/j/**/z/*.md'));
    });

    test('should match paths with leading `./` when pattern has `./`', () => {
      let format = str => str.replace(/^\.\//, '');
      expect_truthy(isMatch('./a/b/c/d/e/j/n/p/o/z/c.md', './a/**/j/**/z/*.md', { format }));
      expect_truthy(isMatch('./a/b/c/d/e/z/c.md', './a/**/z/*.md', { format }));
      expect_truthy(isMatch('./a/b/c/j/e/z/c.md', './a/**/j/**/z/*.md', { format }));
      expect_truthy(isMatch('./a/b/z/.a', './a/**/z/.a', { format }));
      expect_truthy(!isMatch('./a/b/c/d/e/z/c.md', './a/**/j/**/z/*.md', { format }));
      expect_truthy(!isMatch('./a/b/c/j/e/z/c.txt', './a/**/j/**/z/*.md', { format }));
    });

    test('should match paths with leading `./`', () => {
      let format = str => str.replace(/^\.\//, '');
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
      expect_truthy(isMatch('./a/b/c/j/e/z/c.md', '?(./)a/**/j/**/z/*.md', { format }));
      expect_truthy(isMatch('./a/b/z/.a', './a/**/z/.a', { format }));
      expect_truthy(isMatch('./a/b/z/.a', '?(./)a/**/z/.a', { format }));
      expect_truthy(isMatch('.a', './.a', { format }));
      expect_truthy(isMatch('a/b/c.md', './a/**/*.md', { format }));
      expect_truthy(isMatch('a/b/c.md', 'a/**/*.md', { format }));
      expect_truthy(isMatch('a/b/c/d/e/z/c.md', 'a/**/z/*.md', { format }));
      expect_truthy(isMatch('a/b/c/j/e/z/c.md', 'a/**/j/**/z/*.md', { format }));
    });
  });

  describe('errors', () => {
    test('should throw an error when value is not a string', () => {
      expect_throws(() => isMatch());
    });
  });

  describe('empty patterns', () => {
    test('should throw an error when empty patterns are defined', () => {
      expect_throws(() => isMatch('', ''));
      expect_throws(() => isMatch('', ['']));
      expect_throws(() => isMatch('.', ''));
      expect_throws(() => isMatch('.', ['']));
      expect_throws(() => isMatch('a', ''));
      expect_throws(() => isMatch('a', ['']));
      expect_throws(() => isMatch('ab', ''));
      expect_throws(() => isMatch('ab', ['']));
      expect_throws(() => isMatch('./', ''));
      expect_throws(() => isMatch('./', ['']));
    });
  });

  describe('non-globs', () => {
    test('should match literal paths', () => {
      expect_truthy(!isMatch('aaa', 'aa'));
      expect_truthy(isMatch('aaa', 'aaa'));
      expect_truthy(isMatch('aaa', ['aa', 'aaa']));
      expect_truthy(isMatch('aaa/bbb', 'aaa/bbb'));
      expect_truthy(isMatch('aaa/bbb', 'aaa[/]bbb'));
      expect_truthy(isMatch('aaa/bbb', ['aaa\\bbb', 'aaa/bbb']));
      expect_truthy(isMatch('aaa\\bbb', ['aaa\\bbb', 'aaa/bbb']));
    });
  });

  describe('dots', () => {
    test('should match a dots with dots in the pattern', () => {
      expect_truthy(isMatch('.', '.'));
    });
  });

  describe('stars (single pattern)', () => {
    test('should return true when one of the given patterns matches the string', () => {
      expect_truthy(!isMatch('a/.b', 'a/'));
      expect_truthy(!isMatch('a/b/c/d/e/z/c.md', 'b/c/d/e'));
      expect_truthy(!isMatch('a/b/z/.a', 'b/z'));
      expect_truthy(isMatch('/ab', '*/*'));
      expect_truthy(isMatch('/ab', '*/*'));
      expect_truthy(isMatch('/ab', '/*'));
      expect_truthy(isMatch('/cd', '/*'));
      expect_truthy(isMatch('a', 'a'));
      expect_truthy(isMatch('a/.b', 'a/.*'));
      expect_truthy(isMatch('a/b/c/d/e/j/n/p/o/z/c.md', 'a/**/j/**/z/*.md'));
      expect_truthy(isMatch('a/b/c/d/e/z/c.md', 'a/**/z/*.md'));
      expect_truthy(isMatch('a/b/c/xyz.md', 'a/b/c/*.md'));
      expect_truthy(isMatch('a/b/c/xyz.md', ['foo', 'a/b/c/*.md']));
      expect_truthy(isMatch('a/b/z/.a', 'a/*/z/.a'));
      expect_truthy(isMatch('a/bb.bb/aa/b.b/aa/c/xyz.md', 'a/**/c/*.md'));
      expect_truthy(isMatch('a/bb.bb/aa/bb/aa/c/xyz.md', 'a/**/c/*.md'));
      expect_truthy(isMatch('a/bb.bb/c/xyz.md', 'a/*/c/*.md'));
      expect_truthy(isMatch('a/bb/c/xyz.md', 'a/*/c/*.md'));
      expect_truthy(isMatch('a/bbbb/c/xyz.md', 'a/*/c/*.md'));
      expect_truthy(isMatch('aaa', ['foo', '*']));
      expect_truthy(isMatch('ab', '*'));
      expect_truthy(isMatch('ab', './*'));
      expect_truthy(isMatch('ab', 'ab'));
      expect_truthy(isMatch('ab/', './*/'));
    });

    test('should return false when the path does not match the pattern', () => {
      expect_truthy(!isMatch('ab/', '*/*'));
      expect_truthy(!isMatch('/ab', '*/'));
      expect_truthy(!isMatch('/ab', '*/a'));
      expect_truthy(!isMatch('/ab', '/'));
      expect_truthy(!isMatch('/ab', '/a'));
      expect_truthy(!isMatch('/ab', 'a/*'));
      expect_truthy(!isMatch('a/.b', 'a/'));
      expect_truthy(!isMatch('a/b/c', 'a/*'));
      expect_truthy(!isMatch('a/b/c', 'a/b'));
      expect_truthy(!isMatch('a/b/c/d/e/z/c.md', 'b/c/d/e'));
      expect_truthy(!isMatch('a/b/z/.a', 'b/z'));
      expect_truthy(!isMatch('ab', '*/*'));
      expect_truthy(!isMatch('ab', '/a'));
      expect_truthy(!isMatch('ab', 'a'));
      expect_truthy(!isMatch('ab', 'b'));
      expect_truthy(!isMatch('ab', 'c'));
      expect_truthy(!isMatch('abcd', 'ab'));
      expect_truthy(!isMatch('abcd', 'bc'));
      expect_truthy(!isMatch('abcd', 'c'));
      expect_truthy(!isMatch('abcd', 'cd'));
      expect_truthy(!isMatch('abcd', 'd'));
      expect_truthy(!isMatch('abcd', 'f'));
      expect_truthy(!isMatch('ef', '/*'));
    });

    test('should match a path segment for each single star', () => {
      expect_truthy(!isMatch('aaa', '*/*/*'));
      expect_truthy(!isMatch('aaa/bb/aa/rr', '*/*/*'));
      expect_truthy(!isMatch('aaa/bba/ccc', 'aaa*'));
      expect_truthy(!isMatch('aaa/bba/ccc', 'aaa**'));
      expect_truthy(!isMatch('aaa/bba/ccc', 'aaa/*'));
      expect_truthy(!isMatch('aaa/bba/ccc', 'aaa/*ccc'));
      expect_truthy(!isMatch('aaa/bba/ccc', 'aaa/*z'));
      expect_truthy(!isMatch('aaa/bbb', '*/*/*'));
      expect_truthy(!isMatch('ab/zzz/ejkl/hi', '*/*jk*/*i'));
      expect_truthy(isMatch('aaa/bba/ccc', '*/*/*'));
      expect_truthy(isMatch('aaa/bba/ccc', 'aaa/**'));
      expect_truthy(isMatch('aaa/bbb', 'aaa/*'));
      expect_truthy(isMatch('ab/zzz/ejkl/hi', '*/*z*/*/*i'));
      expect_truthy(isMatch('abzzzejklhi', '*j*i'));
    });

    test('should regard non-exclusive double-stars as single stars', () => {
      expect_truthy(!isMatch('aaa/bba/ccc', 'aaa/**ccc'));
      expect_truthy(!isMatch('aaa/bba/ccc', 'aaa/**z'));
    });

    test('should return false when full file paths are not matched', () => {
      expect_truthy(!isMatch('a/b/z/.a', 'a/**/z/*.a'));
      expect_truthy(!isMatch('a/b/z/.a', 'a/*/z/*.a'));
      expect_truthy(!isMatch('a/.b', 'a/**/z/*.md'));
      expect_truthy(!isMatch('a/b/c/j/e/z/c.txt', 'a/**/j/**/z/*.md'));
      expect_truthy(!isMatch('a/b/c/xyz.md', 'a/b/**/c{d,e}/**/xyz.md'));
      expect_truthy(!isMatch('a/b/d/xyz.md', 'a/b/**/c{d,e}/**/xyz.md'));
      expect_truthy(!isMatch('a/b/z/.a', 'b/a'));
    });
  });

  describe('stars (multiple patterns)', () => {
    test('should return true when any of the patterns match', () => {
      expect_truthy(isMatch('.', ['.', 'foo']));
      expect_truthy(isMatch('a', ['a', 'foo']));
      expect_truthy(isMatch('ab', ['*', 'foo', 'bar']));
      expect_truthy(isMatch('ab', ['*b', 'foo', 'bar']));
      expect_truthy(isMatch('ab', ['./*', 'foo', 'bar']));
      expect_truthy(isMatch('ab', ['a*', 'foo', 'bar']));
      expect_truthy(isMatch('ab', ['ab', 'foo']));
    });

    test('should return false when none of the patterns match', () => {
      expect_truthy(!isMatch('/ab', ['/a', 'foo']));
      expect_truthy(!isMatch('a/b/c', ['a/b', 'foo']));
      expect_truthy(!isMatch('ab', ['*/*', 'foo', 'bar']));
      expect_truthy(!isMatch('ab', ['/a', 'foo', 'bar']));
      expect_truthy(!isMatch('ab', ['a', 'foo']));
      expect_truthy(!isMatch('ab', ['b', 'foo']));
      expect_truthy(!isMatch('ab', ['c', 'foo', 'bar']));
      expect_truthy(!isMatch('abcd', ['ab', 'foo']));
      expect_truthy(!isMatch('abcd', ['bc', 'foo']));
      expect_truthy(!isMatch('abcd', ['c', 'foo']));
      expect_truthy(!isMatch('abcd', ['cd', 'foo']));
      expect_truthy(!isMatch('abcd', ['d', 'foo']));
      expect_truthy(!isMatch('abcd', ['f', 'foo', 'bar']));
      expect_truthy(!isMatch('ef', ['/*', 'foo', 'bar']));
    });
  });

  describe('file extensions', () => {
    test('should match files that contain the given extension', () => {
      expect_truthy(isMatch('.c.md', '.*.md'));
      expect_truthy(isMatch('a/b/c.md', '**/*.md'));
      expect_truthy(isMatch('a/b/c.md', 'a/*/*.md'));
      expect_truthy(isMatch('c.md', '*.md'));
    });

    test('should not match files that do not contain the given extension', () => {
      expect_truthy(!isMatch('.c.md', '*.md'));
      expect_truthy(!isMatch('.c.md', '.c.'));
      expect_truthy(!isMatch('.c.md', '.md'));
      expect_truthy(!isMatch('.md', '*.md'));
      expect_truthy(!isMatch('.md', '.m'));
      expect_truthy(!isMatch('a/b/c.md', '*.md'));
      expect_truthy(!isMatch('a/b/c.md', '.md'));
      expect_truthy(!isMatch('a/b/c.md', 'a/*.md'));
      expect_truthy(!isMatch('a/b/c/c.md', '*.md'));
      expect_truthy(!isMatch('a/b/c/c.md', 'c.js'));
    });
  });

  describe('dot files', () => {
    test('should match dotfiles when a dot is explicitly defined in the pattern', () => {
      expect_truthy(isMatch('.a', '.a'));
      expect_truthy(isMatch('.ab', '.*'));
      expect_truthy(isMatch('.ab', '.a*'));
      expect_truthy(isMatch('.b', '.b*'));
      expect_truthy(isMatch('.md', '.md'));
      expect_truthy(isMatch('a/.c.md', 'a/.c.md'));
      expect_truthy(isMatch('a/b/c/.xyz.md', 'a/b/c/.*.md'));
      expect_truthy(isMatch('a/b/c/d.a.md', 'a/b/c/*.md'));
    });

    test('should not match dotfiles when a dot is not defined in the pattern', () => {
      expect_truthy(!isMatch('.abc', '.a'));
      expect_truthy(!isMatch('.c.md', '*.md'));
      expect_truthy(!isMatch('a/.c.md', '*.md'));
    });

    test('should match dotfiles when `dot` is set', () => {
      expect_truthy(!isMatch('a/b/c/.xyz.md', '.*.md', { dot: true }));
      expect_truthy(isMatch('.c.md', '*.md', { dot: true }));
      expect_truthy(isMatch('.c.md', '.*', { dot: true }));
      expect_truthy(isMatch('a/b/c/.xyz.md', '**/*.md', { dot: true }));
      expect_truthy(isMatch('a/b/c/.xyz.md', '**/.*.md', { dot: true }));
      expect_truthy(isMatch('a/b/c/.xyz.md', 'a/b/c/*.md', { dot: true }));
      expect_truthy(isMatch('a/b/c/.xyz.md', 'a/b/c/.*.md', { dot: true }));
    });

    test('should not match dotfiles when `dot` is not set', () => {
      expect_truthy(!isMatch('.a', '*.md'));
      expect_truthy(!isMatch('.ba', '.a'));
      expect_truthy(!isMatch('.a.md', 'a/b/c/*.md'));
      expect_truthy(!isMatch('.ab', '*.*'));
      expect_truthy(!isMatch('.md', 'a/b/c/*.md'));
      expect_truthy(!isMatch('.txt', '.md'));
      expect_truthy(!isMatch('.verb.txt', '*.md'));
      expect_truthy(!isMatch('a/b/d/.md', 'a/b/c/*.md'));
    });
  });

  describe('dot-slash', () => {
    test('should match paths with leading `./`', () => {
      let format = str => str.replace(/^\.\//, '');

      expect_truthy(isMatch('./a', ['a', '?(./)*'], { format }));
      expect_truthy(isMatch('a', ['a', '?(./)*'], { format }));
      expect_truthy(isMatch('a', ['?(./)*'], { format }));
      expect_truthy(!isMatch('./.a', 'a/**/z/*.md', { format }));
      expect_truthy(!isMatch('./a/b/c/d/e/z/c.md', './a/**/j/**/z/*.md', { format }));
      expect_truthy(!isMatch('./a/b/c/j/e/z/c.txt', './a/**/j/**/z/*.md', { format }));
      expect_truthy(isMatch('./a/b/c/d/e/j/n/p/o/z/c.md', './a/**/j/**/z/*.md', { format }));
      expect_truthy(isMatch('./a/b/c/d/e/z/c.md', './a/**/z/*.md', { format }));
      expect_truthy(isMatch('./a/b/c/d/e/z/c.md', '?(./)a/**/z/*.md', { format }));
      expect_truthy(isMatch('./a/b/c/j/e/z/c.md', './a/**/j/**/z/*.md', { format }));
      expect_truthy(isMatch('./a/b/c/j/e/z/c.md', '?(./)a/**/j/**/z/*.md', { format }));
      expect_truthy(isMatch('./a/b/z/.a', './a/**/z/.a', { format }));
      expect_truthy(isMatch('./a/b/z/.a', '?(./)a/**/z/.a', { format }));
    });
  });
});
