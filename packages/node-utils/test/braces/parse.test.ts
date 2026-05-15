import { describe, expect, test } from "bun:test";
import { parse } from "../../src/braces/parse.ts";

describe("braces.parse()", () => {
  describe("errors", () => {
    test("should throw an error when string exceeds max safe length", () => {
      const MAX_LENGTH = 1024 * 64;
      expect(() => parse(".".repeat(MAX_LENGTH + 2))).toThrow();
    });
  });

  describe("valid", () => {
    test("should return an AST", () => {
      const ast = parse("a/{b,c}/d");
      const brace = ast.nodes.find((node: any) => node.type === "brace");
      expect(brace).toBeTruthy();
      expect(brace.nodes.length).toBe(5);
    });

    test("should ignore braces inside brackets", () => {
      const ast = parse("a/[{b,c}]/d");
      expect(ast.nodes[1].type).toBe("text");
      expect(ast.nodes[1].value).toBe("a/[{b,c}]/d");
    });

    test("should parse braces with brackets inside", () => {
      const ast = parse("a/{a,b,[{c,d}]}/e");
      const brace = ast.nodes[2];
      const bracket = brace.nodes.find(
        (node: any) => node.value && node.value[0] === "[",
      );
      expect(bracket).toBeTruthy();
      expect(bracket.value).toBe("[{c,d}]");
    });
  });

  describe("invalid", () => {
    test("should escape standalone closing braces", () => {
      const one = parse("}");
      expect(one.nodes[1].type).toBe("text");
      expect(one.nodes[1].value).toBe("}");

      const two = parse("a}b");
      expect(two.nodes[1].type).toBe("text");
      expect(two.nodes[1].value).toBe("a}b");
    });
  });
});
