/**
 * Pattern utilities — glob parsing, classification, brace expansion.
 *
 * Replaces upstream `utils/pattern.ts` + `glob-parent` dep. We use our vendored
 * `micromatch` (which itself uses `picomatch.scan` for splitting base/glob).
 */
import path from "node:path";
import micromatch from "../micromatch/index.ts";
import braces from "../braces/index.ts";
import type { Pattern } from "./settings.ts";

const GLOBSTAR = "**";
const ESCAPE_SYMBOL = "\\";

const COMMON_GLOB_SYMBOLS_RE = /[*?]|^!/;
const REGEX_CHARACTER_CLASS_SYMBOLS_RE = /\[[^[]*]/;
const REGEX_GROUP_SYMBOLS_RE = /(?:^|[^!*+?@])\([^(]*\|[^|]*\)/;
const GLOB_EXTENSION_SYMBOLS_RE = /[!*+?@]\([^(]*\)/;
const BRACE_EXPANSION_SEPARATORS_RE = /,|\.\./;

const DOUBLE_SLASH_RE = /(?!^)\/{2,}/g;

interface PatternTypeOptions {
  braceExpansion?: boolean;
  caseSensitiveMatch?: boolean;
  extglob?: boolean;
}

export function isStaticPattern(p: Pattern, options: PatternTypeOptions = {}): boolean {
  return !isDynamicPattern(p, options);
}

export function isDynamicPattern(p: Pattern, options: PatternTypeOptions = {}): boolean {
  if (p === "") return false;
  if (options.caseSensitiveMatch === false || p.includes(ESCAPE_SYMBOL)) return true;
  if (
    COMMON_GLOB_SYMBOLS_RE.test(p) ||
    REGEX_CHARACTER_CLASS_SYMBOLS_RE.test(p) ||
    REGEX_GROUP_SYMBOLS_RE.test(p)
  ) {
    return true;
  }
  if (options.extglob !== false && GLOB_EXTENSION_SYMBOLS_RE.test(p)) return true;
  if (options.braceExpansion !== false && hasBraceExpansion(p)) return true;
  return false;
}

function hasBraceExpansion(p: string): boolean {
  const open = p.indexOf("{");
  if (open === -1) return false;
  const close = p.indexOf("}", open + 1);
  if (close === -1) return false;
  return BRACE_EXPANSION_SEPARATORS_RE.test(p.slice(open, close));
}

export const convertToPositivePattern = (p: Pattern): Pattern =>
  isNegativePattern(p) ? p.slice(1) : p;

export const convertToNegativePattern = (p: Pattern): Pattern => `!${p}`;

export const isNegativePattern = (p: Pattern): boolean =>
  p.startsWith("!") && p[1] !== "(";

export const isPositivePattern = (p: Pattern): boolean => !isNegativePattern(p);

export const getNegativePatterns = (patterns: Pattern[]): Pattern[] =>
  patterns.filter(isNegativePattern);

export const getPositivePatterns = (patterns: Pattern[]): Pattern[] =>
  patterns.filter(isPositivePattern);

export const isPatternRelatedToParentDirectory = (p: Pattern): boolean =>
  p.startsWith("..") || p.startsWith("./..");

export const getPatternsInsideCurrentDirectory = (patterns: Pattern[]): Pattern[] =>
  patterns.filter((p) => !isPatternRelatedToParentDirectory(p));

export const getPatternsOutsideCurrentDirectory = (patterns: Pattern[]): Pattern[] =>
  patterns.filter(isPatternRelatedToParentDirectory);

/**
 * Replaces upstream glob-parent. picomatch.scan returns the static prefix
 * directly (handles brackets, parens, etc.).
 */
export function getBaseDirectory(pattern: Pattern): string {
  const scan = micromatch.scan(pattern);
  if (!scan.base) return ".";
  return scan.base;
}

export const hasGlobStar = (p: Pattern): boolean => p.includes(GLOBSTAR);

export const endsWithSlashGlobStar = (p: Pattern): boolean =>
  p.endsWith(`/${GLOBSTAR}`);

export const isAffectDepthOfReadingPattern = (p: Pattern): boolean => {
  const basename = path.basename(p);
  return endsWithSlashGlobStar(p) || isStaticPattern(basename);
};

export function expandPatternsWithBraceExpansion(patterns: Pattern[]): Pattern[] {
  return patterns.flatMap(expandBraceExpansion);
}

export function expandBraceExpansion(p: Pattern): Pattern[] {
  const expanded = braces(p, { expand: true, nodupes: true, keepEscaping: true });
  expanded.sort((a, b) => a.length - b.length);
  return expanded.filter((x) => x !== "");
}

export function getPatternParts(p: Pattern, options: any = {}): Pattern[] {
  const scan = micromatch.scan(p, { ...options, parts: true });
  let parts = scan.parts ?? [];
  if (parts.length === 0) parts = [p];
  if (parts[0].startsWith("/")) {
    parts[0] = parts[0].slice(1);
    parts.unshift("");
  }
  return parts;
}

export const makeRe = (p: Pattern, options: any = {}): RegExp =>
  micromatch.makeRe(p, options);

export const convertPatternsToRe = (patterns: Pattern[], options: any = {}): RegExp[] =>
  patterns.map((p) => makeRe(p, options));

export const matchAny = (entry: string, patternsRe: RegExp[]): boolean =>
  patternsRe.some((re) => re.test(entry));

export const removeDuplicateSlashes = (p: string): string =>
  p.replaceAll(DOUBLE_SLASH_RE, "/");

export const isAbsolute = (p: string): boolean => path.isAbsolute(p);

export function partitionAbsoluteAndRelative(
  patterns: Pattern[],
): [Pattern[], Pattern[]] {
  const absolute: Pattern[] = [];
  const relative: Pattern[] = [];
  for (const p of patterns) {
    if (isAbsolute(p)) absolute.push(p);
    else relative.push(p);
  }
  return [absolute, relative];
}

export function removeBackslashes(p: string): string {
  return p.replace(/(?:\[.*?[^\\]\]|\\(?=.))/g, (m) => (m === "\\" ? "" : m));
}
