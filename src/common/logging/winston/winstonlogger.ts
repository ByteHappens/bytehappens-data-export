import { Logger } from "winston";
import { logging } from "bytehappens";

export class WinstonLogger<TLog extends logging.ILog> implements logging.ILogger<TLog> {
  private readonly _logger: Logger;

  public constructor(logger: Logger) {
    if (!logger) {
      throw "Failed to create WinstonLogger: Missing Logger";
    }

    this._logger = logger;
  }

  Log(log: TLog): void {
    this._logger.log(log.level, log.message, log.meta);
  }
}
