import { stringify as _stringify } from "./stringify.ts";
import { compile as _compile } from "./compile.ts";
import { expand as _expand } from "./expand.ts";
import { parse as _parse } from "./parse.ts";
import type { Node } from "./utils.ts";

export interface BracesOptions {
  expand?: boolean;
  nodupes?: boolean;
  noempty?: boolean;
  escapeInvalid?: boolean;
  keepEscaping?: boolean;
  keepQuotes?: boolean;
  maxLength?: number;
  rangeLimit?: number | false;
  step?: number | string;
  [k: string]: unknown;
}

export function braces(
  input: string | string[],
  options: BracesOptions = {},
): string[] {
  let output: string[] = [];

  if (Array.isArray(input)) {
    for (const pattern of input) {
      const result = braces.create(pattern, options);
      if (Array.isArray(result)) output.push(...result);
      else output.push(result);
    }
  } else {
    output = ([] as string[]).concat(braces.create(input, options));
  }

  if (options && options.expand === true && options.nodupes === true) {
    output = [...new Set(output)];
  }
  return output;
}

export namespace braces {
  export const parse = (input: string, options: BracesOptions = {}): Node =>
    _parse(input, options);

  export const stringify = (
    input: string | Node,
    options: BracesOptions = {},
  ): string => {
    if (typeof input === "string") {
      return _stringify(parse(input, options), options);
    }
    return _stringify(input, options);
  };

  export const compile = (
    input: string | Node,
    options: BracesOptions = {},
  ): string => {
    if (typeof input === "string") {
      input = parse(input, options);
    }
    return _compile(input, options);
  };

  export const expand = (
    input: string | Node,
    options: BracesOptions = {},
  ): string[] => {
    if (typeof input === "string") {
      input = parse(input, options);
    }
    let result = _expand(input, options);
    if (options.noempty === true) result = result.filter(Boolean);
    if (options.nodupes === true) result = [...new Set(result)];
    return result;
  };

  export const create = (
    input: string,
    options: BracesOptions = {},
  ): string | string[] => {
    if (input === "" || input.length < 3) return [input];
    return options.expand !== true
      ? compile(input, options)
      : expand(input, options);
  };
}

export default braces;
