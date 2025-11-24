import chalk from 'chalk';

const getTimestamp = () => {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
};

export const logger = {
  info: (...args) => {
    console.log(chalk.blue(`[${getTimestamp()}] [INFO]`), ...args);
  },

  success: (...args) => {
    console.log(chalk.green(`[${getTimestamp()}] [SUCCESS]`), ...args);
  },

  error: (...args) => {
    console.error(chalk.red(`[${getTimestamp()}] [ERROR]`), ...args);
  },

  warn: (...args) => {
    console.warn(chalk.yellow(`[${getTimestamp()}] [WARN]`), ...args);
  },

  debug: (...args) => {
    if (process.env.DEBUG === 'true') {
      console.log(chalk.gray(`[${getTimestamp()}] [DEBUG]`), ...args);
    }
  }
};
