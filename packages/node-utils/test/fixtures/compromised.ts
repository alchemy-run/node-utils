import fs from "node:fs";
import * as lockfile from "../../src/index.ts";

const tmpDir = `${import.meta.dir}/../tmp`;

fs.writeFileSync(`${tmpDir}/foo`, "");

lockfile.lockSync(`${tmpDir}/foo`, { update: 1000 });

fs.rmdirSync(`${tmpDir}/foo.lock`);

// Do not let the process exit
setInterval(() => {}, 1000);

process.on("uncaughtException", (err: NodeJS.ErrnoException) => {
  if (err.code) {
    process.stderr.write(`${err.code}\n\n`);
  }
  throw err;
});
