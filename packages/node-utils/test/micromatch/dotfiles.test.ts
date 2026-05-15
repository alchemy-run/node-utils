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


const mi = require('minimatch');
const mm = micromatch;
const { isMatch } = mm;

describe('dotfiles', () => {
  describe('file name matching', () => {
    test('should not match a dot when the dot is not explicitly defined', () => {
      expect_truthy(!isMatch('.dot', '*dot'));
      expect_truthy(!isMatch('a/.dot', 'a/*dot'));
    });

    test('should not match leading dots with question marks', () => {
      expect_truthy(!isMatch('.dot', '?dot'));
      expect_truthy(!isMatch('/.dot', '/?dot'));
      expect_truthy(!isMatch('a/.dot', 'a/?dot'));
    });

    test('should match double dots with double dots', () => {
      let fixtures = ['a/../a', 'ab/../ac', '../a', 'a', '../../b', '../c', '../c/d'];
      expect_deepEqual(mm(fixtures, '../*'), ['../a', '../c']);
      expect_deepEqual(mm(fixtures, '*/../*'), ['a/../a', 'ab/../ac']);
      expect_deepEqual(mm(fixtures, '**/../*'), ['a/../a', 'ab/../ac', '../a', '../c']);
    });

    test('should not match exclusive double or single dots', () => {
      let fixtures = ['a/./b', 'a/../b', 'a/c/b', 'a/.d/b'];
      let opts = { dot: true };
      expect_deepEqual(mm(fixtures, 'a/.*/b'), ['a/.d/b']);
      expect_deepEqual(mm(fixtures, 'a/.*/b', opts), ['a/.d/b']);
      expect_deepEqual(mm(fixtures, 'a/*/b', opts), ['a/c/b', 'a/.d/b']);
      expect_truthy(!isMatch('../c', '**/**/**', opts));
      expect_truthy(!isMatch('../c', '**/**/**'));
    });

    test('should match dotfiles when there is a leading dot:', () => {
      let files = ['a/b', 'a/.b', '.a/b', '.a/.b'];
      let dotfiles = ['.dotfile', '.dotfile.md'];
      let opts = { dot: true };
      expect_deepEqual(mm(dotfiles, '.*.md', opts), ['.dotfile.md']);
      expect_deepEqual(mm(dotfiles, '.dotfile', opts), ['.dotfile']);
      expect_deepEqual(mm(dotfiles, '.dotfile*', opts), dotfiles);
      expect_deepEqual(mm(files, 'a/{.*,**}', opts), ['a/b', 'a/.b']);
      expect_deepEqual(mm(files, '{.*,**}', opts), files);
      expect_deepEqual(mm(files, '*/.*', opts), ['a/.b', '.a/.b']);
    });

    test('should match dotfiles when there is not a leading dot:', () => {
      let files = ['.a', 'a', 'a/b', 'a/.b', '.a/b', '.a/.b'];
      let opts = { dot: true };

      expect_deepEqual(mm(files, '*', opts), ['.a', 'a']);
      expect_deepEqual(mm(files, '*/*', opts), ['a/b', 'a/.b', '.a/b', '.a/.b']);
      expect_deepEqual(mm(files, '**', opts), files);
      expect_deepEqual(mm(['.dotfile'], '*.*', opts), ['.dotfile']);
      expect_deepEqual(mm(['.a', '.b', 'c', 'c.md'], '*.*', opts), ['.a', '.b', 'c.md']);
      expect_deepEqual(mm(['.dotfile'], '*.md', opts), []);
      expect_deepEqual(mm(['.verb.txt'], '*.md', opts), []);
      expect_deepEqual(mm(['a/b/c/.dotfile'], '*.md', opts), []);
      expect_deepEqual(mm(['a/b/c/.dotfile.md'], '*.md', opts), []);
      expect_deepEqual(mm(['a/b/c/.verb.md'], '**/*.md', opts), ['a/b/c/.verb.md']);
      expect_deepEqual(mm(['foo.md'], '*.md', opts), ['foo.md']);
      expect_truthy(isMatch('b/.c', '**/**/**', opts));
      expect_truthy(!isMatch('b/.c', '**/**/**'));
    });

    test('should use negation patterns on dotfiles:', () => {
      expect_deepEqual(mm(['.a', '.b', 'c', 'c.md'], '!.*'), ['c', 'c.md']);
      expect_deepEqual(mm(['.a', '.b', 'c', 'c.md'], '!(.*)'), ['c', 'c.md']);
      expect_deepEqual(mm(['.a', '.b', 'c', 'c.md'], '!(.*)*'), ['c', 'c.md']);
      expect_deepEqual(mm(['.a', '.b', 'c', 'c.md'], '!*.*'), ['.a', '.b', 'c']);
    });

    test('should match dotfiles when `options.dot` is true:', () => {
      expect_deepEqual(mm(['.dotfile'], '*.*', { dot: true }), ['.dotfile']);
      expect_deepEqual(mm(['.dotfile'], '*.md', { dot: true }), []);
      expect_deepEqual(mm(['.dotfile'], '.dotfile', { dot: true }), ['.dotfile']);
      expect_deepEqual(mm(['.dotfile.md'], '.*.md', { dot: true }), ['.dotfile.md']);
      expect_deepEqual(mm(['.verb.txt'], '*.md', { dot: true }), []);
      expect_deepEqual(mm(['.verb.txt'], '*.md', { dot: true }), []);
      expect_deepEqual(mm(['a/b/c/.dotfile'], '*.md', { dot: true }), []);
      expect_deepEqual(mm(['a/b/c/.dotfile.md'], '**/*.md', { dot: true }), ['a/b/c/.dotfile.md']);
      expect_deepEqual(mm(['a/b/c/.dotfile.md'], '**/.*', { dot: false }), ['a/b/c/.dotfile.md']);
      expect_deepEqual(mm(['a/b/c/.dotfile.md'], '**/.*.md', { dot: false }), ['a/b/c/.dotfile.md']);
      expect_deepEqual(mm(['a/b/c/.dotfile.md'], '*.md', { dot: false }), []);
      expect_deepEqual(mm(['a/b/c/.dotfile.md'], '*.md', { dot: true }), []);
      expect_deepEqual(mm(['a/b/c/.verb.md'], '**/*.md', { dot: true }), ['a/b/c/.verb.md']);
      expect_deepEqual(mm(['d.md'], '*.md', { dot: true }), ['d.md']);
    });

    test('should not match a dot when the dot is not explicitly defined', () => {
      let fixtures = ['a/b/.x', '.x', '.x/', '.x/a', '.x/a/b', '.x/.x', 'a/.x', 'a/b/.x/c', 'a/b/.x/c/d', 'a/b/.x/c/d/e', 'a/b/.x/', 'a/.x/b', 'a/.x/b/.x/c'];
      expect_deepEqual(mm(fixtures, '**'), []);
      expect_deepEqual(mm(fixtures, 'a/**/c'), []);
    });

    test('should match a dot when the dot is explicitly defined', () => {
      let fixtures = ['.x', '.x/', '.x/.x', '.x/a', '.x/a/b', 'a/.x/.x/c', 'a/.x/.x/.x/c', 'a/.x/b', 'a/.x/b/.x/c', 'a/b/.x', 'a/b/.x/', 'a/b/.x/c', 'a/b/.x/c/d', 'a/b/.x/c/d/e'];
      let expected = ['.x', '.x/', '.x/.x', '.x/a', '.x/a/b', 'a/.x/.x/c', 'a/.x/b', 'a/b/.x', 'a/b/.x/', 'a/b/.x/c', 'a/b/.x/c/d', 'a/b/.x/c/d/e'];

      expect_deepEqual(mm(fixtures, '**/.x/.x/**'), ['.x/.x', 'a/.x/.x/c']);
      expect_deepEqual(mm(fixtures, '**/.x/*/.x/**'), ['a/.x/b/.x/c']);
      expect_deepEqual(mm(fixtures, '**/.x/**'), expected.filter(ele => !ele.includes('.x/.x')));
      expect_truthy(isMatch('.bar.baz', '.*.*'));
      expect_truthy(isMatch('.bar.baz', '.*.*'));
      expect_truthy(!isMatch('.bar.baz', '.*.*/'));
      expect_truthy(isMatch('.bar.baz', '.*.baz'));
      expect_truthy(!isMatch('.bar.baz/', '.*.*'));
      expect_truthy(isMatch('.bar.baz/', '.*.*{,/}'));
      expect_truthy(isMatch('.bar.baz/', '.*.*/'));
      expect_truthy(isMatch('.dot', '.*ot'));
      expect_truthy(isMatch('.dot', '.[d]ot'));
      expect_truthy(isMatch('.dot.foo.bar', '.*ot.*.*'));
      expect_truthy(isMatch('.dotfile.js', '.*.js'));
      expect_truthy(isMatch('/.dot', '**/.[d]ot'));
      expect_truthy(isMatch('/.dot', '**/.dot*'));
      expect_truthy(isMatch('/.dot', '/.[d]ot'));
      expect_truthy(isMatch('/.dot', '/.dot*'));
      expect_truthy(isMatch('a/.dot', '**/.[d]ot'));
      expect_truthy(isMatch('a/.dot', '*/.[d]ot'));
      expect_truthy(isMatch('a/.dot', '*/.dot*'));
      expect_truthy(isMatch('a/b/.dot', '**/.[d]ot'));
      expect_truthy(isMatch('a/b/.dot', '**/.dot*'));
      expect_truthy(isMatch('.dot', '.[d]ot'));
      expect_truthy(isMatch('.dot', '.d?t'));
      expect_truthy(isMatch('.dot', '.dot*'));

      expect_deepEqual(mm('.dot', '.[d]ot'), ['.dot']);
      expect_deepEqual(mm('.dot', '.dot*'), ['.dot']);
      expect_deepEqual(mm('.dot', '.d?t'), ['.dot']);

      expect_truthy(!isMatch('.bar.baz', '.*.*/'));
      expect_truthy(isMatch('.bar.baz/', '.*.*{,/}'));
      expect_truthy(isMatch('.bar.baz', '.*.*'));
      expect_truthy(isMatch('.bar.baz', '.*.baz'));
      expect_truthy(isMatch('.bar.baz/', '.*.*/'));
      expect_truthy(isMatch('.dot', '.*ot'));
      expect_truthy(isMatch('.dot', '.[d]ot'));
      expect_truthy(isMatch('.dot.foo.bar', '.*ot.*.*'));
      expect_truthy(isMatch('.dotfile.js', '.*.js'));
      expect_truthy(isMatch('/.dot', '**/.[d]ot'));
      expect_truthy(isMatch('/.dot', '**/.dot*'));
      expect_truthy(isMatch('/.dot', '**/[.]dot'));
      expect_truthy(isMatch('/.dot', '/[.]dot'));
      expect_truthy(isMatch('a/.dot', '**/.[d]ot'));
      expect_truthy(isMatch('a/.dot', '*/.[d]ot'));
      expect_truthy(isMatch('a/.dot', '*/.dot*'));
      expect_truthy(isMatch('a/.dot', '*/[.]dot'));
      expect_truthy(isMatch('a/b/.dot', '**/.[d]ot'));
      expect_truthy(isMatch('a/b/.dot', '**/.dot*'));
      expect_truthy(isMatch('a/b/.dot', '**/[.]dot'));
    });

    test('should match dots in root path when glob is prefixed with **/', () => {
      expect_truthy(isMatch('.x', '**/.x/**'));
      expect_truthy(!isMatch('.x/.x', '**/.x/**'));
      expect_truthy(isMatch('.x/.x', '**/.x/.x/**'));
      expect_truthy(isMatch('a/b/.x', '**/.x/**'));
      expect_truthy(isMatch('.x/', '**/.x/**'));
      expect_truthy(isMatch('.x/a', '**/.x/**'));
      expect_truthy(isMatch('.x/a/b', '**/.x/**'));
      expect_truthy(isMatch('a/.x/b', '**/.x/**'));
      expect_truthy(isMatch('a/b/.x', '**/.x'));
      expect_truthy(isMatch('a/b/.x/', '**/.x/**'));
      expect_truthy(isMatch('a/b/.x/c', '**/.x/**'));
      expect_truthy(isMatch('a/b/.x/c/d', '**/.x/**'));
      expect_truthy(isMatch('a/b/.x/c/d/e', '**/.x/**'));
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
      expect_truthy(!isMatch('../.test.js', '../*.js'));
    });

    test('should not match dotfiles with globstars by default', () => {
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
      expect_truthy(!isMatch('a/.dot', '*/*dot'));
      expect_truthy(!isMatch('a/.dot', '*/?dot'));
      expect_truthy(!isMatch('a/.dot', 'a/*dot'));
      expect_truthy(!isMatch('a/b/.dot', '**/*dot'));
      expect_truthy(!isMatch('a/b/.dot', '**/?dot'));
    });

    test('should not match leading dots with question marks', () => {
      expect_truthy(!isMatch('.dot', '?dot'));
      expect_truthy(!isMatch('/.dot', '/?dot'));
      expect_truthy(!isMatch('a/.dot', 'a/?dot'));
    });

    test('should match with double dots', () => {
      expect_truthy(!isMatch('../../b', '**/../*'));
      expect_truthy(!isMatch('../../b', '*/../*'));
      expect_truthy(!isMatch('../../b', '../*'));
      expect_truthy(!isMatch('../a', '*/../*'));
      expect_truthy(!isMatch('../c', '*/../*'));
      expect_truthy(!isMatch('../c/d', '**/../*'));
      expect_truthy(!isMatch('../c/d', '*/../*'));
      expect_truthy(!isMatch('../c/d', '../*'));
      expect_truthy(!isMatch('a', '**/../*'));
      expect_truthy(!isMatch('a', '*/../*'));
      expect_truthy(!isMatch('a', '../*'));
      expect_truthy(!isMatch('a/../a', '../*'));
      expect_truthy(!isMatch('ab/../ac', '../*'));
      expect_truthy(!isMatch('a/../', '**/../*'));

      expect_truthy(isMatch('../a', '**/../*'));
      expect_truthy(isMatch('../a', '../*'));
      expect_truthy(isMatch('a/../a', '**/../*'));
      expect_truthy(isMatch('a/../a', '*/../*'));
      expect_truthy(isMatch('ab/../ac', '**/../*'));
      expect_truthy(isMatch('ab/../ac', '*/../*'));
    });
  });

  describe('multiple directories', () => {
    test('should not match a dot when the dot is not explicitly defined', () => {
      expect_truthy(!isMatch('.dot', '*dot'));
      expect_truthy(!isMatch('/.dot', '*/*dot'));
      expect_truthy(!isMatch('.dot', '**/*dot'));
      expect_truthy(!isMatch('.dot', '**/?dot'));
      expect_truthy(!isMatch('.dot', '*/*dot'));
      expect_truthy(!isMatch('.dot', '*/?dot'));
      expect_truthy(!isMatch('.dot', '/*dot'));
      expect_truthy(!isMatch('.dot', '/?dot'));
      expect_truthy(!isMatch('/.dot', '**/*dot'));
      expect_truthy(!isMatch('/.dot', '**/?dot'));
      expect_truthy(!isMatch('/.dot', '*/?dot'));
      expect_truthy(!isMatch('/.dot', '/*dot'));
      expect_truthy(!isMatch('/.dot', '/?dot'));
      expect_truthy(!isMatch('a/.dot', '*/*dot'));
      expect_truthy(!isMatch('a/.dot', '*/?dot'));
      expect_truthy(!isMatch('a/b/.dot', '**/*dot'));
      expect_truthy(!isMatch('a/b/.dot', '**/?dot'));

      // related https://github.com/jonschlinkert/micromatch/issues/63
      expect_truthy(!isMatch('/aaa/bbb/.git', '/aaa/bbb/**'));
      expect_truthy(!isMatch('aaa/bbb/.git', 'aaa/bbb/**'));
      expect_truthy(!isMatch('/aaa/bbb/ccc/.git', '/aaa/bbb/**'));
      expect_truthy(isMatch('/aaa/bbb/.git', '/aaa/bbb/**', { dot: true }));
      expect_truthy(isMatch('aaa/bbb/.git', 'aaa/bbb/**', { dot: true }));
      expect_truthy(isMatch('/aaa/bbb/ccc/.git', '/aaa/bbb/**', { dot: true }));
    });
  });

  describe('options.dot', () => {
    test('should match dotfiles when `options.dot` is true', () => {
      expect_truthy(isMatch('.dotfile.js', '.*.js', { dot: true }));
      expect_truthy(isMatch('.dot', '*dot', { dot: true }));
      expect_truthy(isMatch('.dot', '?dot', { dot: true }));
      expect_truthy(isMatch('.dot', '[.]dot', { dot: true }));
      expect_truthy(isMatch('/a/b/.dot', '**/*dot', { dot: true }));
      expect_truthy(isMatch('/a/b/.dot', '**/.[d]ot', { dot: true }));
      expect_truthy(isMatch('/a/b/.dot', '**/?dot', { dot: true }));
      expect_truthy(isMatch('/a/b/.dot', '**/[.]dot', { dot: false }));
      expect_truthy(isMatch('/a/b/.dot', '**/[.]dot', { dot: true }));
      expect_truthy(isMatch('a/b/.dot', '**/*dot', { dot: true }));
      expect_truthy(isMatch('a/b/.dot', '**/.[d]ot', { dot: true }));
      expect_truthy(isMatch('a/b/.dot', '**/?dot', { dot: true }));
      expect_truthy(isMatch('a/b/.dot', '**/[.]dot', { dot: false }));
      expect_truthy(isMatch('a/b/.dot', '**/[.]dot', { dot: true }));
    });

    test('should match dotfiles when `.dot` and `.matchBase` both defined', () => {
      expect_truthy(isMatch('a/b/.dot', '*dot', { dot: true, matchBase: true }));
      expect_truthy(isMatch('a/b/.dot', '[.]dot', { dot: true, matchBase: true }));
      expect_truthy(isMatch('a/b/.dot', '[.]dot', { dot: false, matchBase: true }));
      expect_truthy(isMatch('a/b/.dot', '?dot', { dot: true, matchBase: true }));
    });

    test('should work when the path has leading `./`', () => {
      let format = str => str.replace(/^\.\//, '');
      expect_truthy(!isMatch('./b/.c', '**', { format }));
      expect_truthy(isMatch('./b/.c', '**', { format, dot: true }));
      expect_truthy(isMatch('./b/.c', '**', { format, dot: true, matchBase: true }));
    });

    test('should not match dotfiles when `options.dot` is false', () => {
      expect_truthy(!isMatch('a/b/.dot', '**/*dot', { dot: false }));
      expect_truthy(!isMatch('a/b/.dot', '**/?dot', { dot: false }));
    });

    test('should not match dotfiles when `.dot` is false and `.matchBase` is true', () => {
      expect_truthy(!isMatch('a/b/.dot', '*dot', { dot: false, matchBase: true }));
      expect_truthy(!isMatch('a/b/.dot', '?dot', { dot: false, matchBase: true }));
    });

    test('should not match dotfiles when `.dot` is not defined and a dot is not in the glob pattern', () => {
      expect_truthy(!isMatch('a/b/.dot', '*dot', { matchBase: true }));
      expect_truthy(!isMatch('a/b/.dot', '?dot', { matchBase: true }));
      expect_truthy(!isMatch('a/b/.dot', '**/*dot'));
      expect_truthy(!isMatch('a/b/.dot', '**/?dot'));
    });
  });
});
