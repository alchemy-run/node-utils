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

describe('negation patterns - "!"', () => {
  test('should patterns with a leading "!" as negated/inverted globs', () => {
    expect_truthy(!isMatch('abc', '!*'));
    expect_truthy(!isMatch('abc', '!abc'));
    expect_truthy(!isMatch('bar.md', '*!.md'));
    expect_truthy(!isMatch('bar.md', 'foo!.md'));
    expect_truthy(!isMatch('foo!.md', '\\!*!*.md'));
    expect_truthy(!isMatch('foo!bar.md', '\\!*!*.md'));
    expect_truthy(isMatch('!foo!.md', '*!*.md'));
    expect_truthy(isMatch('!foo!.md', '\\!*!*.md'));
    expect_truthy(isMatch('abc', '!*foo'));
    expect_truthy(isMatch('abc', '!foo*'));
    expect_truthy(isMatch('abc', '!xyz'));
    expect_truthy(isMatch('ba!r.js', '*!*.*'));
    expect_truthy(isMatch('bar.md', '*.md'));
    expect_truthy(isMatch('foo!.md', '*!*.*'));
    expect_truthy(isMatch('foo!.md', '*!*.md'));
    expect_truthy(isMatch('foo!.md', '*!.md'));
    expect_truthy(isMatch('foo!.md', '*.md'));
    expect_truthy(isMatch('foo!.md', 'foo!.md'));
    expect_truthy(isMatch('foo!bar.md', '*!*.md'));
    expect_truthy(isMatch('foobar.md', '*b*.md'));
  });

  test('should treat non-leading "!" as literal characters', () => {
    expect_truthy(!isMatch('a', 'a!!b'));
    expect_truthy(!isMatch('aa', 'a!!b'));
    expect_truthy(!isMatch('a/b', 'a!!b'));
    expect_truthy(!isMatch('a!b', 'a!!b'));
    expect_truthy(isMatch('a!!b', 'a!!b'));
    expect_truthy(!isMatch('a/!!/b', 'a!!b'));
  });

  test('should support negation in globs that have no other special characters', () => {
    expect_truthy(!isMatch('a/b', '!a/b'));
    expect_truthy(isMatch('a', '!a/b'));
    expect_truthy(isMatch('a.b', '!a/b'));
    expect_truthy(isMatch('a/a', '!a/b'));
    expect_truthy(isMatch('a/c', '!a/b'));
    expect_truthy(isMatch('b/a', '!a/b'));
    expect_truthy(isMatch('b/b', '!a/b'));
    expect_truthy(isMatch('b/c', '!a/b'));
  });

  test('should support multiple leading ! to toggle negation', () => {
    expect_truthy(!isMatch('abc', '!abc'));
    expect_truthy(isMatch('abc',  '!!abc'));
    expect_truthy(!isMatch('abc', '!!!abc'));
    expect_truthy(isMatch('abc',  '!!!!abc'));
    expect_truthy(!isMatch('abc', '!!!!!abc'));
    expect_truthy(isMatch('abc',  '!!!!!!abc'));
    expect_truthy(!isMatch('abc', '!!!!!!!abc'));
    expect_truthy(isMatch('abc',  '!!!!!!!!abc'));
  });

  test('should support negation extglobs after leading !', () => {
    expect_truthy(!isMatch('abc', '!(abc)'));
    expect_truthy(isMatch('abc',  '!!(abc)'));
    expect_truthy(!isMatch('abc', '!!!(abc)'));
    expect_truthy(isMatch('abc',  '!!!!(abc)'));
    expect_truthy(!isMatch('abc', '!!!!!(abc)'));
    expect_truthy(isMatch('abc',  '!!!!!!(abc)'));
    expect_truthy(!isMatch('abc', '!!!!!!!(abc)'));
    expect_truthy(isMatch('abc',  '!!!!!!!!(abc)'));
  });

  test('should support negation with globs', () => {
    expect_truthy(!isMatch('a/a', '!(*/*)'));
    expect_truthy(!isMatch('a/b', '!(*/*)'));
    expect_truthy(!isMatch('a/c', '!(*/*)'));
    expect_truthy(!isMatch('b/a', '!(*/*)'));
    expect_truthy(!isMatch('b/b', '!(*/*)'));
    expect_truthy(!isMatch('b/c', '!(*/*)'));
    expect_truthy(!isMatch('a/b', '!(*/b)'));
    expect_truthy(!isMatch('b/b', '!(*/b)'));
    expect_truthy(!isMatch('a/b', '!(a/b)'));
    expect_truthy(!isMatch('a', '!*'));
    expect_truthy(!isMatch('a.b', '!*'));
    expect_truthy(!isMatch('a/a', '!*/*'));
    expect_truthy(!isMatch('a/b', '!*/*'));
    expect_truthy(!isMatch('a/c', '!*/*'));
    expect_truthy(!isMatch('b/a', '!*/*'));
    expect_truthy(!isMatch('b/b', '!*/*'));
    expect_truthy(!isMatch('b/c', '!*/*'));
    expect_truthy(!isMatch('a/b', '!*/b'));
    expect_truthy(!isMatch('b/b', '!*/b'));
    expect_truthy(!isMatch('a/c', '!*/c'));
    expect_truthy(!isMatch('a/c', '!*/c'));
    expect_truthy(!isMatch('b/c', '!*/c'));
    expect_truthy(!isMatch('b/c', '!*/c'));
    expect_truthy(!isMatch('bar', '!*a*'));
    expect_truthy(!isMatch('fab', '!*a*'));
    expect_truthy(!isMatch('a/a', '!a/(*)'));
    expect_truthy(!isMatch('a/b', '!a/(*)'));
    expect_truthy(!isMatch('a/c', '!a/(*)'));
    expect_truthy(!isMatch('a/b', '!a/(b)'));
    expect_truthy(!isMatch('a/a', '!a/*'));
    expect_truthy(!isMatch('a/b', '!a/*'));
    expect_truthy(!isMatch('a/c', '!a/*'));
    expect_truthy(!isMatch('fab', '!f*b'));
    expect_truthy(isMatch('a', '!(*/*)'));
    expect_truthy(isMatch('a.b', '!(*/*)'));
    expect_truthy(isMatch('a', '!(*/b)'));
    expect_truthy(isMatch('a.b', '!(*/b)'));
    expect_truthy(isMatch('a/a', '!(*/b)'));
    expect_truthy(isMatch('a/c', '!(*/b)'));
    expect_truthy(isMatch('b/a', '!(*/b)'));
    expect_truthy(isMatch('b/c', '!(*/b)'));
    expect_truthy(isMatch('a', '!(a/b)'));
    expect_truthy(isMatch('a.b', '!(a/b)'));
    expect_truthy(isMatch('a/a', '!(a/b)'));
    expect_truthy(isMatch('a/c', '!(a/b)'));
    expect_truthy(isMatch('b/a', '!(a/b)'));
    expect_truthy(isMatch('b/b', '!(a/b)'));
    expect_truthy(isMatch('b/c', '!(a/b)'));
    expect_truthy(isMatch('a/a', '!*'));
    expect_truthy(isMatch('a/b', '!*'));
    expect_truthy(isMatch('a/c', '!*'));
    expect_truthy(isMatch('b/a', '!*'));
    expect_truthy(isMatch('b/b', '!*'));
    expect_truthy(isMatch('b/c', '!*'));
    expect_truthy(isMatch('a', '!*/*'));
    expect_truthy(isMatch('a.b', '!*/*'));
    expect_truthy(isMatch('a', '!*/b'));
    expect_truthy(isMatch('a.b', '!*/b'));
    expect_truthy(isMatch('a/a', '!*/b'));
    expect_truthy(isMatch('a/c', '!*/b'));
    expect_truthy(isMatch('b/a', '!*/b'));
    expect_truthy(isMatch('b/c', '!*/b'));
    expect_truthy(isMatch('a', '!*/c'));
    expect_truthy(isMatch('a.b', '!*/c'));
    expect_truthy(isMatch('a/a', '!*/c'));
    expect_truthy(isMatch('a/b', '!*/c'));
    expect_truthy(isMatch('b/a', '!*/c'));
    expect_truthy(isMatch('b/b', '!*/c'));
    expect_truthy(isMatch('foo', '!*a*'));
    expect_truthy(isMatch('a', '!a/(*)'));
    expect_truthy(isMatch('a.b', '!a/(*)'));
    expect_truthy(isMatch('b/a', '!a/(*)'));
    expect_truthy(isMatch('b/b', '!a/(*)'));
    expect_truthy(isMatch('b/c', '!a/(*)'));
    expect_truthy(isMatch('a', '!a/(b)'));
    expect_truthy(isMatch('a.b', '!a/(b)'));
    expect_truthy(isMatch('a/a', '!a/(b)'));
    expect_truthy(isMatch('a/c', '!a/(b)'));
    expect_truthy(isMatch('b/a', '!a/(b)'));
    expect_truthy(isMatch('b/b', '!a/(b)'));
    expect_truthy(isMatch('b/c', '!a/(b)'));
    expect_truthy(isMatch('a', '!a/*'));
    expect_truthy(isMatch('a.b', '!a/*'));
    expect_truthy(isMatch('b/a', '!a/*'));
    expect_truthy(isMatch('b/b', '!a/*'));
    expect_truthy(isMatch('b/c', '!a/*'));
    expect_truthy(isMatch('bar', '!f*b'));
    expect_truthy(isMatch('foo', '!f*b'));
  });

  test('should negate files with extensions', () => {
    expect_truthy(!isMatch('.md', '!.md'));
    expect_truthy(isMatch('a.js', '!**/*.md'));
    expect_truthy(!isMatch('b.md', '!**/*.md'));
    expect_truthy(isMatch('c.txt', '!**/*.md'));
    expect_truthy(isMatch('a.js', '!*.md'));
    expect_truthy(!isMatch('b.md', '!*.md'));
    expect_truthy(isMatch('c.txt', '!*.md'));
    expect_truthy(!isMatch('abc.md', '!*.md'));
    expect_truthy(isMatch('abc.txt', '!*.md'));
    expect_truthy(!isMatch('foo.md', '!*.md'));
    expect_truthy(isMatch('foo.md', '!.md'));
  });

  test('should support negated single stars', () => {
    expect_truthy(isMatch('a.js', '!*.md'));
    expect_truthy(isMatch('b.txt', '!*.md'));
    expect_truthy(!isMatch('c.md', '!*.md'));
    expect_truthy(!isMatch('a/a/a.js', '!a/*/a.js'));
    expect_truthy(!isMatch('a/b/a.js', '!a/*/a.js'));
    expect_truthy(!isMatch('a/c/a.js', '!a/*/a.js'));
    expect_truthy(!isMatch('a/a/a/a.js', '!a/*/*/a.js'));
    expect_truthy(isMatch('b/a/b/a.js', '!a/*/*/a.js'));
    expect_truthy(isMatch('c/a/c/a.js', '!a/*/*/a.js'));
    expect_truthy(!isMatch('a/a.txt', '!a/a*.txt'));
    expect_truthy(isMatch('a/b.txt', '!a/a*.txt'));
    expect_truthy(isMatch('a/c.txt', '!a/a*.txt'));
    expect_truthy(!isMatch('a.a.txt', '!a.a*.txt'));
    expect_truthy(isMatch('a.b.txt', '!a.a*.txt'));
    expect_truthy(isMatch('a.c.txt', '!a.a*.txt'));
    expect_truthy(!isMatch('a/a.txt', '!a/*.txt'));
    expect_truthy(!isMatch('a/b.txt', '!a/*.txt'));
    expect_truthy(!isMatch('a/c.txt', '!a/*.txt'));
  });

  test('should support negated globstars (multiple stars)', () => {
    expect_truthy(isMatch('a.js', '!*.md'));
    expect_truthy(isMatch('b.txt', '!*.md'));
    expect_truthy(!isMatch('c.md', '!*.md'));
    expect_truthy(!isMatch('a/a/a.js', '!**/a.js'));
    expect_truthy(!isMatch('a/b/a.js', '!**/a.js'));
    expect_truthy(!isMatch('a/c/a.js', '!**/a.js'));
    expect_truthy(isMatch('a/a/b.js', '!**/a.js'));
    expect_truthy(!isMatch('a/a/a/a.js', '!a/**/a.js'));
    expect_truthy(isMatch('b/a/b/a.js', '!a/**/a.js'));
    expect_truthy(isMatch('c/a/c/a.js', '!a/**/a.js'));
    expect_truthy(isMatch('a/b.js', '!**/*.md'));
    expect_truthy(isMatch('a.js', '!**/*.md'));
    expect_truthy(!isMatch('a/b.md', '!**/*.md'));
    expect_truthy(!isMatch('a.md', '!**/*.md'));
    expect_truthy(!isMatch('a/b.js', '**/*.md'));
    expect_truthy(!isMatch('a.js', '**/*.md'));
    expect_truthy(isMatch('a/b.md', '**/*.md'));
    expect_truthy(isMatch('a.md', '**/*.md'));
    expect_truthy(isMatch('a/b.js', '!**/*.md'));
    expect_truthy(isMatch('a.js', '!**/*.md'));
    expect_truthy(!isMatch('a/b.md', '!**/*.md'));
    expect_truthy(!isMatch('a.md', '!**/*.md'));
    expect_truthy(isMatch('a/b.js', '!*.md'));
    expect_truthy(isMatch('a.js', '!*.md'));
    expect_truthy(isMatch('a/b.md', '!*.md'));
    expect_truthy(!isMatch('a.md', '!*.md'));
    expect_truthy(isMatch('a.js', '!**/*.md'));
    expect_truthy(!isMatch('b.md', '!**/*.md'));
    expect_truthy(isMatch('c.txt', '!**/*.md'));
  });

  test('should not negate when inside quoted strings', () => {
    expect_truthy(!isMatch('foo.md', '"!*".md'));
    expect_truthy(isMatch('"!*".md', '"!*".md'));
    expect_truthy(isMatch('!*.md', '"!*".md'));

    expect_truthy(!isMatch('foo.md', '"!*".md', { keepQuotes: true }));
    expect_truthy(isMatch('"!*".md', '"!*".md', { keepQuotes: true }));
    expect_truthy(!isMatch('!*.md', '"!*".md', { keepQuotes: true }));

    expect_truthy(!isMatch('foo.md', '"**".md'));
    expect_truthy(isMatch('"**".md', '"**".md'));
    expect_truthy(isMatch('**.md', '"**".md'));

    expect_truthy(!isMatch('foo.md', '"**".md', { keepQuotes: true }));
    expect_truthy(isMatch('"**".md', '"**".md', { keepQuotes: true }));
    expect_truthy(!isMatch('**.md', '"**".md', { keepQuotes: true }));
  });

  test('should negate dotfiles', () => {
    expect_truthy(!isMatch('.dotfile.md', '!.*.md'));
    expect_truthy(isMatch('.dotfile.md', '!*.md'));
    expect_truthy(isMatch('.dotfile.txt', '!*.md'));
    expect_truthy(isMatch('.dotfile.txt', '!*.md'));
    expect_truthy(isMatch('a/b/.dotfile', '!*.md'));
    expect_truthy(!isMatch('.gitignore', '!.gitignore'));
    expect_truthy(isMatch('a', '!.gitignore'));
    expect_truthy(isMatch('b', '!.gitignore'));
  });

  test('should not match slashes with a single star', () => {
    expect_truthy(isMatch('foo/bar.md', '!*.md'));
    expect_truthy(!isMatch('foo.md', '!*.md'));
  });

  test('should match nested directories with globstars', () => {
    expect_truthy(!isMatch('a', '!a/**'));
    expect_truthy(!isMatch('a/', '!a/**'));
    expect_truthy(!isMatch('a/b', '!a/**'));
    expect_truthy(!isMatch('a/b/c', '!a/**'));
    expect_truthy(isMatch('b', '!a/**'));
    expect_truthy(isMatch('b/c', '!a/**'));

    expect_truthy(isMatch('foo', '!f*b'));
    expect_truthy(isMatch('bar', '!f*b'));
    expect_truthy(!isMatch('fab', '!f*b'));
  });
});
