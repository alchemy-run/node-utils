import { expect } from "bun:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Effect } from "effect";
import { test } from "./_test.ts";
import {
  generateTasks,
  glob,
  isDynamicPattern,
} from "../../src/fast-glob/index.ts";

const FIXTURES = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
);

const sorted = (xs: any[]): string[] =>
  (xs.map((x) => (typeof x === "string" ? x : x.path)) as string[]).sort();

test(
  "*.txt: only top-level txt files",
  Effect.gen(function* () {
    const out = yield* glob("*.txt", { cwd: FIXTURES });
    expect(sorted(out)).toEqual(["a.txt", "b.txt"]);
  }),
);

test(
  "**/*.txt: recurses into all subdirs",
  Effect.gen(function* () {
    const out = yield* glob("**/*.txt", { cwd: FIXTURES });
    expect(sorted(out)).toEqual([
      "a.txt",
      "b.txt",
      "deep/deeper/y.txt",
      "deep/x.txt",
      "sub/c.txt",
    ]);
  }),
);

test(
  "**/*.{txt,md} with brace expansion",
  Effect.gen(function* () {
    const out = yield* glob("**/*.{txt,md}", { cwd: FIXTURES });
    expect(sorted(out)).toEqual([
      "a.txt",
      "b.txt",
      "deep/deeper/y.txt",
      "deep/x.txt",
      "sub/c.md",
      "sub/c.txt",
    ]);
  }),
);

test(
  "ignore: excludes patterns",
  Effect.gen(function* () {
    const out = yield* glob("**/*.txt", {
      cwd: FIXTURES,
      ignore: ["sub/**", "deep/**"],
    });
    expect(sorted(out)).toEqual(["a.txt", "b.txt"]);
  }),
);

test(
  "onlyDirectories: returns dirs only",
  Effect.gen(function* () {
    const out = yield* glob("**", {
      cwd: FIXTURES,
      onlyDirectories: true,
    });
    expect(sorted(out)).toEqual([
      "deep",
      "deep/deeper",
      "dot-dir",
      "empty",
      "sub",
    ]);
  }),
);

test(
  "onlyFiles (default): excludes dirs",
  Effect.gen(function* () {
    const out = yield* glob("**", { cwd: FIXTURES });
    expect(sorted(out)).toEqual([
      "a.txt",
      "b.txt",
      "deep/deeper/y.txt",
      "deep/x.txt",
      "sub/c.md",
      "sub/c.txt",
    ]);
  }),
);

test(
  "dot:false (default) excludes dotfiles",
  Effect.gen(function* () {
    const out = yield* glob("**", { cwd: FIXTURES });
    for (const item of out) {
      const p = typeof item === "string" ? item : item.path;
      for (const seg of p.split("/")) {
        expect(seg.startsWith(".")).toBe(false);
      }
    }
  }),
);

test(
  "dot:true includes dotfiles",
  Effect.gen(function* () {
    const out = yield* glob("**", { cwd: FIXTURES, dot: true });
    expect(sorted(out)).toContain(".dotfile.txt");
    expect(sorted(out)).toContain("dot-dir/.x.txt");
  }),
);

test(
  "absolute:true returns absolute paths",
  Effect.gen(function* () {
    const out = yield* glob("*.txt", {
      cwd: FIXTURES,
      absolute: true,
    });
    for (const item of out) {
      const p = typeof item === "string" ? item : item.path;
      expect(path.isAbsolute(p)).toBe(true);
    }
  }),
);

test(
  "markDirectories adds trailing /",
  Effect.gen(function* () {
    const out = yield* glob("**", {
      cwd: FIXTURES,
      onlyDirectories: true,
      markDirectories: true,
    });
    for (const item of out) {
      const p = typeof item === "string" ? item : item.path;
      expect(p.endsWith("/")).toBe(true);
    }
  }),
);

test(
  "objectMode returns Entry objects",
  Effect.gen(function* () {
    const out = yield* glob("*.txt", { cwd: FIXTURES, objectMode: true });
    expect(Array.isArray(out)).toBe(true);
    for (const item of out) {
      expect(typeof item).toBe("object");
      expect(typeof (item as any).name).toBe("string");
      expect(typeof (item as any).path).toBe("string");
      expect((item as any).dirent.isFile).toBe(true);
    }
  }),
);

test(
  "deep:1 limits recursion",
  Effect.gen(function* () {
    const out = yield* glob("**/*.txt", { cwd: FIXTURES, deep: 1 });
    expect(sorted(out)).toEqual(["a.txt", "b.txt"]);
  }),
);

test(
  "deep:2 reaches deep/ but not deep/deeper/",
  Effect.gen(function* () {
    const out = yield* glob("**/*.txt", { cwd: FIXTURES, deep: 2 });
    expect(sorted(out)).toContain("deep/x.txt");
    expect(sorted(out)).toContain("a.txt");
    expect(sorted(out)).not.toContain("deep/deeper/y.txt");
  }),
);

test(
  "multiple patterns: union",
  Effect.gen(function* () {
    const out = yield* glob(["*.txt", "sub/*.md"], { cwd: FIXTURES });
    expect(sorted(out)).toEqual(["a.txt", "b.txt", "sub/c.md"]);
  }),
);

test(
  "negative pattern: subtracts matches",
  Effect.gen(function* () {
    const out = yield* glob(["**/*.txt", "!sub/**"], { cwd: FIXTURES });
    expect(sorted(out)).toEqual([
      "a.txt",
      "b.txt",
      "deep/deeper/y.txt",
      "deep/x.txt",
    ]);
  }),
);

test(
  "unique:true (default) deduplicates",
  Effect.gen(function* () {
    const out = yield* glob(["*.txt", "*.txt"], { cwd: FIXTURES });
    expect(sorted(out)).toEqual(["a.txt", "b.txt"]);
  }),
);

test(
  "empty results when nothing matches",
  Effect.gen(function* () {
    const out = yield* glob("*.nope", { cwd: FIXTURES });
    expect(out).toEqual([]);
  }),
);

// Static (synchronous) API surface — no IO.

import { describe, test as syncTest } from "bun:test";

describe("generateTasks", () => {
  syncTest("groups patterns by base", () => {
    const tasks = generateTasks(["a/**", "a/*.js", "b/**"]);
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.every((t) => typeof t.base === "string")).toBe(true);
  });

  syncTest("rejects non-string patterns", () => {
    expect(() => generateTasks([1 as any])).toThrow(/non empty/);
    expect(() => generateTasks([""])).toThrow(/non empty/);
  });
});

describe("isDynamicPattern", () => {
  syncTest("true for glob symbols", () => {
    expect(isDynamicPattern("*.js")).toBe(true);
    expect(isDynamicPattern("a/**/b")).toBe(true);
    expect(isDynamicPattern("{a,b}.js")).toBe(true);
    expect(isDynamicPattern("[ab].js")).toBe(true);
  });
  syncTest("false for static patterns", () => {
    expect(isDynamicPattern("a/b/c.js")).toBe(false);
    expect(isDynamicPattern("foo.txt")).toBe(false);
  });
  syncTest("respects braceExpansion option", () => {
    expect(isDynamicPattern("{a,b}.js", { braceExpansion: false })).toBe(false);
  });
});
