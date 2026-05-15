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


const mm = micromatch;
const sep = path.sep;

describe('.contains()', () => {
  afterEach(() => ((path as any).sep = sep));
  after(() => ((path as any).sep = sep));

  describe('errors', () => {
    test('should throw an error arguments are invalid', () => {
      expect_throws(() => mm.contains());
    });
  });

  describe('patterns', () => {
    test('should correctly deal with empty patterns', () => {
      expect_truthy(!mm.contains('ab', ''));
      expect_truthy(!mm.contains('a', ''));
      expect_truthy(!mm.contains('.', ''));
    });

    test('should return true when the path contains the pattern', () => {
      expect_truthy(mm.contains('ab', 'b'));
      expect_truthy(mm.contains('.', '.'));
      expect_truthy(mm.contains('a/b/c', 'a/b'));
      expect_truthy(mm.contains('/ab', '/a'));
      expect_truthy(mm.contains('a', 'a'));
      expect_truthy(mm.contains('ab', 'a'));
      expect_truthy(mm.contains('ab', 'ab'));
      expect_truthy(mm.contains('abcd', 'd'));
      expect_truthy(mm.contains('abcd', 'c'));
      expect_truthy(mm.contains('abcd', 'cd'));
      expect_truthy(mm.contains('abcd', 'bc'));
      expect_truthy(mm.contains('abcd', 'ab'));
    });

    test('should be true when a glob pattern partially matches the path', () => {
      expect_truthy(mm.contains('a/b/c', 'a/*'));
      expect_truthy(mm.contains('/ab', '/a'));
      expect_truthy(mm.contains('/ab', '/*'));
      expect_truthy(mm.contains('/cd', '/*'));
      expect_truthy(mm.contains('ab', '*'));
      expect_truthy(mm.contains('ab', 'ab'));
      expect_truthy(mm.contains('/ab', '*/a'));
      expect_truthy(mm.contains('/ab', '*/'));
      expect_truthy(mm.contains('/ab', '*/*'));
      expect_truthy(mm.contains('/ab', '/'));
      expect_truthy(mm.contains('/ab', '/??'));
      expect_truthy(mm.contains('/ab', '/?b'));
      expect_truthy(mm.contains('/ab', '/?'));
      expect_truthy(mm.contains('a/b', '?/?'));
    });

    test('should return false when the path does not contain the pattern', () => {
      expect_truthy(!mm.contains('/ab', '?/?'));
      expect_truthy(!mm.contains('ab', '*/*'));
      expect_truthy(!mm.contains('abcd', 'f'));
      expect_truthy(!mm.contains('ab', 'c'));
      expect_truthy(!mm.contains('ab', '/a'));
      expect_truthy(!mm.contains('/ab', 'a/*'));
      expect_truthy(!mm.contains('ef', '/*'));
    });

    test('should match files that contain the given extension', () => {
      expect_truthy(mm.contains('ab', './*'));
      expect_truthy(mm.contains('.c.md', '*.md'));
      expect_truthy(mm.contains('.c.md', '.*.md'));
      expect_truthy(mm.contains('.c.md', '.c.'));
      expect_truthy(mm.contains('.c.md', '.md'));
      expect_truthy(mm.contains('.md', '.m'));
      expect_truthy(mm.contains('a/b/c.md', '**/*.md'));
      expect_truthy(mm.contains('a/b/c.md', '*.md'));
      expect_truthy(mm.contains('a/b/c.md', '.md'));
      expect_truthy(mm.contains('a/b/c.md', 'a/*/*.md'));
      expect_truthy(mm.contains('a/b/c/c.md', '*.md'));
      expect_truthy(mm.contains('c.md', '*.md'));
    });

    test('should not match files that do not contain the given extension', () => {
      expect_truthy(!mm.contains('.md', '*.md'));
      expect_truthy(!mm.contains('a/b/c/c.md', 'c.js'));
      expect_truthy(!mm.contains('a/b/c.md', 'a/*.md'));
    });

    test('should match dotfiles when a dot is explicitly defined in the pattern', () => {
      expect_truthy(mm.contains('.a', '.a'));
      expect_truthy(mm.contains('.ab', '.*'));
      expect_truthy(mm.contains('.ab', '.a*'));
      expect_truthy(mm.contains('.abc', '.a'));
      expect_truthy(mm.contains('.b', '.b*'));
      expect_truthy(mm.contains('.c.md', '*.md'));
      expect_truthy(mm.contains('.md', '.md'));
      expect_truthy(mm.contains('a/.c.md', '*.md'));
      expect_truthy(mm.contains('a/.c.md', 'a/.c.md'));
      expect_truthy(mm.contains('a/b/c/.xyz.md', 'a/b/c/.*.md'));
      expect_truthy(mm.contains('a/b/c/d.a.md', 'a/b/c/*.md'));
    });

    test('should match dotfiles when `dot` or `dotfiles` is set', () => {
      expect_truthy(mm.contains('.c.md', '*.md', { dot: true }));
      expect_truthy(mm.contains('.c.md', '.*', { dot: true }));
      expect_truthy(mm.contains('a/b/c/.xyz.md', '**/*.md', { dot: true }));
      expect_truthy(mm.contains('a/b/c/.xyz.md', '**/.*.md', { dot: true }));
      expect_truthy(mm.contains('a/b/c/.xyz.md', '.*.md', { dot: true }));
      expect_truthy(mm.contains('a/b/c/.xyz.md', 'a/b/c/*.md', { dot: true }));
      expect_truthy(mm.contains('a/b/c/.xyz.md', 'a/b/c/.*.md', { dot: true }));
    });

    test('should not match dotfiles when `dot` or `dotfiles` is not set', () => {
      expect_truthy(!mm.contains('.a', '*.md'));
      expect_truthy(!mm.contains('.ba', '.a'));
      expect_truthy(!mm.contains('.a.md', 'a/b/c/*.md'));
      expect_truthy(!mm.contains('.ab', '*.*'));
      expect_truthy(!mm.contains('.md', 'a/b/c/*.md'));
      expect_truthy(!mm.contains('.txt', '.md'));
      expect_truthy(!mm.contains('.verb.txt', '*.md'));
      expect_truthy(!mm.contains('a/b/d/.md', 'a/b/c/*.md'));
    });

    test('should match file paths', () => {
      expect_truthy(mm.contains('a/b/c/xyz.md', 'a/b/c/*.md'));
      expect_truthy(mm.contains('a/bb/c/xyz.md', 'a/*/c/*.md'));
      expect_truthy(mm.contains('a/bbbb/c/xyz.md', 'a/*/c/*.md'));
      expect_truthy(mm.contains('a/bb.bb/c/xyz.md', 'a/*/c/*.md'));
      expect_truthy(mm.contains('a/bb.bb/aa/bb/aa/c/xyz.md', 'a/**/c/*.md'));
      expect_truthy(mm.contains('a/bb.bb/aa/b.b/aa/c/xyz.md', 'a/**/c/*.md'));
    });

    test('should return true when full file paths are matched', () => {
      expect_truthy(mm.contains('a/.b', 'a/.*'));
      expect_truthy(mm.contains('a/.b', 'a/'));
      expect_truthy(mm.contains('a/b/z/.a', 'b/z'));
      expect_truthy(mm.contains('a/b/z/.a', 'a/*/z/.a'));
      expect_truthy(mm.contains('a/b/c/d/e/z/c.md', 'a/**/z/*.md'));
      expect_truthy(mm.contains('a/b/c/d/e/z/c.md', 'b/c/d/e'));
      expect_truthy(mm.contains('a/b/c/d/e/j/n/p/o/z/c.md', 'a/**/j/**/z/*.md'));
    });

    test('should match path segments', () => {
      expect_truthy(mm.contains('aaa', 'aaa'));
      expect_truthy(mm.contains('aaa', 'aa'));
      expect_truthy(mm.contains('aaa/bbb', 'aaa/bbb'));
      expect_truthy(mm.contains('aaa/bbb', 'aaa/*'));
      expect_truthy(mm.contains('aaa/bba/ccc', '**/*/ccc'));
      expect_truthy(mm.contains('aaa/bba/ccc', '*/*a'));
      expect_truthy(mm.contains('aaa/bba/ccc', 'aaa*'));
      expect_truthy(mm.contains('aaa/bba/ccc', 'aaa**'));
      expect_truthy(mm.contains('aaa/bba/ccc', 'aaa/*'));
      expect_truthy(mm.contains('aaa/bba/ccc', 'aaa/**'));
      expect_truthy(mm.contains('aaa/bba/ccc', 'aaa/*/ccc'));
      expect_truthy(mm.contains('aaa/bba/ccc', 'bb'));
      expect_truthy(mm.contains('aaa/bba/ccc', 'bb*'));
      expect_truthy(!mm.contains('aaa/bba/ccc', 'aaa/*ccc'));
      expect_truthy(!mm.contains('aaa/bba/ccc', 'aaa/**ccc'));
      expect_truthy(!mm.contains('aaa/bba/ccc', 'aaa/*z'));
      expect_truthy(!mm.contains('aaa/bba/ccc', 'aaa/**z'));
      expect_truthy(mm.contains('aaa/bbb', 'aaa[/]bbb'));
      expect_truthy(!mm.contains('aaa', '*/*/*'));
      expect_truthy(!mm.contains('aaa/bbb', '*/*/*'));
      expect_truthy(mm.contains('aaa/bba/ccc', '*/*/*'));
      expect_truthy(mm.contains('aaa/bb/aa/rr', '*/*/*'));
      expect_truthy(mm.contains('abzzzejklhi', '*j*i'));
      expect_truthy(mm.contains('ab/zzz/ejkl/hi', '*/*z*/*/*i'));
      expect_truthy(mm.contains('ab/zzz/ejkl/hi', '*/*jk*/*i'));
    });

    test('should return false when full file paths are not matched', () => {
      expect_truthy(!mm.contains('a/b/z/.a', 'b/a'));
      expect_truthy(!mm.contains('a/.b', 'a/**/z/*.md'));
      expect_truthy(!mm.contains('a/b/z/.a', 'a/**/z/*.a'));
      expect_truthy(!mm.contains('a/b/z/.a', 'a/*/z/*.a'));
      expect_truthy(!mm.contains('a/b/c/j/e/z/c.txt', 'a/**/j/**/z/*.md'));
    });

    test('should match paths with leading `./`', () => {
      expect_truthy(!mm.contains('./.a', 'a/**/z/*.md'));
      expect_truthy(mm.contains('./a/b/z/.a', 'a/**/z/.a'));
      expect_truthy(mm.contains('./a/b/z/.a', './a/**/z/.a'));
      expect_truthy(mm.contains('./a/b/c/d/e/z/c.md', 'a/**/z/*.md'));
      expect_truthy(mm.contains('./a/b/c/d/e/z/c.md', './a/**/z/*.md'));
      expect_truthy(!mm.contains('./a/b/c/d/e/z/c.md', './a/**/j/**/z/*.md'));
      expect_truthy(mm.contains('./a/b/c/j/e/z/c.md', './a/**/j/**/z/*.md'));
      expect_truthy(mm.contains('./a/b/c/j/e/z/c.md', 'a/**/j/**/z/*.md'));
      expect_truthy(mm.contains('./a/b/c/d/e/j/n/p/o/z/c.md', './a/**/j/**/z/*.md'));
      expect_truthy(!mm.contains('./a/b/c/j/e/z/c.txt', './a/**/j/**/z/*.md'));
    });
  });

  describe('windows paths', () => {
    beforeEach(() => {
      (path as any).sep = '\\';
    });
    afterEach(() => {
      (path as any).sep = sep;
    });

    test('should match with common glob patterns', () => {
      expect_truthy(mm.contains('\\ab', '*/'));
      expect_truthy(mm.contains('ab\\', '*/'));
      expect_truthy(mm.contains('\\ab', '*/*'));
      expect_truthy(mm.contains('\\ab', '*/[a-z]*'));
      expect_truthy(mm.contains('\\ab', '*/*[a-z]'));
      expect_truthy(mm.contains('\\ab', '*/a'));
      expect_truthy(mm.contains('\\ab', '/'));
      expect_truthy(mm.contains('\\ab', '/*'));
      expect_truthy(mm.contains('\\ab', '/?'));
      expect_truthy(mm.contains('\\ab', '/??'));
      expect_truthy(mm.contains('\\ab', '/?b'));
      expect_truthy(mm.contains('\\ab', '/a'));
      expect_truthy(mm.contains('\\cd', '/*'));
      expect_truthy(mm.contains('a\\b', '?/?'));
      expect_truthy(mm.contains('a\\b\\c', 'a/*'));

      expect_truthy(!mm.contains('\\ab', '*/', { windows: false }));
      expect_truthy(!mm.contains('\\ab', '*/*', { windows: false }));
      expect_truthy(!mm.contains('\\ab', '*/[a-z]*', { windows: false }));
      expect_truthy(!mm.contains('\\ab', '*/a', { windows: false }));
      expect_truthy(!mm.contains('\\ab', '/', { windows: false }));
      expect_truthy(!mm.contains('\\ab', '/*', { windows: false }));
      expect_truthy(!mm.contains('\\ab', '/?', { windows: false }));
      expect_truthy(!mm.contains('\\ab', '/??', { windows: false }));
      expect_truthy(!mm.contains('\\ab', '/?b', { windows: false }));
      expect_truthy(!mm.contains('\\ab', '/a', { windows: false }));
      expect_truthy(!mm.contains('\\cd', '/*', { windows: false }));
      expect_truthy(!mm.contains('a\\b', '?/?', { windows: false }));
      expect_truthy(!mm.contains('a\\b\\c', 'a/*', { windows: false }));
    });

    test('should match files that contain the given extension', () => {
      expect_truthy(mm.contains('a\\b\\c.md', '**/*.md'));
      expect_truthy(mm.contains('a\\b\\c.md', '*.md'));
      expect_truthy(mm.contains('a\\b\\c.md', '.md'));
      expect_truthy(mm.contains('a\\b\\c.md', 'a/*/*.md'));
      expect_truthy(mm.contains('a\\b\\c\\c.md', '*.md'));
    });

    test('should match dotfiles when `dot` is true', () => {
      expect_truthy(mm.contains('a\\b\\c\\.xyz.md', '.*.md', { windows: true, dot: true }));
      expect_truthy(mm.contains('a\\b\\c\\.xyz.md', '**/*.md', { windows: true, dot: true }));
      expect_truthy(mm.contains('a\\b\\c\\.xyz.md', '**/.*.md', { windows: true, dot: true }));
      expect_truthy(mm.contains('a\\b\\c\\.xyz.md', 'a/b/c/*.md', { windows: true, dot: true }));
      expect_truthy(mm.contains('a\\b\\c\\.xyz.md', 'a/b/c/.*.md', { windows: true, dot: true }));
    });

    test('should not match dotfiles when `dot` or `dotfiles` is not set', () => {
      expect_truthy(!mm.contains('a\\b\\d\\.md', 'a/b/c/*.md'));
    });

    test('should match file paths', () => {
      expect_truthy(mm.contains('a\\b\\c\\xyz.md', 'a/b/c/*.md'));
      expect_truthy(mm.contains('a\\bb\\c\\xyz.md', 'a/*/c/*.md'));
      expect_truthy(mm.contains('a\\bbbb\\c\\xyz.md', 'a/*/c/*.md'));
      expect_truthy(mm.contains('a\\bb.bb\\c\\xyz.md', 'a/*/c/*.md'));
      expect_truthy(mm.contains('a\\bb.bb\\aa\\bb\\aa\\c\\xyz.md', 'a/**/c/*.md'));
      expect_truthy(mm.contains('a\\bb.bb\\aa\\b.b\\aa\\c\\xyz.md', 'a/**/c/*.md'));
    });

    test('should return true when full file paths are matched', () => {
      expect_truthy(mm.contains('a\\.b', 'a/.*'));
      expect_truthy(mm.contains('a\\.b', 'a/'));
      expect_truthy(mm.contains('a\\b\\z\\.a', 'b/z'));
      expect_truthy(mm.contains('a\\b\\z\\.a', 'a/*/z/.a'));
      expect_truthy(mm.contains('a\\b\\c\\d\\e\\z\\c.md', 'a/**/z/*.md'));
      expect_truthy(mm.contains('a\\b\\c\\d\\e\\z\\c.md', 'b/c/d/e'));
      expect_truthy(mm.contains('a\\b\\c\\d\\e\\j\\n\\p\\o\\z\\c.md', 'a/**/j/**/z/*.md'));
    });

    test('should match path segments', () => {
      expect_truthy(mm.contains('aaa\\bbb', 'aaa/bbb'));
      expect_truthy(mm.contains('aaa\\bbb', 'aaa/*'));
      expect_truthy(mm.contains('aaa\\bba\\ccc', '**/*/ccc'));
      expect_truthy(mm.contains('aaa\\bba\\ccc', '*/*a'));
      expect_truthy(mm.contains('aaa\\bba\\ccc', 'aaa*'));
      expect_truthy(mm.contains('aaa\\bba\\ccc', 'aaa**'));
      expect_truthy(mm.contains('aaa\\bba\\ccc', 'aaa/*'));
      expect_truthy(mm.contains('aaa\\bba\\ccc', 'aaa/**'));
      expect_truthy(mm.contains('aaa\\bba\\ccc', 'aaa/*/ccc'));
      expect_truthy(mm.contains('aaa\\bba\\ccc', 'bb'));
      expect_truthy(mm.contains('aaa\\bba\\ccc', 'bb*'));
      expect_truthy(mm.contains('aaa\\bbb', 'aaa[/]bbb'));
      expect_truthy(mm.contains('aaa\\bbb', 'aaa[\\\\/]bbb'));
      expect_truthy(!mm.contains('aaa\\bba\\ccc', 'aaa/*ccc'));
      expect_truthy(!mm.contains('aaa\\bba\\ccc', 'aaa/**ccc'));
      expect_truthy(!mm.contains('aaa\\bba\\ccc', 'aaa/*z'));
      expect_truthy(!mm.contains('aaa\\bba\\ccc', 'aaa/**z'));
      expect_truthy(!mm.contains('\\aaa', '*/*/*'));
      expect_truthy(!mm.contains('aaa\\bbb', '*/*/*'));
      expect_truthy(mm.contains('aaa\\bba\\ccc', '*/*/*'));
      expect_truthy(mm.contains('aaa\\bb\\aa\\rr', '*/*/*'));
      expect_truthy(mm.contains('ab\\zzz\\ejkl\\hi', '*/*z*/*/*i'));
      expect_truthy(mm.contains('ab\\zzz\\ejkl\\hi', '*/*jk*/*i'));
    });

    test('should return false when full file paths are not matched', () => {
      expect_truthy(!mm.contains('a\\b\\z\\.a', 'b/a'));
      expect_truthy(!mm.contains('a\\.b', 'a/**/z/*.md'));
      expect_truthy(!mm.contains('a\\b\\z\\.a', 'a/**/z/*.a'));
      expect_truthy(!mm.contains('a\\b\\z\\.a', 'a/*/z/*.a'));
      expect_truthy(!mm.contains('a\\b\\c\\j\\e\\z\\c.txt', 'a/**/j/**/z/*.md'));
    });

    test('should match dotfiles when a dot is explicitly defined in the pattern', () => {
      expect_truthy(mm.contains('a\\.c.md', 'a/.c.md'));
      expect_truthy(mm.contains('a\\b\\c\\.xyz.md', 'a/b/c/.*.md'));
      expect_truthy(mm.contains('a\\.c.md', '*.md'));
      expect_truthy(mm.contains('a\\b\\c\\d.a.md', 'a/b/c/*.md'));
    });

    test('should match paths with leading `./`', () => {
      expect_truthy(!mm.contains('.\\.a', 'a/**/z/*.md'));
      expect_truthy(!mm.contains('.\\a\\b\\c\\d\\e\\z\\c.md', './a/**/j/**/z/*.md'));
      expect_truthy(mm.contains('.\\a\\b\\c\\d\\e\\j\\n\\p\\o\\z\\c.md', './a/**/j/**/z/*.md'));
      expect_truthy(mm.contains('.\\a\\b\\c\\d\\e\\z\\c.md', './a/**/z/*.md'));
      expect_truthy(mm.contains('.\\a\\b\\c\\d\\e\\z\\c.md', 'a/**/z/*.md'));
      expect_truthy(mm.contains('.\\a\\b\\c\\j\\e\\z\\c.md', './a/**/j/**/z/*.md'));
      expect_truthy(mm.contains('.\\a\\b\\c\\j\\e\\z\\c.md', 'a/**/j/**/z/*.md'));
      expect_truthy(mm.contains('.\\a\\b\\z\\.a', './a/**/z/.a'));
      expect_truthy(mm.contains('.\\a\\b\\z\\.a', 'a/**/z/.a'));
    });
  });
});
