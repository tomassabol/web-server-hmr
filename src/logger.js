// @ts-check
/**
 * This is a simple logger class that can be used to log messages at different levels.
 */
export class Logger {
  /**
   *
   * @param {string} message
   * @param  {...any} args
   */
  debug(message, ...args) {
    console.log(`DEBUG: ${message}`, ...args);
  }

  /**
   *
   * @param {string} message
   * @param  {...any} args
   */
  info(message, ...args) {
    console.info(`INFO: ${message}`, ...args);
  }

  /**
   *
   * @param {string} message
   * @param  {...any} args
   */
  warn(message, ...args) {
    console.warn(`WARN: ${message}`, ...args);
  }

  /**
   *
   * @param {string} message
   * @param  {...any} args
   */
  error(message, ...args) {
    console.error(`ERROR: ${message}`, ...args);
  }

  /**
   *
   * @param {string} message
   * @param  {...any} args
   */
  critical(message, ...args) {
    console.error(`CRITICAL: ${message}`, ...args);
  }
}

export const logger = new Logger();
