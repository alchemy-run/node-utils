import { describe, expect, test } from "bun:test";
import braces from "../../src/braces/index.ts";
import { expand } from "../../src/braces/expand.ts";
import { parse } from "../../src/braces/parse.ts";

const equal = (input: string, expected: string[], options?: any) => {
  expect(braces.expand(input, options)).toEqual(expected);
};

describe("unit tests from brace-expand", () => {
  describe("extglobs", () => {
    test("should split on commas when braces are inside extglobs", () => {
      equal("*(a|{b|c,d})", ["*(a|b|c)", "*(a|d)"]);
    });

    test("should not split on commas in extglobs when inside braces", () => {
      equal("{a,@(b,c)}", ["a", "@(b,c)"]);
      equal("{a,*(b|c,d)}", ["a", "*(b|c,d)"]);
    });
  });

  describe("expand", () => {
    test("should expand an AST", () => {
      expect(expand(parse("a/{b,c}/d"))).toEqual(["a/b/d", "a/c/d"]);
    });

    test("should support expanded nested empty sets", () => {
      equal("{`foo,bar`}", ["{`foo,bar`}"], { keepQuotes: true });
      equal("{\\`foo,bar\\`}", ["`foo", "bar`"], { keepQuotes: true });
      equal("{`foo,bar`}", ["{`foo,bar`}"], { keepQuotes: true });
      equal("{`foo\\,bar`}", ["{`foo\\,bar`}"], { keepQuotes: true });

      equal("{`foo,bar`}", ["{foo,bar}"]);
      equal("{\\`foo,bar\\`}", ["`foo", "bar`"]);
      equal("{`foo,bar`}", ["{foo,bar}"]);
      equal("{`foo\\,bar`}", ["{foo\\,bar}"]);

      equal("{a,\\\\{a,b}c}", ["a", "\\ac", "\\bc"]);
      equal("{a,\\{a,b}c}", ["ac}", "{ac}", "bc}"]);
      equal("{,eno,thro,ro}ugh", ["ugh", "enough", "through", "rough"]);
      equal("{,{,eno,thro,ro}ugh}{,out}", [
        "", "out", "ugh", "ughout", "enough", "enoughout", "through",
        "throughout", "rough", "roughout",
      ]);
      equal("{{,eno,thro,ro}ugh,}{,out}", [
        "ugh", "ughout", "enough", "enoughout", "through", "throughout",
        "rough", "roughout", "", "out",
      ]);
      equal("{,{,a,b}z}{,c}", ["", "c", "z", "zc", "az", "azc", "bz", "bzc"]);
      equal("{,{,a,b}z}{c,}", ["c", "", "zc", "z", "azc", "az", "bzc", "bz"]);
      equal("{,{,a,b}z}{,c,}", [
        "", "c", "", "z", "zc", "z", "az", "azc", "az", "bz", "bzc", "bz",
      ]);
      equal("{,{,a,b}z}{c,d}", ["c", "d", "zc", "zd", "azc", "azd", "bzc", "bzd"]);
      equal("{{,a,b}z,}{,c}", ["z", "zc", "az", "azc", "bz", "bzc", "", "c"]);
      equal("{,a{,b}z,}{,c}", [
        "", "c", "az", "azc", "abz", "abzc", "", "c",
      ]);
      equal("{,a{,b},}{,c}", ["", "c", "a", "ac", "ab", "abc", "", "c"]);
      equal("{,a{,b}}{,c}", ["", "c", "a", "ac", "ab", "abc"]);
      equal("{,b}{,d}", ["", "d", "b", "bd"]);
      equal("{a,b}{,d}", ["a", "ad", "b", "bd"]);
      equal("{,a}{z,c}", ["z", "c", "az", "ac"]);
      equal("{,{a,}}{z,c}", ["z", "c", "az", "ac", "z", "c"]);
      equal("{,{,a}}{z,c}", ["z", "c", "z", "c", "az", "ac"]);
      equal("{,{,a},}{z,c}", ["z", "c", "z", "c", "az", "ac", "z", "c"]);
      equal("{{,,a}}{z,c}", ["{}z", "{}c", "{}z", "{}c", "{a}z", "{a}c"]);
      equal("{{,a},}{z,c}", ["z", "c", "az", "ac", "z", "c"]);
      equal("{,,a}{z,c}", ["z", "c", "z", "c", "az", "ac"]);
      equal("{,{,}}{z,c}", ["z", "c", "z", "c", "z", "c"]);
      equal("{,{a,b}}{,c}", ["", "c", "a", "ac", "b", "bc"]);
      equal("{,{a,}}{,c}", ["", "c", "a", "ac", "", "c"]);
      equal("{,{,b}}{,c}", ["", "c", "", "c", "b", "bc"]);
      equal("{,{,}}{,c}", ["", "c", "", "c", "", "c"]);
      equal("{,a}{,c}", ["", "c", "a", "ac"]);
      equal("{,{,a}b}", ["", "b", "ab"]);
      equal("{,b}", ["", "b"]);
      equal("{,b{,a}}", ["", "b", "ba"]);
      equal("{b,{,a}}", ["b", "", "a"]);
      equal("{,b}{,d}", ["", "d", "b", "bd"]);
      equal("{a,b}{,d}", ["a", "ad", "b", "bd"]);
    });
  });

  describe("brace expansion unit tests from brace-expand", () => {
    describe("sequences", () => {
      test("numeric sequences", () => {
        equal("a{1..2}b{2..3}c", ["a1b2c", "a1b3c", "a2b2c", "a2b3c"]);
        equal("{1..2}{2..3}", ["12", "13", "22", "23"]);
      });

      test("numeric sequences with step count", () => {
        equal("{0..8..2}", ["0", "2", "4", "6", "8"]);
        equal("{1..8..2}", ["1", "3", "5", "7"]);
      });

      test("numeric sequence with negative x / y", () => {
        equal("{3..-2}", ["3", "2", "1", "0", "-1", "-2"]);
      });

      test("alphabetic sequences", () => {
        equal("1{a..b}2{b..c}3", ["1a2b3", "1a2c3", "1b2b3", "1b2c3"]);
        equal("{a..b}{b..c}", ["ab", "ac", "bb", "bc"]);
      });

      test("alphabetic sequences with step count", () => {
        equal("{a..k..2}", ["a", "c", "e", "g", "i", "k"]);
        equal("{b..k..2}", ["b", "d", "f", "h", "j"]);
      });
    });

    describe("dollar", () => {
      test("ignores ${", () => {
        equal("${1..3}", ["${1..3}"]);
        equal("${a,b}${c,d}", ["${a,b}${c,d}"]);
        equal("x${a,b}x${c,d}x", ["x${a,b}x${c,d}x"]);
      });
    });

    describe("empty option", () => {
      test("should support empty sets", () => {
        equal("-v{,,,,}", ["-v", "-v", "-v", "-v", "-v"]);
      });
    });

    describe("negative increments", () => {
      test("should support negative steps", () => {
        equal("{3..1}", ["3", "2", "1"]);
        equal("{10..8}", ["10", "9", "8"]);
        equal("{10..08}", ["10", "09", "08"]);
        equal("{c..a}", ["c", "b", "a"]);

        equal("{4..0..2}", ["4", "2", "0"]);
        equal("{4..0..-2}", ["4", "2", "0"]);
        equal("{e..a..2}", ["e", "c", "a"]);
      });
    });

    describe("nested", () => {
      test("should support nested sets", () => {
        equal("{a,b{1..3},c}", ["a", "b1", "b2", "b3", "c"]);
        equal("{{A..E},{a..e}}", [
          "A", "B", "C", "D", "E", "a", "b", "c", "d", "e",
        ]);
        equal("ppp{,config,oe{,conf}}", [
          "ppp", "pppconfig", "pppoe", "pppoeconf",
        ]);
      });
    });

    describe("order", () => {
      test("should expand in given order", () => {
        equal("a{d,c,b}e", ["ade", "ace", "abe"]);
      });
    });

    describe("pad", () => {
      test("should support padding", () => {
        equal("{9..11}", ["9", "10", "11"]);
        equal("{09..11}", ["09", "10", "11"]);
      });
    });
  });

  describe("additional brace expansion test", () => {
    describe("sequences", () => {
      test("zero-padded numeric sequences", () => {
        equal("{008..012}", ["008", "009", "010", "011", "012"]);
      });

      test("zero-padded numeric sequences with increments", () => {
        equal("{008..012..2}", ["008", "010", "012"]);
      });
    });
  });
});
