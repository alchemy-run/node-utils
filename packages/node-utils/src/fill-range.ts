import util from "node:util";
import { isNumber } from "./is-number.ts";

// ---------------------------------------------------------------------------
// to-regex-range (inlined from https://github.com/micromatch/to-regex-range)
// ---------------------------------------------------------------------------

export interface ToRegexRangeOptions {
  relaxZeros?: boolean;
  strictZeros?: boolean;
  shorthand?: boolean;
  capture?: boolean;
  wrap?: boolean;
}

interface ResolvedToRegexRangeOptions {
  relaxZeros: boolean;
  shorthand?: boolean;
  capture?: boolean;
  wrap?: boolean;
}

interface RangeToken {
  pattern: string;
  count: number[];
  digits: number;
  string?: string;
}

interface RangeState {
  min: number;
  max: number;
  a: number;
  b: number;
  isPadded?: boolean;
  maxLen?: number;
  negatives?: RangeToken[];
  positives?: RangeToken[];
  result?: string;
}

export function toRegexRange(
  min: number | string,
  max?: number | string,
  options?: ToRegexRangeOptions,
): string {
  if (isNumber(min) === false) {
    throw new TypeError("toRegexRange: expected the first argument to be a number");
  }

  if (max === undefined || min === max) {
    return String(min);
  }

  if (isNumber(max) === false) {
    throw new TypeError("toRegexRange: expected the second argument to be a number.");
  }

  const opts: ResolvedToRegexRangeOptions = { relaxZeros: true, ...options };
  if (typeof options?.strictZeros === "boolean") {
    opts.relaxZeros = options.strictZeros === false;
  }

  const cacheKey = `${min}:${max}=${String(opts.relaxZeros)}${String(opts.shorthand)}${String(opts.capture)}${String(opts.wrap)}`;
  if (Object.prototype.hasOwnProperty.call(toRegexRange.cache, cacheKey)) {
    return toRegexRange.cache[cacheKey].result!;
  }

  const minNum = Number(min);
  const maxNum = Number(max);
  let a = Math.min(minNum, maxNum);
  const b = Math.max(minNum, maxNum);

  if (Math.abs(a - b) === 1) {
    const result = `${min}|${max}`;
    if (opts.capture) return `(${result})`;
    if (opts.wrap === false) return result;
    return `(?:${result})`;
  }

  const isPadded = hasPadding(String(min)) || hasPadding(String(max));
  const state: RangeState = { min: minNum, max: maxNum, a, b };
  let positives: RangeToken[] = [];
  let negatives: RangeToken[] = [];

  if (isPadded) {
    state.isPadded = isPadded;
    // Preserve original-string padding length when callers passed zero-padded strings.
    state.maxLen = String(max).length;
  }

  if (a < 0) {
    const newMin = b < 0 ? Math.abs(b) : 1;
    negatives = splitToPatterns(newMin, Math.abs(a), state, opts);
    a = state.a = 0;
  }

  if (b >= 0) {
    positives = splitToPatterns(a, b, state, opts);
  }

  state.negatives = negatives;
  state.positives = positives;
  state.result = collatePatterns(negatives, positives);

  if (opts.capture === true) {
    state.result = `(${state.result})`;
  } else if (opts.wrap !== false && positives.length + negatives.length > 1) {
    state.result = `(?:${state.result})`;
  }

  toRegexRange.cache[cacheKey] = state;
  return state.result;
}

export namespace toRegexRange {
  export const cache: Record<string, RangeState> = {};
  export const clearCache = (): void => {
    for (const k of Object.keys(cache)) delete cache[k];
  };
}

function collatePatterns(neg: RangeToken[], pos: RangeToken[]): string {
  const onlyNegative = filterPatterns(neg, pos, "-", false);
  const onlyPositive = filterPatterns(pos, neg, "", false);
  const intersected = filterPatterns(neg, pos, "-?", true);
  return [...onlyNegative, ...intersected, ...onlyPositive].join("|");
}

