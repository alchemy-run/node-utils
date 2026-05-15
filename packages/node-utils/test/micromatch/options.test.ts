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


import path from "node:path";
const mm = micromatch;
const mi = require('minimatch');

if (!process.env.ORIGINAL_PATH_SEP) {
  process.env.ORIGINAL_PATH_SEP = path.sep
}

describe('options', () => {
  beforeEach(() => (path.sep = '\\'));
  afterEach(() => (path.sep = process.env.ORIGINAL_PATH_SEP));
  after(() => (path.sep = process.env.ORIGINAL_PATH_SEP));

  describe('options.failglob (from Bash 4.3 tests)', () => {
    test('should throw an error when no matches are found:', () => {
      expect_throws(() => mm(['foo'], '\\^', { failglob: true }), /No matches found for/);
    });
  });

  describe('options.ignore', () => {
    let negations = ['a/a', 'a/b', 'a/c', 'a/d', 'a/e', 'b/a', 'b/b', 'b/c'];
    let globs = ['.a', '.a/a', '.a/a/a', '.a/a/a/a', 'a', 'a/.a', 'a/a', 'a/a/.a', 'a/a/a', 'a/a/a/a', 'a/a/a/a/a', 'a/a/b', 'a/b', 'a/b/c', 'a/c', 'a/x', 'b', 'b/b/b', 'b/b/c', 'c/c/c', 'e/f/g', 'h/i/a', 'x/x/x', 'x/y', 'z/z', 'z/z/z'];

    test('should filter out ignored patterns', () => {
      let opts = { ignore: ['a/**'], strictSlashes: true };
      let dotOpts = { ...opts, dot: true };

      expect_deepEqual(mm(globs, '*', opts), ['a', 'b']);
      expect_deepEqual(mm(globs, '*', { ...opts, strictSlashes: false }), ['b']);
      expect_deepEqual(mm(globs, '*', { ignore: '**/a' }), ['b']);
      expect_deepEqual(mm(globs, '*/*', opts), ['x/y', 'z/z']);
      expect_deepEqual(mm(globs, '*/*/*', opts), ['b/b/b', 'b/b/c', 'c/c/c', 'e/f/g', 'h/i/a', 'x/x/x', 'z/z/z']);
      expect_deepEqual(mm(globs, '*/*/*/*', opts), []);
      expect_deepEqual(mm(globs, '*/*/*/*/*', opts), []);
      expect_deepEqual(mm(globs, 'a/*', opts), []);
      expect_deepEqual(mm(globs, '**/*/x', opts), ['x/x/x']);
      expect_deepEqual(mm(globs, '**/*/[b-z]', opts), ['b/b/b', 'b/b/c', 'c/c/c', 'e/f/g', 'x/x/x', 'x/y', 'z/z', 'z/z/z']);

      expect_deepEqual(mm(globs, '*', { ignore: '**/a', dot: true }), ['.a', 'b']);
      expect_deepEqual(mm(globs, '*', dotOpts), ['.a', 'a', 'b']);
      expect_deepEqual(mm(globs, '*/*', dotOpts), ['.a/a', 'x/y', 'z/z']);
      expect_deepEqual(mm(globs, '*/*/*', dotOpts), ['.a/a/a', 'b/b/b', 'b/b/c', 'c/c/c', 'e/f/g', 'h/i/a', 'x/x/x', 'z/z/z']);
      expect_deepEqual(mm(globs, '*/*/*/*', dotOpts), ['.a/a/a/a']);
      expect_deepEqual(mm(globs, '*/*/*/*/*', dotOpts), []);
      expect_deepEqual(mm(globs, 'a/*', dotOpts), []);
      expect_deepEqual(mm(globs, '**/*/x', dotOpts), ['x/x/x']);

      // see https://github.com/jonschlinkert/micromatch/issues/79
      expect_deepEqual(mm(['foo.js', 'a/foo.js'], '**/foo.js'), ['foo.js', 'a/foo.js']);
      expect_deepEqual(mm(['foo.js', 'a/foo.js'], '**/foo.js', { dot: true }), ['foo.js', 'a/foo.js']);

      expect_deepEqual(mm(negations, '!b/a', opts), ['b/b', 'b/c']);
      expect_deepEqual(mm(negations, '!b/(a)', opts), ['b/b', 'b/c']);
      expect_deepEqual(mm(negations, '!(b/(a))', opts), ['b/b', 'b/c']);
      expect_deepEqual(mm(negations, '!(b/a)', opts), ['b/b', 'b/c']);

      expect_deepEqual(mm(negations, '**'), negations, 'nothing is ignored');
      expect_deepEqual(mm(negations, '**', { ignore: ['*/b', '*/a'] }), ['a/c', 'a/d', 'a/e', 'b/c']);
      expect_deepEqual(mm(negations, '**', { ignore: ['**'] }), []);
    });
  });

  describe('options.matchBase', () => {
    test('should match the basename of file paths when `options.matchBase` is true', () => {
      expect_deepEqual(mm(['a/b/c/d.md'], '*.md'), [], 'should not match multiple levels');
      expect_deepEqual(mm(['a/b/c/foo.md'], '*.md'), [], 'should not match multiple levels');
      expect_deepEqual(mm(['ab', 'acb', 'acb/', 'acb/d/e', 'x/y/acb', 'x/y/acb/d'], 'a?b'), ['acb'], 'should not match multiple levels');
      expect_deepEqual(mm(['a/b/c/d.md'], '*.md', { matchBase: true }), ['a/b/c/d.md']);
      expect_deepEqual(mm(['a/b/c/foo.md'], '*.md', { matchBase: true }), ['a/b/c/foo.md']);
      expect_deepEqual(mm(['x/y/acb', 'acb/', 'acb/d/e', 'x/y/acb/d'], 'a?b', { matchBase: true }), ['x/y/acb', 'acb/']);
    });

    test('should work with negation patterns', () => {
      expect_truthy(mm.isMatch('./x/y.js', '*.js', { matchBase: true }));
      expect_truthy(!mm.isMatch('./x/y.js', '!*.js', { matchBase: true }));
      expect_truthy(mm.isMatch('./x/y.js', '**/*.js', { matchBase: true }));
      expect_truthy(!mm.isMatch('./x/y.js', '!**/*.js', { matchBase: true }));
    });
  });

  describe('options.flags', () => {
    test('should be case-sensitive by default', () => {
      expect_deepEqual(mm(['a/b/d/e.md'], 'a/b/D/*.md'), [], 'should not match a dirname');
      expect_deepEqual(mm(['a/b/c/e.md'], 'A/b/*/E.md'), [], 'should not match a basename');
      expect_deepEqual(mm(['a/b/c/e.md'], 'A/b/C/*.MD'), [], 'should not match a file extension');
    });

    test('should not be case-sensitive when `i` is set on `options.flags`', () => {
      expect_deepEqual(mm(['a/b/d/e.md'], 'a/b/D/*.md', { flags: 'i' }), ['a/b/d/e.md']);
      expect_deepEqual(mm(['a/b/c/e.md'], 'A/b/*/E.md', { flags: 'i' }), ['a/b/c/e.md']);
      expect_deepEqual(mm(['a/b/c/e.md'], 'A/b/C/*.MD', { flags: 'i' }), ['a/b/c/e.md']);
    });
  });

  describe('options.nobrace', () => {
    test('should not expand braces when disabled', () => {
      expect_deepEqual(mm(['a', 'b', 'c'], '{a,b,c,d}'), ['a', 'b', 'c']);
      expect_deepEqual(mm(['a', 'b', 'c'], '{a,b,c,d}', { nobrace: true }), []);
      expect_deepEqual(mm(['1', '2', '3'], '{1..2}', { nobrace: true }), []);
    });
  });

  describe('options.nocase', () => {
    test('should not be case-sensitive when `options.nocase` is true', () => {
      expect_deepEqual(mm(['a/b/c/e.md'], 'A/b/*/E.md', { nocase: true }), ['a/b/c/e.md']);
      expect_deepEqual(mm(['a/b/c/e.md'], 'A/b/C/*.MD', { nocase: true }), ['a/b/c/e.md']);
      expect_deepEqual(mm(['a/b/c/e.md'], 'A/b/C/*.md', { nocase: true }), ['a/b/c/e.md']);
      expect_deepEqual(mm(['a/b/d/e.md'], 'a/b/D/*.md', { nocase: true }), ['a/b/d/e.md']);
    });

    test('should not double-set `i` when both `nocase` and the `i` flag are set', () => {
      let opts = { nocase: true, flags: 'i' };
      expect_deepEqual(mm(['a/b/d/e.md'], 'a/b/D/*.md', opts), ['a/b/d/e.md']);
      expect_deepEqual(mm(['a/b/c/e.md'], 'A/b/*/E.md', opts), ['a/b/c/e.md']);
      expect_deepEqual(mm(['a/b/c/e.md'], 'A/b/C/*.MD', opts), ['a/b/c/e.md']);
    });
  });

  describe('options.noextglob', () => {
    test('should match literal parens when noextglob is true (issue #116)', () => {
      expect_truthy(mm.isMatch('a/(dir)', 'a/(dir)', { noextglob: true }));
    });

    test('should not match extglobs when noextglob is true', () => {
      expect_truthy(!mm.isMatch('ax', '?(a*|b)', { noextglob: true }));
      expect_deepEqual(mm(['a.j.js', 'a.md.js'], '*.*(j).js', { noextglob: true }), ['a.j.js']);
      expect_deepEqual(mm(['a/z', 'a/b', 'a/!(z)'], 'a/!(z)', { noextglob: true }), ['a/!(z)']);
      expect_deepEqual(mm(['a/z', 'a/b'], 'a/!(z)', { noextglob: true }), []);
      expect_deepEqual(mm(['c/a/v'], 'c/!(z)/v', { noextglob: true }), []);
      expect_deepEqual(mm(['c/z/v', 'c/a/v'], 'c/!(z)/v', { noextglob: true }), []);
      expect_deepEqual(mm(['c/z/v', 'c/a/v'], 'c/@(z)/v', { noextglob: true }), []);
      expect_deepEqual(mm(['c/z/v', 'c/a/v'], 'c/+(z)/v', { noextglob: true }), []);
      expect_deepEqual(mm(['c/z/v', 'c/a/v'], 'c/*(z)/v', { noextglob: true }), ['c/z/v']);
      expect_deepEqual(mm(['c/z/v', 'z', 'zf', 'fz'], '?(z)', { noextglob: true }), ['fz']);
      expect_deepEqual(mm(['c/z/v', 'z', 'zf', 'fz'], '+(z)', { noextglob: true }), []);
      expect_deepEqual(mm(['c/z/v', 'z', 'zf', 'fz'], '*(z)', { noextglob: true }), ['z', 'fz']);
      expect_deepEqual(mm(['cz', 'abz', 'az'], 'a@(z)', { noextglob: true }), []);
      expect_deepEqual(mm(['cz', 'abz', 'az'], 'a*@(z)', { noextglob: true }), []);
      expect_deepEqual(mm(['cz', 'abz', 'az'], 'a!(z)', { noextglob: true }), []);
      expect_deepEqual(mm(['cz', 'abz', 'az', 'azz'], 'a?(z)', { noextglob: true }), ['abz', 'azz']);
      expect_deepEqual(mm(['cz', 'abz', 'az', 'azz', 'a+z'], 'a+(z)', { noextglob: true }), ['a+z']);
      expect_deepEqual(mm(['cz', 'abz', 'az'], 'a*(z)', { noextglob: true }), ['abz', 'az']);
      expect_deepEqual(mm(['cz', 'abz', 'az'], 'a**(z)', { noextglob: true }), ['abz', 'az']);
      expect_deepEqual(mm(['cz', 'abz', 'az'], 'a*!(z)', { noextglob: true }), []);
    });
  });

  describe('options.nodupes', () => {
    beforeEach(() => {
      path.sep = '\\';
    });
    afterEach(() => {
      path.sep = process.env.ORIGINAL_PATH_SEP;
    });

    test('should remove duplicate elements from the result array:', () => {
      let fixtures = ['.editorconfig', '.git', '.gitignore', '.nyc_output', '.travis.yml', '.verb.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'LICENSE', 'coverage', 'example.js', 'example.md', 'example.css', 'index.js', 'node_modules', 'package.json', 'test.js', 'utils.js'];
      expect_deepEqual(mm(['abc', '/a/b/c', '\\a\\b\\c'], '/a/b/c', { windows: true }), ['/a/b/c']);
      expect_deepEqual(mm(['abc', '/a/b/c', '\\a\\b\\c'], '\\a\\b\\c', { windows: true }), ['/a/b/c']);
      expect_deepEqual(mm(['abc', '/a/b/c', '\\a\\b\\c'], '/a/b/c', { windows: true, nodupes: true }), ['/a/b/c']);
      expect_deepEqual(mm(['abc', '/a/b/c', '\\a\\b\\c'], '\\a\\b\\c', { windows: true, nodupes: true }), ['/a/b/c']);
      expect_deepEqual(mm(fixtures, ['example.*', '*.js'], { windows: true, nodupes: true }), ['example.js', 'example.md', 'example.css', 'index.js', 'test.js', 'utils.js']);
    });

    test('should not remove duplicates', () => {
      expect_deepEqual(mm(['abc', '/a/b/c', '\\a\\b\\c'], '/a/b/c'), ['/a/b/c']);
      expect_deepEqual(mm(['abc', '/a/b/c', '\\a\\b\\c'], '/a/b/c', { nodupes: true }), ['/a/b/c']);
      expect_deepEqual(mm(['abc', '/a/b/c', '\\a\\b\\c'], '/a/b/c', { windows: true, nodupes: true }), ['/a/b/c']);
    });
  });

  describe('options.nonegate', () => {
    test('should support the `nonegate` option:', () => {
      expect_deepEqual(mm(['a/a/a', 'a/b/a', 'b/b/a', 'c/c/a', 'c/c/b'], '!**/a'), ['c/c/b']);
      expect_deepEqual(mm(['a.md', '!a.md', 'a.txt'], '!*.md', { nonegate: true }), ['!a.md']);

      // this should not return more than one nested directory, since "!**/a" is
      // collapsed to "!*/a", given that "**" is not the only thing in the segment.
      expect_deepEqual(mm(['!a/a/a', 'a/b/a', 'b/b/a', '!c/c/a', '!a/a'], '!**/a', { nonegate: true }), ['!a/a']);
      expect_deepEqual(mm(['!*.md', '.dotfile.txt', 'a/b/.dotfile'], '!*.md', { nonegate: true }), ['!*.md']);
    });
  });

  describe('options.nonull', () => {
    test('should support the `nonull` option:', () => {
      expect_deepEqual(mm(['*', '\\*'], '\\*', { nonull: true }), ['*', '\\*']);
      expect_deepEqual(mm(['*', '\\^'], '\\^', { nonull: true }), ['\\^']);
      expect_deepEqual(mm(['*', 'a\\*'], 'a\\*', { nonull: true }), ['a\\*']);
    });
  });

  describe('options.windows', () => {
    test('should windows file paths by default', () => {
      expect_deepEqual(mm(['a\\b\\c.md'], '**/*.md'), ['a/b/c.md']);
      expect_deepEqual(mm(['a\\b\\c.md'], '**\\\\*.md', { windows: false }), ['a\\b\\c.md']);
    });

    test('should windows absolute paths', () => {
      expect_deepEqual(mm(['E:\\a\\b\\c.md'], 'E:/**/*.md'), ['E:/a/b/c.md']);
      expect_deepEqual(mm(['E:\\a\\b\\c.md'], 'E:/**/*.md', { windows: false }), []);
    });

    test('should strip leading `./`', () => {
      let fixtures = ['./a', './a/a/a', './a/a/a/a', './a/a/a/a/a', './a/b', './a/x', './z/z', 'a', 'a/a', 'a/a/b', 'a/c', 'b', 'x/y'].sort();
      let format = str => str.replace(/^\.\//, '');
      let opts = { format };
      expect_deepEqual(mm(fixtures, '*', opts), ['a', 'b']);
      expect_deepEqual(mm(fixtures, '**/a/**', opts), ['a', 'a/a/a', 'a/a/a/a', 'a/a/a/a/a', 'a/b', 'a/x', 'a/a', 'a/a/b', 'a/c']);
      expect_deepEqual(mm(fixtures, '*/*', opts), ['a/b', 'a/x', 'z/z', 'a/a', 'a/c', 'x/y']);
      expect_deepEqual(mm(fixtures, '*/*/*', opts), ['a/a/a', 'a/a/b']);
      expect_deepEqual(mm(fixtures, '*/*/*/*', opts), ['a/a/a/a']);
      expect_deepEqual(mm(fixtures, '*/*/*/*/*', opts), ['a/a/a/a/a']);
      expect_deepEqual(mm(fixtures, './*', opts), ['a', 'b']);
      expect_deepEqual(mm(fixtures, './**/a/**', opts), ['a', 'a/a/a', 'a/a/a/a', 'a/a/a/a/a', 'a/b', 'a/x', 'a/a', 'a/a/b', 'a/c']);
      expect_deepEqual(mm(fixtures, 'a/*/a', opts), ['a/a/a']);
      expect_deepEqual(mm(fixtures, 'a/*', opts), ['a/b', 'a/x', 'a/a', 'a/c']);
      expect_deepEqual(mm(fixtures, 'a/*/*', opts), ['a/a/a', 'a/a/b']);
      expect_deepEqual(mm(fixtures, 'a/*/*/*', opts), ['a/a/a/a']);
      expect_deepEqual(mm(fixtures, 'a/*/*/*/*', opts), ['a/a/a/a/a']);
      expect_deepEqual(mm(fixtures, 'a/*/a', opts), ['a/a/a']);

      expect_deepEqual(mm(fixtures, '*', { ...opts, windows: false }), ['a', 'b']);
      expect_deepEqual(mm(fixtures, '**/a/**', { ...opts, windows: false }), ['a', 'a/a/a', 'a/a/a/a', 'a/a/a/a/a', 'a/b', 'a/x', 'a/a', 'a/a/b', 'a/c']);
      expect_deepEqual(mm(fixtures, '*/*', { ...opts, windows: false }), ['a/b', 'a/x', 'z/z', 'a/a', 'a/c', 'x/y']);
      expect_deepEqual(mm(fixtures, '*/*/*', { ...opts, windows: false }), ['a/a/a', 'a/a/b']);
      expect_deepEqual(mm(fixtures, '*/*/*/*', { ...opts, windows: false }), ['a/a/a/a']);
      expect_deepEqual(mm(fixtures, '*/*/*/*/*', { ...opts, windows: false }), ['a/a/a/a/a']);
      expect_deepEqual(mm(fixtures, './*', { ...opts, windows: false }), ['a', 'b']);
      expect_deepEqual(mm(fixtures, './**/a/**', { ...opts, windows: false }), ['a', 'a/a/a', 'a/a/a/a', 'a/a/a/a/a', 'a/b', 'a/x', 'a/a', 'a/a/b', 'a/c']);
      expect_deepEqual(mm(fixtures, './a/*/a', { ...opts, windows: false }), ['a/a/a']);
      expect_deepEqual(mm(fixtures, 'a/*', { ...opts, windows: false }), ['a/b', 'a/x', 'a/a', 'a/c']);
      expect_deepEqual(mm(fixtures, 'a/*/*', { ...opts, windows: false }), ['a/a/a', 'a/a/b']);
      expect_deepEqual(mm(fixtures, 'a/*/*/*', { ...opts, windows: false }), ['a/a/a/a']);
      expect_deepEqual(mm(fixtures, 'a/*/*/*/*', { ...opts, windows: false }), ['a/a/a/a/a']);
      expect_deepEqual(mm(fixtures, 'a/*/a', { ...opts, windows: false }), ['a/a/a']);
    });
  });

  describe('options.dot', () => {
    describe('when `dot` or `dotfile` is NOT true:', () => {
      test('should not match dotfiles by default:', () => {
        let format = str => str.replace(/^\.\//, '');
        let opts = { format, result: format };

        expect_deepEqual(mm(['.dotfile'], '*'), []);
        expect_deepEqual(mm(['.dotfile'], '**'), []);
        expect_deepEqual(mm(['a/b/c/.dotfile.md'], '*.md'), []);
        expect_deepEqual(mm(['a/b', 'a/.b', '.a/b', '.a/.b'], '**'), ['a/b']);
        expect_deepEqual(mm(['a/b/c/.dotfile'], '*.*'), []);

        // https://github.com/isaacs/minimatch/issues/30
        expect_deepEqual(mm(['foo/bar.js'], '**/foo/**', opts), ['foo/bar.js']);
        expect_deepEqual(mm(['./foo/bar.js'], './**/foo/**', opts), ['foo/bar.js']);
        expect_deepEqual(mm(['./foo/bar.js'], '**/foo/**', opts), ['foo/bar.js']);
        expect_deepEqual(mm(['./foo/bar.js'], './**/foo/**', { ...opts, windows: false }), ['foo/bar.js']);
        expect_deepEqual(mm(['./foo/bar.js'], '**/foo/**', { ...opts, windows: false }), ['foo/bar.js']);
      });

      test('should match dotfiles when a leading dot is defined in the path:', () => {
        expect_deepEqual(mm(['a/b/c/.dotfile.md'], '**/.*'), ['a/b/c/.dotfile.md']);
        expect_deepEqual(mm(['a/b/c/.dotfile.md'], '**/.*.md'), ['a/b/c/.dotfile.md']);
      });

      test('should use negation patterns on dotfiles:', () => {
        expect_deepEqual(mm(['.a', '.b', 'c', 'c.md'], '!.*'), ['c', 'c.md']);
        expect_deepEqual(mm(['.a', '.b', 'c', 'c.md'], '!.b'), ['.a', 'c', 'c.md']);
      });
    });
  });

  describe('windows', () => {
    test('should windows file paths', () => {
      expect_deepEqual(mm(['a\\b\\c.md'], '**/*.md'), ['a/b/c.md']);
      expect_deepEqual(mm(['a\\b\\c.md'], '**/*.md', { windows: false }), ['a\\b\\c.md']);
      expect_deepEqual(mm(['a\\b\\c.md'], '**\\\\*.md', { windows: false }), ['a\\b\\c.md']);
    });

    test('should windows absolute paths', () => {
      expect_deepEqual(mm(['E:\\a\\b\\c.md'], 'E:/**/*.md'), ['E:/a/b/c.md']);
      expect_deepEqual(mm(['E:\\a\\b\\c.md'], 'E:/**/*.md', { windows: false }), []);
    });
  });
});
