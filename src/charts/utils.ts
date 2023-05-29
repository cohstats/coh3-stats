export const generateWeeklyAverages = (dailyData: Array<{ x: string; y: number }>) => {
  const weeklyData = [];

  for (let i = 0; i < dailyData.length; i += 7) {
    let sum = 0;
    const startDate = dailyData[i].x;
    const endDate = dailyData[Math.min(i + 6, dailyData.length - 1)].x;

    for (let j = i; j < i + 7 && j < dailyData.length; j++) {
      sum += dailyData[j].y;
    }

    const average = sum / Math.min(7, dailyData.length - i);
    weeklyData.push({ x: startDate + " to " + endDate, y: average });
  }

  return weeklyData;
};
