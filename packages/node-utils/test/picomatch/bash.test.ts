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

// $echo a/{1..3}/b
describe('from the Bash 4.3 spec/unit tests', () => {
  test('should handle "regular globbing"', () => {
    expect_truthy(!isMatch('*', 'a*'));
    expect_truthy(!isMatch('**', 'a*'));
    expect_truthy(!isMatch('\\*', 'a*'));
    expect_truthy(!isMatch('a/*', 'a*'));
    expect_truthy(!isMatch('b', 'a*'));
    expect_truthy(!isMatch('bc', 'a*'));
    expect_truthy(!isMatch('bcd', 'a*'));
    expect_truthy(!isMatch('bdir/', 'a*'));
    expect_truthy(!isMatch('Beware', 'a*'));
    expect_truthy(isMatch('a', 'a*'));
    expect_truthy(isMatch('ab', 'a*'));
    expect_truthy(isMatch('abc', 'a*'));

    expect_truthy(!isMatch('*', '\\a*'));
    expect_truthy(!isMatch('**', '\\a*'));
    expect_truthy(!isMatch('\\*', '\\a*'));

    expect_truthy(isMatch('a', '\\a*'));
    expect_truthy(!isMatch('a/*', '\\a*'));
    expect_truthy(isMatch('abc', '\\a*'));
    expect_truthy(isMatch('abd', '\\a*'));
    expect_truthy(isMatch('abe', '\\a*'));
    expect_truthy(!isMatch('b', '\\a*'));
    expect_truthy(!isMatch('bb', '\\a*'));
    expect_truthy(!isMatch('bcd', '\\a*'));
    expect_truthy(!isMatch('bdir/', '\\a*'));
    expect_truthy(!isMatch('Beware', '\\a*'));
    expect_truthy(!isMatch('c', '\\a*'));
    expect_truthy(!isMatch('ca', '\\a*'));
    expect_truthy(!isMatch('cb', '\\a*'));
    expect_truthy(!isMatch('d', '\\a*'));
    expect_truthy(!isMatch('dd', '\\a*'));
    expect_truthy(!isMatch('de', '\\a*'));
  });

  test('should match directories', () => {
    expect_truthy(!isMatch('*', 'b*/'));
    expect_truthy(!isMatch('**', 'b*/'));
    expect_truthy(!isMatch('\\*', 'b*/'));
    expect_truthy(!isMatch('a', 'b*/'));
    expect_truthy(!isMatch('a/*', 'b*/'));
    expect_truthy(!isMatch('abc', 'b*/'));
    expect_truthy(!isMatch('abd', 'b*/'));
    expect_truthy(!isMatch('abe', 'b*/'));
    expect_truthy(!isMatch('b', 'b*/'));
    expect_truthy(!isMatch('bb', 'b*/'));
    expect_truthy(!isMatch('bcd', 'b*/'));
    expect_truthy(isMatch('bdir/', 'b*/'));
    expect_truthy(!isMatch('Beware', 'b*/'));
    expect_truthy(!isMatch('c', 'b*/'));
    expect_truthy(!isMatch('ca', 'b*/'));
    expect_truthy(!isMatch('cb', 'b*/'));
    expect_truthy(!isMatch('d', 'b*/'));
    expect_truthy(!isMatch('dd', 'b*/'));
    expect_truthy(!isMatch('de', 'b*/'));
  });

  test('should use escaped characters as literals', () => {
    expect_truthy(!isMatch('*', '\\^'));
    expect_truthy(!isMatch('**', '\\^'));
    expect_truthy(!isMatch('\\*', '\\^'));
    expect_truthy(!isMatch('a', '\\^'));
    expect_truthy(!isMatch('a/*', '\\^'));
    expect_truthy(!isMatch('abc', '\\^'));
    expect_truthy(!isMatch('abd', '\\^'));
    expect_truthy(!isMatch('abe', '\\^'));
    expect_truthy(!isMatch('b', '\\^'));
    expect_truthy(!isMatch('bb', '\\^'));
    expect_truthy(!isMatch('bcd', '\\^'));
    expect_truthy(!isMatch('bdir/', '\\^'));
    expect_truthy(!isMatch('Beware', '\\^'));
    expect_truthy(!isMatch('c', '\\^'));
    expect_truthy(!isMatch('ca', '\\^'));
    expect_truthy(!isMatch('cb', '\\^'));
    expect_truthy(!isMatch('d', '\\^'));
    expect_truthy(!isMatch('dd', '\\^'));
    expect_truthy(!isMatch('de', '\\^'));

    expect_truthy(isMatch('*', '\\*'));
    expect_truthy(isMatch('\\*', '\\*'));
    expect_truthy(!isMatch('**', '\\*'));
    expect_truthy(!isMatch('a', '\\*'));
    expect_truthy(!isMatch('a/*', '\\*'));
    expect_truthy(!isMatch('abc', '\\*'));
    expect_truthy(!isMatch('abd', '\\*'));
    expect_truthy(!isMatch('abe', '\\*'));
    expect_truthy(!isMatch('b', '\\*'));
    expect_truthy(!isMatch('bb', '\\*'));
    expect_truthy(!isMatch('bcd', '\\*'));
    expect_truthy(!isMatch('bdir/', '\\*'));
    expect_truthy(!isMatch('Beware', '\\*'));
    expect_truthy(!isMatch('c', '\\*'));
    expect_truthy(!isMatch('ca', '\\*'));
    expect_truthy(!isMatch('cb', '\\*'));
    expect_truthy(!isMatch('d', '\\*'));
    expect_truthy(!isMatch('dd', '\\*'));
    expect_truthy(!isMatch('de', '\\*'));

    expect_truthy(!isMatch('*', 'a\\*'));
    expect_truthy(!isMatch('**', 'a\\*'));
    expect_truthy(!isMatch('\\*', 'a\\*'));
    expect_truthy(!isMatch('a', 'a\\*'));
    expect_truthy(!isMatch('a/*', 'a\\*'));
    expect_truthy(!isMatch('abc', 'a\\*'));
    expect_truthy(!isMatch('abd', 'a\\*'));
    expect_truthy(!isMatch('abe', 'a\\*'));
    expect_truthy(!isMatch('b', 'a\\*'));
    expect_truthy(!isMatch('bb', 'a\\*'));
    expect_truthy(!isMatch('bcd', 'a\\*'));
    expect_truthy(!isMatch('bdir/', 'a\\*'));
    expect_truthy(!isMatch('Beware', 'a\\*'));
    expect_truthy(!isMatch('c', 'a\\*'));
    expect_truthy(!isMatch('ca', 'a\\*'));
    expect_truthy(!isMatch('cb', 'a\\*'));
    expect_truthy(!isMatch('d', 'a\\*'));
    expect_truthy(!isMatch('dd', 'a\\*'));
    expect_truthy(!isMatch('de', 'a\\*'));

    expect_truthy(isMatch('aqa', '*q*'));
    expect_truthy(isMatch('aaqaa', '*q*'));
    expect_truthy(!isMatch('*', '*q*'));
    expect_truthy(!isMatch('**', '*q*'));
    expect_truthy(!isMatch('\\*', '*q*'));
    expect_truthy(!isMatch('a', '*q*'));
    expect_truthy(!isMatch('a/*', '*q*'));
    expect_truthy(!isMatch('abc', '*q*'));
    expect_truthy(!isMatch('abd', '*q*'));
    expect_truthy(!isMatch('abe', '*q*'));
    expect_truthy(!isMatch('b', '*q*'));
    expect_truthy(!isMatch('bb', '*q*'));
    expect_truthy(!isMatch('bcd', '*q*'));
    expect_truthy(!isMatch('bdir/', '*q*'));
    expect_truthy(!isMatch('Beware', '*q*'));
    expect_truthy(!isMatch('c', '*q*'));
    expect_truthy(!isMatch('ca', '*q*'));
    expect_truthy(!isMatch('cb', '*q*'));
    expect_truthy(!isMatch('d', '*q*'));
    expect_truthy(!isMatch('dd', '*q*'));
    expect_truthy(!isMatch('de', '*q*'));

    expect_truthy(isMatch('*', '\\**'));
    expect_truthy(isMatch('**', '\\**'));
    expect_truthy(!isMatch('\\*', '\\**'));
    expect_truthy(!isMatch('a', '\\**'));
    expect_truthy(!isMatch('a/*', '\\**'));
    expect_truthy(!isMatch('abc', '\\**'));
    expect_truthy(!isMatch('abd', '\\**'));
    expect_truthy(!isMatch('abe', '\\**'));
    expect_truthy(!isMatch('b', '\\**'));
    expect_truthy(!isMatch('bb', '\\**'));
    expect_truthy(!isMatch('bcd', '\\**'));
    expect_truthy(!isMatch('bdir/', '\\**'));
    expect_truthy(!isMatch('Beware', '\\**'));
    expect_truthy(!isMatch('c', '\\**'));
    expect_truthy(!isMatch('ca', '\\**'));
    expect_truthy(!isMatch('cb', '\\**'));
    expect_truthy(!isMatch('d', '\\**'));
    expect_truthy(!isMatch('dd', '\\**'));
    expect_truthy(!isMatch('de', '\\**'));
  });

  test('should work for quoted characters', () => {
    expect_truthy(!isMatch('*', '"***"'));
    expect_truthy(!isMatch('**', '"***"'));
    expect_truthy(!isMatch('\\*', '"***"'));
    expect_truthy(!isMatch('a', '"***"'));
    expect_truthy(!isMatch('a/*', '"***"'));
    expect_truthy(!isMatch('abc', '"***"'));
    expect_truthy(!isMatch('abd', '"***"'));
    expect_truthy(!isMatch('abe', '"***"'));
    expect_truthy(!isMatch('b', '"***"'));
    expect_truthy(!isMatch('bb', '"***"'));
    expect_truthy(!isMatch('bcd', '"***"'));
    expect_truthy(!isMatch('bdir/', '"***"'));
    expect_truthy(!isMatch('Beware', '"***"'));
    expect_truthy(!isMatch('c', '"***"'));
    expect_truthy(!isMatch('ca', '"***"'));
    expect_truthy(!isMatch('cb', '"***"'));
    expect_truthy(!isMatch('d', '"***"'));
    expect_truthy(!isMatch('dd', '"***"'));
    expect_truthy(!isMatch('de', '"***"'));
    expect_truthy(isMatch('***', '"***"'));

    expect_truthy(!isMatch('*', "'***'"));
    expect_truthy(!isMatch('**', "'***'"));
    expect_truthy(!isMatch('\\*', "'***'"));
    expect_truthy(!isMatch('a', "'***'"));
    expect_truthy(!isMatch('a/*', "'***'"));
    expect_truthy(!isMatch('abc', "'***'"));
    expect_truthy(!isMatch('abd', "'***'"));
    expect_truthy(!isMatch('abe', "'***'"));
    expect_truthy(!isMatch('b', "'***'"));
    expect_truthy(!isMatch('bb', "'***'"));
    expect_truthy(!isMatch('bcd', "'***'"));
    expect_truthy(!isMatch('bdir/', "'***'"));
    expect_truthy(!isMatch('Beware', "'***'"));
    expect_truthy(!isMatch('c', "'***'"));
    expect_truthy(!isMatch('ca', "'***'"));
    expect_truthy(!isMatch('cb', "'***'"));
    expect_truthy(!isMatch('d', "'***'"));
    expect_truthy(!isMatch('dd', "'***'"));
    expect_truthy(!isMatch('de', "'***'"));
    expect_truthy(isMatch('\'***\'', "'***'"));

    expect_truthy(!isMatch('*', '"***"'));
    expect_truthy(!isMatch('**', '"***"'));
    expect_truthy(!isMatch('\\*', '"***"'));
    expect_truthy(!isMatch('a', '"***"'));
    expect_truthy(!isMatch('a/*', '"***"'));
    expect_truthy(!isMatch('abc', '"***"'));
    expect_truthy(!isMatch('abd', '"***"'));
    expect_truthy(!isMatch('abe', '"***"'));
    expect_truthy(!isMatch('b', '"***"'));
    expect_truthy(!isMatch('bb', '"***"'));
    expect_truthy(!isMatch('bcd', '"***"'));
    expect_truthy(!isMatch('bdir/', '"***"'));
    expect_truthy(!isMatch('Beware', '"***"'));
    expect_truthy(!isMatch('c', '"***"'));
    expect_truthy(!isMatch('ca', '"***"'));
    expect_truthy(!isMatch('cb', '"***"'));
    expect_truthy(!isMatch('d', '"***"'));
    expect_truthy(!isMatch('dd', '"***"'));
    expect_truthy(!isMatch('de', '"***"'));

    expect_truthy(isMatch('*', '"*"*'));
    expect_truthy(isMatch('**', '"*"*'));
    expect_truthy(!isMatch('\\*', '"*"*'));
    expect_truthy(!isMatch('a', '"*"*'));
    expect_truthy(!isMatch('a/*', '"*"*'));
    expect_truthy(!isMatch('abc', '"*"*'));
    expect_truthy(!isMatch('abd', '"*"*'));
    expect_truthy(!isMatch('abe', '"*"*'));
    expect_truthy(!isMatch('b', '"*"*'));
    expect_truthy(!isMatch('bb', '"*"*'));
    expect_truthy(!isMatch('bcd', '"*"*'));
    expect_truthy(!isMatch('bdir/', '"*"*'));
    expect_truthy(!isMatch('Beware', '"*"*'));
    expect_truthy(!isMatch('c', '"*"*'));
    expect_truthy(!isMatch('ca', '"*"*'));
    expect_truthy(!isMatch('cb', '"*"*'));
    expect_truthy(!isMatch('d', '"*"*'));
    expect_truthy(!isMatch('dd', '"*"*'));
    expect_truthy(!isMatch('de', '"*"*'));
  });

  test('should match escaped quotes', () => {
    expect_truthy(!isMatch('*', '\\"**\\"'));
    expect_truthy(!isMatch('**', '\\"**\\"'));
    expect_truthy(!isMatch('\\*', '\\"**\\"'));
    expect_truthy(!isMatch('a', '\\"**\\"'));
    expect_truthy(!isMatch('a/*', '\\"**\\"'));
    expect_truthy(!isMatch('abc', '\\"**\\"'));
    expect_truthy(!isMatch('abd', '\\"**\\"'));
    expect_truthy(!isMatch('abe', '\\"**\\"'));
    expect_truthy(!isMatch('b', '\\"**\\"'));
    expect_truthy(!isMatch('bb', '\\"**\\"'));
    expect_truthy(!isMatch('bcd', '\\"**\\"'));
    expect_truthy(!isMatch('bdir/', '\\"**\\"'));
    expect_truthy(!isMatch('Beware', '\\"**\\"'));
    expect_truthy(!isMatch('c', '\\"**\\"'));
    expect_truthy(!isMatch('ca', '\\"**\\"'));
    expect_truthy(!isMatch('cb', '\\"**\\"'));
    expect_truthy(!isMatch('d', '\\"**\\"'));
    expect_truthy(!isMatch('dd', '\\"**\\"'));
    expect_truthy(!isMatch('de', '\\"**\\"'));
    expect_truthy(isMatch('"**"', '\\"**\\"'));

    expect_truthy(!isMatch('*', 'foo/\\"**\\"/bar'));
    expect_truthy(!isMatch('**', 'foo/\\"**\\"/bar'));
    expect_truthy(!isMatch('\\*', 'foo/\\"**\\"/bar'));
    expect_truthy(!isMatch('a', 'foo/\\"**\\"/bar'));
    expect_truthy(!isMatch('a/*', 'foo/\\"**\\"/bar'));
    expect_truthy(!isMatch('abc', 'foo/\\"**\\"/bar'));
    expect_truthy(!isMatch('abd', 'foo/\\"**\\"/bar'));
    expect_truthy(!isMatch('abe', 'foo/\\"**\\"/bar'));
    expect_truthy(!isMatch('b', 'foo/\\"**\\"/bar'));
    expect_truthy(!isMatch('bb', 'foo/\\"**\\"/bar'));
    expect_truthy(!isMatch('bcd', 'foo/\\"**\\"/bar'));
    expect_truthy(!isMatch('bdir/', 'foo/\\"**\\"/bar'));
    expect_truthy(!isMatch('Beware', 'foo/\\"**\\"/bar'));
    expect_truthy(!isMatch('c', 'foo/\\"**\\"/bar'));
    expect_truthy(!isMatch('ca', 'foo/\\"**\\"/bar'));
    expect_truthy(!isMatch('cb', 'foo/\\"**\\"/bar'));
    expect_truthy(!isMatch('d', 'foo/\\"**\\"/bar'));
    expect_truthy(!isMatch('dd', 'foo/\\"**\\"/bar'));
    expect_truthy(!isMatch('de', 'foo/\\"**\\"/bar'));
    expect_truthy(isMatch('foo/"**"/bar', 'foo/\\"**\\"/bar'));

    expect_truthy(!isMatch('*', 'foo/\\"*\\"/bar'));
    expect_truthy(!isMatch('**', 'foo/\\"*\\"/bar'));
    expect_truthy(!isMatch('\\*', 'foo/\\"*\\"/bar'));
    expect_truthy(!isMatch('a', 'foo/\\"*\\"/bar'));
    expect_truthy(!isMatch('a/*', 'foo/\\"*\\"/bar'));
    expect_truthy(!isMatch('abc', 'foo/\\"*\\"/bar'));
    expect_truthy(!isMatch('abd', 'foo/\\"*\\"/bar'));
    expect_truthy(!isMatch('abe', 'foo/\\"*\\"/bar'));
    expect_truthy(!isMatch('b', 'foo/\\"*\\"/bar'));
    expect_truthy(!isMatch('bb', 'foo/\\"*\\"/bar'));
    expect_truthy(!isMatch('bcd', 'foo/\\"*\\"/bar'));
    expect_truthy(!isMatch('bdir/', 'foo/\\"*\\"/bar'));
    expect_truthy(!isMatch('Beware', 'foo/\\"*\\"/bar'));
    expect_truthy(!isMatch('c', 'foo/\\"*\\"/bar'));
    expect_truthy(!isMatch('ca', 'foo/\\"*\\"/bar'));
    expect_truthy(!isMatch('cb', 'foo/\\"*\\"/bar'));
    expect_truthy(!isMatch('d', 'foo/\\"*\\"/bar'));
    expect_truthy(!isMatch('dd', 'foo/\\"*\\"/bar'));
    expect_truthy(!isMatch('de', 'foo/\\"*\\"/bar'));
    expect_truthy(isMatch('foo/"*"/bar', 'foo/\\"*\\"/bar'));
    expect_truthy(isMatch('foo/"a"/bar', 'foo/\\"*\\"/bar'));
    expect_truthy(isMatch('foo/"b"/bar', 'foo/\\"*\\"/bar'));
    expect_truthy(isMatch('foo/"c"/bar', 'foo/\\"*\\"/bar'));
    expect_truthy(!isMatch("foo/'*'/bar", 'foo/\\"*\\"/bar'));
    expect_truthy(!isMatch("foo/'a'/bar", 'foo/\\"*\\"/bar'));
    expect_truthy(!isMatch("foo/'b'/bar", 'foo/\\"*\\"/bar'));
    expect_truthy(!isMatch("foo/'c'/bar", 'foo/\\"*\\"/bar'));

    expect_truthy(!isMatch('*', 'foo/"*"/bar'));
    expect_truthy(!isMatch('**', 'foo/"*"/bar'));
    expect_truthy(!isMatch('\\*', 'foo/"*"/bar'));
    expect_truthy(!isMatch('a', 'foo/"*"/bar'));
    expect_truthy(!isMatch('a/*', 'foo/"*"/bar'));
    expect_truthy(!isMatch('abc', 'foo/"*"/bar'));
    expect_truthy(!isMatch('abd', 'foo/"*"/bar'));
    expect_truthy(!isMatch('abe', 'foo/"*"/bar'));
    expect_truthy(!isMatch('b', 'foo/"*"/bar'));
    expect_truthy(!isMatch('bb', 'foo/"*"/bar'));
    expect_truthy(!isMatch('bcd', 'foo/"*"/bar'));
    expect_truthy(!isMatch('bdir/', 'foo/"*"/bar'));
    expect_truthy(!isMatch('Beware', 'foo/"*"/bar'));
    expect_truthy(!isMatch('c', 'foo/"*"/bar'));
    expect_truthy(!isMatch('ca', 'foo/"*"/bar'));
    expect_truthy(!isMatch('cb', 'foo/"*"/bar'));
    expect_truthy(!isMatch('d', 'foo/"*"/bar'));
    expect_truthy(!isMatch('dd', 'foo/"*"/bar'));
    expect_truthy(!isMatch('de', 'foo/"*"/bar'));
    expect_truthy(isMatch('foo/*/bar', 'foo/"*"/bar'));
    expect_truthy(isMatch('foo/"*"/bar', 'foo/"*"/bar'));
    expect_truthy(!isMatch('foo/"a"/bar', 'foo/"*"/bar'));
    expect_truthy(!isMatch('foo/"b"/bar', 'foo/"*"/bar'));
    expect_truthy(!isMatch('foo/"c"/bar', 'foo/"*"/bar'));
    expect_truthy(!isMatch("foo/'*'/bar", 'foo/"*"/bar'));
    expect_truthy(!isMatch("foo/'a'/bar", 'foo/"*"/bar'));
    expect_truthy(!isMatch("foo/'b'/bar", 'foo/"*"/bar'));
    expect_truthy(!isMatch("foo/'c'/bar", 'foo/"*"/bar'));

    expect_truthy(!isMatch('*', "\\'**\\'"));
    expect_truthy(!isMatch('**', "\\'**\\'"));
    expect_truthy(!isMatch('\\*', "\\'**\\'"));
    expect_truthy(!isMatch('a', "\\'**\\'"));
    expect_truthy(!isMatch('a/*', "\\'**\\'"));
    expect_truthy(!isMatch('abc', "\\'**\\'"));
    expect_truthy(!isMatch('abd', "\\'**\\'"));
    expect_truthy(!isMatch('abe', "\\'**\\'"));
    expect_truthy(!isMatch('b', "\\'**\\'"));
    expect_truthy(!isMatch('bb', "\\'**\\'"));
    expect_truthy(!isMatch('bcd', "\\'**\\'"));
    expect_truthy(!isMatch('bdir/', "\\'**\\'"));
    expect_truthy(!isMatch('Beware', "\\'**\\'"));
    expect_truthy(!isMatch('c', "\\'**\\'"));
    expect_truthy(!isMatch('ca', "\\'**\\'"));
    expect_truthy(!isMatch('cb', "\\'**\\'"));
    expect_truthy(!isMatch('d', "\\'**\\'"));
    expect_truthy(!isMatch('dd', "\\'**\\'"));
    expect_truthy(!isMatch('de', "\\'**\\'"));
    expect_truthy(isMatch("'**'", "\\'**\\'"));
  });

  test("Pattern from Larry Wall's Configure that caused bash to blow up:", () => {
    expect_truthy(!isMatch('*', '[a-c]b*'));
    expect_truthy(!isMatch('**', '[a-c]b*'));
    expect_truthy(!isMatch('\\*', '[a-c]b*'));
    expect_truthy(!isMatch('a', '[a-c]b*'));
    expect_truthy(!isMatch('a/*', '[a-c]b*'));
    expect_truthy(isMatch('abc', '[a-c]b*'));
    expect_truthy(isMatch('abd', '[a-c]b*'));
    expect_truthy(isMatch('abe', '[a-c]b*'));
    expect_truthy(!isMatch('b', '[a-c]b*'));
    expect_truthy(isMatch('bb', '[a-c]b*'));
    expect_truthy(!isMatch('bcd', '[a-c]b*'));
    expect_truthy(!isMatch('bdir/', '[a-c]b*'));
    expect_truthy(!isMatch('Beware', '[a-c]b*'));
    expect_truthy(!isMatch('c', '[a-c]b*'));
    expect_truthy(!isMatch('ca', '[a-c]b*'));
    expect_truthy(isMatch('cb', '[a-c]b*'));
    expect_truthy(!isMatch('d', '[a-c]b*'));
    expect_truthy(!isMatch('dd', '[a-c]b*'));
    expect_truthy(!isMatch('de', '[a-c]b*'));
  });

  test('should support character classes', () => {
    expect_truthy(!isMatch('*', 'a*[^c]'));
    expect_truthy(!isMatch('**', 'a*[^c]'));
    expect_truthy(!isMatch('\\*', 'a*[^c]'));
    expect_truthy(!isMatch('a', 'a*[^c]'));
    expect_truthy(!isMatch('a/*', 'a*[^c]'));
    expect_truthy(!isMatch('abc', 'a*[^c]'));
    expect_truthy(isMatch('abd', 'a*[^c]'));
    expect_truthy(isMatch('abe', 'a*[^c]'));
    expect_truthy(!isMatch('b', 'a*[^c]'));
    expect_truthy(!isMatch('bb', 'a*[^c]'));
    expect_truthy(!isMatch('bcd', 'a*[^c]'));
    expect_truthy(!isMatch('bdir/', 'a*[^c]'));
    expect_truthy(!isMatch('Beware', 'a*[^c]'));
    expect_truthy(!isMatch('c', 'a*[^c]'));
    expect_truthy(!isMatch('ca', 'a*[^c]'));
    expect_truthy(!isMatch('cb', 'a*[^c]'));
    expect_truthy(!isMatch('d', 'a*[^c]'));
    expect_truthy(!isMatch('dd', 'a*[^c]'));
    expect_truthy(!isMatch('de', 'a*[^c]'));
    expect_truthy(!isMatch('baz', 'a*[^c]'));
    expect_truthy(!isMatch('bzz', 'a*[^c]'));
    expect_truthy(!isMatch('BZZ', 'a*[^c]'));
    expect_truthy(!isMatch('beware', 'a*[^c]'));
    expect_truthy(!isMatch('BewAre', 'a*[^c]'));

    expect_truthy(isMatch('a-b', 'a[X-]b'));
    expect_truthy(isMatch('aXb', 'a[X-]b'));

    expect_truthy(!isMatch('*', '[a-y]*[^c]'));
    expect_truthy(isMatch('a*', '[a-y]*[^c]', { bash: true }));
    expect_truthy(!isMatch('**', '[a-y]*[^c]'));
    expect_truthy(!isMatch('\\*', '[a-y]*[^c]'));
    expect_truthy(!isMatch('a', '[a-y]*[^c]'));
    expect_truthy(isMatch('a123b', '[a-y]*[^c]', { bash: true }));
    expect_truthy(!isMatch('a123c', '[a-y]*[^c]', { bash: true }));
    expect_truthy(isMatch('ab', '[a-y]*[^c]', { bash: true }));
    expect_truthy(!isMatch('a/*', '[a-y]*[^c]'));
    expect_truthy(!isMatch('abc', '[a-y]*[^c]'));
    expect_truthy(isMatch('abd', '[a-y]*[^c]'));
    expect_truthy(isMatch('abe', '[a-y]*[^c]'));
    expect_truthy(!isMatch('b', '[a-y]*[^c]'));
    expect_truthy(isMatch('bd', '[a-y]*[^c]', { bash: true }));
    expect_truthy(isMatch('bb', '[a-y]*[^c]'));
    expect_truthy(isMatch('bcd', '[a-y]*[^c]'));
    expect_truthy(isMatch('bdir/', '[a-y]*[^c]'));
    expect_truthy(!isMatch('Beware', '[a-y]*[^c]'));
    expect_truthy(!isMatch('c', '[a-y]*[^c]'));
    expect_truthy(isMatch('ca', '[a-y]*[^c]'));
    expect_truthy(isMatch('cb', '[a-y]*[^c]'));
    expect_truthy(!isMatch('d', '[a-y]*[^c]'));
    expect_truthy(isMatch('dd', '[a-y]*[^c]'));
    expect_truthy(isMatch('dd', '[a-y]*[^c]', { regex: true }));
    expect_truthy(isMatch('dd', '[a-y]*[^c]'));
    expect_truthy(isMatch('de', '[a-y]*[^c]'));
    expect_truthy(isMatch('baz', '[a-y]*[^c]'));
    expect_truthy(isMatch('bzz', '[a-y]*[^c]'));
    expect_truthy(isMatch('bzz', '[a-y]*[^c]'));
    expect_truthy(!isMatch('bzz', '[a-y]*[^c]', { regex: true }));
    expect_truthy(!isMatch('BZZ', '[a-y]*[^c]'));
    expect_truthy(isMatch('beware', '[a-y]*[^c]'));
    expect_truthy(!isMatch('BewAre', '[a-y]*[^c]'));

    expect_truthy(isMatch('a*b/ooo', 'a\\*b/*'));
    expect_truthy(isMatch('a*b/ooo', 'a\\*?/*'));

    expect_truthy(!isMatch('*', 'a[b]c'));
    expect_truthy(!isMatch('**', 'a[b]c'));
    expect_truthy(!isMatch('\\*', 'a[b]c'));
    expect_truthy(!isMatch('a', 'a[b]c'));
    expect_truthy(!isMatch('a/*', 'a[b]c'));
    expect_truthy(isMatch('abc', 'a[b]c'));
    expect_truthy(!isMatch('abd', 'a[b]c'));
    expect_truthy(!isMatch('abe', 'a[b]c'));
    expect_truthy(!isMatch('b', 'a[b]c'));
    expect_truthy(!isMatch('bb', 'a[b]c'));
    expect_truthy(!isMatch('bcd', 'a[b]c'));
    expect_truthy(!isMatch('bdir/', 'a[b]c'));
    expect_truthy(!isMatch('Beware', 'a[b]c'));
    expect_truthy(!isMatch('c', 'a[b]c'));
    expect_truthy(!isMatch('ca', 'a[b]c'));
    expect_truthy(!isMatch('cb', 'a[b]c'));
    expect_truthy(!isMatch('d', 'a[b]c'));
    expect_truthy(!isMatch('dd', 'a[b]c'));
    expect_truthy(!isMatch('de', 'a[b]c'));
    expect_truthy(!isMatch('baz', 'a[b]c'));
    expect_truthy(!isMatch('bzz', 'a[b]c'));
    expect_truthy(!isMatch('BZZ', 'a[b]c'));
    expect_truthy(!isMatch('beware', 'a[b]c'));
    expect_truthy(!isMatch('BewAre', 'a[b]c'));

    expect_truthy(!isMatch('*', 'a["b"]c'));
    expect_truthy(!isMatch('**', 'a["b"]c'));
    expect_truthy(!isMatch('\\*', 'a["b"]c'));
    expect_truthy(!isMatch('a', 'a["b"]c'));
    expect_truthy(!isMatch('a/*', 'a["b"]c'));
    expect_truthy(isMatch('abc', 'a["b"]c'));
    expect_truthy(!isMatch('abd', 'a["b"]c'));
    expect_truthy(!isMatch('abe', 'a["b"]c'));
    expect_truthy(!isMatch('b', 'a["b"]c'));
    expect_truthy(!isMatch('bb', 'a["b"]c'));
    expect_truthy(!isMatch('bcd', 'a["b"]c'));
    expect_truthy(!isMatch('bdir/', 'a["b"]c'));
    expect_truthy(!isMatch('Beware', 'a["b"]c'));
    expect_truthy(!isMatch('c', 'a["b"]c'));
    expect_truthy(!isMatch('ca', 'a["b"]c'));
    expect_truthy(!isMatch('cb', 'a["b"]c'));
    expect_truthy(!isMatch('d', 'a["b"]c'));
    expect_truthy(!isMatch('dd', 'a["b"]c'));
    expect_truthy(!isMatch('de', 'a["b"]c'));
    expect_truthy(!isMatch('baz', 'a["b"]c'));
    expect_truthy(!isMatch('bzz', 'a["b"]c'));
    expect_truthy(!isMatch('BZZ', 'a["b"]c'));
    expect_truthy(!isMatch('beware', 'a["b"]c'));
    expect_truthy(!isMatch('BewAre', 'a["b"]c'));

    expect_truthy(!isMatch('*', 'a[\\\\b]c'));
    expect_truthy(!isMatch('**', 'a[\\\\b]c'));
    expect_truthy(!isMatch('\\*', 'a[\\\\b]c'));
    expect_truthy(!isMatch('a', 'a[\\\\b]c'));
    expect_truthy(!isMatch('a/*', 'a[\\\\b]c'));
    expect_truthy(isMatch('abc', 'a[\\\\b]c'));
    expect_truthy(!isMatch('abd', 'a[\\\\b]c'));
    expect_truthy(!isMatch('abe', 'a[\\\\b]c'));
    expect_truthy(!isMatch('b', 'a[\\\\b]c'));
    expect_truthy(!isMatch('bb', 'a[\\\\b]c'));
    expect_truthy(!isMatch('bcd', 'a[\\\\b]c'));
    expect_truthy(!isMatch('bdir/', 'a[\\\\b]c'));
    expect_truthy(!isMatch('Beware', 'a[\\\\b]c'));
    expect_truthy(!isMatch('c', 'a[\\\\b]c'));
    expect_truthy(!isMatch('ca', 'a[\\\\b]c'));
    expect_truthy(!isMatch('cb', 'a[\\\\b]c'));
    expect_truthy(!isMatch('d', 'a[\\\\b]c'));
    expect_truthy(!isMatch('dd', 'a[\\\\b]c'));
    expect_truthy(!isMatch('de', 'a[\\\\b]c'));
    expect_truthy(!isMatch('baz', 'a[\\\\b]c'));
    expect_truthy(!isMatch('bzz', 'a[\\\\b]c'));
    expect_truthy(!isMatch('BZZ', 'a[\\\\b]c'));
    expect_truthy(!isMatch('beware', 'a[\\\\b]c'));
    expect_truthy(!isMatch('BewAre', 'a[\\\\b]c'));

    expect_truthy(!isMatch('*', 'a[\\b]c'));
    expect_truthy(!isMatch('**', 'a[\\b]c'));
    expect_truthy(!isMatch('\\*', 'a[\\b]c'));
    expect_truthy(!isMatch('a', 'a[\\b]c'));
    expect_truthy(!isMatch('a/*', 'a[\\b]c'));
    expect_truthy(!isMatch('abc', 'a[\\b]c'));
    expect_truthy(!isMatch('abd', 'a[\\b]c'));
    expect_truthy(!isMatch('abe', 'a[\\b]c'));
    expect_truthy(!isMatch('b', 'a[\\b]c'));
    expect_truthy(!isMatch('bb', 'a[\\b]c'));
    expect_truthy(!isMatch('bcd', 'a[\\b]c'));
    expect_truthy(!isMatch('bdir/', 'a[\\b]c'));
    expect_truthy(!isMatch('Beware', 'a[\\b]c'));
    expect_truthy(!isMatch('c', 'a[\\b]c'));
    expect_truthy(!isMatch('ca', 'a[\\b]c'));
    expect_truthy(!isMatch('cb', 'a[\\b]c'));
    expect_truthy(!isMatch('d', 'a[\\b]c'));
    expect_truthy(!isMatch('dd', 'a[\\b]c'));
    expect_truthy(!isMatch('de', 'a[\\b]c'));
    expect_truthy(!isMatch('baz', 'a[\\b]c'));
    expect_truthy(!isMatch('bzz', 'a[\\b]c'));
    expect_truthy(!isMatch('BZZ', 'a[\\b]c'));
    expect_truthy(!isMatch('beware', 'a[\\b]c'));
    expect_truthy(!isMatch('BewAre', 'a[\\b]c'));

    expect_truthy(!isMatch('*', 'a[b-d]c'));
    expect_truthy(!isMatch('**', 'a[b-d]c'));
    expect_truthy(!isMatch('\\*', 'a[b-d]c'));
    expect_truthy(!isMatch('a', 'a[b-d]c'));
    expect_truthy(!isMatch('a/*', 'a[b-d]c'));
    expect_truthy(isMatch('abc', 'a[b-d]c'));
    expect_truthy(!isMatch('abd', 'a[b-d]c'));
    expect_truthy(!isMatch('abe', 'a[b-d]c'));
    expect_truthy(!isMatch('b', 'a[b-d]c'));
    expect_truthy(!isMatch('bb', 'a[b-d]c'));
    expect_truthy(!isMatch('bcd', 'a[b-d]c'));
    expect_truthy(!isMatch('bdir/', 'a[b-d]c'));
    expect_truthy(!isMatch('Beware', 'a[b-d]c'));
    expect_truthy(!isMatch('c', 'a[b-d]c'));
    expect_truthy(!isMatch('ca', 'a[b-d]c'));
    expect_truthy(!isMatch('cb', 'a[b-d]c'));
    expect_truthy(!isMatch('d', 'a[b-d]c'));
    expect_truthy(!isMatch('dd', 'a[b-d]c'));
    expect_truthy(!isMatch('de', 'a[b-d]c'));
    expect_truthy(!isMatch('baz', 'a[b-d]c'));
    expect_truthy(!isMatch('bzz', 'a[b-d]c'));
    expect_truthy(!isMatch('BZZ', 'a[b-d]c'));
    expect_truthy(!isMatch('beware', 'a[b-d]c'));
    expect_truthy(!isMatch('BewAre', 'a[b-d]c'));

    expect_truthy(!isMatch('*', 'a?c'));
    expect_truthy(!isMatch('**', 'a?c'));
    expect_truthy(!isMatch('\\*', 'a?c'));
    expect_truthy(!isMatch('a', 'a?c'));
    expect_truthy(!isMatch('a/*', 'a?c'));
    expect_truthy(isMatch('abc', 'a?c'));
    expect_truthy(!isMatch('abd', 'a?c'));
    expect_truthy(!isMatch('abe', 'a?c'));
    expect_truthy(!isMatch('b', 'a?c'));
    expect_truthy(!isMatch('bb', 'a?c'));
    expect_truthy(!isMatch('bcd', 'a?c'));
    expect_truthy(!isMatch('bdir/', 'a?c'));
    expect_truthy(!isMatch('Beware', 'a?c'));
    expect_truthy(!isMatch('c', 'a?c'));
    expect_truthy(!isMatch('ca', 'a?c'));
    expect_truthy(!isMatch('cb', 'a?c'));
    expect_truthy(!isMatch('d', 'a?c'));
    expect_truthy(!isMatch('dd', 'a?c'));
    expect_truthy(!isMatch('de', 'a?c'));
    expect_truthy(!isMatch('baz', 'a?c'));
    expect_truthy(!isMatch('bzz', 'a?c'));
    expect_truthy(!isMatch('BZZ', 'a?c'));
    expect_truthy(!isMatch('beware', 'a?c'));
    expect_truthy(!isMatch('BewAre', 'a?c'));

    expect_truthy(isMatch('man/man1/bash.1', '*/man*/bash.*'));

    expect_truthy(isMatch('*', '[^a-c]*'));
    expect_truthy(isMatch('**', '[^a-c]*'));
    expect_truthy(!isMatch('a', '[^a-c]*'));
    expect_truthy(!isMatch('a/*', '[^a-c]*'));
    expect_truthy(!isMatch('abc', '[^a-c]*'));
    expect_truthy(!isMatch('abd', '[^a-c]*'));
    expect_truthy(!isMatch('abe', '[^a-c]*'));
    expect_truthy(!isMatch('b', '[^a-c]*'));
    expect_truthy(!isMatch('bb', '[^a-c]*'));
    expect_truthy(!isMatch('bcd', '[^a-c]*'));
    expect_truthy(!isMatch('bdir/', '[^a-c]*'));
    expect_truthy(isMatch('Beware', '[^a-c]*'));
    expect_truthy(isMatch('Beware', '[^a-c]*', { bash: true }));
    expect_truthy(!isMatch('c', '[^a-c]*'));
    expect_truthy(!isMatch('ca', '[^a-c]*'));
    expect_truthy(!isMatch('cb', '[^a-c]*'));
    expect_truthy(isMatch('d', '[^a-c]*'));
    expect_truthy(isMatch('dd', '[^a-c]*'));
    expect_truthy(isMatch('de', '[^a-c]*'));
    expect_truthy(!isMatch('baz', '[^a-c]*'));
    expect_truthy(!isMatch('bzz', '[^a-c]*'));
    expect_truthy(isMatch('BZZ', '[^a-c]*'));
    expect_truthy(!isMatch('beware', '[^a-c]*'));
    expect_truthy(isMatch('BewAre', '[^a-c]*'));
  });

  test('should support basic wildmatch (brackets) features', () => {
    expect_truthy(!isMatch('aab', 'a[]-]b'));
    expect_truthy(!isMatch('ten', '[ten]'));
    expect_truthy(isMatch(']', ']'));
    expect_truthy(isMatch('a-b', 'a[]-]b'));
    expect_truthy(isMatch('a]b', 'a[]-]b'));
    expect_truthy(isMatch('a]b', 'a[]]b'));
    expect_truthy(isMatch('aab', 'a[\\]a\\-]b'));
    expect_truthy(isMatch('ten', 't[a-g]n'));
    expect_truthy(isMatch('ton', 't[^a-g]n'));
  });

  test('should support extended slash-matching features', () => {
    expect_truthy(!isMatch('foo/bar', 'f[^eiu][^eiu][^eiu][^eiu][^eiu]r'));
    expect_truthy(isMatch('foo/bar', 'foo[/]bar'));
    expect_truthy(isMatch('foo-bar', 'f[^eiu][^eiu][^eiu][^eiu][^eiu]r'));
  });

  test('should match escaped characters', () => {
    if (process.platform !== 'win32') {
      expect_truthy(isMatch('\\*', '\\*'));
      expect_truthy(isMatch('XXX/\\', '[A-Z]+/\\\\'));
    }

    expect_truthy(isMatch('[ab]', '\\[ab]'));
    expect_truthy(isMatch('[ab]', '[\\[:]ab]'));
  });

  test('should consolidate extra stars', () => {
    expect_truthy(!isMatch('bbc', 'a**c'));
    expect_truthy(isMatch('abc', 'a**c'));
    expect_truthy(!isMatch('bbd', 'a**c'));

    expect_truthy(!isMatch('bbc', 'a***c'));
    expect_truthy(isMatch('abc', 'a***c'));
    expect_truthy(!isMatch('bbd', 'a***c'));

    expect_truthy(!isMatch('bbc', 'a*****?c'));
    expect_truthy(isMatch('abc', 'a*****?c'));
    expect_truthy(!isMatch('bbc', 'a*****?c'));

    expect_truthy(isMatch('bbc', '?*****??'));
    expect_truthy(isMatch('abc', '?*****??'));

    expect_truthy(isMatch('bbc', '*****??'));
    expect_truthy(isMatch('abc', '*****??'));

    expect_truthy(isMatch('bbc', '?*****?c'));
    expect_truthy(isMatch('abc', '?*****?c'));

    expect_truthy(isMatch('bbc', '?***?****c'));
    expect_truthy(isMatch('abc', '?***?****c'));
    expect_truthy(!isMatch('bbd', '?***?****c'));

    expect_truthy(isMatch('bbc', '?***?****?'));
    expect_truthy(isMatch('abc', '?***?****?'));

    expect_truthy(isMatch('bbc', '?***?****'));
    expect_truthy(isMatch('abc', '?***?****'));

    expect_truthy(isMatch('bbc', '*******c'));
    expect_truthy(isMatch('abc', '*******c'));

    expect_truthy(isMatch('bbc', '*******?'));
    expect_truthy(isMatch('abc', '*******?'));

    expect_truthy(isMatch('abcdecdhjk', 'a*cd**?**??k'));
    expect_truthy(isMatch('abcdecdhjk', 'a**?**cd**?**??k'));
    expect_truthy(isMatch('abcdecdhjk', 'a**?**cd**?**??k***'));
    expect_truthy(isMatch('abcdecdhjk', 'a**?**cd**?**??***k'));
    expect_truthy(isMatch('abcdecdhjk', 'a**?**cd**?**??***k**'));
    expect_truthy(isMatch('abcdecdhjk', 'a****c**?**??*****'));
  });

  test('none of these should output anything', () => {
    expect_truthy(!isMatch('abc', '??**********?****?'));
    expect_truthy(!isMatch('abc', '??**********?****c'));
    expect_truthy(!isMatch('abc', '?************c****?****'));
    expect_truthy(!isMatch('abc', '*c*?**'));
    expect_truthy(!isMatch('abc', 'a*****c*?**'));
    expect_truthy(!isMatch('abc', 'a********???*******'));
    expect_truthy(!isMatch('a', '[]'));
    expect_truthy(!isMatch('[', '[abc'));
  });
});
