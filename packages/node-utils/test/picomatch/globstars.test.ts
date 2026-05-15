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

describe('stars', () => {
  describe('issue related', () => {
    test('should match paths with no slashes (micromatch/#15)', () => {
      expect_truthy(isMatch('a.js', '**/*.js'));
      expect_truthy(isMatch('a.js', '**/a*'));
      expect_truthy(isMatch('a.js', '**/a*.js'));
      expect_truthy(isMatch('abc', '**/abc'));
    });

    test('should regard non-exclusive double-stars as single stars', () => {
      const fixtures = ['a', 'a/', 'a/a', 'a/a/', 'a/a/a', 'a/a/a/', 'a/a/a/a', 'a/a/a/a/', 'a/a/a/a/a', 'a/a/a/a/a/', 'a/a/b', 'a/a/b/', 'a/b', 'a/b/', 'a/b/c/.d/e/', 'a/c', 'a/c/', 'a/b', 'a/x/', 'b', 'b/', 'x/y', 'x/y/', 'z/z', 'z/z/'];

      expect_deepEqual(match(fixtures, '**a/a/*/'), ['a/a/a/', 'a/a/b/']);
      expect_truthy(!isMatch('aaa/bba/ccc', 'aaa/**ccc'));
      expect_truthy(!isMatch('aaa/bba/ccc', 'aaa/**z'));
      expect_truthy(isMatch('aaa/bba/ccc', 'aaa/**b**/ccc'));
      expect_truthy(!isMatch('a/b/c', '**c'));
      expect_truthy(!isMatch('a/b/c', 'a/**c'));
      expect_truthy(!isMatch('a/b/c', 'a/**z'));
      expect_truthy(!isMatch('a/b/c/b/c', 'a/**b**/c'));
      expect_truthy(!isMatch('a/b/c/d/e.js', 'a/b/c**/*.js'));
      expect_truthy(isMatch('a/b/c/b/c', 'a/**/b/**/c'));
      expect_truthy(isMatch('a/aba/c', 'a/**b**/c'));
      expect_truthy(isMatch('a/b/c', 'a/**b**/c'));
      expect_truthy(isMatch('a/b/c/d.js', 'a/b/c**/*.js'));
    });

    test('should support globstars followed by braces', () => {
      expect_truthy(isMatch('a/b/c/d/e/z/foo.md', 'a/**/c/**{,(/z|/x)}/*.md'));
      expect_truthy(isMatch('a/b/c/d/e/z/foo.md', 'a/**{,(/x|/z)}/*.md'));
    });

    test('should support globstars followed by braces with nested extglobs', () => {
      expect_truthy(isMatch('/x/foo.md', '@(/x|/z)/*.md'));
      expect_truthy(isMatch('/z/foo.md', '@(/x|/z)/*.md'));
      expect_truthy(isMatch('a/b/c/d/e/z/foo.md', 'a/**/c/**@(/z|/x)/*.md'));
      expect_truthy(isMatch('a/b/c/d/e/z/foo.md', 'a/**@(/x|/z)/*.md'));
    });

    test('should support multiple globstars in one pattern', () => {
      expect_truthy(!isMatch('a/b/c/d/e/z/foo.md', 'a/**/j/**/z/*.md'));
      expect_truthy(!isMatch('a/b/c/j/e/z/foo.txt', 'a/**/j/**/z/*.md'));
      expect_truthy(isMatch('a/b/c/d/e/j/n/p/o/z/foo.md', 'a/**/j/**/z/*.md'));
      expect_truthy(isMatch('a/b/c/d/e/z/foo.md', 'a/**/z/*.md'));
      expect_truthy(isMatch('a/b/c/j/e/z/foo.md', 'a/**/j/**/z/*.md'));
    });

    test('should match file extensions:', () => {
      expect_deepEqual(match(['.md', 'a.md', 'a/b/c.md', '.txt'], '**/*.md'), ['a.md', 'a/b/c.md']);
      expect_deepEqual(match(['.md/.md', '.md', 'a/.md', 'a/b/.md'], '**/.md'), ['.md', 'a/.md', 'a/b/.md']);
      expect_deepEqual(match(['.md/.md', '.md/foo/.md', '.md', 'a/.md', 'a/b/.md'], '.md/**/.md'), ['.md/.md', '.md/foo/.md']);
    });

    test('should respect trailing slashes on patterns', () => {
      const fixtures = ['a', 'a/', 'a/a', 'a/a/', 'a/a/a', 'a/a/a/', 'a/a/a/a', 'a/a/a/a/', 'a/a/a/a/a', 'a/a/a/a/a/', 'a/a/b', 'a/a/b/', 'a/b', 'a/b/', 'a/b/c/.d/e/', 'a/c', 'a/c/', 'a/b', 'a/x/', 'b', 'b/', 'x/y', 'x/y/', 'z/z', 'z/z/'];

      expect_deepEqual(match(fixtures, '**/*/a/'), ['a/a/', 'a/a/a/', 'a/a/a/a/', 'a/a/a/a/a/']);
      expect_deepEqual(match(fixtures, '**/*/a/*/'), ['a/a/a/', 'a/a/a/a/', 'a/a/a/a/a/', 'a/a/b/']);
      expect_deepEqual(match(fixtures, '**/*/x/'), ['a/x/']);
      expect_deepEqual(match(fixtures, '**/*/*/*/*/'), ['a/a/a/a/', 'a/a/a/a/a/']);
      expect_deepEqual(match(fixtures, '**/*/*/*/*/*/'), ['a/a/a/a/a/']);
      expect_deepEqual(match(fixtures, '*a/a/*/'), ['a/a/a/', 'a/a/b/']);
      expect_deepEqual(match(fixtures, '**a/a/*/'), ['a/a/a/', 'a/a/b/']);
      expect_deepEqual(match(fixtures, '**/a/*/*/'), ['a/a/a/', 'a/a/a/a/', 'a/a/a/a/a/', 'a/a/b/']);
      expect_deepEqual(match(fixtures, '**/a/*/*/*/'), ['a/a/a/a/', 'a/a/a/a/a/']);
      expect_deepEqual(match(fixtures, '**/a/*/*/*/*/'), ['a/a/a/a/a/']);
      expect_deepEqual(match(fixtures, '**/a/*/a/'), ['a/a/a/', 'a/a/a/a/', 'a/a/a/a/a/']);
      expect_deepEqual(match(fixtures, '**/a/*/b/'), ['a/a/b/']);
    });

    test('should match literal globstars when stars are escaped', () => {
      const fixtures = ['.md', '**a.md', '**.md', '.md', '**'];
      expect_deepEqual(match(fixtures, '\\*\\**.md'), ['**a.md', '**.md']);
      expect_deepEqual(match(fixtures, '\\*\\*.md'), ['**.md']);
    });

    test('single dots', () => {
      expect_truthy(!isMatch('.a/a', '**'));
      expect_truthy(!isMatch('a/.a', '**'));
      expect_truthy(!isMatch('.a/a', '**/'));
      expect_truthy(!isMatch('a/.a', '**/'));
      expect_truthy(!isMatch('.a/a', '**/**'));
      expect_truthy(!isMatch('a/.a', '**/**'));
      expect_truthy(!isMatch('.a/a', '**/**/*'));
      expect_truthy(!isMatch('a/.a', '**/**/*'));
      expect_truthy(!isMatch('.a/a', '**/**/x'));
      expect_truthy(!isMatch('a/.a', '**/**/x'));
      expect_truthy(!isMatch('.a/a', '**/x'));
      expect_truthy(!isMatch('a/.a', '**/x'));
      expect_truthy(!isMatch('.a/a', '**/x/*'));
      expect_truthy(!isMatch('a/.a', '**/x/*'));
      expect_truthy(!isMatch('.a/a', '**/x/**'));
      expect_truthy(!isMatch('a/.a', '**/x/**'));
      expect_truthy(!isMatch('.a/a', '**/x/*/*'));
      expect_truthy(!isMatch('a/.a', '**/x/*/*'));
      expect_truthy(!isMatch('.a/a', '*/x/**'));
      expect_truthy(!isMatch('a/.a', '*/x/**'));
      expect_truthy(!isMatch('.a/a', 'a/**'));
      expect_truthy(!isMatch('a/.a', 'a/**'));
      expect_truthy(!isMatch('.a/a', 'a/**/*'));
      expect_truthy(!isMatch('a/.a', 'a/**/*'));
      expect_truthy(!isMatch('.a/a', 'a/**/**/*'));
      expect_truthy(!isMatch('a/.a', 'a/**/**/*'));
      expect_truthy(!isMatch('.a/a', 'b/**'));
      expect_truthy(!isMatch('a/.a', 'b/**'));
    });

    test('double dots', () => {
      expect_truthy(!isMatch('a/../a', '**'));
      expect_truthy(!isMatch('ab/../ac', '**'));
      expect_truthy(!isMatch('../a', '**'));
      expect_truthy(!isMatch('../../b', '**'));
      expect_truthy(!isMatch('../c', '**'));
      expect_truthy(!isMatch('../c/d', '**'));
      expect_truthy(!isMatch('a/../a', '**/'));
      expect_truthy(!isMatch('ab/../ac', '**/'));
      expect_truthy(!isMatch('../a', '**/'));
      expect_truthy(!isMatch('../../b', '**/'));
      expect_truthy(!isMatch('../c', '**/'));
      expect_truthy(!isMatch('../c/d', '**/'));
      expect_truthy(!isMatch('a/../a', '**/**'));
      expect_truthy(!isMatch('ab/../ac', '**/**'));
      expect_truthy(!isMatch('../a', '**/**'));
      expect_truthy(!isMatch('../../b', '**/**'));
      expect_truthy(!isMatch('../c', '**/**'));
      expect_truthy(!isMatch('../c/d', '**/**'));
      expect_truthy(!isMatch('a/../a', '**/**/*'));
      expect_truthy(!isMatch('ab/../ac', '**/**/*'));
      expect_truthy(!isMatch('../a', '**/**/*'));
      expect_truthy(!isMatch('../../b', '**/**/*'));
      expect_truthy(!isMatch('../c', '**/**/*'));
      expect_truthy(!isMatch('../c/d', '**/**/*'));
      expect_truthy(!isMatch('a/../a', '**/**/x'));
      expect_truthy(!isMatch('ab/../ac', '**/**/x'));
      expect_truthy(!isMatch('../a', '**/**/x'));
      expect_truthy(!isMatch('../../b', '**/**/x'));
      expect_truthy(!isMatch('../c', '**/**/x'));
      expect_truthy(!isMatch('../c/d', '**/**/x'));
      expect_truthy(!isMatch('a/../a', '**/x'));
      expect_truthy(!isMatch('ab/../ac', '**/x'));
      expect_truthy(!isMatch('../a', '**/x'));
      expect_truthy(!isMatch('../../b', '**/x'));
      expect_truthy(!isMatch('../c', '**/x'));
      expect_truthy(!isMatch('../c/d', '**/x'));
      expect_truthy(!isMatch('a/../a', '**/x/*'));
      expect_truthy(!isMatch('ab/../ac', '**/x/*'));
      expect_truthy(!isMatch('../a', '**/x/*'));
      expect_truthy(!isMatch('../../b', '**/x/*'));
      expect_truthy(!isMatch('../c', '**/x/*'));
      expect_truthy(!isMatch('../c/d', '**/x/*'));
      expect_truthy(!isMatch('a/../a', '**/x/**'));
      expect_truthy(!isMatch('ab/../ac', '**/x/**'));
      expect_truthy(!isMatch('../a', '**/x/**'));
      expect_truthy(!isMatch('../../b', '**/x/**'));
      expect_truthy(!isMatch('../c', '**/x/**'));
      expect_truthy(!isMatch('../c/d', '**/x/**'));
      expect_truthy(!isMatch('a/../a', '**/x/*/*'));
      expect_truthy(!isMatch('ab/../ac', '**/x/*/*'));
      expect_truthy(!isMatch('../a', '**/x/*/*'));
      expect_truthy(!isMatch('../../b', '**/x/*/*'));
      expect_truthy(!isMatch('../c', '**/x/*/*'));
      expect_truthy(!isMatch('../c/d', '**/x/*/*'));
      expect_truthy(!isMatch('a/../a', '*/x/**'));
      expect_truthy(!isMatch('ab/../ac', '*/x/**'));
      expect_truthy(!isMatch('../a', '*/x/**'));
      expect_truthy(!isMatch('../../b', '*/x/**'));
      expect_truthy(!isMatch('../c', '*/x/**'));
      expect_truthy(!isMatch('../c/d', '*/x/**'));
      expect_truthy(!isMatch('a/../a', 'a/**'));
      expect_truthy(!isMatch('ab/../ac', 'a/**'));
      expect_truthy(!isMatch('../a', 'a/**'));
      expect_truthy(!isMatch('../../b', 'a/**'));
      expect_truthy(!isMatch('../c', 'a/**'));
      expect_truthy(!isMatch('../c/d', 'a/**'));
      expect_truthy(!isMatch('a/../a', 'a/**/*'));
      expect_truthy(!isMatch('ab/../ac', 'a/**/*'));
      expect_truthy(!isMatch('../a', 'a/**/*'));
      expect_truthy(!isMatch('../../b', 'a/**/*'));
      expect_truthy(!isMatch('../c', 'a/**/*'));
      expect_truthy(!isMatch('../c/d', 'a/**/*'));
      expect_truthy(!isMatch('a/../a', 'a/**/**/*'));
      expect_truthy(!isMatch('ab/../ac', 'a/**/**/*'));
      expect_truthy(!isMatch('../a', 'a/**/**/*'));
      expect_truthy(!isMatch('../../b', 'a/**/**/*'));
      expect_truthy(!isMatch('../c', 'a/**/**/*'));
      expect_truthy(!isMatch('../c/d', 'a/**/**/*'));
      expect_truthy(!isMatch('a/../a', 'b/**'));
      expect_truthy(!isMatch('ab/../ac', 'b/**'));
      expect_truthy(!isMatch('../a', 'b/**'));
      expect_truthy(!isMatch('../../b', 'b/**'));
      expect_truthy(!isMatch('../c', 'b/**'));
      expect_truthy(!isMatch('../c/d', 'b/**'));
    });

    test('should match', () => {
      expect_truthy(!isMatch('a', '**/'));
      expect_truthy(!isMatch('a', '**/a/*'));
      expect_truthy(!isMatch('a', '**/a/*/*'));
      expect_truthy(!isMatch('a', '*/a/**'));
      expect_truthy(!isMatch('a', 'a/**/*'));
      expect_truthy(!isMatch('a', 'a/**/**/*'));
      expect_truthy(!isMatch('a/b', '**/'));
      expect_truthy(!isMatch('a/b', '**/b/*'));
      expect_truthy(!isMatch('a/b', '**/b/*/*'));
      expect_truthy(!isMatch('a/b', 'b/**'));
      expect_truthy(!isMatch('a/b/c', '**/'));
      expect_truthy(!isMatch('a/b/c', '**/**/b'));
      expect_truthy(!isMatch('a/b/c', '**/b'));
      expect_truthy(!isMatch('a/b/c', '**/b/*/*'));
      expect_truthy(!isMatch('a/b/c', 'b/**'));
      expect_truthy(!isMatch('a/b/c/d', '**/'));
      expect_truthy(!isMatch('a/b/c/d', '**/d/*'));
      expect_truthy(!isMatch('a/b/c/d', 'b/**'));
      expect_truthy(isMatch('a', '**'));
      expect_truthy(isMatch('a', '**/**'));
      expect_truthy(isMatch('a', '**/**/*'));
      expect_truthy(isMatch('a', '**/**/a'));
      expect_truthy(isMatch('a', '**/a'));
      expect_truthy(isMatch('a', '**/a/**'));
      expect_truthy(isMatch('a', 'a/**'));
      expect_truthy(isMatch('a/b', '**'));
      expect_truthy(isMatch('a/b', '**/**'));
      expect_truthy(isMatch('a/b', '**/**/*'));
      expect_truthy(isMatch('a/b', '**/**/b'));
      expect_truthy(isMatch('a/b', '**/b'));
      expect_truthy(isMatch('a/b', '**/b/**'));
      expect_truthy(isMatch('a/b', '*/b/**'));
      expect_truthy(isMatch('a/b', 'a/**'));
      expect_truthy(isMatch('a/b', 'a/**/*'));
      expect_truthy(isMatch('a/b', 'a/**/**/*'));
      expect_truthy(isMatch('a/b/c', '**'));
      expect_truthy(isMatch('a/b/c', '**/**'));
      expect_truthy(isMatch('a/b/c', '**/**/*'));
      expect_truthy(isMatch('a/b/c', '**/b/*'));
      expect_truthy(isMatch('a/b/c', '**/b/**'));
      expect_truthy(isMatch('a/b/c', '*/b/**'));
      expect_truthy(isMatch('a/b/c', 'a/**'));
      expect_truthy(isMatch('a/b/c', 'a/**/*'));
      expect_truthy(isMatch('a/b/c', 'a/**/**/*'));
      expect_truthy(isMatch('a/b/c/d', '**'));
      expect_truthy(isMatch('a/b/c/d', '**/**'));
      expect_truthy(isMatch('a/b/c/d', '**/**/*'));
      expect_truthy(isMatch('a/b/c/d', '**/**/d'));
      expect_truthy(isMatch('a/b/c/d', '**/b/**'));
      expect_truthy(isMatch('a/b/c/d', '**/b/*/*'));
      expect_truthy(isMatch('a/b/c/d', '**/d'));
      expect_truthy(isMatch('a/b/c/d', '*/b/**'));
      expect_truthy(isMatch('a/b/c/d', 'a/**'));
      expect_truthy(isMatch('a/b/c/d', 'a/**/*'));
      expect_truthy(isMatch('a/b/c/d', 'a/**/**/*'));
    });

    test('should match nested directories', () => {
      expect_truthy(isMatch('a/b', '*/*'));
      expect_truthy(isMatch('a/b/c/xyz.md', 'a/b/c/*.md'));
      expect_truthy(isMatch('a/bb.bb/c/xyz.md', 'a/*/c/*.md'));
      expect_truthy(isMatch('a/bb/c/xyz.md', 'a/*/c/*.md'));
      expect_truthy(isMatch('a/bbbb/c/xyz.md', 'a/*/c/*.md'));

      expect_truthy(isMatch('a/b/c', '**/*'));
      expect_truthy(isMatch('a/b/c', '**/**'));
      expect_truthy(isMatch('a/b/c', '*/**'));
      expect_truthy(isMatch('a/b/c/d/e/j/n/p/o/z/c.md', 'a/**/j/**/z/*.md'));
      expect_truthy(isMatch('a/b/c/d/e/z/c.md', 'a/**/z/*.md'));
      expect_truthy(isMatch('a/bb.bb/aa/b.b/aa/c/xyz.md', 'a/**/c/*.md'));
      expect_truthy(isMatch('a/bb.bb/aa/bb/aa/c/xyz.md', 'a/**/c/*.md'));
      expect_truthy(!isMatch('a/b/c/j/e/z/c.txt', 'a/**/j/**/z/*.md'));
      expect_truthy(!isMatch('a/b/c/xyz.md', 'a/b/**/c{d,e}/**/xyz.md'));
      expect_truthy(!isMatch('a/b/d/xyz.md', 'a/b/**/c{d,e}/**/xyz.md'));
      expect_truthy(!isMatch('a/b', 'a/**/'));
      expect_truthy(!isMatch('a/b/.js/c.txt', '**/*'));
      expect_truthy(!isMatch('a/b/c/d', 'a/**/'));
      expect_truthy(!isMatch('a/bb', 'a/**/'));
      expect_truthy(!isMatch('a/cb', 'a/**/'));
      expect_truthy(isMatch('/a/b', '/**'));
      expect_truthy(isMatch('a.b', '**/*'));
      expect_truthy(isMatch('a.js', '**/*'));
      expect_truthy(isMatch('a.js', '**/*.js'));
      expect_truthy(isMatch('a/', 'a/**/'));
      expect_truthy(isMatch('a/a.js', '**/*.js'));
      expect_truthy(isMatch('a/a/b.js', '**/*.js'));
      expect_truthy(isMatch('a/b', 'a/**/b'));
      expect_truthy(isMatch('a/b', 'a/**b'));
      expect_truthy(isMatch('a/b.md', '**/*.md'));
      expect_truthy(isMatch('a/b/c.js', '**/*'));
      expect_truthy(isMatch('a/b/c.txt', '**/*'));
      expect_truthy(isMatch('a/b/c/d/', 'a/**/'));
      expect_truthy(isMatch('a/b/c/d/a.js', '**/*'));
      expect_truthy(isMatch('a/b/c/z.js', 'a/b/**/*.js'));
      expect_truthy(isMatch('a/b/z.js', 'a/b/**/*.js'));
      expect_truthy(isMatch('ab', '**/*'));
      expect_truthy(isMatch('ab/c', '**/*'));
      expect_truthy(isMatch('ab/c/d', '**/*'));
      expect_truthy(isMatch('abc.js', '**/*'));
    });

    test('should not match dotfiles by default', () => {
      expect_truthy(!isMatch('a/.b', 'a/**/z/*.md'));
      expect_truthy(!isMatch('a/b/z/.a', 'a/**/z/*.a'));
      expect_truthy(!isMatch('a/b/z/.a', 'a/*/z/*.a'));
      expect_truthy(!isMatch('a/b/z/.a', 'b/a'));
      expect_truthy(!isMatch('a/foo/z/.b', 'a/**/z/*.md'));
    });

    test('should match leading dots when defined in pattern', () => {
      const fixtures = ['.gitignore', 'a/b/z/.dotfile', 'a/b/z/.dotfile.md', 'a/b/z/.dotfile.md', 'a/b/z/.dotfile.md'];
      expect_truthy(!isMatch('.gitignore', 'a/**/z/*.md'));
      expect_truthy(!isMatch('a/b/z/.dotfile', 'a/**/z/*.md'));
      expect_truthy(!isMatch('a/b/z/.dotfile.md', '**/c/.*.md'));
      expect_truthy(isMatch('a/.b', 'a/.*'));
      expect_truthy(isMatch('a/b/z/.a', 'a/*/z/.a'));
      expect_truthy(isMatch('a/b/z/.dotfile.md', '**/.*.md'));
      expect_truthy(isMatch('a/b/z/.dotfile.md', 'a/**/z/.*.md'));
      expect_deepEqual(match(['.md', 'a.md', 'a/b/c.md', '.txt'], '**/*.md'), ['a.md', 'a/b/c.md']);
      expect_deepEqual(match(['.md/.md', '.md', 'a/.md', 'a/b/.md'], '**/.md'), ['.md', 'a/.md', 'a/b/.md']);
      expect_deepEqual(match(['.md/.md', '.md/foo/.md', '.md', 'a/.md', 'a/b/.md'], '.md/**/.md'), ['.md/.md', '.md/foo/.md']);
      expect_deepEqual(match(fixtures, 'a/**/z/.*.md'), ['a/b/z/.dotfile.md']);
    });

    test('todo... (micromatch/#24)', () => {
      expect_truthy(isMatch('foo/bar/baz/one/image.png', 'foo/bar/**/one/**/*.*'));
      expect_truthy(isMatch('foo/bar/baz/one/two/image.png', 'foo/bar/**/one/**/*.*'));
      expect_truthy(isMatch('foo/bar/baz/one/two/three/image.png', 'foo/bar/**/one/**/*.*'));
      expect_truthy(!isMatch('a/b/c/d/', 'a/b/**/f'));
      expect_truthy(isMatch('a', 'a/**'));
      expect_truthy(isMatch('a', '**'));
      expect_truthy(isMatch('a', 'a{,/**}'));
      expect_truthy(isMatch('a/', '**'));
      expect_truthy(isMatch('a/', 'a/**'));
      expect_truthy(isMatch('a/b/c/d', '**'));
      expect_truthy(isMatch('a/b/c/d/', '**'));
      expect_truthy(isMatch('a/b/c/d/', '**/**'));
      expect_truthy(isMatch('a/b/c/d/', '**/b/**'));
      expect_truthy(isMatch('a/b/c/d/', 'a/b/**'));
      expect_truthy(isMatch('a/b/c/d/', 'a/b/**/'));
      expect_truthy(isMatch('a/b/c/d/', 'a/b/**/c/**/'));
      expect_truthy(isMatch('a/b/c/d/', 'a/b/**/c/**/d/'));
      expect_truthy(isMatch('a/b/c/d/e.f', 'a/b/**/**/*.*'));
      expect_truthy(isMatch('a/b/c/d/e.f', 'a/b/**/*.*'));
      expect_truthy(isMatch('a/b/c/d/e.f', 'a/b/**/c/**/d/*.*'));
      expect_truthy(isMatch('a/b/c/d/e.f', 'a/b/**/d/**/*.*'));
      expect_truthy(isMatch('a/b/c/d/g/e.f', 'a/b/**/d/**/*.*'));
      expect_truthy(isMatch('a/b/c/d/g/g/e.f', 'a/b/**/d/**/*.*'));

      expect_truthy(isMatch('a/b-c/z.js', 'a/b-*/**/z.js'));
      expect_truthy(isMatch('a/b-c/d/e/z.js', 'a/b-*/**/z.js'));
    });
  });

  describe('globstars', () => {
    test('should match globstars', () => {
      expect_truthy(isMatch('a/b/c/d.js', '**/*.js'));
      expect_truthy(isMatch('a/b/c.js', '**/*.js'));
      expect_truthy(isMatch('a/b.js', '**/*.js'));
      expect_truthy(isMatch('a/b/c/d/e/f.js', 'a/b/**/*.js'));
      expect_truthy(isMatch('a/b/c/d/e.js', 'a/b/**/*.js'));
      expect_truthy(isMatch('a/b/c/d.js', 'a/b/c/**/*.js'));
      expect_truthy(isMatch('a/b/c/d.js', 'a/b/**/*.js'));
      expect_truthy(isMatch('a/b/d.js', 'a/b/**/*.js'));

      expect_truthy(!isMatch('a/d.js', 'a/b/**/*.js'));
      expect_truthy(!isMatch('d.js', 'a/b/**/*.js'));
    });

    test('should regard non-exclusive double-stars as single stars', () => {
      expect_truthy(!isMatch('a/b/c', '**c'));
      expect_truthy(!isMatch('a/b/c', 'a/**c'));
      expect_truthy(!isMatch('a/b/c', 'a/**z'));
      expect_truthy(!isMatch('a/b/c/b/c', 'a/**b**/c'));
      expect_truthy(!isMatch('a/b/c/d/e.js', 'a/b/c**/*.js'));
      expect_truthy(isMatch('a/b/c/b/c', 'a/**/b/**/c'));
      expect_truthy(isMatch('a/aba/c', 'a/**b**/c'));
      expect_truthy(isMatch('a/b/c', 'a/**b**/c'));
      expect_truthy(isMatch('a/b/c/d.js', 'a/b/c**/*.js'));
    });

    test('should support globstars (**)', () => {
      expect_truthy(!isMatch('a', 'a/**/*'));
      expect_truthy(!isMatch('a', 'a/**/**/*'));
      expect_truthy(!isMatch('a', 'a/**/**/**/*'));
      expect_truthy(!isMatch('a/', '**/a'));
      expect_truthy(!isMatch('a/', 'a/**/*'));
      expect_truthy(!isMatch('a/', 'a/**/**/*'));
      expect_truthy(!isMatch('a/', 'a/**/**/**/*'));
      expect_truthy(!isMatch('a/b', '**/a'));
      expect_truthy(!isMatch('a/b/c/j/e/z/c.txt', 'a/**/j/**/z/*.md'));
      expect_truthy(!isMatch('a/bb', 'a/**/b'));
      expect_truthy(!isMatch('a/c', '**/a'));
      expect_truthy(!isMatch('a/b', '**/a'));
      expect_truthy(!isMatch('a/x/y', '**/a'));
      expect_truthy(!isMatch('a/b/c/d', '**/a'));
      expect_truthy(isMatch('a', '**'));
      expect_truthy(isMatch('a', '**/a'));
      expect_truthy(isMatch('a', 'a/**'));
      expect_truthy(isMatch('a/', '**'));
      expect_truthy(isMatch('a/', '**/a/**'));
      expect_truthy(isMatch('a/', 'a/**'));
      expect_truthy(isMatch('a/', 'a/**/**'));
      expect_truthy(isMatch('a/a', '**/a'));
      expect_truthy(isMatch('a/b', '**'));
      expect_truthy(isMatch('a/b', '*/*'));
      expect_truthy(isMatch('a/b', 'a/**'));
      expect_truthy(isMatch('a/b', 'a/**/*'));
      expect_truthy(isMatch('a/b', 'a/**/**/*'));
      expect_truthy(isMatch('a/b', 'a/**/**/**/*'));
      expect_truthy(isMatch('a/b', 'a/**/b'));
      expect_truthy(isMatch('a/b/c', '**'));
      expect_truthy(isMatch('a/b/c', '**/*'));
      expect_truthy(isMatch('a/b/c', '**/**'));
      expect_truthy(isMatch('a/b/c', '*/**'));
      expect_truthy(isMatch('a/b/c', 'a/**'));
      expect_truthy(isMatch('a/b/c', 'a/**/*'));
      expect_truthy(isMatch('a/b/c', 'a/**/**/*'));
      expect_truthy(isMatch('a/b/c', 'a/**/**/**/*'));
      expect_truthy(isMatch('a/b/c/d', '**'));
      expect_truthy(isMatch('a/b/c/d', 'a/**'));
      expect_truthy(isMatch('a/b/c/d', 'a/**/*'));
      expect_truthy(isMatch('a/b/c/d', 'a/**/**/*'));
      expect_truthy(isMatch('a/b/c/d', 'a/**/**/**/*'));
      expect_truthy(isMatch('a/b/c/d.e', 'a/b/**/c/**/*.*'));
      expect_truthy(isMatch('a/b/c/d/e/f/g.md', 'a/**/f/*.md'));
      expect_truthy(isMatch('a/b/c/d/e/f/g/h/i/j/k/l.md', 'a/**/f/**/k/*.md'));
      expect_truthy(isMatch('a/b/c/def.md', 'a/b/c/*.md'));
      expect_truthy(isMatch('a/bb.bb/c/ddd.md', 'a/*/c/*.md'));
      expect_truthy(isMatch('a/bb.bb/cc/d.d/ee/f/ggg.md', 'a/**/f/*.md'));
      expect_truthy(isMatch('a/bb.bb/cc/dd/ee/f/ggg.md', 'a/**/f/*.md'));
      expect_truthy(isMatch('a/bb/c/ddd.md', 'a/*/c/*.md'));
      expect_truthy(isMatch('a/bbbb/c/ddd.md', 'a/*/c/*.md'));
    });
  });
});
