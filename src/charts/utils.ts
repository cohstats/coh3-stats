export const generateWeeklyAverages = (
  dailyData: Array<{ x: string; y: number }>,
  round = true,
) => {
  const weeklyData = [];

  for (let i = 0; i < dailyData.length; i += 7) {
    let sum = 0;
    const startDate = dailyData[i].x;
    // const endDate = dailyData[Math.min(i + 6, dailyData.length - 1)].x;

    for (let j = i; j < i + 7 && j < dailyData.length; j++) {
      sum += dailyData[j].y;
    }

    const noRoundedAverage = sum / Math.min(7, dailyData.length - i);
    const average = round ? Math.round(noRoundedAverage) : noRoundedAverage;
    weeklyData.push({ x: startDate, y: average });
  }

  return weeklyData;
};

export const getMinMaxValues = (data: { x: any; y: number }[]) => {
  let minValue = Infinity;
  let maxValue = -Infinity;

  for (const { y } of data) {
    if (y < minValue) minValue = y;
    if (y > maxValue) maxValue = y;
  }

  return { minValue, maxValue };
};
export const minMaxRange = (mapsData: { value: string | number }[]) => {
  let maxValue = -Infinity;
  let minValue = Infinity;

  // Find the maximum and minimum values from the input data
  for (const { value } of mapsData) {
    const numericValue = parseFloat(`${value}`);
    if (!isNaN(numericValue)) {
      maxValue = Math.max(maxValue, numericValue);
      minValue = Math.min(minValue, numericValue);
    }
  }

  const rangeIncrement = 5;
  const rangeMin = Math.floor(minValue / rangeIncrement) * rangeIncrement;
  const rangeMax = Math.ceil(maxValue / rangeIncrement) * rangeIncrement;

  // Determine the absolute value that is greater
  const absMaxValue = Math.abs(rangeMin);
  const absMinValue = Math.abs(rangeMax);
  const rangeValue = absMaxValue > absMinValue ? absMaxValue : absMinValue;

  // Return the range with the determined value
  return { min: -rangeValue, max: rangeValue };
};
