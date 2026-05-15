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

const isWindows = () => process.platform === 'win32' || (path as any).sep === '\\';
const format = str => str.replace(/\\/g, '/').replace(/^\.\//, '');

// from the Bash 4.3 specification/unit tests
const fixtures = ['\\\\', '*', '**', '\\*', 'a', 'a/*', 'abc', 'abd', 'abe', 'b', 'bb', 'bcd', 'bdir/', 'Beware', 'c', 'ca', 'cb', 'd', 'dd', 'de'];

describe('bash options and features:', () => {
  // $echo a/{1..3}/b
  describe('bash', () => {
    test('should handle "regular globbing":', () => {
      expect_deepEqual(mm(fixtures, 'a*'), ['a', 'abc', 'abd', 'abe']);
      expect_deepEqual(mm(fixtures, '\\a*'), ['a', 'abc', 'abd', 'abe']);
    });

    test('should match directories:', () => {
      expect_deepEqual(mm(fixtures, 'b*/'), ['bdir/']);
    });

    test('should use quoted characters as literals:', () => {
      expect_deepEqual(mm(fixtures, '\\*', { windows: false }), ['*', '\\*']);
      expect_deepEqual(mm(fixtures, '\\^', { windows: false }), []);
      expect_deepEqual(mm(fixtures, 'a\\*', { windows: false }), []);
      expect_deepEqual(mm(fixtures, ['a\\*', '\\*'], { windows: false }), ['*', '\\*']);
      expect_deepEqual(mm(fixtures, ['a\\*'], { windows: false }), []);
      expect_deepEqual(mm(fixtures, ['c*', 'a\\*', '*q*'], { windows: false }), ['c', 'ca', 'cb']);
    });

    test('should support quoted characters', () => {
      expect_deepEqual(mm(['***'], '"***"'), ['***']);
      expect_deepEqual(mm(['"***"'], '"***"'), ['"***"']);
      expect_deepEqual(mm(['*', '**', '*foo', 'bar'], '"*"*'), ['*', '**', '*foo']);
    });

    test('should respect escaped characters', () => {
      expect_deepEqual(mm(fixtures, '\\**', { windows: false }), ['*', '**']);
    });

    test('should respect escaped paths/dots:', () => {
      let format = str => str.replace(/\\/g, '');
      expect_deepEqual(mm(['"\\.\\./*/"'], '"\\.\\./*/"', { windows: false }), ['"\\.\\./*/"']);
      expect_deepEqual(mm(['"\\.\\./*/"'], '"\\.\\./*/"', { format, windows: false }), ['"../*/"']);
      expect_deepEqual(mm(['s/\\..*//'], 's/\\..*//', { windows: false }), ['s/\\..*//']);
    });

    test("Pattern from Larry Wall's Configure that caused bash to blow up:", () => {
      expect_deepEqual(mm(['"/^root:/{s/^[^:]*:[^:]*:\\([^:]*\\).*"\'$\'"/\\1/"'], '"/^root:/{s/^[^:]*:[^:]*:\\([^:]*\\).*"\'$\'"/\\1/"', { windows: false }), ['"/^root:/{s/^[^:]*:[^:]*:\\([^:]*\\).*"\'$\'"/\\1/"']);
      expect_deepEqual(mm(fixtures, '[a-c]b*'), ['abc', 'abd', 'abe', 'bb', 'cb']);
    });

    test('should support character classes', () => {
      let f = fixtures.slice();
      f.push('baz', 'bzz', 'BZZ', 'beware', 'BewAre');
      f.sort();

      expect_deepEqual(mm(f, 'a*[^c]'), ['abd', 'abe']);
      expect_deepEqual(mm(['a-b', 'aXb'], 'a[X-]b'), ['a-b', 'aXb']);
      expect_deepEqual(mm(f, '[a-y]*[^c]'), ['abd', 'abe', 'baz', 'bb', 'bcd', 'bdir/', 'beware', 'bzz', 'ca', 'cb', 'dd', 'de']);
      expect_deepEqual(mm(['a*b/ooo'], 'a\\*b/*'), ['a*b/ooo']);
      expect_deepEqual(mm(['a*b/ooo'], 'a\\*?/*'), ['a*b/ooo']);
      expect_deepEqual(mm(f, 'a[b]c'), ['abc']);
      expect_deepEqual(mm(f, 'a["b"]c'), ['abc']);
      expect_deepEqual(mm(f, 'a[\\\\b]c'), ['abc']); //<= backslash and a "b"
      expect_deepEqual(mm(f, 'a[\\b]c'), []); //<= word boundary in a character class
      expect_deepEqual(mm(f, 'a[b-d]c'), ['abc']);
      expect_deepEqual(mm(f, 'a?c'), ['abc']);
      expect_deepEqual(mm(['a-b'], 'a[]-]b'), ['a-b']);
      expect_deepEqual(mm(['man/man1/bash.1'], '*/man*/bash.*'), ['man/man1/bash.1']);

      if (isWindows()) {
        // should not match backslashes on windows, since backslashes are path
        // separators and negation character classes should not match path separators
        // unless it's explicitly defined in the character class
        expect_deepEqual(mm(f, '[^a-c]*'), ['d', 'dd', 'de', 'Beware', 'BewAre', 'BZZ', '*', '**', '\\*'].sort());
        expect_deepEqual(mm(f, '[^a-c]*', { bash: false }), ['d', 'dd', 'de', 'BewAre', 'Beware', 'BZZ', '*', '**', '\\*'].sort());
        expect_deepEqual(mm(f, '[^a-c]*', { nocase: true }), ['d', 'dd', 'de', '*', '**', '\\*'].sort());
      } else {
        expect_deepEqual(mm(f, '[^a-c]*'), ['*', '**', 'BZZ', 'BewAre', 'Beware', '\\*', 'd', 'dd', 'de', '\\\\'].sort());
        expect_deepEqual(mm(f, '[^a-c]*', { bash: false }), ['*', '**', 'BZZ', 'BewAre', 'Beware', '\\*', 'd', 'dd', 'de', '\\\\'].sort());
        expect_deepEqual(mm(f, '[^a-c]*', { nocase: true }), ['*', '**', '\\*', 'd', 'dd', 'de', '\\\\'].sort());
      }
    });

    test('should support basic wildmatch (brackets) features', () => {
      expect_truthy(!mm.isMatch('aab', 'a[]-]b'));
      expect_truthy(!mm.isMatch('ten', '[ten]'));
      expect_truthy(!mm.isMatch('ten', 't[!a-g]n', { posix: true }));
      expect_truthy(mm.isMatch(']', ']'));
      expect_truthy(mm.isMatch('a-b', 'a[]-]b'));
      expect_truthy(mm.isMatch('a]b', 'a[]-]b'));
      expect_truthy(mm.isMatch('a]b', 'a[]]b'));
      expect_truthy(mm.isMatch('aab', 'a[\\]a\\-]b'));
      expect_truthy(mm.isMatch('ten', 't[a-g]n'));
      expect_truthy(mm.isMatch('ton', 't[!a-g]n', { posix: true }));
      expect_truthy(mm.isMatch('ton', 't[^a-g]n'));
    });

    test('should support extended slash-matching features', () => {
      expect_truthy(!mm.isMatch('foo/bar', 'f[^eiu][^eiu][^eiu][^eiu][^eiu]r'));
      expect_truthy(mm.isMatch('foo/bar', 'foo[/]bar'));
      expect_truthy(mm.isMatch('foo-bar', 'f[^eiu][^eiu][^eiu][^eiu][^eiu]r'));
    });

    test('should match literal parens', () => {
      expect_truthy(mm.isMatch('foo(bar)baz', 'foo[bar()]+baz'));
    });

    test('should match escaped characters', () => {
      expect_truthy(!mm.isMatch('', '\\'));

      if (isWindows()) {
        expect_truthy(!mm.isMatch('XXX/\\', '[A-Z]+/\\'));
        expect_truthy(!mm.isMatch('XXX/\\', '[A-Z]+/\\\\'));
      } else {
        expect_truthy(mm.isMatch('XXX/\\', '[A-Z]+/\\'));
        expect_truthy(mm.isMatch('XXX/\\', '[A-Z]+/\\\\'));
      }

      expect_truthy(mm.isMatch('\\', '\\'));
      expect_truthy(mm.isMatch('[ab]', '\\[ab]'));
      expect_truthy(mm.isMatch('[ab]', '[\\[:]ab]'));
    });

    test('should match brackets', () => {
      expect_truthy(!mm.isMatch(']', '[^]-]'));
      expect_truthy(!mm.isMatch(']', '[!]-]'));
      expect_truthy(mm.isMatch('a', '[^]-]'));
      expect_truthy(mm.isMatch('a', '[!]-]', { posix: true }));
      expect_truthy(mm.isMatch('[ab]', '[[]ab]'));
    });

    test('should regard multiple consecutive stars as a single star', () => {
      expect_deepEqual(mm(['bbc', 'abc', 'bbd'], 'a**c'), ['abc']);
      expect_deepEqual(mm(['bbc', 'abc', 'bbd'], 'a***c'), ['abc']);
      expect_deepEqual(mm(['bbc', 'abc', 'bbc'], 'a*****?c'), ['abc']);
      expect_deepEqual(mm(['bbc', 'abc'], '?*****??'), ['bbc', 'abc']);
      expect_deepEqual(mm(['bbc', 'abc'], '*****??'), ['bbc', 'abc']);
      expect_deepEqual(mm(['bbc', 'abc'], '?*****?c'), ['bbc', 'abc']);
      expect_deepEqual(mm(['bbc', 'abc', 'bbd'], '?***?****c'), ['bbc', 'abc']);
      expect_deepEqual(mm(['bbc', 'abc'], '?***?****?'), ['bbc', 'abc']);
      expect_deepEqual(mm(['bbc', 'abc'], '?***?****'), ['bbc', 'abc']);
      expect_deepEqual(mm(['bbc', 'abc'], '*******c'), ['bbc', 'abc']);
      expect_deepEqual(mm(['bbc', 'abc'], '*******?'), ['bbc', 'abc']);
      expect_deepEqual(mm(['abcdecdhjk'], 'a*cd**?**??k'), ['abcdecdhjk']);
      expect_deepEqual(mm(['abcdecdhjk'], 'a**?**cd**?**??k'), ['abcdecdhjk']);
      expect_deepEqual(mm(['abcdecdhjk'], 'a**?**cd**?**??k***'), ['abcdecdhjk']);
      expect_deepEqual(mm(['abcdecdhjk'], 'a**?**cd**?**??***k'), ['abcdecdhjk']);
      expect_deepEqual(mm(['abcdecdhjk'], 'a**?**cd**?**??***k**'), ['abcdecdhjk']);
      expect_deepEqual(mm(['abcdecdhjk'], 'a****c**?**??*****'), ['abcdecdhjk']);
    });

    test('none of these should output anything:', () => {
      expect_deepEqual(mm(['abc'], '??**********?****?'), []);
      expect_deepEqual(mm(['abc'], '??**********?****c'), []);
      expect_deepEqual(mm(['abc'], '?************c****?****'), []);
      expect_deepEqual(mm(['abc'], '*c*?**'), []);
      expect_deepEqual(mm(['abc'], 'a*****c*?**'), []);
      expect_deepEqual(mm(['abc'], 'a********???*******'), []);
      expect_deepEqual(mm(['a'], '[]'), []);
      expect_deepEqual(mm(['['], '[abc'), []);
    });
  });

  describe('wildmat', () => {
    test('Basic wildmat features', () => {
      expect_truthy(!mm.isMatch('foo', '*f'));
      expect_truthy(!mm.isMatch('foo', '??'));
      expect_truthy(!mm.isMatch('foo', 'bar'));
      expect_truthy(!mm.isMatch('foobar', 'foo\\*bar'));
      expect_truthy(mm.isMatch('?a?b', '\\??\\?b'));
      expect_truthy(mm.isMatch('aaaaaaabababab', '*ab'));
      expect_truthy(mm.isMatch('f\\oo', 'f\\oo'));
      expect_truthy(mm.isMatch('foo', '*'));
      expect_truthy(mm.isMatch('foo', '*foo*'));
      expect_truthy(mm.isMatch('foo', '???'));
      expect_truthy(mm.isMatch('foo', 'f*'));
      expect_truthy(mm.isMatch('foo', 'foo'));
      expect_truthy(mm.isMatch('foo*', 'foo\\*', { toPosixSlashes: false }));
      expect_truthy(mm.isMatch('foobar', '*ob*a*r*'));
    });

    test('should support recursion', () => {
      expect_truthy(!mm.isMatch('-adobe-courier-bold-o-normal--12-120-75-75-/-70-iso8859-1', '-*-*-*-*-*-*-12-*-*-*-m-*-*-*'));
      expect_truthy(!mm.isMatch('-adobe-courier-bold-o-normal--12-120-75-75-X-70-iso8859-1', '-*-*-*-*-*-*-12-*-*-*-m-*-*-*'));
      expect_truthy(!mm.isMatch('ab/cXd/efXg/hi', '*X*i'));
      expect_truthy(!mm.isMatch('ab/cXd/efXg/hi', '*Xg*i'));
      expect_truthy(!mm.isMatch('abcd/abcdefg/abcdefghijk/abcdefghijklmnop.txtz', '**/*a*b*g*n*t'));
      expect_truthy(!mm.isMatch('foo', '*/*/*'));
      expect_truthy(!mm.isMatch('foo', 'fo'));
      expect_truthy(!mm.isMatch('foo/bar', '*/*/*'));
      expect_truthy(!mm.isMatch('foo/bar', 'foo?bar'));
      expect_truthy(!mm.isMatch('foo/bb/aa/rr', '*/*/*'));
      expect_truthy(!mm.isMatch('foo/bba/arr', 'foo*'));
      expect_truthy(!mm.isMatch('foo/bba/arr', 'foo**'));
      expect_truthy(!mm.isMatch('foo/bba/arr', 'foo/*'));
      expect_truthy(!mm.isMatch('foo/bba/arr', 'foo/**arr'));
      expect_truthy(!mm.isMatch('foo/bba/arr', 'foo/**z'));
      expect_truthy(!mm.isMatch('foo/bba/arr', 'foo/*arr'));
      expect_truthy(!mm.isMatch('foo/bba/arr', 'foo/*z'));
      expect_truthy(!mm.isMatch('XXX/adobe/courier/bold/o/normal//12/120/75/75/X/70/iso8859/1', 'XXX/*/*/*/*/*/*/12/*/*/*/m/*/*/*'));
      expect_truthy(mm.isMatch('-adobe-courier-bold-o-normal--12-120-75-75-m-70-iso8859-1', '-*-*-*-*-*-*-12-*-*-*-m-*-*-*'));
      expect_truthy(mm.isMatch('ab/cXd/efXg/hi', '**/*X*/**/*i'));
      expect_truthy(mm.isMatch('ab/cXd/efXg/hi', '*/*X*/*/*i'));
      expect_truthy(mm.isMatch('abcd/abcdefg/abcdefghijk/abcdefghijklmnop.txt', '**/*a*b*g*n*t'));
      expect_truthy(mm.isMatch('abcXdefXghi', '*X*i'));
      expect_truthy(mm.isMatch('foo', 'foo'));
      expect_truthy(mm.isMatch('foo/bar', 'foo/*'));
      expect_truthy(mm.isMatch('foo/bar', 'foo/bar'));
      expect_truthy(mm.isMatch('foo/bar', 'foo[/]bar'));
      expect_truthy(mm.isMatch('foo/bb/aa/rr', '**/**/**'));
      expect_truthy(mm.isMatch('foo/bba/arr', '*/*/*'));
      expect_truthy(mm.isMatch('foo/bba/arr', 'foo/**'));
      expect_truthy(mm.isMatch('XXX/adobe/courier/bold/o/normal//12/120/75/75/m/70/iso8859/1', 'XXX/*/*/*/*/*/*/12/*/*/*/m/*/*/*', { toPosixSlashes: false }));
    });
  });
});
