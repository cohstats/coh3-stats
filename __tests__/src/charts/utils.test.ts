import { generateWeeklyAverages } from "../../../src/charts/utils";
import { getMinMaxValues } from "../../../src/charts/utils";
import { minMaxRange } from "../../../src/charts/utils";

describe("generateWeeklyAverages", () => {
  test("should return an empty array when given an empty dailyData array", () => {
    const dailyData: { x: string; y: number }[] = [];
    const result = generateWeeklyAverages(dailyData);
    expect(result).toEqual([]);
  });

  test("should return the correct weekly averages for a given dailyData array", () => {
    const dailyData = [
      { x: "2023-05-19", y: 5411 },
      { x: "2023-05-20", y: 6252 },
      { x: "2023-05-21", y: 4821 },
      { x: "2023-05-22", y: 5887 },
      { x: "2023-05-23", y: 6749 },
      { x: "2023-05-24", y: 5123 },
      { x: "2023-05-25", y: 5965 },
      { x: "2023-05-26", y: 5032 },
      { x: "2023-05-27", y: 5698 },
      { x: "2023-05-28", y: 6310 },
    ];

    // const expectedWeeklyAverages = [
    //   { x: "2023-05-19 to 2023-05-25", y: 5744 },
    //   { x: "2023-05-26 to 2023-05-28", y: 5680 },
    // ];

    const expectedWeeklyAverages = [
      { x: "2023-05-19", y: 5744 },
      { x: "2023-05-26", y: 5680 },
    ];

    const result = generateWeeklyAverages(dailyData);
    expect(result).toEqual(expectedWeeklyAverages);
  });

  test("test weekly averages with round = false", () => {
    const dailyData = [
      { x: "2023-05-19", y: 5411 },
      { x: "2023-05-20", y: 6252 },
      { x: "2023-05-21", y: 4813 },
      { x: "2023-05-22", y: 5887 },
      { x: "2023-05-23", y: 6749 },
      { x: "2023-05-24", y: 5123 },
      { x: "2023-05-25", y: 5965 },
      { x: "2023-05-26", y: 5032 },
      { x: "2023-05-27", y: 5697 },
      { x: "2023-05-28", y: 6310 },
    ];

    const expectedWeeklyAverages = [
      { x: "2023-05-19", y: 5742.857142857143 },
      { x: "2023-05-26", y: 5679.666666666667 },
    ];

    const result = generateWeeklyAverages(dailyData, false);
    expect(result).toEqual(expectedWeeklyAverages);
  });
});

describe("getMinMaxValues", () => {
  //test getMinMaxValues
  test("should return the correct min and max values for a given dailyData array", () => {
    const dailyData = [
      { x: "2023-05-19", y: 5411 },
      { x: "2023-05-20", y: 6252 },
      { x: "2023-05-21", y: 4821 },
      { x: "2023-05-22", y: 5887 },
      { x: "2023-05-23", y: 6749 },
      { x: "2023-05-24", y: 5123 },
      { x: "2023-05-25", y: 5965 },
      { x: "2023-05-26", y: 5032 },
      { x: "2023-05-27", y: 5698 },
      { x: "2023-05-28", y: 6310 },
    ];

    const expectedMinMaxValues = { minValue: 4821, maxValue: 6749 };

    const result = getMinMaxValues(dailyData);
    expect(result).toEqual(expectedMinMaxValues);
  });
});

describe("minMaxRange", () => {
  test("test positive values", () => {
    // mapsData which are random from range 3 to 65
    const mapsData = [
      { value: 3 },
      { value: 65 },
      { value: 12 },
      { value: 45 },
      { value: 32 },
      { value: 54 },
      { value: 23 },
      { value: 43 },
      { value: 65 },
    ];

    const expectedMinMaxRange = { min: -65, max: 65 };

    const result = minMaxRange(mapsData);
    expect(result).toEqual(expectedMinMaxRange);
  });

  test("test negative values", () => {
    // mapsData which are random from range -3 to -65
    const mapsData = [
      { value: -3 },
      { value: -65 },
      { value: -12 },
      { value: -45 },
      { value: -32 },
      { value: -54 },
      { value: -23 },
      { value: -43 },
      { value: -67 },
    ];

    const expectedMinMaxRange = { min: -70, max: 70 };

    const result = minMaxRange(mapsData);
    expect(result).toEqual(expectedMinMaxRange);
  });

  test("test positive and negative values", () => {
    // mapsData which are random from range -3 to 65
    const mapsData = [
      { value: -3 },
      { value: 65 },
      { value: -12 },
      { value: 45 },
      { value: -32 },
      { value: 54 },
      { value: -23 },
      { value: 43 },
      { value: -67 },
    ];

    const expectedMinMaxRange = { min: -70, max: 70 };

    const result = minMaxRange(mapsData);
    expect(result).toEqual(expectedMinMaxRange);
  });
});