function splitToRanges(min: number, max: number): number[] {
  let nines = 1;
  let zeros = 1;

  let stop = countNines(min, nines);
  const stops = new Set<number>([max]);

  while (min <= stop && stop <= max) {
    stops.add(stop);
    nines += 1;
    stop = countNines(min, nines);
  }

  stop = countZeros(max + 1, zeros) - 1;

  while (min < stop && stop <= max) {
    stops.add(stop);
    zeros += 1;
    stop = countZeros(max + 1, zeros) - 1;
  }

  return [...stops].sort((a, b) => (a > b ? 1 : b > a ? -1 : 0));
}

function rangeToPattern(
  start: string,
  stop: string,
  options: ResolvedToRegexRangeOptions,
): RangeToken {
  if (start === stop) {
    return { pattern: start, count: [], digits: 0 };
  }

  const zipped = zip(start, stop);
  const digits = zipped.length;
  let pattern = "";
  let count = 0;

  for (let i = 0; i < digits; i++) {
    const [startDigit, stopDigit] = zipped[i];

    if (startDigit === stopDigit) {
      pattern += startDigit;
    } else if (startDigit !== "0" || stopDigit !== "9") {
      pattern += toCharacterClass(startDigit, stopDigit);
    } else {
      count++;
    }
  }

  if (count) {
    pattern += options.shorthand === true ? "\\d" : "[0-9]";
  }

  return { pattern, count: [count], digits };
}

function splitToPatterns(
  min: number,
  max: number,
  tok: RangeState,
  options: ResolvedToRegexRangeOptions,
): RangeToken[] {
  const ranges = splitToRanges(min, max);
  const tokens: RangeToken[] = [];
  let start = min;
  let prev: RangeToken | undefined;

  for (let i = 0; i < ranges.length; i++) {
    const maxR = ranges[i];
    const obj = rangeToPattern(String(start), String(maxR), options);
    let zerosStr = "";

    if (!tok.isPadded && prev && prev.pattern === obj.pattern) {
      if (prev.count.length > 1) {
        prev.count.pop();
      }
      prev.count.push(obj.count[0]);
      prev.string = prev.pattern + toQuantifier(prev.count);
      start = maxR + 1;
      continue;
    }

    if (tok.isPadded) {
      zerosStr = padZeros(maxR, tok, options);
    }

    obj.string = zerosStr + obj.pattern + toQuantifier(obj.count);
    tokens.push(obj);
    start = maxR + 1;
    prev = obj;
  }

  return tokens;
}

function filterPatterns(
  arr: RangeToken[],
  comparison: RangeToken[],
  prefix: string,
  intersection: boolean,
): string[] {
  const result: string[] = [];
  for (const ele of arr) {
    const { string } = ele;
    if (!intersection && !contains(comparison, string!)) result.push(prefix + string);
    if (intersection && contains(comparison, string!)) result.push(prefix + string);
  }
  return result;
}

function zip(a: string, b: string): [string, string][] {
  const arr: [string, string][] = [];
  for (let i = 0; i < a.length; i++) arr.push([a[i], b[i]]);
  return arr;
}

function contains(arr: RangeToken[], val: string): boolean {
  return arr.some((ele) => ele.string === val);
}

function countNines(min: number, len: number): number {
  return Number(String(min).slice(0, -len) + "9".repeat(len));
}

function countZeros(integer: number, zeros: number): number {
  return integer - (integer % Math.pow(10, zeros));
}

function toQuantifier(digits: number[]): string {
  const [start = 0, stop = ""] = digits;
  if (stop || start > 1) {
    return `{${start}${stop ? `,${stop}` : ""}}`;
  }
  return "";
}

function toCharacterClass(a: string, b: string): string {
  return `[${a}${Number(b) - Number(a) === 1 ? "" : "-"}${b}]`;
}

function hasPadding(str: string): boolean {
  return /^-?(0+)\d/.test(str);
}

function padZeros(
  value: number,
  tok: RangeState,
  options: ResolvedToRegexRangeOptions,
): string {
  if (!tok.isPadded) return String(value);
  const diff = Math.abs(tok.maxLen! - String(value).length);
  const relax = options.relaxZeros !== false;
  switch (diff) {
    case 0:
      return "";
    case 1:
      return relax ? "0?" : "0";
    case 2:
      return relax ? "0{0,2}" : "00";
    default:
      return relax ? `0{0,${diff}}` : `0{${diff}}`;
  }
}

