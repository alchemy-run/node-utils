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

describe('options', () => {
  describe('options.matchBase', () => {
    test('should match the basename of file paths when `options.matchBase` is true', () => {
      expect_deepEqual(match(['a/b/c/d.md'], '*.md', { windows: true }), [], 'should not match multiple levels');
      expect_deepEqual(match(['a/b/c/foo.md'], '*.md', { windows: true }), [], 'should not match multiple levels');
      expect_deepEqual(match(['ab', 'acb', 'acb/', 'acb/d/e', 'x/y/acb', 'x/y/acb/d'], 'a?b', { windows: true }), ['acb'], 'should not match multiple levels');
      expect_deepEqual(match(['a/b/c/d.md'], '*.md', { matchBase: true, windows: true }), ['a/b/c/d.md']);
      expect_deepEqual(match(['a/b/c/foo.md'], '*.md', { matchBase: true, windows: true }), ['a/b/c/foo.md']);
      expect_deepEqual(match(['x/y/acb', 'acb/', 'acb/d/e', 'x/y/acb/d'], 'a?b', { matchBase: true, windows: true }), ['x/y/acb', 'acb/']);
    });

    test('should work with negation patterns', () => {
      expect_truthy(isMatch('./x/y.js', '*.js', { matchBase: true, windows: true }));
      expect_truthy(!isMatch('./x/y.js', '!*.js', { matchBase: true, windows: true }));
      expect_truthy(isMatch('./x/y.js', '**/*.js', { matchBase: true, windows: true }));
      expect_truthy(!isMatch('./x/y.js', '!**/*.js', { matchBase: true, windows: true }));
    });
  });

  describe('options.flags', () => {
    test('should be case-sensitive by default', () => {
      expect_deepEqual(match(['a/b/d/e.md'], 'a/b/D/*.md', { windows: true }), [], 'should not match a dirname');
      expect_deepEqual(match(['a/b/c/e.md'], 'A/b/*/E.md', { windows: true }), [], 'should not match a basename');
      expect_deepEqual(match(['a/b/c/e.md'], 'A/b/C/*.MD', { windows: true }), [], 'should not match a file extension');
    });

    test('should not be case-sensitive when `i` is set on `options.flags`', () => {
      expect_deepEqual(match(['a/b/d/e.md'], 'a/b/D/*.md', { flags: 'i', windows: true }), ['a/b/d/e.md']);
      expect_deepEqual(match(['a/b/c/e.md'], 'A/b/*/E.md', { flags: 'i', windows: true }), ['a/b/c/e.md']);
      expect_deepEqual(match(['a/b/c/e.md'], 'A/b/C/*.MD', { flags: 'i', windows: true }), ['a/b/c/e.md']);
    });
  });

  describe('options.nocase', () => {
    test('should not be case-sensitive when `options.nocase` is true', () => {
      expect_deepEqual(match(['a/b/c/e.md'], 'A/b/*/E.md', { nocase: true, windows: true }), ['a/b/c/e.md']);
      expect_deepEqual(match(['a/b/c/e.md'], 'A/b/C/*.MD', { nocase: true, windows: true }), ['a/b/c/e.md']);
      expect_deepEqual(match(['a/b/c/e.md'], 'A/b/C/*.md', { nocase: true, windows: true }), ['a/b/c/e.md']);
      expect_deepEqual(match(['a/b/d/e.md'], 'a/b/D/*.md', { nocase: true, windows: true }), ['a/b/d/e.md']);
    });

    test('should not double-set `i` when both `nocase` and the `i` flag are set', () => {
      const opts = { nocase: true, flags: 'i', windows: true };
      expect_deepEqual(match(['a/b/d/e.md'], 'a/b/D/*.md', opts), ['a/b/d/e.md']);
      expect_deepEqual(match(['a/b/c/e.md'], 'A/b/*/E.md', opts), ['a/b/c/e.md']);
      expect_deepEqual(match(['a/b/c/e.md'], 'A/b/C/*.MD', opts), ['a/b/c/e.md']);
    });
  });

  describe('options.noextglob', () => {
    test('should match literal parens when noextglob is true (issue #116)', () => {
      expect_truthy(isMatch('a/(dir)', 'a/(dir)', { noextglob: true, windows: true }));
    });

    test('should not match extglobs when noextglob is true', () => {
      expect_truthy(!isMatch('ax', '?(a*|b)', { noextglob: true, windows: true }));
      expect_deepEqual(match(['a.j.js', 'a.md.js'], '*.*(j).js', { noextglob: true, windows: true }), ['a.j.js']);
      expect_deepEqual(match(['a/z', 'a/b', 'a/!(z)'], 'a/!(z)', { noextglob: true, windows: true }), ['a/!(z)']);
      expect_deepEqual(match(['a/z', 'a/b'], 'a/!(z)', { noextglob: true, windows: true }), []);
      expect_deepEqual(match(['c/a/v'], 'c/!(z)/v', { noextglob: true, windows: true }), []);
      expect_deepEqual(match(['c/z/v', 'c/a/v'], 'c/!(z)/v', { noextglob: true, windows: true }), []);
      expect_deepEqual(match(['c/z/v', 'c/a/v'], 'c/@(z)/v', { noextglob: true, windows: true }), []);
      expect_deepEqual(match(['c/z/v', 'c/a/v'], 'c/+(z)/v', { noextglob: true, windows: true }), []);
      expect_deepEqual(match(['c/z/v', 'c/a/v'], 'c/*(z)/v', { noextglob: true, windows: true }), ['c/z/v']);
      expect_deepEqual(match(['c/z/v', 'z', 'zf', 'fz'], '?(z)', { noextglob: true, windows: true }), ['fz']);
      expect_deepEqual(match(['c/z/v', 'z', 'zf', 'fz'], '+(z)', { noextglob: true, windows: true }), []);
      expect_deepEqual(match(['c/z/v', 'z', 'zf', 'fz'], '*(z)', { noextglob: true, windows: true }), ['z', 'fz']);
      expect_deepEqual(match(['cz', 'abz', 'az'], 'a@(z)', { noextglob: true, windows: true }), []);
      expect_deepEqual(match(['cz', 'abz', 'az'], 'a*@(z)', { noextglob: true, windows: true }), []);
      expect_deepEqual(match(['cz', 'abz', 'az'], 'a!(z)', { noextglob: true, windows: true }), []);
      expect_deepEqual(match(['cz', 'abz', 'az', 'azz'], 'a?(z)', { noextglob: true, windows: true }), ['abz', 'azz']);
      expect_deepEqual(match(['cz', 'abz', 'az', 'azz', 'a+z'], 'a+(z)', { noextglob: true, windows: true }), ['a+z']);
      expect_deepEqual(match(['cz', 'abz', 'az'], 'a*(z)', { noextglob: true, windows: true }), ['abz', 'az']);
      expect_deepEqual(match(['cz', 'abz', 'az'], 'a**(z)', { noextglob: true, windows: true }), ['abz', 'az']);
      expect_deepEqual(match(['cz', 'abz', 'az'], 'a*!(z)', { noextglob: true, windows: true }), []);
    });
  });

  describe('options.unescape', () => {
    test('should remove backslashes in glob patterns:', () => {
      const fixtures = ['abc', '/a/b/c', '\\a\\b\\c'];
      expect_deepEqual(match(fixtures, '\\a\\b\\c', { windows: true }), ['/a/b/c']);
      expect_deepEqual(match(fixtures, '\\a\\b\\c', { unescape: true, windows: true }), ['abc', '/a/b/c']);
      expect_deepEqual(match(fixtures, '\\a\\b\\c', { unescape: false, windows: true }), ['/a/b/c']);
    });
  });

  describe('options.nonegate', () => {
    test('should support the `nonegate` option:', () => {
      expect_deepEqual(match(['a/a/a', 'a/b/a', 'b/b/a', 'c/c/a', 'c/c/b'], '!**/a', { windows: true }), ['c/c/b']);
      expect_deepEqual(match(['a.md', '!a.md', 'a.txt'], '!*.md', { nonegate: true, windows: true }), ['!a.md']);
      expect_deepEqual(match(['!a/a/a', '!a/a', 'a/b/a', 'b/b/a', '!c/c/a', '!c/a'], '!**/a', { nonegate: true, windows: true }), ['!a/a', '!c/a']);
      expect_deepEqual(match(['!*.md', '.dotfile.txt', 'a/b/.dotfile'], '!*.md', { nonegate: true, windows: true }), ['!*.md']);
    });
  });

  describe('options.windows', () => {
    test('should windows file paths by default', () => {
      expect_deepEqual(match(['a\\b\\c.md'], '**/*.md', { windows: true }), ['a/b/c.md']);
      expect_deepEqual(match(['a\\b\\c.md'], '**/*.md', { windows: false }), ['a\\b\\c.md']);
    });

    test('should windows absolute paths', () => {
      expect_deepEqual(match(['E:\\a\\b\\c.md'], 'E:/**/*.md', { windows: true }), ['E:/a/b/c.md']);
      expect_deepEqual(match(['E:\\a\\b\\c.md'], 'E:/**/*.md', { windows: false }), []);
    });

    test('should strip leading `./`', () => {
      const fixtures = ['./a', './a/a/a', './a/a/a/a', './a/a/a/a/a', './a/b', './a/x', './z/z', 'a', 'a/a', 'a/a/b', 'a/c', 'b', 'x/y'].sort();
      const format = str => str.replace(/^\.\//, '');
      const opts = { format, windows: true };
      expect_deepEqual(match(fixtures, '*', opts), ['a', 'b']);
      expect_deepEqual(match(fixtures, '**/a/**', opts), ['a', 'a/a/a', 'a/a/a/a', 'a/a/a/a/a', 'a/b', 'a/x', 'a/a', 'a/a/b', 'a/c']);
      expect_deepEqual(match(fixtures, '*/*', opts), ['a/b', 'a/x', 'z/z', 'a/a', 'a/c', 'x/y']);
      expect_deepEqual(match(fixtures, '*/*/*', opts), ['a/a/a', 'a/a/b']);
      expect_deepEqual(match(fixtures, '*/*/*/*', opts), ['a/a/a/a']);
      expect_deepEqual(match(fixtures, '*/*/*/*/*', opts), ['a/a/a/a/a']);
      expect_deepEqual(match(fixtures, './*', opts), ['a', 'b']);
      expect_deepEqual(match(fixtures, './**/a/**', opts), ['a', 'a/a/a', 'a/a/a/a', 'a/a/a/a/a', 'a/b', 'a/x', 'a/a', 'a/a/b', 'a/c']);
      expect_deepEqual(match(fixtures, './a/*/a', opts), ['a/a/a']);
      expect_deepEqual(match(fixtures, 'a/*', opts), ['a/b', 'a/x', 'a/a', 'a/c']);
      expect_deepEqual(match(fixtures, 'a/*/*', opts), ['a/a/a', 'a/a/b']);
      expect_deepEqual(match(fixtures, 'a/*/*/*', opts), ['a/a/a/a']);
      expect_deepEqual(match(fixtures, 'a/*/*/*/*', opts), ['a/a/a/a/a']);
      expect_deepEqual(match(fixtures, 'a/*/a', opts), ['a/a/a']);

      expect_deepEqual(match(fixtures, '*', { ...opts, windows: false }), ['a', 'b']);
      expect_deepEqual(match(fixtures, '**/a/**', { ...opts, windows: false }), ['a', 'a/a/a', 'a/a/a/a', 'a/a/a/a/a', 'a/b', 'a/x', 'a/a', 'a/a/b', 'a/c']);
      expect_deepEqual(match(fixtures, '*/*', { ...opts, windows: false }), ['a/b', 'a/x', 'z/z', 'a/a', 'a/c', 'x/y']);
      expect_deepEqual(match(fixtures, '*/*/*', { ...opts, windows: false }), ['a/a/a', 'a/a/b']);
      expect_deepEqual(match(fixtures, '*/*/*/*', { ...opts, windows: false }), ['a/a/a/a']);
      expect_deepEqual(match(fixtures, '*/*/*/*/*', { ...opts, windows: false }), ['a/a/a/a/a']);
      expect_deepEqual(match(fixtures, './*', { ...opts, windows: false }), ['a', 'b']);
      expect_deepEqual(match(fixtures, './**/a/**', { ...opts, windows: false }), ['a', 'a/a/a', 'a/a/a/a', 'a/a/a/a/a', 'a/b', 'a/x', 'a/a', 'a/a/b', 'a/c']);
      expect_deepEqual(match(fixtures, './a/*/a', { ...opts, windows: false }), ['a/a/a']);
      expect_deepEqual(match(fixtures, 'a/*', { ...opts, windows: false }), ['a/b', 'a/x', 'a/a', 'a/c']);
      expect_deepEqual(match(fixtures, 'a/*/*', { ...opts, windows: false }), ['a/a/a', 'a/a/b']);
      expect_deepEqual(match(fixtures, 'a/*/*/*', { ...opts, windows: false }), ['a/a/a/a']);
      expect_deepEqual(match(fixtures, 'a/*/*/*/*', { ...opts, windows: false }), ['a/a/a/a/a']);
      expect_deepEqual(match(fixtures, 'a/*/a', { ...opts, windows: false }), ['a/a/a']);
    });
  });

  describe('windows', () => {
    test('should convert file paths to posix slashes', () => {
      expect_deepEqual(match(['a\\b\\c.md'], '**/*.md', { windows: true }), ['a/b/c.md']);
      expect_deepEqual(match(['a\\b\\c.md'], '**/*.md', { windows: false }), ['a\\b\\c.md']);
    });

    test('should convert absolute paths to posix slashes', () => {
      expect_deepEqual(match(['E:\\a\\b\\c.md'], 'E:/**/*.md', { windows: true }), ['E:/a/b/c.md']);
      expect_deepEqual(match(['E:\\a\\b\\c.md'], 'E:/**/*.md', { windows: false }), []);
    });
  });
});
