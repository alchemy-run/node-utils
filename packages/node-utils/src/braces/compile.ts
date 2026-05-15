import { fill } from "../fill-range.ts";
import * as utils from "./utils.ts";

export interface CompileOptions {
  escapeInvalid?: boolean;
  [k: string]: unknown;
}

export function compile(ast: utils.Node, options: CompileOptions = {}): string {
  const walk = (node: utils.Node, parent: utils.Node = {}): string => {
    const invalidBlock = utils.isInvalidBrace(parent);
    const invalidNode = node.invalid === true && options.escapeInvalid === true;
    const invalid = invalidBlock === true || invalidNode === true;
    const prefix = options.escapeInvalid === true ? "\\" : "";
    let output = "";

    if (node.isOpen === true) return prefix + node.value;
    if (node.isClose === true) return prefix + node.value;
    if (node.type === "open") return invalid ? prefix + node.value : "(";
    if (node.type === "close") return invalid ? prefix + node.value : ")";
    if (node.type === "comma") {
      return node.prev.type === "comma" ? "" : invalid ? node.value : "|";
    }

    if (node.value) return node.value;

    if (node.nodes && node.ranges > 0) {
      const args = utils.reduce(node.nodes);
      const range = fill(
        args[0] as any,
        args[1] as any,
        args[2] as any,
        { ...options, wrap: false, toRegex: true, strictZeros: true } as any,
      ) as string;

      if ((range as unknown as string).length !== 0) {
        return args.length > 1 && (range as unknown as string).length > 1
          ? `(${range})`
          : (range as string);
      }
    }

    if (node.nodes) {
      for (const child of node.nodes as utils.Node[]) {
        output += walk(child, node);
      }
    }

    return output;
  };

  return walk(ast);
}

export default compile;
