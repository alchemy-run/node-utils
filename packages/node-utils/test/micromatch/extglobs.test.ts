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


const mm = micromatch;
const { isMatch } = mm;

/**
 * Most of these tests were converted directly from bash 4.3 and 4.4 unit tests.
 */

describe('extglobs', () => {
  test('should throw on imbalanced sets when `options.strictBrackets` is true', () => {
    expect_throws(() => mm.makeRe('a(b', { strictBrackets: true }), /missing closing: "\)"/i);
    expect_throws(() => mm.makeRe('a)b', { strictBrackets: true }), /missing opening: "\("/i);
  });

  test('should match extglobs ending with statechar', () => {
    expect_truthy(!isMatch('ax', 'a?(b*)'));
    expect_truthy(isMatch('ax', '?(a*|b)'));
  });

  test('should not choke on non-extglobs', () => {
    expect_truthy(isMatch('c/z/v', 'c/z/v'));
  });

  test('should work with file extensions', () => {
    expect_truthy(!isMatch('.md', '@(a|b).md'));
    expect_truthy(!isMatch('a.js', '@(a|b).md'));
    expect_truthy(isMatch('a.md', '@(a|b).md'));
    expect_truthy(isMatch('b.md', '@(a|b).md'));
    expect_truthy(!isMatch('c.md', '@(a|b).md'));

    expect_truthy(!isMatch('.md', '+(a|b).md'));
    expect_truthy(!isMatch('a.js', '+(a|b).md'));
    expect_truthy(isMatch('a.md', '+(a|b).md'));
    expect_truthy(isMatch('aa.md', '+(a|b).md'));
    expect_truthy(isMatch('ab.md', '+(a|b).md'));
    expect_truthy(isMatch('b.md', '+(a|b).md'));
    expect_truthy(isMatch('bb.md', '+(a|b).md'));
    expect_truthy(!isMatch('c.md', '+(a|b).md'));

    expect_truthy(isMatch('.md', '*(a|b).md'));
    expect_truthy(!isMatch('a.js', '*(a|b).md'));
    expect_truthy(isMatch('a.md', '*(a|b).md'));
    expect_truthy(isMatch('aa.md', '*(a|b).md'));
    expect_truthy(isMatch('ab.md', '*(a|b).md'));
    expect_truthy(isMatch('b.md', '*(a|b).md'));
    expect_truthy(isMatch('bb.md', '*(a|b).md'));
    expect_truthy(!isMatch('c.md', '*(a|b).md'));
  });

  test('should support !(...)', () => {
    // these are correct, since * is greedy and matches before ! can negate
    expect_truthy(isMatch('file.txt', '*!(.jpg|.gif)'));
    expect_truthy(isMatch('file.jpg', '*!(.jpg|.gif)'));
    expect_truthy(isMatch('file.gif', '*!(.jpg|.gif)'));

    // this is how you negate extensions
    expect_truthy(!isMatch('file.jpg', '!(*.jpg|*.gif)'));
    expect_truthy(!isMatch('file.gif', '!(*.jpg|*.gif)'));

    expect_truthy(!isMatch('moo.cow', '!(moo).!(cow)'));
    expect_truthy(!isMatch('foo.cow', '!(moo).!(cow)'));
    expect_truthy(!isMatch('moo.bar', '!(moo).!(cow)'));
    expect_truthy(isMatch('foo.bar', '!(moo).!(cow)'));
    expect_truthy(isMatch('moo.cow', '!(!(moo)).!(!(cow))'));
    expect_truthy(isMatch('moo.bar', '@(moo).!(cow)'));
    expect_truthy(isMatch('moomoo.bar', '+(moo).!(cow)'));
    expect_truthy(isMatch('moomoo.bar', '+(moo)*(foo).!(cow)'));
    expect_truthy(isMatch('moomoofoo.bar', '+(moo)*(foo).!(cow)'));
    expect_truthy(isMatch('moomoofoofoo.bar', '+(moo)*(foo).!(cow)'));
    expect_truthy(!isMatch('c/z/v', 'c/!(z)/v'));
    expect_truthy(isMatch('c/a/v', 'c/!(z)/v'));

    expect_truthy(!isMatch('c/z', 'a!(z)'));
    expect_truthy(isMatch('abz', 'a!(z)'));
    expect_truthy(!isMatch('az', 'a!(z)'));

    expect_truthy(!isMatch('a/z', 'a/!(z)'));
    expect_truthy(isMatch('a/b', 'a/!(z)'));

    expect_truthy(!isMatch('c/z', 'a*!(z)'));
    expect_truthy(isMatch('abz', 'a*!(z)'));
    expect_truthy(isMatch('az', 'a*!(z)'));

    expect_truthy(isMatch('a/a', '!(b/a)'));
    expect_truthy(isMatch('a/b', '!(b/a)'));
    expect_truthy(isMatch('a/c', '!(b/a)'));
    expect_truthy(!isMatch('b/a', '!(b/a)'));
    expect_truthy(isMatch('b/b', '!(b/a)'));
    expect_truthy(isMatch('b/c', '!(b/a)'));

    expect_truthy(isMatch('a/a', '!(b/a)'));
    expect_truthy(isMatch('a/b', '!(b/a)'));
    expect_truthy(isMatch('a/c', '!(b/a)'));
    expect_truthy(!isMatch('b/a', '!(b/a)'));
    expect_truthy(isMatch('b/b', '!(b/a)'));
    expect_truthy(isMatch('b/c', '!(b/a)'));

    expect_truthy(isMatch('a/a', '!((b/a))'));
    expect_truthy(isMatch('a/b', '!((b/a))'));
    expect_truthy(isMatch('a/c', '!((b/a))'));
    expect_truthy(!isMatch('b/a', '!((b/a))'));
    expect_truthy(isMatch('b/b', '!((b/a))'));
    expect_truthy(isMatch('b/c', '!((b/a))'));

    expect_truthy(isMatch('a/a', '!((?:b/a))'));
    expect_truthy(isMatch('a/b', '!((?:b/a))'));
    expect_truthy(isMatch('a/c', '!((?:b/a))'));
    expect_truthy(!isMatch('b/a', '!((?:b/a))'));
    expect_truthy(isMatch('b/b', '!((?:b/a))'));
    expect_truthy(isMatch('b/c', '!((?:b/a))'));

    expect_truthy(isMatch('a/a', '!(b/(a))'));
    expect_truthy(isMatch('a/b', '!(b/(a))'));
    expect_truthy(isMatch('a/c', '!(b/(a))'));
    expect_truthy(!isMatch('b/a', '!(b/(a))'));
    expect_truthy(isMatch('b/b', '!(b/(a))'));
    expect_truthy(isMatch('b/c', '!(b/(a))'));

    expect_truthy(isMatch('a/a', '!(b/a)'));
    expect_truthy(isMatch('a/b', '!(b/a)'));
    expect_truthy(isMatch('a/c', '!(b/a)'));
    expect_truthy(!isMatch('b/a', '!(b/a)'));
    expect_truthy(isMatch('b/b', '!(b/a)'));
    expect_truthy(isMatch('b/c', '!(b/a)'));

    expect_truthy(!isMatch('a   ', '@(!(a) )*'));
    expect_truthy(!isMatch('a   b', '@(!(a) )*'));
    expect_truthy(!isMatch('a  b', '@(!(a) )*'));
    expect_truthy(!isMatch('a  ', '@(!(a) )*'));
    expect_truthy(!isMatch('a ', '@(!(a) )*'));
    expect_truthy(!isMatch('a', '@(!(a) )*'));
    expect_truthy(!isMatch('aa', '@(!(a) )*'));
    expect_truthy(!isMatch('b', '@(!(a) )*'));
    expect_truthy(!isMatch('bb', '@(!(a) )*'));
    expect_truthy(isMatch(' a ', '@(!(a) )*'));
    expect_truthy(isMatch('b  ', '@(!(a) )*'));
    expect_truthy(isMatch('b ', '@(!(a) )*'));

    expect_truthy(!isMatch('a', '!(a)'));
    expect_truthy(isMatch('aa', '!(a)'));
    expect_truthy(isMatch('b', '!(a)'));

    expect_truthy(!isMatch('a', '!(a*)'));
    expect_truthy(!isMatch('aa', '!(a*)'));
    expect_truthy(!isMatch('ab', '!(a*)'));
    expect_truthy(isMatch('b', '!(a*)'));

    expect_truthy(!isMatch('a', '!(*a*)'));
    expect_truthy(!isMatch('aa', '!(*a*)'));
    expect_truthy(!isMatch('ab', '!(*a*)'));
    expect_truthy(!isMatch('ac', '!(*a*)'));
    expect_truthy(isMatch('b', '!(*a*)'));

    expect_truthy(!isMatch('a', '!(*a)'));
    expect_truthy(!isMatch('aa', '!(*a)'));
    expect_truthy(!isMatch('bba', '!(*a)'));
    expect_truthy(isMatch('ab', '!(*a)'));
    expect_truthy(isMatch('ac', '!(*a)'));
    expect_truthy(isMatch('b', '!(*a)'));

    expect_truthy(!isMatch('a', '!(*a)*'));
    expect_truthy(!isMatch('aa', '!(*a)*'));
    expect_truthy(!isMatch('bba', '!(*a)*'));
    expect_truthy(!isMatch('ab', '!(*a)*'));
    expect_truthy(!isMatch('ac', '!(*a)*'));
    expect_truthy(isMatch('b', '!(*a)*'));

    expect_truthy(!isMatch('a', '!(a)*'));
    expect_truthy(!isMatch('abb', '!(a)*'));
    expect_truthy(isMatch('ba', '!(a)*'));

    expect_truthy(isMatch('aa', 'a!(b)*'));
    expect_truthy(!isMatch('ab', 'a!(b)*'));
    expect_truthy(!isMatch('aba', 'a!(b)*'));
    expect_truthy(isMatch('ac', 'a!(b)*'));

    expect_truthy(isMatch('aac', 'a!(b)c'));
    expect_truthy(!isMatch('abc', 'a!(b)c'));
    expect_truthy(isMatch('acc', 'a!(b)c'));

    expect_truthy(!isMatch('a.c', 'a!(.)c'));
    expect_truthy(isMatch('abc', 'a!(.)c'));
  });

  test('should support logical-or inside negation !(...) extglobs', () => {
    expect_truthy(!isMatch('ac', '!(a|b)c'));
    expect_truthy(!isMatch('bc', '!(a|b)c'));
    expect_truthy(isMatch('cc', '!(a|b)c'));
  });

  test('should support multiple negation !(...) extglobs in one expression', () => {
    expect_truthy(!isMatch('ac.d', '!(a|b)c.!(d|e)'));
    expect_truthy(!isMatch('bc.d', '!(a|b)c.!(d|e)'));
    expect_truthy(!isMatch('cc.d', '!(a|b)c.!(d|e)'));
    expect_truthy(!isMatch('ac.e', '!(a|b)c.!(d|e)'));
    expect_truthy(!isMatch('bc.e', '!(a|b)c.!(d|e)'));
    expect_truthy(!isMatch('cc.e', '!(a|b)c.!(d|e)'));
    expect_truthy(!isMatch('ac.f', '!(a|b)c.!(d|e)'));
    expect_truthy(!isMatch('bc.f', '!(a|b)c.!(d|e)'));
    expect_truthy(isMatch('cc.f', '!(a|b)c.!(d|e)'));
    expect_truthy(isMatch('dc.g', '!(a|b)c.!(d|e)'));
  });

  test('should support nested negation !(...) extglobs', () => {
    expect_truthy(isMatch('ac.d', '!(!(a|b)c.!(d|e))'));
    expect_truthy(isMatch('bc.d', '!(!(a|b)c.!(d|e))'));
    expect_truthy(!isMatch('cc.d', '!(a|b)c.!(d|e)'));
    expect_truthy(isMatch('cc.d', '!(!(a|b)c.!(d|e))'));
    expect_truthy(isMatch('cc.d', '!(!(a|b)c.!(d|e))'));
    expect_truthy(isMatch('ac.e', '!(!(a|b)c.!(d|e))'));
    expect_truthy(isMatch('bc.e', '!(!(a|b)c.!(d|e))'));
    expect_truthy(isMatch('cc.e', '!(!(a|b)c.!(d|e))'));
    expect_truthy(isMatch('ac.f', '!(!(a|b)c.!(d|e))'));
    expect_truthy(isMatch('bc.f', '!(!(a|b)c.!(d|e))'));
    expect_truthy(!isMatch('cc.f', '!(!(a|b)c.!(d|e))'));
    expect_truthy(!isMatch('dc.g', '!(!(a|b)c.!(d|e))'));
  });

  test('should support *(...)', () => {
    expect_truthy(isMatch('a', 'a*(z)'));
    expect_truthy(isMatch('az', 'a*(z)'));
    expect_truthy(isMatch('azz', 'a*(z)'));
    expect_truthy(isMatch('azzz', 'a*(z)'));
    expect_truthy(!isMatch('abz', 'a*(z)'));
    expect_truthy(!isMatch('cz', 'a*(z)'));

    expect_truthy(!isMatch('a/a', '*(b/a)'));
    expect_truthy(!isMatch('a/b', '*(b/a)'));
    expect_truthy(!isMatch('a/c', '*(b/a)'));
    expect_truthy(isMatch('b/a', '*(b/a)'));
    expect_truthy(!isMatch('b/b', '*(b/a)'));
    expect_truthy(!isMatch('b/c', '*(b/a)'));

    expect_truthy(!isMatch('cz', 'a**(z)'));
    expect_truthy(isMatch('abz', 'a**(z)'));
    expect_truthy(isMatch('az', 'a**(z)'));

    expect_truthy(!isMatch('c/z/v', '*(z)'));
    expect_truthy(isMatch('z', '*(z)'));
    expect_truthy(!isMatch('zf', '*(z)'));
    expect_truthy(!isMatch('fz', '*(z)'));

    expect_truthy(!isMatch('c/a/v', 'c/*(z)/v'));
    expect_truthy(isMatch('c/z/v', 'c/*(z)/v'));

    expect_truthy(!isMatch('a.md.js', '*.*(js).js'));
    expect_truthy(isMatch('a.js.js', '*.*(js).js'));
  });

  test('should support +(...) extglobs', () => {
    expect_truthy(!isMatch('a', 'a+(z)'));
    expect_truthy(isMatch('az', 'a+(z)'));
    expect_truthy(!isMatch('cz', 'a+(z)'));
    expect_truthy(!isMatch('abz', 'a+(z)'));
    expect_truthy(!isMatch('a+z', 'a+(z)'));
    expect_truthy(isMatch('a+z', 'a++(z)'));
    expect_truthy(!isMatch('c+z', 'a+(z)'));
    expect_truthy(!isMatch('a+bz', 'a+(z)'));
    expect_truthy(!isMatch('az', '+(z)'));
    expect_truthy(!isMatch('cz', '+(z)'));
    expect_truthy(!isMatch('abz', '+(z)'));
    expect_truthy(!isMatch('fz', '+(z)'));
    expect_truthy(isMatch('z', '+(z)'));
    expect_truthy(isMatch('zz', '+(z)'));
    expect_truthy(isMatch('c/z/v', 'c/+(z)/v'));
    expect_truthy(isMatch('c/zz/v', 'c/+(z)/v'));
    expect_truthy(!isMatch('c/a/v', 'c/+(z)/v'));
  });

  test('should support ?(...) extglobs', () => {
    expect_truthy(isMatch('a?z', 'a??(z)'));

    expect_truthy(!isMatch('a?z', 'a?(z)'));
    expect_truthy(!isMatch('abz', 'a?(z)'));
    expect_truthy(!isMatch('z', 'a?(z)'));
    expect_truthy(isMatch('a', 'a?(z)'));
    expect_truthy(isMatch('az', 'a?(z)'));

    expect_truthy(!isMatch('abz', '?(z)'));
    expect_truthy(!isMatch('az', '?(z)'));
    expect_truthy(!isMatch('cz', '?(z)'));
    expect_truthy(!isMatch('fz', '?(z)'));
    expect_truthy(!isMatch('zz', '?(z)'));
    expect_truthy(isMatch('z', '?(z)'));

    expect_truthy(!isMatch('c/a/v', 'c/?(z)/v'));
    expect_truthy(!isMatch('c/zz/v', 'c/?(z)/v'));
    expect_truthy(isMatch('c/z/v', 'c/?(z)/v'));
  });

  test('should support @(...) extglobs', () => {
    expect_truthy(isMatch('c/z/v', 'c/@(z)/v'));
    expect_truthy(!isMatch('c/a/v', 'c/@(z)/v'));
    expect_truthy(isMatch('moo.cow', '@(*.*)'));

    expect_truthy(!isMatch('cz', 'a*@(z)'));
    expect_truthy(isMatch('abz', 'a*@(z)'));
    expect_truthy(isMatch('az', 'a*@(z)'));

    expect_truthy(!isMatch('cz', 'a@(z)'));
    expect_truthy(!isMatch('abz', 'a@(z)'));
    expect_truthy(isMatch('az', 'a@(z)'));
  });

  test('should support qmark matching', () => {
    expect_truthy(isMatch('a', '?'));
    expect_truthy(!isMatch('aa', '?'));
    expect_truthy(!isMatch('ab', '?'));
    expect_truthy(!isMatch('aaa', '?'));
    expect_truthy(!isMatch('abcdefg', '?'));

    expect_truthy(!isMatch('a', '??'));
    expect_truthy(isMatch('aa', '??'));
    expect_truthy(isMatch('ab', '??'));
    expect_truthy(!isMatch('aaa', '??'));
    expect_truthy(!isMatch('abcdefg', '??'));

    expect_truthy(!isMatch('a', '???'));
    expect_truthy(!isMatch('aa', '???'));
    expect_truthy(!isMatch('ab', '???'));
    expect_truthy(isMatch('aaa', '???'));
    expect_truthy(!isMatch('abcdefg', '???'));
  });

  test('should match exactly one of the given pattern:', () => {
    expect_truthy(!isMatch('aa.aa', '(b|a).(a)'));
    expect_truthy(!isMatch('a.bb', '(b|a).(a)'));
    expect_truthy(!isMatch('a.aa.a', '(b|a).(a)'));
    expect_truthy(!isMatch('cc.a', '(b|a).(a)'));
    expect_truthy(isMatch('a.a', '(b|a).(a)'));
    expect_truthy(!isMatch('c.a', '(b|a).(a)'));
    expect_truthy(!isMatch('dd.aa.d', '(b|a).(a)'));
    expect_truthy(isMatch('b.a', '(b|a).(a)'));

    expect_truthy(!isMatch('aa.aa', '@(b|a).@(a)'));
    expect_truthy(!isMatch('a.bb', '@(b|a).@(a)'));
    expect_truthy(!isMatch('a.aa.a', '@(b|a).@(a)'));
    expect_truthy(!isMatch('cc.a', '@(b|a).@(a)'));
    expect_truthy(isMatch('a.a', '@(b|a).@(a)'));
    expect_truthy(!isMatch('c.a', '@(b|a).@(a)'));
    expect_truthy(!isMatch('dd.aa.d', '@(b|a).@(a)'));
    expect_truthy(isMatch('b.a', '@(b|a).@(a)'));
  });

  test('should pass tests from rosenblatt\'s korn shell book', () => {
    expect_truthy(!isMatch('', '*(0|1|3|5|7|9)')); // only one that disagrees, since we don't match empty strings
    expect_truthy(isMatch('137577991', '*(0|1|3|5|7|9)'));
    expect_truthy(!isMatch('2468', '*(0|1|3|5|7|9)'));

    expect_truthy(isMatch('file.c', '*.c?(c)'));
    expect_truthy(!isMatch('file.C', '*.c?(c)'));
    expect_truthy(isMatch('file.cc', '*.c?(c)'));
    expect_truthy(!isMatch('file.ccc', '*.c?(c)'));

    expect_truthy(isMatch('parse.y', '!(*.c|*.h|Makefile.in|config*|README)'));
    expect_truthy(!isMatch('shell.c', '!(*.c|*.h|Makefile.in|config*|README)'));
    expect_truthy(isMatch('Makefile', '!(*.c|*.h|Makefile.in|config*|README)'));
    expect_truthy(!isMatch('Makefile.in', '!(*.c|*.h|Makefile.in|config*|README)'));

    expect_truthy(!isMatch('VMS.FILE;', '*\\;[1-9]*([0-9])'));
    expect_truthy(!isMatch('VMS.FILE;0', '*\\;[1-9]*([0-9])'));
    expect_truthy(isMatch('VMS.FILE;1', '*\\;[1-9]*([0-9])'));
    expect_truthy(isMatch('VMS.FILE;139', '*\\;[1-9]*([0-9])'));
    expect_truthy(!isMatch('VMS.FILE;1N', '*\\;[1-9]*([0-9])'));
  });

  test('tests derived from the pd-ksh test suite', () => {
    expect_truthy(isMatch('abcx', '!([*)*'));
    expect_truthy(isMatch('abcz', '!([*)*'));
    expect_truthy(isMatch('bbc', '!([*)*'));

    expect_truthy(isMatch('abcx', '!([[*])*'));
    expect_truthy(isMatch('abcz', '!([[*])*'));
    expect_truthy(isMatch('bbc', '!([[*])*'));

    expect_truthy(isMatch('abcx', '+(a|b\\[)*'));
    expect_truthy(isMatch('abcz', '+(a|b\\[)*'));
    expect_truthy(!isMatch('bbc', '+(a|b\\[)*'));

    expect_truthy(isMatch('abcx', '+(a|b[)*'));
    expect_truthy(isMatch('abcz', '+(a|b[)*'));
    expect_truthy(!isMatch('bbc', '+(a|b[)*'));

    expect_truthy(!isMatch('abcx', '[a*(]*z'));
    expect_truthy(isMatch('abcz', '[a*(]*z'));
    expect_truthy(!isMatch('bbc', '[a*(]*z'));
    expect_truthy(isMatch('aaz', '[a*(]*z'));
    expect_truthy(isMatch('aaaz', '[a*(]*z'));

    expect_truthy(!isMatch('abcx', '[a*(]*)z'));
    expect_truthy(!isMatch('abcz', '[a*(]*)z'));
    expect_truthy(!isMatch('bbc', '[a*(]*)z'));

    expect_truthy(!isMatch('abc', '+()c'));
    expect_truthy(!isMatch('abc', '+()x'));
    expect_truthy(isMatch('abc', '+(*)c'));
    expect_truthy(!isMatch('abc', '+(*)x'));
    expect_truthy(!isMatch('abc', 'no-file+(a|b)stuff'));
    expect_truthy(!isMatch('abc', 'no-file+(a*(c)|b)stuff'));

    expect_truthy(isMatch('abd', 'a+(b|c)d'));
    expect_truthy(isMatch('acd', 'a+(b|c)d'));

    expect_truthy(!isMatch('abc', 'a+(b|c)d'));

    expect_truthy(isMatch('abd', 'a!(@(b|B))'));
    expect_truthy(isMatch('acd', 'a!(@(b|B))'));
    expect_truthy(isMatch('ac', 'a!(@(b|B))'));
    expect_truthy(!isMatch('ab', 'a!(@(b|B))'));

    expect_truthy(!isMatch('abc', 'a!(@(b|B))d'));
    expect_truthy(!isMatch('abd', 'a!(@(b|B))d'));
    expect_truthy(isMatch('acd', 'a!(@(b|B))d'));

    expect_truthy(isMatch('abd', 'a[b*(foo|bar)]d'));
    expect_truthy(!isMatch('abc', 'a[b*(foo|bar)]d'));
    expect_truthy(!isMatch('acd', 'a[b*(foo|bar)]d'));
  });

  test('stuff from korn\'s book', () => {
    expect_truthy(!isMatch('para', 'para+([0-9])'));
    expect_truthy(!isMatch('para381', 'para?([345]|99)1'));
    expect_truthy(!isMatch('paragraph', 'para*([0-9])'));
    expect_truthy(!isMatch('paramour', 'para@(chute|graph)'));
    expect_truthy(isMatch('para', 'para*([0-9])'));
    expect_truthy(isMatch('para.38', 'para!(*.[0-9])'));
    expect_truthy(isMatch('para.38', 'para!(*.[00-09])'));
    expect_truthy(isMatch('para.graph', 'para!(*.[0-9])'));
    expect_truthy(isMatch('para13829383746592', 'para*([0-9])'));
    expect_truthy(isMatch('para39', 'para!(*.[0-9])'));
    expect_truthy(isMatch('para987346523', 'para+([0-9])'));
    expect_truthy(isMatch('para991', 'para?([345]|99)1'));
    expect_truthy(isMatch('paragraph', 'para!(*.[0-9])'));
    expect_truthy(isMatch('paragraph', 'para@(chute|graph)'));
  });

  test('simple kleene star tests', () => {
    expect_truthy(!isMatch('foo', '*(a|b[)'));
    expect_truthy(!isMatch('(', '*(a|b[)'));
    expect_truthy(!isMatch(')', '*(a|b[)'));
    expect_truthy(!isMatch('|', '*(a|b[)'));
    expect_truthy(isMatch('a', '*(a|b)'));
    expect_truthy(isMatch('b', '*(a|b)'));
    expect_truthy(isMatch('b[', '*(a|b\\[)'));
    expect_truthy(isMatch('ab[', '+(a|b\\[)'));
    expect_truthy(!isMatch('ab[cde', '+(a|b\\[)'));
    expect_truthy(isMatch('ab[cde', '+(a|b\\[)*'));

    expect_truthy(isMatch('foo', '*(a|b|f)*'));
    expect_truthy(isMatch('foo', '*(a|b|o)*'));
    expect_truthy(isMatch('foo', '*(a|b|f|o)'));
    expect_truthy(isMatch('*(a|b[)', '\\*\\(a\\|b\\[\\)'));
    expect_truthy(!isMatch('foo', '*(a|b)'));
    expect_truthy(!isMatch('foo', '*(a|b\\[)'));
    expect_truthy(isMatch('foo', '*(a|b\\[)|f*'));
  });

  test('should support multiple extglobs:', () => {
    expect_truthy(isMatch('moo.cow', '@(*).@(*)'));
    expect_truthy(isMatch('a.a', '*.@(a|b|@(ab|a*@(b))*@(c)d)'));
    expect_truthy(isMatch('a.b', '*.@(a|b|@(ab|a*@(b))*@(c)d)'));
    expect_truthy(!isMatch('a.c', '*.@(a|b|@(ab|a*@(b))*@(c)d)'));
    expect_truthy(!isMatch('a.c.d', '*.@(a|b|@(ab|a*@(b))*@(c)d)'));
    expect_truthy(!isMatch('c.c', '*.@(a|b|@(ab|a*@(b))*@(c)d)'));
    expect_truthy(!isMatch('a.', '*.@(a|b|@(ab|a*@(b))*@(c)d)'));
    expect_truthy(!isMatch('d.d', '*.@(a|b|@(ab|a*@(b))*@(c)d)'));
    expect_truthy(!isMatch('e.e', '*.@(a|b|@(ab|a*@(b))*@(c)d)'));
    expect_truthy(!isMatch('f.f', '*.@(a|b|@(ab|a*@(b))*@(c)d)'));
    expect_truthy(isMatch('a.abcd', '*.@(a|b|@(ab|a*@(b))*@(c)d)'));

    expect_truthy(!isMatch('a.a', '!(*.a|*.b|*.c)'));
    expect_truthy(!isMatch('a.b', '!(*.a|*.b|*.c)'));
    expect_truthy(!isMatch('a.c', '!(*.a|*.b|*.c)'));
    expect_truthy(isMatch('a.c.d', '!(*.a|*.b|*.c)'));
    expect_truthy(!isMatch('c.c', '!(*.a|*.b|*.c)'));
    expect_truthy(isMatch('a.', '!(*.a|*.b|*.c)'));
    expect_truthy(isMatch('d.d', '!(*.a|*.b|*.c)'));
    expect_truthy(isMatch('e.e', '!(*.a|*.b|*.c)'));
    expect_truthy(isMatch('f.f', '!(*.a|*.b|*.c)'));
    expect_truthy(isMatch('a.abcd', '!(*.a|*.b|*.c)'));

    expect_truthy(isMatch('a.a', '!(*.[^a-c])'));
    expect_truthy(isMatch('a.b', '!(*.[^a-c])'));
    expect_truthy(isMatch('a.c', '!(*.[^a-c])'));
    expect_truthy(!isMatch('a.c.d', '!(*.[^a-c])'));
    expect_truthy(isMatch('c.c', '!(*.[^a-c])'));
    expect_truthy(isMatch('a.', '!(*.[^a-c])'));
    expect_truthy(!isMatch('d.d', '!(*.[^a-c])'));
    expect_truthy(!isMatch('e.e', '!(*.[^a-c])'));
    expect_truthy(!isMatch('f.f', '!(*.[^a-c])'));
    expect_truthy(isMatch('a.abcd', '!(*.[^a-c])'));

    expect_truthy(!isMatch('a.a', '!(*.[a-c])'));
    expect_truthy(!isMatch('a.b', '!(*.[a-c])'));
    expect_truthy(!isMatch('a.c', '!(*.[a-c])'));
    expect_truthy(isMatch('a.c.d', '!(*.[a-c])'));
    expect_truthy(!isMatch('c.c', '!(*.[a-c])'));
    expect_truthy(isMatch('a.', '!(*.[a-c])'));
    expect_truthy(isMatch('d.d', '!(*.[a-c])'));
    expect_truthy(isMatch('e.e', '!(*.[a-c])'));
    expect_truthy(isMatch('f.f', '!(*.[a-c])'));
    expect_truthy(isMatch('a.abcd', '!(*.[a-c])'));

    expect_truthy(!isMatch('a.a', '!(*.[a-c]*)'));
    expect_truthy(!isMatch('a.b', '!(*.[a-c]*)'));
    expect_truthy(!isMatch('a.c', '!(*.[a-c]*)'));
    expect_truthy(!isMatch('a.c.d', '!(*.[a-c]*)'));
    expect_truthy(!isMatch('c.c', '!(*.[a-c]*)'));
    expect_truthy(isMatch('a.', '!(*.[a-c]*)'));
    expect_truthy(isMatch('d.d', '!(*.[a-c]*)'));
    expect_truthy(isMatch('e.e', '!(*.[a-c]*)'));
    expect_truthy(isMatch('f.f', '!(*.[a-c]*)'));
    expect_truthy(!isMatch('a.abcd', '!(*.[a-c]*)'));

    expect_truthy(!isMatch('a.a', '*.!(a|b|c)'));
    expect_truthy(!isMatch('a.b', '*.!(a|b|c)'));
    expect_truthy(!isMatch('a.c', '*.!(a|b|c)'));
    expect_truthy(isMatch('a.c.d', '*.!(a|b|c)'));
    expect_truthy(!isMatch('c.c', '*.!(a|b|c)'));
    expect_truthy(isMatch('a.', '*.!(a|b|c)'));
    expect_truthy(isMatch('d.d', '*.!(a|b|c)'));
    expect_truthy(isMatch('e.e', '*.!(a|b|c)'));
    expect_truthy(isMatch('f.f', '*.!(a|b|c)'));
    expect_truthy(isMatch('a.abcd', '*.!(a|b|c)'));

    expect_truthy(isMatch('a.a', '*!(.a|.b|.c)'));
    expect_truthy(isMatch('a.b', '*!(.a|.b|.c)'));
    expect_truthy(isMatch('a.c', '*!(.a|.b|.c)'));
    expect_truthy(isMatch('a.c.d', '*!(.a|.b|.c)'));
    expect_truthy(isMatch('c.c', '*!(.a|.b|.c)'));
    expect_truthy(isMatch('a.', '*!(.a|.b|.c)'));
    expect_truthy(isMatch('d.d', '*!(.a|.b|.c)'));
    expect_truthy(isMatch('e.e', '*!(.a|.b|.c)'));
    expect_truthy(isMatch('f.f', '*!(.a|.b|.c)'));
    expect_truthy(isMatch('a.abcd', '*!(.a|.b|.c)'));

    expect_truthy(!isMatch('a.a', '!(*.[a-c])*'));
    expect_truthy(!isMatch('a.b', '!(*.[a-c])*'));
    expect_truthy(!isMatch('a.c', '!(*.[a-c])*'));
    expect_truthy(!isMatch('a.c.d', '!(*.[a-c])*'));
    expect_truthy(!isMatch('c.c', '!(*.[a-c])*'));
    expect_truthy(isMatch('a.', '!(*.[a-c])*'));
    expect_truthy(isMatch('d.d', '!(*.[a-c])*'));
    expect_truthy(isMatch('e.e', '!(*.[a-c])*'));
    expect_truthy(isMatch('f.f', '!(*.[a-c])*'));
    expect_truthy(!isMatch('a.abcd', '!(*.[a-c])*'));

    expect_truthy(isMatch('a.a', '*!(.a|.b|.c)*'));
    expect_truthy(isMatch('a.b', '*!(.a|.b|.c)*'));
    expect_truthy(isMatch('a.c', '*!(.a|.b|.c)*'));
    expect_truthy(isMatch('a.c.d', '*!(.a|.b|.c)*'));
    expect_truthy(isMatch('c.c', '*!(.a|.b|.c)*'));
    expect_truthy(isMatch('a.', '*!(.a|.b|.c)*'));
    expect_truthy(isMatch('d.d', '*!(.a|.b|.c)*'));
    expect_truthy(isMatch('e.e', '*!(.a|.b|.c)*'));
    expect_truthy(isMatch('f.f', '*!(.a|.b|.c)*'));
    expect_truthy(isMatch('a.abcd', '*!(.a|.b|.c)*'));

    expect_truthy(!isMatch('a.a', '*.!(a|b|c)*'));
    expect_truthy(!isMatch('a.b', '*.!(a|b|c)*'));
    expect_truthy(!isMatch('a.c', '*.!(a|b|c)*'));
    expect_truthy(isMatch('a.c.d', '*.!(a|b|c)*'));
    expect_truthy(!isMatch('c.c', '*.!(a|b|c)*'));
    expect_truthy(isMatch('a.', '*.!(a|b|c)*'));
    expect_truthy(isMatch('d.d', '*.!(a|b|c)*'));
    expect_truthy(isMatch('e.e', '*.!(a|b|c)*'));
    expect_truthy(isMatch('f.f', '*.!(a|b|c)*'));
    expect_truthy(!isMatch('a.abcd', '*.!(a|b|c)*'));
  });

  test('should correctly match empty parens', () => {
    expect_truthy(!isMatch('def', '@()ef'));
    expect_truthy(isMatch('ef', '@()ef'));

    expect_truthy(!isMatch('def', '()ef'));
    expect_truthy(isMatch('ef', '()ef'));
  });

  test('should match escaped parens', () => {
    if (process.platform !== 'win32') {
      expect_truthy(isMatch('a\\(b', 'a\\\\\\(b'));
    }
    expect_truthy(isMatch('a(b', 'a(b'));
    expect_truthy(isMatch('a(b', 'a\\(b'));
    expect_truthy(!isMatch('a((b', 'a(b'));
    expect_truthy(!isMatch('a((((b', 'a(b'));
    expect_truthy(!isMatch('ab', 'a(b'));

    expect_truthy(isMatch('a(b', 'a\\(b'));
    expect_truthy(!isMatch('a((b', 'a\\(b'));
    expect_truthy(!isMatch('a((((b', 'a\\(b'));
    expect_truthy(!isMatch('ab', 'a\\(b'));

    expect_truthy(isMatch('a(b', 'a(*b'));
    expect_truthy(isMatch('a(ab', 'a\\(*b'));
    expect_truthy(isMatch('a((b', 'a(*b'));
    expect_truthy(isMatch('a((((b', 'a(*b'));
    expect_truthy(!isMatch('ab', 'a(*b'));
  });

  test('should match escaped backslashes', () => {
    if (process.platform !== 'win32') {
      expect_truthy(isMatch('a\\(b', 'a\\(b'));
      expect_truthy(isMatch('a\\b', 'a\\b'));
    }

    expect_truthy(isMatch('a\\\\(b', 'a\\\\(b'));
    expect_truthy(!isMatch('a(b', 'a\\\\(b'));
    expect_truthy(!isMatch('a\\(b', 'a\\\\(b'));
    expect_truthy(!isMatch('a((b', 'a\\(b'));
    expect_truthy(!isMatch('a((((b', 'a\\(b'));
    expect_truthy(!isMatch('ab', 'a\\(b'));

    expect_truthy(!isMatch('a/b', 'a\\b'));
    expect_truthy(!isMatch('ab', 'a\\b'));
  });

  // these are not extglobs, and do not need to pass, but they are included
  // to test integration with other features
  test('should support regex characters', () => {
    let fixtures = ['a c', 'a.c', 'a.xy.zc', 'a.zc', 'a123c', 'a1c', 'abbbbc', 'abbbc', 'abbc', 'abc', 'abq', 'axy zc', 'axy', 'axy.zc', 'axyzc'];

    if (process.platform !== 'win32') {
      expect_deepEqual(mm(['a\\b', 'a/b', 'ab'], 'a/b'), ['a/b']);
    }

    expect_deepEqual(mm(['a/b', 'ab'], 'a/b'), ['a/b']);
    expect_deepEqual(mm(fixtures, 'ab?bc'), ['abbbc']);
    expect_deepEqual(mm(fixtures, 'ab*c'), ['abbbbc', 'abbbc', 'abbc', 'abc']);
    expect_deepEqual(mm(fixtures, 'a+(b)bc'), ['abbbbc', 'abbbc', 'abbc']);
    expect_deepEqual(mm(fixtures, '^abc$'), []);
    expect_deepEqual(mm(fixtures, 'a.c'), ['a.c']);
    expect_deepEqual(mm(fixtures, 'a.*c'), ['a.c', 'a.xy.zc', 'a.zc']);
    expect_deepEqual(mm(fixtures, 'a*c'), ['a c', 'a.c', 'a.xy.zc', 'a.zc', 'a123c', 'a1c', 'abbbbc', 'abbbc', 'abbc', 'abc', 'axy zc', 'axy.zc', 'axyzc']);
    expect_deepEqual(mm(fixtures, 'a[\\w]+c'), ['a123c', 'a1c', 'abbbbc', 'abbbc', 'abbc', 'abc', 'axyzc'], 'Should match word characters');
    expect_deepEqual(mm(fixtures, 'a[\\W]+c'), ['a c', 'a.c'], 'Should match non-word characters');
    expect_deepEqual(mm(fixtures, 'a[\\d]+c'), ['a123c', 'a1c'], 'Should match numbers');
    expect_deepEqual(mm(['foo@#$%123ASD #$$%^&', 'foo!@#$asdfl;', '123'], '[\\d]+'), ['123']);
    expect_deepEqual(mm(['a123c', 'abbbc'], 'a[\\D]+c'), ['abbbc'], 'Should match non-numbers');
    expect_deepEqual(mm(['foo', ' foo '], '(f|o)+\\b'), ['foo'], 'Should match word boundaries');
  });
});

