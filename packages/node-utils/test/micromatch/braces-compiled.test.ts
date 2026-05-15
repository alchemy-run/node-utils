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

const optimize = (pattern, options) => {
  return mm.braces(pattern, Object.assign({ optimize: true }, options));
};

describe('braces - compiled', () => {
  describe('extglob characters', () => {
    test('should expand braces (in extglobs) when preceded by an extglob character', () => {
      let actual = mm.braces('abc/*!(-v@{1,2}.0).js');
      expect_deepEqual(actual, ['abc/*!(-v@(1|2).0).js']);
    });

    test('should expand braces when preceded by an extglob character', () => {
      let actual = mm.braces('abc/*-v@{1,2}.0.js');
      expect_deepEqual(actual, ['abc/*-v@(1|2).0.js']);
    });
  });

  describe('sets', () => {
    describe('invalid sets', () => {
      test('should handle invalid sets:', () => {
        optimize('{0..10,braces}', ['(0..10|braces)']);
        optimize('{1..10,braces}', ['(1..10|braces)']);
      });
    });

    describe('escaping', () => {
      test('should not expand escaped braces', () => {
        optimize('\\{a,b,c,d,e}', ['{a,b,c,d,e}']);
        optimize('a/b/c/{x,y\\}', ['a/b/c/{x,y}']);
        optimize('a/\\{x,y}/cde', ['a/{x,y}/cde']);
        optimize('abcd{efgh', ['abcd{efgh']);
        optimize('{abc}', ['{abc}']);
        optimize('{x,y,\\{a,b,c\\}}', ['(x|y|\\{a|b|c\\})']);
        optimize('{x,y,{a,b,c\\}}', ['\\{x,y,(a|b|c\\})']);
        optimize('{x,y,{abc},trie}', ['(x|y|\\{abc\\}|trie)']);
        optimize('{x\\,y,\\{abc\\},trie}', ['(x,y|\\{abc\\}|trie)']);
      });

      test('should handle spaces', () => {
        // Bash 4.3 says the following should be equivalent to `foo|(1|2)|bar`,
        // That makes sense in Bash, since ' ' is a separator, but not here.
        optimize('foo {1,2} bar', ['foo (1|2) bar']);
      });

      test('should handle empty braces', () => {
        optimize('{ }', ['\\{ \\}']);
        optimize('{', ['\\{']);
        optimize('{}', ['\\{\\}']);
        optimize('}', ['\\}']);
      });

      test('should escape braces when only one value is defined', () => {
        optimize('a{b}c', ['a\\{b\\}c']);
        optimize('a/b/c{d}e', ['a/b/c\\{d\\}e']);
      });

      test('should not expand braces in sets with es6/bash-like variables', () => {
        optimize('abc/${ddd}/xyz', ['abc/\\$\\{ddd\\}/xyz']);
        optimize('a${b}c', ['a\\$\\{b\\}c']);
        optimize('a/{${b},c}/d', ['a/(\\$\\{b\\}|c)/d']);
        optimize('a${b,d}/{foo,bar}c', ['a\\$\\{b,d\\}/(foo|bar)c']);
      });

      test('should not expand escaped commas.', () => {
        optimize('a{b\\,c\\,d}e', ['a\\{b,c,d\\}e']);
        optimize('a{b\\,c}d', ['a\\{b,c\\}d']);
        optimize('{abc\\,def}', ['\\{abc,def\\}']);
        optimize('{abc\\,def,ghi}', ['(abc,def|ghi)']);
        optimize('a/{b,c}/{x\\,y}/d/e', ['a/(b|c)/\\{x,y\\}/d/e']);
      });

      test('should return sets with escaped commas', () => {
        optimize('a/{b,c}/{x\\,y}/d/e', ['a/(b|c)/\\{x,y\\}/d/e']);
      });

      test('should not expand escaped braces.', () => {
        optimize('{a,b\\}c,d}', ['(a|b\\}c|d)']);
        optimize('\\{a,b,c,d,e}', ['\\{a,b,c,d,e\\}']);
        optimize('a/{z,\\{a,b,c,d,e}/d', ['a/(z|\\{a|b|c|d|e)/d']);
        optimize('a/\\{b,c}/{d,e}/f', ['a/\\{b,c\\}/(d|e)/f']);
        optimize('./\\{x,y}/{a..z..3}/', ['./\\{x,y\\}/(a|d|g|j|m|p|s|v|y)/']);
      });

      test('should not expand escaped braces or commas.', () => {
        optimize('{x\\,y,\\{abc\\},trie}', ['(x,y|\\{abc\\}|trie)']);
      });
    });

    describe('set expansion', () => {
      test('should support sequence brace operators', () => {
        optimize('/usr/{ucb/{ex,edit},lib/{ex,how_ex}}', ['/usr/(ucb/(ex|edit)|lib/(ex|how_ex))']);
        optimize('ff{c,b,a}', ['ff(c|b|a)']);
        optimize('f{d,e,f}g', ['f(d|e|f)g']);
        optimize('x{{0..10},braces}y', ['x(([0-9]|10)|braces)y']);
        optimize('{1..10}', ['([1-9]|10)']);
        optimize('{a,b,c}', ['(a|b|c)']);
        optimize('{braces,{0..10}}', ['(braces|([0-9]|10))']);
        optimize('{l,n,m}xyz', ['(l|n|m)xyz']);
        optimize('{{0..10},braces}', ['(([0-9]|10)|braces)']);
        optimize('{{1..10..2},braces}', ['((1|3|5|7|9)|braces)']);
        optimize('{{1..10},braces}', ['(([1-9]|10)|braces)']);
      });

      test('should expand multiple sets', () => {
        optimize('a/{a,b}/{c,d}/e', ['a/(a|b)/(c|d)/e']);
        optimize('a{b,c}d{e,f}g', ['a(b|c)d(e|f)g']);
        optimize('a/{x,y}/c{d,e}f.{md,txt}', ['a/(x|y)/c(d|e)f.(md|txt)']);
      });

      test('should expand nested sets', () => {
        optimize('{a,b}{{a,b},a,b}', ['(a|b)((a|b)|a|b)']);
        optimize('a{b,c{d,e}f}g', ['a(b|c(d|e)f)g']);
        optimize('a{{x,y},z}b', ['a((x|y)|z)b']);
        optimize('f{x,y{g,z}}h', ['f(x|y(g|z))h']);
        optimize('a{b,c}{d,e}/hx/z', ['a(b|c)(d|e)/hx/z']);
        optimize('a{b,c{d,e},h}x/z', ['a(b|c(d|e)|h)x/z']);
        optimize('a{b,c{d,e},h}x{y,z}', ['a(b|c(d|e)|h)x(y|z)']);
        optimize('a{b,c{d,e},{f,g}h}x{y,z}', ['a(b|c(d|e)|(f|g)h)x(y|z)']);
        optimize('a-{b{d,e}}-c', ['a-\\{b(d|e)\\}-c']);
      });

      test('should expand not modify non-brace characters', () => {
        optimize('a/b/{d,e}/*.js', ['a/b/(d|e)/*.js']);
        optimize('a/**/c/{d,e}/f*.js', ['a/**/c/(d|e)/f*.js']);
        optimize('a/**/c/{d,e}/f*.{md,txt}', ['a/**/c/(d|e)/f*.(md|txt)']);
      });
    });

    describe('commas', () => {
      test('should work with leading and trailing commas.', () => {
        optimize('a{b,}c', ['a(b|)c']);
        optimize('a{,b}c', ['a(|b)c']);
      });
    });

    describe('spaces', () => {
      test('should handle spaces', () => {
        optimize('0{1..9} {10..20}', ['0([1-9]) (1[0-9]|20)']);
        optimize('a{ ,c{d, },h}x', ['a( |c(d| )|h)x']);
        optimize('a{ ,c{d, },h} ', ['a( |c(d| )|h) ']);

        // see https://github.com/jonschlinkert/micromatch/issues/66
        optimize('/Users/tobiasreich/Sites/aaa/bbb/ccc 2016/src/**/[^_]*.{html,ejs}', ['/Users/tobiasreich/Sites/aaa/bbb/ccc 2016/src/**/[^_]*.(html|ejs)']);
      });
    });
  });

  /**
   * Ranges
   */

  describe('ranges', () => {
    describe('escaping / invalid ranges', () => {
      test('should not try to expand ranges with decimals', () => {
        optimize('{1.1..2.1}', ['\\{1.1..2.1\\}']);
        optimize('{1.1..~2.1}', ['\\{1.1..~2.1\\}']);
      });

      test('should escape invalid ranges:', () => {
        optimize('{1..0f}', ['{1..0f}']);
        optimize('{1..10..ff}', ['{1..10..ff}']);
        optimize('{1..10.f}', ['{1..10.f}']);
        optimize('{1..10f}', ['{1..10f}']);
        optimize('{1..20..2f}', ['{1..20..2f}']);
        optimize('{1..20..f2}', ['{1..20..f2}']);
        optimize('{1..2f..2}', ['{1..2f..2}']);
        optimize('{1..ff..2}', ['{1..ff..2}']);
        optimize('{1..ff}', ['{1..ff}']);
        optimize('{1..f}', ['([1-f])']);
        optimize('{1.20..2}', ['{1.20..2}']);
      });

      test('weirdly-formed brace expansions -- fixed in post-bash-3.1', () => {
        optimize('a-{b{d,e}}-c', ['a-\\{b(d|e)\\}-c']);
        optimize('a-{bdef-{g,i}-c', ['a-\\{bdef-(g|i)-c']);
      });

      test('should not expand quoted strings.', () => {
        optimize('{"klklkl"}{1,2,3}', ['\\{klklkl\\}(1|2|3)']);
        optimize('{"x,x"}', ['\\{x,x\\}']);
      });

      test('should escaped outer braces in nested non-sets', () => {
        optimize('{a-{b,c,d}}', ['{a-(b|c|d)}']);
        optimize('{a,{a-{b,c,d}}}', ['(a|{a-(b|c|d)})']);
      });

      test('should escape imbalanced braces', () => {
        optimize('a-{bdef-{g,i}-c', ['a-\\{bdef-(g|i)-c']);
        optimize('abc{', ['abc\\{']);
        optimize('{abc{', ['\\{abc\\{']);
        optimize('{abc', ['\\{abc']);
        optimize('}abc', ['\\}abc']);
        optimize('ab{c', ['ab\\{c']);
        optimize('{{a,b}', ['\\{(a|b)']);
        optimize('{a,b}}', ['(a|b)\\}']);
        optimize('abcd{efgh', ['abcd\\{efgh']);
        optimize('a{b{c{d,e}f}g}h', ['a(b(c(d|e)f)g)h']);
        optimize('f{x,y{{g,z}}h}', ['f(x|y((g|z))h)']);
        optimize('z{a,b},c}d', ['z(a|b),c\\}d']);
        optimize('a{b{c{d,e}f{x,y{{g}h', ['a\\{b\\{c(d|e)f\\{x,y\\{\\{g\\}h']);
        optimize('f{x,y{{g}h', ['f\\{x,y\\{\\{g\\}h']);
        optimize('f{x,y{{g}}h', ['f{x,y{{g}}h']);
        optimize('a{b{c{d,e}f{x,y{}g}h', ['a{b{c(d|e)f(x|y{}g)h']);
        optimize('f{x,y{}g}h', ['f(x|y\\{\\}g)h']);
        optimize('z{a,b{,c}d', ['z\\{a,b(|c)d']);
      });
    });

    describe('positive numeric ranges', () => {
      test('should expand numeric ranges', () => {
        optimize('a{0..3}d', ['a([0-3])d']);
        optimize('x{10..1}y', ['x([1-9]|10)y']);
        optimize('x{3..3}y', ['x3y']);
        optimize('{1..10}', ['([1-9]|10)']);
        optimize('{1..3}', ['([1-3])']);
        optimize('{1..9}', ['([1-9])']);
        optimize('{10..1}', ['([1-9]|10)']);
        optimize('{10..1}y', ['([1-9]|10)y']);
        optimize('{3..3}', ['3']);
        optimize('{5..8}', ['([5-8])']);
      });
    });

    describe('negative ranges', () => {
      test('should expand ranges with negative numbers', () => {
        optimize('{-1..-10}', ['(-[1-9]|-10)']);
        optimize('{-10..-1}', ['(-[1-9]|-10)']);
        optimize('{-20..0}', ['(-[1-9]|-1[0-9]|-20|0)']);
        optimize('{0..-5}', ['(-[1-5]|0)']);
        optimize('{9..-4}', ['(-[1-4]|[0-9])']);
      });
    });

    describe('alphabetical ranges', () => {
      test('should expand alphabetical ranges', () => {
        optimize('0{1..9}/{10..20}', ['0([1-9])/(1[0-9]|20)']);
        optimize('0{a..d}0', ['0([a-d])0']);
        optimize('a/{b..d}/e', ['a/([b-d])/e']);
        optimize('{1..f}', ['([1-f])']);
        optimize('{a..A}', ['([A-a])']);
        optimize('{A..a}', ['([A-a])']);
        optimize('{a..e}', ['([a-e])']);
        optimize('{A..E}', ['([A-E])']);
        optimize('{a..f}', ['([a-f])']);
        optimize('{a..z}', ['([a-z])']);
        optimize('{E..A}', ['([A-E])']);
        optimize('{f..1}', ['([1-f])']);
        optimize('{f..a}', ['([a-f])']);
        optimize('{f..f}', ['f']);
      });

      test('should expand multiple ranges:', () => {
        optimize('a/{b..d}/e/{f..h}', ['a/([b-d])/e/([f-h])']);
      });
    });

    describe('combo', () => {
      test('should expand numerical ranges - positive and negative', () => {
        optimize('{-10..10}', ['(-[1-9]|-?10|[0-9])']);
      });
    });

    // HEADS UP! If you're using the `--mm` flag minimatch freezes on these
    describe('large numbers', () => {
      test('should expand large numbers', () => {
        optimize('{2147483645..2147483649}', ['(214748364[5-9])']);
        optimize('{214748364..2147483649}', ['(21474836[4-9]|2147483[7-9][0-9]|214748[4-9][0-9]{2}|214749[0-9]{3}|2147[5-9][0-9]{4}|214[8-9][0-9]{5}|21[5-9][0-9]{6}|2[2-9][0-9]{7}|[3-9][0-9]{8}|1[0-9]{9}|20[0-9]{8}|21[0-3][0-9]{7}|214[0-6][0-9]{6}|2147[0-3][0-9]{5}|21474[0-7][0-9]{4}|214748[0-2][0-9]{3}|2147483[0-5][0-9]{2}|21474836[0-4][0-9])']);
      });
    });

    describe('steps > positive ranges', () => {
      test('should expand ranges using steps:', () => {
        optimize('{1..10..1}', ['([1-9]|10)']);
        optimize('{1..10..2}', ['(1|3|5|7|9)']);
        optimize('{1..20..20}', ['1']);
        optimize('{1..20..20}', ['1']);
        optimize('{1..20..20}', ['1']);
        optimize('{1..20..2}', ['(1|3|5|7|9|11|13|15|17|19)']);
        optimize('{10..0..2}', ['(10|8|6|4|2|0)']);
        optimize('{10..1..2}', ['(10|8|6|4|2)']);
        optimize('{100..0..5}', ['(100|95|90|85|80|75|70|65|60|55|50|45|40|35|30|25|20|15|10|5|0)']);
        optimize('{2..10..1}', ['([2-9]|10)']);
        optimize('{2..10..2}', ['(2|4|6|8|10)']);
        optimize('{2..10..3}', ['(2|5|8)']);
        optimize('{a..z..2}', ['(a|c|e|g|i|k|m|o|q|s|u|w|y)']);
      });

      test('should expand positive ranges with negative steps:', () => {
        optimize('{10..0..-2}', ['(10|8|6|4|2|0)']);
      });
    });

    describe('steps > negative ranges', () => {
      test('should expand negative ranges using steps:', () => {
        optimize('{-1..-10..-2}', ['(-(1|3|5|7|9))']);
        optimize('{-1..-10..2}', ['(-(1|3|5|7|9))']);
        optimize('{-10..-2..2}', ['(-(10|8|6|4|2))']);
        optimize('{-2..-10..1}', ['(-[2-9]|-10)']);
        optimize('{-2..-10..2}', ['(-(2|4|6|8|10))']);
        optimize('{-2..-10..3}', ['(-(2|5|8))']);
        optimize('{-50..-0..5}', ['(0|-(50|45|40|35|30|25|20|15|10|5))']);
        optimize('{-9..9..3}', ['(0|3|6|9|-(9|6|3))']);
        optimize('{10..1..-2}', ['(10|8|6|4|2)']);
        optimize('{100..0..-5}', ['(100|95|90|85|80|75|70|65|60|55|50|45|40|35|30|25|20|15|10|5|0)']);
      });
    });

    describe('steps > alphabetical ranges', () => {
      test('should expand alpha ranges with steps', () => {
        optimize('{a..e..2}', ['(a|c|e)']);
        optimize('{E..A..2}', ['(E|C|A)']);
        optimize('{a..z}', ['([a-z])']);
        optimize('{a..z..2}', ['(a|c|e|g|i|k|m|o|q|s|u|w|y)']);
        optimize('{z..a..-2}', ['(z|x|v|t|r|p|n|l|j|h|f|d|b)']);
      });

      test('should expand alpha ranges with negative steps', () => {
        optimize('{z..a..-2}', ['(z|x|v|t|r|p|n|l|j|h|f|d|b)']);
      });
    });

    describe('padding', () => {
      test('unwanted zero-padding -- fixed post-bash-4.0', () => {
        optimize('{10..0..2}', ['(10|8|6|4|2|0)']);
        optimize('{10..0..-2}', ['(10|8|6|4|2|0)']);
        optimize('{-50..-0..5}', ['(0|-(50|45|40|35|30|25|20|15|10|5))']);
      });
    });
  });

  describe('integration', () => {
    test('should work with dots in file paths', () => {
      optimize('../{1..3}/../foo', '../([1-3])/../foo');
      optimize('../{2..10..2}/../foo', '../(2|4|6|8|10)/../foo');
      optimize('../{1..3}/../{a,b,c}/foo', '../([1-3])/../(a|b|c)/foo');
      optimize('./{a..z..3}/', './(a|d|g|j|m|p|s|v|y)/');
      optimize('./{"x,y"}/{a..z..3}/', './\\{x,y\\}/(a|d|g|j|m|p|s|v|y)/');
    });

    test('should expand a complex combination of ranges and sets:', () => {
      optimize('a/{x,y}/{1..5}c{d,e}f.{md,txt}', 'a/(x|y)/([1-5])c(d|e)f.(md|txt)');
    });

    test('should expand complex sets and ranges in `bash` mode:', () => {
      optimize('a/{x,{1..5},y}/c{d}e', 'a/(x|([1-5])|y)/c\\{d\\}e');
    });
  });
});
