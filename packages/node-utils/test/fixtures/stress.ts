import cluster from "node:cluster";
import fs from "node:fs";
import os from "node:os";
import * as lockfile from "../../src/index.ts";

const tmpDir = `${import.meta.dir}/../tmp`;

const maxTryDelay = 50;
const maxLockTime = 200;
const totalTestTime = 60000;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

interface LogEntry {
  timestamp: number;
  message: string;
}

function printExcerpt(logs: LogEntry[], index: number) {
  const startIndex = Math.max(0, index - 50);
  const endIndex = index + 50;

  logs
    .slice(startIndex, endIndex)
    .forEach((log, i) =>
      process.stdout.write(
        `${startIndex + i + 1} ${log.timestamp} ${log.message}\n`,
      ),
    );
}

async function master() {
  const numCPUs = os.cpus().length;
  const rawLogs: string[] = [];

  fs.writeFileSync(`${tmpDir}/foo`, "");

  for (let i = 0; i < numCPUs; i += 1) {
    cluster.fork();
  }

  cluster.on("online", (worker) =>
    worker.on("message", (data) => rawLogs.push(String(data).trim())),
  );

  cluster.on("exit", () => {
    throw new Error("Child died prematurely");
  });

  await sleep(totalTestTime);

  cluster.removeAllListeners("exit");

  cluster.disconnect(() => {
    let acquired = false;

    const logs: LogEntry[] = rawLogs.map((log) => {
      const split = log.split(" ");

      return { timestamp: Number(split[0]), message: split[1] };
    });

    logs.sort((log1, log2) => {
      if (log1.timestamp > log2.timestamp) {
        return 1;
      }
      if (log1.timestamp < log2.timestamp) {
        return -1;
      }
      if (log1.message === "LOCK_RELEASE_CALLED") {
        return -1;
      }
      if (log2.message === "LOCK_RELEASE_CALLED") {
        return 1;
      }

      return 0;
    });

    logs.forEach((log, index) => {
      switch (log.message) {
        case "LOCK_ACQUIRED":
          if (acquired) {
            process.stdout.write(`\nInconsistent at line ${index + 1}\n`);
            printExcerpt(logs, index);
            process.exit(1);
          }

          acquired = true;
          break;
        case "LOCK_RELEASE_CALLED":
          if (!acquired) {
            process.stdout.write(`\nInconsistent at line ${index + 1}\n`);
            printExcerpt(logs, index);
            process.exit(1);
          }

          acquired = false;
          break;
        default:
        // Do nothing
      }
    });

    process.exit(0);
  });
}

function worker() {
  process.on("disconnect", () => process.exit(0));

  const tryLock = async () => {
    await sleep(Math.max(Math.random(), 10) * maxTryDelay);

    process.send?.(`${Date.now()} LOCK_TRY\n`);

    let release: () => Promise<void>;

    try {
      release = await lockfile.lock(`${tmpDir}/foo`);
    } catch {
      process.send?.(`${Date.now()} LOCK_BUSY\n`);
      tryLock();

      return;
    }

    process.send?.(`${Date.now()} LOCK_ACQUIRED\n`);

    await sleep(Math.max(Math.random(), 10) * maxLockTime);

    process.send?.(`${Date.now()} LOCK_RELEASE_CALLED\n`);

    await release();

    tryLock();
  };

  tryLock();
}

process.on("unhandledRejection", (err: Error) => {
  console.error(err.stack);
  process.exit(1);
});

if (cluster.isPrimary) {
  master();
} else {
  worker();
}
