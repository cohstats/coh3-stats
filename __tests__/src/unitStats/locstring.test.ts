import { resolveTextFormatterLocstring } from "../../../src/unitStats/locstring";

const reference = (value: string) => ({ locstring: { name: "", value } });
const render = (template: string, values: Array<number | string>) => {
  const strings: Record<string, string> = { template };
  return resolveTextFormatterLocstring(
    {
      formatter: reference("template"),
      formatter_arguments: values.map((value, index) => {
        if (typeof value === "number") return { float_value: value };
        strings[`label${index}`] = value;
        return { locstring_value: reference(`label${index}`) };
      }),
    },
    "en",
    strings,
  );
};

it("formats Crocodile's decimal bonus alongside its unrelated percentage", () => {
  expect(
    render("+%1%%% %2% \\n+%3:.2% %4%", [20, "rate of fire", 0.75, "flamethrower damage"]),
  ).toBe("+20% rate of fire \\n+0.75 flamethrower damage");
});

it("uses argument indices and supports different precisions for the same argument", () => {
  expect(render("%2:.2% / %1% / %2:.1% / %2:.0%", [7, 1.234])).toBe("1.23 / 7 / 1.2 / 1");
});

it.each([
  [0, "0.00"],
  [-0.75, "-0.75"],
  [1.5, "1.50"],
  [1.249, "1.25"],
] as const)("formats numeric value %s with two decimal places", (value, expected) => {
  expect(render("%1:.2%", [value])).toBe(expected);
});

it.each(["p", ".p", ".1p"])("supports the exported percentage format %s", (format) => {
  const expected = format === ".1p" ? "25.0%" : "25%";
  expect(render(`%1:${format}%`, [25])).toBe(expected);
});

it("handles literal percent signs without reinterpreting inserted labels", () => {
  expect(render("%1%%% / %% / %2%", [20, "%1% with %% inside"])).toBe(
    "20% / % / %1% with %% inside",
  );
});

it("keeps zero and string arguments intact and tolerates missing arguments", () => {
  expect(render("%1% / %2% / %3% / %4:.2%", [0, "label"])).toBe("0 / label / 0 / 0.00");
});

it("leaves unsupported precision visible instead of throwing a RangeError", () => {
  expect(render("%1:.101%", [0.75])).toBe("%1:.101%");
});
