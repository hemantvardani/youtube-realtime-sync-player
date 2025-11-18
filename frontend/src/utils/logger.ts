const isProduction = process.env.NODE_ENV === "production";

type LogArgs = unknown[];

const noop = () => undefined;

const createLoggerMethod =
  (method: (...args: LogArgs) => void) =>
  (...args: LogArgs) => {
    if (isProduction) return;
    method(...args);
  };

export const logger = {
  log: createLoggerMethod(console.log),
  warn: createLoggerMethod(console.warn),
  error: createLoggerMethod(console.error),
};

export default logger;

