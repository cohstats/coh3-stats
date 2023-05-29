export const generateWeeklyAverages = (dailyData: Array<{ x: string; y: number }>) => {
  const weeklyData = [];

  for (let i = 0; i < dailyData.length; i += 7) {
    let sum = 0;
    const startDate = dailyData[i].x;
    // const endDate = dailyData[Math.min(i + 6, dailyData.length - 1)].x;

    for (let j = i; j < i + 7 && j < dailyData.length; j++) {
      sum += dailyData[j].y;
    }

    const average = Math.round(sum / Math.min(7, dailyData.length - i));
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
