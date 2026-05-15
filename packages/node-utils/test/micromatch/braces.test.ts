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
const { isMatch, hasBraces } = mm;

describe('braces', () => {
  test('should return true when braces are found', () => {
    expect_loose_equal(hasBraces('{foo}'), true);
    expect_loose_equal(hasBraces('foo}'), false);
    expect_loose_equal(hasBraces('{foo'), false);
    expect_loose_equal(hasBraces('a{}b'), true);
    expect_loose_equal(hasBraces('abc {foo} xyz'), true);
    expect_loose_equal(hasBraces('abc {foo xyz'), false);
    expect_loose_equal(hasBraces('abc {foo} xyz'), true);
    expect_loose_equal(hasBraces('abc foo} xyz'), false);
    expect_loose_equal(hasBraces('abc foo xyz'), false);
    expect_loose_equal(hasBraces('abc {foo} xyz {bar} pqr'), true);
    expect_loose_equal(hasBraces('abc {foo xyz {bar} pqr'), true);
    expect_loose_equal(hasBraces('abc foo} xyz {bar pqr'), false);
  });

  test('should handle extglobs in braces', () => {
    let fixtures = ['a', 'b', 'c', 'd', 'ab', 'ac', 'ad', 'bc', 'cb', 'bc,d', 'c,db', 'c,d', 'd)', '(b|c', '*(b|c', 'b|c', 'b|cc', 'cb|c', 'x(a|b|c)', 'x(a|c)', '(a|b|c)', '(a|c)'];

    expect_deepEqual(mm(fixtures, ['a', '*(b|c,d)']), ['a', 'b', 'bc,d', 'c,db', 'c,d']);
    expect_deepEqual(mm(fixtures, '{a,*(b|c,d)}'), ['a', 'b', 'bc,d', 'c,db', 'c,d']);
    expect_deepEqual(mm(fixtures, ['a', '*(b|c,d)'], { expand: true }), ['a', 'b', 'bc,d', 'c,db', 'c,d']);
    expect_deepEqual(mm(fixtures, '{a,*(b|c,d)}', { expand: true }), ['a', 'b', 'bc,d', 'c,db', 'c,d']);

    let expected = ['a', 'b', 'c', 'ab', 'ac', 'bc', 'cb'];
    expect_deepEqual(mm(fixtures, '*(a|b|c)'), expected);
    expect_deepEqual(mm(fixtures, '*(a|{b|c,c})'), expected);
    expect_deepEqual(mm(fixtures, '*(a|{b|c,c})', { expand: true }), expected);
  });

  test('should not match with brace sets when disabled', () => {
    expect_truthy(!isMatch('a/a', 'a/{a,b}', { nobrace: true }));
    expect_truthy(!isMatch('a/b', 'a/{a,b}', { nobrace: true }));
    expect_truthy(!isMatch('a/c', 'a/{a,b}', { nobrace: true }));
    expect_truthy(!isMatch('b/b', 'a/{a,b}', { nobrace: true }));
    expect_truthy(!isMatch('b/b', 'a/{a,b,c}', { nobrace: true }));
    expect_truthy(!isMatch('a/c', 'a/{a,b,c}', { nobrace: true }));
  });

  test('should not match with brace ranges when disabled', () => {
    expect_truthy(!isMatch('a/a', 'a/{a..c}', { nobrace: true }));
    expect_truthy(!isMatch('a/b', 'a/{a..c}', { nobrace: true }));
    expect_truthy(!isMatch('a/c', 'a/{a..c}', { nobrace: true }));
  });

  test('should match with brace sets', () => {
    expect_truthy(isMatch('a/a', 'a/{a,b}'));
    expect_truthy(isMatch('a/b', 'a/{a,b}'));
    expect_truthy(!isMatch('a/c', 'a/{a,b}'));
    expect_truthy(!isMatch('b/b', 'a/{a,b}'));
    expect_truthy(!isMatch('b/b', 'a/{a,b,c}'));
    expect_truthy(isMatch('a/c', 'a/{a,b,c}'));
  });

  test('should match with brace ranges', () => {
    expect_truthy(isMatch('a/a', 'a/{a..c}'));
    expect_truthy(isMatch('a/b', 'a/{a..c}'));
    expect_truthy(isMatch('a/c', 'a/{a..c}'));
  });

  test('should not convert braces inside brackets', () => {
    expect_truthy(isMatch('foo{}baz', 'foo[{a,b}]+baz'));
    expect_truthy(isMatch('{a}{b}{c}', '[abc{}]+'));
  });

  test('should support braces with empty elements', () => {
    expect_truthy(!isMatch('abc.txt', 'a{,b}.txt'));
    expect_truthy(!isMatch('abc.txt', 'a{a,b,}.txt'));
    expect_truthy(!isMatch('abc.txt', 'a{b,}.txt'));
    expect_truthy(isMatch('a.txt', 'a{,b}.txt'));
    expect_truthy(isMatch('a.txt', 'a{b,}.txt'));
    expect_truthy(isMatch('aa.txt', 'a{a,b,}.txt'));
    expect_truthy(isMatch('aa.txt', 'a{a,b,}.txt'));
    expect_truthy(isMatch('ab.txt', 'a{,b}.txt'));
    expect_truthy(isMatch('ab.txt', 'a{b,}.txt'));
  });

  test('should support braces containing slashes', () => {
    expect_truthy(isMatch('a', '{a/,}a/**'));
    expect_truthy(isMatch('aa.txt', 'a{a,b/}*.txt'));
    expect_truthy(isMatch('ab/.txt', 'a{a,b/}*.txt'));
    expect_truthy(isMatch('ab/a.txt', 'a{a,b/}*.txt'));
    expect_truthy(isMatch('a/', '{a/,}a/**'));
    expect_truthy(isMatch('a/a/', '{a/,}a/**'));
    expect_truthy(isMatch('a/a', '{a/,}a/**'));
    expect_truthy(isMatch('a/a/a', '{a/,}a/**'));
    expect_truthy(isMatch('a/a/', '{a/,}a/**'));
    expect_truthy(isMatch('a/a/a/', '{a/,}a/**'));
    expect_truthy(isMatch('a/b/a/', '{a/,}b/**'));
    expect_truthy(isMatch('b/a/', '{a/,}b/**'));
  });

  test('should support braces with slashes and empty elements', () => {
    expect_truthy(isMatch('a.txt', 'a{,/}*.txt'));
    expect_truthy(isMatch('ab.txt', 'a{,/}*.txt'));
    expect_truthy(isMatch('a/b.txt', 'a{,/}*.txt'));
    expect_truthy(isMatch('a/ab.txt', 'a{,/}*.txt'));
  });

  test('should support braces with escaped parens and stars', () => {
    expect_truthy(isMatch('a.txt', 'a{,.*{foo,db},\\(bar\\)}.txt'));
    expect_truthy(!isMatch('adb.txt', 'a{,.*{foo,db},\\(bar\\)}.txt'));
    expect_truthy(isMatch('a.db.txt', 'a{,.*{foo,db},\\(bar\\)}.txt'));

    expect_truthy(isMatch('a.txt', 'a{,*.{foo,db},\\(bar\\)}.txt'));
    expect_truthy(!isMatch('adb.txt', 'a{,*.{foo,db},\\(bar\\)}.txt'));
    expect_truthy(isMatch('a.db.txt', 'a{,*.{foo,db},\\(bar\\)}.txt'));

    expect_truthy(isMatch('a', 'a{,.*{foo,db},\\(bar\\)}'));
    expect_truthy(!isMatch('adb', 'a{,.*{foo,db},\\(bar\\)}'));
    expect_truthy(isMatch('a.db', 'a{,.*{foo,db},\\(bar\\)}'));

    expect_truthy(isMatch('a', 'a{,*.{foo,db},\\(bar\\)}'));
    expect_truthy(!isMatch('adb', 'a{,*.{foo,db},\\(bar\\)}'));
    expect_truthy(isMatch('a.db', 'a{,*.{foo,db},\\(bar\\)}'));

    expect_truthy(!isMatch('a', '{,.*{foo,db},\\(bar\\)}'));
    expect_truthy(!isMatch('adb', '{,.*{foo,db},\\(bar\\)}'));
    expect_truthy(!isMatch('a.db', '{,.*{foo,db},\\(bar\\)}'));
    expect_truthy(isMatch('.db', '{,.*{foo,db},\\(bar\\)}'));

    expect_truthy(!isMatch('a', '{,*.{foo,db},\\(bar\\)}'));
    expect_truthy(isMatch('a', '{*,*.{foo,db},\\(bar\\)}'));
    expect_truthy(!isMatch('adb', '{,*.{foo,db},\\(bar\\)}'));
    expect_truthy(isMatch('a.db', '{,*.{foo,db},\\(bar\\)}'));
  });

  test('should support braces in patterns with globstars', () => {
    expect_truthy(!isMatch('a/b/c/xyz.md', 'a/b/**/c{d,e}/**/xyz.md'));
    expect_truthy(!isMatch('a/b/d/xyz.md', 'a/b/**/c{d,e}/**/xyz.md'));
    expect_truthy(isMatch('a/b/cd/xyz.md', 'a/b/**/c{d,e}/**/xyz.md'));
    expect_truthy(isMatch('a/b/c/xyz.md', 'a/b/**/{c,d,e}/**/xyz.md'));
    expect_truthy(isMatch('a/b/d/xyz.md', 'a/b/**/{c,d,e}/**/xyz.md'));
  });

  test('should support globstars enclosed in braces, with slashes and empty elements', () => {
    expect_truthy(isMatch('a.txt', 'a{,/**/}*.txt'));
    expect_truthy(isMatch('a/b.txt', 'a{,/**/,/}*.txt'));
    expect_truthy(isMatch('a/x/y.txt', 'a{,/**/}*.txt'));
    expect_truthy(!isMatch('a/x/y/z', 'a{,/**/}*.txt'));
  });

  test('should support braces with globstars and empty elements', () => {
    expect_truthy(isMatch('a/b/foo/bar/baz.qux', 'a/b{,/**}/bar{,/**}/*.*'));
    expect_truthy(isMatch('a/b/bar/baz.qux', 'a/b{,/**}/bar{,/**}/*.*'));
  });

  test('should support Kleene stars', () => {
    expect_truthy(isMatch('ab', '{ab,c}*'));
    expect_truthy(isMatch('abab', '{ab,c}*'));
    expect_truthy(isMatch('ababab', '{ab,c}*'));
    expect_truthy(isMatch('ababc', '{ab,c}*'));
    expect_truthy(isMatch('abc', '{ab,c}*'));
    expect_truthy(isMatch('abcab', '{ab,c}*'));
    expect_truthy(isMatch('abcc', '{ab,c}*'));
    expect_truthy(isMatch('c', '{ab,c}*'));
    expect_truthy(isMatch('cab', '{ab,c}*'));
    expect_truthy(isMatch('cabab', '{ab,c}*'));
    expect_truthy(isMatch('cabc', '{ab,c}*'));
    expect_truthy(isMatch('cc', '{ab,c}*'));
    expect_truthy(isMatch('ccab', '{ab,c}*'));
    expect_truthy(isMatch('ccc', '{ab,c}*'));
  });

  test('should support Kleene plus', () => {
    expect_truthy(isMatch('ab', '{ab,c}+'));
    expect_truthy(isMatch('abab', '{ab,c}+'));
    expect_truthy(isMatch('abc', '{ab,c}+'));
    expect_truthy(isMatch('c', '{ab,c}+'));
    expect_truthy(isMatch('cab', '{ab,c}+'));
    expect_truthy(isMatch('cc', '{ab,c}+'));
    expect_truthy(isMatch('ababab', '{ab,c}+'));
    expect_truthy(isMatch('ababc', '{ab,c}+'));
    expect_truthy(isMatch('abcab', '{ab,c}+'));
    expect_truthy(isMatch('abcc', '{ab,c}+'));
    expect_truthy(isMatch('cabab', '{ab,c}+'));
    expect_truthy(isMatch('cabc', '{ab,c}+'));
    expect_truthy(isMatch('ccab', '{ab,c}+'));
    expect_truthy(isMatch('ccc', '{ab,c}+'));
    expect_truthy(isMatch('ccc', '{a,b,c}+'));

    expect_truthy(isMatch('a', '{a,b,c}+'));
    expect_truthy(isMatch('b', '{a,b,c}+'));
    expect_truthy(isMatch('c', '{a,b,c}+'));
    expect_truthy(isMatch('aa', '{a,b,c}+'));
    expect_truthy(isMatch('ab', '{a,b,c}+'));
    expect_truthy(isMatch('ac', '{a,b,c}+'));
    expect_truthy(isMatch('ba', '{a,b,c}+'));
    expect_truthy(isMatch('bb', '{a,b,c}+'));
    expect_truthy(isMatch('bc', '{a,b,c}+'));
    expect_truthy(isMatch('ca', '{a,b,c}+'));
    expect_truthy(isMatch('cb', '{a,b,c}+'));
    expect_truthy(isMatch('cc', '{a,b,c}+'));
    expect_truthy(isMatch('aaa', '{a,b,c}+'));
    expect_truthy(isMatch('aab', '{a,b,c}+'));
    expect_truthy(isMatch('abc', '{a,b,c}+'));
  });

  test('should support braces', () => {
    expect_truthy(isMatch('a', '{a,b,c}'));
    expect_truthy(isMatch('b', '{a,b,c}'));
    expect_truthy(isMatch('c', '{a,b,c}'));
    expect_truthy(!isMatch('aa', '{a,b,c}'));
    expect_truthy(!isMatch('bb', '{a,b,c}'));
    expect_truthy(!isMatch('cc', '{a,b,c}'));
  });

  test('should support regex quantifiers by escaping braces', () => {
    expect_truthy(!isMatch('a  ', '@(!(a) \\{1,2\\})*', { unescape: true }));
    expect_truthy(!isMatch('a ', '@(!(a) \\{1,2\\})*', { unescape: true }));
    expect_truthy(!isMatch('a', '@(!(a) \\{1,2\\})*', { unescape: true }));
    expect_truthy(!isMatch('aa', '@(!(a) \\{1,2\\})*', { unescape: true }));
    expect_truthy(!isMatch('aaa', '@(!(a) \\{1,2\\})*', { unescape: true }));
    expect_truthy(!isMatch('b', '@(!(a) \\{1,2\\})*', { unescape: true }));
    expect_truthy(!isMatch('bb', '@(!(a) \\{1,2\\})*', { unescape: true }));
    expect_truthy(!isMatch('bbb', '@(!(a) \\{1,2\\})*', { unescape: true }));
    expect_truthy(isMatch(' a ', '@(!(a) \\{1,2\\})*', { unescape: true }));
    expect_truthy(isMatch('b  ', '@(!(a) \\{1,2\\})*', { unescape: true }));
    expect_truthy(isMatch('b ', '@(!(a) \\{1,2\\})*', { unescape: true }));

    expect_truthy(isMatch('a   ', '@(!(a \\{1,2\\}))*'));
    expect_truthy(isMatch('a   b', '@(!(a \\{1,2\\}))*'));
    expect_truthy(isMatch('a  b', '@(!(a \\{1,2\\}))*'));
    expect_truthy(isMatch('a  ', '@(!(a \\{1,2\\}))*'));
    expect_truthy(isMatch('a ', '@(!(a \\{1,2\\}))*'));
    expect_truthy(isMatch('a', '@(!(a \\{1,2\\}))*'));
    expect_truthy(isMatch('aa', '@(!(a \\{1,2\\}))*'));
    expect_truthy(isMatch('b', '@(!(a \\{1,2\\}))*'));
    expect_truthy(isMatch('bb', '@(!(a \\{1,2\\}))*'));
    expect_truthy(isMatch(' a ', '@(!(a \\{1,2\\}))*'));
    expect_truthy(isMatch('b  ', '@(!(a \\{1,2\\}))*'));
    expect_truthy(isMatch('b ', '@(!(a \\{1,2\\}))*'));
  });
});