// ---------------------------------------------------------------------------
// fill-range
// ---------------------------------------------------------------------------

export interface FillRangeOptions {
  capture?: boolean;
  wrap?: boolean;
  toRegex?: boolean;
  stringify?: boolean;
  strictRanges?: boolean;
  step?: number | string;
  transform?: (value: number | string, index: number) => string | number;
}

type FillRangeReturn = (string | number)[] | string;

const isObject = (val: unknown): val is Record<string, unknown> =>
  val !== null && typeof val === "object" && !Array.isArray(val);

const transform =
  (toNumber: boolean) =>
  (value: number | string): number | string =>
    toNumber === true ? Number(value) : String(value);

const isValidValue = (value: unknown): value is number | string =>
  typeof value === "number" || (typeof value === "string" && value !== "");

const isInt = (num: unknown): boolean => Number.isInteger(+(num as number));

const hasLeadingZeros = (input: number | string): boolean => {
  let value = `${input}`;
  let index = -1;
  if (value[0] === "-") value = value.slice(1);
  if (value === "0") return false;
  while (value[++index] === "0");
  return index > 0;
};

const shouldStringify = (
  start: number | string,
  end: number | string,
  options: FillRangeOptions,
): boolean => {
  if (typeof start === "string" || typeof end === "string") return true;
  return options.stringify === true;
};

const pad = (
  input: string | number,
  maxLength: number,
  toNumber: boolean,
): string | number => {
  if (maxLength > 0) {
    let str = String(input);
    const dash = str[0] === "-" ? "-" : "";
    if (dash) str = str.slice(1);
    str = dash + str.padStart(dash ? maxLength - 1 : maxLength, "0");
    if (toNumber === false) return str;
    return str;
  }
  if (toNumber === false) return String(input);
  return input;
};

const toMaxLen = (input: string, maxLength: number): string => {
  let negative = input[0] === "-" ? "-" : "";
  if (negative) {
    input = input.slice(1);
    maxLength--;
  }
  while (input.length < maxLength) input = "0" + input;
  return negative ? "-" + input : input;
};

interface Parts {
  negatives: number[];
  positives: number[];
}

const toSequence = (
  parts: Parts,
  options: FillRangeOptions,
  maxLen: number,
): string => {
  parts.negatives.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  parts.positives.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  const prefix = options.capture ? "" : "?:";
  let positives = "";
  let negatives = "";
  let result: string;

  if (parts.positives.length) {
    positives = parts.positives.map((v) => toMaxLen(String(v), maxLen)).join("|");
  }
  if (parts.negatives.length) {
    negatives = `-(${prefix}${parts.negatives.map((v) => toMaxLen(String(v), maxLen)).join("|")})`;
  }
  if (positives && negatives) result = `${positives}|${negatives}`;
  else result = positives || negatives;

  if (options.wrap) return `(${prefix}${result})`;
  return result;
};

const toRange = (
  a: number | string,
  b: number | string,
  isNumbers: boolean,
  options: FillRangeOptions,
): string => {
  if (isNumbers) return toRegexRange(a, b, { wrap: false, ...options });

  const start = String.fromCharCode(Number(a));
  if (a === b) return start;
  const stop = String.fromCharCode(Number(b));
  return `[${start}-${stop}]`;
};

const toRegex = (
  start: string[] | number | string,
  end: number | string | null,
  options: FillRangeOptions,
): string => {
  if (Array.isArray(start)) {
    const wrap = options.wrap === true;
    const prefix = options.capture ? "" : "?:";
    return wrap ? `(${prefix}${start.join("|")})` : start.join("|");
  }
  return toRegexRange(start, end ?? undefined, options);
};

const rangeError = (args: unknown): RangeError =>
  new RangeError("Invalid range arguments: " + util.inspect(args));

const invalidRange = (
  start: unknown,
  end: unknown,
  options: FillRangeOptions,
): string[] => {
  if (options.strictRanges === true) throw rangeError([start, end]);
  return [];
};

