import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import path from "node:path";
import micromatch from "../../src/micromatch/index.ts";

const before = beforeAll;
const after = afterAll;

const expect_truthy = (v: unknown) => { expect(Boolean(v)).toBe(true); };
const expect_equal = (actual: unknown, expected: unknown) => {
  expect(actual).toBe(expected as any);
};
const expect_loose_equal = (actual: unknown, expected: unknown) => {
  // Mirrors assert.equal (== loose equality)
  expect(actual == expected).toBe(true);
};
const expect_deepEqual = (actual: unknown, expected: unknown) => {
  expect(actual).toEqual(expected as any);
};
const expect_notDeepEqual = (actual: unknown, expected: unknown) => {
  expect(actual).not.toEqual(expected as any);
};
const expect_notEqual = (actual: unknown, expected: unknown) => {
  expect(actual == expected).toBe(false);
};
const expect_throws = (fn: () => unknown, matcher?: any) => {
  if (matcher) expect(fn).toThrow(matcher);
  else expect(fn).toThrow();
};
const expect_doesNotThrow = (fn: () => unknown) => {
  expect(fn).not.toThrow();
};


import path from "node:path";
const sep = path.sep;
const isWindows = () => process.platform === 'win32' || path.sep === '\\';
const mm = micromatch;

describe('negation', () => {
  describe('posix paths', () => {
    test('should support negating with single *', () => {
      expect_deepEqual(mm(['a', 'b', 'c.md'], '!*.md'), ['a', 'b']);
      expect_deepEqual(mm(['a/a/a', 'a/b/a', 'a/c/a'], '!a/*/a'), []);
      expect_deepEqual(mm(['a/a/a/a', 'b/a/b/a', 'c/a/c/a'], '!a/*/*/a'), ['b/a/b/a', 'c/a/c/a']);
      expect_deepEqual(mm(['a/a', 'a/b', 'a/c'], '!a/a*'), ['a/b', 'a/c']);
      expect_deepEqual(mm(['a.a', 'a.b', 'a.c'], '!a.a*'), ['a.b', 'a.c']);
      expect_deepEqual(mm(['a/a', 'a/b', 'a/c'], '!a/*'), []);
    });

    test('should support negation patterns', () => {
      let fixtures1 = ['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'];

      expect_deepEqual(mm(fixtures1, ['!a/b']), ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures1, ['*/*', '!a/b', '!*/c']), ['a/a', 'b/a', 'b/b']);
      expect_deepEqual(mm(fixtures1, ['*/*', '!a/b', '!*/c']), ['a/a', 'b/a', 'b/b']);
      expect_deepEqual(mm(fixtures1, ['*/*', '!a/b', '!a/c']), ['a/a', 'b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures1, ['!a/(b)']), ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(['bar', 'baz', 'foo'], ['!bar', '*']), ['bar', 'baz', 'foo']);
      expect_deepEqual(mm(['bar', 'baz', 'foo'], ['*', '!bar']), ['baz', 'foo']);

      let fixtures2 = ['foo', 'bar', 'baz', 'main', 'other', 'foo/a/b/c', 'bar/a/b/d', 'baz/a/b/e', 'a/a/a', 'a/a/b', 'a/a/c', 'a/a/file'];

      expect_deepEqual(mm(fixtures2, ['a/**', '!a/a/file', 'main']), ['a/a/a', 'a/a/b', 'a/a/c', 'main']);
      expect_deepEqual(mm('foo', ['a/**', '!a/a/file', 'main']), []);
      expect_deepEqual(mm(['foo'], ['a/**', '!a/a/file', 'main']), []);
    });

    test('should support negating with literal non-globs', () => {
      let fixtures = ['a', 'b', 'a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'];

      // expect_deepEqual(mm(fixtures, ['!a/a', '!a']), []);
      expect_deepEqual(mm(['bar', 'baz', 'foo'], '!foo'), ['bar', 'baz']);
      expect_deepEqual(mm(['bar', 'baz', 'foo'], ['!bar', 'bar']), ['bar']);
      expect_deepEqual(mm(['bar', 'baz', 'foo'], ['!foo', 'bar']), ['bar']);
      expect_deepEqual(mm(['bar', 'baz', 'foo'], ['!foo']), ['bar', 'baz']);
      expect_deepEqual(mm(['bar', 'baz', 'foo'], ['bar', '!foo', '!bar']), []);
      expect_deepEqual(mm(['foo!.md', 'bar.md'], 'foo!.md'), ['foo!.md']);
      expect_deepEqual(mm(['foo.md'], '!.md'), ['foo.md']);
    });

    test('should negate files with extensions:', () => {
      expect_deepEqual(mm(['a.js', 'b.md', 'c.txt'], '!**/*.md'), ['a.js', 'c.txt']);
      expect_deepEqual(mm(['a.js', 'b.md', 'c.txt'], '!*.md'), ['a.js', 'c.txt']);
      expect_deepEqual(mm(['abc.md', 'abc.txt'], '!*.md'), ['abc.txt']);
      expect_deepEqual(mm(['foo.md'], '!*.md'), []);
    });

    test('should only treat leading exclamation as special', () => {
      expect_deepEqual(mm(['foo!.md', 'bar.md'], '*.md'), ['foo!.md', 'bar.md']);
      expect_deepEqual(mm(['foo!.md', 'bar.md'], '*!.md'), ['foo!.md']);
      expect_deepEqual(mm(['foobar.md'], '*b*.md'), ['foobar.md']);
      expect_deepEqual(mm(['foo!bar.md', 'foo!.md', '!foo!.md'], '*!*.md'), ['foo!bar.md', 'foo!.md', '!foo!.md']);
      expect_deepEqual(mm(['foo!bar.md', 'foo!.md', '!foo!.md'], '\\!*!*.md'), ['!foo!.md']);
      expect_deepEqual(mm(['foo!.md', 'ba!r.js'], '**/*!*.*'), ['foo!.md', 'ba!r.js']);
    });

    test('should support negated globstars ("**")', () => {
      expect_deepEqual(mm(['a.js', 'b.txt', 'c.md'], '!*.md'), ['a.js', 'b.txt']);
      expect_deepEqual(mm(['a/a/a.js', 'a/b/a.js', 'a/c/a.js', 'a/a/b.js'], '!**/a.js'), ['a/a/b.js']);
      expect_deepEqual(mm(['a/a/a/a.js', 'b/a/b/a.js', 'c/a/c/a.js'], '!a/**/a.js'), ['b/a/b/a.js', 'c/a/c/a.js']);
      expect_deepEqual(mm(['a/a.txt', 'a/b.txt', 'a/c.txt'], '!a/b.txt'), ['a/a.txt', 'a/c.txt']);
      expect_deepEqual(mm(['a/b.js', 'a.js', 'a/b.md', 'a.md'], '!**/*.md'), ['a/b.js', 'a.js']);
      expect_deepEqual(mm(['a/b.js', 'a.js', 'a/b.md', 'a.md'], '**/*.md'), ['a/b.md', 'a.md']);

      expect_deepEqual(mm(['a/b.js'], '!**/*.md'), ['a/b.js']);
      expect_deepEqual(mm(['a.js'], '!**/*.md'), ['a.js']);
      expect_deepEqual(mm(['a/b.md'], '!**/*.md'), []);
      expect_deepEqual(mm(['a.md'], '!**/*.md'), []);

      expect_deepEqual(mm(['a/b.js'], '!*.md'), ['a/b.js']);
      expect_deepEqual(mm(['a.js'], '!*.md'), ['a.js']);
      expect_deepEqual(mm(['a/b.md'], '!*.md'), ['a/b.md']);
      expect_deepEqual(mm(['a.md'], '!*.md'), []);

      expect_deepEqual(mm(['a.js'], '!**/*.md'), ['a.js']);
      expect_deepEqual(mm(['b.md'], '!**/*.md'), []);
      expect_deepEqual(mm(['c.txt'], '!**/*.md'), ['c.txt']);
    });

    test('should negate dotfiles:', () => {
      expect_deepEqual(mm(['.dotfile.md'], '!*.md', { dot: true }), []);
      expect_deepEqual(mm(['.dotfile'], '!*.md'), ['.dotfile']);
      expect_deepEqual(mm(['.dotfile.txt'], '!*.md'), ['.dotfile.txt']);
      expect_deepEqual(mm(['.dotfile.txt', 'a/b/.dotfile'], '!*.md'), ['.dotfile.txt', 'a/b/.dotfile']);
      expect_deepEqual(mm(['.gitignore', 'a', 'b'], '!.gitignore'), ['a', 'b']);
    });

    test('should negate files in the immediate directory:', () => {
      expect_deepEqual(mm(['a/b.js', 'a.js', 'a/b.md', 'a.md'], '!*.md'), ['a/b.js', 'a.js', 'a/b.md']);
    });

    test('should not give special meaning to non-leading exclamations', () => {
      expect_deepEqual(mm(['a', 'aa', 'a/b', 'a!b', 'a!!b', 'a/!!/b'], 'a!!b'), ['a!!b']);
    });

    test('should negate files in any directory:', () => {
      expect_deepEqual(mm(['a/a.txt', 'a/b.txt', 'a/c.txt'], '!a/b.txt'), ['a/a.txt', 'a/c.txt']);
    });
  });

  describe('windows paths', () => {
    beforeEach(() => {
      path.sep = '\\';
    });
    afterEach(() => {
      path.sep = sep;
    });

    test('should support negation patterns', () => {
      let fixtures = ['a', 'a\\a', 'a\\b', 'a\\c', 'b\\a', 'b\\b', 'b\\c'];
      expect_deepEqual(mm(fixtures, ['!a/b']), ['a', 'a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, ['*/*', '!a/b', '!*/c']), ['a/a', 'b/a', 'b/b']);
      expect_deepEqual(mm(fixtures, ['!*/c']), ['a', 'a/a', 'a/b', 'b/a', 'b/b']);
      expect_deepEqual(mm(fixtures, ['**', '!a/b', '!*/c']), ['a', 'a/a', 'b/a', 'b/b']);
      expect_deepEqual(mm(fixtures, ['**', '!a/b', '!a/c']), ['a', 'a/a', 'b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, ['!a/(b)']), ['a', 'a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, ['!(a/b)']), ['a', 'a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, ['!(a)**']), ['b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, ['**', '!(a)**']), ['b/a', 'b/b', 'b/c']);

      expect_deepEqual(mm(fixtures, ['!a/b'], { windows: false }), ['a', 'a\\a', 'a\\b', 'a\\c', 'b\\a', 'b\\b', 'b\\c']);
      expect_deepEqual(mm(fixtures, ['!a\\\\b'], { windows: false }), ['a', 'a\\a', 'a\\c', 'b\\a', 'b\\b', 'b\\c']);
      expect_deepEqual(mm(fixtures, ['*/*', '!a/b', '!*/c'], { windows: false }), []);
      expect_deepEqual(mm(fixtures, ['!*\\\\c'], { windows: false }), ['a', 'a\\a', 'a\\b', 'b\\a', 'b\\b']);
      expect_deepEqual(mm(fixtures, ['**', '!a\\\\b', '!*\\\\c'], { windows: false }), ['a', 'a\\a', 'b\\a', 'b\\b']);
      expect_deepEqual(mm(fixtures, ['**', '!a\\\\b', '!a\\\\c'], { windows: false }), ['a', 'a\\a', 'b\\a', 'b\\b', 'b\\c']);
      expect_deepEqual(mm(fixtures, ['**', '!a\\\\b'], { windows: false }), ['a', 'a\\a', 'a\\c', 'b\\a', 'b\\b', 'b\\c']);
      expect_deepEqual(mm(fixtures, ['**', '!a\\\\(b)'], { windows: false }), ['a', 'a\\a', 'a\\c', 'b\\a', 'b\\b', 'b\\c']);

      expect_deepEqual(mm(fixtures, ['**', '!(a\\\\b)'], { windows: false }), ['a', 'a\\a', 'a\\c', 'b\\a', 'b\\b', 'b\\c']);
    });
  });
});
