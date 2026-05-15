import fs from "node:fs";
import * as lockfile from "../../src/index.ts";

const tmpDir = `${import.meta.dir}/../tmp`;

fs.writeFileSync(`${tmpDir}/foo`, "");

lockfile.lockSync(`${tmpDir}/foo`);
