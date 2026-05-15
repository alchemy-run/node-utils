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

describe('qmarks and stars', () => {
  test('should match question marks with question marks', () => {
    expect_deepEqual(match(['?', '??', '???'], '?'), ['?']);
    expect_deepEqual(match(['?', '??', '???'], '??'), ['??']);
    expect_deepEqual(match(['?', '??', '???'], '???'), ['???']);
  });

  test('should match question marks and stars with question marks and stars', () => {
    expect_deepEqual(match(['?', '??', '???'], '?*'), ['?', '??', '???']);
    expect_deepEqual(match(['?', '??', '???'], '*?'), ['?', '??', '???']);
    expect_deepEqual(match(['?', '??', '???'], '?*?'), ['??', '???']);
    expect_deepEqual(match(['?*', '?*?', '?*?*?'], '?*'), ['?*', '?*?', '?*?*?']);
    expect_deepEqual(match(['?*', '?*?', '?*?*?'], '*?'), ['?*', '?*?', '?*?*?']);
    expect_deepEqual(match(['?*', '?*?', '?*?*?'], '?*?'), ['?*', '?*?', '?*?*?']);
  });

  test('should support consecutive stars and question marks', () => {
    expect_deepEqual(match(['aaa', 'aac', 'abc'], 'a*?c'), ['aac', 'abc']);
    expect_deepEqual(match(['abc', 'abb', 'acc'], 'a**?c'), ['abc', 'acc']);
    expect_deepEqual(match(['abc', 'aaaabbbbbbccccc'], 'a*****?c'), ['abc', 'aaaabbbbbbccccc']);
    expect_deepEqual(match(['a', 'ab', 'abc', 'abcd'], '*****?'), ['a', 'ab', 'abc', 'abcd']);
    expect_deepEqual(match(['a', 'ab', 'abc', 'abcd'], '*****??'), ['ab', 'abc', 'abcd']);
    expect_deepEqual(match(['a', 'ab', 'abc', 'abcd'], '?*****??'), ['abc', 'abcd']);
    expect_deepEqual(match(['abc', 'abb', 'zzz'], '?*****?c'), ['abc']);
    expect_deepEqual(match(['abc', 'bbb', 'zzz'], '?***?****?'), ['abc', 'bbb', 'zzz']);
    expect_deepEqual(match(['abc', 'bbb', 'zzz'], '?***?****c'), ['abc']);
    expect_deepEqual(match(['abc'], '*******?'), ['abc']);
    expect_deepEqual(match(['abc'], '*******c'), ['abc']);
    expect_deepEqual(match(['abc'], '?***?****'), ['abc']);
    expect_deepEqual(match(['abcdecdhjk'], 'a****c**?**??*****'), ['abcdecdhjk']);
    expect_deepEqual(match(['abcdecdhjk'], 'a**?**cd**?**??***k'), ['abcdecdhjk']);
    expect_deepEqual(match(['abcdecdhjk'], 'a**?**cd**?**??***k**'), ['abcdecdhjk']);
    expect_deepEqual(match(['abcdecdhjk'], 'a**?**cd**?**??k'), ['abcdecdhjk']);
    expect_deepEqual(match(['abcdecdhjk'], 'a**?**cd**?**??k***'), ['abcdecdhjk']);
    expect_deepEqual(match(['abcdecdhjk'], 'a*cd**?**??k'), ['abcdecdhjk']);
  });

  test('should match backslashes with question marks when not on windows', () => {
    if (process.platform !== 'win32') {
      expect_truthy(!isMatch('aaa\\\\bbb', 'aaa?bbb'));
      expect_truthy(isMatch('aaa\\\\bbb', 'aaa??bbb'));
      expect_truthy(isMatch('aaa\\bbb', 'aaa?bbb'));
    }
  });

  test('should match one character per question mark', () => {
    const fixtures = ['a', 'aa', 'ab', 'aaa', 'abcdefg'];
    expect_deepEqual(match(fixtures, '?'), ['a']);
    expect_deepEqual(match(fixtures, '??'), ['aa', 'ab']);
    expect_deepEqual(match(fixtures, '???'), ['aaa']);
    expect_deepEqual(match(['a/', '/a/', '/a/b/', '/a/b/c/', '/a/b/c/d/'], '??'), []);
    expect_deepEqual(match(['a/b/c.md'], 'a/?/c.md'), ['a/b/c.md']);
    expect_deepEqual(match(['a/bb/c.md'], 'a/?/c.md'), []);
    expect_deepEqual(match(['a/bb/c.md'], 'a/??/c.md'), ['a/bb/c.md']);
    expect_deepEqual(match(['a/bbb/c.md'], 'a/??/c.md'), []);
    expect_deepEqual(match(['a/bbb/c.md'], 'a/???/c.md'), ['a/bbb/c.md']);
    expect_deepEqual(match(['a/bbbb/c.md'], 'a/????/c.md'), ['a/bbbb/c.md']);
  });

  test('should not match slashes question marks', () => {
    const fixtures = ['//', 'a/', '/a', '/a/', 'aa', '/aa', 'a/a', 'aaa', '/aaa'];
    expect_deepEqual(match(fixtures, '/?'), ['/a']);
    expect_deepEqual(match(fixtures, '/??'), ['/aa']);
    expect_deepEqual(match(fixtures, '/???'), ['/aaa']);
    expect_deepEqual(match(fixtures, '/?/'), ['/a/']);
    expect_deepEqual(match(fixtures, '??'), ['aa']);
    expect_deepEqual(match(fixtures, '?/?'), ['a/a']);
    expect_deepEqual(match(fixtures, '???'), ['aaa']);
    expect_deepEqual(match(fixtures, 'a?a'), ['aaa']);
    expect_deepEqual(match(fixtures, 'aa?'), ['aaa']);
    expect_deepEqual(match(fixtures, '?aa'), ['aaa']);
  });

  test('should support question marks and stars between slashes', () => {
    expect_deepEqual(match(['a/b.bb/c/d/efgh.ijk/e'], 'a/*/?/**/e'), ['a/b.bb/c/d/efgh.ijk/e']);
    expect_deepEqual(match(['a/b/c/d/e'], 'a/?/c/?/*/e'), []);
    expect_deepEqual(match(['a/b/c/d/e/e'], 'a/?/c/?/*/e'), ['a/b/c/d/e/e']);
    expect_deepEqual(match(['a/b/c/d/efgh.ijk/e'], 'a/*/?/**/e'), ['a/b/c/d/efgh.ijk/e']);
    expect_deepEqual(match(['a/b/c/d/efghijk/e'], 'a/*/?/**/e'), ['a/b/c/d/efghijk/e']);
    expect_deepEqual(match(['a/b/c/d/efghijk/e'], 'a/?/**/e'), ['a/b/c/d/efghijk/e']);
    expect_deepEqual(match(['a/b/c/d/efghijk/e'], 'a/?/c/?/*/e'), ['a/b/c/d/efghijk/e']);
    expect_deepEqual(match(['a/bb/e'], 'a/?/**/e'), []);
    expect_deepEqual(match(['a/bb/e'], 'a/?/e'), []);
    expect_deepEqual(match(['a/bbb/c/d/efgh.ijk/e'], 'a/*/?/**/e'), ['a/bbb/c/d/efgh.ijk/e']);
  });

  test('should match no more than one character between slashes', () => {
    const fixtures = ['a/a', 'a/a/a', 'a/aa/a', 'a/aaa/a', 'a/aaaa/a', 'a/aaaaa/a'];
    expect_deepEqual(match(fixtures, '?/?'), ['a/a']);
    expect_deepEqual(match(fixtures, '?/???/?'), ['a/aaa/a']);
    expect_deepEqual(match(fixtures, '?/????/?'), ['a/aaaa/a']);
    expect_deepEqual(match(fixtures, '?/?????/?'), ['a/aaaaa/a']);
    expect_deepEqual(match(fixtures, 'a/?'), ['a/a']);
    expect_deepEqual(match(fixtures, 'a/?/a'), ['a/a/a']);
    expect_deepEqual(match(fixtures, 'a/??/a'), ['a/aa/a']);
    expect_deepEqual(match(fixtures, 'a/???/a'), ['a/aaa/a']);
    expect_deepEqual(match(fixtures, 'a/????/a'), ['a/aaaa/a']);
    expect_deepEqual(match(fixtures, 'a/????a/a'), ['a/aaaaa/a']);
  });

  test('should not match non-leading dots with question marks', () => {
    const fixtures = ['.', '.a', 'a', 'aa', 'a.a', 'aa.a', 'aaa', 'aaa.a', 'aaaa.a', 'aaaaa'];
    expect_deepEqual(match(fixtures, '?'), ['a']);
    expect_deepEqual(match(fixtures, '.?'), ['.a']);
    expect_deepEqual(match(fixtures, '?a'), ['aa']);
    expect_deepEqual(match(fixtures, '??'), ['aa']);
    expect_deepEqual(match(fixtures, '?a?'), ['aaa']);
    expect_deepEqual(match(fixtures, 'aaa?a'), ['aaa.a', 'aaaaa']);
    expect_deepEqual(match(fixtures, 'a?a?a'), ['aaa.a', 'aaaaa']);
    expect_deepEqual(match(fixtures, 'a???a'), ['aaa.a', 'aaaaa']);
    expect_deepEqual(match(fixtures, 'a?????'), ['aaaa.a']);
  });

  test('should match non-leading dots with question marks when options.dot is true', () => {
    const fixtures = ['.', '.a', 'a', 'aa', 'a.a', 'aa.a', '.aa', 'aaa.a', 'aaaa.a', 'aaaaa'];
    const opts = { dot: true };
    expect_deepEqual(match(fixtures, '?', opts), ['.', 'a']);
    expect_deepEqual(match(fixtures, '.?', opts), ['.a']);
    expect_deepEqual(match(fixtures, '?a', opts), ['.a', 'aa']);
    expect_deepEqual(match(fixtures, '??', opts), ['.a', 'aa']);
    expect_deepEqual(match(fixtures, '?a?', opts), ['.aa']);
  });
});
