import { afterAll, afterEach, beforeAll, expect, it, mock } from "bun:test";
import fs from "node:fs";
import * as lockfile from "../src/index.ts";
import { clearDir, ensureDir, removeDir } from "./util/tmp.ts";
import { unlockAll } from "./util/unlockAll.ts";

const tmpDir = `${import.meta.dir}/tmp`;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

beforeAll(() => ensureDir(tmpDir));

afterAll(() => removeDir(tmpDir));

afterEach(async () => {
  await unlockAll();
  clearDir(tmpDir);
});

it("should fail if the lock is not acquired", async () => {
  fs.writeFileSync(`${tmpDir}/foo`, "");

  expect.assertions(1);

  try {
    await lockfile.unlock(`${tmpDir}/foo`);
  } catch (err) {
    expect((err as NodeJS.ErrnoException).code).toBe("ENOTACQUIRED");
  }
});

it("should return a promise", async () => {
  fs.writeFileSync(`${tmpDir}/foo`, "");

  const promise = lockfile.unlock(`${tmpDir}/foo`);

  expect(typeof promise.then).toBe("function");

  await promise.catch(() => {});
});

it("should release the lock", async () => {
  fs.writeFileSync(`${tmpDir}/foo`, "");

  await lockfile.lock(`${tmpDir}/foo`);

  await lockfile.unlock(`${tmpDir}/foo`);

  await lockfile.lock(`${tmpDir}/foo`);
});

it("should remove the lockfile", async () => {
  fs.writeFileSync(`${tmpDir}/foo`, "");

  await lockfile.lock(`${tmpDir}/foo`);

  await lockfile.unlock(`${tmpDir}/foo`);

  expect(fs.existsSync(`${tmpDir}/foo.lock`)).toBe(false);
});

it("should fail if removing the lockfile errors out", async () => {
  fs.writeFileSync(`${tmpDir}/foo`, "");

  const customFs = {
    ...fs,
    rmdir: (_path: string, callback: (err: Error | null) => void) =>
      callback(new Error("foo")),
  };

  expect.assertions(1);

  await lockfile.lock(`${tmpDir}/foo`);

  try {
    await lockfile.unlock(`${tmpDir}/foo`, { fs: customFs });
  } catch (err) {
    expect((err as Error).message).toBe("foo");
  }
});

it("should ignore ENOENT errors when removing the lockfile", async () => {
  fs.writeFileSync(`${tmpDir}/foo`, "");

  const rmdir = mock(
    (_path: string, callback: (err: NodeJS.ErrnoException | null) => void) =>
      callback(Object.assign(new Error(), { code: "ENOENT" })),
  );
  const customFs = { ...fs, rmdir };

  await lockfile.lock(`${tmpDir}/foo`);

  await lockfile.unlock(`${tmpDir}/foo`, { fs: customFs });

  expect(rmdir).toHaveBeenCalledTimes(1);
});

it("should stop updating the lockfile mtime", async () => {
  fs.writeFileSync(`${tmpDir}/foo`, "");

  const customFs: Record<string, any> = { ...fs };

  await lockfile.lock(`${tmpDir}/foo`, { update: 2000, fs: customFs });

  const utimes = mock(
    (_path: string, _atime: Date, _mtime: Date, callback: () => void) =>
      callback(),
  );

  customFs.utimes = utimes;

  await lockfile.unlock(`${tmpDir}/foo`);

  // First update occurs at 2000ms
  await sleep(2500);

  expect(utimes).toHaveBeenCalledTimes(0);
}, 10000);

it("should stop updating the lockfile mtime (slow fs)", async () => {
  fs.writeFileSync(`${tmpDir}/foo`, "");

  const customFs: Record<string, any> = { ...fs };

  await lockfile.lock(`${tmpDir}/foo`, { fs: customFs, update: 2000 });

  const utimes = mock((...args: any[]) =>
    setTimeout(() => (fs.utimes as any)(...args), 2000),
  );

  customFs.utimes = utimes;

  await sleep(3000);

  await lockfile.unlock(`${tmpDir}/foo`);

  await sleep(3000);

  expect(utimes).toHaveBeenCalledTimes(1);
}, 10000);

it("should stop updating the lockfile mtime (slow fs + new lock)", async () => {
  fs.writeFileSync(`${tmpDir}/foo`, "");

  const customFs: Record<string, any> = { ...fs };

  await lockfile.lock(`${tmpDir}/foo`, { fs: customFs, update: 2000 });

  const utimes = mock((...args: any[]) =>
    setTimeout(() => (fs.utimes as any)(...args), 2000),
  );

  customFs.utimes = utimes;

  await sleep(3000);

  await lockfile.unlock(`${tmpDir}/foo`);

  await lockfile.lock(`${tmpDir}/foo`);

  await sleep(3000);

  expect(utimes).toHaveBeenCalledTimes(1);
}, 10000);

it("should resolve symlinks by default", async () => {
  fs.writeFileSync(`${tmpDir}/foo`, "");
  fs.symlinkSync(`${tmpDir}/foo`, `${tmpDir}/bar`);

  await lockfile.lock(`${tmpDir}/foo`);

  await lockfile.unlock(`${tmpDir}/bar`);

  expect(fs.existsSync(`${tmpDir}/foo.lock`)).toBe(false);
});

it("should not resolve symlinks if realpath is false", async () => {
  fs.writeFileSync(`${tmpDir}/foo`, "");
  fs.symlinkSync(`${tmpDir}/foo`, `${tmpDir}/bar`);

  expect.assertions(1);

  await lockfile.lock(`${tmpDir}/foo`);

  try {
    await lockfile.unlock(`${tmpDir}/bar`, { realpath: false });
  } catch (err) {
    expect((err as NodeJS.ErrnoException).code).toBe("ENOTACQUIRED");
  }
});

it("should use a custom fs", async () => {
  const customFs = {
    ...fs,
    realpath: (_path: string, callback: (err: Error | null) => void) =>
      callback(new Error("foo")),
  };

  expect.assertions(1);

  try {
    await lockfile.unlock(`${tmpDir}/foo`, { fs: customFs });
  } catch (err) {
    expect((err as Error).message).toBe("foo");
  }
});
