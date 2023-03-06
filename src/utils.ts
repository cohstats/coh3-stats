const calculatePageNumber = (position: number, RECORD_PER_PAGE = 100) => {
  // Calculate the page number
  return Math.ceil(position / RECORD_PER_PAGE);
};

const calculatePositionNumber = (pageNumber: number, RECORD_PER_PAGE = 100) => {
  return (pageNumber - 1) * RECORD_PER_PAGE + 1;
};

const isBrowserEnv = () => {
  return typeof window !== "undefined";
};

export { calculatePageNumber, calculatePositionNumber, isBrowserEnv };
