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


const { isMatch } = picomatch;

describe('invalid (exclusive) dots', () => {
  describe('double dots', () => {
    describe('no options', () => {
      describe('should not match leading double-dots', () => {
        test('with single star', () => {
          expect_truthy(!isMatch('../abc', '*/*'));
          expect_truthy(!isMatch('../abc', '*/abc'));
          expect_truthy(!isMatch('../abc', '*/abc/*'));
        });

        test('with dot + single star', () => {
          expect_truthy(!isMatch('../abc', '.*/*'));
          expect_truthy(!isMatch('../abc', '.*/abc'));

          expect_truthy(!isMatch('../abc', '*./*'));
          expect_truthy(!isMatch('../abc', '*./abc'));
        });

        test('with globstar', () => {
          expect_truthy(!isMatch('../abc', '**'));
          expect_truthy(!isMatch('../abc', '**/**'));
          expect_truthy(!isMatch('../abc', '**/**/**'));

          expect_truthy(!isMatch('../abc', '**/abc'));
          expect_truthy(!isMatch('../abc', '**/abc/**'));

          expect_truthy(!isMatch('../abc', 'abc/**'));
          expect_truthy(!isMatch('../abc', 'abc/**/**'));
          expect_truthy(!isMatch('../abc', 'abc/**/**/**'));

          expect_truthy(!isMatch('../abc', '**/abc'));
          expect_truthy(!isMatch('../abc', '**/abc/**'));
          expect_truthy(!isMatch('../abc', '**/abc/**/**'));

          expect_truthy(!isMatch('../abc', '**/**/abc/**'));
          expect_truthy(!isMatch('../abc', '**/**/abc/**/**'));
        });

        test('with dot + globstar', () => {
          expect_truthy(!isMatch('../abc', '.**'));
          expect_truthy(!isMatch('../abc', '.**/**'));
          expect_truthy(!isMatch('../abc', '.**/abc'));
        });

        test('with globstar + dot + globstar', () => {
          expect_truthy(!isMatch('../abc', '*.*/**'));
          expect_truthy(!isMatch('../abc', '*.*/abc'));
        });

        test('with globstar + dot', () => {
          expect_truthy(!isMatch('../abc', '**./**'));
          expect_truthy(!isMatch('../abc', '**./abc'));
        });
      });

      describe('should not match nested double-dots', () => {
        test('with star', () => {
          expect_truthy(!isMatch('/../abc', '*/*'));
          expect_truthy(!isMatch('/../abc', '/*/*'));
          expect_truthy(!isMatch('/../abc', '*/*/*'));

          expect_truthy(!isMatch('abc/../abc', '*/*/*'));
          expect_truthy(!isMatch('abc/../abc/abc', '*/*/*/*'));
        });

        test('with dot + star', () => {
          expect_truthy(!isMatch('/../abc', '*/.*/*'));
          expect_truthy(!isMatch('/../abc', '/.*/*'));

          expect_truthy(!isMatch('/../abc', '*/*.*/*'));
          expect_truthy(!isMatch('/../abc', '/*.*/*'));

          expect_truthy(!isMatch('/../abc', '*/*./*'));
          expect_truthy(!isMatch('/../abc', '/*./*'));

          expect_truthy(!isMatch('abc/../abc', '*/.*/*'));
          expect_truthy(!isMatch('abc/../abc', '*/*.*/*'));
          expect_truthy(!isMatch('abc/../abc', '*/*./*'));
        });

        test('with globstar', () => {
          expect_truthy(!isMatch('/../abc', '**'));
          expect_truthy(!isMatch('/../abc', '**/**'));
          expect_truthy(!isMatch('/../abc', '/**/**'));
          expect_truthy(!isMatch('/../abc', '**/**/**'));

          expect_truthy(!isMatch('abc/../abc', '**/**/**'));
          expect_truthy(!isMatch('abc/../abc/abc', '**/**/**/**'));
        });

        test('with dot + globstar', () => {
          expect_truthy(!isMatch('/../abc', '**/.**/**'));
          expect_truthy(!isMatch('/../abc', '/.**/**'));

          expect_truthy(!isMatch('abc/../abc', '**/.**/**'));
          expect_truthy(!isMatch('abc/../abc', '/.**/**'));
        });

        test('with globstar + dot', () => {
          expect_truthy(!isMatch('/../abc', '**/**./**'));
          expect_truthy(!isMatch('/../abc', '/**./**'));

          expect_truthy(!isMatch('abc/../abc', '**/**./**'));
          expect_truthy(!isMatch('abc/../abc', '/**./**'));
        });

        test('with globstar + dot + globstar', () => {
          expect_truthy(!isMatch('/../abc', '**/**.**/**'));
          expect_truthy(!isMatch('/../abc', '**/*.*/**'));

          expect_truthy(!isMatch('/../abc', '/**.**/**'));
          expect_truthy(!isMatch('/../abc', '/*.*/**'));

          expect_truthy(!isMatch('abc/../abc', '**/**.**/**'));
          expect_truthy(!isMatch('abc/../abc', '**/*.*/**'));

          expect_truthy(!isMatch('abc/../abc', '/**.**/**'));
          expect_truthy(!isMatch('abc/../abc', '/*.*/**'));
        });
      });

      describe('should not match trailing double-dots', () => {
        test('with single star', () => {
          expect_truthy(!isMatch('abc/..', '*/*'));
          expect_truthy(!isMatch('abc/..', '*/*/'));
          expect_truthy(!isMatch('abc/..', '*/*/*'));

          expect_truthy(!isMatch('abc/../', '*/*'));
          expect_truthy(!isMatch('abc/../', '*/*/'));
          expect_truthy(!isMatch('abc/../', '*/*/*'));

          expect_truthy(!isMatch('abc/../abc/../', '*/*/*/*'));
          expect_truthy(!isMatch('abc/../abc/../', '*/*/*/*/'));
          expect_truthy(!isMatch('abc/../abc/abc/../', '*/*/*/*/*'));
        });

        test('with dot + star', () => {
          expect_truthy(!isMatch('abc/..', '*/.*'));
          expect_truthy(!isMatch('abc/..', '*/.*/'));
          expect_truthy(!isMatch('abc/..', '*/.*/*'));

          expect_truthy(!isMatch('abc/../', '*/.*'));
          expect_truthy(!isMatch('abc/../', '*/.*/'));
          expect_truthy(!isMatch('abc/../', '*/.*/*'));

          expect_truthy(!isMatch('abc/../abc/../', '*/.*/*/.*'));
          expect_truthy(!isMatch('abc/../abc/../', '*/.*/*/.*/'));
          expect_truthy(!isMatch('abc/../abc/abc/../', '*/.*/*/.*/*'));
        });

        test('with star + dot', () => {
          expect_truthy(!isMatch('abc/..', '*/*.'));
          expect_truthy(!isMatch('abc/..', '*/*./'));
          expect_truthy(!isMatch('abc/..', '*/*./*'));

          expect_truthy(!isMatch('abc/../', '*/*.'));
          expect_truthy(!isMatch('abc/../', '*/*./'));
          expect_truthy(!isMatch('abc/../', '*/*./*'));

          expect_truthy(!isMatch('abc/../abc/../', '*/*./*/*.'));
          expect_truthy(!isMatch('abc/../abc/../', '*/*./*/*./'));
          expect_truthy(!isMatch('abc/../abc/abc/../', '*/*./*/*./*'));
        });

        test('with globstar', () => {
          expect_truthy(!isMatch('abc/..', '**/**'));
          expect_truthy(!isMatch('abc/..', '**/**/'));
          expect_truthy(!isMatch('abc/..', '**/**/**'));

          expect_truthy(!isMatch('abc/../', '**/**'));
          expect_truthy(!isMatch('abc/../', '**/**/'));
          expect_truthy(!isMatch('abc/../', '**/**/**'));

          expect_truthy(!isMatch('abc/../abc/../', '**/**/**/**'));
          expect_truthy(!isMatch('abc/../abc/../', '**/**/**/**/'));
          expect_truthy(!isMatch('abc/../abc/abc/../', '**/**/**/**/**'));
        });

        test('with dot + globstar', () => {
          expect_truthy(!isMatch('abc/..', '**/.**'));
          expect_truthy(!isMatch('abc/..', '**/.**/'));
          expect_truthy(!isMatch('abc/..', '**/.**/**'));

          expect_truthy(!isMatch('abc/../', '**/.**'));
          expect_truthy(!isMatch('abc/../', '**/.**/'));
          expect_truthy(!isMatch('abc/../', '**/.**/**'));

          expect_truthy(!isMatch('abc/../abc/../', '**/.**/**/.**'));
          expect_truthy(!isMatch('abc/../abc/../', '**/.**/**/.**/'));
          expect_truthy(!isMatch('abc/../abc/abc/../', '**/.**/**/.**/**'));
        });

        test('with globstar + dot + globstar', () => {
          expect_truthy(!isMatch('abc/..', '**/**.**'));
          expect_truthy(!isMatch('abc/..', '**/**.**/'));
          expect_truthy(!isMatch('abc/..', '**/**.**/**'));

          expect_truthy(!isMatch('abc/../', '**/**.**'));
          expect_truthy(!isMatch('abc/../', '**/**.**/'));
          expect_truthy(!isMatch('abc/../', '**/**.**/**'));

          expect_truthy(!isMatch('abc/../abc/../', '**/**.**/**/**.**'));
          expect_truthy(!isMatch('abc/../abc/../', '**/**.**/**/**.**/'));
          expect_truthy(!isMatch('abc/../abc/abc/../', '**/**.**/**/.**/**'));
        });

        test('with globstar + dot', () => {
          expect_truthy(!isMatch('abc/..', '**/**.'));
          expect_truthy(!isMatch('abc/..', '**/**./'));
          expect_truthy(!isMatch('abc/..', '**/**./**'));

          expect_truthy(!isMatch('abc/../', '**/**.'));
          expect_truthy(!isMatch('abc/../', '**/**./'));
          expect_truthy(!isMatch('abc/../', '**/**./**'));

          expect_truthy(!isMatch('abc/../abc/../', '**/**./**/**.'));
          expect_truthy(!isMatch('abc/../abc/../', '**/**./**/**./'));
          expect_truthy(!isMatch('abc/../abc/abc/../', '**/**./**/**./**'));
        });
      });
    });

    describe('options = { dot: true }', () => {
      describe('should not match leading double-dots', () => {
        test('with single star', () => {
          expect_truthy(!isMatch('../abc', '*/*', { dot: true }));
          expect_truthy(!isMatch('../abc', '*/abc', { dot: true }));
          expect_truthy(!isMatch('../abc', '*/abc/*', { dot: true }));
        });

        test('with dot + single star', () => {
          expect_truthy(!isMatch('../abc', '.*/*', { dot: true }));
          expect_truthy(!isMatch('../abc', '.*/abc', { dot: true }));

          expect_truthy(!isMatch('../abc', '*./*', { dot: true }));
          expect_truthy(!isMatch('../abc', '*./abc', { dot: true }));
        });

        test('with globstar', () => {
          expect_truthy(!isMatch('../abc', '**', { dot: true }));
          expect_truthy(!isMatch('../abc', '**/**', { dot: true }));
          expect_truthy(!isMatch('../abc', '**/**/**', { dot: true }));

          expect_truthy(!isMatch('../abc', '**/abc', { dot: true }));
          expect_truthy(!isMatch('../abc', '**/abc/**', { dot: true }));

          expect_truthy(!isMatch('../abc', 'abc/**', { dot: true }));
          expect_truthy(!isMatch('../abc', 'abc/**/**', { dot: true }));
          expect_truthy(!isMatch('../abc', 'abc/**/**/**', { dot: true }));

          expect_truthy(!isMatch('../abc', '**/abc', { dot: true }));
          expect_truthy(!isMatch('../abc', '**/abc/**', { dot: true }));
          expect_truthy(!isMatch('../abc', '**/abc/**/**', { dot: true }));

          expect_truthy(!isMatch('../abc', '**/**/abc/**', { dot: true }));
          expect_truthy(!isMatch('../abc', '**/**/abc/**/**', { dot: true }));
        });

        test('with dot + globstar', () => {
          expect_truthy(!isMatch('../abc', '.**', { dot: true }));
          expect_truthy(!isMatch('../abc', '.**/**', { dot: true }));
          expect_truthy(!isMatch('../abc', '.**/abc', { dot: true }));
        });

        test('with globstar + dot + globstar', () => {
          expect_truthy(!isMatch('../abc', '*.*/**', { dot: true }));
          expect_truthy(!isMatch('../abc', '*.*/abc', { dot: true }));
        });

        test('with globstar + dot', () => {
          expect_truthy(!isMatch('../abc', '**./**', { dot: true }));
          expect_truthy(!isMatch('../abc', '**./abc', { dot: true }));
        });
      });

      describe('should not match nested double-dots', () => {
        test('with star', () => {
          expect_truthy(!isMatch('/../abc', '*/*', { dot: true }));
          expect_truthy(!isMatch('/../abc', '/*/*', { dot: true }));
          expect_truthy(!isMatch('/../abc', '*/*/*', { dot: true }));

          expect_truthy(!isMatch('abc/../abc', '*/*/*', { dot: true }));
          expect_truthy(!isMatch('abc/../abc/abc', '*/*/*/*', { dot: true }));
        });

        test('with dot + star', () => {
          expect_truthy(!isMatch('/../abc', '*/.*/*', { dot: true }));
          expect_truthy(!isMatch('/../abc', '/.*/*', { dot: true }));

          expect_truthy(!isMatch('/../abc', '*/*.*/*', { dot: true }));
          expect_truthy(!isMatch('/../abc', '/*.*/*', { dot: true }));

          expect_truthy(!isMatch('/../abc', '*/*./*', { dot: true }));
          expect_truthy(!isMatch('/../abc', '/*./*', { dot: true }));

          expect_truthy(!isMatch('abc/../abc', '*/.*/*', { dot: true }));
          expect_truthy(!isMatch('abc/../abc', '*/*.*/*', { dot: true }));
          expect_truthy(!isMatch('abc/../abc', '*/*./*', { dot: true }));
        });

        test('with globstar', () => {
          expect_truthy(!isMatch('/../abc', '**', { dot: true }));
          expect_truthy(!isMatch('/../abc', '**/**', { dot: true }));
          expect_truthy(!isMatch('/../abc', '/**/**', { dot: true }));
          expect_truthy(!isMatch('/../abc', '**/**/**', { dot: true }));

          expect_truthy(!isMatch('abc/../abc', '**/**/**', { dot: true }));
          expect_truthy(!isMatch('abc/../abc/abc', '**/**/**/**', { dot: true }));
        });

        test('with dot + globstar', () => {
          expect_truthy(!isMatch('/../abc', '**/.**/**', { dot: true }));
          expect_truthy(!isMatch('/../abc', '/.**/**', { dot: true }));

          expect_truthy(!isMatch('abc/../abc', '**/.**/**', { dot: true }));
          expect_truthy(!isMatch('abc/../abc', '/.**/**', { dot: true }));
        });

        test('with globstar + dot', () => {
          expect_truthy(!isMatch('/../abc', '**/**./**', { dot: true }));
          expect_truthy(!isMatch('/../abc', '/**./**', { dot: true }));

          expect_truthy(!isMatch('abc/../abc', '**/**./**', { dot: true }));
          expect_truthy(!isMatch('abc/../abc', '/**./**', { dot: true }));
        });

        test('with globstar + dot + globstar', () => {
          expect_truthy(!isMatch('/../abc', '**/**.**/**', { dot: true }));
          expect_truthy(!isMatch('/../abc', '**/*.*/**', { dot: true }));

          expect_truthy(!isMatch('/../abc', '/**.**/**', { dot: true }));
          expect_truthy(!isMatch('/../abc', '/*.*/**', { dot: true }));

          expect_truthy(!isMatch('abc/../abc', '**/**.**/**', { dot: true }));
          expect_truthy(!isMatch('abc/../abc', '**/*.*/**', { dot: true }));

          expect_truthy(!isMatch('abc/../abc', '/**.**/**', { dot: true }));
          expect_truthy(!isMatch('abc/../abc', '/*.*/**', { dot: true }));
        });
      });

      describe('should not match trailing double-dots', () => {
        test('with single star', () => {
          expect_truthy(!isMatch('abc/..', '*/*', { dot: true }));
          expect_truthy(!isMatch('abc/..', '*/*/', { dot: true }));
          expect_truthy(!isMatch('abc/..', '*/*/*', { dot: true }));

          expect_truthy(!isMatch('abc/../', '*/*', { dot: true }));
          expect_truthy(!isMatch('abc/../', '*/*/', { dot: true }));
          expect_truthy(!isMatch('abc/../', '*/*/*', { dot: true }));

          expect_truthy(!isMatch('abc/../abc/../', '*/*/*/*', { dot: true }));
          expect_truthy(!isMatch('abc/../abc/../', '*/*/*/*/', { dot: true }));
          expect_truthy(!isMatch('abc/../abc/abc/../', '*/*/*/*/*', { dot: true }));
        });

        test('with dot + star', () => {
          expect_truthy(!isMatch('abc/..', '*/.*', { dot: true }));
          expect_truthy(!isMatch('abc/..', '*/.*/', { dot: true }));
          expect_truthy(!isMatch('abc/..', '*/.*/*', { dot: true }));

          expect_truthy(!isMatch('abc/../', '*/.*', { dot: true }));
          expect_truthy(!isMatch('abc/../', '*/.*/', { dot: true }));
          expect_truthy(!isMatch('abc/../', '*/.*/*', { dot: true }));

          expect_truthy(!isMatch('abc/../abc/../', '*/.*/*/.*', { dot: true }));
          expect_truthy(!isMatch('abc/../abc/../', '*/.*/*/.*/', { dot: true }));
          expect_truthy(!isMatch('abc/../abc/abc/../', '*/.*/*/.*/*', { dot: true }));
        });

        test('with star + dot', () => {
          expect_truthy(!isMatch('abc/..', '*/*.', { dot: true }));
          expect_truthy(!isMatch('abc/..', '*/*./', { dot: true }));
          expect_truthy(!isMatch('abc/..', '*/*./*', { dot: true }));

          expect_truthy(!isMatch('abc/../', '*/*.', { dot: true }));
          expect_truthy(!isMatch('abc/../', '*/*./', { dot: true }));
          expect_truthy(!isMatch('abc/../', '*/*./*', { dot: true }));

          expect_truthy(!isMatch('abc/../abc/../', '*/*./*/*.', { dot: true }));
          expect_truthy(!isMatch('abc/../abc/../', '*/*./*/*./', { dot: true }));
          expect_truthy(!isMatch('abc/../abc/abc/../', '*/*./*/*./*', { dot: true }));
        });

        test('with globstar', () => {
          expect_truthy(!isMatch('abc/..', '**/**', { dot: true }));
          expect_truthy(!isMatch('abc/..', '**/**/', { dot: true }));
          expect_truthy(!isMatch('abc/..', '**/**/**', { dot: true }));

          expect_truthy(!isMatch('abc/../', '**/**', { dot: true }));
          expect_truthy(!isMatch('abc/../', '**/**/', { dot: true }));
          expect_truthy(!isMatch('abc/../', '**/**/**', { dot: true }));

          expect_truthy(!isMatch('abc/../abc/../', '**/**/**/**', { dot: true }));
          expect_truthy(!isMatch('abc/../abc/../', '**/**/**/**/', { dot: true }));
          expect_truthy(!isMatch('abc/../abc/abc/../', '**/**/**/**/**', { dot: true }));
        });

        test('with dot + globstar', () => {
          expect_truthy(!isMatch('abc/..', '**/.**', { dot: true }));
          expect_truthy(!isMatch('abc/..', '**/.**/', { dot: true }));
          expect_truthy(!isMatch('abc/..', '**/.**/**', { dot: true }));

          expect_truthy(!isMatch('abc/../', '**/.**', { dot: true }));
          expect_truthy(!isMatch('abc/../', '**/.**/', { dot: true }));
          expect_truthy(!isMatch('abc/../', '**/.**/**', { dot: true }));

          expect_truthy(!isMatch('abc/../abc/../', '**/.**/**/.**', { dot: true }));
          expect_truthy(!isMatch('abc/../abc/../', '**/.**/**/.**/', { dot: true }));
          expect_truthy(!isMatch('abc/../abc/abc/../', '**/.**/**/.**/**', { dot: true }));
        });

        test('with globstar + dot + globstar', () => {
          expect_truthy(!isMatch('abc/..', '**/**.**', { dot: true }));
          expect_truthy(!isMatch('abc/..', '**/**.**/', { dot: true }));
          expect_truthy(!isMatch('abc/..', '**/**.**/**', { dot: true }));

          expect_truthy(!isMatch('abc/../', '**/**.**', { dot: true }));
          expect_truthy(!isMatch('abc/../', '**/**.**/', { dot: true }));
          expect_truthy(!isMatch('abc/../', '**/**.**/**', { dot: true }));

          expect_truthy(!isMatch('abc/../abc/../', '**/**.**/**/**.**', { dot: true }));
          expect_truthy(!isMatch('abc/../abc/../', '**/**.**/**/**.**/', { dot: true }));
          expect_truthy(!isMatch('abc/../abc/abc/../', '**/**.**/**/.**/**', { dot: true }));
        });

        test('with globstar + dot', () => {
          expect_truthy(!isMatch('abc/..', '**/**.', { dot: true }));
          expect_truthy(!isMatch('abc/..', '**/**./', { dot: true }));
          expect_truthy(!isMatch('abc/..', '**/**./**', { dot: true }));

          expect_truthy(!isMatch('abc/../', '**/**.', { dot: true }));
          expect_truthy(!isMatch('abc/../', '**/**./', { dot: true }));
          expect_truthy(!isMatch('abc/../', '**/**./**', { dot: true }));

          expect_truthy(!isMatch('abc/../abc/../', '**/**./**/**.', { dot: true }));
          expect_truthy(!isMatch('abc/../abc/../', '**/**./**/**./', { dot: true }));
          expect_truthy(!isMatch('abc/../abc/abc/../', '**/**./**/**./**', { dot: true }));
        });
      });
    });

    describe('options = { strictSlashes: true }', () => {
      describe('should not match leading double-dots', () => {
        test('with single star', () => {
          expect_truthy(!isMatch('../abc', '*/*', { strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '*/abc', { strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '*/abc/*', { strictSlashes: true }));
        });

        test('with dot + single star', () => {
          expect_truthy(!isMatch('../abc', '.*/*', { strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '.*/abc', { strictSlashes: true }));

          expect_truthy(!isMatch('../abc', '*./*', { strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '*./abc', { strictSlashes: true }));
        });

        test('with globstar', () => {
          expect_truthy(!isMatch('../abc', '**', { strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '**/**/**', { strictSlashes: true }));

          expect_truthy(!isMatch('../abc', '**/abc', { strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '**/abc/**', { strictSlashes: true }));

          expect_truthy(!isMatch('../abc', 'abc/**', { strictSlashes: true }));
          expect_truthy(!isMatch('../abc', 'abc/**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('../abc', 'abc/**/**/**', { strictSlashes: true }));

          expect_truthy(!isMatch('../abc', '**/abc', { strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '**/abc/**', { strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '**/abc/**/**', { strictSlashes: true }));

          expect_truthy(!isMatch('../abc', '**/**/abc/**', { strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '**/**/abc/**/**', { strictSlashes: true }));
        });

        test('with dot + globstar', () => {
          expect_truthy(!isMatch('../abc', '.**', { strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '.**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '.**/abc', { strictSlashes: true }));
        });

        test('with globstar + dot + globstar', () => {
          expect_truthy(!isMatch('../abc', '*.*/**', { strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '*.*/abc', { strictSlashes: true }));
        });

        test('with globstar + dot', () => {
          expect_truthy(!isMatch('../abc', '**./**', { strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '**./abc', { strictSlashes: true }));
        });
      });

      describe('should not match nested double-dots', () => {
        test('with star', () => {
          expect_truthy(!isMatch('/../abc', '*/*', { strictSlashes: true }));
          expect_truthy(!isMatch('/../abc', '/*/*', { strictSlashes: true }));
          expect_truthy(!isMatch('/../abc', '*/*/*', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc', '*/*/*', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/abc', '*/*/*/*', { strictSlashes: true }));
        });

        test('with dot + star', () => {
          expect_truthy(!isMatch('/../abc', '*/.*/*', { strictSlashes: true }));
          expect_truthy(!isMatch('/../abc', '/.*/*', { strictSlashes: true }));

          expect_truthy(!isMatch('/../abc', '*/*.*/*', { strictSlashes: true }));
          expect_truthy(!isMatch('/../abc', '/*.*/*', { strictSlashes: true }));

          expect_truthy(!isMatch('/../abc', '*/*./*', { strictSlashes: true }));
          expect_truthy(!isMatch('/../abc', '/*./*', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc', '*/.*/*', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc', '*/*.*/*', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc', '*/*./*', { strictSlashes: true }));
        });

        test('with globstar', () => {
          expect_truthy(!isMatch('/../abc', '**', { strictSlashes: true }));
          expect_truthy(!isMatch('/../abc', '**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('/../abc', '/**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('/../abc', '**/**/**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc', '**/**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/abc', '**/**/**/**', { strictSlashes: true }));
        });

        test('with dot + globstar', () => {
          expect_truthy(!isMatch('/../abc', '**/.**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('/../abc', '/.**/**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc', '**/.**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc', '/.**/**', { strictSlashes: true }));
        });

        test('with globstar + dot', () => {
          expect_truthy(!isMatch('/../abc', '**/**./**', { strictSlashes: true }));
          expect_truthy(!isMatch('/../abc', '/**./**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc', '**/**./**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc', '/**./**', { strictSlashes: true }));
        });

        test('with globstar + dot + globstar', () => {
          expect_truthy(!isMatch('/../abc', '**/**.**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('/../abc', '**/*.*/**', { strictSlashes: true }));

          expect_truthy(!isMatch('/../abc', '/**.**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('/../abc', '/*.*/**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc', '**/**.**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc', '**/*.*/**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc', '/**.**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc', '/*.*/**', { strictSlashes: true }));
        });
      });

      describe('should not match trailing double-dots', () => {
        test('with single star', () => {
          expect_truthy(!isMatch('abc/..', '*/*', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '*/*/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '*/*/*', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/../', '*/*', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '*/*/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '*/*/*', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc/../', '*/*/*/*', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/../', '*/*/*/*/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/abc/../', '*/*/*/*/*', { strictSlashes: true }));
        });

        test('with dot + star', () => {
          expect_truthy(!isMatch('abc/..', '*/.*', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '*/.*/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '*/.*/*', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/../', '*/.*', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '*/.*/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '*/.*/*', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc/../', '*/.*/*/.*', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/../', '*/.*/*/.*/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/abc/../', '*/.*/*/.*/*', { strictSlashes: true }));
        });

        test('with star + dot', () => {
          expect_truthy(!isMatch('abc/..', '*/*.', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '*/*./', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '*/*./*', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/../', '*/*.', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '*/*./', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '*/*./*', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc/../', '*/*./*/*.', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/../', '*/*./*/*./', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/abc/../', '*/*./*/*./*', { strictSlashes: true }));
        });

        test('with globstar', () => {
          expect_truthy(!isMatch('abc/..', '**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '**/**/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '**/**/**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/../', '**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '**/**/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '**/**/**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc/../', '**/**/**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/../', '**/**/**/**/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/abc/../', '**/**/**/**/**', { strictSlashes: true }));
        });

        test('with dot + globstar', () => {
          expect_truthy(!isMatch('abc/..', '**/.**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '**/.**/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '**/.**/**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/../', '**/.**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '**/.**/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '**/.**/**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc/../', '**/.**/**/.**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/../', '**/.**/**/.**/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/abc/../', '**/.**/**/.**/**', { strictSlashes: true }));
        });

        test('with globstar + dot + globstar', () => {
          expect_truthy(!isMatch('abc/..', '**/**.**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '**/**.**/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '**/**.**/**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/../', '**/**.**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '**/**.**/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '**/**.**/**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc/../', '**/**.**/**/**.**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/../', '**/**.**/**/**.**/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/abc/../', '**/**.**/**/.**/**', { strictSlashes: true }));
        });

        test('with globstar + dot', () => {
          expect_truthy(!isMatch('abc/..', '**/**.', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '**/**./', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '**/**./**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/../', '**/**.', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '**/**./', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '**/**./**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc/../', '**/**./**/**.', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/../', '**/**./**/**./', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/abc/../', '**/**./**/**./**', { strictSlashes: true }));
        });
      });
    });

    describe('options = { dot: true, strictSlashes: true }', () => {
      describe('should not match leading double-dots', () => {
        test('with single star', () => {
          expect_truthy(!isMatch('../abc', '*/*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '*/abc', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '*/abc/*', { dot: true, strictSlashes: true }));
        });

        test('with dot + single star', () => {
          expect_truthy(!isMatch('../abc', '.*/*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '.*/abc', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('../abc', '*./*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '*./abc', { dot: true, strictSlashes: true }));
        });

        test('with globstar', () => {
          expect_truthy(!isMatch('../abc', '**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '**/**/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('../abc', '**/abc', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '**/abc/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('../abc', 'abc/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('../abc', 'abc/**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('../abc', 'abc/**/**/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('../abc', '**/abc', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '**/abc/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '**/abc/**/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('../abc', '**/**/abc/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '**/**/abc/**/**', { dot: true, strictSlashes: true }));
        });

        test('with dot + globstar', () => {
          expect_truthy(!isMatch('../abc', '.**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '.**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '.**/abc', { dot: true, strictSlashes: true }));
        });

        test('with globstar + dot + globstar', () => {
          expect_truthy(!isMatch('../abc', '*.*/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '*.*/abc', { dot: true, strictSlashes: true }));
        });

        test('with globstar + dot', () => {
          expect_truthy(!isMatch('../abc', '**./**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('../abc', '**./abc', { dot: true, strictSlashes: true }));
        });
      });

      describe('should not match nested double-dots', () => {
        test('with star', () => {
          expect_truthy(!isMatch('/../abc', '*/*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('/../abc', '/*/*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('/../abc', '*/*/*', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc', '*/*/*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/abc', '*/*/*/*', { dot: true, strictSlashes: true }));
        });

        test('with dot + star', () => {
          expect_truthy(!isMatch('/../abc', '*/.*/*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('/../abc', '/.*/*', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('/../abc', '*/*.*/*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('/../abc', '/*.*/*', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('/../abc', '*/*./*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('/../abc', '/*./*', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc', '*/.*/*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc', '*/*.*/*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc', '*/*./*', { dot: true, strictSlashes: true }));
        });

        test('with globstar', () => {
          expect_truthy(!isMatch('/../abc', '**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('/../abc', '**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('/../abc', '/**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('/../abc', '**/**/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc', '**/**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/abc', '**/**/**/**', { dot: true, strictSlashes: true }));
        });

        test('with dot + globstar', () => {
          expect_truthy(!isMatch('/../abc', '**/.**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('/../abc', '/.**/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc', '**/.**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc', '/.**/**', { dot: true, strictSlashes: true }));
        });

        test('with globstar + dot', () => {
          expect_truthy(!isMatch('/../abc', '**/**./**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('/../abc', '/**./**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc', '**/**./**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc', '/**./**', { dot: true, strictSlashes: true }));
        });

        test('with globstar + dot + globstar', () => {
          expect_truthy(!isMatch('/../abc', '**/**.**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('/../abc', '**/*.*/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('/../abc', '/**.**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('/../abc', '/*.*/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc', '**/**.**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc', '**/*.*/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc', '/**.**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc', '/*.*/**', { dot: true, strictSlashes: true }));
        });
      });

      describe('should not match trailing double-dots', () => {
        test('with single star', () => {
          expect_truthy(!isMatch('abc/..', '*/*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '*/*/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '*/*/*', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/../', '*/*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '*/*/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '*/*/*', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc/../', '*/*/*/*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/../', '*/*/*/*/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/abc/../', '*/*/*/*/*', { dot: true, strictSlashes: true }));
        });

        test('with dot + star', () => {
          expect_truthy(!isMatch('abc/..', '*/.*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '*/.*/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '*/.*/*', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/../', '*/.*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '*/.*/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '*/.*/*', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc/../', '*/.*/*/.*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/../', '*/.*/*/.*/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/abc/../', '*/.*/*/.*/*', { dot: true, strictSlashes: true }));
        });

        test('with star + dot', () => {
          expect_truthy(!isMatch('abc/..', '*/*.', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '*/*./', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '*/*./*', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/../', '*/*.', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '*/*./', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '*/*./*', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc/../', '*/*./*/*.', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/../', '*/*./*/*./', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/abc/../', '*/*./*/*./*', { dot: true, strictSlashes: true }));
        });

        test('with globstar', () => {
          expect_truthy(!isMatch('abc/..', '**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '**/**/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '**/**/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/../', '**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '**/**/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '**/**/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc/../', '**/**/**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/../', '**/**/**/**/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/abc/../', '**/**/**/**/**', { dot: true, strictSlashes: true }));
        });

        test('with dot + globstar', () => {
          expect_truthy(!isMatch('abc/..', '**/.**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '**/.**/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '**/.**/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/../', '**/.**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '**/.**/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '**/.**/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc/../', '**/.**/**/.**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/../', '**/.**/**/.**/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/abc/../', '**/.**/**/.**/**', { dot: true, strictSlashes: true }));
        });

        test('with globstar + dot + globstar', () => {
          expect_truthy(!isMatch('abc/..', '**/**.**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '**/**.**/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '**/**.**/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/../', '**/**.**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '**/**.**/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '**/**.**/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc/../', '**/**.**/**/**.**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/../', '**/**.**/**/**.**/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/abc/../', '**/**.**/**/.**/**', { dot: true, strictSlashes: true }));
        });

        test('with globstar + dot', () => {
          expect_truthy(!isMatch('abc/..', '**/**.', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '**/**./', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/..', '**/**./**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/../', '**/**.', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '**/**./', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../', '**/**./**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/../abc/../', '**/**./**/**.', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/../', '**/**./**/**./', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/../abc/abc/../', '**/**./**/**./**', { dot: true, strictSlashes: true }));
        });
      });
    });
  });

  describe('single dots', () => {
    describe('no options', () => {
      describe('should not match leading single-dots', () => {
        test('with single star', () => {
          expect_truthy(!isMatch('./abc', '*'));
          expect_truthy(!isMatch('./abc', '*/*'));
          expect_truthy(!isMatch('./abc', '*/abc'));
          expect_truthy(!isMatch('./abc', '*/abc/*'));
        });

        test('with dot + single star', () => {
          expect_truthy(!isMatch('./abc', '.*/*'));
          expect_truthy(!isMatch('./abc', '.*/abc'));

          expect_truthy(!isMatch('./abc', '*./*'));
          expect_truthy(!isMatch('./abc', '*./abc'));
        });

        test('with globstar', () => {
          expect_truthy(!isMatch('./abc', '**'));
          expect_truthy(!isMatch('./abc', '**/**'));
          expect_truthy(!isMatch('./abc', '**/**/**'));

          expect_truthy(!isMatch('./abc', '**/abc'));
          expect_truthy(!isMatch('./abc', '**/abc/**'));

          expect_truthy(!isMatch('./abc', 'abc/**'));
          expect_truthy(!isMatch('./abc', 'abc/**/**'));
          expect_truthy(!isMatch('./abc', 'abc/**/**/**'));

          expect_truthy(!isMatch('./abc', '**/abc'));
          expect_truthy(!isMatch('./abc', '**/abc/**'));
          expect_truthy(!isMatch('./abc', '**/abc/**/**'));

          expect_truthy(!isMatch('./abc', '**/**/abc/**'));
          expect_truthy(!isMatch('./abc', '**/**/abc/**/**'));
        });

        test('with dot + globstar', () => {
          expect_truthy(!isMatch('./abc', '.**'));
          expect_truthy(!isMatch('./abc', '.**/**'));
          expect_truthy(!isMatch('./abc', '.**/abc'));
        });

        test('with globstar + dot + globstar', () => {
          expect_truthy(!isMatch('./abc', '*.*/**'));
          expect_truthy(!isMatch('./abc', '*.*/abc'));
        });

        test('with globstar + dot', () => {
          expect_truthy(!isMatch('./abc', '**./**'));
          expect_truthy(!isMatch('./abc', '**./abc'));
        });
      });

      describe('should not match nested single-dots', () => {
        test('with star', () => {
          expect_truthy(!isMatch('/./abc', '*/*'));
          expect_truthy(!isMatch('/./abc', '/*/*'));
          expect_truthy(!isMatch('/./abc', '*/*/*'));

          expect_truthy(!isMatch('abc/./abc', '*/*/*'));
          expect_truthy(!isMatch('abc/./abc/abc', '*/*/*/*'));
        });

        test('with dot + star', () => {
          expect_truthy(!isMatch('/./abc', '*/.*/*'));
          expect_truthy(!isMatch('/./abc', '/.*/*'));

          expect_truthy(!isMatch('/./abc', '*/*.*/*'));
          expect_truthy(!isMatch('/./abc', '/*.*/*'));

          expect_truthy(!isMatch('/./abc', '*/*./*'));
          expect_truthy(!isMatch('/./abc', '/*./*'));

          expect_truthy(!isMatch('abc/./abc', '*/.*/*'));
          expect_truthy(!isMatch('abc/./abc', '*/*.*/*'));
          expect_truthy(!isMatch('abc/./abc', '*/*./*'));
        });

        test('with globstar', () => {
          expect_truthy(!isMatch('/./abc', '**'));
          expect_truthy(!isMatch('/./abc', '**/**'));
          expect_truthy(!isMatch('/./abc', '/**/**'));
          expect_truthy(!isMatch('/./abc', '**/**/**'));

          expect_truthy(!isMatch('abc/./abc', '**/**/**'));
          expect_truthy(!isMatch('abc/./abc/abc', '**/**/**/**'));
        });

        test('with dot + globstar', () => {
          expect_truthy(!isMatch('/./abc', '**/.**/**'));
          expect_truthy(!isMatch('/./abc', '/.**/**'));

          expect_truthy(!isMatch('abc/./abc', '**/.**/**'));
          expect_truthy(!isMatch('abc/./abc', '/.**/**'));
        });

        test('with globstar + dot', () => {
          expect_truthy(!isMatch('/./abc', '**/**./**'));
          expect_truthy(!isMatch('/./abc', '/**./**'));

          expect_truthy(!isMatch('abc/./abc', '**/**./**'));
          expect_truthy(!isMatch('abc/./abc', '/**./**'));
        });

        test('with globstar + dot + globstar', () => {
          expect_truthy(!isMatch('/./abc', '**/**.**/**'));
          expect_truthy(!isMatch('/./abc', '**/*.*/**'));

          expect_truthy(!isMatch('/./abc', '/**.**/**'));
          expect_truthy(!isMatch('/./abc', '/*.*/**'));

          expect_truthy(!isMatch('abc/./abc', '**/**.**/**'));
          expect_truthy(!isMatch('abc/./abc', '**/*.*/**'));

          expect_truthy(!isMatch('abc/./abc', '/**.**/**'));
          expect_truthy(!isMatch('abc/./abc', '/*.*/**'));
        });
      });

      describe('should not match trailing single-dots', () => {
        test('with single star', () => {
          expect_truthy(!isMatch('abc/.', '*/*'));
          expect_truthy(!isMatch('abc/.', '*/*/'));
          expect_truthy(!isMatch('abc/.', '*/*/*'));

          expect_truthy(!isMatch('abc/./', '*/*'));
          expect_truthy(!isMatch('abc/./', '*/*/'));
          expect_truthy(!isMatch('abc/./', '*/*/*'));

          expect_truthy(!isMatch('abc/./abc/./', '*/*/*/*'));
          expect_truthy(!isMatch('abc/./abc/./', '*/*/*/*/'));
          expect_truthy(!isMatch('abc/./abc/abc/./', '*/*/*/*/*'));
        });

        test('with dot + star', () => {
          expect_truthy(!isMatch('abc/.', '*/.*'));
          expect_truthy(!isMatch('abc/.', '*/.*/'));
          expect_truthy(!isMatch('abc/.', '*/.*/*'));

          expect_truthy(!isMatch('abc/./', '*/.*'));
          expect_truthy(!isMatch('abc/./', '*/.*/'));
          expect_truthy(!isMatch('abc/./', '*/.*/*'));

          expect_truthy(!isMatch('abc/./abc/./', '*/.*/*/.*'));
          expect_truthy(!isMatch('abc/./abc/./', '*/.*/*/.*/'));
          expect_truthy(!isMatch('abc/./abc/abc/./', '*/.*/*/.*/*'));
        });

        test('with star + dot', () => {
          expect_truthy(!isMatch('abc/.', '*/*.'));
          expect_truthy(!isMatch('abc/.', '*/*./'));
          expect_truthy(!isMatch('abc/.', '*/*./*'));

          expect_truthy(!isMatch('abc/./', '*/*.'));
          expect_truthy(!isMatch('abc/./', '*/*./'));
          expect_truthy(!isMatch('abc/./', '*/*./*'));

          expect_truthy(!isMatch('abc/./abc/./', '*/*./*/*.'));
          expect_truthy(!isMatch('abc/./abc/./', '*/*./*/*./'));
          expect_truthy(!isMatch('abc/./abc/abc/./', '*/*./*/*./*'));
        });

        test('with globstar', () => {
          expect_truthy(!isMatch('abc/.', '**/**'));
          expect_truthy(!isMatch('abc/.', '**/**/'));
          expect_truthy(!isMatch('abc/.', '**/**/**'));

          expect_truthy(!isMatch('abc/./', '**/**'));
          expect_truthy(!isMatch('abc/./', '**/**/'));
          expect_truthy(!isMatch('abc/./', '**/**/**'));

          expect_truthy(!isMatch('abc/./abc/./', '**/**/**/**'));
          expect_truthy(!isMatch('abc/./abc/./', '**/**/**/**/'));
          expect_truthy(!isMatch('abc/./abc/abc/./', '**/**/**/**/**'));
        });

        test('with dot + globstar', () => {
          expect_truthy(!isMatch('abc/.', '**/.**'));
          expect_truthy(!isMatch('abc/.', '**/.**/'));
          expect_truthy(!isMatch('abc/.', '**/.**/**'));

          expect_truthy(!isMatch('abc/./', '**/.**'));
          expect_truthy(!isMatch('abc/./', '**/.**/'));
          expect_truthy(!isMatch('abc/./', '**/.**/**'));

          expect_truthy(!isMatch('abc/./abc/./', '**/.**/**/.**'));
          expect_truthy(!isMatch('abc/./abc/./', '**/.**/**/.**/'));
          expect_truthy(!isMatch('abc/./abc/abc/./', '**/.**/**/.**/**'));
        });

        test('with globstar + dot + globstar', () => {
          expect_truthy(!isMatch('abc/.', '**/**.**'));
          expect_truthy(!isMatch('abc/.', '**/**.**/'));
          expect_truthy(!isMatch('abc/.', '**/**.**/**'));

          expect_truthy(!isMatch('abc/./', '**/**.**'));
          expect_truthy(!isMatch('abc/./', '**/**.**/'));
          expect_truthy(!isMatch('abc/./', '**/**.**/**'));

          expect_truthy(!isMatch('abc/./abc/./', '**/**.**/**/**.**'));
          expect_truthy(!isMatch('abc/./abc/./', '**/**.**/**/**.**/'));
          expect_truthy(!isMatch('abc/./abc/abc/./', '**/**.**/**/.**/**'));
        });

        test('with globstar + dot', () => {
          expect_truthy(!isMatch('abc/.', '**/**.'));
          expect_truthy(!isMatch('abc/.', '**/**./'));
          expect_truthy(!isMatch('abc/.', '**/**./**'));

          expect_truthy(!isMatch('abc/./', '**/**.'));
          expect_truthy(!isMatch('abc/./', '**/**./'));
          expect_truthy(!isMatch('abc/./', '**/**./**'));

          expect_truthy(!isMatch('abc/./abc/./', '**/**./**/**.'));
          expect_truthy(!isMatch('abc/./abc/./', '**/**./**/**./'));
          expect_truthy(!isMatch('abc/./abc/abc/./', '**/**./**/**./**'));
        });
      });
    });

    describe('options = { dot: true }', () => {
      describe('should not match leading single-dots', () => {
        test('with single star', () => {
          expect_truthy(!isMatch('./abc', '*/*', { dot: true }));
          expect_truthy(!isMatch('./abc', '*/abc', { dot: true }));
          expect_truthy(!isMatch('./abc', '*/abc/*', { dot: true }));
        });

        test('with dot + single star', () => {
          expect_truthy(!isMatch('./abc', '.*/*', { dot: true }));
          expect_truthy(!isMatch('./abc', '.*/abc', { dot: true }));

          expect_truthy(!isMatch('./abc', '*./*', { dot: true }));
          expect_truthy(!isMatch('./abc', '*./abc', { dot: true }));
        });

        test('with globstar', () => {
          expect_truthy(!isMatch('./abc', '**', { dot: true }));
          expect_truthy(!isMatch('./abc', '**/**', { dot: true }));
          expect_truthy(!isMatch('./abc', '**/**/**', { dot: true }));

          expect_truthy(!isMatch('./abc', '**/abc', { dot: true }));
          expect_truthy(!isMatch('./abc', '**/abc/**', { dot: true }));

          expect_truthy(!isMatch('./abc', 'abc/**', { dot: true }));
          expect_truthy(!isMatch('./abc', 'abc/**/**', { dot: true }));
          expect_truthy(!isMatch('./abc', 'abc/**/**/**', { dot: true }));

          expect_truthy(!isMatch('./abc', '**/abc', { dot: true }));
          expect_truthy(!isMatch('./abc', '**/abc/**', { dot: true }));
          expect_truthy(!isMatch('./abc', '**/abc/**/**', { dot: true }));

          expect_truthy(!isMatch('./abc', '**/**/abc/**', { dot: true }));
          expect_truthy(!isMatch('./abc', '**/**/abc/**/**', { dot: true }));
        });

        test('with dot + globstar', () => {
          expect_truthy(!isMatch('./abc', '.**', { dot: true }));
          expect_truthy(!isMatch('./abc', '.**/**', { dot: true }));
          expect_truthy(!isMatch('./abc', '.**/abc', { dot: true }));
        });

        test('with globstar + dot + globstar', () => {
          expect_truthy(!isMatch('./abc', '*.*/**', { dot: true }));
          expect_truthy(!isMatch('./abc', '*.*/abc', { dot: true }));
        });

        test('with globstar + dot', () => {
          expect_truthy(!isMatch('./abc', '**./**', { dot: true }));
          expect_truthy(!isMatch('./abc', '**./abc', { dot: true }));
        });
      });

      describe('should not match nested single-dots', () => {
        test('with star', () => {
          expect_truthy(!isMatch('/./abc', '*/*', { dot: true }));
          expect_truthy(!isMatch('/./abc', '/*/*', { dot: true }));
          expect_truthy(!isMatch('/./abc', '*/*/*', { dot: true }));

          expect_truthy(!isMatch('abc/./abc', '*/*/*', { dot: true }));
          expect_truthy(!isMatch('abc/./abc/abc', '*/*/*/*', { dot: true }));
        });

        test('with dot + star', () => {
          expect_truthy(!isMatch('/./abc', '*/.*/*', { dot: true }));
          expect_truthy(!isMatch('/./abc', '/.*/*', { dot: true }));

          expect_truthy(!isMatch('/./abc', '*/*.*/*', { dot: true }));
          expect_truthy(!isMatch('/./abc', '/*.*/*', { dot: true }));

          expect_truthy(!isMatch('/./abc', '*/*./*', { dot: true }));
          expect_truthy(!isMatch('/./abc', '/*./*', { dot: true }));

          expect_truthy(!isMatch('abc/./abc', '*/.*/*', { dot: true }));
          expect_truthy(!isMatch('abc/./abc', '*/*.*/*', { dot: true }));
          expect_truthy(!isMatch('abc/./abc', '*/*./*', { dot: true }));
        });

        test('with globstar', () => {
          expect_truthy(!isMatch('/./abc', '**', { dot: true }));
          expect_truthy(!isMatch('/./abc', '**/**', { dot: true }));
          expect_truthy(!isMatch('/./abc', '/**/**', { dot: true }));
          expect_truthy(!isMatch('/./abc', '**/**/**', { dot: true }));

          expect_truthy(!isMatch('abc/./abc', '**/**/**', { dot: true }));
          expect_truthy(!isMatch('abc/./abc/abc', '**/**/**/**', { dot: true }));
        });

        test('with dot + globstar', () => {
          expect_truthy(!isMatch('/./abc', '**/.**/**', { dot: true }));
          expect_truthy(!isMatch('/./abc', '/.**/**', { dot: true }));

          expect_truthy(!isMatch('abc/./abc', '**/.**/**', { dot: true }));
          expect_truthy(!isMatch('abc/./abc', '/.**/**', { dot: true }));
        });

        test('with globstar + dot', () => {
          expect_truthy(!isMatch('/./abc', '**/**./**', { dot: true }));
          expect_truthy(!isMatch('/./abc', '/**./**', { dot: true }));

          expect_truthy(!isMatch('abc/./abc', '**/**./**', { dot: true }));
          expect_truthy(!isMatch('abc/./abc', '/**./**', { dot: true }));
        });

        test('with globstar + dot + globstar', () => {
          expect_truthy(!isMatch('/./abc', '**/**.**/**', { dot: true }));
          expect_truthy(!isMatch('/./abc', '**/*.*/**', { dot: true }));

          expect_truthy(!isMatch('/./abc', '/**.**/**', { dot: true }));
          expect_truthy(!isMatch('/./abc', '/*.*/**', { dot: true }));

          expect_truthy(!isMatch('abc/./abc', '**/**.**/**', { dot: true }));
          expect_truthy(!isMatch('abc/./abc', '**/*.*/**', { dot: true }));

          expect_truthy(!isMatch('abc/./abc', '/**.**/**', { dot: true }));
          expect_truthy(!isMatch('abc/./abc', '/*.*/**', { dot: true }));
        });
      });

      describe('should not match trailing single-dots', () => {
        test('with single star', () => {
          expect_truthy(!isMatch('abc/.', '*/*', { dot: true }));
          expect_truthy(!isMatch('abc/.', '*/*/', { dot: true }));
          expect_truthy(!isMatch('abc/.', '*/*/*', { dot: true }));

          expect_truthy(!isMatch('abc/./', '*/*', { dot: true }));
          expect_truthy(!isMatch('abc/./', '*/*/', { dot: true }));
          expect_truthy(!isMatch('abc/./', '*/*/*', { dot: true }));

          expect_truthy(!isMatch('abc/./abc/./', '*/*/*/*', { dot: true }));
          expect_truthy(!isMatch('abc/./abc/./', '*/*/*/*/', { dot: true }));
          expect_truthy(!isMatch('abc/./abc/abc/./', '*/*/*/*/*', { dot: true }));
        });

        test('with dot + star', () => {
          expect_truthy(!isMatch('abc/.', '*/.*', { dot: true }));
          expect_truthy(!isMatch('abc/.', '*/.*/', { dot: true }));
          expect_truthy(!isMatch('abc/.', '*/.*/*', { dot: true }));

          expect_truthy(!isMatch('abc/./', '*/.*', { dot: true }));
          expect_truthy(!isMatch('abc/./', '*/.*/', { dot: true }));
          expect_truthy(!isMatch('abc/./', '*/.*/*', { dot: true }));

          expect_truthy(!isMatch('abc/./abc/./', '*/.*/*/.*', { dot: true }));
          expect_truthy(!isMatch('abc/./abc/./', '*/.*/*/.*/', { dot: true }));
          expect_truthy(!isMatch('abc/./abc/abc/./', '*/.*/*/.*/*', { dot: true }));
        });

        test('with star + dot', () => {
          expect_truthy(!isMatch('abc/.', '*/*.', { dot: true }));
          expect_truthy(!isMatch('abc/.', '*/*./', { dot: true }));
          expect_truthy(!isMatch('abc/.', '*/*./*', { dot: true }));

          expect_truthy(!isMatch('abc/./', '*/*.', { dot: true }));
          expect_truthy(!isMatch('abc/./', '*/*./', { dot: true }));
          expect_truthy(!isMatch('abc/./', '*/*./*', { dot: true }));

          expect_truthy(!isMatch('abc/./abc/./', '*/*./*/*.', { dot: true }));
          expect_truthy(!isMatch('abc/./abc/./', '*/*./*/*./', { dot: true }));
          expect_truthy(!isMatch('abc/./abc/abc/./', '*/*./*/*./*', { dot: true }));
        });

        test('with globstar', () => {
          expect_truthy(!isMatch('abc/.', '**/**', { dot: true }));
          expect_truthy(!isMatch('abc/.', '**/**/', { dot: true }));
          expect_truthy(!isMatch('abc/.', '**/**/**', { dot: true }));

          expect_truthy(!isMatch('abc/./', '**/**', { dot: true }));
          expect_truthy(!isMatch('abc/./', '**/**/', { dot: true }));
          expect_truthy(!isMatch('abc/./', '**/**/**', { dot: true }));

          expect_truthy(!isMatch('abc/./abc/./', '**/**/**/**', { dot: true }));
          expect_truthy(!isMatch('abc/./abc/./', '**/**/**/**/', { dot: true }));
          expect_truthy(!isMatch('abc/./abc/abc/./', '**/**/**/**/**', { dot: true }));
        });

        test('with dot + globstar', () => {
          expect_truthy(!isMatch('abc/.', '**/.**', { dot: true }));
          expect_truthy(!isMatch('abc/.', '**/.**/', { dot: true }));
          expect_truthy(!isMatch('abc/.', '**/.**/**', { dot: true }));

          expect_truthy(!isMatch('abc/./', '**/.**', { dot: true }));
          expect_truthy(!isMatch('abc/./', '**/.**/', { dot: true }));
          expect_truthy(!isMatch('abc/./', '**/.**/**', { dot: true }));

          expect_truthy(!isMatch('abc/./abc/./', '**/.**/**/.**', { dot: true }));
          expect_truthy(!isMatch('abc/./abc/./', '**/.**/**/.**/', { dot: true }));
          expect_truthy(!isMatch('abc/./abc/abc/./', '**/.**/**/.**/**', { dot: true }));
        });

        test('with globstar + dot + globstar', () => {
          expect_truthy(!isMatch('abc/.', '**/**.**', { dot: true }));
          expect_truthy(!isMatch('abc/.', '**/**.**/', { dot: true }));
          expect_truthy(!isMatch('abc/.', '**/**.**/**', { dot: true }));

          expect_truthy(!isMatch('abc/./', '**/**.**', { dot: true }));
          expect_truthy(!isMatch('abc/./', '**/**.**/', { dot: true }));
          expect_truthy(!isMatch('abc/./', '**/**.**/**', { dot: true }));

          expect_truthy(!isMatch('abc/./abc/./', '**/**.**/**/**.**', { dot: true }));
          expect_truthy(!isMatch('abc/./abc/./', '**/**.**/**/**.**/', { dot: true }));
          expect_truthy(!isMatch('abc/./abc/abc/./', '**/**.**/**/.**/**', { dot: true }));
        });

        test('with globstar + dot', () => {
          expect_truthy(!isMatch('abc/.', '**/**.', { dot: true }));
          expect_truthy(!isMatch('abc/.', '**/**./', { dot: true }));
          expect_truthy(!isMatch('abc/.', '**/**./**', { dot: true }));

          expect_truthy(!isMatch('abc/./', '**/**.', { dot: true }));
          expect_truthy(!isMatch('abc/./', '**/**./', { dot: true }));
          expect_truthy(!isMatch('abc/./', '**/**./**', { dot: true }));

          expect_truthy(!isMatch('abc/./abc/./', '**/**./**/**.', { dot: true }));
          expect_truthy(!isMatch('abc/./abc/./', '**/**./**/**./', { dot: true }));
          expect_truthy(!isMatch('abc/./abc/abc/./', '**/**./**/**./**', { dot: true }));
        });
      });
    });

    describe('options = { strictSlashes: true }', () => {
      describe('should not match leading single-dots', () => {
        test('with single star', () => {
          expect_truthy(!isMatch('./abc', '*/*', { strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '*/abc', { strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '*/abc/*', { strictSlashes: true }));
        });

        test('with dot + single star', () => {
          expect_truthy(!isMatch('./abc', '.*/*', { strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '.*/abc', { strictSlashes: true }));

          expect_truthy(!isMatch('./abc', '*./*', { strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '*./abc', { strictSlashes: true }));
        });

        test('with globstar', () => {
          expect_truthy(!isMatch('./abc', '**', { strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '**/**/**', { strictSlashes: true }));

          expect_truthy(!isMatch('./abc', '**/abc', { strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '**/abc/**', { strictSlashes: true }));

          expect_truthy(!isMatch('./abc', 'abc/**', { strictSlashes: true }));
          expect_truthy(!isMatch('./abc', 'abc/**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('./abc', 'abc/**/**/**', { strictSlashes: true }));

          expect_truthy(!isMatch('./abc', '**/abc', { strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '**/abc/**', { strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '**/abc/**/**', { strictSlashes: true }));

          expect_truthy(!isMatch('./abc', '**/**/abc/**', { strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '**/**/abc/**/**', { strictSlashes: true }));
        });

        test('with dot + globstar', () => {
          expect_truthy(!isMatch('./abc', '.**', { strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '.**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '.**/abc', { strictSlashes: true }));
        });

        test('with globstar + dot + globstar', () => {
          expect_truthy(!isMatch('./abc', '*.*/**', { strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '*.*/abc', { strictSlashes: true }));
        });

        test('with globstar + dot', () => {
          expect_truthy(!isMatch('./abc', '**./**', { strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '**./abc', { strictSlashes: true }));
        });
      });

      describe('should not match nested single-dots', () => {
        test('with star', () => {
          expect_truthy(!isMatch('/./abc', '*/*', { strictSlashes: true }));
          expect_truthy(!isMatch('/./abc', '/*/*', { strictSlashes: true }));
          expect_truthy(!isMatch('/./abc', '*/*/*', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc', '*/*/*', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/abc', '*/*/*/*', { strictSlashes: true }));
        });

        test('with dot + star', () => {
          expect_truthy(!isMatch('/./abc', '*/.*/*', { strictSlashes: true }));
          expect_truthy(!isMatch('/./abc', '/.*/*', { strictSlashes: true }));

          expect_truthy(!isMatch('/./abc', '*/*.*/*', { strictSlashes: true }));
          expect_truthy(!isMatch('/./abc', '/*.*/*', { strictSlashes: true }));

          expect_truthy(!isMatch('/./abc', '*/*./*', { strictSlashes: true }));
          expect_truthy(!isMatch('/./abc', '/*./*', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc', '*/.*/*', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc', '*/*.*/*', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc', '*/*./*', { strictSlashes: true }));
        });

        test('with globstar', () => {
          expect_truthy(!isMatch('/./abc', '**', { strictSlashes: true }));
          expect_truthy(!isMatch('/./abc', '**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('/./abc', '/**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('/./abc', '**/**/**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc', '**/**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/abc', '**/**/**/**', { strictSlashes: true }));
        });

        test('with dot + globstar', () => {
          expect_truthy(!isMatch('/./abc', '**/.**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('/./abc', '/.**/**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc', '**/.**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc', '/.**/**', { strictSlashes: true }));
        });

        test('with globstar + dot', () => {
          expect_truthy(!isMatch('/./abc', '**/**./**', { strictSlashes: true }));
          expect_truthy(!isMatch('/./abc', '/**./**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc', '**/**./**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc', '/**./**', { strictSlashes: true }));
        });

        test('with globstar + dot + globstar', () => {
          expect_truthy(!isMatch('/./abc', '**/**.**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('/./abc', '**/*.*/**', { strictSlashes: true }));

          expect_truthy(!isMatch('/./abc', '/**.**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('/./abc', '/*.*/**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc', '**/**.**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc', '**/*.*/**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc', '/**.**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc', '/*.*/**', { strictSlashes: true }));
        });
      });

      describe('should not match trailing single-dots', () => {
        test('with single star', () => {
          expect_truthy(!isMatch('abc/.', '*/*', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '*/*/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '*/*/*', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/./', '*/*', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '*/*/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '*/*/*', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc/./', '*/*/*/*', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/./', '*/*/*/*/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/abc/./', '*/*/*/*/*', { strictSlashes: true }));
        });

        test('with dot + star', () => {
          expect_truthy(!isMatch('abc/.', '*/.*', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '*/.*/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '*/.*/*', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/./', '*/.*', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '*/.*/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '*/.*/*', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc/./', '*/.*/*/.*', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/./', '*/.*/*/.*/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/abc/./', '*/.*/*/.*/*', { strictSlashes: true }));
        });

        test('with star + dot', () => {
          expect_truthy(!isMatch('abc/.', '*/*.', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '*/*./', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '*/*./*', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/./', '*/*.', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '*/*./', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '*/*./*', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc/./', '*/*./*/*.', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/./', '*/*./*/*./', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/abc/./', '*/*./*/*./*', { strictSlashes: true }));
        });

        test('with globstar', () => {
          expect_truthy(!isMatch('abc/.', '**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '**/**/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '**/**/**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/./', '**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '**/**/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '**/**/**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc/./', '**/**/**/**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/./', '**/**/**/**/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/abc/./', '**/**/**/**/**', { strictSlashes: true }));
        });

        test('with dot + globstar', () => {
          expect_truthy(!isMatch('abc/.', '**/.**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '**/.**/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '**/.**/**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/./', '**/.**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '**/.**/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '**/.**/**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc/./', '**/.**/**/.**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/./', '**/.**/**/.**/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/abc/./', '**/.**/**/.**/**', { strictSlashes: true }));
        });

        test('with globstar + dot + globstar', () => {
          expect_truthy(!isMatch('abc/.', '**/**.**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '**/**.**/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '**/**.**/**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/./', '**/**.**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '**/**.**/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '**/**.**/**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc/./', '**/**.**/**/**.**', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/./', '**/**.**/**/**.**/', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/abc/./', '**/**.**/**/.**/**', { strictSlashes: true }));
        });

        test('with globstar + dot', () => {
          expect_truthy(!isMatch('abc/.', '**/**.', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '**/**./', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '**/**./**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/./', '**/**.', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '**/**./', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '**/**./**', { strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc/./', '**/**./**/**.', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/./', '**/**./**/**./', { strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/abc/./', '**/**./**/**./**', { strictSlashes: true }));
        });
      });
    });

    describe('options = { dot: true, strictSlashes: true }', () => {
      describe('should not match leading single-dots', () => {
        test('with single star', () => {
          expect_truthy(!isMatch('./abc', '*/*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '*/abc', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '*/abc/*', { dot: true, strictSlashes: true }));
        });

        test('with dot + single star', () => {
          expect_truthy(!isMatch('./abc', '.*/*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '.*/abc', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('./abc', '*./*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '*./abc', { dot: true, strictSlashes: true }));
        });

        test('with globstar', () => {
          expect_truthy(!isMatch('./abc', '**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '**/**/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('./abc', '**/abc', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '**/abc/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('./abc', 'abc/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('./abc', 'abc/**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('./abc', 'abc/**/**/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('./abc', '**/abc', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '**/abc/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '**/abc/**/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('./abc', '**/**/abc/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '**/**/abc/**/**', { dot: true, strictSlashes: true }));
        });

        test('with dot + globstar', () => {
          expect_truthy(!isMatch('./abc', '.**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '.**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '.**/abc', { dot: true, strictSlashes: true }));
        });

        test('with globstar + dot + globstar', () => {
          expect_truthy(!isMatch('./abc', '*.*/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '*.*/abc', { dot: true, strictSlashes: true }));
        });

        test('with globstar + dot', () => {
          expect_truthy(!isMatch('./abc', '**./**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('./abc', '**./abc', { dot: true, strictSlashes: true }));
        });
      });

      describe('should not match nested single-dots', () => {
        test('with star', () => {
          expect_truthy(!isMatch('/./abc', '*/*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('/./abc', '/*/*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('/./abc', '*/*/*', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc', '*/*/*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/abc', '*/*/*/*', { dot: true, strictSlashes: true }));
        });

        test('with dot + star', () => {
          expect_truthy(!isMatch('/./abc', '*/.*/*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('/./abc', '/.*/*', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('/./abc', '*/*.*/*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('/./abc', '/*.*/*', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('/./abc', '*/*./*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('/./abc', '/*./*', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc', '*/.*/*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc', '*/*.*/*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc', '*/*./*', { dot: true, strictSlashes: true }));
        });

        test('with globstar', () => {
          expect_truthy(!isMatch('/./abc', '**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('/./abc', '**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('/./abc', '/**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('/./abc', '**/**/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc', '**/**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/abc', '**/**/**/**', { dot: true, strictSlashes: true }));
        });

        test('with dot + globstar', () => {
          expect_truthy(!isMatch('/./abc', '**/.**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('/./abc', '/.**/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc', '**/.**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc', '/.**/**', { dot: true, strictSlashes: true }));
        });

        test('with globstar + dot', () => {
          expect_truthy(!isMatch('/./abc', '**/**./**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('/./abc', '/**./**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc', '**/**./**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc', '/**./**', { dot: true, strictSlashes: true }));
        });

        test('with globstar + dot + globstar', () => {
          expect_truthy(!isMatch('/./abc', '**/**.**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('/./abc', '**/*.*/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('/./abc', '/**.**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('/./abc', '/*.*/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc', '**/**.**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc', '**/*.*/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc', '/**.**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc', '/*.*/**', { dot: true, strictSlashes: true }));
        });
      });

      describe('should not match trailing single-dots', () => {
        test('with single star', () => {
          expect_truthy(!isMatch('abc/.', '*/*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '*/*/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '*/*/*', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/./', '*/*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '*/*/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '*/*/*', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc/./', '*/*/*/*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/./', '*/*/*/*/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/abc/./', '*/*/*/*/*', { dot: true, strictSlashes: true }));
        });

        test('with dot + star', () => {
          expect_truthy(!isMatch('abc/.', '*/.*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '*/.*/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '*/.*/*', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/./', '*/.*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '*/.*/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '*/.*/*', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc/./', '*/.*/*/.*', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/./', '*/.*/*/.*/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/abc/./', '*/.*/*/.*/*', { dot: true, strictSlashes: true }));
        });

        test('with star + dot', () => {
          expect_truthy(!isMatch('abc/.', '*/*.', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '*/*./', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '*/*./*', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/./', '*/*.', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '*/*./', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '*/*./*', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc/./', '*/*./*/*.', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/./', '*/*./*/*./', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/abc/./', '*/*./*/*./*', { dot: true, strictSlashes: true }));
        });

        test('with globstar', () => {
          expect_truthy(!isMatch('abc/.', '**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '**/**/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '**/**/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/./', '**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '**/**/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '**/**/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc/./', '**/**/**/**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/./', '**/**/**/**/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/abc/./', '**/**/**/**/**', { dot: true, strictSlashes: true }));
        });

        test('with dot + globstar', () => {
          expect_truthy(!isMatch('abc/.', '**/.**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '**/.**/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '**/.**/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/./', '**/.**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '**/.**/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '**/.**/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc/./', '**/.**/**/.**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/./', '**/.**/**/.**/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/abc/./', '**/.**/**/.**/**', { dot: true, strictSlashes: true }));
        });

        test('with globstar + dot + globstar', () => {
          expect_truthy(!isMatch('abc/.', '**/**.**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '**/**.**/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '**/**.**/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/./', '**/**.**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '**/**.**/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '**/**.**/**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc/./', '**/**.**/**/**.**', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/./', '**/**.**/**/**.**/', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/abc/./', '**/**.**/**/.**/**', { dot: true, strictSlashes: true }));
        });

        test('with globstar + dot', () => {
          expect_truthy(!isMatch('abc/.', '**/**.', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '**/**./', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/.', '**/**./**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/./', '**/**.', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '**/**./', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./', '**/**./**', { dot: true, strictSlashes: true }));

          expect_truthy(!isMatch('abc/./abc/./', '**/**./**/**.', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/./', '**/**./**/**./', { dot: true, strictSlashes: true }));
          expect_truthy(!isMatch('abc/./abc/abc/./', '**/**./**/**./**', { dot: true, strictSlashes: true }));
        });
      });
    });
  });
});
