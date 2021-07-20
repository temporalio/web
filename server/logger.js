const timeStamp = () => '[' + new Date().toISOString() + ']';

const withTimestamp = (fn, ...args) => {
  return fn.call(null, timeStamp(), ...args);
};

const logger = {
  log: (...args) => withTimestamp(console.log, ...args),
  warn: (...args) => withTimestamp(console.warn, ...args),
  error: (...args) => withTimestamp(console.error, ...args),
  debug: (...args) => withTimestamp(console.debug, ...args),
};

module.exports = logger;
