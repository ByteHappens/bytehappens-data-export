import { Logger } from "winston";

import { ILog, ILogger } from "common/logging";

export class WinstonLogger<TLog extends ILog> implements ILogger<TLog> {
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
