import { afterAll, afterEach, beforeAll, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { clearDir, ensureDir, removeDir } from "./util/tmp.ts";

const tmpDir = `${import.meta.dir}/tmp`;

interface ListenerCounts {
  exit: number;
  SIGINT: number;
  SIGTERM: number;
}

beforeAll(() => ensureDir(tmpDir));

afterAll(() => removeDir(tmpDir));

afterEach(() => clearDir(tmpDir));

it("should always use `options.fs` when calling `fs` methods", () => {
  const lockfileContents = fs.readFileSync(
    `${import.meta.dir}/../src/lockfile.ts`,
    "utf8",
  );

  // Strip imports so we don't false-positive on `import ... from 'graceful-fs'`
  const body = lockfileContents.replace(/^import .*?;$/gm, "");

  expect(/\s{1,}fs\.[a-z]+/i.test(body)).toBe(false);
});

it("should remove open locks if the process crashes", () => {
  const result = spawnSync("bun", [`${import.meta.dir}/fixtures/crash.ts`], {
    encoding: "utf8",
  });

  expect(result.stderr).toMatch("intencional crash");
  expect(fs.existsSync(`${tmpDir}/foo.lock`)).toBe(false);
}, 10000);

it("should not hold the process if it has no more work to do", () => {
  const result = spawnSync("bun", [`${import.meta.dir}/fixtures/unref.ts`], {
    encoding: "utf8",
  });

  expect(result.status).toBe(0);
}, 10000);

it("should only register exit listeners while locks are owned", () => {
  const result = spawnSync(
    "bun",
    [`${import.meta.dir}/fixtures/lock-listeners.ts`],
    { encoding: "utf8" },
  );

  expect(result.status).toBe(0);

  const counts = JSON.parse(result.stdout) as Record<string, ListenerCounts>;
  const withExitHook = {
    exit: counts.beforeImport.exit + 1,
    SIGINT: counts.beforeImport.SIGINT + 1,
    SIGTERM: counts.beforeImport.SIGTERM + 1,
  };

  expect(counts.afterImport).toEqual(counts.beforeImport);
  expect(counts.afterFirstLock).toEqual(withExitHook);
  expect(counts.afterSecondLock).toEqual(withExitHook);
  expect(counts.afterFirstRelease).toEqual(withExitHook);
  expect(counts.afterSecondRelease).toEqual(counts.beforeImport);
  expect(counts.duringSlowRelease).toEqual(withExitHook);
  expect(counts.afterSlowRelease).toEqual(counts.beforeImport);
});

it("should work on stress conditions", () => {
  const result = spawnSync("bun", [`${import.meta.dir}/fixtures/stress.ts`], {
    encoding: "utf8",
    timeout: 80000,
  });

  if (result.status !== 0) {
    const stdout = result.stdout || "";

    if (process.env.CI) {
      process.stdout.write(stdout);
    } else {
      fs.writeFileSync(`${import.meta.dir}/stress.log`, stdout);
    }

    throw new Error(
      `stress test failed (status=${result.status}):\n${result.stderr}`,
    );
  }
}, 90000);
