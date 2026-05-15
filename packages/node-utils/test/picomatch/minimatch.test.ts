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


const format = str => str.replace(/^\.\//, '');
const { isMatch, makeRe } = picomatch;

describe('minimatch parity:', () => {
  describe('minimatch issues (as of 12/7/2016)', () => {
    test('https://github.com/isaacs/minimatch/issues/29', () => {
      expect_truthy(isMatch('foo/bar.txt', 'foo/**/*.txt'));
      expect_truthy(makeRe('foo/**/*.txt').test('foo/bar.txt'));
      expect_truthy(!isMatch('n/!(axios)/**', 'n/axios/a.js'));
      expect_truthy(!makeRe('n/!(axios)/**').test('n/axios/a.js'));
    });

    test('https://github.com/isaacs/minimatch/issues/30', () => {
      expect_truthy(isMatch('foo/bar.js', '**/foo/**', { format }));
      expect_truthy(isMatch('./foo/bar.js', './**/foo/**', { format }));
      expect_truthy(isMatch('./foo/bar.js', '**/foo/**', { format }));
      expect_truthy(isMatch('./foo/bar.txt', 'foo/**/*.txt', { format }));
      expect_truthy(makeRe('./foo/**/*.txt').test('foo/bar.txt'));
      expect_truthy(!isMatch('./foo/!(bar)/**', 'foo/bar/a.js', { format }));
      expect_truthy(!makeRe('./foo/!(bar)/**').test('foo/bar/a.js'));
    });

    test('https://github.com/isaacs/minimatch/issues/50', () => {
      expect_truthy(isMatch('foo/bar-[ABC].txt', 'foo/**/*-\\[ABC\\].txt'));
      expect_truthy(!isMatch('foo/bar-[ABC].txt', 'foo/**/*-\\[abc\\].txt'));
      expect_truthy(isMatch('foo/bar-[ABC].txt', 'foo/**/*-\\[abc\\].txt', { nocase: true }));
    });

    test('https://github.com/isaacs/minimatch/issues/67 (should work consistently with `makeRe` and matcher functions)', () => {
      const re = makeRe('node_modules/foobar/**/*.bar');
      expect_truthy(re.test('node_modules/foobar/foo.bar'));
      expect_truthy(isMatch('node_modules/foobar/foo.bar', 'node_modules/foobar/**/*.bar'));
    });

    test('https://github.com/isaacs/minimatch/issues/75', () => {
      expect_truthy(isMatch('foo/baz.qux.js', 'foo/@(baz.qux).js'));
      expect_truthy(isMatch('foo/baz.qux.js', 'foo/+(baz.qux).js'));
      expect_truthy(isMatch('foo/baz.qux.js', 'foo/*(baz.qux).js'));
      expect_truthy(!isMatch('foo/baz.qux.js', 'foo/!(baz.qux).js'));
      expect_truthy(!isMatch('foo/bar/baz.qux.js', 'foo/*/!(baz.qux).js'));
      expect_truthy(!isMatch('foo/bar/bazqux.js', '**/!(bazqux).js'));
      expect_truthy(!isMatch('foo/bar/bazqux.js', '**/bar/!(bazqux).js'));
      expect_truthy(!isMatch('foo/bar/bazqux.js', 'foo/**/!(bazqux).js'));
      expect_truthy(!isMatch('foo/bar/bazqux.js', 'foo/**/!(bazqux)*.js'));
      expect_truthy(!isMatch('foo/bar/baz.qux.js', 'foo/**/!(baz.qux)*.js'));
      expect_truthy(!isMatch('foo/bar/baz.qux.js', 'foo/**/!(baz.qux).js'));
      expect_truthy(!isMatch('foobar.js', '!(foo)*.js'));
      expect_truthy(!isMatch('foo.js', '!(foo).js'));
      expect_truthy(!isMatch('foo.js', '!(foo)*.js'));
    });

    test('https://github.com/isaacs/minimatch/issues/78', () => {
      expect_truthy(isMatch('a\\b\\c.txt', 'a/**/*.txt', { windows: true }));
      expect_truthy(isMatch('a/b/c.txt', 'a/**/*.txt', { windows: true }));
    });

    test('https://github.com/isaacs/minimatch/issues/82', () => {
      expect_truthy(isMatch('./src/test/a.js', '**/test/**', { format }));
      expect_truthy(isMatch('src/test/a.js', '**/test/**'));
    });

    test('https://github.com/isaacs/minimatch/issues/83', () => {
      expect_truthy(!makeRe('foo/!(bar)/**').test('foo/bar/a.js'));
      expect_truthy(!isMatch('foo/!(bar)/**', 'foo/bar/a.js'));
    });
  });
});
