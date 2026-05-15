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

describe('issue-related tests', () => {
  test('should match with braces (see picomatch/issues#8)', () => {
    expect_truthy(isMatch('directory/.test.txt', '{file.txt,directory/**/*}', { dot: true }));
    expect_truthy(isMatch('directory/test.txt', '{file.txt,directory/**/*}', { dot: true }));
    expect_truthy(!isMatch('directory/.test.txt', '{file.txt,directory/**/*}'));
    expect_truthy(isMatch('directory/test.txt', '{file.txt,directory/**/*}'));
  });

  test('should match Japanese characters (see micromatch/issues#127)', () => {
    expect_truthy(isMatch('フォルダ/aaa.js', 'フ*/**/*'));
    expect_truthy(isMatch('フォルダ/aaa.js', 'フォ*/**/*'));
    expect_truthy(isMatch('フォルダ/aaa.js', 'フォル*/**/*'));
    expect_truthy(isMatch('フォルダ/aaa.js', 'フ*ル*/**/*'));
    expect_truthy(isMatch('フォルダ/aaa.js', 'フォルダ/**/*'));
  });

  test('micromatch issue#15', () => {
    expect_truthy(isMatch('a/b-c/d/e/z.js', 'a/b-*/**/z.js'));
    expect_truthy(isMatch('z.js', 'z*'));
    expect_truthy(isMatch('z.js', '**/z*'));
    expect_truthy(isMatch('z.js', '**/z*.js'));
    expect_truthy(isMatch('z.js', '**/*.js'));
    expect_truthy(isMatch('foo', '**/foo'));
  });

  test('micromatch issue#23', () => {
    expect_truthy(!isMatch('zzjs', 'z*.js'));
    expect_truthy(!isMatch('zzjs', '*z.js'));
  });

  test('micromatch issue#24', () => {
    expect_truthy(!isMatch('a/b/c/d/', 'a/b/**/f'));
    expect_truthy(isMatch('a', 'a/**'));
    expect_truthy(isMatch('a', '**'));
    expect_truthy(isMatch('a/', '**'));
    expect_truthy(isMatch('a/b/c/d', '**'));
    expect_truthy(isMatch('a/b/c/d/', '**'));
    expect_truthy(isMatch('a/b/c/d/', '**/**'));
    expect_truthy(isMatch('a/b/c/d/', '**/b/**'));
    expect_truthy(isMatch('a/b/c/d/', 'a/b/**'));
    expect_truthy(isMatch('a/b/c/d/', 'a/b/**/'));
    expect_truthy(isMatch('a/b/c/d/e.f', 'a/b/**/**/*.*'));
    expect_truthy(isMatch('a/b/c/d/e.f', 'a/b/**/*.*'));
    expect_truthy(isMatch('a/b/c/d/g/e.f', 'a/b/**/d/**/*.*'));
    expect_truthy(isMatch('a/b/c/d/g/g/e.f', 'a/b/**/d/**/*.*'));
  });

  test('micromatch issue#58 - only match nested dirs when `**` is the only thing in a segment', () => {
    expect_truthy(!isMatch('a/b/c', 'a/b**'));
    expect_truthy(!isMatch('a/c/b', 'a/**b'));
  });

  test('micromatch issue#79', () => {
    expect_truthy(isMatch('a/foo.js', '**/foo.js'));
    expect_truthy(isMatch('foo.js', '**/foo.js'));
    expect_truthy(isMatch('a/foo.js', '**/foo.js', { dot: true }));
    expect_truthy(isMatch('foo.js', '**/foo.js', { dot: true }));
  });
});
