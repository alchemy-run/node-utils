import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const listenerCounts = () => ({
  exit: process.listenerCount("exit"),
  SIGINT: process.listenerCount("SIGINT"),
  SIGTERM: process.listenerCount("SIGTERM"),
});

const beforeImport = listenerCounts();
const lockfile = await import("../../src/index.ts");
const afterImport = listenerCounts();
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "node-utils-lockfile-"));

try {
  const firstFile = path.join(tmpDir, "first");
  const secondFile = path.join(tmpDir, "second");
  fs.writeFileSync(firstFile, "");
  fs.writeFileSync(secondFile, "");

  const releaseFirst = await lockfile.lock(firstFile);
  const afterFirstLock = listenerCounts();
  const releaseSecond = await lockfile.lock(secondFile);
  const afterSecondLock = listenerCounts();

  await releaseFirst();
  const afterFirstRelease = listenerCounts();
  await releaseSecond();
  const afterSecondRelease = listenerCounts();

  const slowFile = path.join(tmpDir, "slow");
  fs.writeFileSync(slowFile, "");
  let finishRemoval: (() => void) | undefined;
  const slowFs = {
    ...fs,
    rmdir: (
      lockPath: fs.PathLike,
      callback: (err: NodeJS.ErrnoException | null) => void,
    ) => {
      finishRemoval = () => fs.rmdir(lockPath, callback);
    },
  };
  const releaseSlowLock = await lockfile.lock(slowFile, {
    fs: slowFs,
    realpath: false,
  });
  const slowRelease = releaseSlowLock();
  const duringSlowRelease = listenerCounts();
  finishRemoval?.();
  await slowRelease;
  const afterSlowRelease = listenerCounts();

  console.log(
    JSON.stringify({
      beforeImport,
      afterImport,
      afterFirstLock,
      afterSecondLock,
      afterFirstRelease,
      afterSecondRelease,
      duringSlowRelease,
      afterSlowRelease,
    }),
  );
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}
