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

describe('dotfiles', () => {
  describe('normal', () => {
    test('should not match dotfiles by default:', () => {
      expect_deepEqual(match(['.dotfile'], '*'), []);
      expect_deepEqual(match(['.dotfile'], '**'), []);
      expect_deepEqual(match(['a/b/c/.dotfile.md'], '*.md'), []);
      expect_deepEqual(match(['a/b', 'a/.b', '.a/b', '.a/.b'], '**'), ['a/b']);
      expect_deepEqual(match(['a/b/c/.dotfile'], '*.*'), []);
    });
  });

  describe('leading dot', () => {
    test('should match dotfiles when a leading dot is defined in the path:', () => {
      expect_deepEqual(match(['a/b/c/.dotfile.md'], '**/.*'), ['a/b/c/.dotfile.md']);
      expect_deepEqual(match(['a/b/c/.dotfile.md'], '**/.*.md'), ['a/b/c/.dotfile.md']);
    });

    test('should use negation patterns on dotfiles:', () => {
      expect_deepEqual(match(['.a', '.b', 'c', 'c.md'], '!.*'), ['c', 'c.md']);
      expect_deepEqual(match(['.a', '.b', 'c', 'c.md'], '!.b'), ['.a', 'c', 'c.md']);
    });

    test('should match dotfiles when there is a leading dot:', () => {
      const opts = { dot: true };
      expect_deepEqual(match(['.dotfile'], '*', opts), ['.dotfile']);
      expect_deepEqual(match(['.dotfile'], '**', opts), ['.dotfile']);
      expect_deepEqual(match(['a/b', 'a/.b', '.a/b', '.a/.b'], '**', opts), ['a/b', 'a/.b', '.a/b', '.a/.b']);
      expect_deepEqual(match(['a/b', 'a/.b', 'a/.b', '.a/.b'], 'a/{.*,**}', opts), ['a/b', 'a/.b']);
      expect_deepEqual(match(['a/b', 'a/.b', 'a/.b', '.a/.b'], '{.*,**}', {}), ['a/b']);
      expect_deepEqual(match(['a/b', 'a/.b', 'a/.b', '.a/.b'], '{.*,**}', opts), ['a/b', 'a/.b', '.a/.b']);
      expect_deepEqual(match(['.dotfile'], '.dotfile', opts), ['.dotfile']);
      expect_deepEqual(match(['.dotfile.md'], '.*.md', opts), ['.dotfile.md']);
    });

    test('should match dotfiles when there is not a leading dot:', () => {
      const opts = { dot: true };
      expect_deepEqual(match(['.dotfile'], '*.*', opts), ['.dotfile']);
      expect_deepEqual(match(['.a', '.b', 'c', 'c.md'], '*.*', opts), ['.a', '.b', 'c.md']);
      expect_deepEqual(match(['.dotfile'], '*.md', opts), []);
      expect_deepEqual(match(['.verb.txt'], '*.md', opts), []);
      expect_deepEqual(match(['a/b/c/.dotfile'], '*.md', opts), []);
      expect_deepEqual(match(['a/b/c/.dotfile.md'], '*.md', opts), []);
      expect_deepEqual(match(['a/b/c/.verb.md'], '**/*.md', opts), ['a/b/c/.verb.md']);
      expect_deepEqual(match(['foo.md'], '*.md', opts), ['foo.md']);
    });

    test('should use negation patterns on dotfiles:', () => {
      expect_deepEqual(match(['.a', '.b', 'c', 'c.md'], '!.*'), ['c', 'c.md']);
      expect_deepEqual(match(['.a', '.b', 'c', 'c.md'], '!(.*)'), ['c', 'c.md']);
      expect_deepEqual(match(['.a', '.b', 'c', 'c.md'], '!(.*)*'), ['c', 'c.md']);
      expect_deepEqual(match(['.a', '.b', 'c', 'c.md'], '!*.*'), ['.a', '.b', 'c']);
    });
  });

  describe('options.dot', () => {
    test('should match dotfiles when `options.dot` is true:', () => {
      const fixtures = ['a/./b', 'a/../b', 'a/c/b', 'a/.d/b'];
      expect_deepEqual(match(['.dotfile'], '*.*', { dot: true }), ['.dotfile']);
      expect_deepEqual(match(['.dotfile'], '*.md', { dot: true }), []);
      expect_deepEqual(match(['.dotfile'], '.dotfile', { dot: true }), ['.dotfile']);
      expect_deepEqual(match(['.dotfile.md'], '.*.md', { dot: true }), ['.dotfile.md']);
      expect_deepEqual(match(['.verb.txt'], '*.md', { dot: true }), []);
      expect_deepEqual(match(['.verb.txt'], '*.md', { dot: true }), []);
      expect_deepEqual(match(['a/b/c/.dotfile'], '*.md', { dot: true }), []);
      expect_deepEqual(match(['a/b/c/.dotfile.md'], '**/*.md', { dot: true }), ['a/b/c/.dotfile.md']);
      expect_deepEqual(match(['a/b/c/.dotfile.md'], '**/.*', { dot: false }), ['a/b/c/.dotfile.md']);
      expect_deepEqual(match(['a/b/c/.dotfile.md'], '**/.*.md', { dot: false }), ['a/b/c/.dotfile.md']);
      expect_deepEqual(match(['a/b/c/.dotfile.md'], '*.md', { dot: false }), []);
      expect_deepEqual(match(['a/b/c/.dotfile.md'], '*.md', { dot: true }), []);
      expect_deepEqual(match(['a/b/c/.verb.md'], '**/*.md', { dot: true }), ['a/b/c/.verb.md']);
      expect_deepEqual(match(['d.md'], '*.md', { dot: true }), ['d.md']);
      expect_deepEqual(match(fixtures, 'a/*/b', { dot: true }), ['a/c/b', 'a/.d/b']);
      expect_deepEqual(match(fixtures, 'a/.*/b'), ['a/.d/b']);
      expect_deepEqual(match(fixtures, 'a/.*/b', { dot: true }), ['a/.d/b']);
    });

    test('should match dotfiles when `options.dot` is true', () => {
      expect_truthy(isMatch('.dot', '**/*dot', { dot: true }));
      expect_truthy(isMatch('.dot', '*dot', { dot: true }));
      expect_truthy(isMatch('.dot', '?dot', { dot: true }));
      expect_truthy(isMatch('.dotfile.js', '.*.js', { dot: true }));
      expect_truthy(isMatch('/a/b/.dot', '/**/*dot', { dot: true }));
      expect_truthy(isMatch('/a/b/.dot', '**/*dot', { dot: true }));
      expect_truthy(isMatch('/a/b/.dot', '**/.[d]ot', { dot: true }));
      expect_truthy(isMatch('/a/b/.dot', '**/?dot', { dot: true }));
      expect_truthy(isMatch('/a/b/.dot', '/**/.[d]ot', { dot: true }));
      expect_truthy(isMatch('/a/b/.dot', '/**/?dot', { dot: true }));
      expect_truthy(isMatch('a/b/.dot', '**/*dot', { dot: true }));
      expect_truthy(isMatch('a/b/.dot', '**/.[d]ot', { dot: true }));
      expect_truthy(isMatch('a/b/.dot', '**/?dot', { dot: true }));
    });

    test('should not match dotfiles when `options.dot` is false', () => {
      expect_truthy(!isMatch('a/b/.dot', '**/*dot', { dot: false }));
      expect_truthy(!isMatch('a/b/.dot', '**/?dot', { dot: false }));
    });

    test('should not match dotfiles when `.dot` is not defined and a dot is not in the glob pattern', () => {
      expect_truthy(!isMatch('a/b/.dot', '**/*dot'));
      expect_truthy(!isMatch('a/b/.dot', '**/?dot'));
    });
  });

  describe('valid dotfiles', () => {
    test('micromatch issue#63 (dots)', () => {
      expect_truthy(!isMatch('/aaa/.git/foo', '/aaa/**/*'));
      expect_truthy(!isMatch('/aaa/bbb/.git', '/aaa/bbb/*'));
      expect_truthy(!isMatch('/aaa/bbb/.git', '/aaa/bbb/**'));
      expect_truthy(!isMatch('/aaa/bbb/ccc/.git', '/aaa/bbb/**'));
      expect_truthy(!isMatch('aaa/bbb/.git', 'aaa/bbb/**'));
      expect_truthy(isMatch('/aaa/bbb/', '/aaa/bbb/**'));
      expect_truthy(isMatch('/aaa/bbb/foo', '/aaa/bbb/**'));

      expect_truthy(isMatch('/aaa/.git/foo', '/aaa/**/*', { dot: true }));
      expect_truthy(isMatch('/aaa/bbb/.git', '/aaa/bbb/*', { dot: true }));
      expect_truthy(isMatch('/aaa/bbb/.git', '/aaa/bbb/**', { dot: true }));
      expect_truthy(isMatch('/aaa/bbb/ccc/.git', '/aaa/bbb/**', { dot: true }));
      expect_truthy(isMatch('aaa/bbb/.git', 'aaa/bbb/**', { dot: true }));
    });

    test('should not match dotfiles with single stars by default', () => {
      expect_truthy(isMatch('foo', '*'));
      expect_truthy(isMatch('foo/bar', '*/*'));
      expect_truthy(!isMatch('.foo', '*'));
      expect_truthy(!isMatch('.foo/bar', '*/*'));
      expect_truthy(!isMatch('.foo/.bar', '*/*'));
      expect_truthy(!isMatch('foo/.bar', '*/*'));
      expect_truthy(!isMatch('foo/.bar/baz', '*/*/*'));
    });

    test('should work with dots in the path', () => {
      expect_truthy(isMatch('../test.js', '../*.js'));
      expect_truthy(isMatch('../.test.js', '../*.js', { dot: true }));
      expect_truthy(!isMatch('../.test.js', '../*.js'));
    });

    test('should not match dotfiles with globstar by default', () => {
      expect_truthy(!isMatch('.foo', '**/**'));
      expect_truthy(!isMatch('.foo', '**'));
      expect_truthy(!isMatch('.foo', '**/*'));
      expect_truthy(!isMatch('bar/.foo', '**/*'));
      expect_truthy(!isMatch('.bar', '**/*'));
      expect_truthy(!isMatch('foo/.bar', '**/*'));
      expect_truthy(!isMatch('foo/.bar', '**/*a*'));
    });

    test('should match dotfiles when a leading dot is in the pattern', () => {
      expect_truthy(!isMatch('foo', '**/.*a*'));
      expect_truthy(isMatch('.bar', '**/.*a*'));
      expect_truthy(isMatch('foo/.bar', '**/.*a*'));
      expect_truthy(isMatch('.foo', '**/.*'));

      expect_truthy(!isMatch('foo', '.*a*'));
      expect_truthy(isMatch('.bar', '.*a*'));
      expect_truthy(!isMatch('bar', '.*a*'));

      expect_truthy(!isMatch('foo', '.b*'));
      expect_truthy(isMatch('.bar', '.b*'));
      expect_truthy(!isMatch('bar', '.b*'));

      expect_truthy(!isMatch('foo', '.*r'));
      expect_truthy(isMatch('.bar', '.*r'));
      expect_truthy(!isMatch('bar', '.*r'));
    });

    test('should not match a dot when the dot is not explicitly defined', () => {
      expect_truthy(!isMatch('.dot', '**/*dot'));
      expect_truthy(!isMatch('.dot', '**/?dot'));
      expect_truthy(!isMatch('.dot', '*/*dot'));
      expect_truthy(!isMatch('.dot', '*/?dot'));
      expect_truthy(!isMatch('.dot', '*dot'));
      expect_truthy(!isMatch('.dot', '/*dot'));
      expect_truthy(!isMatch('.dot', '/?dot'));
      expect_truthy(!isMatch('/.dot', '**/*dot'));
      expect_truthy(!isMatch('/.dot', '**/?dot'));
      expect_truthy(!isMatch('/.dot', '*/*dot'));
      expect_truthy(!isMatch('/.dot', '*/?dot'));
      expect_truthy(!isMatch('/.dot', '/*dot'));
      expect_truthy(!isMatch('/.dot', '/?dot'));
      expect_truthy(!isMatch('abc/.dot', '*/*dot'));
      expect_truthy(!isMatch('abc/.dot', '*/?dot'));
      expect_truthy(!isMatch('abc/.dot', 'abc/*dot'));
      expect_truthy(!isMatch('abc/abc/.dot', '**/*dot'));
      expect_truthy(!isMatch('abc/abc/.dot', '**/?dot'));
    });

    test('should not match leading dots with question marks', () => {
      expect_truthy(!isMatch('.dot', '?dot'));
      expect_truthy(!isMatch('/.dot', '/?dot'));
      expect_truthy(!isMatch('abc/.dot', 'abc/?dot'));
    });

    test('should match double dots when defined in pattern', () => {
      expect_truthy(!isMatch('../../b', '**/../*'));
      expect_truthy(!isMatch('../../b', '*/../*'));
      expect_truthy(!isMatch('../../b', '../*'));
      expect_truthy(!isMatch('../abc', '*/../*'));
      expect_truthy(!isMatch('../abc', '*/../*'));
      expect_truthy(!isMatch('../c/d', '**/../*'));
      expect_truthy(!isMatch('../c/d', '*/../*'));
      expect_truthy(!isMatch('../c/d', '../*'));
      expect_truthy(!isMatch('abc', '**/../*'));
      expect_truthy(!isMatch('abc', '*/../*'));
      expect_truthy(!isMatch('abc', '../*'));
      expect_truthy(!isMatch('abc/../abc', '../*'));
      expect_truthy(!isMatch('abc/../abc', '../*'));
      expect_truthy(!isMatch('abc/../', '**/../*'));

      expect_truthy(isMatch('..', '..'));
      expect_truthy(isMatch('../b', '../*'));
      expect_truthy(isMatch('../../b', '../../*'));
      expect_truthy(isMatch('../../..', '../../..'));
      expect_truthy(isMatch('../abc', '**/../*'));
      expect_truthy(isMatch('../abc', '../*'));
      expect_truthy(isMatch('abc/../abc', '**/../*'));
      expect_truthy(isMatch('abc/../abc', '*/../*'));
      expect_truthy(isMatch('abc/../abc', '**/../*'));
      expect_truthy(isMatch('abc/../abc', '*/../*'));
    });

    test('should not match double dots when not defined in pattern', async () => {
      expect_truthy(!isMatch('../abc', '**/*'));
      expect_truthy(!isMatch('../abc', '**/**/**'));
      expect_truthy(!isMatch('../abc', '**/**/abc'));
      expect_truthy(!isMatch('../abc', '**/**/abc/**'));
      expect_truthy(!isMatch('../abc', '**/*/*'));
      expect_truthy(!isMatch('../abc', '**/abc/**'));
      expect_truthy(!isMatch('../abc', '*/*'));
      expect_truthy(!isMatch('../abc', '*/abc/**'));
      expect_truthy(!isMatch('abc/../abc', '**/*'));
      expect_truthy(!isMatch('abc/../abc', '**/*/*'));
      expect_truthy(!isMatch('abc/../abc', '**/*/abc'));
      expect_truthy(!isMatch('abc/../abc', '*/**/*'));
      expect_truthy(!isMatch('abc/../abc', '*/*/*'));
      expect_truthy(!isMatch('abc/../abc', 'abc/**/*'));
      expect_truthy(!isMatch('abc/../abc', '**/**/*'));
      expect_truthy(!isMatch('abc/../abc', '**/*/*'));
      expect_truthy(!isMatch('abc/../abc', '*/**/*'));
      expect_truthy(!isMatch('abc/../abc', '*/*/*'));

      expect_truthy(!isMatch('../abc', '**/**/**', { dot: true }));
      expect_truthy(!isMatch('../abc', '**/**/abc', { dot: true }));
      expect_truthy(!isMatch('../abc', '**/**/abc/**', { dot: true }));
      expect_truthy(!isMatch('../abc', '**/abc/**', { dot: true }));
      expect_truthy(!isMatch('../abc', '*/abc/**', { dot: true }));

      expect_truthy(!isMatch('../abc', '**/*/*', { dot: true }));
      expect_truthy(!isMatch('../abc', '*/*', { dot: true }));
      expect_truthy(!isMatch('abc/../abc', '**/*/*', { dot: true }));
      expect_truthy(!isMatch('abc/../abc', '*/*/*', { dot: true }));
      expect_truthy(!isMatch('abc/../abc', '**/*/*', { dot: true }));
      expect_truthy(!isMatch('abc/../abc', '*/*/*', { dot: true }));
      expect_truthy(!isMatch('abc/..', '**/*', { dot: true }));
      expect_truthy(!isMatch('abc/..', '*/*', { dot: true }));
      expect_truthy(!isMatch('abc/abc/..', '*/**/*', { dot: true }));

      expect_truthy(!isMatch('abc/../abc', 'abc/**/*'));
      expect_truthy(!isMatch('abc/../abc', 'abc/**/*', { dot: true }));
      expect_truthy(!isMatch('abc/../abc', 'abc/**/*/*', { dot: true }));
      expect_truthy(!isMatch('abc/../abc', 'abc/*/*/*', { dot: true }));
      expect_truthy(!isMatch('abc/../abc', 'abc/**/*/*', { dot: true }));
      expect_truthy(!isMatch('abc/../abc', 'abc/*/*/*', { dot: true }));
      expect_truthy(!isMatch('abc/..', 'abc/**/*', { dot: true }));
      expect_truthy(!isMatch('abc/..', 'abc/*/*', { dot: true }));
      expect_truthy(!isMatch('abc/abc/..', 'abc/*/**/*', { dot: true }));

      expect_truthy(!isMatch('../abc', '**/*/*', { dot: true }));
      expect_truthy(!isMatch('../abc', '*/*', { dot: true }));
      expect_truthy(!isMatch('abc/../abc', '**/*/*', { dot: true }));
      expect_truthy(!isMatch('abc/../abc', '*/*/*', { dot: true }));
      expect_truthy(!isMatch('abc/../abc', '**/*/*', { dot: true }));
      expect_truthy(!isMatch('abc/../abc', '*/*/*', { dot: true }));
      expect_truthy(!isMatch('abc/..', '**/*', { dot: true }));
      expect_truthy(!isMatch('abc/..', '*/*', { dot: true }));
      expect_truthy(!isMatch('abc/abc/..', '*/**/*', { dot: true }));

      expect_truthy(!isMatch('abc/../abc', 'abc/**/*', { strictSlashes: true }));
      expect_truthy(!isMatch('abc/../abc', 'abc/**/*/*', { strictSlashes: true }));
      expect_truthy(!isMatch('abc/../abc', 'abc/**/*/*', { strictSlashes: true }));
      expect_truthy(!isMatch('abc/../abc', 'abc/*/*/*', { strictSlashes: true }));
      expect_truthy(!isMatch('abc/../abc', 'abc/**/*/*', { strictSlashes: true }));
      expect_truthy(!isMatch('abc/../abc', 'abc/*/*/*', { strictSlashes: true }));
      expect_truthy(!isMatch('abc/..', 'abc/**/*', { strictSlashes: true }));
      expect_truthy(!isMatch('abc/..', 'abc/*/*', { strictSlashes: true }));
      expect_truthy(!isMatch('abc/abc/..', 'abc/*/**/*', { strictSlashes: true }));
    });

    test('should not match single exclusive dots when not defined in pattern', async () => {
      expect_truthy(!isMatch('.', '**'));
      expect_truthy(!isMatch('abc/./abc', '**'));
      expect_truthy(!isMatch('abc/abc/.', '**'));
      expect_truthy(!isMatch('abc/abc/./abc', '**'));

      expect_truthy(!isMatch('.', '**', { dot: true }));
      expect_truthy(!isMatch('..', '**', { dot: true }));
      expect_truthy(!isMatch('../', '**', { dot: true }));
      expect_truthy(!isMatch('/../', '**', { dot: true }));
      expect_truthy(!isMatch('/..', '**', { dot: true }));
      expect_truthy(!isMatch('abc/./abc', '**', { dot: true }));
      expect_truthy(!isMatch('abc/abc/.', '**', { dot: true }));
      expect_truthy(!isMatch('abc/abc/./abc', '**', { dot: true }));
    });

    test('should match leading dots in root path when glob is prefixed with **/', () => {
      expect_truthy(!isMatch('.abc/.abc', '**/.abc/**'));
      expect_truthy(isMatch('.abc', '**/.abc/**'));
      expect_truthy(isMatch('.abc/', '**/.abc/**'));
      expect_truthy(isMatch('.abc/abc', '**/.abc/**'));
      expect_truthy(isMatch('.abc/abc/b', '**/.abc/**'));
      expect_truthy(isMatch('abc/.abc/b', '**/.abc/**'));
      expect_truthy(isMatch('abc/abc/.abc', '**/.abc'));
      expect_truthy(isMatch('abc/abc/.abc', '**/.abc/**'));
      expect_truthy(isMatch('abc/abc/.abc/', '**/.abc/**'));
      expect_truthy(isMatch('abc/abc/.abc/abc', '**/.abc/**'));
      expect_truthy(isMatch('abc/abc/.abc/c/d', '**/.abc/**'));
      expect_truthy(isMatch('abc/abc/.abc/c/d/e', '**/.abc/**'));
    });

    test('should match a dot when the dot is explicitly defined', () => {
      expect_truthy(isMatch('/.dot', '**/.dot*'));
      expect_truthy(isMatch('aaa/bbb/.dot', '**/.dot*'));
      expect_truthy(isMatch('aaa/.dot', '*/.dot*'));
      expect_truthy(isMatch('.aaa.bbb', '.*.*'));
      expect_truthy(isMatch('.aaa.bbb', '.*.*'));
      expect_truthy(!isMatch('.aaa.bbb/', '.*.*', { strictSlashes: true }));
      expect_truthy(!isMatch('.aaa.bbb', '.*.*/'));
      expect_truthy(isMatch('.aaa.bbb/', '.*.*/'));
      expect_truthy(isMatch('.aaa.bbb/', '.*.*{,/}'));
      expect_truthy(isMatch('.aaa.bbb', '.*.bbb'));
      expect_truthy(isMatch('.dotfile.js', '.*.js'));
      expect_truthy(isMatch('.dot', '.*ot'));
      expect_truthy(isMatch('.dot.bbb.ccc', '.*ot.*.*'));
      expect_truthy(isMatch('.dot', '.d?t'));
      expect_truthy(isMatch('.dot', '.dot*'));
      expect_truthy(isMatch('/.dot', '/.dot*'));
    });

    test('should match dots defined in brackets', () => {
      expect_truthy(isMatch('/.dot', '**/.[d]ot'));
      expect_truthy(isMatch('aaa/.dot', '**/.[d]ot'));
      expect_truthy(isMatch('aaa/bbb/.dot', '**/.[d]ot'));
      expect_truthy(isMatch('aaa/.dot', '*/.[d]ot'));
      expect_truthy(isMatch('.dot', '.[d]ot'));
      expect_truthy(isMatch('.dot', '.[d]ot'));
      expect_truthy(isMatch('/.dot', '/.[d]ot'));
    });
  });
});
