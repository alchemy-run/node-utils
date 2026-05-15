import { scan as _scan } from "./scan.ts";
import { parse as _parse } from "./parse.ts";
import * as utils from "./utils.ts";
import * as _constants from "./constants.ts";
import type { ScanOptions, ScanState } from "./scan.ts";
import type { ParseOptions } from "./parse.ts";

const isObject = (val: unknown): val is Record<string, unknown> =>
  !!val && typeof val === "object" && !Array.isArray(val);

export interface PicomatchOptions extends ParseOptions {
  ignore?: string | string[] | ParsedState;
  onMatch?: (result: MatchResult) => void;
  onResult?: (result: MatchResult) => void;
  onIgnore?: (result: MatchResult) => void;
  matchBase?: boolean;
  basename?: boolean;
  flags?: string;
  nocase?: boolean;
  debug?: boolean;
  format?: (input: string) => string;
}

export interface MatchResult {
  glob: string | string[] | ParsedState;
  state: any;
  regex: RegExp;
  posix?: boolean;
  input: string;
  output: string;
  match: boolean | RegExpExecArray | null;
  isMatch: boolean;
}

type ParsedState = any;

export type Matcher = ((
  input: string,
  returnObject?: boolean,
) => boolean | MatchResult) & { state?: any };

export function picomatch(
  glob: string | string[] | ParsedState,
  options?: PicomatchOptions,
  returnState = false,
): Matcher {
  if (Array.isArray(glob)) {
    const fns = glob.map((input) => picomatch(input, options, returnState));
    const arrayMatcher: Matcher = ((str: string) => {
      for (const isMatch of fns) {
        const state = (isMatch as any)(str);
        if (state) return state;
      }
      return false;
    }) as Matcher;
    return arrayMatcher;
  }

  const isState = isObject(glob) && (glob as any).tokens && (glob as any).input;

  if (glob === "" || (typeof glob !== "string" && !isState)) {
    throw new TypeError("Expected pattern to be a non-empty string");
  }

  const opts = options || {};
  const posix = (opts as any).windows;
  const regex = isState
    ? picomatch.compileRe(glob as ParsedState, options)
    : picomatch.makeRe(glob as string, options, false, true);

  const state = (regex as any).state;
  delete (regex as any).state;

  let isIgnored: (input: string) => boolean = () => false;
  if (opts.ignore) {
    const ignoreOpts = {
      ...options,
      ignore: undefined,
      onMatch: undefined,
      onResult: undefined,
    } as PicomatchOptions;
    isIgnored = picomatch(opts.ignore as any, ignoreOpts, returnState) as any;
  }

  const matcher: Matcher = ((input: string, returnObject = false) => {
    const { isMatch, match, output } = picomatch.test(input, regex, options, {
      glob: glob as any,
      posix,
    });
    const result: MatchResult = {
      glob: glob as any,
      state,
      regex,
      posix,
      input,
      output,
      match,
      isMatch,
    };

    if (typeof opts.onResult === "function") opts.onResult(result);

    if (isMatch === false) {
      result.isMatch = false;
      return returnObject ? result : false;
    }

    if (isIgnored(input)) {
      if (typeof opts.onIgnore === "function") opts.onIgnore(result);
      result.isMatch = false;
      return returnObject ? result : false;
    }

    if (typeof opts.onMatch === "function") opts.onMatch(result);
    return returnObject ? result : true;
  }) as Matcher;

  if (returnState) matcher.state = state;

  return matcher;
}

export namespace picomatch {
  export function parse(
    pattern: string | string[],
    options?: PicomatchOptions,
  ): any {
    if (Array.isArray(pattern)) return pattern.map((p) => parse(p, options));
    return _parse(pattern, { ...options, fastpaths: false });
  }
  export const scan = _scan;
  export const constants = _constants;

  export interface TestContext {
    glob?: string | ParsedState;
    posix?: boolean;
  }

  export function test(
    input: string,
    regex: RegExp,
    options?: PicomatchOptions,
    { glob, posix }: TestContext = {},
  ): { isMatch: boolean; match: boolean | RegExpExecArray | null; output: string } {
    if (typeof input !== "string") {
      throw new TypeError("Expected input to be a string");
    }

    if (input === "") return { isMatch: false, match: false, output: "" };

    const opts = options || {};
    const format = opts.format || (posix ? utils.toPosixSlashes : null);
    let match: boolean | RegExpExecArray | null = input === glob;
    let output = match && format ? format(input) : input;

    if (match === false) {
      output = format ? format(input) : input;
      match = output === glob;
    }

    if (match === false || opts.capture === true) {
      if (opts.matchBase === true || opts.basename === true) {
        match = matchBase(input, regex, options, posix);
      } else {
        match = regex.exec(output);
      }
    }

    return { isMatch: Boolean(match), match, output };
  }

  export function matchBase(
    input: string,
    glob: RegExp | string,
    options?: PicomatchOptions,
    _posix?: boolean,
  ): boolean {
    const regex = glob instanceof RegExp ? glob : makeRe(glob, options);
    return regex.test(utils.basename(input));
  }

  export function isMatch(
    str: string,
    patterns: string | string[],
    options?: PicomatchOptions,
  ): boolean | MatchResult {
    return picomatch(patterns, options)(str);
  }

  export function compileRe(
    state: ParsedState,
    options?: PicomatchOptions,
    returnOutput = false,
    returnState = false,
  ): RegExp {
    if (returnOutput === true) return (state as any).output;

    const opts = options || {};
    const prepend = opts.contains ? "" : "^";
    const append = opts.contains ? "" : "$";

    let source = `${prepend}(?:${(state as any).output})${append}`;
    if (state && (state as any).negated === true) {
      source = `^(?!${source}).*$`;
    }

    const regex = toRegex(source, options);
    if (returnState === true) (regex as any).state = state;

    return regex;
  }

  export function makeRe(
    input: string,
    options: PicomatchOptions = {},
    returnOutput = false,
    returnState = false,
  ): RegExp {
    if (!input || typeof input !== "string") {
      throw new TypeError("Expected a non-empty string");
    }

    let parsed: ParsedState = { negated: false, fastpaths: true };

    if (options.fastpaths !== false && (input[0] === "." || input[0] === "*")) {
      parsed.output = _parse.fastpaths(input, options);
    }

    if (!parsed.output) {
      parsed = _parse(input, options);
    }

    return compileRe(parsed, options, returnOutput, returnState);
  }

  export function toRegex(source: string, options?: PicomatchOptions): RegExp {
    try {
      const opts = options || {};
      return new RegExp(source, opts.flags || (opts.nocase ? "i" : ""));
    } catch (err) {
      if (options && options.debug === true) throw err;
      return /$^/;
    }
  }
}

export default picomatch;
