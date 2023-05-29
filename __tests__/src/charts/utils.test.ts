import { generateWeeklyAverages } from "../../../src/charts/utils";

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

  // Add more test cases as needed
});
