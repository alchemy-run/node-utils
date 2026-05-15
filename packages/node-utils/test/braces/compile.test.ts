import { describe, expect, test } from "bun:test";
import { compile } from "../../src/braces/compile.ts";
import { parse } from "../../src/braces/parse.ts";

describe("braces.compile()", () => {
  describe("errors", () => {
    test("should throw an error when invalid args are passed", () => {
      expect(() => compile(undefined as any)).toThrow();
    });
  });

  describe("invalid characters", () => {
    test("should escape invalid bracket characters", () => {
      expect(compile(parse("]{a,b,c}"))).toBe("\\](a|b|c)");
    });
  });

  describe("sets", () => {
    test("should support empty sets", () => {
      expect(compile(parse("{a,}"))).toBe("(a|)");
      expect(compile(parse("{a,,}"))).toBe("(a|)");
      expect(compile(parse("{a,,,}"))).toBe("(a|)");
      expect(compile(parse("{a,,,,}"))).toBe("(a|)");
      expect(compile(parse("{a,,,,,}"))).toBe("(a|)");
    });
  });

  describe("ranges", () => {
    test("should escape braces with invalid ranges", () => {
      expect(compile(parse("{a...b}"))).toBe("{a...b}");
      expect(compile(parse("{a...b}"), { escapeInvalid: true })).toBe(
        "\\{a...b\\}",
      );
    });

    test("should expand brace patterns with both sets and ranges", () => {
      expect(compile(parse("{a..e,z}"))).toBe("(a..e|z)");
      expect(compile(parse("{a..e,a..z}"))).toBe("(a..e|a..z)");
    });

    test("should escape braces with too many range expressions", () => {
      expect(compile(parse("{a..e..x..z}"))).toBe("{a..e..x..z}");
      expect(compile(parse("{a..e..x..z}"), { escapeInvalid: true })).toBe(
        "\\{a..e..x..z\\}",
      );
    });

    test("should compile very simple numeric ranges", () => {
      expect(compile(parse("{1..5}"))).toBe("([1-5])");
    });

    test("should compile numeric ranges with increments", () => {
      expect(compile(parse("{1..5..2}"))).toBe("(1|3|5)");
    });

    test("should compile zero-padded numeric ranges", () => {
      expect(compile(parse("{01..05}"))).toBe("(0[1-5])");
    });

    test("should compile zero-padded numeric ranges with increments", () => {
      expect(compile(parse("{01..05..2}"))).toBe("(01|03|05)");
      expect(compile(parse("{01..05..3}"))).toBe("(01|04)");
    });
  });

  describe("invalid", () => {
    test("should escape incomplete brace patterns", () => {
      expect(compile(parse("]{a/b"))).toBe("\\]{a/b");
      expect(compile(parse("]{a/b"), { escapeInvalid: true })).toBe(
        "\\]\\{a/b",
      );
    });

    test("should escape non-brace patterns (no sets or ranges)", () => {
      expect(compile(parse("]{a/b}"))).toBe("\\]{a/b}");
      expect(compile(parse("]{a/b}"), { escapeInvalid: true })).toBe(
        "\\]\\{a/b\\}",
      );
    });
  });
});
