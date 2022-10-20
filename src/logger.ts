const logger = {
  log: (value: any) => {
    console.log(value);
  },
  error: (value: any) => {
    console.error(value);
  },
  warn: (value: any) => {
    console.warn(value);
  },
  debug: (value: any) => {
    console.debug(value);
  },
  info: (value: any) => {
    console.info(value);
  },
};

export { logger };
