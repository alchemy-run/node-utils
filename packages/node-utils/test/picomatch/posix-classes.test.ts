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


const pm = picomatch;
const { makeRe, parse } = pm;

const opts = { strictSlashes: true, posix: true, regex: true };
const isMatch = (...args) => pm.isMatch(...args, opts);
const convert = (...args) => {
  const state = parse(...args, opts);
  return state.output;
};

describe('posix classes', () => {
  describe('posix bracket type conversion', () => {
    test('should create regex character classes from POSIX bracket expressions:', () => {
      expect_equal(convert('foo[[:lower:]]bar'), 'foo[a-z]bar');
      expect_equal(convert('foo[[:lower:][:upper:]]bar'), 'foo[a-zA-Z]bar');
      expect_equal(convert('[[:alpha:]123]'), '(?=.)[a-zA-Z123]');
      expect_equal(convert('[[:lower:]]'), '(?=.)[a-z]');
      expect_equal(convert('[![:lower:]]'), '(?=.)[^a-z]');
      expect_equal(convert('[[:digit:][:upper:][:space:]]'), '(?=.)[0-9A-Z \\t\\r\\n\\v\\f]');
      expect_equal(convert('[[:xdigit:]]'), '(?=.)[A-Fa-f0-9]');
      expect_equal(convert('[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:graph:][:lower:][:print:][:punct:][:space:][:upper:][:xdigit:]]'), '(?=.)[a-zA-Z0-9a-zA-Z \\t\\x00-\\x1F\\x7F0-9\\x21-\\x7Ea-z\\x20-\\x7E \\-!"#$%&\'()\\*+,./:;<=>?@[\\]^_`{|}~ \\t\\r\\n\\v\\fA-ZA-Fa-f0-9]');
      expect_equal(convert('[^[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:lower:][:space:][:upper:][:xdigit:]]'), '(?=.)[^a-zA-Z0-9a-zA-Z \\t\\x00-\\x1F\\x7F0-9a-z \\t\\r\\n\\v\\fA-ZA-Fa-f0-9]');
      expect_equal(convert('[a-c[:digit:]x-z]'), '(?=.)[a-c0-9x-z]');
      expect_equal(convert('[_[:alpha:]][_[:alnum:]][_[:alnum:]]*'), '(?=.)[_a-zA-Z][_a-zA-Z0-9][_a-zA-Z0-9]*', []);
    });
  });

  describe('.isMatch', () => {
    test('should support POSIX.2 character classes', () => {
      expect_truthy(isMatch('e', '[[:xdigit:]]'));

      expect_truthy(isMatch('a', '[[:alpha:]123]'));
      expect_truthy(isMatch('1', '[[:alpha:]123]'));
      expect_truthy(!isMatch('5', '[[:alpha:]123]'));
      expect_truthy(isMatch('A', '[[:alpha:]123]'));

      expect_truthy(isMatch('A', '[[:alpha:]]'));
      expect_truthy(!isMatch('9', '[[:alpha:]]'));
      expect_truthy(isMatch('b', '[[:alpha:]]'));

      expect_truthy(!isMatch('A', '[![:alpha:]]'));
      expect_truthy(isMatch('9', '[![:alpha:]]'));
      expect_truthy(!isMatch('b', '[![:alpha:]]'));

      expect_truthy(!isMatch('A', '[^[:alpha:]]'));
      expect_truthy(isMatch('9', '[^[:alpha:]]'));
      expect_truthy(!isMatch('b', '[^[:alpha:]]'));

      expect_truthy(!isMatch('A', '[[:digit:]]'));
      expect_truthy(isMatch('9', '[[:digit:]]'));
      expect_truthy(!isMatch('b', '[[:digit:]]'));

      expect_truthy(isMatch('A', '[^[:digit:]]'));
      expect_truthy(!isMatch('9', '[^[:digit:]]'));
      expect_truthy(isMatch('b', '[^[:digit:]]'));

      expect_truthy(isMatch('A', '[![:digit:]]'));
      expect_truthy(!isMatch('9', '[![:digit:]]'));
      expect_truthy(isMatch('b', '[![:digit:]]'));

      expect_truthy(isMatch('a', '[[:lower:]]'));
      expect_truthy(!isMatch('A', '[[:lower:]]'));
      expect_truthy(!isMatch('9', '[[:lower:]]'));

      expect_truthy(isMatch('a', '[:alpha:]'), 'invalid posix bracket, but valid char class');
      expect_truthy(isMatch('l', '[:alpha:]'), 'invalid posix bracket, but valid char class');
      expect_truthy(isMatch('p', '[:alpha:]'), 'invalid posix bracket, but valid char class');
      expect_truthy(isMatch('h', '[:alpha:]'), 'invalid posix bracket, but valid char class');
      expect_truthy(isMatch(':', '[:alpha:]'), 'invalid posix bracket, but valid char class');
      expect_truthy(!isMatch('b', '[:alpha:]'), 'invalid posix bracket, but valid char class');
    });

    test('should support multiple posix brackets in one character class', () => {
      expect_truthy(isMatch('9', '[[:lower:][:digit:]]'));
      expect_truthy(isMatch('a', '[[:lower:][:digit:]]'));
      expect_truthy(!isMatch('A', '[[:lower:][:digit:]]'));
      expect_truthy(!isMatch('aa', '[[:lower:][:digit:]]'));
      expect_truthy(!isMatch('99', '[[:lower:][:digit:]]'));
      expect_truthy(!isMatch('a9', '[[:lower:][:digit:]]'));
      expect_truthy(!isMatch('9a', '[[:lower:][:digit:]]'));
      expect_truthy(!isMatch('aA', '[[:lower:][:digit:]]'));
      expect_truthy(!isMatch('9A', '[[:lower:][:digit:]]'));
      expect_truthy(isMatch('aa', '[[:lower:][:digit:]]+'));
      expect_truthy(isMatch('99', '[[:lower:][:digit:]]+'));
      expect_truthy(isMatch('a9', '[[:lower:][:digit:]]+'));
      expect_truthy(isMatch('9a', '[[:lower:][:digit:]]+'));
      expect_truthy(!isMatch('aA', '[[:lower:][:digit:]]+'));
      expect_truthy(!isMatch('9A', '[[:lower:][:digit:]]+'));
      expect_truthy(isMatch('a', '[[:lower:][:digit:]]*'));
      expect_truthy(!isMatch('A', '[[:lower:][:digit:]]*'));
      expect_truthy(!isMatch('AA', '[[:lower:][:digit:]]*'));
      expect_truthy(isMatch('aa', '[[:lower:][:digit:]]*'));
      expect_truthy(isMatch('aaa', '[[:lower:][:digit:]]*'));
      expect_truthy(isMatch('999', '[[:lower:][:digit:]]*'));
    });

    test('should match word characters', () => {
      expect_truthy(!isMatch('a c', 'a[[:word:]]+c'));
      expect_truthy(!isMatch('a.c', 'a[[:word:]]+c'));
      expect_truthy(!isMatch('a.xy.zc', 'a[[:word:]]+c'));
      expect_truthy(!isMatch('a.zc', 'a[[:word:]]+c'));
      expect_truthy(!isMatch('abq', 'a[[:word:]]+c'));
      expect_truthy(!isMatch('axy zc', 'a[[:word:]]+c'));
      expect_truthy(!isMatch('axy', 'a[[:word:]]+c'));
      expect_truthy(!isMatch('axy.zc', 'a[[:word:]]+c'));
      expect_truthy(isMatch('a123c', 'a[[:word:]]+c'));
      expect_truthy(isMatch('a1c', 'a[[:word:]]+c'));
      expect_truthy(isMatch('abbbbc', 'a[[:word:]]+c'));
      expect_truthy(isMatch('abbbc', 'a[[:word:]]+c'));
      expect_truthy(isMatch('abbc', 'a[[:word:]]+c'));
      expect_truthy(isMatch('abc', 'a[[:word:]]+c'));

      expect_truthy(!isMatch('a c', 'a[[:word:]]+'));
      expect_truthy(!isMatch('a.c', 'a[[:word:]]+'));
      expect_truthy(!isMatch('a.xy.zc', 'a[[:word:]]+'));
      expect_truthy(!isMatch('a.zc', 'a[[:word:]]+'));
      expect_truthy(!isMatch('axy zc', 'a[[:word:]]+'));
      expect_truthy(!isMatch('axy.zc', 'a[[:word:]]+'));
      expect_truthy(isMatch('a123c', 'a[[:word:]]+'));
      expect_truthy(isMatch('a1c', 'a[[:word:]]+'));
      expect_truthy(isMatch('abbbbc', 'a[[:word:]]+'));
      expect_truthy(isMatch('abbbc', 'a[[:word:]]+'));
      expect_truthy(isMatch('abbc', 'a[[:word:]]+'));
      expect_truthy(isMatch('abc', 'a[[:word:]]+'));
      expect_truthy(isMatch('abq', 'a[[:word:]]+'));
      expect_truthy(isMatch('axy', 'a[[:word:]]+'));
      expect_truthy(isMatch('axyzc', 'a[[:word:]]+'));
      expect_truthy(isMatch('axyzc', 'a[[:word:]]+'));
    });

    test('should not create an invalid posix character class:', () => {
      expect_equal(convert('[:al:]'), '(?:\\[:al:\\]|[:al:])');
      expect_equal(convert('[abc[:punct:][0-9]'), '(?=.)[abc\\-!"#$%&\'()\\*+,./:;<=>?@[\\]^_`{|}~\\[0-9]');
    });

    test('should return `true` when the pattern matches:', () => {
      expect_truthy(isMatch('a', '[[:lower:]]'));
      expect_truthy(isMatch('A', '[[:upper:]]'));
      expect_truthy(isMatch('A', '[[:digit:][:upper:][:space:]]'));
      expect_truthy(isMatch('1', '[[:digit:][:upper:][:space:]]'));
      expect_truthy(isMatch(' ', '[[:digit:][:upper:][:space:]]'));
      expect_truthy(isMatch('5', '[[:xdigit:]]'));
      expect_truthy(isMatch('f', '[[:xdigit:]]'));
      expect_truthy(isMatch('D', '[[:xdigit:]]'));
      expect_truthy(isMatch('_', '[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:graph:][:lower:][:print:][:punct:][:space:][:upper:][:xdigit:]]'));
      expect_truthy(isMatch('_', '[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:graph:][:lower:][:print:][:punct:][:space:][:upper:][:xdigit:]]'));
      expect_truthy(isMatch('.', '[^[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:lower:][:space:][:upper:][:xdigit:]]'));
      expect_truthy(isMatch('5', '[a-c[:digit:]x-z]'));
      expect_truthy(isMatch('b', '[a-c[:digit:]x-z]'));
      expect_truthy(isMatch('y', '[a-c[:digit:]x-z]'));
    });

    test('should return `false` when the pattern does not match:', () => {
      expect_truthy(!isMatch('A', '[[:lower:]]'));
      expect_truthy(isMatch('A', '[![:lower:]]'));
      expect_truthy(!isMatch('a', '[[:upper:]]'));
      expect_truthy(!isMatch('a', '[[:digit:][:upper:][:space:]]'));
      expect_truthy(!isMatch('.', '[[:digit:][:upper:][:space:]]'));
      expect_truthy(!isMatch('.', '[[:alnum:][:alpha:][:blank:][:cntrl:][:digit:][:lower:][:space:][:upper:][:xdigit:]]'));
      expect_truthy(!isMatch('q', '[a-c[:digit:]x-z]'));
    });
  });

  describe('literals', () => {
    test('should match literal brackets when escaped', () => {
      expect_truthy(isMatch('a [b]', 'a [b]'));
      expect_truthy(isMatch('a b', 'a [b]'));

      expect_truthy(isMatch('a [b] c', 'a [b] c'));
      expect_truthy(isMatch('a b c', 'a [b] c'));

      expect_truthy(isMatch('a [b]', 'a \\[b\\]'));
      expect_truthy(!isMatch('a b', 'a \\[b\\]'));

      expect_truthy(isMatch('a [b]', 'a ([b])'));
      expect_truthy(isMatch('a b', 'a ([b])'));

      expect_truthy(isMatch('a b', 'a (\\[b\\]|[b])'));
      expect_truthy(isMatch('a [b]', 'a (\\[b\\]|[b])'));
    });
  });

  describe('.makeRe()', () => {
    test('should make a regular expression for the given pattern:', () => {
      expect_deepEqual(makeRe('[[:alpha:]123]', opts), /^(?:(?=.)[a-zA-Z123])$/);
      expect_deepEqual(makeRe('[![:lower:]]', opts), /^(?:(?=.)[^a-z])$/);
    });
  });

  describe('POSIX: From the test suite for the POSIX.2 (BRE) pattern matching code:', () => {
    test('First, test POSIX.2 character classes', () => {
      expect_truthy(isMatch('e', '[[:xdigit:]]'));
      expect_truthy(isMatch('1', '[[:xdigit:]]'));
      expect_truthy(isMatch('a', '[[:alpha:]123]'));
      expect_truthy(isMatch('1', '[[:alpha:]123]'));
    });

    test('should match using POSIX.2 negation patterns', () => {
      expect_truthy(isMatch('9', '[![:alpha:]]'));
      expect_truthy(isMatch('9', '[^[:alpha:]]'));
    });

    test('should match word characters', () => {
      expect_truthy(isMatch('A', '[[:word:]]'));
      expect_truthy(isMatch('B', '[[:word:]]'));
      expect_truthy(isMatch('a', '[[:word:]]'));
      expect_truthy(isMatch('b', '[[:word:]]'));
    });

    test('should match digits with word class', () => {
      expect_truthy(isMatch('1', '[[:word:]]'));
      expect_truthy(isMatch('2', '[[:word:]]'));
    });

    test('should not digits', () => {
      expect_truthy(isMatch('1', '[[:digit:]]'));
      expect_truthy(isMatch('2', '[[:digit:]]'));
    });

    test('should not match word characters with digit class', () => {
      expect_truthy(!isMatch('a', '[[:digit:]]'));
      expect_truthy(!isMatch('A', '[[:digit:]]'));
    });

    test('should match uppercase alpha characters', () => {
      expect_truthy(isMatch('A', '[[:upper:]]'));
      expect_truthy(isMatch('B', '[[:upper:]]'));
    });

    test('should not match lowercase alpha characters', () => {
      expect_truthy(!isMatch('a', '[[:upper:]]'));
      expect_truthy(!isMatch('b', '[[:upper:]]'));
    });

    test('should not match digits with upper class', () => {
      expect_truthy(!isMatch('1', '[[:upper:]]'));
      expect_truthy(!isMatch('2', '[[:upper:]]'));
    });

    test('should match lowercase alpha characters', () => {
      expect_truthy(isMatch('a', '[[:lower:]]'));
      expect_truthy(isMatch('b', '[[:lower:]]'));
    });

    test('should not match uppercase alpha characters', () => {
      expect_truthy(!isMatch('A', '[[:lower:]]'));
      expect_truthy(!isMatch('B', '[[:lower:]]'));
    });

    test('should match one lower and one upper character', () => {
      expect_truthy(isMatch('aA', '[[:lower:]][[:upper:]]'));
      expect_truthy(!isMatch('AA', '[[:lower:]][[:upper:]]'));
      expect_truthy(!isMatch('Aa', '[[:lower:]][[:upper:]]'));
    });

    test('should match hexadecimal digits', () => {
      expect_truthy(isMatch('ababab', '[[:xdigit:]]*'));
      expect_truthy(isMatch('020202', '[[:xdigit:]]*'));
      expect_truthy(isMatch('900', '[[:xdigit:]]*'));
    });

    test('should match punctuation characters (\\-!"#$%&\'()\\*+,./:;<=>?@[\\]^_`{|}~)', () => {
      expect_truthy(isMatch('!', '[[:punct:]]'));
      expect_truthy(isMatch('?', '[[:punct:]]'));
      expect_truthy(isMatch('#', '[[:punct:]]'));
      expect_truthy(isMatch('&', '[[:punct:]]'));
      expect_truthy(isMatch('@', '[[:punct:]]'));
      expect_truthy(isMatch('+', '[[:punct:]]'));
      expect_truthy(isMatch('*', '[[:punct:]]'));
      expect_truthy(isMatch(':', '[[:punct:]]'));
      expect_truthy(isMatch('=', '[[:punct:]]'));
      expect_truthy(isMatch('|', '[[:punct:]]'));
      expect_truthy(isMatch('|++', '[[:punct:]]*'));
    });

    test('should only match one character', () => {
      expect_truthy(!isMatch('?*+', '[[:punct:]]'));
    });

    test('should only match zero or more punctuation characters', () => {
      expect_truthy(isMatch('?*+', '[[:punct:]]*'));
      expect_truthy(isMatch('foo', 'foo[[:punct:]]*'));
      expect_truthy(isMatch('foo?*+', 'foo[[:punct:]]*'));
    });

    test('invalid character class expressions are just characters to be matched', () => {
      expect_truthy(isMatch('a', '[:al:]'));
      expect_truthy(isMatch('a', '[[:al:]'));
      expect_truthy(isMatch('!', '[abc[:punct:][0-9]'));
    });

    test('should match the start of a valid sh identifier', () => {
      expect_truthy(isMatch('PATH', '[_[:alpha:]]*'));
    });

    test('should match the first two characters of a valid sh identifier', () => {
      expect_truthy(isMatch('PATH', '[_[:alpha:]][_[:alnum:]]*'));
    });

    test('should match multiple posix classses', () => {
      expect_truthy(isMatch('a1B', '[[:alpha:]][[:digit:]][[:upper:]]'));
      expect_truthy(!isMatch('a1b', '[[:alpha:]][[:digit:]][[:upper:]]'));
      expect_truthy(isMatch('.', '[[:digit:][:punct:][:space:]]'));
      expect_truthy(!isMatch('a', '[[:digit:][:punct:][:space:]]'));
      expect_truthy(isMatch('!', '[[:digit:][:punct:][:space:]]'));
      expect_truthy(!isMatch('!', '[[:digit:]][[:punct:]][[:space:]]'));
      expect_truthy(isMatch('1! ', '[[:digit:]][[:punct:]][[:space:]]'));
      expect_truthy(!isMatch('1!  ', '[[:digit:]][[:punct:]][[:space:]]'));
    });

    /**
     * Some of these tests (and their descriptions) were ported directly
     * from the Bash 4.3 unit tests.
     */

    test('how about A?', () => {
      expect_truthy(isMatch('9', '[[:digit:]]'));
      expect_truthy(!isMatch('X', '[[:digit:]]'));
      expect_truthy(isMatch('aB', '[[:lower:]][[:upper:]]'));
      expect_truthy(isMatch('a', '[[:alpha:][:digit:]]'));
      expect_truthy(isMatch('3', '[[:alpha:][:digit:]]'));
      expect_truthy(!isMatch('aa', '[[:alpha:][:digit:]]'));
      expect_truthy(!isMatch('a3', '[[:alpha:][:digit:]]'));
      expect_truthy(!isMatch('a', '[[:alpha:]\\]'));
      expect_truthy(!isMatch('b', '[[:alpha:]\\]'));
    });

    test('OK, what\'s a tab?  is it a blank? a space?', () => {
      expect_truthy(isMatch('\t', '[[:blank:]]'));
      expect_truthy(isMatch('\t', '[[:space:]]'));
      expect_truthy(isMatch(' ', '[[:space:]]'));
    });

    test('let\'s check out characters in the ASCII range', () => {
      expect_truthy(!isMatch('\\377', '[[:ascii:]]'));
      expect_truthy(!isMatch('9', '[1[:alpha:]123]'));
    });

    test('punctuation', () => {
      expect_truthy(!isMatch(' ', '[[:punct:]]'));
    });

    test('graph', () => {
      expect_truthy(isMatch('A', '[[:graph:]]'));
      expect_truthy(!isMatch('\\b', '[[:graph:]]'));
      expect_truthy(!isMatch('\\n', '[[:graph:]]'));
      expect_truthy(!isMatch('\\s', '[[:graph:]]'));
    });
  });
});
