import { mapChartData } from "../../../../components/unitStats/dps/dpsChart";

describe("mapChartData", () => {
  test("should return chart line with default values when no id is provided", () => {
    const data = [
      { x: 0, y: 10 },
      { x: 1, y: 20 },
      { x: 2, y: 30 },
    ];

    const result = mapChartData(data);

    expect(result).toMatchObject({
      label: "No Item Selected",
      data: data,
      borderWidth: 3,
      borderColor: "#4dabf7",
      stepped: "",
      tension: 0.1,
      pointStyle: "cross",
      fill: false,
      backgroundColor: "rgba(200, 200, 200, 0.2)",
      pointRadius: 0,
      pointHoverRadius: 30,
      pointHitRadius: 10,
      intersect: true,
    });
  });

  test("should use provided id as label", () => {
    const data = [
      { x: 0, y: 10 },
      { x: 1, y: 20 },
    ];
    const id = "Test Unit";

    const result = mapChartData(data, id);

    expect(result.label).toBe(id);
  });

  test("should set stepped to 'after' when isStaircase is true", () => {
    const data = [
      { x: 0, y: 10 },
      { x: 1, y: 20 },
    ];
    const id = "Test Unit";
    const isStaircase = true;

    const result = mapChartData(data, id, isStaircase);

    expect(result.stepped).toBe("after");
  });

  test("should keep stepped as empty string when isStaircase is false", () => {
    const data = [
      { x: 0, y: 10 },
      { x: 1, y: 20 },
    ];
    const id = "Test Unit";
    const isStaircase = false;

    const result = mapChartData(data, id, isStaircase);

    expect(result.stepped).toBe("");
  });
});
