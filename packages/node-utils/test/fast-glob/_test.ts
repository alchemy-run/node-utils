/**
 * `test()` wrapper that runs an `Effect.gen` body with `BunServices.layer`
 * (FileSystem, Path, Stdio, Terminal, ChildProcessSpawner) provided.
 */
import { test as bunTest } from "bun:test";
import { BunServices } from "@effect/platform-bun";
import { Effect, Layer } from "effect";

type EffectTestBody = Effect.Effect<unknown, unknown, BunServices.BunServices>;

export function test(name: string, body: EffectTestBody, timeout?: number): void {
  bunTest(
    name,
    async () => {
      await Effect.runPromise(Effect.provide(body, BunServices.layer));
    },
    timeout,
  );
}

test.skip = (name: string, _body: EffectTestBody, timeout?: number) =>
  bunTest.skip(name, () => {}, timeout);

test.only = (name: string, body: EffectTestBody, timeout?: number) =>
  bunTest.only(
    name,
    async () => {
      await Effect.runPromise(Effect.provide(body, BunServices.layer));
    },
    timeout,
  );

// Re-export Layer so call sites can compose extra services on top.
export { Layer };
