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


const { isMatch, makeRe } = picomatch;

/**
 * Ported from Bash 4.3 and 4.4 unit tests
 */

describe('extglobs', () => {
  test('should throw on imbalanced sets when `optionsBrackets` is true', () => {
    const opts = { strictBrackets: true };
    expect_throws(() => makeRe('a(b', opts), /Missing closing: "\)"/i);
    expect_throws(() => makeRe('a)b', opts), /Missing opening: "\("/i);
  });

  test('should escape special characters immediately following opening parens', () => {
    expect_truthy(isMatch('cbz', 'c!(.)z'));
    expect_truthy(!isMatch('cbz', 'c!(*)z'));
    expect_truthy(isMatch('cccz', 'c!(b*)z'));
    expect_truthy(isMatch('cbz', 'c!(+)z'));
    expect_truthy(isMatch('cbz', 'c!(?)z'));
    expect_truthy(isMatch('cbz', 'c!(@)z'));
  });

  test('should not convert capture groups to extglobs', () => {
    expect_equal(makeRe('c!(?:foo)?z').source, '^(?:c!(?:foo)?z)$');
    expect_truthy(!isMatch('c/z', 'c!(?:foo)?z'));
    expect_truthy(isMatch('c!fooz', 'c!(?:foo)?z'));
    expect_truthy(isMatch('c!z', 'c!(?:foo)?z'));
  });

  describe('negation', () => {
    test('should support negation extglobs as the entire pattern', () => {
      expect_truthy(!isMatch('abc', '!(abc)'));
      expect_truthy(!isMatch('a', '!(a)'));
      expect_truthy(isMatch('aa', '!(a)'));
      expect_truthy(isMatch('b', '!(a)'));
    });

    test('should support negation extglobs as part of a pattern', () => {
      expect_truthy(isMatch('aac', 'a!(b)c'));
      expect_truthy(!isMatch('abc', 'a!(b)c'));
      expect_truthy(isMatch('acc', 'a!(b)c'));
      expect_truthy(isMatch('abz', 'a!(z)'));
      expect_truthy(!isMatch('az', 'a!(z)'));
    });

    test('should support excluding dots with negation extglobs', () => {
      expect_truthy(!isMatch('a.', 'a!(.)'));
      expect_truthy(!isMatch('.a', '!(.)a'));
      expect_truthy(!isMatch('a.c', 'a!(.)c'));
      expect_truthy(isMatch('abc', 'a!(.)c'));
    });

    // See https://github.com/micromatch/picomatch/issues/83
    test('should support stars in negation extglobs', () => {
      expect_truthy(!isMatch('/file.d.ts', '/!(*.d).ts'));
      expect_truthy(isMatch('/file.ts', '/!(*.d).ts'));
      expect_truthy(isMatch('/file.something.ts', '/!(*.d).ts'));
      expect_truthy(isMatch('/file.d.something.ts', '/!(*.d).ts'));
      expect_truthy(isMatch('/file.dhello.ts', '/!(*.d).ts'));

      expect_truthy(!isMatch('/file.d.ts', '**/!(*.d).ts'));
      expect_truthy(isMatch('/file.ts', '**/!(*.d).ts'));
      expect_truthy(isMatch('/file.something.ts', '**/!(*.d).ts'));
      expect_truthy(isMatch('/file.d.something.ts', '**/!(*.d).ts'));
      expect_truthy(isMatch('/file.dhello.ts', '**/!(*.d).ts'));
    });

    // See https://github.com/micromatch/picomatch/issues/93
    test('should support stars in negation extglobs with expression after closing parenthesis', () => {
      // Nested expression after closing parenthesis
      expect_truthy(!isMatch('/file.d.ts', '/!(*.d).{ts,tsx}'));
      expect_truthy(isMatch('/file.ts', '/!(*.d).{ts,tsx}'));
      expect_truthy(isMatch('/file.something.ts', '/!(*.d).{ts,tsx}'));
      expect_truthy(isMatch('/file.d.something.ts', '/!(*.d).{ts,tsx}'));
      expect_truthy(isMatch('/file.dhello.ts', '/!(*.d).{ts,tsx}'));

      // Extglob after closing parenthesis
      expect_truthy(!isMatch('/file.d.ts', '/!(*.d).@(ts)'));
      expect_truthy(isMatch('/file.ts', '/!(*.d).@(ts)'));
      expect_truthy(isMatch('/file.something.ts', '/!(*.d).@(ts)'));
      expect_truthy(isMatch('/file.d.something.ts', '/!(*.d).@(ts)'));
      expect_truthy(isMatch('/file.dhello.ts', '/!(*.d).@(ts)'));
    });

    test('should support negation extglobs in patterns with slashes', () => {
      expect_truthy(!isMatch('foo/abc', 'foo/!(abc)'));
      expect_truthy(isMatch('foo/bar', 'foo/!(abc)'));

      expect_truthy(!isMatch('a/z', 'a/!(z)'));
      expect_truthy(isMatch('a/b', 'a/!(z)'));

      expect_truthy(!isMatch('c/z/v', 'c/!(z)/v'));
      expect_truthy(isMatch('c/a/v', 'c/!(z)/v'));

      expect_truthy(isMatch('a/a', '!(b/a)'));
      expect_truthy(!isMatch('b/a', '!(b/a)'));

      expect_truthy(!isMatch('foo/bar', '!(!(foo))*'));
      expect_truthy(isMatch('a/a', '!(b/a)'));
      expect_truthy(!isMatch('b/a', '!(b/a)'));

      expect_truthy(isMatch('a/a', '(!(b/a))'));
      expect_truthy(isMatch('a/a', '!((b/a))'));
      expect_truthy(!isMatch('b/a', '!((b/a))'));

      expect_truthy(!isMatch('a/a', '(!(?:b/a))'));
      expect_truthy(!isMatch('b/a', '!((?:b/a))'));

      expect_truthy(isMatch('a/a', '!(b/(a))'));
      expect_truthy(!isMatch('b/a', '!(b/(a))'));

      expect_truthy(isMatch('a/a', '!(b/a)'));
      expect_truthy(!isMatch('b/a', '!(b/a)'));
    });

    test('should not match slashes with extglobs that do not have slashes', () => {
      expect_truthy(!isMatch('c/z', 'c!(z)'));
      expect_truthy(!isMatch('c/z', 'c!(z)z'));
      expect_truthy(!isMatch('c/z', 'c!(.)z'));
      expect_truthy(!isMatch('c/z', 'c!(*)z'));
      expect_truthy(!isMatch('c/z', 'c!(+)z'));
      expect_truthy(!isMatch('c/z', 'c!(?)z'));
      expect_truthy(!isMatch('c/z', 'c!(@)z'));
    });

    test('should support matching slashes with extglobs that have slashes', () => {
      expect_truthy(!isMatch('c/z', 'a!(z)'));
      expect_truthy(!isMatch('c/z', 'c!(.)z'));
      expect_truthy(!isMatch('c/z', 'c!(/)z'));
      expect_truthy(!isMatch('c/z', 'c!(/z)z'));
      expect_truthy(!isMatch('c/b', 'c!(/z)z'));
      expect_truthy(isMatch('c/b/z', 'c!(/z)z'));
    });

    test('should support negation extglobs following !', () => {
      expect_truthy(isMatch('abc',  '!!(abc)'));
      expect_truthy(!isMatch('abc', '!!!(abc)'));
      expect_truthy(isMatch('abc',  '!!!!(abc)'));
      expect_truthy(!isMatch('abc', '!!!!!(abc)'));
      expect_truthy(isMatch('abc',  '!!!!!!(abc)'));
      expect_truthy(!isMatch('abc', '!!!!!!!(abc)'));
      expect_truthy(isMatch('abc',  '!!!!!!!!(abc)'));
    });

    test('should support nested negation extglobs', () => {
      expect_truthy(isMatch('abc',  '!(!(abc))'));
      expect_truthy(!isMatch('abc', '!(!(!(abc)))'));
      expect_truthy(isMatch('abc',  '!(!(!(!(abc))))'));
      expect_truthy(!isMatch('abc', '!(!(!(!(!(abc)))))'));
      expect_truthy(isMatch('abc',  '!(!(!(!(!(!(abc))))))'));
      expect_truthy(!isMatch('abc', '!(!(!(!(!(!(!(abc)))))))'));
      expect_truthy(isMatch('abc',  '!(!(!(!(!(!(!(!(abc))))))))'));

      expect_truthy(isMatch('foo/abc',  'foo/!(!(abc))'));
      expect_truthy(!isMatch('foo/abc', 'foo/!(!(!(abc)))'));
      expect_truthy(isMatch('foo/abc',  'foo/!(!(!(!(abc))))'));
      expect_truthy(!isMatch('foo/abc', 'foo/!(!(!(!(!(abc)))))'));
      expect_truthy(isMatch('foo/abc',  'foo/!(!(!(!(!(!(abc))))))'));
      expect_truthy(!isMatch('foo/abc', 'foo/!(!(!(!(!(!(!(abc)))))))'));
      expect_truthy(isMatch('foo/abc',  'foo/!(!(!(!(!(!(!(!(abc))))))))'));
    });

    test('should support multiple !(...) extglobs in a pattern', () => {
      expect_truthy(!isMatch('moo.cow', '!(moo).!(cow)'));
      expect_truthy(!isMatch('foo.cow', '!(moo).!(cow)'));
      expect_truthy(!isMatch('moo.bar', '!(moo).!(cow)'));
      expect_truthy(isMatch('foo.bar', '!(moo).!(cow)'));

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

      expect_truthy(!isMatch('c/z', 'a*!(z)'));
      expect_truthy(isMatch('abz', 'a*!(z)'));
      expect_truthy(isMatch('az', 'a*!(z)'));

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
    });

    test('should multiple nested negation extglobs', () => {
      expect_truthy(isMatch('moo.cow', '!(!(moo)).!(!(cow))'));
    });

    test('should support logical-or inside negation !(...) extglobs', () => {
      expect_truthy(!isMatch('ac', '!(a|b)c'));
      expect_truthy(!isMatch('bc', '!(a|b)c'));
      expect_truthy(isMatch('cc', '!(a|b)c'));
    });

    test('should support multiple logical-ors negation extglobs', () => {
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

    test('should support nested logical-ors inside negation extglobs', () => {
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
  });

  describe('file extensions', () => {
    test('should support matching file extensions with @(...)', () => {
      expect_truthy(!isMatch('.md', '@(a|b).md'));
      expect_truthy(!isMatch('a.js', '@(a|b).md'));
      expect_truthy(!isMatch('c.md', '@(a|b).md'));
      expect_truthy(isMatch('a.md', '@(a|b).md'));
      expect_truthy(isMatch('b.md', '@(a|b).md'));
    });

    test('should support matching file extensions with +(...)', () => {
      expect_truthy(!isMatch('.md', '+(a|b).md'));
      expect_truthy(!isMatch('a.js', '+(a|b).md'));
      expect_truthy(!isMatch('c.md', '+(a|b).md'));
      expect_truthy(isMatch('a.md', '+(a|b).md'));
      expect_truthy(isMatch('aa.md', '+(a|b).md'));
      expect_truthy(isMatch('ab.md', '+(a|b).md'));
      expect_truthy(isMatch('b.md', '+(a|b).md'));
      expect_truthy(isMatch('bb.md', '+(a|b).md'));
    });

    test('should support matching file extensions with *(...)', () => {
      expect_truthy(!isMatch('a.js', '*(a|b).md'));
      expect_truthy(!isMatch('c.md', '*(a|b).md'));
      expect_truthy(isMatch('.md', '*(a|b).md'));
      expect_truthy(isMatch('a.md', '*(a|b).md'));
      expect_truthy(isMatch('aa.md', '*(a|b).md'));
      expect_truthy(isMatch('ab.md', '*(a|b).md'));
      expect_truthy(isMatch('b.md', '*(a|b).md'));
      expect_truthy(isMatch('bb.md', '*(a|b).md'));
    });

    test('should support matching file extensions with ?(...)', () => {
      expect_truthy(!isMatch('a.js', '?(a|b).md'));
      expect_truthy(!isMatch('bb.md', '?(a|b).md'));
      expect_truthy(!isMatch('c.md', '?(a|b).md'));
      expect_truthy(isMatch('.md', '?(a|b).md'));
      expect_truthy(isMatch('a.md', '?(a|ab|b).md'));
      expect_truthy(isMatch('a.md', '?(a|b).md'));
      expect_truthy(isMatch('aa.md', '?(a|aa|b).md'));
      expect_truthy(isMatch('ab.md', '?(a|ab|b).md'));
      expect_truthy(isMatch('b.md', '?(a|ab|b).md'));

      // See https://github.com/micromatch/micromatch/issues/186
      expect_truthy(isMatch('ab', '+(a)?(b)'));
      expect_truthy(isMatch('aab', '+(a)?(b)'));
      expect_truthy(isMatch('aa', '+(a)?(b)'));
      expect_truthy(isMatch('a', '+(a)?(b)'));
    });
  });

  describe('statechar', () => {
    test('should support ?(...) extglobs ending with statechar', () => {
      expect_truthy(!isMatch('ax', 'a?(b*)'));
      expect_truthy(isMatch('ax', '?(a*|b)'));
    });

    test('should support *(...) extglobs ending with statechar', () => {
      expect_truthy(!isMatch('ax', 'a*(b*)'));
      expect_truthy(isMatch('ax', '*(a*|b)'));
    });

    test('should support @(...) extglobs ending with statechar', () => {
      expect_truthy(!isMatch('ax', 'a@(b*)'));
      expect_truthy(isMatch('ax', '@(a*|b)'));
    });

    test('should support ?(...) extglobs ending with statechar', () => {
      expect_truthy(!isMatch('ax', 'a?(b*)'));
      expect_truthy(isMatch('ax', '?(a*|b)'));
    });

    test('should support !(...) extglobs ending with statechar', () => {
      expect_truthy(isMatch('ax', 'a!(b*)'));
      expect_truthy(!isMatch('ax', '!(a*|b)'));
    });
  });

  test('should match nested directories with negation extglobs', () => {
    expect_truthy(isMatch('a', '!(a/**)'));
    expect_truthy(!isMatch('a/', '!(a/**)'));
    expect_truthy(!isMatch('a/b', '!(a/**)'));
    expect_truthy(!isMatch('a/b/c', '!(a/**)'));
    expect_truthy(isMatch('b', '!(a/**)'));
    expect_truthy(isMatch('b/c', '!(a/**)'));

    expect_truthy(isMatch('a/a', 'a/!(b*)'));
    expect_truthy(!isMatch('a/b', 'a/!(b*)'));
    expect_truthy(!isMatch('a/b/c', 'a/!(b/*)'));
    expect_truthy(!isMatch('a/b/c', 'a/!(b*)'));
    expect_truthy(isMatch('a/c', 'a/!(b*)'));

    expect_truthy(isMatch('a/a/', 'a/!(b*)/**'));
    expect_truthy(isMatch('a/a', 'a/!(b*)'));
    expect_truthy(isMatch('a/a', 'a/!(b*)/**'));
    expect_truthy(!isMatch('a/b', 'a/!(b*)/**'));
    expect_truthy(!isMatch('a/b/c', 'a/!(b*)/**'));
    expect_truthy(isMatch('a/c', 'a/!(b*)/**'));
    expect_truthy(isMatch('a/c', 'a/!(b*)'));
    expect_truthy(isMatch('a/c/', 'a/!(b*)/**'));
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
    expect_truthy(isMatch('a.z', 'a??(z)'));
    expect_truthy(!isMatch('a/z', 'a??(z)'));
    expect_truthy(isMatch('a?', 'a??(z)'));
    expect_truthy(isMatch('ab', 'a??(z)'));
    expect_truthy(!isMatch('a/', 'a??(z)'));

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
    // This one is the only difference, since picomatch does not match empty strings.
    expect_truthy(!isMatch('', '*(0|1|3|5|7|9)'));

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

    expect_truthy(isMatch('abd', 'a!(b|B)'));
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
    expect_truthy(isMatch('a(b', 'a\\(b'));
    expect_truthy(isMatch('a((b', 'a\\(\\(b'));
    expect_truthy(isMatch('a((((b', 'a\\(\\(\\(\\(b'));

    expect_truthy(!isMatch('a(b', 'a\\\\(b'));
    expect_truthy(!isMatch('a((b', 'a\\\\(b'));
    expect_truthy(!isMatch('a((((b', 'a\\\\(b'));
    expect_truthy(!isMatch('ab', 'a\\\\(b'));

    expect_truthy(!isMatch('a/b', 'a\\\\b'));
    expect_truthy(!isMatch('ab', 'a\\\\b'));
  });

  // these are not extglobs, and do not need to pass, but they are included
  // to test integration with other features
  test('should support regex characters', () => {
    const fixtures = ['a c', 'a.c', 'a.xy.zc', 'a.zc', 'a123c', 'a1c', 'abbbbc', 'abbbc', 'abbc', 'abc', 'abq', 'axy zc', 'axy', 'axy.zc', 'axyzc'];

    if (process.platform !== 'win32') {
      expect_deepEqual(match(['a\\b', 'a/b', 'ab'], 'a/b'), ['a/b']);
    }

    expect_deepEqual(match(['a/b', 'ab'], 'a/b'), ['a/b']);
    expect_deepEqual(match(fixtures, 'ab?bc'), ['abbbc']);
    expect_deepEqual(match(fixtures, 'ab*c'), ['abbbbc', 'abbbc', 'abbc', 'abc']);
    expect_deepEqual(match(fixtures, 'a+(b)bc'), ['abbbbc', 'abbbc', 'abbc']);
    expect_deepEqual(match(fixtures, '^abc$'), []);
    expect_deepEqual(match(fixtures, 'a.c'), ['a.c']);
    expect_deepEqual(match(fixtures, 'a.*c'), ['a.c', 'a.xy.zc', 'a.zc']);
    expect_deepEqual(match(fixtures, 'a*c'), ['a c', 'a.c', 'a.xy.zc', 'a.zc', 'a123c', 'a1c', 'abbbbc', 'abbbc', 'abbc', 'abc', 'axy zc', 'axy.zc', 'axyzc']);
    expect_deepEqual(match(fixtures, 'a[\\w]+c'), ['a123c', 'a1c', 'abbbbc', 'abbbc', 'abbc', 'abc', 'axyzc'], 'Should match word characters');
    expect_deepEqual(match(fixtures, 'a[\\W]+c'), ['a c', 'a.c'], 'Should match non-word characters');
    expect_deepEqual(match(fixtures, 'a[\\d]+c'), ['a123c', 'a1c'], 'Should match numbers');
    expect_deepEqual(match(['foo@#$%123ASD #$$%^&', 'foo!@#$asdfl;', '123'], '[\\d]+'), ['123']);
    expect_deepEqual(match(['a123c', 'abbbc'], 'a[\\D]+c'), ['abbbc'], 'Should match non-numbers');
    expect_deepEqual(match(['foo', ' foo '], '(f|o)+\\b'), ['foo'], 'Should match word boundaries');
  });
});

