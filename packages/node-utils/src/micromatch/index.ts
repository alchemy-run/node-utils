import util from "node:util";
import { braces as _braces } from "../braces/index.ts";
import { picomatch } from "../picomatch/index.ts";
import * as utils from "../picomatch/utils.ts";

const isEmptyString = (v: string): boolean => v === "" || v === "./";
const hasBraces = (v: string): boolean => {
  const index = v.indexOf("{");
  return index > -1 && v.indexOf("}", index) > -1;
};

export interface MicromatchOptions {
  onResult?: (state: any) => void;
  failglob?: boolean;
  nonull?: boolean;
  nullglob?: boolean;
  unescape?: boolean;
  nobrace?: boolean;
  expand?: boolean;
  contains?: boolean;
  capture?: boolean;
  [k: string]: unknown;
}

export function micromatch(
  list: string | string[],
  patterns: string | string[],
  options?: MicromatchOptions,
): string[] {
  patterns = ([] as string[]).concat(patterns);
  list = ([] as string[]).concat(list);

  const omit: Set<string> = new Set();
  const keep: Set<string> = new Set();
  const items: Set<string> = new Set();
  let negatives = 0;

  const onResult = (state: any) => {
    items.add(state.output);
    if (options && options.onResult) options.onResult(state);
  };

  // Match upstream: if running on (or simulating) Windows, default windows mode on.
  const resolvedOpts = {
    windows: utils.isWindows(),
    ...options,
    onResult,
  };

  for (let i = 0; i < patterns.length; i++) {
    const isMatch = picomatch(
      String(patterns[i]),
      resolvedOpts as any,
      true,
    );
    const negated =
      (isMatch as any).state.negated || (isMatch as any).state.negatedExtglob;
    if (negated) negatives++;

    for (const item of list) {
      const matched = (isMatch as any)(item, true);

      const match = negated ? !matched.isMatch : matched.isMatch;
      if (!match) continue;

      if (negated) {
        omit.add(matched.output);
      } else {
        omit.delete(matched.output);
        keep.add(matched.output);
      }
    }
  }

  const result = negatives === patterns.length ? [...items] : [...keep];
  const matches = result.filter((item) => !omit.has(item));

  if (options && matches.length === 0) {
    if (options.failglob === true) {
      throw new Error(`No matches found for "${(patterns as string[]).join(", ")}"`);
    }

    if (options.nonull === true || options.nullglob === true) {
      return options.unescape
        ? (patterns as string[]).map((p) => p.replace(/\\/g, ""))
        : (patterns as string[]);
    }
  }

  return matches;
}

export namespace micromatch {
  export const match = micromatch;

  export const matcher = (pattern: string, options?: MicromatchOptions): any =>
    picomatch(pattern, options as any);

  export function isMatch(
    str: string,
    patterns: string | string[],
    options?: MicromatchOptions,
  ): boolean {
    const opts = { windows: utils.isWindows(), ...options };
    return picomatch(patterns, opts as any)(str) as boolean;
  }

  export const any = isMatch;

  export function not(
    list: string | string[],
    patterns: string | string[],
    options: MicromatchOptions = {},
  ): string[] {
    patterns = ([] as string[]).concat(patterns).map(String);
    const result: Set<string> = new Set();
    const items: string[] = [];

    const onResult = (state: any) => {
      if (options.onResult) options.onResult(state);
      items.push(state.output);
    };

    const matches: Set<string> = new Set(
      micromatch(list, patterns, { ...options, onResult }),
    );

    for (const item of items) {
      if (!matches.has(item)) result.add(item);
    }
    return [...result];
  }

  export function contains(
    str: string,
    pattern: string | string[],
    options?: MicromatchOptions,
  ): boolean {
    if (typeof str !== "string") {
      throw new TypeError(`Expected a string: "${util.inspect(str)}"`);
    }

    if (Array.isArray(pattern)) {
      return pattern.some((p) => contains(str, p, options));
    }

    if (typeof pattern === "string") {
      if (isEmptyString(str) || isEmptyString(pattern)) return false;
      if (
        str.includes(pattern) ||
        (str.startsWith("./") && str.slice(2).includes(pattern))
      ) {
        return true;
      }
    }

    return isMatch(str, pattern, { ...options, contains: true });
  }

  export function matchKeys<T>(
    obj: Record<string, T>,
    patterns: string | string[],
    options?: MicromatchOptions,
  ): Record<string, T> {
    if (!utils.isObject(obj)) {
      throw new TypeError("Expected the first argument to be an object");
    }
    const keys = micromatch(Object.keys(obj), patterns, options);
    const res: Record<string, T> = {};
    for (const key of keys) res[key] = obj[key];
    return res;
  }

  export function some(
    list: string | string[],
    patterns: string | string[],
    options?: MicromatchOptions,
  ): boolean {
    const items = ([] as string[]).concat(list);
    for (const pattern of ([] as string[]).concat(patterns)) {
      const isMatchFn = picomatch(String(pattern), options as any);
      if (items.some((item) => (isMatchFn as any)(item))) return true;
    }
    return false;
  }

  export function every(
    list: string | string[],
    patterns: string | string[],
    options?: MicromatchOptions,
  ): boolean {
    const items = ([] as string[]).concat(list);
    for (const pattern of ([] as string[]).concat(patterns)) {
      const isMatchFn = picomatch(String(pattern), options as any);
      if (!items.every((item) => (isMatchFn as any)(item))) return false;
    }
    return true;
  }

  export function all(
    str: string,
    patterns: string | string[],
    options?: MicromatchOptions,
  ): boolean {
    if (typeof str !== "string") {
      throw new TypeError(`Expected a string: "${util.inspect(str)}"`);
    }
    return ([] as string[])
      .concat(patterns)
      .every((p) => (picomatch(p, options as any) as any)(str));
  }

  export function capture(
    glob: string,
    input: string,
    options?: MicromatchOptions,
  ): string[] | undefined {
    const posix = utils.isWindows();
    const regex = picomatch.makeRe(String(glob), {
      ...options,
      capture: true,
    } as any);
    const match = regex.exec(posix ? utils.toPosixSlashes(input) : input);

    if (match) {
      return match.slice(1).map((v) => (v === undefined ? "" : v));
    }
    return undefined;
  }

  export const makeRe = (
    pattern: string,
    options?: MicromatchOptions,
  ): RegExp => picomatch.makeRe(pattern, options as any);

  export const scan = (pattern: string, options?: any) =>
    picomatch.scan(pattern, options);

  export function parse(
    patterns: string | string[],
    options?: MicromatchOptions,
  ): any[] {
    const res: any[] = [];
    for (const pattern of ([] as string[]).concat(patterns || [])) {
      for (const str of _braces(String(pattern), options as any)) {
        res.push(picomatch.parse(str, options as any));
      }
    }
    return res;
  }

  export function braces(
    pattern: string,
    options?: MicromatchOptions,
  ): string[] {
    if (typeof pattern !== "string") throw new TypeError("Expected a string");
    if ((options && options.nobrace === true) || !hasBraces(pattern)) {
      return [pattern];
    }
    return _braces(pattern, options as any);
  }

  export function braceExpand(
    pattern: string,
    options?: MicromatchOptions,
  ): string[] {
    if (typeof pattern !== "string") throw new TypeError("Expected a string");
    return braces(pattern, { ...options, expand: true });
  }

  export const hasBraces: (v: string) => boolean = (v) => {
    const index = v.indexOf("{");
    return index > -1 && v.indexOf("}", index) > -1;
  };
}

export default micromatch;
