import path from "node:path";
import {
  REGEX_BACKSLASH,
  REGEX_REMOVE_BACKSLASH,
  REGEX_SPECIAL_CHARS,
  REGEX_SPECIAL_CHARS_GLOBAL,
} from "./constants.ts";

export const isObject = (val: unknown): val is Record<string, unknown> =>
  val !== null && typeof val === "object" && !Array.isArray(val);

export const hasRegexChars = (str: string): boolean =>
  REGEX_SPECIAL_CHARS.test(str);

export const isRegexChar = (str: string): boolean =>
  str.length === 1 && hasRegexChars(str);

export const escapeRegex = (str: string): string =>
  str.replace(REGEX_SPECIAL_CHARS_GLOBAL, "\\$1");

export const toPosixSlashes = (str: string): string =>
  str.replace(REGEX_BACKSLASH, "/");

export const isWindows = (): boolean => {
  // Tests mutate `path.sep` to simulate Windows. Respect that override so
  // mm.capture / utils.toPosixSlashes() paths kick in without a real Windows host.
  if (path.sep === "\\") return true;
  if (typeof process !== "undefined" && process.platform) {
    return process.platform === "win32";
  }
  return false;
};

export const removeBackslashes = (str: string): string => {
  return str.replace(REGEX_REMOVE_BACKSLASH, (match) =>
    match === "\\" ? "" : match,
  );
};

export const escapeLast = (
  input: string,
  char: string,
  lastIdx?: number,
): string => {
  const idx = input.lastIndexOf(char, lastIdx);
  if (idx === -1) return input;
  if (input[idx - 1] === "\\") return escapeLast(input, char, idx - 1);
  return `${input.slice(0, idx)}\\${input.slice(idx)}`;
};

export interface PrefixState {
  prefix?: string;
  negated?: boolean;
  [k: string]: unknown;
}

export const removePrefix = (input: string, state: PrefixState = {}): string => {
  let output = input;
  if (output.startsWith("./")) {
    output = output.slice(2);
    state.prefix = "./";
  }
  return output;
};

export interface WrapOutputOptions {
  contains?: boolean;
  [k: string]: unknown;
}

export const wrapOutput = (
  input: string,
  state: PrefixState = {},
  options: WrapOutputOptions = {},
): string => {
  const prepend = options.contains ? "" : "^";
  const append = options.contains ? "" : "$";

  let output = `${prepend}(?:${input})${append}`;
  if (state.negated === true) {
    output = `(?:^(?!${output}).*$)`;
  }
  return output;
};

export const basename = (
  path: string,
  { windows }: { windows?: boolean } = {},
): string => {
  const segs = path.split(windows ? /[\\/]/ : "/");
  const last = segs[segs.length - 1];
  if (last === "") return segs[segs.length - 2];
  return last;
};
