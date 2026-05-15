import { getLocks } from "../../src/lockfile.ts";
import { unlock } from "../../src/index.ts";

export async function unlockAll(): Promise<void> {
  const locks = getLocks();
  const promises = Object.keys(locks).map((file) =>
    unlock(file, { realpath: false }),
  );

  await Promise.all(promises);
}

export default unlockAll;
