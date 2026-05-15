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
const { isMatch } = mm;

describe('qmarks and stars', () => {
  test('should match with qmarks', () => {
    expect_truthy(!isMatch('/ab', '/?'));
    expect_truthy(!isMatch('/ab', '?/?'));
    expect_truthy(isMatch('a/b', '?/?'));
    expect_truthy(isMatch('/ab', '/??'));
    expect_truthy(isMatch('/ab', '/?b'));
    expect_truthy(!isMatch('/ab', ['?/?', 'foo', 'bar']));
    expect_truthy(!isMatch('/ab', ['a/*', 'foo', 'bar']));
  });

  test('should support qmark matching', () => {
    let arr = ['a', 'aa', 'ab', 'aaa', 'abcdefg'];
    expect_deepEqual(mm(arr, '?'), ['a']);
    expect_deepEqual(mm(arr, '??'), ['aa', 'ab']);
    expect_deepEqual(mm(arr, '???'), ['aaa']);
  });

  test('should correctly handle question marks in globs', () => {
    expect_deepEqual(mm(['?', '??', '???'], '?'), ['?']);
    expect_deepEqual(mm(['?', '??', '???'], '??'), ['??']);
    expect_deepEqual(mm(['?', '??', '???'], '???'), ['???']);
    expect_deepEqual(mm(['/a/', '/a/b/', '/a/b/c/', '/a/b/c/d/'], '??'), []);
    mm(['/a/', '/a/b/', '/a/b/c/', '/a/b/c/d/'], '??', { dot: true }, []);
    expect_deepEqual(mm(['x/y/acb', 'acb', 'acb/', 'acb/d/e'], 'a?b'), ['acb']);
    expect_deepEqual(mm(['aaa', 'aac', 'abc'], 'a?c'), ['aac', 'abc']);
    expect_deepEqual(mm(['aaa', 'aac', 'abc'], 'a*?c'), ['aac', 'abc']);
    expect_deepEqual(mm(['a', 'aa', 'ab', 'ab?', 'ac', 'ac?', 'abcd', 'abbb'], 'ab?'), ['ab?']);
    expect_deepEqual(mm(['abc', 'abb', 'acc'], 'a**?c'), ['abc', 'acc']);
    expect_deepEqual(mm(['abc'], 'a*****?c'), ['abc']);
    expect_deepEqual(mm(['a', 'aa', 'abc', 'zzz', 'bbb', 'aaaa'], '*****?'), ['a', 'aa', 'abc', 'zzz', 'bbb', 'aaaa']);
    expect_deepEqual(mm(['a', 'aa', 'abc', 'zzz', 'bbb', 'aaaa'], '*****??'), ['aa', 'abc', 'zzz', 'bbb', 'aaaa']);
    expect_deepEqual(mm(['a', 'aa', 'abc', 'zzz', 'bbb', 'aaaa'], '?*****??'), ['abc', 'zzz', 'bbb', 'aaaa']);
    expect_deepEqual(mm(['abc', 'abb', 'zzz'], '?*****?c'), ['abc']);
    expect_deepEqual(mm(['abc', 'bbb', 'zzz'], '?***?****c'), ['abc']);
    expect_deepEqual(mm(['abc', 'bbb', 'zzz'], '?***?****?'), ['abc', 'bbb', 'zzz']);
    expect_deepEqual(mm(['abc'], '?***?****'), ['abc']);
    expect_deepEqual(mm(['abc'], '*******c'), ['abc']);
    expect_deepEqual(mm(['abc'], '*******?'), ['abc']);
    expect_deepEqual(mm(['abcdecdhjk'], 'a*cd**?**??k'), ['abcdecdhjk']);
    expect_deepEqual(mm(['abcdecdhjk'], 'a**?**cd**?**??k'), ['abcdecdhjk']);
    expect_deepEqual(mm(['abcdecdhjk'], 'a**?**cd**?**??k***'), ['abcdecdhjk']);
    expect_deepEqual(mm(['abcdecdhjk'], 'a**?**cd**?**??***k'), ['abcdecdhjk']);
    expect_deepEqual(mm(['abcdecdhjk'], 'a**?**cd**?**??***k**'), ['abcdecdhjk']);
    expect_deepEqual(mm(['abcdecdhjk'], 'a****c**?**??*****'), ['abcdecdhjk']);
  });

  test('should match one character per question mark', () => {
    expect_deepEqual(mm(['a/b/c.md'], 'a/?/c.md'), ['a/b/c.md']);
    expect_deepEqual(mm(['a/bb/c.md'], 'a/?/c.md'), []);
    expect_deepEqual(mm(['a/bb/c.md'], 'a/??/c.md'), ['a/bb/c.md']);
    expect_deepEqual(mm(['a/bbb/c.md'], 'a/??/c.md'), []);
    expect_deepEqual(mm(['a/bbb/c.md'], 'a/???/c.md'), ['a/bbb/c.md']);
    expect_deepEqual(mm(['a/bbbb/c.md'], 'a/????/c.md'), ['a/bbbb/c.md']);
  });

  test('should match multiple groups of question marks', () => {
    expect_deepEqual(mm(['a/bb/c/dd/e.md'], 'a/?/c/?/e.md'), []);
    expect_deepEqual(mm(['a/b/c/d/e.md'], 'a/?/c/?/e.md'), ['a/b/c/d/e.md']);
    expect_deepEqual(mm(['a/b/c/d/e.md'], 'a/?/c/???/e.md'), []);
    expect_deepEqual(mm(['a/b/c/zzz/e.md'], 'a/?/c/???/e.md'), ['a/b/c/zzz/e.md']);
  });

  test('should use qmarks with other special characters', () => {
    expect_deepEqual(mm(['a/b/c/d/e.md'], 'a/?/c/?/*/e.md'), []);
    expect_deepEqual(mm(['a/b/c/d/e/e.md'], 'a/?/c/?/*/e.md'), ['a/b/c/d/e/e.md']);
    expect_deepEqual(mm(['a/b/c/d/efghijk/e.md'], 'a/?/c/?/*/e.md'), ['a/b/c/d/efghijk/e.md']);
    expect_deepEqual(mm(['a/b/c/d/efghijk/e.md'], 'a/?/**/e.md'), ['a/b/c/d/efghijk/e.md']);
    expect_deepEqual(mm(['a/bb/e.md'], 'a/?/e.md'), []);
    expect_deepEqual(mm(['a/bb/e.md'], 'a/?/**/e.md'), []);
    expect_deepEqual(mm(['a/b/c/d/efghijk/e.md'], 'a/*/?/**/e.md'), ['a/b/c/d/efghijk/e.md']);
    expect_deepEqual(mm(['a/b/c/d/efgh.ijk/e.md'], 'a/*/?/**/e.md'), ['a/b/c/d/efgh.ijk/e.md']);
    expect_deepEqual(mm(['a/b.bb/c/d/efgh.ijk/e.md'], 'a/*/?/**/e.md'), ['a/b.bb/c/d/efgh.ijk/e.md']);
    expect_deepEqual(mm(['a/bbb/c/d/efgh.ijk/e.md'], 'a/*/?/**/e.md'), ['a/bbb/c/d/efgh.ijk/e.md']);
  });

  test('question marks should not match slashes', () => {
    expect_truthy(!isMatch('aaa/bbb', 'aaa?bbb'));
    expect_truthy(!isMatch('aaa//bbb', 'aaa?bbb'));
    if (process.platform === 'win32') {
      expect_truthy(!isMatch('aaa\\bbb', 'aaa?bbb'));
      expect_truthy(!isMatch('aaa\\\\bbb', 'aaa??bbb'));
    } else {
      expect_truthy(isMatch('aaa\\bbb', 'aaa?bbb'));
      expect_truthy(!isMatch('aaa\\\\bbb', 'aaa?bbb'));
      expect_truthy(isMatch('aaa\\\\bbb', 'aaa??bbb'));
    }
    expect_truthy(!isMatch('aaa/bbb', 'aaa?bbb'));
  });

  test('question marks should match arbitrary dots', () => {
    expect_truthy(isMatch('aaa.bbb', 'aaa?bbb'));
  });

  test('question marks should not match leading dots', () => {
    expect_truthy(!isMatch('.aaa/bbb', '?aaa/bbb'));
    expect_truthy(!isMatch('aaa/.bbb', 'aaa/?bbb'));
  });

  test('question marks should match leading dots when options.dot is true', () => {
    expect_truthy(isMatch('aaa/.bbb', 'aaa/?bbb', {dot: true}));
    expect_truthy(isMatch('.aaa/bbb', '?aaa/bbb', {dot: true}));
  });

  test('question marks should match characters preceding a dot', () => {
    expect_truthy(isMatch('a/bbb/abcd.md', 'a/*/ab??.md'));
    expect_truthy(isMatch('a/bbb/abcd.md', 'a/bbb/ab??.md'));
    expect_truthy(isMatch('a/bbb/abcd.md', 'a/bbb/ab???md'));
  });
});
