import { afterAll, afterEach, beforeAll, describe, expect, it } from "bun:test";
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

describe(".lockSync()", () => {
  it("should expose a working lockSync", () => {
    fs.writeFileSync(`${tmpDir}/foo`, "");

    const release = lockfile.lockSync(`${tmpDir}/foo`);

    expect(typeof release).toBe("function");
    expect(fs.existsSync(`${tmpDir}/foo.lock`)).toBe(true);

    release();

    expect(fs.existsSync(`${tmpDir}/foo.lock`)).toBe(false);
  });

  it("should fail if the lock is already acquired", () => {
    fs.writeFileSync(`${tmpDir}/foo`, "");

    lockfile.lockSync(`${tmpDir}/foo`);

    expect(fs.existsSync(`${tmpDir}/foo.lock`)).toBe(true);
    expect(() => lockfile.lockSync(`${tmpDir}/foo`)).toThrow(
      /already being held/,
    );
  });

  it("should pass options correctly", () => {
    expect(() =>
      lockfile.lockSync(`${tmpDir}/foo`, { realpath: false }),
    ).not.toThrow();
  });

  it("should not allow retries to be passed", () => {
    fs.writeFileSync(`${tmpDir}/foo`, "");

    expect(() => lockfile.lockSync(`${tmpDir}/foo`, { retries: 10 })).toThrow(
      /Cannot use retries/i,
    );

    expect(() =>
      lockfile.lockSync(`${tmpDir}/foo`, { retries: { retries: 10 } }),
    ).toThrow(/Cannot use retries/i);

    expect(() => {
      const release = lockfile.lockSync(`${tmpDir}/foo`, { retries: 0 });

      release();
    }).not.toThrow();

    expect(() => {
      const release = lockfile.lockSync(`${tmpDir}/foo`, {
        retries: { retries: 0 },
      });

      release();
    }).not.toThrow();
  });

  it("should fail synchronously if release throws", () => {
    fs.writeFileSync(`${tmpDir}/foo`, "");

    expect.assertions(1);

    const release = lockfile.lockSync(`${tmpDir}/foo`);

    release();

    expect(() => release()).toThrow("Lock is already released");
  });
});

describe(".unlockSync()", () => {
  it("should expose a working unlockSync", () => {
    fs.writeFileSync(`${tmpDir}/foo`, "");

    lockfile.lockSync(`${tmpDir}/foo`);

    expect(fs.existsSync(`${tmpDir}/foo.lock`)).toBe(true);

    lockfile.unlockSync(`${tmpDir}/foo`);

    expect(fs.existsSync(`${tmpDir}/foo.lock`)).toBe(false);
  });

  it("should fail if lock is not acquired", () => {
    fs.writeFileSync(`${tmpDir}/foo`, "");

    expect(() => lockfile.unlockSync(`${tmpDir}/foo`)).toThrow(
      /not acquired\/owned by you/,
    );
  });

  it("should pass options correctly", () => {
    expect(() =>
      lockfile.unlockSync(`${tmpDir}/foo`, { realpath: false }),
    ).toThrow(/not acquired\/owned by you/);
  });
});

describe(".checkSync()", () => {
  it("should expose a working checkSync", () => {
    fs.writeFileSync(`${tmpDir}/foo`, "");

    expect(lockfile.checkSync(`${tmpDir}/foo`)).toBe(false);

    const release = lockfile.lockSync(`${tmpDir}/foo`);

    expect(lockfile.checkSync(`${tmpDir}/foo`)).toBe(true);

    release();

    expect(lockfile.checkSync(`${tmpDir}/foo`)).toBe(false);
  });

  it("should fail if file does not exist", () => {
    expect(() =>
      lockfile.checkSync(`${tmpDir}/some-file-that-will-never-exist`),
    ).toThrow(/ENOENT/);
  });

  it("should pass options correctly", () => {
    expect(() =>
      lockfile.checkSync(`${tmpDir}/foo`, { realpath: false }),
    ).not.toThrow();
  });
});
