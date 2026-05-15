// @ts-nocheck — mechanically ported from upstream JS tests; bun runs them as-is.
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

const expect_truthy = (v: unknown, _msg?: unknown) => {
  expect(Boolean(v)).toBe(true);
};
const expect_equal = (actual: unknown, expected: unknown, _msg?: unknown) => {
  expect(actual).toBe(expected as any);
};
const expect_deepEqual = (actual: unknown, expected: unknown, _msg?: unknown) => {
  expect(actual).toEqual(expected as any);
};
const expect_throws = (fn: () => unknown, matcher?: any, _msg?: unknown) => {
  if (matcher) expect(fn).toThrow(matcher);
  else expect(fn).toThrow();
};
const expect_doesNotThrow = (fn: () => unknown, _msg?: unknown) => {
  expect(fn).not.toThrow();
};


const scan = picomatch.scan;
const base = (...args) => scan(...args).base;
const both = (...args) => {
  const { base, glob } = scan(...args);
  return [base, glob];
};

/**
 * @param {String} pattern
 * @param {String[]} parts
 */
function assertParts(pattern, parts) {
  const info = scan(pattern, { parts: true });

  expect_deepEqual(info.parts, parts);
}

/**
 * Most of the unit tests in this file were from https://github.com/es128/glob-parent
 * and https://github.com/jonschlinkert/glob-base. Both libraries use a completely
 * different approach to separating the glob pattern from the "path" from picomatch,
 * and both libraries use path.dirname. Picomatch does not.
 */

