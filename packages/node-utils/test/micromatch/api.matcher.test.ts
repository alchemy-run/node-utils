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
const sep = path.sep;

describe('.matcher()', () => {
  afterEach(() => ((path as any).sep = sep));
  after(() => ((path as any).sep = sep));

  describe('errors', () => {
    test('should throw an error when arguments are invalid', () => {
      expect_throws(() => mm.matcher({}));
      expect_throws(() => mm.matcher(null));
      expect_throws(() => mm.matcher());
    });
  });

  describe('posix paths', () => {
    test('should return an array of matches for a literal string', () => {
      let fixtures = ['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'];
      expect_deepEqual(mm(fixtures, '(a/b)'), ['a/b']);
      expect_deepEqual(mm(fixtures, 'a/b'), ['a/b']);
    });

    test('should support regex logical or', () => {
      let fixtures = ['a/a', 'a/b', 'a/c'];
      expect_deepEqual(mm(fixtures, 'a/(a|c)'), ['a/a', 'a/c']);
      expect_deepEqual(mm(fixtures, 'a/(a|b|c)'), ['a/a', 'a/b', 'a/c']);
    });

    test('should support regex ranges', () => {
      let fixtures = ['a/a', 'a/b', 'a/c', 'a/x/y', 'a/x'];
      expect_deepEqual(mm(fixtures, 'a/[b-c]'), ['a/b', 'a/c']);
      expect_deepEqual(mm(fixtures, 'a/[a-z]'), ['a/a', 'a/b', 'a/c', 'a/x']);
    });

    test('should support negation patterns', () => {
      let fixtures = ['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'];
      expect_deepEqual(mm(fixtures, '!*/*'), []);
      expect_deepEqual(mm(fixtures, '!*/b'), ['a/a', 'a/c', 'b/a', 'b/c']);
      expect_deepEqual(mm(fixtures, '!a/*'), ['b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, '!a/b'), ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, '!a/(b)'), ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, '!a/(*)'), ['b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, '!(*/b)'), ['a/a', 'a/c', 'b/a', 'b/c']);
      expect_deepEqual(mm(fixtures, '!(a/b)'), ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
    });
  });

  describe('posix paths (array of patterns)', () => {
    test('should return an array of matches for a literal string', () => {
      let fixtures = ['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'];
      expect_deepEqual(mm(fixtures, ['(a/b)']), ['a/b']);
      expect_deepEqual(mm(fixtures, ['a/b']), ['a/b']);
    });

    test('should support regex logical or', () => {
      let fixtures = ['a/a', 'a/b', 'a/c'];
      expect_deepEqual(mm(fixtures, ['a/(a|c)']), ['a/a', 'a/c']);
      expect_deepEqual(mm(fixtures, ['a/(a|b|c)']), ['a/a', 'a/b', 'a/c']);
    });

    test('should support regex ranges', () => {
      let fixtures = ['a/a', 'a/b', 'a/c', 'a/x/y', 'a/x'];
      expect_deepEqual(mm(fixtures, ['a/[b-c]']), ['a/b', 'a/c']);
      expect_deepEqual(mm(fixtures, ['a/[a-z]']), ['a/a', 'a/b', 'a/c', 'a/x']);
    });

    test('should support negation patterns', () => {
      let fixtures = ['a/a', 'a/b', 'a/c', 'b/a', 'b/b', 'b/c'];
      expect_deepEqual(mm(fixtures, ['!*/*']), []);
      expect_deepEqual(mm(fixtures, ['!*/*']), []);
      expect_deepEqual(mm(fixtures, ['!*/b']), ['a/a', 'a/c', 'b/a', 'b/c']);
      expect_deepEqual(mm(fixtures, ['!a/*']), ['b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, ['!a/b']), ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, ['!a/(b)']), ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, ['!a/(*)']), ['b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, ['!(*/b)']), ['a/a', 'a/c', 'b/a', 'b/c']);
      expect_deepEqual(mm(fixtures, ['!(a/b)']), ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
    });
  });

  describe('backlashes for path separators, on posix', () => {
    if (process.platform === 'win32') return;
    let format = str => str;

    test('should return an array of matches for a literal string', () => {
      let fixtures = ['a\\a', 'a\\b', 'a\\c', 'b\\a', 'b\\b', 'b\\c'];
      expect_deepEqual(mm(fixtures, '(a/b)', { format }), []);
      expect_deepEqual(mm(fixtures, 'a/b', { format }), []);
    });

    test('should support regex logical or', () => {
      let fixtures = ['a\\a', 'a\\b', 'a\\c'];
      expect_deepEqual(mm(fixtures, 'a/(a|c)', { format }), []);
      expect_deepEqual(mm(fixtures, 'a/(a|b|c)', { format }), []);
    });

    test('should support regex ranges', () => {
      let fixtures = ['a\\a', 'a\\b', 'a\\c', 'a\\x\\y', 'a\\x'];
      expect_deepEqual(mm(fixtures, 'a/[b-c]', { format }), []);
      expect_deepEqual(mm(fixtures, 'a/[a-z]', { format }), []);
    });

    test('should support negation patterns', () => {
      let fixtures = ['a\\a', 'a\\b', 'a\\c', 'b\\a', 'b\\b', 'b\\c'];
      expect_deepEqual(mm(fixtures, '!*/*', { format }), fixtures);
      expect_deepEqual(mm(fixtures, '!*/b', { format }), fixtures);
      expect_deepEqual(mm(fixtures, '!a/*', { format }), fixtures);
      expect_deepEqual(mm(fixtures, '!a/b', { format }), fixtures);
      expect_deepEqual(mm(fixtures, '!a/(b)', { format }), fixtures);
      expect_deepEqual(mm(fixtures, '!a/(*)', { format }), fixtures);
      expect_deepEqual(mm(fixtures, '!(*/b)', { format }), fixtures);
      expect_deepEqual(mm(fixtures, '!(a/b)', { format }), fixtures);

      expect_deepEqual(mm(fixtures, '!*/*', { windows: true }), []);
      expect_deepEqual(mm(fixtures, ['!*/b'], { windows: true }), ['a/a', 'a/c', 'b/a', 'b/c']);
      expect_deepEqual(mm(fixtures, ['!a/*'], { windows: true }), ['b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, ['!a/b'], { windows: true }), ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, ['!a/(b)'], { windows: true }), ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, ['!a/(*)'], { windows: true }), ['b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, ['!(*/b)'], { windows: true }), ['a/a', 'a/c', 'b/a', 'b/c']);
      expect_deepEqual(mm(fixtures, ['!(a/b)'], { windows: true }), ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
    });
  });

  describe('windows paths', () => {
    beforeEach(() => {
      (path as any).sep = '\\';
    });

    afterEach(() => {
      (path as any).sep = sep;
    });

    test('should return an array of matches for a literal string', () => {
      let fixtures = ['a\\a', 'a\\b', 'a\\c', 'b\\a', 'b\\b', 'b\\c'];
      expect_deepEqual(mm(fixtures, '(a/b)'), ['a/b']);
      expect_deepEqual(mm(fixtures, '(a/b)', { windows: false }), []);
      expect_deepEqual(mm(fixtures, 'a/b'), ['a/b']);
      expect_deepEqual(mm(fixtures, 'a/b', { windows: false }), []);
    });

    test('should support regex logical or', () => {
      let fixtures = ['a\\a', 'a\\b', 'a\\c'];
      expect_deepEqual(mm(fixtures, 'a/(a|c)'), ['a/a', 'a/c']);
      expect_deepEqual(mm(fixtures, 'a/(a|b|c)'), ['a/a', 'a/b', 'a/c']);
    });

    test('should support regex ranges', () => {
      let fixtures = ['a\\a', 'a\\b', 'a\\c', 'a\\x\\y', 'a\\x'];
      expect_deepEqual(mm(fixtures, 'a/[b-c]'), ['a/b', 'a/c']);
      expect_deepEqual(mm(fixtures, 'a/[a-z]'), ['a/a', 'a/b', 'a/c', 'a/x']);
    });

    test('should support negation patterns', () => {
      let fixtures = ['a\\a', 'a\\b', 'a\\c', 'b\\a', 'b\\b', 'b\\c'];
      expect_deepEqual(mm(fixtures, '!*/*'), []);
      expect_deepEqual(mm(fixtures, '!*/b'), ['a/a', 'a/c', 'b/a', 'b/c']);
      expect_deepEqual(mm(fixtures, '!a/*'), ['b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, '!a/b'), ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, '!a/(b)'), ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, '!a/(*)'), ['b/a', 'b/b', 'b/c']);
      expect_deepEqual(mm(fixtures, '!(*/b)'), ['a/a', 'a/c', 'b/a', 'b/c']);
      expect_deepEqual(mm(fixtures, '!(a/b)'), ['a/a', 'a/c', 'b/a', 'b/b', 'b/c']);
    });
  });
});
