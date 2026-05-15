import { fill } from "../fill-range.ts";
import { stringify } from "./stringify.ts";
import * as utils from "./utils.ts";

export interface ExpandOptions {
  rangeLimit?: number | false;
  step?: number | string;
  [k: string]: unknown;
}

const append = (
  queue: any = "",
  stash: any = "",
  enclose = false,
): any[] => {
  const result: any[] = [];
  queue = ([] as any[]).concat(queue);
  stash = ([] as any[]).concat(stash);

  if (!stash.length) return queue;
  if (!queue.length) {
    return enclose
      ? utils.flatten(stash).map((ele) => `{${ele}}`)
      : stash;
  }

  for (const item of queue) {
    if (Array.isArray(item)) {
      for (const value of item) {
        result.push(append(value, stash, enclose));
      }
    } else {
      for (let ele of stash) {
        if (enclose === true && typeof ele === "string") ele = `{${ele}}`;
        result.push(Array.isArray(ele) ? append(item, ele, enclose) : item + ele);
      }
    }
  }
  return utils.flatten(result);
};

export function expand(ast: utils.Node, options: ExpandOptions = {}): string[] {
  const rangeLimit = options.rangeLimit === undefined ? 1000 : options.rangeLimit;

  const walk = (node: utils.Node, parent: utils.Node = {}): any => {
    node.queue = [];

    let p = parent;
    let q = parent.queue;

    while (p.type !== "brace" && p.type !== "root" && p.parent) {
      p = p.parent;
      q = p.queue;
    }

    if (node.invalid || node.dollar) {
      q.push(append(q.pop(), stringify(node, options)));
      return;
    }

    if (
      node.type === "brace" &&
      node.invalid !== true &&
      node.nodes.length === 2
    ) {
      q.push(append(q.pop(), ["{}"]));
      return;
    }

    if (node.nodes && node.ranges > 0) {
      const args = utils.reduce(node.nodes);

      if (
        utils.exceedsLimit(
          args[0],
          args[1],
          options.step ?? args[2],
          rangeLimit as number | false,
        )
      ) {
        throw new RangeError(
          "expanded array length exceeds range limit. Use options.rangeLimit to increase or disable the limit.",
        );
      }

      let range = fill(args[0] as any, args[1] as any, args[2] as any, options as any);
      if ((range as any).length === 0) {
        range = stringify(node, options) as any;
      }

      q.push(append(q.pop(), range));
      node.nodes = [];
      return;
    }

    const enclose = utils.encloseBrace(node);
    let queue = node.queue;
    let block = node;

    while (block.type !== "brace" && block.type !== "root" && block.parent) {
      block = block.parent;
      queue = block.queue;
    }

    for (let i = 0; i < node.nodes.length; i++) {
      const child = node.nodes[i];

      if (child.type === "comma" && node.type === "brace") {
        if (i === 1) queue.push("");
        queue.push("");
        continue;
      }

      if (child.type === "close") {
        q.push(append(q.pop(), queue, enclose));
        continue;
      }

      if (child.value && child.type !== "open") {
        queue.push(append(queue.pop(), child.value));
        continue;
      }

      if (child.nodes) {
        walk(child, node);
      }
    }

    return queue;
  };

  return utils.flatten(walk(ast));
}

export default expand;
