/**
 * Directory walker, Effect-based.
 *
 * Collapses upstream's `readers/` + `providers/` + `filters/` + `transformers/`
 * layering into one function. Uses `FileSystem.FileSystem` for IO and `Path.Path`
 * for path joining (cross-platform via `BunServices.layer`).
 */
import { Effect, FileSystem, Option, Path, Stream } from "effect";
import micromatch from "../micromatch/index.ts";
import * as pattern from "./pattern.ts";
import type { Entry, Pattern, Settings } from "./settings.ts";
import type { Task } from "./tasks.ts";

const MICROMATCH_DOT_OPTS = {
  dot: true,
  basename: false,
  nobrace: true,
  nocase: false,
  noext: false,
  noglobstar: false,
};

interface CompiledTask {
  base: string;
  positiveRe: RegExp[];
  negativeRe: RegExp[];
  /** Per-segment globs for early pruning of deep traversal. */
  positivePartsRe: RegExp[][];
  hasGlobstar: boolean;
  /** Static max depth implied by patterns; Infinity if any contains `**`. */
  maxDepth: number;
  dynamic: boolean;
}

function compileTask(task: Task, settings: Settings): CompiledTask {
  const mmOpts = {
    dot: settings.dot,
    basename: false,
    nobrace: !settings.braceExpansion,
    nocase: !settings.caseSensitiveMatch,
    noext: !settings.extglob,
    noglobstar: !settings.globstar,
  };
  const positiveRe = pattern.convertPatternsToRe(task.positive, mmOpts);
  const negativeRe = pattern.convertPatternsToRe(task.negative, mmOpts);
  const positivePartsRe: RegExp[][] = task.positive.map((p) =>
    pattern.getPatternParts(p, mmOpts).map((part) =>
      pattern.makeRe(part === "" ? "**" : part, mmOpts),
    ),
  );
  const hasGlobstar = task.positive.some(pattern.hasGlobStar);
  const maxDepth = hasGlobstar
    ? Number.POSITIVE_INFINITY
    : Math.max(
        ...task.positive.map(
          (p) => pattern.getPatternParts(p, mmOpts).length,
        ),
      );

  return {
    base: task.base,
    positiveRe,
    negativeRe,
    positivePartsRe,
    hasGlobstar,
    maxDepth,
    dynamic: task.dynamic,
  };
}

/** True if any positive pattern could still match something deeper than `depth`. */
function partialMatch(parts: string[], compiled: CompiledTask): boolean {
  if (compiled.hasGlobstar) return true;
  for (const patternParts of compiled.positivePartsRe) {
    if (patternParts.length <= parts.length) continue;
    let ok = true;
    for (let i = 0; i < parts.length; i++) {
      if (!patternParts[i].test(parts[i])) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}

interface WalkContext {
  cwd: string;
  base: string;
  compiled: CompiledTask;
  settings: Settings;
}

const yieldEntry = (entry: Entry, settings: Settings): string | Entry => {
  let path = entry.path;
  if (settings.markDirectories && entry.dirent.isDirectory && !path.endsWith("/")) {
    path = `${path}/`;
  }
  if (settings.objectMode) {
    return { ...entry, path };
  }
  return path;
};

const isMatched = (
  relPath: string,
  compiled: CompiledTask,
  settings: Settings,
): boolean => {
  if (settings.dot === false) {
    // Reject paths whose any segment starts with `.` unless an explicit positive matched.
    for (const seg of relPath.split("/")) {
      if (seg.startsWith(".") && seg !== "." && seg !== "..") {
        // The pattern itself may include the dot; only filter when no positive Re permits it.
        const allowed = compiled.positiveRe.some((re) => re.test(relPath));
        if (!allowed) return false;
        break;
      }
    }
  }
  if (!pattern.matchAny(relPath, compiled.positiveRe)) return false;
  if (pattern.matchAny(relPath, compiled.negativeRe)) return false;
  return true;
};

/**
 * Recursively walk `dir` (relative to `cwd`), emitting matched entries.
 */
function walkDir(
  ctx: WalkContext,
  relDir: string,
  depth: number,
): Stream.Stream<Entry, unknown, FileSystem.FileSystem | Path.Path> {
  return Stream.unwrap(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;

      const absDir = relDir === "" ? ctx.base : path.join(ctx.base, relDir);
      const fullDir = path.isAbsolute(absDir)
        ? absDir
        : path.join(ctx.cwd, absDir);

      const namesExit = yield* Effect.exit(fs.readDirectory(fullDir));
      if (namesExit._tag === "Failure") {
        if (ctx.settings.suppressErrors) return Stream.empty;
        return Stream.failCause(namesExit.cause);
      }

      const children: Stream.Stream<
        Entry,
        unknown,
        FileSystem.FileSystem | Path.Path
      >[] = [];

      for (const name of namesExit.value) {
        if (!ctx.settings.dot && name.startsWith(".")) {
          // skip dotfiles up-front unless dot enabled
          continue;
        }

        const childRel = relDir === "" ? name : `${relDir}/${name}`;
        const childFull = path.join(fullDir, name);

        const statExit = yield* Effect.exit(fs.stat(childFull));
        if (statExit._tag === "Failure") {
          if (ctx.settings.suppressErrors) continue;
          return Stream.failCause(statExit.cause);
        }

        const isDir = statExit.value.type === "Directory";
        const isSymlink = statExit.value.type === "SymbolicLink";
        const isFile = statExit.value.type === "File";

        const entry: Entry = {
          name,
          path: ctx.settings.absolute ? childFull : childRel,
          dirent: {
            isFile,
            isDirectory: isDir,
            isSymbolicLink: isSymlink,
          },
          stats: undefined,
        };

        const matchPath = ctx.settings.absolute ? childRel : childRel;
        const matched = isMatched(matchPath, ctx.compiled, ctx.settings);

        const include =
          matched &&
          (ctx.settings.onlyFiles ? isFile : true) &&
          (ctx.settings.onlyDirectories ? isDir : true);

        if (include) children.push(Stream.succeed(entry));

        // Descend?
        if (isDir && depth + 1 < ctx.settings.deep) {
          const parts = childRel.split("/");
          if (partialMatch(parts, ctx.compiled)) {
            children.push(walkDir(ctx, childRel, depth + 1));
          }
        } else if (isSymlink && ctx.settings.followSymbolicLinks) {
          // Resolve symlink target
          const realExit = yield* Effect.exit(fs.stat(childFull));
          if (realExit._tag === "Success" && realExit.value.type === "Directory") {
            const parts = childRel.split("/");
            if (partialMatch(parts, ctx.compiled)) {
              children.push(walkDir(ctx, childRel, depth + 1));
            }
          }
        }
      }

      return Stream.flatten(Stream.fromIterable(children), { concurrency: 1 });
    }),
  );
}

export function runTask(
  task: Task,
  settings: Settings,
): Stream.Stream<string | Entry, unknown, FileSystem.FileSystem | Path.Path> {
  const compiled = compileTask(task, settings);
  const ctx: WalkContext = {
    cwd: settings.cwd,
    base: task.base,
    compiled,
    settings,
  };
  return Stream.map(walkDir(ctx, "", 0), (e) => yieldEntry(e, settings));
}
