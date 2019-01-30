import { Logger, LoggerOptions, createLogger, format, transports } from "winston";

import { IWinstonConsoleConfiguration } from "./interfaces/iwinstonconsoleconfiguration";
import { ValidateConsoleConfiguration } from "./validation";

export function InitConsoleLogger(configuration: IWinstonConsoleConfiguration): Logger {
  ValidateConsoleConfiguration(configuration);

  let loggerOptions: LoggerOptions = {
    level: configuration.level,
    format: format.json(),
    transports: [new transports.Console()]
  };

  let response: Logger = createLogger(loggerOptions);
  return response;
}
