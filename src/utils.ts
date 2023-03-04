const calculatePageNumber = (position: number, RECORD_PER_PAGE = 100) => {
  // Calculate the page number
  return Math.ceil(position / RECORD_PER_PAGE);
};

const calculatePositionNumber = (pageNumber: number, RECORD_PER_PAGE = 100) => {
  return (pageNumber - 1) * RECORD_PER_PAGE + 1;
};

/**
 * INFO: This is old function
 * Returns string based on how much time elapsed from the match start
 *
 * Time < 1 Hour      returns MM minutes ago
 *
 * Time < 1 Day       returns HH hours MM minutes ago
 *
 * Time < 5 Days      returns X days ago
 *
 * Time > 5 days      returns en-US locale date
 */
function formatMatchTime(startTime: number, onlyDate = false) {
  const hourMillis = 3600 * 1000; // one day in a miliseconds range
  const difference = Date.now() - startTime * 1000; // start match vs NOW time difference in miliseconds
  const options: Intl.DateTimeFormatOptions = {
    //weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  let timeDifference = "";

  if (difference < hourMillis) {
    timeDifference = "1 hour ago";
  } else if (difference < hourMillis * 24) {
    timeDifference = new Date(difference).toISOString().substr(11, 2) + " hours ago";
  } else if (difference < hourMillis * 128) {
    timeDifference = new Date(difference).toISOString().substr(9, 1) + " days ago";
  } else {
    timeDifference = new Date(startTime * 1000).toLocaleDateString("en-US", options);
  }

  if (onlyDate) {
    timeDifference = new Date(startTime * 1000).toLocaleDateString("en-US", options);
  }

  return timeDifference; //return duration in HH:MM:SS format
}

export { calculatePageNumber, calculatePositionNumber, formatMatchTime };