const invalidStep = (step: unknown, options: FillRangeOptions): string[] => {
  if (options.strictRanges === true) {
    throw new TypeError(`Expected step "${step}" to be a number`);
  }
  return [];
};

const fillNumbers = (
  start: number | string,
  end: number | string,
  step: number | string = 1,
  options: FillRangeOptions = {},
): FillRangeReturn => {
  let a = Number(start);
  let b = Number(end);

  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    if (options.strictRanges === true) throw rangeError([start, end]);
    return [];
  }

  if (a === 0) a = 0;
  if (b === 0) b = 0;

  const descending = a > b;
  const startString = String(start);
  const endString = String(end);
  const stepString = String(step);
  const stepNum = Math.max(Math.abs(Number(step)), 1);

  const padded = hasLeadingZeros(startString) || hasLeadingZeros(endString) || hasLeadingZeros(stepString);
  const maxLen = padded
    ? Math.max(startString.length, endString.length, stepString.length)
    : 0;
  const toNumber = padded === false && shouldStringify(start, end, options) === false;
  const format = options.transform || transform(toNumber);

  if (options.toRegex && stepNum === 1) {
    return toRange(
      toMaxLen(String(start), maxLen),
      toMaxLen(String(end), maxLen),
      true,
      options,
    );
  }

  const parts: Parts = { negatives: [], positives: [] };
  const push = (num: number) =>
    parts[num < 0 ? "negatives" : "positives"].push(Math.abs(num));
  const range: (string | number)[] = [];
  let index = 0;

  while (descending ? a >= b : a <= b) {
    if (options.toRegex === true && stepNum > 1) {
      push(a);
    } else {
      range.push(pad(format(a, index), maxLen, toNumber));
    }
    a = descending ? a - stepNum : a + stepNum;
    index++;
  }

  if (options.toRegex === true) {
    return stepNum > 1
      ? toSequence(parts, options, maxLen)
      : toRegex(range, null, { wrap: false, ...options });
  }

  return range;
};

const fillLetters = (
  start: number | string,
  end: number | string,
  step: number = 1,
  options: FillRangeOptions = {},
): FillRangeReturn => {
  if (
    (!isInt(start) && String(start).length > 1) ||
    (!isInt(end) && String(end).length > 1)
  ) {
    return invalidRange(start, end, options);
  }

  const format =
    options.transform ||
    ((val: number | string) => String.fromCharCode(Number(val)));
  let a = `${start}`.charCodeAt(0);
  const b = `${end}`.charCodeAt(0);

  const descending = a > b;
  const min = Math.min(a, b);
  const max = Math.max(a, b);

  if (options.toRegex && step === 1) return toRange(min, max, false, options);

  const range: string[] = [];
  let index = 0;

  while (descending ? a >= b : a <= b) {
    range.push(String(format(a, index)));
    a = descending ? a - step : a + step;
    index++;
  }

  if (options.toRegex === true) return toRegex(range, null, { wrap: false, ...options });
  return range;
};

export function fill(
  start: number | string,
  end?: number | string | null,
  step?:
    | number
    | string
    | FillRangeOptions
    | ((v: number | string, i: number) => string | number),
  options: FillRangeOptions = {},
): FillRangeReturn {
  if (end == null && isValidValue(start)) return [String(start)];

  if (!isValidValue(start) || !isValidValue(end)) {
    return invalidRange(start, end, options);
  }

  if (typeof step === "function") return fill(start, end, 1, { transform: step });

  if (isObject(step)) return fill(start, end, 0, step as FillRangeOptions);

  const opts: FillRangeOptions = { ...options };
  if (opts.capture === true) opts.wrap = true;
  const s = (step as number | string) || opts.step || 1;

  if (!isInt(s)) {
    if (s != null && !isObject(s)) return invalidStep(s, opts);
    return fill(start, end, 1, s as FillRangeOptions);
  }

  if (isInt(start) && isInt(end)) return fillNumbers(start, end, s, opts);
  return fillLetters(start, end, Math.max(Math.abs(Number(s)), 1), opts);
}

export default fill;
