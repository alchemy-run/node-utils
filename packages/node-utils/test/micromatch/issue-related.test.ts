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

describe('issue-related tests', () => {
  test('micromatch issue #140', () => {
    let a = ['a/b/some/c.md', 'a/b/c.md', 'a/b-b/c.md', 'a/bb/c.md', 'a/bbc/c.md'];
    expect_deepEqual(mm(a, '**/b/**/c.md'), ['a/b/some/c.md', 'a/b/c.md']);

    let b = ['packages/foo-foo/package.json', 'packages/foo/package.json'];
    expect_deepEqual(mm(b, '**/foo/**/package.json'), ['packages/foo/package.json']);
  });

  test('micromatch issue#15', () => {
    expect_truthy(mm.isMatch('a/b-c/d/e/z.js', 'a/b-*/**/z.js'));
    expect_truthy(mm.isMatch('z.js', 'z*'));
    expect_truthy(mm.isMatch('z.js', '**/z*'));
    expect_truthy(mm.isMatch('z.js', '**/z*.js'));
    expect_truthy(mm.isMatch('z.js', '**/*.js'));
    expect_truthy(mm.isMatch('foo', '**/foo'));
  });

  test('micromatch issue#23', () => {
    expect_truthy(!mm.isMatch('zzjs', 'z*.js'));
    expect_truthy(!mm.isMatch('zzjs', '*z.js'));
  });

  test('micromatch issue#24', () => {
    expect_truthy(!mm.isMatch('a/b/c/d/', 'a/b/**/f'));
    expect_truthy(mm.isMatch('a', 'a/**'));
    expect_truthy(mm.isMatch('a', '**'));
    expect_truthy(mm.isMatch('a/', '**'));
    expect_truthy(mm.isMatch('a/b/c/d', '**'));
    expect_truthy(mm.isMatch('a/b/c/d/', '**'));
    expect_truthy(mm.isMatch('a/b/c/d/', '**/**'));
    expect_truthy(mm.isMatch('a/b/c/d/', '**/b/**'));
    expect_truthy(mm.isMatch('a/b/c/d/', 'a/b/**'));
    expect_truthy(mm.isMatch('a/b/c/d/', 'a/b/**/'));
    expect_truthy(mm.isMatch('a/b/c/d/e.f', 'a/b/**/**/*.*'));
    expect_truthy(mm.isMatch('a/b/c/d/e.f', 'a/b/**/*.*'));
    expect_truthy(mm.isMatch('a/b/c/d/g/e.f', 'a/b/**/d/**/*.*'));
    expect_truthy(mm.isMatch('a/b/c/d/g/g/e.f', 'a/b/**/d/**/*.*'));
  });

  test('micromatch issue#58 - only match nested dirs when `**` is the only thing in a segment', () => {
    expect_truthy(!mm.isMatch('a/b/c', 'a/b**'));
    expect_truthy(!mm.isMatch('a/c/b', 'a/**b'));
  });

  test('micromatch issue#63 (dots)', () => {
    expect_truthy(!mm.isMatch('/aaa/.git/foo', '/aaa/**/*'));
    expect_truthy(!mm.isMatch('/aaa/bbb/.git', '/aaa/bbb/*'));
    expect_truthy(!mm.isMatch('/aaa/bbb/.git', '/aaa/bbb/**'));
    expect_truthy(!mm.isMatch('/aaa/bbb/ccc/.git', '/aaa/bbb/**'));
    expect_truthy(!mm.isMatch('aaa/bbb/.git', 'aaa/bbb/**'));
    expect_truthy(mm.isMatch('/aaa/.git/foo', '/aaa/**/*', { dot: true }));
    expect_truthy(mm.isMatch('/aaa/bbb/', '/aaa/bbb/**'));
    expect_truthy(mm.isMatch('/aaa/bbb/.git', '/aaa/bbb/*', { dot: true }));
    expect_truthy(mm.isMatch('/aaa/bbb/.git', '/aaa/bbb/**', { dot: true }));
    expect_truthy(mm.isMatch('/aaa/bbb/ccc/.git', '/aaa/bbb/**', { dot: true }));
    expect_truthy(mm.isMatch('/aaa/bbb/foo', '/aaa/bbb/**'));
    expect_truthy(mm.isMatch('aaa/bbb/.git', 'aaa/bbb/**', { dot: true }));
  });

  test('micromatch issue#79', () => {
    expect_truthy(mm.isMatch('a/foo.js', '**/foo.js'));
    expect_truthy(mm.isMatch('foo.js', '**/foo.js'));
    expect_truthy(mm.isMatch('a/foo.js', '**/foo.js', { dot: true }));
    expect_truthy(mm.isMatch('foo.js', '**/foo.js', { dot: true }));
  });
});
