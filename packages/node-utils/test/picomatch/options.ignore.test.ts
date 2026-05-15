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

describe('options.ignore', () => {
  test('should not match ignored patterns', () => {
    expect_truthy(isMatch('a+b/src/glimini.js', 'a+b/src/*.js', { ignore: ['**/f*'] }));
    expect_truthy(!isMatch('a+b/src/glimini.js', 'a+b/src/*.js', { ignore: ['**/g*'] }));
    expect_truthy(isMatch('+b/src/glimini.md', '+b/src/*', { ignore: ['**/*.js'] }));
    expect_truthy(!isMatch('+b/src/glimini.js', '+b/src/*', { ignore: ['**/*.js'] }));
  });

  const negations = ['a/a', 'a/b', 'a/c', 'a/d', 'a/e', 'b/a', 'b/b', 'b/c'];
  const globs = ['.a', '.a/a', '.a/a/a', '.a/a/a/a', 'a', 'a/.a', 'a/a', 'a/a/.a', 'a/a/a', 'a/a/a/a', 'a/a/a/a/a', 'a/a/b', 'a/b', 'a/b/c', 'a/c', 'a/x', 'b', 'b/b/b', 'b/b/c', 'c/c/c', 'e/f/g', 'h/i/a', 'x/x/x', 'x/y', 'z/z', 'z/z/z'].sort();

  test('should filter out ignored patterns', () => {
    const opts = { ignore: ['a/**'], strictSlashes: true };
    const dotOpts = { ...opts, dot: true };

    expect_deepEqual(match(globs, '*', opts), ['a', 'b']);
    expect_deepEqual(match(globs, '*', { ...opts, strictSlashes: false }), ['b']);
    expect_deepEqual(match(globs, '*', { ignore: '**/a' }), ['b']);
    expect_deepEqual(match(globs, '*/*', opts), ['x/y', 'z/z']);
    expect_deepEqual(match(globs, '*/*/*', opts), ['b/b/b', 'b/b/c', 'c/c/c', 'e/f/g', 'h/i/a', 'x/x/x', 'z/z/z']);
    expect_deepEqual(match(globs, '*/*/*/*', opts), []);
    expect_deepEqual(match(globs, '*/*/*/*/*', opts), []);
    expect_deepEqual(match(globs, 'a/*', opts), []);
    expect_deepEqual(match(globs, '**/*/x', opts), ['x/x/x']);
    expect_deepEqual(match(globs, '**/*/[b-z]', opts), ['b/b/b', 'b/b/c', 'c/c/c', 'e/f/g', 'x/x/x', 'x/y', 'z/z', 'z/z/z']);

    expect_deepEqual(match(globs, '*', { ignore: '**/a', dot: true }), ['.a', 'b']);
    expect_deepEqual(match(globs, '*', dotOpts), ['.a', 'a', 'b']);
    expect_deepEqual(match(globs, '*/*', dotOpts), ['.a/a', 'x/y', 'z/z'].sort());
    expect_deepEqual(match(globs, '*/*/*', dotOpts), ['.a/a/a', 'b/b/b', 'b/b/c', 'c/c/c', 'e/f/g', 'h/i/a', 'x/x/x', 'z/z/z'].sort());
    expect_deepEqual(match(globs, '*/*/*/*', dotOpts), ['.a/a/a/a']);
    expect_deepEqual(match(globs, '*/*/*/*/*', dotOpts), []);
    expect_deepEqual(match(globs, 'a/*', dotOpts), []);
    expect_deepEqual(match(globs, '**/*/x', dotOpts), ['x/x/x']);

    // see https://github.com/jonschlinkert/micromatch/issues/79
    expect_deepEqual(match(['foo.js', 'a/foo.js'], '**/foo.js'), ['foo.js', 'a/foo.js']);
    expect_deepEqual(match(['foo.js', 'a/foo.js'], '**/foo.js', { dot: true }), ['foo.js', 'a/foo.js']);

    expect_deepEqual(match(negations, '!b/a', opts), ['b/b', 'b/c']);
    expect_deepEqual(match(negations, '!b/(a)', opts), ['b/b', 'b/c']);
    expect_deepEqual(match(negations, '!(b/(a))', opts), ['b/b', 'b/c']);
    expect_deepEqual(match(negations, '!(b/a)', opts), ['b/b', 'b/c']);

    expect_deepEqual(match(negations, '**'), negations, 'nothing is ignored');
    expect_deepEqual(match(negations, '**', { ignore: ['*/b', '*/a'] }), ['a/c', 'a/d', 'a/e', 'b/c']);
    expect_deepEqual(match(negations, '**', { ignore: ['**'] }), []);
  });
});
