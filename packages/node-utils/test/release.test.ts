import { afterAll, afterEach, beforeAll, expect, it } from "bun:test";
import fs from "node:fs";
import * as lockfile from "../src/index.ts";
import { clearDir, ensureDir, removeDir } from "./util/tmp.ts";
import { unlockAll } from "./util/unlockAll.ts";

const tmpDir = `${import.meta.dir}/tmp`;

beforeAll(() => ensureDir(tmpDir));

afterAll(() => removeDir(tmpDir));

afterEach(async () => {
  await unlockAll();
  clearDir(tmpDir);
});

it("should release the lock", async () => {
  fs.writeFileSync(`${tmpDir}/foo`, "");

  const release = await lockfile.lock(`${tmpDir}/foo`);

  await release();

  await lockfile.lock(`${tmpDir}/foo`);
});

it("should remove the lockfile", async () => {
  fs.writeFileSync(`${tmpDir}/foo`, "");

  const release = await lockfile.lock(`${tmpDir}/foo`);

  await release();

  expect(fs.existsSync(`${tmpDir}/foo.lock`)).toBe(false);
});

it("should fail when releasing twice", async () => {
  fs.writeFileSync(`${tmpDir}/foo`, "");

  expect.assertions(1);

  const release = await lockfile.lock(`${tmpDir}/foo`);

  await release();

  try {
    await release();
  } catch (err) {
    expect((err as NodeJS.ErrnoException).code).toBe("ERELEASED");
  }
});
