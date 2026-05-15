/**
 * Resolved options for a single glob call. Mirrors upstream `fast-glob`'s public
 * `Options` surface but drops the `fs` adapter (we use `FileSystem.FileSystem`)
 * and node-only bits like `signal` (Effect handles cancellation directly).
 */

export type Pattern = string;

export interface Options {
  absolute?: boolean;
  baseNameMatch?: boolean;
  braceExpansion?: boolean;
  caseSensitiveMatch?: boolean;
  cwd?: string;
  deep?: number;
  dot?: boolean;
  extglob?: boolean;
  followSymbolicLinks?: boolean;
  globstar?: boolean;
  ignore?: readonly Pattern[];
  markDirectories?: boolean;
  objectMode?: boolean;
  onlyDirectories?: boolean;
  onlyFiles?: boolean;
  stats?: boolean;
  suppressErrors?: boolean;
  throwErrorOnBrokenSymbolicLink?: boolean;
  unique?: boolean;
}

export interface Settings {
  readonly absolute: boolean;
  readonly baseNameMatch: boolean;
  readonly braceExpansion: boolean;
  readonly caseSensitiveMatch: boolean;
  readonly cwd: string;
  readonly deep: number;
  readonly dot: boolean;
  readonly extglob: boolean;
  readonly followSymbolicLinks: boolean;
  readonly globstar: boolean;
  readonly ignore: readonly Pattern[];
  readonly markDirectories: boolean;
  readonly objectMode: boolean;
  readonly onlyDirectories: boolean;
  readonly onlyFiles: boolean;
  readonly stats: boolean;
  readonly suppressErrors: boolean;
  readonly throwErrorOnBrokenSymbolicLink: boolean;
  readonly unique: boolean;
}

export function resolveSettings(options: Options = {}): Settings {
  const onlyDirectories = options.onlyDirectories ?? false;
  const stats = options.stats ?? false;
  return {
    absolute: options.absolute ?? false,
    baseNameMatch: options.baseNameMatch ?? false,
    braceExpansion: options.braceExpansion ?? true,
    caseSensitiveMatch: options.caseSensitiveMatch ?? true,
    cwd: options.cwd ?? process.cwd(),
    deep: options.deep ?? Number.POSITIVE_INFINITY,
    dot: options.dot ?? false,
    extglob: options.extglob ?? true,
    followSymbolicLinks: options.followSymbolicLinks ?? true,
    globstar: options.globstar ?? true,
    ignore: options.ignore ?? [],
    markDirectories: options.markDirectories ?? false,
    // stats implies objectMode.
    objectMode: stats ? true : (options.objectMode ?? false),
    onlyDirectories,
    // onlyDirectories disables onlyFiles.
    onlyFiles: onlyDirectories ? false : (options.onlyFiles ?? true),
    stats,
    suppressErrors: options.suppressErrors ?? false,
    throwErrorOnBrokenSymbolicLink: options.throwErrorOnBrokenSymbolicLink ?? false,
    unique: options.unique ?? true,
  };
}

export interface Entry {
  name: string;
  path: string;
  dirent: {
    isFile: boolean;
    isDirectory: boolean;
    isSymbolicLink: boolean;
  };
  stats?: import("node:fs").Stats;
}

export type EntryItem = string | Entry;
