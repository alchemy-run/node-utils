import * as utils from "./utils.ts";

export interface StringifyOptions {
  escapeInvalid?: boolean;
  [k: string]: unknown;
}

export function stringify(ast: utils.Node, options: StringifyOptions = {}): string {
  const walk = (node: utils.Node, parent: utils.Node = {}): string => {
    const invalidBlock = options.escapeInvalid && utils.isInvalidBrace(parent);
    const invalidNode = node.invalid === true && options.escapeInvalid === true;
    let output = "";

    if (node.value) {
      if ((invalidBlock || invalidNode) && utils.isOpenOrClose(node)) {
        return "\\" + node.value;
      }
      return node.value;
    }

    if (node.nodes) {
      for (const child of node.nodes as utils.Node[]) {
        output += walk(child);
      }
    }
    return output;
  };

  return walk(ast);
}

export default stringify;