describe('picomatch', () => {
  describe('.scan', () => {
    test('should get the "base" and "glob" from a pattern', () => {
      expect_deepEqual(both('foo/bar'), ['foo/bar', '']);
      expect_deepEqual(both('foo/@bar'), ['foo/@bar', '']);
      expect_deepEqual(both('foo/@bar\\+'), ['foo/@bar\\+', '']);
      expect_deepEqual(both('foo/bar+'), ['foo/bar+', '']);
      expect_deepEqual(both('foo/bar*'), ['foo', 'bar*']);
    });

    test('should handle leading "./"', () => {
      expect_deepEqual(scan('./foo/bar/*.js'), {
        input: './foo/bar/*.js',
        prefix: './',
        start: 2,
        base: 'foo/bar',
        glob: '*.js',
        isBrace: false,
        isBracket: false,
        isGlob: true,
        isGlobstar: false,
        isExtglob: false,
        negated: false,
        negatedExtglob: false
      });
    });

    test('should detect braces', () => {
      expect_deepEqual(scan('foo/{a,b,c}/*.js', { scanToEnd: true }), {
        input: 'foo/{a,b,c}/*.js',
        prefix: '',
        start: 0,
        base: 'foo',
        glob: '{a,b,c}/*.js',
        isBrace: true,
        isBracket: false,
        isGlob: true,
        isGlobstar: false,
        isExtglob: false,
        negated: false,
        negatedExtglob: false
      });
    });

    test('should detect globstars', () => {
      expect_deepEqual(scan('./foo/**/*.js', { scanToEnd: true }), {
        input: './foo/**/*.js',
        prefix: './',
        start: 2,
        base: 'foo',
        glob: '**/*.js',
        isBrace: false,
        isBracket: false,
        isGlob: true,
        isGlobstar: true,
        isExtglob: false,
        negated: false,
        negatedExtglob: false
      });
    });

    test('should detect extglobs', () => {
      expect_deepEqual(scan('./foo/@(foo)/*.js'), {
        input: './foo/@(foo)/*.js',
        prefix: './',
        start: 2,
        base: 'foo',
        glob: '@(foo)/*.js',
        isBrace: false,
        isBracket: false,
        isGlob: true,
        isGlobstar: false,
        isExtglob: true,
        negated: false,
        negatedExtglob: false
      });
    });

    test('should detect extglobs and globstars', () => {
      expect_deepEqual(scan('./foo/@(bar)/**/*.js', { parts: true }), {
        input: './foo/@(bar)/**/*.js',
        prefix: './',
        start: 2,
        base: 'foo',
        glob: '@(bar)/**/*.js',
        isBrace: false,
        isBracket: false,
        isGlob: true,
        isGlobstar: true,
        isExtglob: true,
        negated: false,
        negatedExtglob: false,
        slashes: [1, 5, 12, 15],
        parts: ['foo', '@(bar)', '**', '*.js']
      });
    });

    test('should handle leading "!"', () => {
      expect_deepEqual(scan('!foo/bar/*.js'), {
        input: '!foo/bar/*.js',
        prefix: '!',
        start: 1,
        base: 'foo/bar',
        glob: '*.js',
        isBrace: false,
        isBracket: false,
        isGlob: true,
        isGlobstar: false,
        isExtglob: false,
        negated: true,
        negatedExtglob: false
      });
    });

    test('should detect negated extglobs at the begining', () => {
      expect_deepEqual(scan('!(foo)*'), {
        input: '!(foo)*',
        prefix: '',
        start: 0,
        base: '',
        glob: '!(foo)*',
        isBrace: false,
        isBracket: false,
        isGlob: true,
        isGlobstar: false,
        isExtglob: true,
        negated: false,
        negatedExtglob: true
      });

      expect_deepEqual(scan('!(foo)'), {
        input: '!(foo)',
        prefix: '',
        start: 0,
        base: '',
        glob: '!(foo)',
        isBrace: false,
        isBracket: false,
        isGlob: true,
        isGlobstar: false,
        isExtglob: true,
        negated: false,
        negatedExtglob: true
      });
    });

    test('should not detect negated extglobs in the middle', () => {
      expect_deepEqual(scan('test/!(foo)/*'), {
        input: 'test/!(foo)/*',
        prefix: '',
        start: 0,
        base: 'test',
        glob: '!(foo)/*',
        isBrace: false,
        isBracket: false,
        isGlob: true,
        isGlobstar: false,
        isExtglob: true,
        negated: false,
        negatedExtglob: false
      });
    });

    test('should handle leading "./" when negated', () => {
      expect_deepEqual(scan('./!foo/bar/*.js'), {
        input: './!foo/bar/*.js',
        prefix: './!',
        start: 3,
        base: 'foo/bar',
        glob: '*.js',
        isBrace: false,
        isBracket: false,
        isGlob: true,
        isGlobstar: false,
        isExtglob: false,
        negated: true,
        negatedExtglob: false
      });

      expect_deepEqual(scan('!./foo/bar/*.js'), {
        input: '!./foo/bar/*.js',
        prefix: '!./',
        start: 3,
        base: 'foo/bar',
        glob: '*.js',
        isBrace: false,
        isBracket: false,
        isGlob: true,
        isGlobstar: false,
        isExtglob: false,
        negated: true,
        negatedExtglob: false
      });
    });

    test('should recognize leading ./', () => {
      expect_equal(base('./(a|b)'), '');
    });

    test('should strip glob magic to return base path', () => {
      expect_equal(base('.'), '.');
      expect_equal(base('.*'), '');
      expect_equal(base('/.*'), '/');
      expect_equal(base('/.*/'), '/');
      expect_equal(base('a/.*/b'), 'a');
      expect_equal(base('a*/.*/b'), '');
      expect_equal(base('*/a/b/c'), '');
      expect_equal(base('*'), '');
      expect_equal(base('*/'), '');
      expect_equal(base('*/*'), '');
      expect_equal(base('*/*/'), '');
      expect_equal(base('**'), '');
      expect_equal(base('**/'), '');
      expect_equal(base('**/*'), '');
      expect_equal(base('**/*/'), '');
      expect_equal(base('/*.js'), '/');
      expect_equal(base('*.js'), '');
      expect_equal(base('**/*.js'), '');
      expect_equal(base('/root/path/to/*.js'), '/root/path/to');
      expect_equal(base('[a-z]'), '');
      expect_equal(base('chapter/foo [bar]/'), 'chapter');
      expect_equal(base('path/!/foo'), 'path/!/foo');
      expect_equal(base('path/!/foo/'), 'path/!/foo/');
      expect_equal(base('path/!subdir/foo.js'), 'path/!subdir/foo.js');
      expect_equal(base('path/**/*'), 'path');
      expect_equal(base('path/**/subdir/foo.*'), 'path');
      expect_equal(base('path/*/foo'), 'path');
      expect_equal(base('path/*/foo/'), 'path');
      expect_equal(base('path/+/foo'), 'path/+/foo', 'plus sign must be escaped');
      expect_equal(base('path/+/foo/'), 'path/+/foo/', 'plus sign must be escaped');
      expect_equal(base('path/?/foo'), 'path', 'qmarks must be escaped');
      expect_equal(base('path/?/foo/'), 'path', 'qmarks must be escaped');
      expect_equal(base('path/@/foo'), 'path/@/foo');
      expect_equal(base('path/@/foo/'), 'path/@/foo/');
      expect_equal(base('path/[a-z]'), 'path');
      expect_equal(base('path/subdir/**/foo.js'), 'path/subdir');
      expect_equal(base('path/to/*.js'), 'path/to');
    });

    test('should respect escaped characters', () => {
      expect_equal(base('path/\\*\\*/subdir/foo.*'), 'path/\\*\\*/subdir');
      expect_equal(base('path/\\[\\*\\]/subdir/foo.*'), 'path/\\[\\*\\]/subdir');
      expect_equal(base('path/\\[foo bar\\]/subdir/foo.*'), 'path/\\[foo bar\\]/subdir');
      expect_equal(base('path/\\[bar]/'), 'path/\\[bar]/');
      expect_equal(base('path/\\[bar]'), 'path/\\[bar]');
      expect_equal(base('[bar]'), '');
      expect_equal(base('[bar]/'), '');
      expect_equal(base('./\\[bar]'), '\\[bar]');
      expect_equal(base('\\[bar]/'), '\\[bar]/');
      expect_equal(base('\\[bar\\]/'), '\\[bar\\]/');
      expect_equal(base('[bar\\]/'), '[bar\\]/');
      expect_equal(base('path/foo \\[bar]/'), 'path/foo \\[bar]/');
      expect_equal(base('\\[bar]'), '\\[bar]');
      expect_equal(base('[bar\\]'), '[bar\\]');
    });

    test('should return full non-glob paths', () => {
      expect_equal(base('path'), 'path');
      expect_equal(base('path/foo'), 'path/foo');
      expect_equal(base('path/foo/'), 'path/foo/');
      expect_equal(base('path/foo/bar.js'), 'path/foo/bar.js');
    });

    test('should not return glob when noext is true', () => {
      expect_deepEqual(scan('./foo/bar/*.js', { noext: true }), {
        input: './foo/bar/*.js',
        prefix: './',
        start: 2,
        base: 'foo/bar/*.js',
        glob: '',
        isBrace: false,
        isBracket: false,
        isGlob: false,
        isGlobstar: false,
        isExtglob: false,
        negated: false,
        negatedExtglob: false
      });
    });

    test('should respect nonegate opts', () => {
      expect_deepEqual(scan('!foo/bar/*.js', { nonegate: true }), {
        input: '!foo/bar/*.js',
        prefix: '',
        start: 0,
        base: '!foo/bar',
        glob: '*.js',
        isBrace: false,
        isBracket: false,
        isGlob: true,
        isGlobstar: false,
        isExtglob: false,
        negated: false,
        negatedExtglob: false
      });
    });

    test('should return parts of the pattern', () => {
      // Right now it returns []
      // assertParts('', ['']);
      // assertParts('*', ['*']);
      // assertParts('.*', ['.*']);
      // assertParts('**', ['**']);
      // assertParts('foo', ['foo']);
      // assertParts('foo*', ['foo*']);
      // assertParts('/', ['', '']);
      // assertParts('/*', ['', '*']);
      // assertParts('./', ['']);
      // assertParts('{1..9}', ['{1..9}']);
      // assertParts('c!(.)z', ['c!(.)z']);
      // assertParts('(b|a).(a)', ['(b|a).(a)']);
      // assertParts('+(a|b\\[)*', ['+(a|b\\[)*']);
      // assertParts('@(a|b).md', ['@(a|b).md']);
      // assertParts('(a/b)', ['(a/b)']);
      // assertParts('(a\\b)', ['(a\\b)']);
      // assertParts('foo\\[a\\/]', ['foo\\[a\\/]']);
      // assertParts('foo[/]bar', ['foo[/]bar']);
      // assertParts('/dev\\/@(tcp|udp)\\/*\\/*', ['', '/dev\\/@(tcp|udp)\\/*\\/*']);

      // Right now it returns ['*']
      // assertParts('*/', ['*', '']);

      // Right now it returns ['!(!(bar)', 'baz)']
      // assertParts('!(!(bar)/baz)', ['!(!(bar)/baz)']);

      assertParts('./foo', ['foo']);
      assertParts('../foo', ['..', 'foo']);

      assertParts('foo/bar', ['foo', 'bar']);
      assertParts('foo/*', ['foo', '*']);
      assertParts('foo/**', ['foo', '**']);
      assertParts('foo/**/*', ['foo', '**', '*']);
      assertParts('フォルダ/**/*', ['フォルダ', '**', '*']);

      assertParts('foo/!(abc)', ['foo', '!(abc)']);
      assertParts('c/!(z)/v', ['c', '!(z)', 'v']);
      assertParts('c/@(z)/v', ['c', '@(z)', 'v']);
      assertParts('foo/(bar|baz)', ['foo', '(bar|baz)']);
      assertParts('foo/(bar|baz)*', ['foo', '(bar|baz)*']);
      assertParts('**/*(W*, *)*', ['**', '*(W*, *)*']);
      assertParts('a/**@(/x|/z)/*.md', ['a', '**@(/x|/z)', '*.md']);
      assertParts('foo/(bar|baz)/*.js', ['foo', '(bar|baz)', '*.js']);

      assertParts('XXX/*/*/12/*/*/m/*/*', ['XXX', '*', '*', '12', '*', '*', 'm', '*', '*']);
      assertParts('foo/\\"**\\"/bar', ['foo', '\\"**\\"', 'bar']);

      assertParts('[0-9]/[0-9]', ['[0-9]', '[0-9]']);
      assertParts('foo/[0-9]/[0-9]', ['foo', '[0-9]', '[0-9]']);
      assertParts('foo[0-9]/bar[0-9]', ['foo[0-9]', 'bar[0-9]']);
    });
  });

  describe('.base (glob2base test patterns)', () => {
    test('should get a base name', () => {
      expect_equal(base('js/*.js'), 'js');
    });

    test('should get a base name from a nested glob', () => {
      expect_equal(base('js/**/test/*.js'), 'js');
    });

    test('should get a base name from a flat file', () => {
      expect_equal(base('js/test/wow.js'), 'js/test/wow.js'); // differs
    });

    test('should get a base name from character class pattern', () => {
      expect_equal(base('js/t[a-z]st}/*.js'), 'js');
    });

    test('should get a base name from extglob', () => {
      expect_equal(base('js/t+(wo|est)/*.js'), 'js');
    });

    test('should get a base name from a path with non-exglob parens', () => {
      expect_equal(base('(a|b)'), '');
      expect_equal(base('foo/(a|b)'), 'foo');
      expect_equal(base('/(a|b)'), '/');
      expect_equal(base('a/(b c)'), 'a');
      expect_equal(base('foo/(b c)/baz'), 'foo');
      expect_equal(base('a/(b c)/'), 'a');
      expect_equal(base('a/(b c)/d'), 'a');
      expect_equal(base('a/(b c)', { noparen: true }), 'a/(b c)');
      expect_equal(base('a/(b c)/', { noparen: true }), 'a/(b c)/');
      expect_equal(base('a/(b c)/d', { noparen: true }), 'a/(b c)/d');
      expect_equal(base('foo/(b c)/baz', { noparen: true }), 'foo/(b c)/baz');
      expect_equal(base('path/(foo bar)/subdir/foo.*', { noparen: true }), 'path/(foo bar)/subdir');
      expect_equal(base('a/\\(b c)'), 'a/\\(b c)', 'parens must be escaped');
      expect_equal(base('a/\\+\\(b c)/foo'), 'a/\\+\\(b c)/foo', 'parens must be escaped');
      expect_equal(base('js/t(wo|est)/*.js'), 'js');
      expect_equal(base('js/t/(wo|est)/*.js'), 'js/t');
      expect_equal(base('path/(foo bar)/subdir/foo.*'), 'path', 'parens must be escaped');
      expect_equal(base('path/(foo/bar|baz)'), 'path');
      expect_equal(base('path/(foo/bar|baz)/'), 'path');
      expect_equal(base('path/(to|from)'), 'path');
      expect_equal(base('path/\\(foo/bar|baz)/'), 'path/\\(foo/bar|baz)/');
      expect_equal(base('path/\\*(a|b)'), 'path');
      expect_equal(base('path/\\*(a|b)/subdir/foo.*'), 'path');
      expect_equal(base('path/\\*/(a|b)/subdir/foo.*'), 'path/\\*');
      expect_equal(base('path/\\*\\(a\\|b\\)/subdir/foo.*'), 'path/\\*\\(a\\|b\\)/subdir');
    });
  });

  describe('technically invalid windows globs', () => {
    test('should support simple globs with backslash path separator', () => {
      expect_equal(base('C:\\path\\*.js'), 'C:\\path\\*.js');
      expect_equal(base('C:\\\\path\\\\*.js'), '');
      expect_equal(base('C:\\\\path\\*.js'), 'C:\\\\path\\*.js');
    });
  });

  describe('glob base >', () => {
    test('should parse globs', () => {
      expect_deepEqual(both('!foo'), ['foo', '']);
      expect_deepEqual(both('*'), ['', '*']);
      expect_deepEqual(both('**'), ['', '**']);
      expect_deepEqual(both('**/*.md'), ['', '**/*.md']);
      expect_deepEqual(both('**/*.min.js'), ['', '**/*.min.js']);
      expect_deepEqual(both('**/*foo.js'), ['', '**/*foo.js']);
      expect_deepEqual(both('**/.*'), ['', '**/.*']);
      expect_deepEqual(both('**/d'), ['', '**/d']);
      expect_deepEqual(both('*.*'), ['', '*.*']);
      expect_deepEqual(both('*.js'), ['', '*.js']);
      expect_deepEqual(both('*.md'), ['', '*.md']);
      expect_deepEqual(both('*.min.js'), ['', '*.min.js']);
      expect_deepEqual(both('*/*'), ['', '*/*']);
      expect_deepEqual(both('*/*/*/*'), ['', '*/*/*/*']);
      expect_deepEqual(both('*/*/*/e'), ['', '*/*/*/e']);
      expect_deepEqual(both('*/b/*/e'), ['', '*/b/*/e']);
      expect_deepEqual(both('*b'), ['', '*b']);
      expect_deepEqual(both('.*'), ['', '.*']);
      expect_deepEqual(both('*'), ['', '*']);
      expect_deepEqual(both('a/**/j/**/z/*.md'), ['a', '**/j/**/z/*.md']);
      expect_deepEqual(both('a/**/z/*.md'), ['a', '**/z/*.md']);
      expect_deepEqual(both('node_modules/*-glob/**/*.js'), ['node_modules', '*-glob/**/*.js']);
      expect_deepEqual(both('{a/b/{c,/foo.js}/e.f.g}'), ['', '{a/b/{c,/foo.js}/e.f.g}']);
      expect_deepEqual(both('.a*'), ['', '.a*']);
      expect_deepEqual(both('.b*'), ['', '.b*']);
      expect_deepEqual(both('/*'), ['/', '*']);
      expect_deepEqual(both('a/***'), ['a', '***']);
      expect_deepEqual(both('a/**/b/*.{foo,bar}'), ['a', '**/b/*.{foo,bar}']);
      expect_deepEqual(both('a/**/c/*'), ['a', '**/c/*']);
      expect_deepEqual(both('a/**/c/*.md'), ['a', '**/c/*.md']);
      expect_deepEqual(both('a/**/e'), ['a', '**/e']);
      expect_deepEqual(both('a/**/j/**/z/*.md'), ['a', '**/j/**/z/*.md']);
      expect_deepEqual(both('a/**/z/*.md'), ['a', '**/z/*.md']);
      expect_deepEqual(both('a/**c*'), ['a', '**c*']);
      expect_deepEqual(both('a/**c/*'), ['a', '**c/*']);
      expect_deepEqual(both('a/*/*/e'), ['a', '*/*/e']);
      expect_deepEqual(both('a/*/c/*.md'), ['a', '*/c/*.md']);
      expect_deepEqual(both('a/b/**/c{d,e}/**/xyz.md'), ['a/b', '**/c{d,e}/**/xyz.md']);
      expect_deepEqual(both('a/b/**/e'), ['a/b', '**/e']);
      expect_deepEqual(both('a/b/*.{foo,bar}'), ['a/b', '*.{foo,bar}']);
      expect_deepEqual(both('a/b/*/e'), ['a/b', '*/e']);
      expect_deepEqual(both('a/b/.git/'), ['a/b/.git/', '']);
      expect_deepEqual(both('a/b/.git/**'), ['a/b/.git', '**']);
      expect_deepEqual(both('a/b/.{foo,bar}'), ['a/b', '.{foo,bar}']);
      expect_deepEqual(both('a/b/c/*'), ['a/b/c', '*']);
      expect_deepEqual(both('a/b/c/**/*.min.js'), ['a/b/c', '**/*.min.js']);
      expect_deepEqual(both('a/b/c/*.md'), ['a/b/c', '*.md']);
      expect_deepEqual(both('a/b/c/.*.md'), ['a/b/c', '.*.md']);
      expect_deepEqual(both('a/b/{c,.gitignore,{a,b}}/{a,b}/abc.foo.js'), ['a/b', '{c,.gitignore,{a,b}}/{a,b}/abc.foo.js']);
      expect_deepEqual(both('a/b/{c,/.gitignore}'), ['a/b', '{c,/.gitignore}']);
      expect_deepEqual(both('a/b/{c,d}/'), ['a/b', '{c,d}/']);
      expect_deepEqual(both('a/b/{c,d}/e/f.g'), ['a/b', '{c,d}/e/f.g']);
      expect_deepEqual(both('b/*/*/*'), ['b', '*/*/*']);
    });

    test('should support file extensions', () => {
      expect_deepEqual(both('.md'), ['.md', '']);
    });

    test('should support negation pattern', () => {
      expect_deepEqual(both('!*.min.js'), ['', '*.min.js']);
      expect_deepEqual(both('!foo'), ['foo', '']);
      expect_deepEqual(both('!foo/*.js'), ['foo', '*.js']);
      expect_deepEqual(both('!foo/(a|b).min.js'), ['foo', '(a|b).min.js']);
      expect_deepEqual(both('!foo/[a-b].min.js'), ['foo', '[a-b].min.js']);
      expect_deepEqual(both('!foo/{a,b}.min.js'), ['foo', '{a,b}.min.js']);
      expect_deepEqual(both('a/b/c/!foo'), ['a/b/c/!foo', '']);
    });

    test('should support extglobs', () => {
      expect_deepEqual(both('/a/b/!(a|b)/e.f.g/'), ['/a/b', '!(a|b)/e.f.g/']);
      expect_deepEqual(both('/a/b/@(a|b)/e.f.g/'), ['/a/b', '@(a|b)/e.f.g/']);
      expect_deepEqual(both('@(a|b)/e.f.g/'), ['', '@(a|b)/e.f.g/']);
      expect_equal(base('path/!(to|from)'), 'path');
      expect_equal(base('path/*(to|from)'), 'path');
      expect_equal(base('path/+(to|from)'), 'path');
      expect_equal(base('path/?(to|from)'), 'path');
      expect_equal(base('path/@(to|from)'), 'path');
    });

    test('should support regex character classes', () => {
      const opts = { unescape: true };
      expect_deepEqual(both('[a-c]b*'), ['', '[a-c]b*']);
      expect_deepEqual(both('[a-j]*[^c]'), ['', '[a-j]*[^c]']);
      expect_deepEqual(both('[a-j]*[^c]b/c'), ['', '[a-j]*[^c]b/c']);
      expect_deepEqual(both('[a-j]*[^c]bc'), ['', '[a-j]*[^c]bc']);
      expect_deepEqual(both('[ab][ab]'), ['', '[ab][ab]']);
      expect_deepEqual(both('foo/[a-b].min.js'), ['foo', '[a-b].min.js']);
      expect_equal(base('path/foo[a\\/]/', opts), 'path');
      expect_equal(base('path/foo\\[a\\/]/', opts), 'path/foo[a\\/]/');
      expect_equal(base('foo[a\\/]', opts), '');
      expect_equal(base('foo\\[a\\/]', opts), 'foo[a\\/]');
    });

    test('should support qmarks', () => {
      expect_deepEqual(both('?'), ['', '?']);
      expect_deepEqual(both('?/?'), ['', '?/?']);
      expect_deepEqual(both('??'), ['', '??']);
      expect_deepEqual(both('???'), ['', '???']);
      expect_deepEqual(both('?a'), ['', '?a']);
      expect_deepEqual(both('?b'), ['', '?b']);
      expect_deepEqual(both('a?b'), ['', 'a?b']);
      expect_deepEqual(both('a/?/c.js'), ['a', '?/c.js']);
      expect_deepEqual(both('a/?/c.md'), ['a', '?/c.md']);
      expect_deepEqual(both('a/?/c/?/*/f.js'), ['a', '?/c/?/*/f.js']);
      expect_deepEqual(both('a/?/c/?/*/f.md'), ['a', '?/c/?/*/f.md']);
      expect_deepEqual(both('a/?/c/?/e.js'), ['a', '?/c/?/e.js']);
      expect_deepEqual(both('a/?/c/?/e.md'), ['a', '?/c/?/e.md']);
      expect_deepEqual(both('a/?/c/???/e.js'), ['a', '?/c/???/e.js']);
      expect_deepEqual(both('a/?/c/???/e.md'), ['a', '?/c/???/e.md']);
      expect_deepEqual(both('a/??/c.js'), ['a', '??/c.js']);
      expect_deepEqual(both('a/??/c.md'), ['a', '??/c.md']);
      expect_deepEqual(both('a/???/c.js'), ['a', '???/c.js']);
      expect_deepEqual(both('a/???/c.md'), ['a', '???/c.md']);
      expect_deepEqual(both('a/????/c.js'), ['a', '????/c.js']);
    });

    test('should support non-glob patterns', () => {
      expect_deepEqual(both(''), ['', '']);
      expect_deepEqual(both('.'), ['.', '']);
      expect_deepEqual(both('a'), ['a', '']);
      expect_deepEqual(both('.a'), ['.a', '']);
      expect_deepEqual(both('/a'), ['/a', '']);
      expect_deepEqual(both('a/'), ['a/', '']);
      expect_deepEqual(both('/a/'), ['/a/', '']);
      expect_deepEqual(both('/a/b/c'), ['/a/b/c', '']);
      expect_deepEqual(both('/a/b/c/'), ['/a/b/c/', '']);
      expect_deepEqual(both('a/b/c/'), ['a/b/c/', '']);
      expect_deepEqual(both('a.min.js'), ['a.min.js', '']);
      expect_deepEqual(both('a/.x.md'), ['a/.x.md', '']);
      expect_deepEqual(both('a/b/.gitignore'), ['a/b/.gitignore', '']);
      expect_deepEqual(both('a/b/c/d.md'), ['a/b/c/d.md', '']);
      expect_deepEqual(both('a/b/c/d.e.f/g.min.js'), ['a/b/c/d.e.f/g.min.js', '']);
      expect_deepEqual(both('a/b/.git'), ['a/b/.git', '']);
      expect_deepEqual(both('a/b/.git/'), ['a/b/.git/', '']);
      expect_deepEqual(both('a/b/c'), ['a/b/c', '']);
      expect_deepEqual(both('a/b/c.d/e.md'), ['a/b/c.d/e.md', '']);
      expect_deepEqual(both('a/b/c.md'), ['a/b/c.md', '']);
      expect_deepEqual(both('a/b/c.min.js'), ['a/b/c.min.js', '']);
      expect_deepEqual(both('a/b/git/'), ['a/b/git/', '']);
      expect_deepEqual(both('aa'), ['aa', '']);
      expect_deepEqual(both('ab'), ['ab', '']);
      expect_deepEqual(both('bb'), ['bb', '']);
      expect_deepEqual(both('c.md'), ['c.md', '']);
      expect_deepEqual(both('foo'), ['foo', '']);
    });
  });

  describe('braces', () => {
    test('should recognize brace sets', () => {
      expect_equal(base('path/{to,from}'), 'path');
      expect_equal(base('path/{foo,bar}/'), 'path');
      expect_equal(base('js/{src,test}/*.js'), 'js');
      expect_equal(base('{a,b}'), '');
      expect_equal(base('/{a,b}'), '/');
      expect_equal(base('/{a,b}/'), '/');
    });

    test('should recognize brace ranges', () => {
      expect_equal(base('js/test{0..9}/*.js'), 'js');
    });

    test('should respect brace enclosures with embedded separators', () => {
      const opts = { unescape: true };
      expect_equal(base('path/{,/,bar/baz,qux}/', opts), 'path');
      expect_equal(base('path/\\{,/,bar/baz,qux}/', opts), 'path/{,/,bar/baz,qux}/');
      expect_equal(base('path/\\{,/,bar/baz,qux\\}/', opts), 'path/{,/,bar/baz,qux}/');
      expect_equal(base('/{,/,bar/baz,qux}/', opts), '/');
      expect_equal(base('/\\{,/,bar/baz,qux}/', opts), '/{,/,bar/baz,qux}/');
      expect_equal(base('{,/,bar/baz,qux}', opts), '');
      expect_equal(base('\\{,/,bar/baz,qux\\}', opts), '{,/,bar/baz,qux}');
      expect_equal(base('\\{,/,bar/baz,qux}/', opts), '{,/,bar/baz,qux}/');
    });

    test('should handle escaped nested braces', () => {
      const opts = { unescape: true };
      expect_equal(base('\\{../,./,\\{bar,/baz},qux}', opts), '{../,./,{bar,/baz},qux}');
      expect_equal(base('\\{../,./,\\{bar,/baz},qux}/', opts), '{../,./,{bar,/baz},qux}/');
      expect_equal(base('path/\\{,/,bar/{baz,qux}}/', opts), 'path/{,/,bar/{baz,qux}}/');
      expect_equal(base('path/\\{../,./,\\{bar,/baz},qux}/', opts), 'path/{../,./,{bar,/baz},qux}/');
      expect_equal(base('path/\\{../,./,\\{bar,/baz},qux}/', opts), 'path/{../,./,{bar,/baz},qux}/');
      expect_equal(base('path/\\{../,./,{bar,/baz},qux}/', opts), 'path/{../,./,{bar,/baz},qux}/');
      expect_equal(base('path/{,/,bar/\\{baz,qux}}/', opts), 'path');
    });

    test('should recognize escaped braces', () => {
      const opts = { unescape: true };
      expect_equal(base('\\{foo,bar\\}', opts), '{foo,bar}');
      expect_equal(base('\\{foo,bar\\}/', opts), '{foo,bar}/');
      expect_equal(base('\\{foo,bar}/', opts), '{foo,bar}/');
      expect_equal(base('path/\\{foo,bar}/', opts), 'path/{foo,bar}/');
    });

    test('should get a base name from a complex brace glob', () => {
      expect_equal(base('one/{foo,bar}/**/{baz,qux}/*.txt'), 'one');
      expect_equal(base('two/baz/**/{abc,xyz}/*.js'), 'two/baz');
      expect_equal(base('foo/{bar,baz}/**/aaa/{bbb,ccc}'), 'foo');
    });

    test('should support braces: no path', () => {
      expect_deepEqual(both('/a/b/{c,/foo.js}/e.f.g/'), ['/a/b', '{c,/foo.js}/e.f.g/']);
      expect_deepEqual(both('{a/b/c.js,/a/b/{c,/foo.js}/e.f.g/}'), ['', '{a/b/c.js,/a/b/{c,/foo.js}/e.f.g/}']);
      expect_deepEqual(both('/a/b/{c,d}/'), ['/a/b', '{c,d}/']);
      expect_deepEqual(both('/a/b/{c,d}/*.js'), ['/a/b', '{c,d}/*.js']);
      expect_deepEqual(both('/a/b/{c,d}/*.min.js'), ['/a/b', '{c,d}/*.min.js']);
      expect_deepEqual(both('/a/b/{c,d}/e.f.g/'), ['/a/b', '{c,d}/e.f.g/']);
      expect_deepEqual(both('{.,*}'), ['', '{.,*}']);
    });

    test('should support braces in filename', () => {
      expect_deepEqual(both('a/b/.{c,.gitignore}'), ['a/b', '.{c,.gitignore}']);
      expect_deepEqual(both('a/b/.{c,/.gitignore}'), ['a/b', '.{c,/.gitignore}']);
      expect_deepEqual(both('a/b/.{foo,bar}'), ['a/b', '.{foo,bar}']);
      expect_deepEqual(both('a/b/{c,.gitignore}'), ['a/b', '{c,.gitignore}']);
      expect_deepEqual(both('a/b/{c,/.gitignore}'), ['a/b', '{c,/.gitignore}']);
      expect_deepEqual(both('a/b/{c,/gitignore}'), ['a/b', '{c,/gitignore}']);
      expect_deepEqual(both('a/b/{c,d}'), ['a/b', '{c,d}']);
    });

    test('should support braces in dirname', () => {
      expect_deepEqual(both('a/b/{c,./d}/e/f.g'), ['a/b', '{c,./d}/e/f.g']);
      expect_deepEqual(both('a/b/{c,./d}/e/f.min.g'), ['a/b', '{c,./d}/e/f.min.g']);
      expect_deepEqual(both('a/b/{c,.gitignore,{a,./b}}/{a,b}/abc.foo.js'), ['a/b', '{c,.gitignore,{a,./b}}/{a,b}/abc.foo.js']);
      expect_deepEqual(both('a/b/{c,.gitignore,{a,b}}/{a,b}/*.foo.js'), ['a/b', '{c,.gitignore,{a,b}}/{a,b}/*.foo.js']);
      expect_deepEqual(both('a/b/{c,.gitignore,{a,b}}/{a,b}/abc.foo.js'), ['a/b', '{c,.gitignore,{a,b}}/{a,b}/abc.foo.js']);
      expect_deepEqual(both('a/b/{c,/d}/e/f.g'), ['a/b', '{c,/d}/e/f.g']);
      expect_deepEqual(both('a/b/{c,/d}/e/f.min.g'), ['a/b', '{c,/d}/e/f.min.g']);
      expect_deepEqual(both('a/b/{c,d}/'), ['a/b', '{c,d}/']);
      expect_deepEqual(both('a/b/{c,d}/*.js'), ['a/b', '{c,d}/*.js']);
      expect_deepEqual(both('a/b/{c,d}/*.min.js'), ['a/b', '{c,d}/*.min.js']);
      expect_deepEqual(both('a/b/{c,d}/e.f.g/'), ['a/b', '{c,d}/e.f.g/']);
      expect_deepEqual(both('a/b/{c,d}/e/f.g'), ['a/b', '{c,d}/e/f.g']);
      expect_deepEqual(both('a/b/{c,d}/e/f.min.g'), ['a/b', '{c,d}/e/f.min.g']);
      expect_deepEqual(both('foo/{a,b}.min.js'), ['foo', '{a,b}.min.js']);
    });
  });
});
