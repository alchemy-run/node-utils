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


const version = process.version;
const mm = micromatch;

describe('regex features', () => {

  describe('back-references', () => {
    test('should support regex backreferences', () => {
      expect_truthy(!mm.isMatch('1/2', '(*)/\\1'));
      expect_truthy(mm.isMatch('1/1', '(*)/\\1'));
      expect_truthy(mm.isMatch('1/1/1/1', '(*)/\\1/\\1/\\1'));
      expect_truthy(!mm.isMatch('1/11/111/1111', '(*)/\\1/\\1/\\1'));
      expect_truthy(mm.isMatch('1/11/111/1111', '(*)/(\\1)+/(\\1)+/(\\1)+'));
      expect_truthy(!mm.isMatch('1/2/1/1', '(*)/\\1/\\1/\\1'));
      expect_truthy(!mm.isMatch('1/1/2/1', '(*)/\\1/\\1/\\1'));
      expect_truthy(!mm.isMatch('1/1/1/2', '(*)/\\1/\\1/\\1'));
      expect_truthy(mm.isMatch('1/1/1/1', '(*)/\\1/(*)/\\2'));
      expect_truthy(!mm.isMatch('1/1/2/1', '(*)/\\1/(*)/\\2'));
      expect_truthy(!mm.isMatch('1/1/2/1', '(*)/\\1/(*)/\\2'));
      expect_truthy(mm.isMatch('1/1/2/2', '(*)/\\1/(*)/\\2'));
    });
  });

  describe('character classes', () => {
    test('should match regex character classes', () => {
      expect_truthy(!mm.isMatch('foo/bar', '**/[jkl]*'));
      expect_truthy(mm.isMatch('foo/jar', '**/[jkl]*'));

      expect_truthy(mm.isMatch('foo/bar', '**/[^jkl]*'));
      expect_truthy(!mm.isMatch('foo/jar', '**/[^jkl]*'));

      expect_truthy(mm.isMatch('foo/bar', '**/[abc]*'));
      expect_truthy(!mm.isMatch('foo/jar', '**/[abc]*'));

      expect_truthy(!mm.isMatch('foo/bar', '**/[^abc]*'));
      expect_truthy(mm.isMatch('foo/jar', '**/[^abc]*'));

      expect_truthy(mm.isMatch('foo/bar', '**/[abc]ar'));
      expect_truthy(!mm.isMatch('foo/jar', '**/[abc]ar'));
    });

    test('should support valid regex ranges', () => {
      expect_truthy(!mm.isMatch('a/a', 'a/[b-c]'));
      expect_truthy(!mm.isMatch('a/z', 'a/[b-c]'));
      expect_truthy(mm.isMatch('a/b', 'a/[b-c]'));
      expect_truthy(mm.isMatch('a/c', 'a/[b-c]'));
      expect_truthy(mm.isMatch('a/b', '[a-z]/[a-z]'));
      expect_truthy(mm.isMatch('a/z', '[a-z]/[a-z]'));
      expect_truthy(mm.isMatch('z/z', '[a-z]/[a-z]'));
      expect_truthy(!mm.isMatch('a/x/y', 'a/[a-z]'));

      expect_truthy(mm.isMatch('a.a', '[a-b].[a-b]'));
      expect_truthy(mm.isMatch('a.b', '[a-b].[a-b]'));
      expect_truthy(!mm.isMatch('a.a.a', '[a-b].[a-b]'));
      expect_truthy(!mm.isMatch('c.a', '[a-b].[a-b]'));
      expect_truthy(!mm.isMatch('d.a.d', '[a-b].[a-b]'));
      expect_truthy(!mm.isMatch('a.bb', '[a-b].[a-b]'));
      expect_truthy(!mm.isMatch('a.ccc', '[a-b].[a-b]'));

      expect_truthy(mm.isMatch('a.a', '[a-d].[a-b]'));
      expect_truthy(mm.isMatch('a.b', '[a-d].[a-b]'));
      expect_truthy(!mm.isMatch('a.a.a', '[a-d].[a-b]'));
      expect_truthy(mm.isMatch('c.a', '[a-d].[a-b]'));
      expect_truthy(!mm.isMatch('d.a.d', '[a-d].[a-b]'));
      expect_truthy(!mm.isMatch('a.bb', '[a-d].[a-b]'));
      expect_truthy(!mm.isMatch('a.ccc', '[a-d].[a-b]'));

      expect_truthy(mm.isMatch('a.a', '[a-d]*.[a-b]'));
      expect_truthy(mm.isMatch('a.b', '[a-d]*.[a-b]'));
      expect_truthy(mm.isMatch('a.a.a', '[a-d]*.[a-b]'));
      expect_truthy(mm.isMatch('c.a', '[a-d]*.[a-b]'));
      expect_truthy(!mm.isMatch('d.a.d', '[a-d]*.[a-b]'));
      expect_truthy(!mm.isMatch('a.bb', '[a-d]*.[a-b]'));
      expect_truthy(!mm.isMatch('a.ccc', '[a-d]*.[a-b]'));
    });

    test('should support valid regex ranges with glob negation patterns', () => {
      expect_truthy(!mm.isMatch('a.a', '!*.[a-b]'));
      expect_truthy(!mm.isMatch('a.b', '!*.[a-b]'));
      expect_truthy(!mm.isMatch('a.a.a', '!*.[a-b]'));
      expect_truthy(!mm.isMatch('c.a', '!*.[a-b]'));
      expect_truthy(mm.isMatch('d.a.d', '!*.[a-b]'));
      expect_truthy(mm.isMatch('a.bb', '!*.[a-b]'));
      expect_truthy(mm.isMatch('a.ccc', '!*.[a-b]'));

      expect_truthy(!mm.isMatch('a.a', '!*.[a-b]*'));
      expect_truthy(!mm.isMatch('a.b', '!*.[a-b]*'));
      expect_truthy(!mm.isMatch('a.a.a', '!*.[a-b]*'));
      expect_truthy(!mm.isMatch('c.a', '!*.[a-b]*'));
      expect_truthy(!mm.isMatch('d.a.d', '!*.[a-b]*'));
      expect_truthy(!mm.isMatch('a.bb', '!*.[a-b]*'));
      expect_truthy(mm.isMatch('a.ccc', '!*.[a-b]*'));

      expect_truthy(!mm.isMatch('a.a', '![a-b].[a-b]'));
      expect_truthy(!mm.isMatch('a.b', '![a-b].[a-b]'));
      expect_truthy(mm.isMatch('a.a.a', '![a-b].[a-b]'));
      expect_truthy(mm.isMatch('c.a', '![a-b].[a-b]'));
      expect_truthy(mm.isMatch('d.a.d', '![a-b].[a-b]'));
      expect_truthy(mm.isMatch('a.bb', '![a-b].[a-b]'));
      expect_truthy(mm.isMatch('a.ccc', '![a-b].[a-b]'));

      expect_truthy(!mm.isMatch('a.a', '![a-b]+.[a-b]+'));
      expect_truthy(!mm.isMatch('a.b', '![a-b]+.[a-b]+'));
      expect_truthy(mm.isMatch('a.a.a', '![a-b]+.[a-b]+'));
      expect_truthy(mm.isMatch('c.a', '![a-b]+.[a-b]+'));
      expect_truthy(mm.isMatch('d.a.d', '![a-b]+.[a-b]+'));
      expect_truthy(!mm.isMatch('a.bb', '![a-b]+.[a-b]+'));
      expect_truthy(mm.isMatch('a.ccc', '![a-b]+.[a-b]+'));
    });

    test('should support valid regex ranges in negated character classes', () => {
      expect_truthy(!mm.isMatch('a.a', '*.[^a-b]'));
      expect_truthy(!mm.isMatch('a.b', '*.[^a-b]'));
      expect_truthy(!mm.isMatch('a.a.a', '*.[^a-b]'));
      expect_truthy(!mm.isMatch('c.a', '*.[^a-b]'));
      expect_truthy(mm.isMatch('d.a.d', '*.[^a-b]'));
      expect_truthy(!mm.isMatch('a.bb', '*.[^a-b]'));
      expect_truthy(!mm.isMatch('a.ccc', '*.[^a-b]'));

      expect_truthy(!mm.isMatch('a.a', 'a.[^a-b]*'));
      expect_truthy(!mm.isMatch('a.b', 'a.[^a-b]*'));
      expect_truthy(!mm.isMatch('a.a.a', 'a.[^a-b]*'));
      expect_truthy(!mm.isMatch('c.a', 'a.[^a-b]*'));
      expect_truthy(!mm.isMatch('d.a.d', 'a.[^a-b]*'));
      expect_truthy(!mm.isMatch('a.bb', 'a.[^a-b]*'));
      expect_truthy(mm.isMatch('a.ccc', 'a.[^a-b]*'));
    });
  });

  describe('capture groups', () => {
    test('should support regex capture groups', () => {
      expect_truthy(mm.isMatch('a/bb/c/dd/e.md', 'a/??/?/(dd)/e.md'));
      expect_truthy(mm.isMatch('a/b/c/d/e.md', 'a/?/c/?/(e|f).md'));
      expect_truthy(mm.isMatch('a/b/c/d/f.md', 'a/?/c/?/(e|f).md'));
    });

    test('should support regex capture groups with slashes', () => {
      expect_truthy(!mm.isMatch('a/a', '(a/b)'));
      expect_truthy(mm.isMatch('a/b', '(a/b)'));
      expect_truthy(!mm.isMatch('a/c', '(a/b)'));
      expect_truthy(!mm.isMatch('b/a', '(a/b)'));
      expect_truthy(!mm.isMatch('b/b', '(a/b)'));
      expect_truthy(!mm.isMatch('b/c', '(a/b)'));
    });

    test('should support regex non-capture groups', () => {
      expect_truthy(mm.isMatch('a/bb/c/dd/e.md', 'a/**/(?:dd)/e.md'));
      expect_truthy(mm.isMatch('a/b/c/d/e.md', 'a/?/c/?/(?:e|f).md'));
      expect_truthy(mm.isMatch('a/b/c/d/f.md', 'a/?/c/?/(?:e|f).md'));
    });
  });

  describe('lookarounds', () => {
    test('should support regex lookbehinds', () => {
      if (parseInt(version.slice(1), 10) >= 10) {
        expect_truthy(mm.isMatch('foo/cbaz', 'foo/*(?<!d)baz'));
        expect_truthy(!mm.isMatch('foo/cbaz', 'foo/*(?<!c)baz'));
        expect_truthy(!mm.isMatch('foo/cbaz', 'foo/*(?<=d)baz'));
        expect_truthy(mm.isMatch('foo/cbaz', 'foo/*(?<=c)baz'));
      }
    });

    test.skip('should throw an error when regex lookbehinds are used on an unsupported node version', () => {
      Reflect.defineProperty(process, 'version', { value: 'v6.0.0' });
      expect_throws(() => mm.isMatch('foo/cbaz', 'foo/*(?<!c)baz'), /Node\.js v10 or higher/);
      Reflect.defineProperty(process, 'version', { value: version });
    });
  });
});
