import { describe, expect, test } from "bun:test";
import util from "node:util";
import { fill } from "../src/fill-range.ts";

const exact = (actual: unknown, expected: unknown[]) => {
  expect(Array.isArray(actual)).toBe(true);
  expect(util.inspect(actual)).toBe(util.inspect(expected));
};

const expand = (start: number, stop: number, step = 1): number[] => {
  const arr: number[] = [];
  for (let i = start; i <= stop; i += step) arr.push(i);
  return arr;
};

const toRegex = (...args: any[]) => new RegExp(`^(${fill(...(args as [any]))})$`);
const isMatch = (...args: any[]) => {
  const input = args.pop();
  return toRegex(...args).test(input);
};

describe("ranges", () => {
  describe("alphabetical", () => {
    test("should increment alphabetical ranges", () => {
      exact(fill("a"), ["a"]);
      exact(fill("a", "a"), ["a"]);
      exact(fill("a", "b"), ["a", "b"]);
      exact(fill("a", "e"), ["a", "b", "c", "d", "e"]);
      exact(fill("A", "E"), ["A", "B", "C", "D", "E"]);
    });

    test("should decrement alphabetical ranges", () => {
      exact(fill("E", "A"), ["E", "D", "C", "B", "A"]);
      exact(
        fill("a", "C"),
        [
          "a", "`", "_", "^", "]", "\\", "[", "Z", "Y", "X", "W", "V", "U", "T",
          "S", "R", "Q", "P", "O", "N", "M", "L", "K", "J", "I", "H", "G", "F",
          "E", "D", "C",
        ],
      );
      exact(fill("z", "m"), [
        "z", "y", "x", "w", "v", "u", "t", "s", "r", "q", "p", "o", "n", "m",
      ]);
    });
  });

  describe("alphanumeric", () => {
    test("should increment alphanumeric ranges", () => {
      exact(fill("9", "B"), ["9", ":", ";", "<", "=", ">", "?", "@", "A", "B"]);
      exact(
        fill("A", "10"),
        [
          "A", "@", "?", ">", "=", "<", ";", ":", "9", "8", "7", "6", "5", "4",
          "3", "2", "1",
        ],
      );
      exact(
        fill("a", "10"),
        [
          "a", "`", "_", "^", "]", "\\", "[", "Z", "Y", "X", "W", "V", "U", "T",
          "S", "R", "Q", "P", "O", "N", "M", "L", "K", "J", "I", "H", "G", "F",
          "E", "D", "C", "B", "A", "@", "?", ">", "=", "<", ";", ":", "9", "8",
          "7", "6", "5", "4", "3", "2", "1",
        ],
      );
    });

    test("should step alphanumeric ranges", () => {
      exact(fill("9", "B", 3), ["9", "<", "?", "B"]);
    });

    test("should decrement alphanumeric ranges", () => {
      exact(fill("C", "9"), ["C", "B", "A", "@", "?", ">", "=", "<", ";", ":", "9"]);
    });
  });

  describe("numbers", () => {
    test("should increment numerical *string* ranges", () => {
      exact(fill("1"), ["1"]);
      exact(fill("1", "1"), ["1"]);
      exact(fill("1", "2"), ["1", "2"]);
      exact(fill("1", "10"), ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
      exact(fill("1", "3"), ["1", "2", "3"]);
      exact(fill("5", "8"), ["5", "6", "7", "8"]);
      exact(fill("1", "9"), ["1", "2", "3", "4", "5", "6", "7", "8", "9"]);
    });

    test("should increment numerical *number* ranges", () => {
      exact(fill(1, 3), [1, 2, 3]);
      exact(fill(1, 9), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
      exact(fill(5, 8), [5, 6, 7, 8]);
    });

    test("should increment combo number/string ranges", () => {
      exact(fill("1", 9), ["1", "2", "3", "4", "5", "6", "7", "8", "9"]);
      exact(fill("2", 5), ["2", "3", "4", "5"]);
    });

    test("should decrement numerical *string* ranges", () => {
      exact(fill("0", "-5"), ["0", "-1", "-2", "-3", "-4", "-5"]);
      exact(fill("-1", "-5"), ["-1", "-2", "-3", "-4", "-5"]);
    });

    test("should decrement numerical *number* ranges", () => {
      exact(fill(-10, -1), [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1]);
      exact(fill(0, -5), [0, -1, -2, -3, -4, -5]);
    });

    test("should handle *string* ranges that span positive and negative", () => {
      exact(fill("9", "-4"), [
        "9", "8", "7", "6", "5", "4", "3", "2", "1", "0", "-1", "-2", "-3", "-4",
      ]);
      exact(fill("-5", "5"), [
        "-5", "-4", "-3", "-2", "-1", "0", "1", "2", "3", "4", "5",
      ]);
    });

    test("should handle *number* ranges that span positive and negative", () => {
      exact(fill(9, -4), [9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4]);
      exact(fill(-5, 5), [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]);
    });
  });
});

describe("steps", () => {
  test("should increment numerical ranges using the given step", () => {
    exact(fill("1", "10", "1"), ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
    exact(fill("1", "10", "2"), ["1", "3", "5", "7", "9"]);
    exact(fill("0", "1000", "200"), ["0", "200", "400", "600", "800", "1000"]);
    exact(fill("1", "10", 2), ["1", "3", "5", "7", "9"]);
    exact(fill("1", "20", "2"), [
      "1", "3", "5", "7", "9", "11", "13", "15", "17", "19",
    ]);
    exact(fill("1", "20", "20"), ["1"]);
    exact(fill("10", "1", "2"), ["10", "8", "6", "4", "2"]);
    exact(fill("10", "1", "-2"), ["10", "8", "6", "4", "2"]);
    exact(fill(2, 10, "2"), [2, 4, 6, 8, 10]);
    exact(fill(2, 10, 1), [2, 3, 4, 5, 6, 7, 8, 9, 10]);
    exact(fill(2, 10, 2), [2, 4, 6, 8, 10]);
    exact(fill(2, 10, 3), [2, 5, 8]);
    exact(fill(0, 5, 2), [0, 2, 4]);
    exact(fill(5, 0, 2), [5, 3, 1]);
    exact(fill(1, 5, 2), [1, 3, 5]);
    exact(fill(2, "10", 2), ["2", "4", "6", "8", "10"]);
    exact(fill(2, "10", 1), ["2", "3", "4", "5", "6", "7", "8", "9", "10"]);
    exact(fill(2, "10", "2"), ["2", "4", "6", "8", "10"]);
    exact(fill("2", 10, "3"), ["2", "5", "8"]);
  });

  test("should fill in negative ranges using the given step (strings)", () => {
    exact(fill("0", "-10", "-2"), ["0", "-2", "-4", "-6", "-8", "-10"]);
    exact(fill("-0", "-10", "-2"), ["0", "-2", "-4", "-6", "-8", "-10"]);
    exact(fill("-1", "-10", "-2"), ["-1", "-3", "-5", "-7", "-9"]);
    exact(fill("-1", "-10", "2"), ["-1", "-3", "-5", "-7", "-9"]);
    exact(fill("1", "10", "2"), ["1", "3", "5", "7", "9"]);
    exact(fill("1", "20", "2"), [
      "1", "3", "5", "7", "9", "11", "13", "15", "17", "19",
    ]);
    exact(fill("1", "20", "20"), ["1"]);
    exact(fill("10", "1", "-2"), ["10", "8", "6", "4", "2"]);
    exact(fill("-10", "0", "2"), ["-10", "-8", "-6", "-4", "-2", "0"]);
    exact(fill("-10", "-0", "2"), ["-10", "-8", "-6", "-4", "-2", "0"]);
    exact(fill("-0", "-10", "0"), [
      "0", "-1", "-2", "-3", "-4", "-5", "-6", "-7", "-8", "-9", "-10",
    ]);
    exact(fill("0", "-10", "-0"), [
      "0", "-1", "-2", "-3", "-4", "-5", "-6", "-7", "-8", "-9", "-10",
    ]);
  });

  test("should fill in negative ranges using the given step (numbers)", () => {
    exact(fill(-10, 0, 2), [-10, -8, -6, -4, -2, 0]);
    exact(fill(-10, -2, 2), [-10, -8, -6, -4, -2]);
    exact(fill(-2, -10, 1), [-2, -3, -4, -5, -6, -7, -8, -9, -10]);
    exact(fill(0, -10, 2), [0, -2, -4, -6, -8, -10]);
    exact(fill(-2, -10, 2), [-2, -4, -6, -8, -10]);
    exact(fill(-2, -10, 3), [-2, -5, -8]);
    exact(fill(-9, 9, 3), [-9, -6, -3, 0, 3, 6, 9]);
  });

  test("should fill in negative ranges when negative zero is passed", () => {
    exact(fill(-10, -0, 2), [-10, -8, -6, -4, -2, 0]);
    exact(fill(-0, -10, 2), [0, -2, -4, -6, -8, -10]);
  });

  test("steps: letters", () => {
    exact(fill("z", "a", -2), [
      "z", "x", "v", "t", "r", "p", "n", "l", "j", "h", "f", "d", "b",
    ]);
    exact(fill("a", "e", 2), ["a", "c", "e"]);
    exact(fill("E", "A", 2), ["E", "C", "A"]);
  });

  test("options.step", () => {
    const options = { step: 2 };
    exact(fill("a", "e", options), ["a", "c", "e"]);
    exact(fill("E", "A", options), ["E", "C", "A"]);
  });
});

describe("padding", () => {
  test("should pad incremented numbers", () => {
    exact(fill("01", "03"), ["01", "02", "03"]);
    exact(fill("01", "3"), ["01", "02", "03"]);
    exact(fill("1", "03"), ["01", "02", "03"]);
    exact(fill("0001", "0003"), ["0001", "0002", "0003"]);
    exact(fill("-10", "00"), [
      "-10", "-09", "-08", "-07", "-06", "-05", "-04", "-03", "-02", "-01", "000",
    ]);
    exact(fill("05", "010"), ["005", "006", "007", "008", "009", "010"]);
  });

  test("should pad decremented numbers", () => {
    exact(fill("03", "01"), ["03", "02", "01"]);
    exact(fill("3", "01"), ["03", "02", "01"]);
    exact(fill("003", "1"), ["003", "002", "001"]);
    exact(fill("003", "001"), ["003", "002", "001"]);
    exact(fill("3", "001"), ["003", "002", "001"]);
    exact(fill("03", "001"), ["003", "002", "001"]);
  });

  test("should pad decremented numbers with regex source string", () => {
    expect(fill("03", "01", { toRegex: true })).toBe("0?[1-3]");
    expect(fill("3", "01", { toRegex: true })).toBe("0?[1-3]");
    expect(fill("003", "1", { toRegex: true })).toBe("0{0,2}[1-3]");
    expect(fill("003", "001", { toRegex: true })).toBe("0{0,2}[1-3]");
    expect(fill("3", "001", { toRegex: true })).toBe("0{0,2}[1-3]");
    expect(fill("03", "001", { toRegex: true })).toBe("0{0,2}[1-3]");
    expect(fill("001", "020", { toRegex: true })).toBe("0{0,2}[1-9]|0?1[0-9]|0?20");
  });

  test("should pad with strict zeros", () => {
    expect(fill("03", "01", { toRegex: true, strictZeros: true })).toBe("0[1-3]");
    expect(fill("3", "01", { toRegex: true, strictZeros: true })).toBe("0[1-3]");
    expect(fill("003", "1", { toRegex: true, strictZeros: true })).toBe("00[1-3]");
    expect(fill("003", "001", { toRegex: true, strictZeros: true })).toBe("00[1-3]");
    expect(fill("3", "001", { toRegex: true, strictZeros: true })).toBe("00[1-3]");
    expect(fill("03", "001", { toRegex: true, strictZeros: true })).toBe("00[1-3]");
    expect(fill("001", "020", { toRegex: true, strictZeros: true })).toBe(
      "00[1-9]|01[0-9]|020",
    );
  });

  test("should pad stepped numbers", () => {
    exact(fill("1", "05", "3"), ["01", "04"]);
    exact(fill("1", "5", "03"), ["01", "04"]);
    exact(fill("1", "5", "0003"), ["0001", "0004"]);
    exact(fill("1", "005", "3"), ["001", "004"]);
    exact(fill("00", "1000", "200"), [
      "0000", "0200", "0400", "0600", "0800", "1000",
    ]);
    exact(fill("0", "01000", "200"), [
      "00000", "00200", "00400", "00600", "00800", "01000",
    ]);
    exact(fill("001", "5", "3"), ["001", "004"]);
    exact(fill("02", "10", 2), ["02", "04", "06", "08", "10"]);
    exact(fill("002", "10", 2), ["002", "004", "006", "008", "010"]);
    exact(fill("002", "010", 2), ["002", "004", "006", "008", "010"]);
    exact(fill("-04", 4, 2), ["-04", "-02", "000", "002", "004"]);
  });
});

describe("invalid ranges", () => {
  test("should return an empty array when options.strict is not true", () => {
    expect(fill("1", "0f")).toEqual([]);
    expect(fill("1", "10", "ff")).toEqual([]);
    expect(fill("1", "10.f")).toEqual([]);
    expect(fill("1", "10f")).toEqual([]);
    expect(fill("1", "20", "2f")).toEqual([]);
    expect(fill("1", "20", "f2")).toEqual([]);
    expect(fill("1", "2f")).toEqual([]);
    expect(fill("1", "2f", "2")).toEqual([]);
    expect(fill("1", "f2")).toEqual([]);
    expect(fill("1", "ff")).toEqual([]);
    expect(fill("1", "ff", "2")).toEqual([]);
    expect(fill("1.1", "2.1")).toEqual([]);
    expect(fill("1.2", "2")).toEqual([]);
    expect(fill("1.20", "2")).toEqual([]);
  });
});

describe("error handling", () => {
  test("should throw when range arguments are invalid and strictRanges is true", () => {
    expect(() => fill("0a", "0z", { strictRanges: true })).toThrow(
      /Invalid range arguments: \[ '0a', '0z' \]/,
    );
    expect(() => fill("", "*", 2, { strictRanges: true })).toThrow(
      /Invalid range arguments: \[ '', '\*' \]/,
    );
  });

  test("should throw when args are incompatible", () => {
    expect(() => fill("a8", 10, { strictRanges: true })).toThrow(
      /Invalid range arguments: \[ 'a8', 10 \]/,
    );
    expect(() => fill(1, "zz", { strictRanges: true })).toThrow(
      /Invalid range arguments: \[ 1, 'zz' \]/,
    );
  });

  test("should throw when the step is bad", () => {
    const opts = { strictRanges: true };
    expect(() => fill("1", "10", "z", opts)).toThrow(/Expected step "z" to be a number/);
    expect(() => fill("a", "z", "a", opts)).toThrow(/Expected step "a" to be a number/);
    expect(() => fill("a", "z", "0a", opts)).toThrow(/Expected step "0a" to be a number/);
  });
});

describe("special cases", () => {
  test("negative zero", () => {
    exact(fill("-5", "-0", "-1"), ["-5", "-4", "-3", "-2", "-1", "0"]);
    exact(fill("1", "-0", 1), ["1", "0"]);
    exact(fill("1", "-0", 0), ["1", "0"]);
    exact(fill("1", "-0", "0"), ["1", "0"]);
    exact(fill("1", "-0", "1"), ["1", "0"]);
    exact(fill("-0", "-0", "1"), ["0"]);
    exact(fill("-0", "0", "1"), ["0"]);
    exact(fill("-0", "5", "1"), ["0", "1", "2", "3", "4", "5"]);
    exact(fill(-0, 5), [0, 1, 2, 3, 4, 5]);
    exact(fill(5, -0, 5), [5, 0]);
    exact(fill(5, -0, 2), [5, 3, 1]);
    exact(fill(0, 5, 2), [0, 2, 4]);
  });

  test("should adjust padding for negative numbers", () => {
    exact(fill("-01", "5"), ["-01", "000", "001", "002", "003", "004", "005"]);
  });
});

describe("custom expand function", () => {
  test("exposes the current value", () => {
    exact(fill(1, 5, (value: any) => value), [1, 2, 3, 4, 5]);
  });
  test("exposes the character code for non-integers", () => {
    const arr = fill("a", "e", (code: any) => String.fromCharCode(code));
    exact(arr, ["a", "b", "c", "d", "e"]);
  });
  test("can pad in the transform", () => {
    const arr = fill("01", "05", (value: any) =>
      String(value).padStart(String(value).length + 3, "0"),
    );
    exact(arr, ["0001", "0002", "0003", "0004", "0005"]);
  });
  test("exposes the index", () => {
    const arr = fill("a", "e", (code: any, index: any) =>
      String.fromCharCode(code) + index,
    );
    exact(arr, ["a0", "b1", "c2", "d3", "e4"]);
  });
});

describe("options.stringify", () => {
  test("should cast values to strings", () => {
    const opts = { stringify: true };
    exact(fill("1", "10", "1", opts), [
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
    ]);
    exact(fill(2, 10, "2", opts), ["2", "4", "6", "8", "10"]);
    exact(fill(2, 10, 1, opts), ["2", "3", "4", "5", "6", "7", "8", "9", "10"]);
    exact(fill(2, 10, 3, opts), ["2", "5", "8"]);
  });
});

describe("options.transform", () => {
  test("should cast values to strings", () => {
    const transform = (value: any) => String(value);
    exact(fill("1", "10", "1", { transform }), [
      "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
    ]);
    exact(fill(2, 10, "2", { transform }), ["2", "4", "6", "8", "10"]);
    exact(fill(2, 10, 1, { transform }), [
      "2", "3", "4", "5", "6", "7", "8", "9", "10",
    ]);
    exact(fill(2, 10, 3, { transform }), ["2", "5", "8"]);
  });
});

describe("options.toRegex", () => {
  const opts = { toRegex: true };

  test("ascending numbers", () => {
    expect(fill(2, 8, opts)).toBe("[2-8]");
    expect(fill(2, 10, opts)).toBe("[2-9]|10");
    expect(fill(2, 100, opts)).toBe("[2-9]|[1-9][0-9]|100");
  });

  test("positive + negative numbers", () => {
    expect(fill(-10, 10, opts)).toBe("-[1-9]|-?10|[0-9]");
    expect(fill(-10, 10, 2, opts)).toBe("0|2|4|6|8|10|-(?:2|4|6|8|10)");
    expect(fill(-10, 0, 2, opts)).toBe("0|-(?:2|4|6|8|10)");
    expect(fill(-10, -2, 2, opts)).toBe("-(?:2|4|6|8|10)");
  });

  test("descending numbers", () => {
    expect(fill(8, 2, opts)).toBe("[2-8]");
  });

  test("with a step", () => {
    expect(fill(8, 2, { toRegex: true, step: 2 })).toBe("2|4|6|8");
    expect(fill(2, 8, { toRegex: true, step: 2 })).toBe("2|4|6|8");
  });

  test("zero-padding", () => {
    expect(fill("002", "008", opts)).toBe("0{0,2}[2-8]");
    expect(fill("02", "08", opts)).toBe("0?[2-8]");
    expect(fill("02", "10", opts)).toBe("0?[2-9]|10");
    expect(fill("002", "100", opts)).toBe("0{0,2}[2-9]|0?[1-9][0-9]|100");
  });

  test("negative zero-padding", () => {
    expect(fill("-002", "-100", opts)).toBe(
      "-0{0,3}[2-9]|-0{0,2}[1-9][0-9]|-0?100",
    );
    expect(fill("-02", "-08", opts)).toBe("-0{0,2}[2-8]");
    expect(fill("-02", "-100", opts)).toBe(
      "-0{0,3}[2-9]|-0{0,2}[1-9][0-9]|-0?100",
    );
    expect(fill("-02", "100", opts)).toBe(
      "-0{0,2}[12]|0{0,2}[0-9]|0?[1-9][0-9]|100",
    );
  });

  test("alpha ascending", () => {
    expect(fill("a", "b", opts)).toBe("[a-b]");
    expect(fill("A", "b", opts)).toBe("[A-b]");
    expect(fill("Z", "a", opts)).toBe("[Z-a]");
  });

  test("alpha descending", () => {
    expect(fill("z", "A", opts)).toBe("[A-z]");
  });
});

describe("options.wrap", () => {
  const opts = { toRegex: true, wrap: true };
  test("should not wrap single", () => {
    expect(fill(2, 8, opts)).toBe("[2-8]");
  });
  test("should wrap", () => {
    expect(fill(2, 10, opts)).toBe("(?:[2-9]|10)");
    expect(fill(2, 100, opts)).toBe("(?:[2-9]|[1-9][0-9]|100)");
  });
  test("wrap pos+neg", () => {
    expect(fill(-10, -2, 2, opts)).toBe("(?:-(?:2|4|6|8|10))");
    expect(fill(-10, 0, 2, opts)).toBe("(?:0|-(?:2|4|6|8|10))");
    expect(fill(-10, 10, 2, opts)).toBe("(?:0|2|4|6|8|10|-(?:2|4|6|8|10))");
    expect(fill(-10, 10, opts)).toBe("(?:-[1-9]|-?10|[0-9])");
  });
});

describe("options.capture", () => {
  test("wraps result in parens", () => {
    const opts = { toRegex: true, capture: true };
    expect(fill(-10, 10, 2, opts)).toBe("(0|2|4|6|8|10|-(2|4|6|8|10))");
    expect(fill(-10, 10, opts)).toBe("(-[1-9]|-?10|[0-9])");
  });
});

describe("matching via generated regex", () => {
  test("ascending numbers", () => {
    expect(isMatch(2, 8, { toRegex: true }, "10")).toBe(false);
    expect(isMatch(2, 8, { toRegex: true }, "3")).toBe(true);
    expect(isMatch(2, 10, { toRegex: true }, "10")).toBe(true);
    expect(isMatch(2, 100, { toRegex: true }, "10")).toBe(true);
    expect(isMatch(2, 100, { toRegex: true }, "101")).toBe(false);
  });
  test("positive + negative", () => {
    expect(isMatch(-10, 10, { toRegex: true }, "10")).toBe(true);
    expect(isMatch(-10, 10, 2, { toRegex: true }, "10")).toBe(true);
  });
  test("descending", () => {
    expect(isMatch(8, 2, { toRegex: true }, "2")).toBe(true);
    expect(isMatch(8, 2, { toRegex: true }, "8")).toBe(true);
    expect(isMatch(8, 2, { toRegex: true }, "10")).toBe(false);
  });
  test("with step", () => {
    expect(isMatch(8, 2, { toRegex: true, step: 2 }, "10")).toBe(false);
    expect(isMatch(8, 2, { toRegex: true, step: 2 }, "3")).toBe(false);
    expect(isMatch(8, 2, { toRegex: true, step: 2 }, "5")).toBe(false);
    expect(isMatch(8, 2, { toRegex: true, step: 2 }, "8")).toBe(true);
    expect(isMatch(2, 8, { toRegex: true, step: 2 }, "10")).toBe(false);
    expect(isMatch(2, 8, { toRegex: true, step: 2 }, "3")).toBe(false);
    expect(isMatch(2, 8, { toRegex: true, step: 2 }, "8")).toBe(true);
  });
});

describe("validate ranges (verify-matches)", () => {
  const matcher = (...args: any[]) => {
    const regex = toRegex(...args);
    return (num: any) => regex.test(String(num));
  };

  const verifyRange = (min: number, max: number, from: number, to: number) => {
    const fn = matcher(min, max, { toRegex: true });
    const range = expand(from, to);
    for (const num of range) {
      if (min <= num && num <= max) {
        expect(fn(num)).toBe(true);
      } else {
        expect(fn(num)).toBe(false);
      }
    }
  };

  test("supports equal numbers", () => {
    verifyRange(1, 1, 0, 100);
    verifyRange(65443, 65443, 65000, 66000);
    verifyRange(192, 1000, 0, 1000);
  });
  test("supports large numbers", () => {
    verifyRange(
      100019999300000,
      100020000300000,
      100019999999999,
      100020000100000,
    );
  });
  test("supports repeated digits", () => {
    verifyRange(10331, 20381, 0, 99999);
  });
  test("supports repeated zeros", () => {
    verifyRange(10031, 20081, 0, 59999);
    verifyRange(10000, 20000, 0, 59999);
  });
  test("supports zero one", () => {
    verifyRange(10301, 20101, 0, 99999);
  });
  test("supports repeated ones", () => {
    verifyRange(102, 111, 0, 1000);
  });
  test("supports small diffs", () => {
    verifyRange(102, 110, 0, 1000);
    verifyRange(102, 130, 0, 1000);
  });
  test("supports random ranges", () => {
    verifyRange(4173, 7981, 0, 99999);
  });
  test("supports one digit numbers", () => {
    verifyRange(3, 7, 0, 99);
  });
  test("supports one digit at bounds", () => {
    verifyRange(1, 9, 0, 1000);
  });
  test("supports power of ten", () => {
    verifyRange(1000, 8632, 0, 99999);
  });
  test("varying lengths", () => {
    verifyRange(1030, 20101, 0, 99999);
    verifyRange(13, 8632, 0, 10000);
  });
  test("small ranges", () => {
    verifyRange(9, 11, 0, 100);
    verifyRange(19, 21, 0, 100);
  });
  test("big ranges", () => {
    verifyRange(90, 98009, 0, 98999);
    verifyRange(999, 10000, 1, 20000);
  });
});
