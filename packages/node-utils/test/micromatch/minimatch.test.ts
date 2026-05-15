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
const isWindows = () => process.platform === 'win32' || path.sep === '\\';
const patterns = (await import("./fixtures/patterns.ts")).default;
const mm = micromatch;
let sep = path.sep;

/**
 * Minimatch comparison tests
 */

describe('basic tests', () => {
  afterEach(() => (path.sep = sep));
  after(() => (path.sep = sep));

  describe('minimatch parity', () => {
    patterns.forEach(function(unit, i) {
      test(i + ': ' + unit[0], () => {
        if (typeof unit === 'string') {
          console.log();
          console.log(' ', unit);
          return;
        }

        // update fixtures list
        if (typeof unit === 'function') {
          unit();
          return;
        }

        let pattern = unit[0];
        let expected = (unit[1] || []).sort(compare);
        let options = Object.assign({}, unit[2]);
        let fixtures = unit[3] || patterns.fixtures;
        mm(fixtures, pattern, expected, options);
      });
    });
  });

  describe('backslashes', () => {
    test('should match literal backslashes', () => {
      if (isWindows()) {
        mm(['\\'], '\\', ['/']);
      } else {
        mm(['\\'], '\\', ['\\']);
      }
    });
  });

  /**
   * Issues that minimatch fails on but micromatch passes
   */

  describe('minimatch issues (as of 12/7/2016)', () => {
    test('https://github.com/isaacs/minimatch/issues/29', () => {
      expect_truthy(mm.isMatch('foo/bar.txt', 'foo/**/*.txt'));
      expect_truthy(mm.makeRe('foo/**/*.txt').test('foo/bar.txt'));
      expect_truthy(!mm.isMatch('n/!(axios)/**', 'n/axios/a.js'));
      expect_truthy(!mm.makeRe('n/!(axios)/**').test('n/axios/a.js'));
    });

    test('https://github.com/isaacs/minimatch/issues/30', () => {
      let format = str => str.replace(/^\.\//, '');

      expect_truthy(mm.isMatch('foo/bar.js', '**/foo/**'));
      expect_truthy(mm.isMatch('./foo/bar.js', './**/foo/**', { format }));
      expect_truthy(mm.isMatch('./foo/bar.js', '**/foo/**', { format }));
      expect_truthy(mm.isMatch('./foo/bar.txt', 'foo/**/*.txt', { format }));
      expect_truthy(mm.makeRe('./foo/**/*.txt').test('foo/bar.txt'));
      expect_truthy(!mm.isMatch('./foo/!(bar)/**', 'foo/bar/a.js'));
      expect_truthy(!mm.makeRe('./foo/!(bar)/**').test('foo/bar/a.js'));
    });

    test('https://github.com/isaacs/minimatch/issues/50', () => {
      expect_truthy(mm.isMatch('foo/bar-[ABC].txt', 'foo/**/*-\\[ABC\\].txt'));
      expect_truthy(!mm.isMatch('foo/bar-[ABC].txt', 'foo/**/*-\\[abc\\].txt'));
      expect_truthy(mm.isMatch('foo/bar-[ABC].txt', 'foo/**/*-\\[abc\\].txt', {nocase: true}));
    });

    test('https://github.com/isaacs/minimatch/issues/67 (should work consistently with `makeRe` and matcher functions)', () => {
      var re = mm.makeRe('node_modules/foobar/**/*.bar');
      expect_truthy(re.test('node_modules/foobar/foo.bar'));
      expect_truthy(mm.isMatch('node_modules/foobar/foo.bar', 'node_modules/foobar/**/*.bar'));
      mm(['node_modules/foobar/foo.bar'], 'node_modules/foobar/**/*.bar', ['node_modules/foobar/foo.bar']);
    });

    test('https://github.com/isaacs/minimatch/issues/75', () => {
      expect_truthy(mm.isMatch('foo/baz.qux.js', 'foo/@(baz.qux).js'));
      expect_truthy(mm.isMatch('foo/baz.qux.js', 'foo/+(baz.qux).js'));
      expect_truthy(mm.isMatch('foo/baz.qux.js', 'foo/*(baz.qux).js'));
      expect_truthy(!mm.isMatch('foo/baz.qux.js', 'foo/!(baz.qux).js'));
      expect_truthy(!mm.isMatch('foo/bar/baz.qux.js', 'foo/*/!(baz.qux).js'));
      expect_truthy(!mm.isMatch('foo/bar/bazqux.js', '**/!(bazqux).js'));
      expect_truthy(!mm.isMatch('foo/bar/bazqux.js', '**/bar/!(bazqux).js'));
      expect_truthy(!mm.isMatch('foo/bar/bazqux.js', 'foo/**/!(bazqux).js'));
      expect_truthy(!mm.isMatch('foo/bar/bazqux.js', 'foo/**/!(bazqux)*.js'));
      expect_truthy(!mm.isMatch('foo/bar/baz.qux.js', 'foo/**/!(baz.qux)*.js'));
      expect_truthy(!mm.isMatch('foo/bar/baz.qux.js', 'foo/**/!(baz.qux).js'));
      expect_truthy(!mm.isMatch('foobar.js', '!(foo)*.js'));
      expect_truthy(!mm.isMatch('foo.js', '!(foo).js'));
      expect_truthy(!mm.isMatch('foo.js', '!(foo)*.js'));
    });

    test('https://github.com/isaacs/minimatch/issues/78', () => {
      path.sep = '\\';
      expect_truthy(mm.isMatch('a\\b\\c.txt', 'a/**/*.txt'));
      expect_truthy(mm.isMatch('a/b/c.txt', 'a/**/*.txt'));
      path.sep = sep;
    });

    test('https://github.com/isaacs/minimatch/issues/82', () => {
      let format = str => str.replace(/^\.\//, '');
      expect_truthy(mm.isMatch('./src/test/a.js', '**/test/**', { format }));
      expect_truthy(mm.isMatch('src/test/a.js', '**/test/**'));
    });

    test('https://github.com/isaacs/minimatch/issues/83', () => {
      expect_truthy(!mm.makeRe('foo/!(bar)/**').test('foo/bar/a.js'));
      expect_truthy(!mm.isMatch('foo/!(bar)/**', 'foo/bar/a.js'));
    });
  });
});

function compare(a, b) {
  return a === b ? 0 : a > b ? 1 : -1;
}
