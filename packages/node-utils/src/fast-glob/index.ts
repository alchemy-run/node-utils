/**
 * Public fast-glob API, Effect 4 / `FileSystem.FileSystem` / `Path.Path`.
 *
 * - `glob` returns `Effect.Effect<EntryItem[], unknown, BunServices>`
 * - `globStream` returns `Stream.Stream<EntryItem, unknown, BunServices>`
 * - `globPromise` is a convenience wrapper that provides `BunServices.layer`
 *   internally and returns a `Promise<EntryItem[]>` for callers outside Effect.
 */
import { BunServices } from "@effect/platform-bun";
import { Effect, FileSystem, Path, Stream } from "effect";
import { runTask } from "./walk.ts";
import { generate } from "./tasks.ts";
import { resolveSettings } from "./settings.ts";
import type {
  Entry,
  EntryItem,
  Options,
  Pattern,
} from "./settings.ts";

export type { Entry, EntryItem, Options, Pattern };
export type { Task } from "./tasks.ts";

type InputPattern = Pattern | readonly Pattern[];

const normalizeInput = (input: InputPattern): Pattern[] => {
  const arr = ([] as Pattern[]).concat(input as Pattern[]);
  for (const item of arr) {
    if (typeof item !== "string" || item === "") {
      throw new TypeError("Patterns must be a string (non empty) or an array of strings");
    }
  }
  return arr;
};

export function globStream(
  source: InputPattern,
  options?: Options,
): Stream.Stream<EntryItem, unknown, FileSystem.FileSystem | Path.Path> {
  const patterns = normalizeInput(source);
  const settings = resolveSettings(options);
  const tasks = generate(patterns, settings);

  if (tasks.length === 0) return Stream.empty;

  const streams = tasks.map((task) => runTask(task, settings));
  const merged = Stream.flatten(Stream.fromIterable(streams), { concurrency: "unbounded" });

  if (!settings.unique) return merged;

  const seen = new Set<string>();
  return Stream.filter(merged, (item) => {
    const key = typeof item === "string" ? item : item.path;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function glob(
  source: InputPattern,
  options?: Options,
): Effect.Effect<EntryItem[], unknown, FileSystem.FileSystem | Path.Path> {
  return Stream.runCollect(globStream(source, options)).pipe(
    Effect.map((chunk) => Array.from(chunk)),
  );
}

/**
 * Convenience: run `glob` with `BunServices.layer` already provided, returning a Promise.
 * Use this when you're not already inside an Effect.
 */
export function globPromise(
  source: InputPattern,
  options?: Options,
): Promise<EntryItem[]> {
  return Effect.runPromise(
    Effect.provide(glob(source, options), BunServices.layer),
  );
}

export function generateTasks(
  source: InputPattern,
  options?: Options,
) {
  const patterns = normalizeInput(source);
  const settings = resolveSettings(options);
  return generate(patterns, settings);
}

import * as pattern from "./pattern.ts";

export function isDynamicPattern(p: Pattern, options?: Options): boolean {
  const settings = resolveSettings(options);
  return pattern.isDynamicPattern(p, settings);
}
