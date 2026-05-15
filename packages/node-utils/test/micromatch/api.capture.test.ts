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


const { capture } = micromatch;

describe('.capture()', () => {
  test('should return null if no match', () => {
    expect_loose_equal(capture('test/*', 'hi/123'), null);
  });

  test('should return an empty array if there are no captures', () => {
    expect_deepEqual(capture('test/hi', 'test/hi'), []);
  });

  test('should capture stars', () => {
    expect_deepEqual(capture('test/*', 'test/foo'), ['foo']);
    expect_deepEqual(capture('test/*/bar', 'test/foo/bar'), ['foo']);
    expect_deepEqual(capture('test/*/bar/*', 'test/foo/bar/baz'), ['foo', 'baz']);
    expect_deepEqual(capture('test/*.js', 'test/foo.js'), ['foo']);
    expect_deepEqual(capture('test/*-controller.js', 'test/foo-controller.js'), ['foo']);
  });

  test('should capture globstars', () => {
    expect_deepEqual(capture('test/**/*.js', 'test/a.js'), ['', 'a']);
    expect_deepEqual(capture('test/**/*.js', 'test/dir/a.js'), ['dir', 'a']);
    expect_deepEqual(capture('test/**/*.js', 'test/dir/test/a.js'), ['dir/test', 'a']);
    expect_deepEqual(capture('**/*.js', 'test/dir/a.js'), ['test/dir', 'a']);
  });

  test('should capture extglobs', () => {
    expect_deepEqual(capture('test/+(a|b)/*.js', 'test/a/x.js'), ['a', 'x']);
    expect_deepEqual(capture('test/+(a|b)/*.js', 'test/b/x.js'), ['b', 'x']);
    expect_deepEqual(capture('test/+(a|b)/*.js', 'test/ab/x.js'), ['ab', 'x']);
  });

  test('should capture paren groups', () => {
    expect_deepEqual(capture('test/(a|b)/x.js', 'test/a/x.js'), ['a']);
    expect_deepEqual(capture('test/(a|b)/x.js', 'test/b/x.js'), ['b']);
  });

  test('should capture star groups', () => {
    expect_deepEqual(capture('test/a*(a|b)/x.js', 'test/a/x.js'), ['']);
    expect_deepEqual(capture('test/a*(a|b)/x.js', 'test/aa/x.js'), ['a']);
    expect_deepEqual(capture('test/a*(a|b)/x.js', 'test/ab/x.js'), ['b']);
    expect_deepEqual(capture('test/a*(a|b)/x.js', 'test/aba/x.js'), ['ba']);
  });

  test('should capture plus groups', () => {
    expect_deepEqual(capture('test/+(a|b)/x.js', 'test/a/x.js'), ['a']);
    expect_deepEqual(capture('test/+(a|b)/x.js', 'test/b/x.js'), ['b']);
    expect_deepEqual(capture('test/+(a|b)/x.js', 'test/ab/x.js'), ['ab']);
    expect_deepEqual(capture('test/+(a|b)/x.js', 'test/aba/x.js'), ['aba']);
  });

  test('should capture optional groups', () => {
    expect_deepEqual(capture('test/a?(a|b)/x.js', 'test/a/x.js'), ['']);
    expect_deepEqual(capture('test/a?(a|b)/x.js', 'test/ab/x.js'), ['b']);
    expect_deepEqual(capture('test/a?(a|b)/x.js', 'test/aa/x.js'), ['a']);
  });

  test('should capture @ groups', () => {
    expect_deepEqual(capture('test/@(a|b)/x.js', 'test/a/x.js'), ['a']);
    expect_deepEqual(capture('test/@(a|b)/x.js', 'test/b/x.js'), ['b']);
  });

  test('should capture negated groups', () => {
    expect_deepEqual(capture('test/!(a|b)/x.js', 'test/x/x.js'), ['x']);
    expect_deepEqual(capture('test/!(a|b)/x.js', 'test/y/x.js'), ['y']);
  });
});
