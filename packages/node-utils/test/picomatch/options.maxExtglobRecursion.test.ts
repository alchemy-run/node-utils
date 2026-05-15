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


const { isMatch, makeRe } = picomatch;

describe('options.maxExtglobRecursion', () => {
  test('should literalize risky repeated extglobs by default', () => {
    expect_equal(
      makeRe('+(a|aa)').source,
      '^(?:\\+\\(a\\|aa\\))$'
    );
    expect_equal(
      makeRe('+(*|?)').source,
      '^(?:\\+\\(\\*\\|\\?\\))$'
    );
    expect_equal(
      makeRe('+(+(a))').source,
      '^(?:\\+\\(\\+\\(a\\)\\))$'
    );
    expect_equal(
      makeRe('*(+(a))').source,
      '^(?:\\*\\(\\+\\(a\\)\\))$'
    );

    expect_truthy(!isMatch('a'.repeat(20) + 'b', '+(a|aa)'));
    expect_truthy(!isMatch('a'.repeat(12) + '!', '+(+(a))'));
  });

  test('should preserve non-risky extglobs by default', () => {
    expect_truthy(isMatch('abcabc', '+(abc)'));
    expect_truthy(isMatch('foobar', '*(foo|bar)'));
    expect_truthy(isMatch('a', '(a|@(b|c)|d)'));
    expect_truthy(isMatch('fffooo', '*(*(f)*(o))'));
    expect_truthy(isMatch('abc', '+(*)c'));
  });

  test('should allow limited nested repeated extglobs when configured', () => {
    expect_equal(
      makeRe('+(+(a))', { maxExtglobRecursion: 1 }).source,
      '^(?:(?=.)(?:(?:a)+)+)$'
    );
    expect_equal(
      makeRe('*(+(a))', { maxExtglobRecursion: 1 }).source,
      '^(?:(?=.)(?:(?:a)+)*)$'
    );

    expect_truthy(isMatch('aaa', '+(+(a))', { maxExtglobRecursion: 1 }));
    expect_truthy(isMatch('aaa', '*(+(a))', { maxExtglobRecursion: 1 }));
  });

  test('should still block ambiguous repeated alternation when recursion is allowed', () => {
    expect_equal(
      makeRe('+(a|aa)', { maxExtglobRecursion: 1 }).source,
      '^(?:\\+\\(a\\|aa\\))$'
    );
    expect_equal(
      makeRe('+(*|?)', { maxExtglobRecursion: 1 }).source,
      '^(?:\\+\\(\\*\\|\\?\\))$'
    );
  });

  test('should rewrite risky repeated extglobs embedded in larger patterns', () => {
    expect_equal(
      makeRe('foo/+(a|aa)/bar').source,
      '^(?:foo\\/\\+\\(a\\|aa\\)\\/bar)$'
    );
    expect_equal(
      makeRe('x+(a|aa)y').source,
      '^(?:x\\+\\(a\\|aa\\)y)$'
    );

    expect_truthy(isMatch('foo/+(a|aa)/bar', 'foo/+(a|aa)/bar'));
    expect_truthy(!isMatch('foo/aa/bar', 'foo/+(a|aa)/bar'));
    expect_truthy(isMatch('x+(a|aa)y', 'x+(a|aa)y'));
    expect_truthy(!isMatch('xaay', 'x+(a|aa)y'));
  });

  test('should rewrite star-only repeated extglobs embedded in larger patterns', () => {
    expect_equal(
      makeRe('pre*(*(f)*(o))post').source,
      '^(?:pre[fo]*post)$'
    );

    expect_truthy(isMatch('prefoopost', 'pre*(*(f)*(o))post'));
  });

  test('should rewrite star-only repeated extglobs', () => {
    expect_equal(
      makeRe('*(*(f))').source,
      '^(?:(?=.)f*)$'
    );

    expect_truthy(isMatch('fff', '*(*(f))'));
  });

  test('should preserve capture behavior for rewritten repeated extglobs', () => {
    const embedded = makeRe('foo/+(a|aa)/bar', { capture: true });
    expect_equal(embedded.source, '^(?:foo\\/\\+\\(a\\|aa\\)\\/bar)$');
    expect_deepEqual(
      Array.from(embedded.exec('foo/+(a|aa)/bar')),
      ['foo/+(a|aa)/bar']
    );

    const simplified = makeRe('*(*(f)*(o))', { capture: true });
    expect_equal(simplified.source, '^(?:(?=.)([fo]*))$');
    expect_deepEqual(
      Array.from(simplified.exec('fffooo')),
      ['fffooo', 'fffooo']
    );
  });

  test('should only rewrite the risky repeated extglob when adjacent extglobs are present', () => {
    expect_equal(
      makeRe('+(a|aa)@(x)').source,
      '^(?:\\+\\(a\\|aa\\)(x))$'
    );

    expect_truthy(isMatch('+(a|aa)x', '+(a|aa)@(x)'));
    expect_truthy(!isMatch('aaax', '+(a|aa)@(x)'));
  });
  test('should disable the safeguard when maxExtglobRecursion is false', () => {
    expect_truthy(
      /\(\?:a\|aa\)\+/.test(
        makeRe('+(a|aa)', { maxExtglobRecursion: false }).source
      )
    );
    expect_truthy(
      /\(\?:\(\?:a\)\+\)\+/.test(
        makeRe('+(+(a))', { maxExtglobRecursion: false }).source
      )
    );
  });
});
