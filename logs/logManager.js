const winston = require('winston');
const { combine, printf, timestamp, label } = winston.format;
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `\n${level.toLocaleUpperCase()} [${label}] time :${timestamp} \n${message}`;
});
const logger = winston.createLogger({
  level: 'silly',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: './logs_file.log',
    }),
  ],
  format: combine(
    label({ label: 'Scalable Node Server' }),
    timestamp(),
    myFormat
  ),
});
// supported types
// logger.error("error log");
// logger.warn("warn log");
// logger.info("info log");
// logger.verbose("verbose log");
// logger.debug("debug log");
// logger.silly("silly log");
function tryToWithLogger(execute, path) {
  try {
    execute();
  } catch (err) {
    logger.error(`-${path}\n${err}`);
  }
}

module.exports = { tryToWithLogger, logger };
