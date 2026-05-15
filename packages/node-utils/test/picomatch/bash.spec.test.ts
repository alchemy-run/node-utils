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

describe('bash.spec', () => {
  describe('dotglob', () => {
    test('"a/b/.x" should match "**/.x/**"', () => {
      expect_truthy(isMatch('a/b/.x', '**/.x/**', { bash: true }));
    });

    test('".x" should match "**/.x/**"', () => {
      expect_truthy(isMatch('.x', '**/.x/**', { bash: true }));
    });

    test('".x/" should match "**/.x/**"', () => {
      expect_truthy(isMatch('.x/', '**/.x/**', { bash: true }));
    });

    test('".x/a" should match "**/.x/**"', () => {
      expect_truthy(isMatch('.x/a', '**/.x/**', { bash: true }));
    });

    test('".x/a/b" should match "**/.x/**"', () => {
      expect_truthy(isMatch('.x/a/b', '**/.x/**', { bash: true }));
    });

    test('".x/.x" should match "**/.x/**"', () => {
      expect_truthy(isMatch('.x/.x', '**/.x/**', { bash: true }));
    });

    test('"a/.x" should match "**/.x/**"', () => {
      expect_truthy(isMatch('a/.x', '**/.x/**', { bash: true }));
    });

    test('"a/b/.x/c" should match "**/.x/**"', () => {
      expect_truthy(isMatch('a/b/.x/c', '**/.x/**', { bash: true }));
    });

    test('"a/b/.x/c/d" should match "**/.x/**"', () => {
      expect_truthy(isMatch('a/b/.x/c/d', '**/.x/**', { bash: true }));
    });

    test('"a/b/.x/c/d/e" should match "**/.x/**"', () => {
      expect_truthy(isMatch('a/b/.x/c/d/e', '**/.x/**', { bash: true }));
    });

    test('"a/b/.x/" should match "**/.x/**"', () => {
      expect_truthy(isMatch('a/b/.x/', '**/.x/**', { bash: true }));
    });

    test('"a/.x/b" should match "**/.x/**"', () => {
      expect_truthy(isMatch('a/.x/b', '**/.x/**', { bash: true }));
    });

    test('"a/.x/b/.x/c" should not match "**/.x/**"', () => {
      expect_truthy(!isMatch('a/.x/b/.x/c', '**/.x/**', { bash: true }));
    });

    test('".bashrc" should not match "?bashrc"', () => {
      expect_truthy(!isMatch('.bashrc', '?bashrc', { bash: true }));
    });

    test('should match trailing slashes with stars', () => {
      expect_truthy(isMatch('.bar.baz/', '.*.*', { bash: true }));
    });

    test('".bar.baz/" should match ".*.*/"', () => {
      expect_truthy(isMatch('.bar.baz/', '.*.*/', { bash: true }));
    });

    test('".bar.baz" should match ".*.*"', () => {
      expect_truthy(isMatch('.bar.baz', '.*.*', { bash: true }));
    });
  });

  describe('glob', () => {
    test('"a/b/.x" should match "**/.x/**"', () => {
      expect_truthy(isMatch('a/b/.x', '**/.x/**', { bash: true }));
    });

    test('".x" should match "**/.x/**"', () => {
      expect_truthy(isMatch('.x', '**/.x/**', { bash: true }));
    });

    test('".x/" should match "**/.x/**"', () => {
      expect_truthy(isMatch('.x/', '**/.x/**', { bash: true }));
    });

    test('".x/a" should match "**/.x/**"', () => {
      expect_truthy(isMatch('.x/a', '**/.x/**', { bash: true }));
    });

    test('".x/a/b" should match "**/.x/**"', () => {
      expect_truthy(isMatch('.x/a/b', '**/.x/**', { bash: true }));
    });

    test('".x/.x" should match "**/.x/**"', () => {
      expect_truthy(isMatch('.x/.x', '**/.x/**', { bash: true }));
    });

    test('"a/.x" should match "**/.x/**"', () => {
      expect_truthy(isMatch('a/.x', '**/.x/**', { bash: true }));
    });

    test('"a/b/.x/c" should match "**/.x/**"', () => {
      expect_truthy(isMatch('a/b/.x/c', '**/.x/**', { bash: true }));
    });

    test('"a/b/.x/c/d" should match "**/.x/**"', () => {
      expect_truthy(isMatch('a/b/.x/c/d', '**/.x/**', { bash: true }));
    });

    test('"a/b/.x/c/d/e" should match "**/.x/**"', () => {
      expect_truthy(isMatch('a/b/.x/c/d/e', '**/.x/**', { bash: true }));
    });

    test('"a/b/.x/" should match "**/.x/**"', () => {
      expect_truthy(isMatch('a/b/.x/', '**/.x/**', { bash: true }));
    });

    test('"a/.x/b" should match "**/.x/**"', () => {
      expect_truthy(isMatch('a/.x/b', '**/.x/**', { bash: true }));
    });

    test('"a/.x/b/.x/c" should not match "**/.x/**"', () => {
      expect_truthy(!isMatch('a/.x/b/.x/c', '**/.x/**', { bash: true }));
    });

    test('"a/c/b" should match "a/*/b"', () => {
      expect_truthy(isMatch('a/c/b', 'a/*/b', { bash: true }));
    });

    test('"a/.d/b" should not match "a/*/b"', () => {
      expect_truthy(!isMatch('a/.d/b', 'a/*/b', { bash: true }));
    });

    test('"a/./b" should not match "a/*/b"', () => {
      expect_truthy(!isMatch('a/./b', 'a/*/b', { bash: true }));
    });

    test('"a/../b" should not match "a/*/b"', () => {
      expect_truthy(!isMatch('a/../b', 'a/*/b', { bash: true }));
    });

    test('"ab" should match "ab**"', () => {
      expect_truthy(isMatch('ab', 'ab**', { bash: true }));
    });

    test('"abcdef" should match "ab**"', () => {
      expect_truthy(isMatch('abcdef', 'ab**', { bash: true }));
    });

    test('"abef" should match "ab**"', () => {
      expect_truthy(isMatch('abef', 'ab**', { bash: true }));
    });

    test('"abcfef" should match "ab**"', () => {
      expect_truthy(isMatch('abcfef', 'ab**', { bash: true }));
    });

    test('"ab" should not match "ab***ef"', () => {
      expect_truthy(!isMatch('ab', 'ab***ef', { bash: true }));
    });

    test('"abcdef" should match "ab***ef"', () => {
      expect_truthy(isMatch('abcdef', 'ab***ef', { bash: true }));
    });

    test('"abef" should match "ab***ef"', () => {
      expect_truthy(isMatch('abef', 'ab***ef', { bash: true }));
    });

    test('"abcfef" should match "ab***ef"', () => {
      expect_truthy(isMatch('abcfef', 'ab***ef', { bash: true }));
    });

    test('".bashrc" should not match "?bashrc"', () => {
      expect_truthy(!isMatch('.bashrc', '?bashrc', { bash: true }));
    });

    test('"abbc" should not match "ab?bc"', () => {
      expect_truthy(!isMatch('abbc', 'ab?bc', { bash: true }));
    });

    test('"abc" should not match "ab?bc"', () => {
      expect_truthy(!isMatch('abc', 'ab?bc', { bash: true }));
    });

    test('"a.a" should match "[a-d]*.[a-b]"', () => {
      expect_truthy(isMatch('a.a', '[a-d]*.[a-b]', { bash: true }));
    });

    test('"a.b" should match "[a-d]*.[a-b]"', () => {
      expect_truthy(isMatch('a.b', '[a-d]*.[a-b]', { bash: true }));
    });

    test('"c.a" should match "[a-d]*.[a-b]"', () => {
      expect_truthy(isMatch('c.a', '[a-d]*.[a-b]', { bash: true }));
    });

    test('"a.a.a" should match "[a-d]*.[a-b]"', () => {
      expect_truthy(isMatch('a.a.a', '[a-d]*.[a-b]', { bash: true }));
    });

    test('"a.a.a" should match "[a-d]*.[a-b]*.[a-b]"', () => {
      expect_truthy(isMatch('a.a.a', '[a-d]*.[a-b]*.[a-b]', { bash: true }));
    });

    test('"a.a" should match "*.[a-b]"', () => {
      expect_truthy(isMatch('a.a', '*.[a-b]', { bash: true }));
    });

    test('"a.b" should match "*.[a-b]"', () => {
      expect_truthy(isMatch('a.b', '*.[a-b]', { bash: true }));
    });

    test('"a.a.a" should match "*.[a-b]"', () => {
      expect_truthy(isMatch('a.a.a', '*.[a-b]', { bash: true }));
    });

    test('"c.a" should match "*.[a-b]"', () => {
      expect_truthy(isMatch('c.a', '*.[a-b]', { bash: true }));
    });

    test('"d.a.d" should not match "*.[a-b]"', () => {
      expect_truthy(!isMatch('d.a.d', '*.[a-b]', { bash: true }));
    });

    test('"a.bb" should not match "*.[a-b]"', () => {
      expect_truthy(!isMatch('a.bb', '*.[a-b]', { bash: true }));
    });

    test('"a.ccc" should not match "*.[a-b]"', () => {
      expect_truthy(!isMatch('a.ccc', '*.[a-b]', { bash: true }));
    });

    test('"c.ccc" should not match "*.[a-b]"', () => {
      expect_truthy(!isMatch('c.ccc', '*.[a-b]', { bash: true }));
    });

    test('"a.a" should match "*.[a-b]*"', () => {
      expect_truthy(isMatch('a.a', '*.[a-b]*', { bash: true }));
    });

    test('"a.b" should match "*.[a-b]*"', () => {
      expect_truthy(isMatch('a.b', '*.[a-b]*', { bash: true }));
    });

    test('"a.a.a" should match "*.[a-b]*"', () => {
      expect_truthy(isMatch('a.a.a', '*.[a-b]*', { bash: true }));
    });

    test('"c.a" should match "*.[a-b]*"', () => {
      expect_truthy(isMatch('c.a', '*.[a-b]*', { bash: true }));
    });

    test('"d.a.d" should match "*.[a-b]*"', () => {
      expect_truthy(isMatch('d.a.d', '*.[a-b]*', { bash: true }));
    });

    test('"d.a.d" should not match "*.[a-b]*.[a-b]*"', () => {
      expect_truthy(!isMatch('d.a.d', '*.[a-b]*.[a-b]*', { bash: true }));
    });

    test('"d.a.d" should match "*.[a-d]*.[a-d]*"', () => {
      expect_truthy(isMatch('d.a.d', '*.[a-d]*.[a-d]*', { bash: true }));
    });

    test('"a.bb" should match "*.[a-b]*"', () => {
      expect_truthy(isMatch('a.bb', '*.[a-b]*', { bash: true }));
    });

    test('"a.ccc" should not match "*.[a-b]*"', () => {
      expect_truthy(!isMatch('a.ccc', '*.[a-b]*', { bash: true }));
    });

    test('"c.ccc" should not match "*.[a-b]*"', () => {
      expect_truthy(!isMatch('c.ccc', '*.[a-b]*', { bash: true }));
    });

    test('"a.a" should match "*[a-b].[a-b]*"', () => {
      expect_truthy(isMatch('a.a', '*[a-b].[a-b]*', { bash: true }));
    });

    test('"a.b" should match "*[a-b].[a-b]*"', () => {
      expect_truthy(isMatch('a.b', '*[a-b].[a-b]*', { bash: true }));
    });

    test('"a.a.a" should match "*[a-b].[a-b]*"', () => {
      expect_truthy(isMatch('a.a.a', '*[a-b].[a-b]*', { bash: true }));
    });

    test('"c.a" should not match "*[a-b].[a-b]*"', () => {
      expect_truthy(!isMatch('c.a', '*[a-b].[a-b]*', { bash: true }));
    });

    test('"d.a.d" should not match "*[a-b].[a-b]*"', () => {
      expect_truthy(!isMatch('d.a.d', '*[a-b].[a-b]*', { bash: true }));
    });

    test('"a.bb" should match "*[a-b].[a-b]*"', () => {
      expect_truthy(isMatch('a.bb', '*[a-b].[a-b]*', { bash: true }));
    });

    test('"a.ccc" should not match "*[a-b].[a-b]*"', () => {
      expect_truthy(!isMatch('a.ccc', '*[a-b].[a-b]*', { bash: true }));
    });

    test('"c.ccc" should not match "*[a-b].[a-b]*"', () => {
      expect_truthy(!isMatch('c.ccc', '*[a-b].[a-b]*', { bash: true }));
    });

    test('"abd" should match "[a-y]*[^c]"', () => {
      expect_truthy(isMatch('abd', '[a-y]*[^c]', { bash: true }));
    });

    test('"abe" should match "[a-y]*[^c]"', () => {
      expect_truthy(isMatch('abe', '[a-y]*[^c]', { bash: true }));
    });

    test('"bb" should match "[a-y]*[^c]"', () => {
      expect_truthy(isMatch('bb', '[a-y]*[^c]', { bash: true }));
    });

    test('"bcd" should match "[a-y]*[^c]"', () => {
      expect_truthy(isMatch('bcd', '[a-y]*[^c]', { bash: true }));
    });

    test('"ca" should match "[a-y]*[^c]"', () => {
      expect_truthy(isMatch('ca', '[a-y]*[^c]', { bash: true }));
    });

    test('"cb" should match "[a-y]*[^c]"', () => {
      expect_truthy(isMatch('cb', '[a-y]*[^c]', { bash: true }));
    });

    test('"dd" should match "[a-y]*[^c]"', () => {
      expect_truthy(isMatch('dd', '[a-y]*[^c]', { bash: true }));
    });

    test('"de" should match "[a-y]*[^c]"', () => {
      expect_truthy(isMatch('de', '[a-y]*[^c]', { bash: true }));
    });

    test('"bdir/" should match "[a-y]*[^c]"', () => {
      expect_truthy(isMatch('bdir/', '[a-y]*[^c]', { bash: true }));
    });

    test('"abd" should match "**/*"', () => {
      expect_truthy(isMatch('abd', '**/*', { bash: true }));
    });
  });

  describe('globstar', () => {
    test('"a.js" should match "**/*.js"', () => {
      expect_truthy(isMatch('a.js', '**/*.js', { bash: true }));
    });

    test('"a/a.js" should match "**/*.js"', () => {
      expect_truthy(isMatch('a/a.js', '**/*.js', { bash: true }));
    });

    test('"a/a/b.js" should match "**/*.js"', () => {
      expect_truthy(isMatch('a/a/b.js', '**/*.js', { bash: true }));
    });

    test('"a/b/z.js" should match "a/b/**/*.js"', () => {
      expect_truthy(isMatch('a/b/z.js', 'a/b/**/*.js', { bash: true }));
    });

    test('"a/b/c/z.js" should match "a/b/**/*.js"', () => {
      expect_truthy(isMatch('a/b/c/z.js', 'a/b/**/*.js', { bash: true }));
    });

    test('"foo.md" should match "**/*.md"', () => {
      expect_truthy(isMatch('foo.md', '**/*.md', { bash: true }));
    });

    test('"foo/bar.md" should match "**/*.md"', () => {
      expect_truthy(isMatch('foo/bar.md', '**/*.md', { bash: true }));
    });

    test('"foo/bar" should match "foo/**/bar"', () => {
      expect_truthy(isMatch('foo/bar', 'foo/**/bar', { bash: true }));
    });

    test('"foo/bar" should match "foo/**bar"', () => {
      expect_truthy(isMatch('foo/bar', 'foo/**bar', { bash: true }));
    });

    test('"ab/a/d" should match "**/*"', () => {
      expect_truthy(isMatch('ab/a/d', '**/*', { bash: true }));
    });

    test('"ab/b" should match "**/*"', () => {
      expect_truthy(isMatch('ab/b', '**/*', { bash: true }));
    });

    test('"a/b/c/d/a.js" should match "**/*"', () => {
      expect_truthy(isMatch('a/b/c/d/a.js', '**/*', { bash: true }));
    });

    test('"a/b/c.js" should match "**/*"', () => {
      expect_truthy(isMatch('a/b/c.js', '**/*', { bash: true }));
    });

    test('"a/b/c.txt" should match "**/*"', () => {
      expect_truthy(isMatch('a/b/c.txt', '**/*', { bash: true }));
    });

    test('"a/b/.js/c.txt" should match "**/*"', () => {
      expect_truthy(isMatch('a/b/.js/c.txt', '**/*', { bash: true }));
    });

    test('"a.js" should match "**/*"', () => {
      expect_truthy(isMatch('a.js', '**/*', { bash: true }));
    });

    test('"za.js" should match "**/*"', () => {
      expect_truthy(isMatch('za.js', '**/*', { bash: true }));
    });

    test('"ab" should match "**/*"', () => {
      expect_truthy(isMatch('ab', '**/*', { bash: true }));
    });

    test('"a.b" should match "**/*"', () => {
      expect_truthy(isMatch('a.b', '**/*', { bash: true }));
    });

    test('"foo/" should match "foo/**/"', () => {
      expect_truthy(isMatch('foo/', 'foo/**/', { bash: true }));
    });

    test('"foo/bar" should not match "foo/**/"', () => {
      expect_truthy(!isMatch('foo/bar', 'foo/**/', { bash: true }));
    });

    test('"foo/bazbar" should not match "foo/**/"', () => {
      expect_truthy(!isMatch('foo/bazbar', 'foo/**/', { bash: true }));
    });

    test('"foo/barbar" should not match "foo/**/"', () => {
      expect_truthy(!isMatch('foo/barbar', 'foo/**/', { bash: true }));
    });

    test('"foo/bar/baz/qux" should not match "foo/**/"', () => {
      expect_truthy(!isMatch('foo/bar/baz/qux', 'foo/**/', { bash: true }));
    });

    test('"foo/bar/baz/qux/" should match "foo/**/"', () => {
      expect_truthy(isMatch('foo/bar/baz/qux/', 'foo/**/', { bash: true }));
    });
  });
});
