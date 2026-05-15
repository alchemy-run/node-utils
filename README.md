# node-utils

Modern ESM + TypeScript ports of a few classic Node CommonJS modules, vendored into a single zero-dependency package.

## Why?

The originals are stable but unmaintained, CJS-only, and pull in `@types/*` and transitive deps for code that's now smaller than its dependency tree. Vendoring + rewriting gives us:

- Pure ESM, native to Node 22+ and Bun.
- Real TypeScript types co-located with the implementation.
- No runtime npm dependencies — only Node built-ins.

## What's vendored

All of these live in `packages/node-utils/src/`:

| Original (CJS)                                                          | Rewritten as                 |
| ----------------------------------------------------------------------- | ---------------------------- |
| [`proper-lockfile`](https://github.com/moxystudio/node-proper-lockfile) | `lockfile.ts` (+ `index.ts`) |
| [`retry`](https://github.com/tim-kos/node-retry)                        | `retry.ts`                   |
| [`exit-hook`](https://github.com/sindresorhus/exit-hook)                | `exit-hook.ts`               |
| [`ignore`](https://github.com/kaelzhang/node-ignore)                    | `ignore.ts`                  |

## `@alchemy.run/node-utils`

A `proper-lockfile`-equivalent file lock, with `retry` and `exit-hook` bundled in.

```bash
bun add @alchemy.run/node-utils
```

```ts
import { lock, check } from '@alchemy.run/node-utils';

const release = await lock('some/file');
try {
    // ...do work
} finally {
    await release();
}
```

Also exported: `unlock`, `lockSync`, `unlockSync`, `checkSync`.

### How it works

Locks are acquired with `mkdir` (atomic on every filesystem, including NFS), and the lockfile's `mtime` is refreshed on an interval so staleness can be detected. If the refresh fails repeatedly, `onCompromised` fires.

### Options (`lock`)

- `stale` — ms before a lock is considered stale. Default `10000`, min `5000`.
- `update` — ms between `mtime` refreshes. Default `stale / 2`. Min `1000`, max `stale / 2`.
- `retries` — number, or a [retry options object](packages/node-utils/src/retry.ts). Default `0`.
- `realpath` — resolve symlinks. Default `true` (file must exist).
- `fs` — custom fs. Defaults to Node's `node:fs`.
- `onCompromised` — callback. Defaults to throwing.
- `lockfilePath` — override the `<file>.lock` path.

`check` and `unlock` accept the relevant subset.

Sync variants (`lockSync` / `unlockSync` / `checkSync`) don't accept `retries`.

### Graceful exit

Locks are removed automatically on process exit, except on `SIGKILL` or fatal VM errors. Wired up via the vendored `exit-hook` port.

## Development

```bash
bun install
bun test
bun run build     # tsc -b
bun run format    # oxfmt .
```

## License

MIT. Vendored sources retain their original MIT licenses; see file headers.
