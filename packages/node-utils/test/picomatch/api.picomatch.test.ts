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

const assertTokens = (actual, expected) => {
  const keyValuePairs = actual.map(token => [token.type, token.value]);
  expect_deepEqual(keyValuePairs, expected);
};

describe('picomatch', () => {
  describe('validation', () => {
    test('should throw an error when invalid arguments are given', () => {
      expect_throws(() => isMatch('foo', ''), /Expected pattern to be a non-empty string/);
      expect_throws(() => isMatch('foo', null), /Expected pattern to be a non-empty string/);
    });
  });

  describe('multiple patterns', () => {
    test('should return true when any of the patterns match', () => {
      expect_truthy(isMatch('.', ['.', 'foo']));
      expect_truthy(isMatch('a', ['a', 'foo']));
      expect_truthy(isMatch('ab', ['*', 'foo', 'bar']));
      expect_truthy(isMatch('ab', ['*b', 'foo', 'bar']));
      expect_truthy(isMatch('ab', ['./*', 'foo', 'bar']));
      expect_truthy(isMatch('ab', ['a*', 'foo', 'bar']));
      expect_truthy(isMatch('ab', ['ab', 'foo']));
    });

    test('should return false when none of the patterns match', () => {
      expect_truthy(!isMatch('/ab', ['/a', 'foo']));
      expect_truthy(!isMatch('/ab', ['?/?', 'foo', 'bar']));
      expect_truthy(!isMatch('/ab', ['a/*', 'foo', 'bar']));
      expect_truthy(!isMatch('a/b/c', ['a/b', 'foo']));
      expect_truthy(!isMatch('ab', ['*/*', 'foo', 'bar']));
      expect_truthy(!isMatch('ab', ['/a', 'foo', 'bar']));
      expect_truthy(!isMatch('ab', ['a', 'foo']));
      expect_truthy(!isMatch('ab', ['b', 'foo']));
      expect_truthy(!isMatch('ab', ['c', 'foo', 'bar']));
      expect_truthy(!isMatch('abcd', ['ab', 'foo']));
      expect_truthy(!isMatch('abcd', ['bc', 'foo']));
      expect_truthy(!isMatch('abcd', ['c', 'foo']));
      expect_truthy(!isMatch('abcd', ['cd', 'foo']));
      expect_truthy(!isMatch('abcd', ['d', 'foo']));
      expect_truthy(!isMatch('abcd', ['f', 'foo', 'bar']));
      expect_truthy(!isMatch('ef', ['/*', 'foo', 'bar']));
    });
  });

  describe('file extensions', () => {
    test('should match files that contain the given extension:', () => {
      expect_truthy(!isMatch('.c.md', '*.md'));
      expect_truthy(!isMatch('.c.md', '.c.'));
      expect_truthy(!isMatch('.c.md', '.md'));
      expect_truthy(!isMatch('.md', '*.md'));
      expect_truthy(!isMatch('.md', '.m'));
      expect_truthy(!isMatch('a/b/c.md', '*.md'));
      expect_truthy(!isMatch('a/b/c.md', '.md'));
      expect_truthy(!isMatch('a/b/c.md', 'a/*.md'));
      expect_truthy(!isMatch('a/b/c/c.md', '*.md'));
      expect_truthy(!isMatch('a/b/c/c.md', 'c.js'));
      expect_truthy(isMatch('.c.md', '.*.md'));
      expect_truthy(isMatch('.md', '.md'));
      expect_truthy(isMatch('a/b/c.js', 'a/**/*.*'));
      expect_truthy(isMatch('a/b/c.md', '**/*.md'));
      expect_truthy(isMatch('a/b/c.md', 'a/*/*.md'));
      expect_truthy(isMatch('c.md', '*.md'));
    });
  });

  describe('dot files', () => {
    test('should not match dotfiles when a leading dot is not defined in a path segment', () => {
      expect_truthy(!isMatch('.a', '(a)*'));
      expect_truthy(!isMatch('.a', '*(a|b)'));
      expect_truthy(!isMatch('.a', '*.md'));
      expect_truthy(!isMatch('.a', '*[a]'));
      expect_truthy(!isMatch('.a', '*[a]*'));
      expect_truthy(!isMatch('.a', '*a'));
      expect_truthy(!isMatch('.a', '*a*'));
      expect_truthy(!isMatch('.a.md', 'a/b/c/*.md'));
      expect_truthy(!isMatch('.ab', '*.*'));
      expect_truthy(!isMatch('.abc', '.a'));
      expect_truthy(!isMatch('.ba', '.a'));
      expect_truthy(!isMatch('.c.md', '*.md'));
      expect_truthy(!isMatch('.md', 'a/b/c/*.md'));
      expect_truthy(!isMatch('.txt', '.md'));
      expect_truthy(!isMatch('.verb.txt', '*.md'));
      expect_truthy(!isMatch('a/.c.md', '*.md'));
      expect_truthy(!isMatch('a/b/d/.md', 'a/b/c/*.md'));
      expect_truthy(isMatch('.a', '.a'));
      expect_truthy(isMatch('.ab', '.*'));
      expect_truthy(isMatch('.ab', '.a*'));
      expect_truthy(isMatch('.b', '.b*'));
      expect_truthy(isMatch('.md', '.md'));
      expect_truthy(isMatch('a/.c.md', 'a/.c.md'));
      expect_truthy(isMatch('a/b/c/.xyz.md', 'a/b/c/.*.md'));
      expect_truthy(isMatch('a/b/c/d.a.md', 'a/b/c/*.md'));
    });

    test('should match dotfiles when options.dot is true', () => {
      expect_truthy(!isMatch('a/b/c/.xyz.md', '.*.md', { dot: true }));
      expect_truthy(isMatch('.c.md', '*.md', { dot: true }));
      expect_truthy(isMatch('.c.md', '.*', { dot: true }));
      expect_truthy(isMatch('a/b/c/.xyz.md', '**/*.md', { dot: true }));
      expect_truthy(isMatch('a/b/c/.xyz.md', '**/.*.md', { dot: true }));
      expect_truthy(isMatch('a/b/c/.xyz.md', 'a/b/c/*.md', { dot: true }));
      expect_truthy(isMatch('a/b/c/.xyz.md', 'a/b/c/.*.md', { dot: true }));
    });
  });

  describe('matching:', () => {
    test('should escape plus signs to match string literals', () => {
      expect_truthy(isMatch('a+b/src/glimini.js', 'a+b/src/*.js'));
      expect_truthy(isMatch('+b/src/glimini.js', '+b/src/*.js'));
      expect_truthy(isMatch('coffee+/src/glimini.js', 'coffee+/src/*.js'));
      expect_truthy(isMatch('coffee+/src/glimini.js', 'coffee+/src/*'));
    });

    test('should match with non-glob patterns', () => {
      expect_truthy(isMatch('.', '.'));
      expect_truthy(isMatch('/a', '/a'));
      expect_truthy(!isMatch('/ab', '/a'));
      expect_truthy(isMatch('a', 'a'));
      expect_truthy(!isMatch('ab', '/a'));
      expect_truthy(!isMatch('ab', 'a'));
      expect_truthy(isMatch('ab', 'ab'));
      expect_truthy(!isMatch('abcd', 'cd'));
      expect_truthy(!isMatch('abcd', 'bc'));
      expect_truthy(!isMatch('abcd', 'ab'));
    });

    test('should match file names', () => {
      expect_truthy(isMatch('a.b', 'a.b'));
      expect_truthy(isMatch('a.b', '*.b'));
      expect_truthy(isMatch('a.b', 'a.*'));
      expect_truthy(isMatch('a.b', '*.*'));
      expect_truthy(isMatch('a-b.c-d', 'a*.c*'));
      expect_truthy(isMatch('a-b.c-d', '*b.*d'));
      expect_truthy(isMatch('a-b.c-d', '*.*'));
      expect_truthy(isMatch('a-b.c-d', '*.*-*'));
      expect_truthy(isMatch('a-b.c-d', '*-*.*-*'));
      expect_truthy(isMatch('a-b.c-d', '*.c-*'));
      expect_truthy(isMatch('a-b.c-d', '*.*-d'));
      expect_truthy(isMatch('a-b.c-d', 'a-*.*-d'));
      expect_truthy(isMatch('a-b.c-d', '*-b.c-*'));
      expect_truthy(isMatch('a-b.c-d', '*-b*c-*'));
      expect_truthy(!isMatch('a-b.c-d', '*-bc-*'));
    });

    test('should match with common glob patterns', () => {
      expect_truthy(!isMatch('/ab', './*/'));
      expect_truthy(!isMatch('/ef', '*'));
      expect_truthy(!isMatch('ab', './*/'));
      expect_truthy(!isMatch('ef', '/*'));
      expect_truthy(isMatch('/ab', '/*'));
      expect_truthy(isMatch('/cd', '/*'));
      expect_truthy(isMatch('ab', '*'));
      expect_truthy(isMatch('ab', './*'));
      expect_truthy(isMatch('ab', 'ab'));
      expect_truthy(isMatch('ab/', './*/'));
    });

    test('should match files with the given extension', () => {
      expect_truthy(!isMatch('.md', '*.md'));
      expect_truthy(isMatch('.md', '.md'));
      expect_truthy(!isMatch('.c.md', '*.md'));
      expect_truthy(isMatch('.c.md', '.*.md'));
      expect_truthy(isMatch('c.md', '*.md'));
      expect_truthy(isMatch('c.md', '*.md'));
      expect_truthy(!isMatch('a/b/c/c.md', '*.md'));
      expect_truthy(!isMatch('a/b/c.md', 'a/*.md'));
      expect_truthy(isMatch('a/b/c.md', 'a/*/*.md'));
      expect_truthy(isMatch('a/b/c.md', '**/*.md'));
      expect_truthy(isMatch('a/b/c.js', 'a/**/*.*'));
    });

    test('should match wildcards', () => {
      expect_truthy(!isMatch('a/b/c/z.js', '*.js'));
      expect_truthy(!isMatch('a/b/z.js', '*.js'));
      expect_truthy(!isMatch('a/z.js', '*.js'));
      expect_truthy(isMatch('z.js', '*.js'));

      expect_truthy(isMatch('z.js', 'z*.js'));
      expect_truthy(isMatch('a/z.js', 'a/z*.js'));
      expect_truthy(isMatch('a/z.js', '*/z*.js'));
    });

    test('should match globstars', () => {
      expect_truthy(isMatch('a/b/c/z.js', '**/*.js'));
      expect_truthy(isMatch('a/b/z.js', '**/*.js'));
      expect_truthy(isMatch('a/z.js', '**/*.js'));
      expect_truthy(isMatch('a/b/c/d/e/z.js', 'a/b/**/*.js'));
      expect_truthy(isMatch('a/b/c/d/z.js', 'a/b/**/*.js'));
      expect_truthy(isMatch('a/b/c/z.js', 'a/b/c/**/*.js'));
      expect_truthy(isMatch('a/b/c/z.js', 'a/b/c**/*.js'));
      expect_truthy(isMatch('a/b/c/z.js', 'a/b/**/*.js'));
      expect_truthy(isMatch('a/b/z.js', 'a/b/**/*.js'));

      expect_truthy(!isMatch('a/z.js', 'a/b/**/*.js'));
      expect_truthy(!isMatch('z.js', 'a/b/**/*.js'));

      // https://github.com/micromatch/micromatch/issues/15
      expect_truthy(isMatch('z.js', 'z*'));
      expect_truthy(isMatch('z.js', '**/z*'));
      expect_truthy(isMatch('z.js', '**/z*.js'));
      expect_truthy(isMatch('z.js', '**/*.js'));
      expect_truthy(isMatch('foo', '**/foo'));
    });

    test('issue #23', () => {
      expect_truthy(!isMatch('zzjs', 'z*.js'));
      expect_truthy(!isMatch('zzjs', '*z.js'));
    });

    test('issue #24 - should match zero or more directories', () => {
      expect_truthy(!isMatch('a/b/c/d/', 'a/b/**/f'));
      expect_truthy(isMatch('a', 'a/**'));
      expect_truthy(isMatch('a', '**'));
      expect_truthy(isMatch('a/', '**'));
      expect_truthy(isMatch('a/b-c/d/e/z.js', 'a/b-*/**/z.js'));
      expect_truthy(isMatch('a/b-c/z.js', 'a/b-*/**/z.js'));
      expect_truthy(isMatch('a/b/c/d', '**'));
      expect_truthy(isMatch('a/b/c/d/', '**'));
      expect_truthy(isMatch('a/b/c/d/', '**/**'));
      expect_truthy(isMatch('a/b/c/d/', '**/b/**'));
      expect_truthy(isMatch('a/b/c/d/', 'a/b/**'));
      expect_truthy(isMatch('a/b/c/d/', 'a/b/**/'));
      expect_truthy(isMatch('a/b/c/d/', 'a/b/**/c/**/'));
      expect_truthy(isMatch('a/b/c/d/', 'a/b/**/c/**/d/'));
      expect_truthy(isMatch('a/b/c/d/e.f', 'a/b/**/**/*.*'));
      expect_truthy(isMatch('a/b/c/d/e.f', 'a/b/**/*.*'));
      expect_truthy(isMatch('a/b/c/d/e.f', 'a/b/**/c/**/d/*.*'));
      expect_truthy(isMatch('a/b/c/d/e.f', 'a/b/**/d/**/*.*'));
      expect_truthy(isMatch('a/b/c/d/g/e.f', 'a/b/**/d/**/*.*'));
      expect_truthy(isMatch('a/b/c/d/g/g/e.f', 'a/b/**/d/**/*.*'));
    });

    test('should match slashes', () => {
      expect_truthy(!isMatch('bar/baz/foo', '*/foo'));
      expect_truthy(!isMatch('deep/foo/bar', '**/bar/*'));
      expect_truthy(!isMatch('deep/foo/bar/baz/x', '*/bar/**'));
      expect_truthy(!isMatch('foo/bar', 'foo?bar'));
      expect_truthy(!isMatch('foo/bar/baz', '**/bar*'));
      expect_truthy(!isMatch('foo/bar/baz', '**/bar**'));
      expect_truthy(!isMatch('foo/baz/bar', 'foo**bar'));
      expect_truthy(!isMatch('foo/baz/bar', 'foo*bar'));
      expect_truthy(!isMatch('deep/foo/bar/baz', '**/bar/*/'));
      expect_truthy(!isMatch('deep/foo/bar/baz/', '**/bar/*', { strictSlashes: true }));
      expect_truthy(isMatch('deep/foo/bar/baz/', '**/bar/*'));
      expect_truthy(isMatch('deep/foo/bar/baz', '**/bar/*'));
      expect_truthy(isMatch('foo', 'foo/**'));
      expect_truthy(isMatch('deep/foo/bar/baz/', '**/bar/*{,/}'));
      expect_truthy(isMatch('a/b/j/c/z/x.md', 'a/**/j/**/z/*.md'));
      expect_truthy(isMatch('a/j/z/x.md', 'a/**/j/**/z/*.md'));
      expect_truthy(isMatch('bar/baz/foo', '**/foo'));
      expect_truthy(isMatch('deep/foo/bar/', '**/bar/**'));
      expect_truthy(isMatch('deep/foo/bar/baz', '**/bar/*'));
      expect_truthy(isMatch('deep/foo/bar/baz/', '**/bar/*/'));
      expect_truthy(isMatch('deep/foo/bar/baz/', '**/bar/**'));
      expect_truthy(isMatch('deep/foo/bar/baz/x', '**/bar/*/*'));
      expect_truthy(isMatch('foo/b/a/z/bar', 'foo/**/**/bar'));
      expect_truthy(isMatch('foo/b/a/z/bar', 'foo/**/bar'));
      expect_truthy(isMatch('foo/bar', 'foo/**/**/bar'));
      expect_truthy(isMatch('foo/bar', 'foo/**/bar'));
      expect_truthy(isMatch('foo/bar', 'foo[/]bar'));
      expect_truthy(isMatch('foo/bar/baz/x', '*/bar/**'));
      expect_truthy(isMatch('foo/baz/bar', 'foo/**/**/bar'));
      expect_truthy(isMatch('foo/baz/bar', 'foo/**/bar'));
      expect_truthy(isMatch('foobazbar', 'foo**bar'));
      expect_truthy(isMatch('XXX/foo', '**/foo'));

      // https://github.com/micromatch/micromatch/issues/89
      expect_truthy(isMatch('foo//baz.md', 'foo//baz.md'));
      expect_truthy(isMatch('foo//baz.md', 'foo//*baz.md'));
      expect_truthy(isMatch('foo//baz.md', 'foo{/,//}baz.md'));
      expect_truthy(isMatch('foo/baz.md', 'foo{/,//}baz.md'));
      expect_truthy(!isMatch('foo//baz.md', 'foo/+baz.md'));
      expect_truthy(!isMatch('foo//baz.md', 'foo//+baz.md'));
      expect_truthy(!isMatch('foo//baz.md', 'foo/baz.md'));
      expect_truthy(!isMatch('foo/baz.md', 'foo//baz.md'));
    });

    test('question marks should not match slashes', () => {
      expect_truthy(!isMatch('aaa/bbb', 'aaa?bbb'));
    });

    test('should not match dotfiles when `dot` or `dotfiles` are not set', () => {
      expect_truthy(!isMatch('.c.md', '*.md'));
      expect_truthy(!isMatch('a/.c.md', '*.md'));
      expect_truthy(isMatch('a/.c.md', 'a/.c.md'));
      expect_truthy(!isMatch('.a', '*.md'));
      expect_truthy(!isMatch('.verb.txt', '*.md'));
      expect_truthy(isMatch('a/b/c/.xyz.md', 'a/b/c/.*.md'));
      expect_truthy(isMatch('.md', '.md'));
      expect_truthy(!isMatch('.txt', '.md'));
      expect_truthy(isMatch('.md', '.md'));
      expect_truthy(isMatch('.a', '.a'));
      expect_truthy(isMatch('.b', '.b*'));
      expect_truthy(isMatch('.ab', '.a*'));
      expect_truthy(isMatch('.ab', '.*'));
      expect_truthy(!isMatch('.ab', '*.*'));
      expect_truthy(!isMatch('.md', 'a/b/c/*.md'));
      expect_truthy(!isMatch('.a.md', 'a/b/c/*.md'));
      expect_truthy(isMatch('a/b/c/d.a.md', 'a/b/c/*.md'));
      expect_truthy(!isMatch('a/b/d/.md', 'a/b/c/*.md'));
    });

    test('should match dotfiles when `dot` or `dotfiles` is set', () => {
      expect_truthy(isMatch('.c.md', '*.md', { dot: true }));
      expect_truthy(isMatch('.c.md', '.*', { dot: true }));
      expect_truthy(isMatch('a/b/c/.xyz.md', 'a/b/c/*.md', { dot: true }));
      expect_truthy(isMatch('a/b/c/.xyz.md', 'a/b/c/.*.md', { dot: true }));
    });
  });

  describe('.parse', () => {
    describe('tokens', () => {
      test('should return result for pattern that matched by fastpath', () => {
        const { tokens } = picomatch.parse('a*.txt');

        const expected = [
          ['bos', ''],
          ['text', 'a'],
          ['star', '*'],
          ['text', '.txt']
        ];

        assertTokens(tokens, expected);
      });

      test('should return result for pattern', () => {
        const { tokens } = picomatch.parse('{a,b}*');

        const expected = [
          ['bos', ''],
          ['brace', '{'],
          ['text', 'a'],
          ['comma', ','],
          ['text', 'b'],
          ['brace', '}'],
          ['star', '*'],
          ['maybe_slash', '']
        ];

        assertTokens(tokens, expected);
      });

      test('pictomatch issue#125, issue#100', () => {
        const { tokens } = picomatch.parse('foo.(m|c|)js');

        const expected = [
          ['bos', { output: '', value: '' }],
          ['text', { output: 'foo.', value: 'foo.' }],
          ['paren', { output: undefined, value: '(' }],
          ['text', { output: 'm|c|', value: 'm|c|' }],
          ['paren', { output: ')', value: ')' }],
          ['text', { output: undefined, value: 'js' }]
        ];

        const keyValuePairs = tokens.map(token => [token.type, { output: token.output, value: token.value }]);
        expect_deepEqual(keyValuePairs, expected);
      });
    });
  });

  describe('state', () => {
    describe('negatedExtglob', () => {
      test('should return true', () => {
        expect_truthy(picomatch('!(abc)', {}, true).state.negatedExtglob);
        expect_truthy(picomatch('!(abc)**', {}, true).state.negatedExtglob);
        expect_truthy(picomatch('!(abc)/**', {}, true).state.negatedExtglob);
      });

      test('should return false', () => {
        expect_truthy(!picomatch('(!(abc))', {}, true).state.negatedExtglob);
        expect_truthy(!picomatch('**!(abc)', {}, true).state.negatedExtglob);
      });
    });
  });
});
