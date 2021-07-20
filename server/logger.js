class Logger {
  ts = () => {
    return '[' + new Date().toISOString() + '] ';
  };

  log(...data) {
    console.log(this.ts(), ...data);
  }
  warn(...data) {
    console.warn(this.ts(), ...data);
  }
  error(...data) {
    console.error(this.ts(), ...data);
  }
  debug(...data) {
    console.debug(this.ts(), ...data);
  }
}

module.exports = { logger: new Logger() };
