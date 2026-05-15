import { describe, expect, test } from "bun:test";
import braces from "../../src/braces/index.ts";

describe("Examples from README.md", () => {
  describe("Brace Expansion vs. Compilation", () => {
    test("Compiled", () => {
      expect(braces("a/{x,y,z}/b")).toEqual(["a/(x|y|z)/b"]);
      expect(braces(["a/{01..20}/b", "a/{1..5}/b"])).toEqual([
        "a/(0[1-9]|1[0-9]|20)/b",
        "a/([1-5])/b",
      ]);
    });

    test("Expanded", () => {
      expect(braces("a/{x,y,z}/b", { expand: true })).toEqual([
        "a/x/b",
        "a/y/b",
        "a/z/b",
      ]);
      expect(braces.expand("{01..10}")).toEqual([
        "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
      ]);
    });
  });

  describe("Sequences", () => {
    test("first set of examples", () => {
      expect(braces.expand("{1..3}")).toEqual(["1", "2", "3"]);
      expect(braces.expand("a/{1..3}/b")).toEqual(["a/1/b", "a/2/b", "a/3/b"]);
      expect(braces("{a..c}", { expand: true })).toEqual(["a", "b", "c"]);
      expect(braces("foo/{a..c}", { expand: true })).toEqual([
        "foo/a",
        "foo/b",
        "foo/c",
      ]);
    });

    test("zero-padding examples", () => {
      expect(braces("a/{01..03}/b")).toEqual(["a/(0[1-3])/b"]);
      expect(braces("a/{001..300}/b")).toEqual([
        "a/(00[1-9]|0[1-9][0-9]|[12][0-9]{2}|300)/b",
      ]);
    });
  });
});