describe('extglobs from the bash spec', () => {
  test('should match negation extglobs', () => {
    expect_truthy(isMatch('bar', '!(foo)'));
    expect_truthy(isMatch('f', '!(foo)'));
    expect_truthy(isMatch('fa', '!(foo)'));
    expect_truthy(isMatch('fb', '!(foo)'));
    expect_truthy(isMatch('ff', '!(foo)'));
    expect_truthy(isMatch('fff', '!(foo)'));
    expect_truthy(isMatch('fo', '!(foo)'));
    expect_truthy(!isMatch('foo', '!(foo)'));
    expect_truthy(!isMatch('foo/bar', '!(foo)'));
    expect_truthy(!isMatch('a/b/c/bar', '**/!(bar)'));
    expect_truthy(isMatch('a/b/c/foo/bar', '**/!(baz)/bar'));
    expect_truthy(isMatch('foobar', '!(foo)'));
    expect_truthy(isMatch('foot', '!(foo)'));
    expect_truthy(isMatch('foox', '!(foo)'));
    expect_truthy(isMatch('o', '!(foo)'));
    expect_truthy(isMatch('of', '!(foo)'));
    expect_truthy(isMatch('ooo', '!(foo)'));
    expect_truthy(isMatch('ox', '!(foo)'));
    expect_truthy(isMatch('x', '!(foo)'));
    expect_truthy(isMatch('xx', '!(foo)'));

    expect_truthy(!isMatch('bar', '!(!(foo))'));
    expect_truthy(!isMatch('f', '!(!(foo))'));
    expect_truthy(!isMatch('fa', '!(!(foo))'));
    expect_truthy(!isMatch('fb', '!(!(foo))'));
    expect_truthy(!isMatch('ff', '!(!(foo))'));
    expect_truthy(!isMatch('fff', '!(!(foo))'));
    expect_truthy(!isMatch('fo', '!(!(foo))'));
    expect_truthy(isMatch('foo', '!(!(foo))'));
    expect_truthy(!isMatch('foo/bar', '!(!(foo))'));
    expect_truthy(!isMatch('foobar', '!(!(foo))'));
    expect_truthy(!isMatch('foot', '!(!(foo))'));
    expect_truthy(!isMatch('foox', '!(!(foo))'));
    expect_truthy(!isMatch('o', '!(!(foo))'));
    expect_truthy(!isMatch('of', '!(!(foo))'));
    expect_truthy(!isMatch('ooo', '!(!(foo))'));
    expect_truthy(!isMatch('ox', '!(!(foo))'));
    expect_truthy(!isMatch('x', '!(!(foo))'));
    expect_truthy(!isMatch('xx', '!(!(foo))'));

    expect_truthy(isMatch('bar', '!(!(!(foo)))'));
    expect_truthy(isMatch('f', '!(!(!(foo)))'));
    expect_truthy(isMatch('fa', '!(!(!(foo)))'));
    expect_truthy(isMatch('fb', '!(!(!(foo)))'));
    expect_truthy(isMatch('ff', '!(!(!(foo)))'));
    expect_truthy(isMatch('fff', '!(!(!(foo)))'));
    expect_truthy(isMatch('fo', '!(!(!(foo)))'));
    expect_truthy(!isMatch('foo', '!(!(!(foo)))'));
    expect_truthy(!isMatch('foo/bar', '!(!(!(foo)))'));
    expect_truthy(isMatch('foobar', '!(!(!(foo)))'));
    expect_truthy(isMatch('foot', '!(!(!(foo)))'));
    expect_truthy(isMatch('foox', '!(!(!(foo)))'));
    expect_truthy(isMatch('o', '!(!(!(foo)))'));
    expect_truthy(isMatch('of', '!(!(!(foo)))'));
    expect_truthy(isMatch('ooo', '!(!(!(foo)))'));
    expect_truthy(isMatch('ox', '!(!(!(foo)))'));
    expect_truthy(isMatch('x', '!(!(!(foo)))'));
    expect_truthy(isMatch('xx', '!(!(!(foo)))'));

    expect_truthy(!isMatch('bar', '!(!(!(!(foo))))'));
    expect_truthy(!isMatch('f', '!(!(!(!(foo))))'));
    expect_truthy(!isMatch('fa', '!(!(!(!(foo))))'));
    expect_truthy(!isMatch('fb', '!(!(!(!(foo))))'));
    expect_truthy(!isMatch('ff', '!(!(!(!(foo))))'));
    expect_truthy(!isMatch('fff', '!(!(!(!(foo))))'));
    expect_truthy(!isMatch('fo', '!(!(!(!(foo))))'));
    expect_truthy(isMatch('foo', '!(!(!(!(foo))))'));
    expect_truthy(!isMatch('foo/bar', '!(!(!(!(foo))))'));
    expect_truthy(!isMatch('foot', '!(!(!(!(foo))))'));
    expect_truthy(!isMatch('o', '!(!(!(!(foo))))'));
    expect_truthy(!isMatch('of', '!(!(!(!(foo))))'));
    expect_truthy(!isMatch('ooo', '!(!(!(!(foo))))'));
    expect_truthy(!isMatch('ox', '!(!(!(!(foo))))'));
    expect_truthy(!isMatch('x', '!(!(!(!(foo))))'));
    expect_truthy(!isMatch('xx', '!(!(!(!(foo))))'));

    expect_truthy(!isMatch('bar', '!(!(foo))*'));
    expect_truthy(!isMatch('f', '!(!(foo))*'));
    expect_truthy(!isMatch('fa', '!(!(foo))*'));
    expect_truthy(!isMatch('fb', '!(!(foo))*'));
    expect_truthy(!isMatch('ff', '!(!(foo))*'));
    expect_truthy(!isMatch('fff', '!(!(foo))*'));
    expect_truthy(!isMatch('fo', '!(!(foo))*'));
    expect_truthy(isMatch('foo', '!(!(foo))*'));
    expect_truthy(!isMatch('foo/bar', '!(!(foo))*'));
    expect_truthy(isMatch('foobar', '!(!(foo))*'));
    expect_truthy(isMatch('foot', '!(!(foo))*'));
    expect_truthy(isMatch('foox', '!(!(foo))*'));
    expect_truthy(!isMatch('o', '!(!(foo))*'));
    expect_truthy(!isMatch('of', '!(!(foo))*'));
    expect_truthy(!isMatch('ooo', '!(!(foo))*'));
    expect_truthy(!isMatch('ox', '!(!(foo))*'));
    expect_truthy(!isMatch('x', '!(!(foo))*'));
    expect_truthy(!isMatch('xx', '!(!(foo))*'));

    expect_truthy(isMatch('bar', '!(f!(o))'));
    expect_truthy(!isMatch('f', '!(f!(o))'));
    expect_truthy(!isMatch('fa', '!(f!(o))'));
    expect_truthy(!isMatch('fb', '!(f!(o))'));
    expect_truthy(!isMatch('ff', '!(f!(o))'));
    expect_truthy(!isMatch('fff', '!(f!(o))'));
    expect_truthy(isMatch('fo', '!(f!(o))'));
    expect_truthy(isMatch('foo', '!(!(foo))'));
    expect_truthy(isMatch('go', '!(f!(o))'));
    expect_truthy(!isMatch('foo', '!(f!(o))'));
    expect_truthy(!isMatch('foo/bar', '!(f!(o))'));
    expect_truthy(!isMatch('foobar', '!(f)!(o)'));
    expect_truthy(!isMatch('foobar', '!(f)!(o)!(o)bar'));
    expect_truthy(isMatch('barbar', '!(f)!(o)!(o)bar'));
    expect_truthy(!isMatch('foobar', '!(f!(o))'));
    expect_truthy(!isMatch('foot', '!(f!(o))'));
    expect_truthy(!isMatch('foox', '!(f!(o))'));
    expect_truthy(isMatch('o', '!(f!(o))'));
    expect_truthy(isMatch('of', '!(f!(o))'));
    expect_truthy(isMatch('ooo', '!(f!(o))'));
    expect_truthy(isMatch('ox', '!(f!(o))'));
    expect_truthy(isMatch('x', '!(f!(o))'));
    expect_truthy(isMatch('xx', '!(f!(o))'));

    expect_truthy(isMatch('bar', '!(f(o))'));
    expect_truthy(isMatch('f', '!(f(o))'));
    expect_truthy(isMatch('fa', '!(f(o))'));
    expect_truthy(isMatch('fb', '!(f(o))'));
    expect_truthy(isMatch('ff', '!(f(o))'));
    expect_truthy(isMatch('fff', '!(f(o))'));
    expect_truthy(!isMatch('fo', '!(f(o))'));
    expect_truthy(isMatch('foo', '!(f(o))'));
    expect_truthy(!isMatch('foo/bar', '!(f(o))'));
    expect_truthy(isMatch('foobar', '!(f(o))'));
    expect_truthy(isMatch('foot', '!(f(o))'));
    expect_truthy(isMatch('foox', '!(f(o))'));
    expect_truthy(isMatch('o', '!(f(o))'));
    expect_truthy(isMatch('of', '!(f(o))'));
    expect_truthy(isMatch('ooo', '!(f(o))'));
    expect_truthy(isMatch('ox', '!(f(o))'));
    expect_truthy(isMatch('x', '!(f(o))'));
    expect_truthy(isMatch('xx', '!(f(o))'));

    expect_truthy(isMatch('bar', '!(f)'));
    expect_truthy(!isMatch('f', '!(f)'));
    expect_truthy(isMatch('fa', '!(f)'));
    expect_truthy(isMatch('fb', '!(f)'));
    expect_truthy(isMatch('ff', '!(f)'));
    expect_truthy(isMatch('fff', '!(f)'));
    expect_truthy(isMatch('fo', '!(f)'));
    expect_truthy(isMatch('foo', '!(f)'));
    expect_truthy(!isMatch('foo/bar', '!(f)'));
    expect_truthy(isMatch('foobar', '!(f)'));
    expect_truthy(isMatch('foot', '!(f)'));
    expect_truthy(isMatch('foox', '!(f)'));
    expect_truthy(isMatch('o', '!(f)'));
    expect_truthy(isMatch('of', '!(f)'));
    expect_truthy(isMatch('ooo', '!(f)'));
    expect_truthy(isMatch('ox', '!(f)'));
    expect_truthy(isMatch('x', '!(f)'));
    expect_truthy(isMatch('xx', '!(f)'));

    expect_truthy(isMatch('bar', '!(f)'));
    expect_truthy(!isMatch('f', '!(f)'));
    expect_truthy(isMatch('fa', '!(f)'));
    expect_truthy(isMatch('fb', '!(f)'));
    expect_truthy(isMatch('ff', '!(f)'));
    expect_truthy(isMatch('fff', '!(f)'));
    expect_truthy(isMatch('fo', '!(f)'));
    expect_truthy(isMatch('foo', '!(f)'));
    expect_truthy(!isMatch('foo/bar', '!(f)'));
    expect_truthy(isMatch('foobar', '!(f)'));
    expect_truthy(isMatch('foot', '!(f)'));
    expect_truthy(isMatch('foox', '!(f)'));
    expect_truthy(isMatch('o', '!(f)'));
    expect_truthy(isMatch('of', '!(f)'));
    expect_truthy(isMatch('ooo', '!(f)'));
    expect_truthy(isMatch('ox', '!(f)'));
    expect_truthy(isMatch('x', '!(f)'));
    expect_truthy(isMatch('xx', '!(f)'));

    expect_truthy(isMatch('bar', '!(foo)'));
    expect_truthy(isMatch('f', '!(foo)'));
    expect_truthy(isMatch('fa', '!(foo)'));
    expect_truthy(isMatch('fb', '!(foo)'));
    expect_truthy(isMatch('ff', '!(foo)'));
    expect_truthy(isMatch('fff', '!(foo)'));
    expect_truthy(isMatch('fo', '!(foo)'));
    expect_truthy(!isMatch('foo', '!(foo)'));
    expect_truthy(!isMatch('foo/bar', '!(foo)'));
    expect_truthy(isMatch('foobar', '!(foo)'));
    expect_truthy(isMatch('foot', '!(foo)'));
    expect_truthy(isMatch('foox', '!(foo)'));
    expect_truthy(isMatch('o', '!(foo)'));
    expect_truthy(isMatch('of', '!(foo)'));
    expect_truthy(isMatch('ooo', '!(foo)'));
    expect_truthy(isMatch('ox', '!(foo)'));
    expect_truthy(isMatch('x', '!(foo)'));
    expect_truthy(isMatch('xx', '!(foo)'));

    expect_truthy(isMatch('bar', '!(foo)*'));
    expect_truthy(isMatch('f', '!(foo)*'));
    expect_truthy(isMatch('fa', '!(foo)*'));
    expect_truthy(isMatch('fb', '!(foo)*'));
    expect_truthy(isMatch('ff', '!(foo)*'));
    expect_truthy(isMatch('fff', '!(foo)*'));
    expect_truthy(isMatch('fo', '!(foo)*'));
    expect_truthy(!isMatch('foo', '!(foo)*'));
    expect_truthy(!isMatch('foo/bar', '!(foo)*'));
    expect_truthy(!isMatch('foobar', '!(foo)*'));
    expect_truthy(!isMatch('foot', '!(foo)*'));
    expect_truthy(!isMatch('foox', '!(foo)*'));
    expect_truthy(isMatch('o', '!(foo)*'));
    expect_truthy(isMatch('of', '!(foo)*'));
    expect_truthy(isMatch('ooo', '!(foo)*'));
    expect_truthy(isMatch('ox', '!(foo)*'));
    expect_truthy(isMatch('x', '!(foo)*'));
    expect_truthy(isMatch('xx', '!(foo)*'));

    expect_truthy(isMatch('bar', '!(x)'));
    expect_truthy(isMatch('f', '!(x)'));
    expect_truthy(isMatch('fa', '!(x)'));
    expect_truthy(isMatch('fb', '!(x)'));
    expect_truthy(isMatch('ff', '!(x)'));
    expect_truthy(isMatch('fff', '!(x)'));
    expect_truthy(isMatch('fo', '!(x)'));
    expect_truthy(isMatch('foo', '!(x)'));
    expect_truthy(!isMatch('foo/bar', '!(x)'));
    expect_truthy(isMatch('foobar', '!(x)'));
    expect_truthy(isMatch('foot', '!(x)'));
    expect_truthy(isMatch('foox', '!(x)'));
    expect_truthy(isMatch('o', '!(x)'));
    expect_truthy(isMatch('of', '!(x)'));
    expect_truthy(isMatch('ooo', '!(x)'));
    expect_truthy(isMatch('ox', '!(x)'));
    expect_truthy(!isMatch('x', '!(x)'));
    expect_truthy(isMatch('xx', '!(x)'));

    expect_truthy(isMatch('bar', '!(x)*'));
    expect_truthy(isMatch('f', '!(x)*'));
    expect_truthy(isMatch('fa', '!(x)*'));
    expect_truthy(isMatch('fb', '!(x)*'));
    expect_truthy(isMatch('ff', '!(x)*'));
    expect_truthy(isMatch('fff', '!(x)*'));
    expect_truthy(isMatch('fo', '!(x)*'));
    expect_truthy(isMatch('foo', '!(x)*'));
    expect_truthy(!isMatch('foo/bar', '!(x)*'));
    expect_truthy(isMatch('foobar', '!(x)*'));
    expect_truthy(isMatch('foot', '!(x)*'));
    expect_truthy(isMatch('foox', '!(x)*'));
    expect_truthy(isMatch('o', '!(x)*'));
    expect_truthy(isMatch('of', '!(x)*'));
    expect_truthy(isMatch('ooo', '!(x)*'));
    expect_truthy(isMatch('ox', '!(x)*'));
    expect_truthy(!isMatch('x', '!(x)*'));
    expect_truthy(!isMatch('xx', '!(x)*'));

    expect_truthy(isMatch('bar', '*(!(f))'));
    expect_truthy(!isMatch('f', '*(!(f))'));
    expect_truthy(isMatch('fa', '*(!(f))'));
    expect_truthy(isMatch('fb', '*(!(f))'));
    expect_truthy(isMatch('ff', '*(!(f))'));
    expect_truthy(isMatch('fff', '*(!(f))'));
    expect_truthy(isMatch('fo', '*(!(f))'));
    expect_truthy(isMatch('foo', '*(!(f))'));
    expect_truthy(!isMatch('foo/bar', '*(!(f))'));
    expect_truthy(isMatch('foobar', '*(!(f))'));
    expect_truthy(isMatch('foot', '*(!(f))'));
    expect_truthy(isMatch('foox', '*(!(f))'));
    expect_truthy(isMatch('o', '*(!(f))'));
    expect_truthy(isMatch('of', '*(!(f))'));
    expect_truthy(isMatch('ooo', '*(!(f))'));
    expect_truthy(isMatch('ox', '*(!(f))'));
    expect_truthy(isMatch('x', '*(!(f))'));
    expect_truthy(isMatch('xx', '*(!(f))'));

    expect_truthy(!isMatch('bar', '*((foo))'));
    expect_truthy(!isMatch('f', '*((foo))'));
    expect_truthy(!isMatch('fa', '*((foo))'));
    expect_truthy(!isMatch('fb', '*((foo))'));
    expect_truthy(!isMatch('ff', '*((foo))'));
    expect_truthy(!isMatch('fff', '*((foo))'));
    expect_truthy(!isMatch('fo', '*((foo))'));
    expect_truthy(isMatch('foo', '*((foo))'));
    expect_truthy(!isMatch('foo/bar', '*((foo))'));
    expect_truthy(!isMatch('foobar', '*((foo))'));
    expect_truthy(!isMatch('foot', '*((foo))'));
    expect_truthy(!isMatch('foox', '*((foo))'));
    expect_truthy(!isMatch('o', '*((foo))'));
    expect_truthy(!isMatch('of', '*((foo))'));
    expect_truthy(!isMatch('ooo', '*((foo))'));
    expect_truthy(!isMatch('ox', '*((foo))'));
    expect_truthy(!isMatch('x', '*((foo))'));
    expect_truthy(!isMatch('xx', '*((foo))'));

    expect_truthy(isMatch('bar', '+(!(f))'));
    expect_truthy(!isMatch('f', '+(!(f))'));
    expect_truthy(isMatch('fa', '+(!(f))'));
    expect_truthy(isMatch('fb', '+(!(f))'));
    expect_truthy(isMatch('ff', '+(!(f))'));
    expect_truthy(isMatch('fff', '+(!(f))'));
    expect_truthy(isMatch('fo', '+(!(f))'));
    expect_truthy(isMatch('foo', '+(!(f))'));
    expect_truthy(!isMatch('foo/bar', '+(!(f))'));
    expect_truthy(isMatch('foobar', '+(!(f))'));
    expect_truthy(isMatch('foot', '+(!(f))'));
    expect_truthy(isMatch('foox', '+(!(f))'));
    expect_truthy(isMatch('o', '+(!(f))'));
    expect_truthy(isMatch('of', '+(!(f))'));
    expect_truthy(isMatch('ooo', '+(!(f))'));
    expect_truthy(isMatch('ox', '+(!(f))'));
    expect_truthy(isMatch('x', '+(!(f))'));
    expect_truthy(isMatch('xx', '+(!(f))'));

    expect_truthy(isMatch('bar', '@(!(z*)|*x)'));
    expect_truthy(isMatch('f', '@(!(z*)|*x)'));
    expect_truthy(isMatch('fa', '@(!(z*)|*x)'));
    expect_truthy(isMatch('fb', '@(!(z*)|*x)'));
    expect_truthy(isMatch('ff', '@(!(z*)|*x)'));
    expect_truthy(isMatch('fff', '@(!(z*)|*x)'));
    expect_truthy(isMatch('fo', '@(!(z*)|*x)'));
    expect_truthy(isMatch('foo', '@(!(z*)|*x)'));
    expect_truthy(isMatch('foo/bar', '@(!(z*/*)|*x)'));
    expect_truthy(!isMatch('foo/bar', '@(!(z*)|*x)'));
    expect_truthy(isMatch('foobar', '@(!(z*)|*x)'));
    expect_truthy(isMatch('foot', '@(!(z*)|*x)'));
    expect_truthy(isMatch('foox', '@(!(z*)|*x)'));
    expect_truthy(isMatch('o', '@(!(z*)|*x)'));
    expect_truthy(isMatch('of', '@(!(z*)|*x)'));
    expect_truthy(isMatch('ooo', '@(!(z*)|*x)'));
    expect_truthy(isMatch('ox', '@(!(z*)|*x)'));
    expect_truthy(isMatch('x', '@(!(z*)|*x)'));
    expect_truthy(isMatch('xx', '@(!(z*)|*x)'));

    expect_truthy(!isMatch('bar', 'foo/!(foo)'));
    expect_truthy(!isMatch('f', 'foo/!(foo)'));
    expect_truthy(!isMatch('fa', 'foo/!(foo)'));
    expect_truthy(!isMatch('fb', 'foo/!(foo)'));
    expect_truthy(!isMatch('ff', 'foo/!(foo)'));
    expect_truthy(!isMatch('fff', 'foo/!(foo)'));
    expect_truthy(!isMatch('fo', 'foo/!(foo)'));
    expect_truthy(!isMatch('foo', 'foo/!(foo)'));
    expect_truthy(isMatch('foo/bar', 'foo/!(foo)'));
    expect_truthy(!isMatch('foobar', 'foo/!(foo)'));
    expect_truthy(!isMatch('foot', 'foo/!(foo)'));
    expect_truthy(!isMatch('foox', 'foo/!(foo)'));
    expect_truthy(!isMatch('o', 'foo/!(foo)'));
    expect_truthy(!isMatch('of', 'foo/!(foo)'));
    expect_truthy(!isMatch('ooo', 'foo/!(foo)'));
    expect_truthy(!isMatch('ox', 'foo/!(foo)'));
    expect_truthy(!isMatch('x', 'foo/!(foo)'));
    expect_truthy(!isMatch('xx', 'foo/!(foo)'));

    expect_truthy(!isMatch('ffffffo', '(foo)bb'));
    expect_truthy(!isMatch('fffooofoooooffoofffooofff', '(foo)bb'));
    expect_truthy(!isMatch('ffo', '(foo)bb'));
    expect_truthy(!isMatch('fofo', '(foo)bb'));
    expect_truthy(!isMatch('fofoofoofofoo', '(foo)bb'));
    expect_truthy(!isMatch('foo', '(foo)bb'));
    expect_truthy(!isMatch('foob', '(foo)bb'));
    expect_truthy(isMatch('foobb', '(foo)bb'));
    expect_truthy(!isMatch('foofoofo', '(foo)bb'));
    expect_truthy(!isMatch('fooofoofofooo', '(foo)bb'));
    expect_truthy(!isMatch('foooofo', '(foo)bb'));
    expect_truthy(!isMatch('foooofof', '(foo)bb'));
    expect_truthy(!isMatch('foooofofx', '(foo)bb'));
    expect_truthy(!isMatch('foooxfooxfoxfooox', '(foo)bb'));
    expect_truthy(!isMatch('foooxfooxfxfooox', '(foo)bb'));
    expect_truthy(!isMatch('foooxfooxofoxfooox', '(foo)bb'));
    expect_truthy(!isMatch('foot', '(foo)bb'));
    expect_truthy(!isMatch('foox', '(foo)bb'));
    expect_truthy(!isMatch('ofoofo', '(foo)bb'));
    expect_truthy(!isMatch('ofooofoofofooo', '(foo)bb'));
    expect_truthy(!isMatch('ofoooxoofxo', '(foo)bb'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxo', '(foo)bb'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxofo', '(foo)bb'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxoo', '(foo)bb'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxooofxofxo', '(foo)bb'));
    expect_truthy(!isMatch('ofxoofxo', '(foo)bb'));
    expect_truthy(!isMatch('oofooofo', '(foo)bb'));
    expect_truthy(!isMatch('ooo', '(foo)bb'));
    expect_truthy(!isMatch('oxfoxfox', '(foo)bb'));
    expect_truthy(!isMatch('oxfoxoxfox', '(foo)bb'));
    expect_truthy(!isMatch('xfoooofof', '(foo)bb'));

    expect_truthy(isMatch('ffffffo', '*(*(f)*(o))'));
    expect_truthy(isMatch('fffooofoooooffoofffooofff', '*(*(f)*(o))'));
    expect_truthy(isMatch('ffo', '*(*(f)*(o))'));
    expect_truthy(isMatch('fofo', '*(*(f)*(o))'));
    expect_truthy(isMatch('fofoofoofofoo', '*(*(f)*(o))'));
    expect_truthy(isMatch('foo', '*(*(f)*(o))'));
    expect_truthy(!isMatch('foob', '*(*(f)*(o))'));
    expect_truthy(!isMatch('foobb', '*(*(f)*(o))'));
    expect_truthy(isMatch('foofoofo', '*(*(f)*(o))'));
    expect_truthy(isMatch('fooofoofofooo', '*(*(f)*(o))'));
    expect_truthy(isMatch('foooofo', '*(*(f)*(o))'));
    expect_truthy(isMatch('foooofof', '*(*(f)*(o))'));
    expect_truthy(!isMatch('foooofofx', '*(*(f)*(o))'));
    expect_truthy(!isMatch('foooxfooxfoxfooox', '*(*(f)*(o))'));
    expect_truthy(!isMatch('foooxfooxfxfooox', '*(*(f)*(o))'));
    expect_truthy(!isMatch('foooxfooxofoxfooox', '*(*(f)*(o))'));
    expect_truthy(!isMatch('foot', '*(*(f)*(o))'));
    expect_truthy(!isMatch('foox', '*(*(f)*(o))'));
    expect_truthy(isMatch('ofoofo', '*(*(f)*(o))'));
    expect_truthy(isMatch('ofooofoofofooo', '*(*(f)*(o))'));
    expect_truthy(!isMatch('ofoooxoofxo', '*(*(f)*(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxo', '*(*(f)*(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxofo', '*(*(f)*(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxoo', '*(*(f)*(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxooofxofxo', '*(*(f)*(o))'));
    expect_truthy(!isMatch('ofxoofxo', '*(*(f)*(o))'));
    expect_truthy(isMatch('oofooofo', '*(*(f)*(o))'));
    expect_truthy(isMatch('ooo', '*(*(f)*(o))'));
    expect_truthy(!isMatch('oxfoxfox', '*(*(f)*(o))'));
    expect_truthy(!isMatch('oxfoxoxfox', '*(*(f)*(o))'));
    expect_truthy(!isMatch('xfoooofof', '*(*(f)*(o))'));

    expect_truthy(!isMatch('ffffffo', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('fffooofoooooffoofffooofff', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('ffo', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('fofo', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('fofoofoofofoo', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('foo', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('foob', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('foobb', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('foofoofo', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('fooofoofofooo', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('foooofo', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('foooofof', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('foooofofx', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('foooxfooxfoxfooox', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('foooxfooxfxfooox', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('foooxfooxofoxfooox', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('foot', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('foox', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('ofoofo', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('ofooofoofofooo', '*(*(of*(o)x)o)'));
    expect_truthy(isMatch('ofoooxoofxo', '*(*(of*(o)x)o)'));
    expect_truthy(isMatch('ofoooxoofxoofoooxoofxo', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxofo', '*(*(of*(o)x)o)'));
    expect_truthy(isMatch('ofoooxoofxoofoooxoofxoo', '*(*(of*(o)x)o)'));
    expect_truthy(isMatch('ofoooxoofxoofoooxoofxooofxofxo', '*(*(of*(o)x)o)'));
    expect_truthy(isMatch('ofxoofxo', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('oofooofo', '*(*(of*(o)x)o)'));
    expect_truthy(isMatch('ooo', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('oxfoxfox', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('oxfoxoxfox', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('xfoooofof', '*(*(of*(o)x)o)'));

    expect_truthy(isMatch('ffffffo', '*(f*(o))'));
    expect_truthy(isMatch('fffooofoooooffoofffooofff', '*(f*(o))'));
    expect_truthy(isMatch('ffo', '*(f*(o))'));
    expect_truthy(isMatch('fofo', '*(f*(o))'));
    expect_truthy(isMatch('fofoofoofofoo', '*(f*(o))'));
    expect_truthy(isMatch('foo', '*(f*(o))'));
    expect_truthy(!isMatch('foob', '*(f*(o))'));
    expect_truthy(!isMatch('foobb', '*(f*(o))'));
    expect_truthy(isMatch('foofoofo', '*(f*(o))'));
    expect_truthy(isMatch('fooofoofofooo', '*(f*(o))'));
    expect_truthy(isMatch('foooofo', '*(f*(o))'));
    expect_truthy(isMatch('foooofof', '*(f*(o))'));
    expect_truthy(!isMatch('foooofofx', '*(f*(o))'));
    expect_truthy(!isMatch('foooxfooxfoxfooox', '*(f*(o))'));
    expect_truthy(!isMatch('foooxfooxfxfooox', '*(f*(o))'));
    expect_truthy(!isMatch('foooxfooxofoxfooox', '*(f*(o))'));
    expect_truthy(!isMatch('foot', '*(f*(o))'));
    expect_truthy(!isMatch('foox', '*(f*(o))'));
    expect_truthy(!isMatch('ofoofo', '*(f*(o))'));
    expect_truthy(!isMatch('ofooofoofofooo', '*(f*(o))'));
    expect_truthy(!isMatch('ofoooxoofxo', '*(f*(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxo', '*(f*(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxofo', '*(f*(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxoo', '*(f*(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxooofxofxo', '*(f*(o))'));
    expect_truthy(!isMatch('ofxoofxo', '*(f*(o))'));
    expect_truthy(!isMatch('oofooofo', '*(f*(o))'));
    expect_truthy(!isMatch('ooo', '*(f*(o))'));
    expect_truthy(!isMatch('oxfoxfox', '*(f*(o))'));
    expect_truthy(!isMatch('oxfoxoxfox', '*(f*(o))'));
    expect_truthy(!isMatch('xfoooofof', '*(f*(o))'));

    expect_truthy(!isMatch('ffffffo', '*(f*(o)x)'));
    expect_truthy(!isMatch('fffooofoooooffoofffooofff', '*(f*(o)x)'));
    expect_truthy(!isMatch('ffo', '*(f*(o)x)'));
    expect_truthy(!isMatch('fofo', '*(f*(o)x)'));
    expect_truthy(!isMatch('fofoofoofofoo', '*(f*(o)x)'));
    expect_truthy(!isMatch('foo', '*(f*(o)x)'));
    expect_truthy(!isMatch('foob', '*(f*(o)x)'));
    expect_truthy(!isMatch('foobb', '*(f*(o)x)'));
    expect_truthy(!isMatch('foofoofo', '*(f*(o)x)'));
    expect_truthy(!isMatch('fooofoofofooo', '*(f*(o)x)'));
    expect_truthy(!isMatch('foooofo', '*(f*(o)x)'));
    expect_truthy(!isMatch('foooofof', '*(f*(o)x)'));
    expect_truthy(!isMatch('foooofofx', '*(f*(o)x)'));
    expect_truthy(isMatch('foooxfooxfoxfooox', '*(f*(o)x)'));
    expect_truthy(isMatch('foooxfooxfxfooox', '*(f*(o)x)'));
    expect_truthy(!isMatch('foooxfooxofoxfooox', '*(f*(o)x)'));
    expect_truthy(!isMatch('foot', '*(f*(o)x)'));
    expect_truthy(isMatch('foox', '*(f*(o)x)'));
    expect_truthy(!isMatch('ofoofo', '*(f*(o)x)'));
    expect_truthy(!isMatch('ofooofoofofooo', '*(f*(o)x)'));
    expect_truthy(!isMatch('ofoooxoofxo', '*(f*(o)x)'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxo', '*(f*(o)x)'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxofo', '*(f*(o)x)'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxoo', '*(f*(o)x)'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxooofxofxo', '*(f*(o)x)'));
    expect_truthy(!isMatch('ofxoofxo', '*(f*(o)x)'));
    expect_truthy(!isMatch('oofooofo', '*(f*(o)x)'));
    expect_truthy(!isMatch('ooo', '*(f*(o)x)'));
    expect_truthy(!isMatch('oxfoxfox', '*(f*(o)x)'));
    expect_truthy(!isMatch('oxfoxoxfox', '*(f*(o)x)'));
    expect_truthy(!isMatch('xfoooofof', '*(f*(o)x)'));

    expect_truthy(!isMatch('ffffffo', '*(f+(o))'));
    expect_truthy(!isMatch('fffooofoooooffoofffooofff', '*(f+(o))'));
    expect_truthy(!isMatch('ffo', '*(f+(o))'));
    expect_truthy(isMatch('fofo', '*(f+(o))'));
    expect_truthy(isMatch('fofoofoofofoo', '*(f+(o))'));
    expect_truthy(isMatch('foo', '*(f+(o))'));
    expect_truthy(!isMatch('foob', '*(f+(o))'));
    expect_truthy(!isMatch('foobb', '*(f+(o))'));
    expect_truthy(isMatch('foofoofo', '*(f+(o))'));
    expect_truthy(isMatch('fooofoofofooo', '*(f+(o))'));
    expect_truthy(isMatch('foooofo', '*(f+(o))'));
    expect_truthy(!isMatch('foooofof', '*(f+(o))'));
    expect_truthy(!isMatch('foooofofx', '*(f+(o))'));
    expect_truthy(!isMatch('foooxfooxfoxfooox', '*(f+(o))'));
    expect_truthy(!isMatch('foooxfooxfxfooox', '*(f+(o))'));
    expect_truthy(!isMatch('foooxfooxofoxfooox', '*(f+(o))'));
    expect_truthy(!isMatch('foot', '*(f+(o))'));
    expect_truthy(!isMatch('foox', '*(f+(o))'));
    expect_truthy(!isMatch('ofoofo', '*(f+(o))'));
    expect_truthy(!isMatch('ofooofoofofooo', '*(f+(o))'));
    expect_truthy(!isMatch('ofoooxoofxo', '*(f+(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxo', '*(f+(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxofo', '*(f+(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxoo', '*(f+(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxooofxofxo', '*(f+(o))'));
    expect_truthy(!isMatch('ofxoofxo', '*(f+(o))'));
    expect_truthy(!isMatch('oofooofo', '*(f+(o))'));
    expect_truthy(!isMatch('ooo', '*(f+(o))'));
    expect_truthy(!isMatch('oxfoxfox', '*(f+(o))'));
    expect_truthy(!isMatch('oxfoxoxfox', '*(f+(o))'));
    expect_truthy(!isMatch('xfoooofof', '*(f+(o))'));

    expect_truthy(!isMatch('ffffffo', '*(of+(o))'));
    expect_truthy(!isMatch('fffooofoooooffoofffooofff', '*(of+(o))'));
    expect_truthy(!isMatch('ffo', '*(of+(o))'));
    expect_truthy(!isMatch('fofo', '*(of+(o))'));
    expect_truthy(!isMatch('fofoofoofofoo', '*(of+(o))'));
    expect_truthy(!isMatch('foo', '*(of+(o))'));
    expect_truthy(!isMatch('foob', '*(of+(o))'));
    expect_truthy(!isMatch('foobb', '*(of+(o))'));
    expect_truthy(!isMatch('foofoofo', '*(of+(o))'));
    expect_truthy(!isMatch('fooofoofofooo', '*(of+(o))'));
    expect_truthy(!isMatch('foooofo', '*(of+(o))'));
    expect_truthy(!isMatch('foooofof', '*(of+(o))'));
    expect_truthy(!isMatch('foooofofx', '*(of+(o))'));
    expect_truthy(!isMatch('foooxfooxfoxfooox', '*(of+(o))'));
    expect_truthy(!isMatch('foooxfooxfxfooox', '*(of+(o))'));
    expect_truthy(!isMatch('foooxfooxofoxfooox', '*(of+(o))'));
    expect_truthy(!isMatch('foot', '*(of+(o))'));
    expect_truthy(!isMatch('foox', '*(of+(o))'));
    expect_truthy(isMatch('ofoofo', '*(of+(o))'));
    expect_truthy(!isMatch('ofooofoofofooo', '*(of+(o))'));
    expect_truthy(!isMatch('ofoooxoofxo', '*(of+(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxo', '*(of+(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxofo', '*(of+(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxoo', '*(of+(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxooofxofxo', '*(of+(o))'));
    expect_truthy(!isMatch('ofxoofxo', '*(of+(o))'));
    expect_truthy(!isMatch('oofooofo', '*(of+(o))'));
    expect_truthy(!isMatch('ooo', '*(of+(o))'));
    expect_truthy(!isMatch('oxfoxfox', '*(of+(o))'));
    expect_truthy(!isMatch('oxfoxoxfox', '*(of+(o))'));
    expect_truthy(!isMatch('xfoooofof', '*(of+(o))'));

    expect_truthy(!isMatch('ffffffo', '*(of+(o)|f)'));
    expect_truthy(!isMatch('fffooofoooooffoofffooofff', '*(of+(o)|f)'));
    expect_truthy(!isMatch('ffo', '*(of+(o)|f)'));
    expect_truthy(isMatch('fofo', '*(of+(o)|f)'));
    expect_truthy(isMatch('fofoofoofofoo', '*(of+(o)|f)'));
    expect_truthy(!isMatch('foo', '*(of+(o)|f)'));
    expect_truthy(!isMatch('foob', '*(of+(o)|f)'));
    expect_truthy(!isMatch('foobb', '*(of+(o)|f)'));
    expect_truthy(!isMatch('foofoofo', '*(of+(o)|f)'));
    expect_truthy(!isMatch('fooofoofofooo', '*(of+(o)|f)'));
    expect_truthy(!isMatch('foooofo', '*(of+(o)|f)'));
    expect_truthy(!isMatch('foooofof', '*(of+(o)|f)'));
    expect_truthy(!isMatch('foooofofx', '*(of+(o)|f)'));
    expect_truthy(!isMatch('foooxfooxfoxfooox', '*(of+(o)|f)'));
    expect_truthy(!isMatch('foooxfooxfxfooox', '*(of+(o)|f)'));
    expect_truthy(!isMatch('foooxfooxofoxfooox', '*(of+(o)|f)'));
    expect_truthy(!isMatch('foot', '*(of+(o)|f)'));
    expect_truthy(!isMatch('foox', '*(of+(o)|f)'));
    expect_truthy(isMatch('ofoofo', '*(of+(o)|f)'));
    expect_truthy(isMatch('ofooofoofofooo', '*(of+(o)|f)'));
    expect_truthy(!isMatch('ofoooxoofxo', '*(of+(o)|f)'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxo', '*(of+(o)|f)'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxofo', '*(of+(o)|f)'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxoo', '*(of+(o)|f)'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxooofxofxo', '*(of+(o)|f)'));
    expect_truthy(!isMatch('ofxoofxo', '*(of+(o)|f)'));
    expect_truthy(!isMatch('oofooofo', '*(of+(o)|f)'));
    expect_truthy(!isMatch('ooo', '*(of+(o)|f)'));
    expect_truthy(!isMatch('oxfoxfox', '*(of+(o)|f)'));
    expect_truthy(!isMatch('oxfoxoxfox', '*(of+(o)|f)'));
    expect_truthy(!isMatch('xfoooofof', '*(of+(o)|f)'));

    expect_truthy(!isMatch('ffffffo', '*(of|oof+(o))'));
    expect_truthy(!isMatch('fffooofoooooffoofffooofff', '*(of|oof+(o))'));
    expect_truthy(!isMatch('ffo', '*(of|oof+(o))'));
    expect_truthy(!isMatch('fofo', '*(of|oof+(o))'));
    expect_truthy(!isMatch('fofoofoofofoo', '*(of|oof+(o))'));
    expect_truthy(!isMatch('foo', '*(of|oof+(o))'));
    expect_truthy(!isMatch('foob', '*(of|oof+(o))'));
    expect_truthy(!isMatch('foobb', '*(of|oof+(o))'));
    expect_truthy(!isMatch('foofoofo', '*(of|oof+(o))'));
    expect_truthy(!isMatch('fooofoofofooo', '*(of|oof+(o))'));
    expect_truthy(!isMatch('foooofo', '*(of|oof+(o))'));
    expect_truthy(!isMatch('foooofof', '*(of|oof+(o))'));
    expect_truthy(!isMatch('foooofofx', '*(of|oof+(o))'));
    expect_truthy(!isMatch('foooxfooxfoxfooox', '*(of|oof+(o))'));
    expect_truthy(!isMatch('foooxfooxfxfooox', '*(of|oof+(o))'));
    expect_truthy(!isMatch('foooxfooxofoxfooox', '*(of|oof+(o))'));
    expect_truthy(!isMatch('foot', '*(of|oof+(o))'));
    expect_truthy(!isMatch('foox', '*(of|oof+(o))'));
    expect_truthy(isMatch('ofoofo', '*(of|oof+(o))'));
    expect_truthy(!isMatch('ofooofoofofooo', '*(of|oof+(o))'));
    expect_truthy(!isMatch('ofoooxoofxo', '*(of|oof+(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxo', '*(of|oof+(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxofo', '*(of|oof+(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxoo', '*(of|oof+(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxooofxofxo', '*(of|oof+(o))'));
    expect_truthy(!isMatch('ofxoofxo', '*(of|oof+(o))'));
    expect_truthy(isMatch('oofooofo', '*(of|oof+(o))'));
    expect_truthy(!isMatch('ooo', '*(of|oof+(o))'));
    expect_truthy(!isMatch('oxfoxfox', '*(of|oof+(o))'));
    expect_truthy(!isMatch('oxfoxoxfox', '*(of|oof+(o))'));
    expect_truthy(!isMatch('xfoooofof', '*(of|oof+(o))'));

    expect_truthy(!isMatch('ffffffo', '*(oxf+(ox))'));
    expect_truthy(!isMatch('fffooofoooooffoofffooofff', '*(oxf+(ox))'));
    expect_truthy(!isMatch('ffo', '*(oxf+(ox))'));
    expect_truthy(!isMatch('fofo', '*(oxf+(ox))'));
    expect_truthy(!isMatch('fofoofoofofoo', '*(oxf+(ox))'));
    expect_truthy(!isMatch('foo', '*(oxf+(ox))'));
    expect_truthy(!isMatch('foob', '*(oxf+(ox))'));
    expect_truthy(!isMatch('foobb', '*(oxf+(ox))'));
    expect_truthy(!isMatch('foofoofo', '*(oxf+(ox))'));
    expect_truthy(!isMatch('fooofoofofooo', '*(oxf+(ox))'));
    expect_truthy(!isMatch('foooofo', '*(oxf+(ox))'));
    expect_truthy(!isMatch('foooofof', '*(oxf+(ox))'));
    expect_truthy(!isMatch('foooofofx', '*(oxf+(ox))'));
    expect_truthy(!isMatch('foooxfooxfoxfooox', '*(oxf+(ox))'));
    expect_truthy(!isMatch('foooxfooxfxfooox', '*(oxf+(ox))'));
    expect_truthy(!isMatch('foooxfooxofoxfooox', '*(oxf+(ox))'));
    expect_truthy(!isMatch('foot', '*(oxf+(ox))'));
    expect_truthy(!isMatch('foox', '*(oxf+(ox))'));
    expect_truthy(!isMatch('ofoofo', '*(oxf+(ox))'));
    expect_truthy(!isMatch('ofooofoofofooo', '*(oxf+(ox))'));
    expect_truthy(!isMatch('ofoooxoofxo', '*(oxf+(ox))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxo', '*(oxf+(ox))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxofo', '*(oxf+(ox))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxoo', '*(oxf+(ox))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxooofxofxo', '*(oxf+(ox))'));
    expect_truthy(!isMatch('ofxoofxo', '*(oxf+(ox))'));
    expect_truthy(!isMatch('oofooofo', '*(oxf+(ox))'));
    expect_truthy(!isMatch('ooo', '*(oxf+(ox))'));
    expect_truthy(!isMatch('oxfoxfox', '*(oxf+(ox))'));
    expect_truthy(isMatch('oxfoxoxfox', '*(oxf+(ox))'));
    expect_truthy(!isMatch('xfoooofof', '*(oxf+(ox))'));

    expect_truthy(isMatch('ffffffo', '@(!(z*)|*x)'));
    expect_truthy(isMatch('fffooofoooooffoofffooofff', '@(!(z*)|*x)'));
    expect_truthy(isMatch('ffo', '@(!(z*)|*x)'));
    expect_truthy(isMatch('fofo', '@(!(z*)|*x)'));
    expect_truthy(isMatch('fofoofoofofoo', '@(!(z*)|*x)'));
    expect_truthy(isMatch('foo', '@(!(z*)|*x)'));
    expect_truthy(isMatch('foob', '@(!(z*)|*x)'));
    expect_truthy(isMatch('foobb', '@(!(z*)|*x)'));
    expect_truthy(isMatch('foofoofo', '@(!(z*)|*x)'));
    expect_truthy(isMatch('fooofoofofooo', '@(!(z*)|*x)'));
    expect_truthy(isMatch('foooofo', '@(!(z*)|*x)'));
    expect_truthy(isMatch('foooofof', '@(!(z*)|*x)'));
    expect_truthy(isMatch('foooofofx', '@(!(z*)|*x)'));
    expect_truthy(isMatch('foooxfooxfoxfooox', '@(!(z*)|*x)'));
    expect_truthy(isMatch('foooxfooxfxfooox', '@(!(z*)|*x)'));
    expect_truthy(isMatch('foooxfooxofoxfooox', '@(!(z*)|*x)'));
    expect_truthy(isMatch('foot', '@(!(z*)|*x)'));
    expect_truthy(isMatch('foox', '@(!(z*)|*x)'));
    expect_truthy(isMatch('ofoofo', '@(!(z*)|*x)'));
    expect_truthy(isMatch('ofooofoofofooo', '@(!(z*)|*x)'));
    expect_truthy(isMatch('ofoooxoofxo', '@(!(z*)|*x)'));
    expect_truthy(isMatch('ofoooxoofxoofoooxoofxo', '@(!(z*)|*x)'));
    expect_truthy(isMatch('ofoooxoofxoofoooxoofxofo', '@(!(z*)|*x)'));
    expect_truthy(isMatch('ofoooxoofxoofoooxoofxoo', '@(!(z*)|*x)'));
    expect_truthy(isMatch('ofoooxoofxoofoooxoofxooofxofxo', '@(!(z*)|*x)'));
    expect_truthy(isMatch('ofxoofxo', '@(!(z*)|*x)'));
    expect_truthy(isMatch('oofooofo', '@(!(z*)|*x)'));
    expect_truthy(isMatch('ooo', '@(!(z*)|*x)'));
    expect_truthy(isMatch('oxfoxfox', '@(!(z*)|*x)'));
    expect_truthy(isMatch('oxfoxoxfox', '@(!(z*)|*x)'));
    expect_truthy(isMatch('xfoooofof', '@(!(z*)|*x)'));

    expect_truthy(!isMatch('ffffffo', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('fffooofoooooffoofffooofff', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('ffo', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(isMatch('fofo', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(isMatch('fofoofoofofoo', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(isMatch('foo', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('foob', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('foobb', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(isMatch('foofoofo', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(isMatch('fooofoofofooo', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('foooofo', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('foooofof', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('foooofofx', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('foooxfooxfoxfooox', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('foooxfooxfxfooox', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('foooxfooxofoxfooox', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('foot', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('foox', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('ofoofo', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('ofooofoofofooo', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('ofoooxoofxo', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxo', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxofo', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxoo', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxooofxofxo', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('ofxoofxo', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('oofooofo', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('ooo', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('oxfoxfox', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('oxfoxoxfox', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(!isMatch('xfoooofof', '@(foo|f|fo)*(f|of+(o))'));

    expect_truthy(isMatch('aaac', '*(@(a))a@(c)'));
    expect_truthy(isMatch('aac', '*(@(a))a@(c)'));
    expect_truthy(isMatch('ac', '*(@(a))a@(c)'));
    expect_truthy(!isMatch('abbcd', '*(@(a))a@(c)'));
    expect_truthy(!isMatch('abcd', '*(@(a))a@(c)'));
    expect_truthy(!isMatch('acd', '*(@(a))a@(c)'));
    expect_truthy(!isMatch('baaac', '*(@(a))a@(c)'));
    expect_truthy(!isMatch('c', '*(@(a))a@(c)'));
    expect_truthy(!isMatch('foo', '*(@(a))a@(c)'));

    expect_truthy(!isMatch('aaac', '@(ab|a*(b))*(c)d'));
    expect_truthy(!isMatch('aac', '@(ab|a*(b))*(c)d'));
    expect_truthy(!isMatch('ac', '@(ab|a*(b))*(c)d'));
    expect_truthy(isMatch('abbcd', '@(ab|a*(b))*(c)d'));
    expect_truthy(isMatch('abcd', '@(ab|a*(b))*(c)d'));
    expect_truthy(isMatch('acd', '@(ab|a*(b))*(c)d'));
    expect_truthy(!isMatch('baaac', '@(ab|a*(b))*(c)d'));
    expect_truthy(!isMatch('c', '@(ab|a*(b))*(c)d'));
    expect_truthy(!isMatch('foo', '@(ab|a*(b))*(c)d'));

    expect_truthy(!isMatch('aaac', '?@(a|b)*@(c)d'));
    expect_truthy(!isMatch('aac', '?@(a|b)*@(c)d'));
    expect_truthy(!isMatch('ac', '?@(a|b)*@(c)d'));
    expect_truthy(isMatch('abbcd', '?@(a|b)*@(c)d'));
    expect_truthy(isMatch('abcd', '?@(a|b)*@(c)d'));
    expect_truthy(!isMatch('acd', '?@(a|b)*@(c)d'));
    expect_truthy(!isMatch('baaac', '?@(a|b)*@(c)d'));
    expect_truthy(!isMatch('c', '?@(a|b)*@(c)d'));
    expect_truthy(!isMatch('foo', '?@(a|b)*@(c)d'));

    expect_truthy(!isMatch('aaac', '@(ab|a*@(b))*(c)d'));
    expect_truthy(!isMatch('aac', '@(ab|a*@(b))*(c)d'));
    expect_truthy(!isMatch('ac', '@(ab|a*@(b))*(c)d'));
    expect_truthy(isMatch('abbcd', '@(ab|a*@(b))*(c)d'));
    expect_truthy(isMatch('abcd', '@(ab|a*@(b))*(c)d'));
    expect_truthy(!isMatch('acd', '@(ab|a*@(b))*(c)d'));
    expect_truthy(!isMatch('baaac', '@(ab|a*@(b))*(c)d'));
    expect_truthy(!isMatch('c', '@(ab|a*@(b))*(c)d'));
    expect_truthy(!isMatch('foo', '@(ab|a*@(b))*(c)d'));

    expect_truthy(!isMatch('aac', '*(@(a))b@(c)'));
  });

  test('should backtrack in alternation matches', () => {
    expect_truthy(!isMatch('ffffffo', '*(fo|foo)'));
    expect_truthy(!isMatch('fffooofoooooffoofffooofff', '*(fo|foo)'));
    expect_truthy(!isMatch('ffo', '*(fo|foo)'));
    expect_truthy(isMatch('fofo', '*(fo|foo)'));
    expect_truthy(isMatch('fofoofoofofoo', '*(fo|foo)'));
    expect_truthy(isMatch('foo', '*(fo|foo)'));
    expect_truthy(!isMatch('foob', '*(fo|foo)'));
    expect_truthy(!isMatch('foobb', '*(fo|foo)'));
    expect_truthy(isMatch('foofoofo', '*(fo|foo)'));
    expect_truthy(!isMatch('fooofoofofooo', '*(fo|foo)'));
    expect_truthy(!isMatch('foooofo', '*(fo|foo)'));
    expect_truthy(!isMatch('foooofof', '*(fo|foo)'));
    expect_truthy(!isMatch('foooofofx', '*(fo|foo)'));
    expect_truthy(!isMatch('foooxfooxfoxfooox', '*(fo|foo)'));
    expect_truthy(!isMatch('foooxfooxfxfooox', '*(fo|foo)'));
    expect_truthy(!isMatch('foooxfooxofoxfooox', '*(fo|foo)'));
    expect_truthy(!isMatch('foot', '*(fo|foo)'));
    expect_truthy(!isMatch('foox', '*(fo|foo)'));
    expect_truthy(!isMatch('ofoofo', '*(fo|foo)'));
    expect_truthy(!isMatch('ofooofoofofooo', '*(fo|foo)'));
    expect_truthy(!isMatch('ofoooxoofxo', '*(fo|foo)'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxo', '*(fo|foo)'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxofo', '*(fo|foo)'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxoo', '*(fo|foo)'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxooofxofxo', '*(fo|foo)'));
    expect_truthy(!isMatch('ofxoofxo', '*(fo|foo)'));
    expect_truthy(!isMatch('oofooofo', '*(fo|foo)'));
    expect_truthy(!isMatch('ooo', '*(fo|foo)'));
    expect_truthy(!isMatch('oxfoxfox', '*(fo|foo)'));
    expect_truthy(!isMatch('oxfoxoxfox', '*(fo|foo)'));
    expect_truthy(!isMatch('xfoooofof', '*(fo|foo)'));
  });

  test('should support exclusions', () => {
    expect_truthy(!isMatch('foob', '!(foo)b*'));
    expect_truthy(!isMatch('foobb', '!(foo)b*'));
    expect_truthy(!isMatch('foo', '!(foo)b*'));
    expect_truthy(isMatch('bar', '!(foo)b*'));
    expect_truthy(isMatch('baz', '!(foo)b*'));
    expect_truthy(!isMatch('foobar', '!(foo)b*'));

    expect_truthy(!isMatch('foo', '*(!(foo))'));
    expect_truthy(isMatch('bar', '*(!(foo))'));
    expect_truthy(isMatch('baz', '*(!(foo))'));
    expect_truthy(isMatch('foobar', '*(!(foo))'));

    // Bash 4.3 says this should match `foo` and `foobar`, which makes no sense
    expect_truthy(!isMatch('foo', '!(foo)*'));
    expect_truthy(!isMatch('foobar', '!(foo)*'));
    expect_truthy(isMatch('bar', '!(foo)*'));
    expect_truthy(isMatch('baz', '!(foo)*'));

    expect_truthy(!isMatch('moo.cow', '!(*.*)'));
    expect_truthy(isMatch('moo', '!(*.*)'));
    expect_truthy(isMatch('cow', '!(*.*)'));

    expect_truthy(isMatch('moo.cow', '!(a*).!(b*)'));
    expect_truthy(!isMatch('moo.cow', '!(*).!(*)'));
    expect_truthy(!isMatch('moo.cow.moo.cow', '!(*.*).!(*.*)'));
    expect_truthy(!isMatch('mad.moo.cow', '!(*.*).!(*.*)'));

    expect_truthy(!isMatch('moo.cow', '!(*.*).'));
    expect_truthy(!isMatch('moo', '!(*.*).'));
    expect_truthy(!isMatch('cow', '!(*.*).'));

    expect_truthy(!isMatch('moo.cow', '.!(*.*)'));
    expect_truthy(!isMatch('moo', '.!(*.*)'));
    expect_truthy(!isMatch('cow', '.!(*.*)'));

    expect_truthy(!isMatch('mucca.pazza', 'mu!(*(c))?.pa!(*(z))?'));

    expect_truthy(isMatch('effgz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))'));
    expect_truthy(isMatch('efgz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))'));
    expect_truthy(isMatch('egz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))'));
    expect_truthy(!isMatch('egz', '@(b+(c)d|e+(f)g?|?(h)i@(j|k))'));
    expect_truthy(isMatch('egzefffgzbcdij', '*(b+(c)d|e*(f)g?|?(h)i@(j|k))'));
  });

  test('valid numbers', () => {
    expect_truthy(isMatch('/dev/udp/129.22.8.102/45', '/dev/@(tcp|udp)/*/*'));

    expect_truthy(!isMatch('0', '[1-6]([0-9])'));
    expect_truthy(isMatch('12', '[1-6]([0-9])'));
    expect_truthy(!isMatch('1', '[1-6]([0-9])'));
    expect_truthy(!isMatch('12abc', '[1-6]([0-9])'));
    expect_truthy(!isMatch('555', '[1-6]([0-9])'));

    expect_truthy(!isMatch('0', '[1-6]*([0-9])'));
    expect_truthy(isMatch('12', '[1-6]*([0-9])'));
    expect_truthy(isMatch('1', '[1-6]*([0-9])'));
    expect_truthy(!isMatch('12abc', '[1-6]*([0-9])'));
    expect_truthy(isMatch('555', '[1-6]*([0-9])'));

    expect_truthy(!isMatch('0', '[1-5]*([6-9])'));
    expect_truthy(!isMatch('12', '[1-5]*([6-9])'));
    expect_truthy(isMatch('1', '[1-5]*([6-9])'));
    expect_truthy(!isMatch('12abc', '[1-5]*([6-9])'));
    expect_truthy(!isMatch('555', '[1-5]*([6-9])'));

    expect_truthy(isMatch('0', '0|[1-6]*([0-9])'));
    expect_truthy(isMatch('12', '0|[1-6]*([0-9])'));
    expect_truthy(isMatch('1', '0|[1-6]*([0-9])'));
    expect_truthy(!isMatch('12abc', '0|[1-6]*([0-9])'));
    expect_truthy(isMatch('555', '0|[1-6]*([0-9])'));

    expect_truthy(isMatch('07', '+([0-7])'));
    expect_truthy(isMatch('0377', '+([0-7])'));
    expect_truthy(!isMatch('09', '+([0-7])'));
  });

  test('check extended globbing in pattern removal', () => {
    expect_truthy(isMatch('a', '+(a|abc)'));
    expect_truthy(isMatch('abc', '+(a|abc)'));

    expect_truthy(!isMatch('abcd', '+(a|abc)'));
    expect_truthy(!isMatch('abcde', '+(a|abc)'));
    expect_truthy(!isMatch('abcedf', '+(a|abc)'));

    expect_truthy(isMatch('f', '+(def|f)'));
    expect_truthy(isMatch('def', '+(f|def)'));

    expect_truthy(!isMatch('cdef', '+(f|def)'));
    expect_truthy(!isMatch('bcdef', '+(f|def)'));
    expect_truthy(!isMatch('abcedf', '+(f|def)'));

    expect_truthy(isMatch('abcd', '*(a|b)cd'));

    expect_truthy(!isMatch('a', '*(a|b)cd'));
    expect_truthy(!isMatch('ab', '*(a|b)cd'));
    expect_truthy(!isMatch('abc', '*(a|b)cd'));

    expect_truthy(!isMatch('a', '"*(a|b)cd"'));
    expect_truthy(!isMatch('ab', '"*(a|b)cd"'));
    expect_truthy(!isMatch('abc', '"*(a|b)cd"'));
    expect_truthy(!isMatch('abcde', '"*(a|b)cd"'));
    expect_truthy(!isMatch('abcdef', '"*(a|b)cd"'));
  });

  test('More tests derived from a bug report (in bash) concerning extended glob patterns following a *', () => {
    expect_truthy(isMatch('/dev/udp/129.22.8.102/45', '/dev\\/@(tcp|udp)\\/*\\/*'));
    expect_truthy(!isMatch('123abc', '(a+|b)*'));
    expect_truthy(isMatch('ab', '(a+|b)*'));
    expect_truthy(isMatch('abab', '(a+|b)*'));
    expect_truthy(isMatch('abcdef', '(a+|b)*'));
    expect_truthy(isMatch('accdef', '(a+|b)*'));
    expect_truthy(isMatch('abcfefg', '(a+|b)*'));
    expect_truthy(isMatch('abef', '(a+|b)*'));
    expect_truthy(isMatch('abcfef', '(a+|b)*'));
    expect_truthy(isMatch('abd', '(a+|b)*'));
    expect_truthy(isMatch('acd', '(a+|b)*'));

    expect_truthy(!isMatch('123abc', '(a+|b)+'));
    expect_truthy(isMatch('ab', '(a+|b)+'));
    expect_truthy(isMatch('abab', '(a+|b)+'));
    expect_truthy(!isMatch('abcdef', '(a+|b)+'));
    expect_truthy(!isMatch('accdef', '(a+|b)+'));
    expect_truthy(!isMatch('abcfefg', '(a+|b)+'));
    expect_truthy(!isMatch('abef', '(a+|b)+'));
    expect_truthy(!isMatch('abcfef', '(a+|b)+'));
    expect_truthy(!isMatch('abd', '(a+|b)+'));
    expect_truthy(!isMatch('acd', '(a+|b)+'));

    expect_truthy(!isMatch('123abc', 'a(b*(foo|bar))d'));
    expect_truthy(!isMatch('ab', 'a(b*(foo|bar))d'));
    expect_truthy(!isMatch('abab', 'a(b*(foo|bar))d'));
    expect_truthy(!isMatch('abcdef', 'a(b*(foo|bar))d'));
    expect_truthy(!isMatch('accdef', 'a(b*(foo|bar))d'));
    expect_truthy(!isMatch('abcfefg', 'a(b*(foo|bar))d'));
    expect_truthy(!isMatch('abef', 'a(b*(foo|bar))d'));
    expect_truthy(!isMatch('abcfef', 'a(b*(foo|bar))d'));
    expect_truthy(isMatch('abd', 'a(b*(foo|bar))d'));
    expect_truthy(!isMatch('acd', 'a(b*(foo|bar))d'));

    expect_truthy(!isMatch('123abc', 'ab*(e|f)'));
    expect_truthy(isMatch('ab', 'ab*(e|f)'));
    expect_truthy(!isMatch('abab', 'ab*(e|f)'));
    expect_truthy(!isMatch('abcdef', 'ab*(e|f)'));
    expect_truthy(!isMatch('accdef', 'ab*(e|f)'));
    expect_truthy(!isMatch('abcfefg', 'ab*(e|f)'));
    expect_truthy(isMatch('abef', 'ab*(e|f)'));
    expect_truthy(!isMatch('abcfef', 'ab*(e|f)'));
    expect_truthy(!isMatch('abd', 'ab*(e|f)'));
    expect_truthy(!isMatch('acd', 'ab*(e|f)'));

    expect_truthy(!isMatch('123abc', 'ab**(e|f)'));
    expect_truthy(isMatch('ab', 'ab**(e|f)'));
    expect_truthy(isMatch('abab', 'ab**(e|f)'));
    expect_truthy(isMatch('abcdef', 'ab**(e|f)'));
    expect_truthy(!isMatch('accdef', 'ab**(e|f)'));
    expect_truthy(isMatch('abcfefg', 'ab**(e|f)'));
    expect_truthy(isMatch('abef', 'ab**(e|f)'));
    expect_truthy(isMatch('abcfef', 'ab**(e|f)'));
    expect_truthy(isMatch('abd', 'ab**(e|f)'));
    expect_truthy(!isMatch('acd', 'ab**(e|f)'));

    expect_truthy(!isMatch('123abc', 'ab**(e|f)g'));
    expect_truthy(!isMatch('ab', 'ab**(e|f)g'));
    expect_truthy(!isMatch('abab', 'ab**(e|f)g'));
    expect_truthy(!isMatch('abcdef', 'ab**(e|f)g'));
    expect_truthy(!isMatch('accdef', 'ab**(e|f)g'));
    expect_truthy(isMatch('abcfefg', 'ab**(e|f)g'));
    expect_truthy(!isMatch('abef', 'ab**(e|f)g'));
    expect_truthy(!isMatch('abcfef', 'ab**(e|f)g'));
    expect_truthy(!isMatch('abd', 'ab**(e|f)g'));
    expect_truthy(!isMatch('acd', 'ab**(e|f)g'));

    expect_truthy(!isMatch('123abc', 'ab***ef'));
    expect_truthy(!isMatch('ab', 'ab***ef'));
    expect_truthy(!isMatch('abab', 'ab***ef'));
    expect_truthy(isMatch('abcdef', 'ab***ef'));
    expect_truthy(!isMatch('accdef', 'ab***ef'));
    expect_truthy(!isMatch('abcfefg', 'ab***ef'));
    expect_truthy(isMatch('abef', 'ab***ef'));
    expect_truthy(isMatch('abcfef', 'ab***ef'));
    expect_truthy(!isMatch('abd', 'ab***ef'));
    expect_truthy(!isMatch('acd', 'ab***ef'));

    expect_truthy(!isMatch('123abc', 'ab*+(e|f)'));
    expect_truthy(!isMatch('ab', 'ab*+(e|f)'));
    expect_truthy(!isMatch('abab', 'ab*+(e|f)'));
    expect_truthy(isMatch('abcdef', 'ab*+(e|f)'));
    expect_truthy(!isMatch('accdef', 'ab*+(e|f)'));
    expect_truthy(!isMatch('abcfefg', 'ab*+(e|f)'));
    expect_truthy(isMatch('abef', 'ab*+(e|f)'));
    expect_truthy(isMatch('abcfef', 'ab*+(e|f)'));
    expect_truthy(!isMatch('abd', 'ab*+(e|f)'));
    expect_truthy(!isMatch('acd', 'ab*+(e|f)'));

    expect_truthy(!isMatch('123abc', 'ab*d*(e|f)'));
    expect_truthy(!isMatch('ab', 'ab*d*(e|f)'));
    expect_truthy(!isMatch('abab', 'ab*d*(e|f)'));
    expect_truthy(isMatch('abcdef', 'ab*d*(e|f)'));
    expect_truthy(!isMatch('accdef', 'ab*d*(e|f)'));
    expect_truthy(!isMatch('abcfefg', 'ab*d*(e|f)'));
    expect_truthy(!isMatch('abef', 'ab*d*(e|f)'));
    expect_truthy(!isMatch('abcfef', 'ab*d*(e|f)'));
    expect_truthy(isMatch('abd', 'ab*d*(e|f)'));
    expect_truthy(!isMatch('acd', 'ab*d*(e|f)'));

    expect_truthy(!isMatch('123abc', 'ab*d+(e|f)'));
    expect_truthy(!isMatch('ab', 'ab*d+(e|f)'));
    expect_truthy(!isMatch('abab', 'ab*d+(e|f)'));
    expect_truthy(isMatch('abcdef', 'ab*d+(e|f)'));
    expect_truthy(!isMatch('accdef', 'ab*d+(e|f)'));
    expect_truthy(!isMatch('abcfefg', 'ab*d+(e|f)'));
    expect_truthy(!isMatch('abef', 'ab*d+(e|f)'));
    expect_truthy(!isMatch('abcfef', 'ab*d+(e|f)'));
    expect_truthy(!isMatch('abd', 'ab*d+(e|f)'));
    expect_truthy(!isMatch('acd', 'ab*d+(e|f)'));

    expect_truthy(!isMatch('123abc', 'ab?*(e|f)'));
    expect_truthy(!isMatch('ab', 'ab?*(e|f)'));
    expect_truthy(!isMatch('abab', 'ab?*(e|f)'));
    expect_truthy(!isMatch('abcdef', 'ab?*(e|f)'));
    expect_truthy(!isMatch('accdef', 'ab?*(e|f)'));
    expect_truthy(!isMatch('abcfefg', 'ab?*(e|f)'));
    expect_truthy(isMatch('abef', 'ab?*(e|f)'));
    expect_truthy(isMatch('abcfef', 'ab?*(e|f)'));
    expect_truthy(isMatch('abd', 'ab?*(e|f)'));
    expect_truthy(!isMatch('acd', 'ab?*(e|f)'));
  });

  test('bug in all versions up to and including bash-2.05b', () => {
    expect_truthy(isMatch('123abc', '*?(a)bc'));
  });

  test('should work with character classes', () => {
    let opts = { posix: true };
    expect_truthy(isMatch('a.b', 'a[^[:alnum:]]b', opts));
    expect_truthy(isMatch('a,b', 'a[^[:alnum:]]b', opts));
    expect_truthy(isMatch('a:b', 'a[^[:alnum:]]b', opts));
    expect_truthy(isMatch('a-b', 'a[^[:alnum:]]b', opts));
    expect_truthy(isMatch('a;b', 'a[^[:alnum:]]b', opts));
    expect_truthy(isMatch('a b', 'a[^[:alnum:]]b', opts));
    expect_truthy(isMatch('a_b', 'a[^[:alnum:]]b', opts));

    expect_truthy(isMatch('a.b', 'a[-.,:\\;\\ _]b'));
    expect_truthy(isMatch('a,b', 'a[-.,:\\;\\ _]b'));
    expect_truthy(isMatch('a:b', 'a[-.,:\\;\\ _]b'));
    expect_truthy(isMatch('a-b', 'a[-.,:\\;\\ _]b'));
    expect_truthy(isMatch('a;b', 'a[-.,:\\;\\ _]b'));
    expect_truthy(isMatch('a b', 'a[-.,:\\;\\ _]b'));
    expect_truthy(isMatch('a_b', 'a[-.,:\\;\\ _]b'));

    expect_truthy(isMatch('a.b', 'a@([^[:alnum:]])b', opts));
    expect_truthy(isMatch('a,b', 'a@([^[:alnum:]])b', opts));
    expect_truthy(isMatch('a:b', 'a@([^[:alnum:]])b', opts));
    expect_truthy(isMatch('a-b', 'a@([^[:alnum:]])b', opts));
    expect_truthy(isMatch('a;b', 'a@([^[:alnum:]])b', opts));
    expect_truthy(isMatch('a b', 'a@([^[:alnum:]])b', opts));
    expect_truthy(isMatch('a_b', 'a@([^[:alnum:]])b', opts));

    expect_truthy(isMatch('a.b', 'a@([-.,:; _])b'));
    expect_truthy(isMatch('a,b', 'a@([-.,:; _])b'));
    expect_truthy(isMatch('a:b', 'a@([-.,:; _])b'));
    expect_truthy(isMatch('a-b', 'a@([-.,:; _])b'));
    expect_truthy(isMatch('a;b', 'a@([-.,:; _])b'));
    expect_truthy(isMatch('a b', 'a@([-.,:; _])b'));
    expect_truthy(isMatch('a_b', 'a@([-.,:; _])b'));

    expect_truthy(isMatch('a.b', 'a@([.])b'));
    expect_truthy(!isMatch('a,b', 'a@([.])b'));
    expect_truthy(!isMatch('a:b', 'a@([.])b'));
    expect_truthy(!isMatch('a-b', 'a@([.])b'));
    expect_truthy(!isMatch('a;b', 'a@([.])b'));
    expect_truthy(!isMatch('a b', 'a@([.])b'));
    expect_truthy(!isMatch('a_b', 'a@([.])b'));

    expect_truthy(!isMatch('a.b', 'a@([^.])b'));
    expect_truthy(isMatch('a,b', 'a@([^.])b'));
    expect_truthy(isMatch('a:b', 'a@([^.])b'));
    expect_truthy(isMatch('a-b', 'a@([^.])b'));
    expect_truthy(isMatch('a;b', 'a@([^.])b'));
    expect_truthy(isMatch('a b', 'a@([^.])b'));
    expect_truthy(isMatch('a_b', 'a@([^.])b'));

    expect_truthy(isMatch('a.b', 'a@([^x])b'));
    expect_truthy(isMatch('a,b', 'a@([^x])b'));
    expect_truthy(isMatch('a:b', 'a@([^x])b'));
    expect_truthy(isMatch('a-b', 'a@([^x])b'));
    expect_truthy(isMatch('a;b', 'a@([^x])b'));
    expect_truthy(isMatch('a b', 'a@([^x])b'));
    expect_truthy(isMatch('a_b', 'a@([^x])b'));

    expect_truthy(isMatch('a.b', 'a+([^[:alnum:]])b', opts));
    expect_truthy(isMatch('a,b', 'a+([^[:alnum:]])b', opts));
    expect_truthy(isMatch('a:b', 'a+([^[:alnum:]])b', opts));
    expect_truthy(isMatch('a-b', 'a+([^[:alnum:]])b', opts));
    expect_truthy(isMatch('a;b', 'a+([^[:alnum:]])b', opts));
    expect_truthy(isMatch('a b', 'a+([^[:alnum:]])b', opts));
    expect_truthy(isMatch('a_b', 'a+([^[:alnum:]])b', opts));

    expect_truthy(isMatch('a.b', 'a@(.|[^[:alnum:]])b', opts));
    expect_truthy(isMatch('a,b', 'a@(.|[^[:alnum:]])b', opts));
    expect_truthy(isMatch('a:b', 'a@(.|[^[:alnum:]])b', opts));
    expect_truthy(isMatch('a-b', 'a@(.|[^[:alnum:]])b', opts));
    expect_truthy(isMatch('a;b', 'a@(.|[^[:alnum:]])b', opts));
    expect_truthy(isMatch('a b', 'a@(.|[^[:alnum:]])b', opts));
    expect_truthy(isMatch('a_b', 'a@(.|[^[:alnum:]])b', opts));
  });

  test('should support POSIX character classes in extglobs', () => {
    let opts = { posix: true };
    expect_truthy(isMatch('a.c', '+([[:alpha:].])', opts));
    expect_truthy(isMatch('a.c', '+([[:alpha:].])+([[:alpha:].])', opts));
    expect_truthy(isMatch('a.c', '*([[:alpha:].])', opts));
    expect_truthy(isMatch('a.c', '*([[:alpha:].])*([[:alpha:].])', opts));
    expect_truthy(isMatch('a.c', '?([[:alpha:].])?([[:alpha:].])?([[:alpha:].])', opts));
    expect_truthy(isMatch('a.c', '@([[:alpha:].])@([[:alpha:].])@([[:alpha:].])', opts));
    expect_truthy(!isMatch('.', '!(\\.)', opts));
    expect_truthy(!isMatch('.', '!([[:alpha:].])', opts));
    expect_truthy(isMatch('.', '?([[:alpha:].])', opts));
    expect_truthy(isMatch('.', '@([[:alpha:].])', opts));
  });

  // ported from http://www.bashcookbook.com/bashinfo/source/bash-4.3/tests/extglob2.tests
  test('should pass extglob2 tests', () => {
    expect_truthy(!isMatch('baaac', '*(@(a))a@(c)'));
    expect_truthy(!isMatch('c', '*(@(a))a@(c)'));
    expect_truthy(!isMatch('egz', '@(b+(c)d|e+(f)g?|?(h)i@(j|k))'));
    expect_truthy(!isMatch('foooofof', '*(f+(o))'));
    expect_truthy(!isMatch('foooofofx', '*(f*(o))'));
    expect_truthy(!isMatch('foooxfooxofoxfooox', '*(f*(o)x)'));
    expect_truthy(!isMatch('ofooofoofofooo', '*(f*(o))'));
    expect_truthy(!isMatch('ofoooxoofxoofoooxoofxofo', '*(*(of*(o)x)o)'));
    expect_truthy(!isMatch('oxfoxfox', '*(oxf+(ox))'));
    expect_truthy(!isMatch('xfoooofof', '*(f*(o))'));
    expect_truthy(isMatch('aaac', '*(@(a))a@(c)'));
    expect_truthy(isMatch('aac', '*(@(a))a@(c)'));
    expect_truthy(isMatch('abbcd', '@(ab|a*(b))*(c)d'));
    expect_truthy(isMatch('abcd', '?@(a|b)*@(c)d'));
    expect_truthy(isMatch('abcd', '@(ab|a*@(b))*(c)d'));
    expect_truthy(isMatch('ac', '*(@(a))a@(c)'));
    expect_truthy(isMatch('acd', '@(ab|a*(b))*(c)d'));
    expect_truthy(isMatch('effgz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))'));
    expect_truthy(isMatch('efgz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))'));
    expect_truthy(isMatch('egz', '@(b+(c)d|e*(f)g?|?(h)i@(j|k))'));
    expect_truthy(isMatch('egzefffgzbcdij', '*(b+(c)d|e*(f)g?|?(h)i@(j|k))'));
    expect_truthy(isMatch('fffooofoooooffoofffooofff', '*(*(f)*(o))'));
    expect_truthy(isMatch('ffo', '*(f*(o))'));
    expect_truthy(isMatch('fofo', '*(f*(o))'));
    expect_truthy(isMatch('foofoofo', '@(foo|f|fo)*(f|of+(o))'));
    expect_truthy(isMatch('fooofoofofooo', '*(f*(o))'));
    expect_truthy(isMatch('foooofo', '*(f*(o))'));
    expect_truthy(isMatch('foooofof', '*(f*(o))'));
    expect_truthy(isMatch('foooxfooxfoxfooox', '*(f*(o)x)'));
    expect_truthy(isMatch('foooxfooxfxfooox', '*(f*(o)x)'));
    expect_truthy(isMatch('ofoofo', '*(of+(o))'));
    expect_truthy(isMatch('ofoofo', '*(of+(o)|f)'));
    expect_truthy(isMatch('ofoooxoofxo', '*(*(of*(o)x)o)'));
    expect_truthy(isMatch('ofoooxoofxoofoooxoofxo', '*(*(of*(o)x)o)'));
    expect_truthy(isMatch('ofoooxoofxoofoooxoofxoo', '*(*(of*(o)x)o)'));
    expect_truthy(isMatch('ofoooxoofxoofoooxoofxooofxofxo', '*(*(of*(o)x)o)'));
    expect_truthy(isMatch('ofxoofxo', '*(*(of*(o)x)o)'));
    expect_truthy(isMatch('oofooofo', '*(of|oof+(o))'));
    expect_truthy(isMatch('oxfoxoxfox', '*(oxf+(ox))'));
  });

  test('should support backtracking in alternation matches', () => {
    expect_truthy(isMatch('fofoofoofofoo', '*(fo|foo)'));
  });

  test('should support exclusions', () => {
    expect_truthy(!isMatch('f', '!(f)'));
    expect_truthy(!isMatch('f', '*(!(f))'));
    expect_truthy(!isMatch('f', '+(!(f))'));
    expect_truthy(!isMatch('foo', '!(foo)'));
    expect_truthy(!isMatch('foob', '!(foo)b*'));
    expect_truthy(!isMatch('mad.moo.cow', '!(*.*).!(*.*)'));
    expect_truthy(!isMatch('mucca.pazza', 'mu!(*(c))?.pa!(*(z))?'));
    expect_truthy(!isMatch('zoot', '@(!(z*)|*x)'));
    expect_truthy(isMatch('fff', '!(f)'));
    expect_truthy(isMatch('fff', '*(!(f))'));
    expect_truthy(isMatch('fff', '+(!(f))'));
    expect_truthy(isMatch('foo', '!(f)'));
    expect_truthy(isMatch('foo', '!(x)'));
    expect_truthy(isMatch('foo', '!(x)*'));
    expect_truthy(isMatch('foo', '*(!(f))'));
    expect_truthy(isMatch('foo', '+(!(f))'));
    expect_truthy(isMatch('foobar', '!(foo)'));
    expect_truthy(isMatch('foot', '@(!(z*)|*x)'));
    expect_truthy(isMatch('foox', '@(!(z*)|*x)'));
    expect_truthy(isMatch('ooo', '!(f)'));
    expect_truthy(isMatch('ooo', '*(!(f))'));
    expect_truthy(isMatch('ooo', '+(!(f))'));
    expect_truthy(isMatch('zoox', '@(!(z*)|*x)'));
  });
});
