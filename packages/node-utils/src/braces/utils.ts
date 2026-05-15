// AST nodes are highly dynamic — keep loose typing.
export type Node = any;

export const isInteger = (num: unknown): boolean => {
  if (typeof num === "number") return Number.isInteger(num);
  if (typeof num === "string" && num.trim() !== "") {
    return Number.isInteger(Number(num));
  }
  return false;
};

export const find = (node: Node, type: string): Node | undefined =>
  node.nodes.find((n: Node) => n.type === type);

export const exceedsLimit = (
  min: unknown,
  max: unknown,
  step: unknown = 1,
  limit: number | false,
): boolean => {
  if (limit === false) return false;
  if (!isInteger(min) || !isInteger(max)) return false;
  return (Number(max) - Number(min)) / Number(step) >= limit;
};

export const escapeNode = (block: Node, n = 0, type?: string): void => {
  const node = block.nodes[n];
  if (!node) return;

  if (
    (type && node.type === type) ||
    node.type === "open" ||
    node.type === "close"
  ) {
    if (node.escaped !== true) {
      node.value = "\\" + node.value;
      node.escaped = true;
    }
  }
};

export const encloseBrace = (node: Node): boolean => {
  if (node.type !== "brace") return false;
  // Intentionally matches upstream operator precedence: `a >> 0 + b >> 0`
  // groups as `a >> (0 + b) >> 0`. Don't add parens — tests depend on it.
  if ((node.commas >> 0 + node.ranges >> 0) === 0) {
    node.invalid = true;
    return true;
  }
  return false;
};

export const isInvalidBrace = (block: Node): boolean => {
  if (block.type !== "brace") return false;
  if (block.invalid === true || block.dollar) return true;
  // See encloseBrace — same buggy precedence preserved intentionally.
  if ((block.commas >> 0 + block.ranges >> 0) === 0) {
    block.invalid = true;
    return true;
  }
  if (block.open !== true || block.close !== true) {
    block.invalid = true;
    return true;
  }
  return false;
};

export const isOpenOrClose = (node: Node): boolean => {
  if (node.type === "open" || node.type === "close") return true;
  return node.open === true || node.close === true;
};

export const reduce = (nodes: Node[]): string[] =>
  nodes.reduce<string[]>((acc, node) => {
    if (node.type === "text") acc.push(node.value);
    if (node.type === "range") node.type = "text";
    return acc;
  }, []);

export const flatten = (...args: any[]): any[] => {
  const result: any[] = [];
  const flat = (arr: any[]) => {
    for (let i = 0; i < arr.length; i++) {
      const ele = arr[i];
      if (Array.isArray(ele)) {
        flat(ele);
        continue;
      }
      if (ele !== undefined) result.push(ele);
    }
    return result;
  };
  flat(args);
  return result;
};
