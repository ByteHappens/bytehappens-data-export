import { Logger, LoggerOptions, createLogger, format } from "winston";

import { IWinstonTransportConfiguration } from "./interfaces/iwinstontransportconfiguration";
import { IWinstonLoggerFactory } from "./interfaces/iwinstonloggerfactory";

export class WinstonLoggerFactory implements IWinstonLoggerFactory {
  private readonly _level: string;
  private readonly _transportConfigurations: IWinstonTransportConfiguration[];

  constructor(level: string, configurations: IWinstonTransportConfiguration[]) {
    this._level = level;
    this._transportConfigurations = configurations;
  }

  public async CreateWinstonLoggerAsync(): Promise<Logger> {
    let loggerOptions: LoggerOptions = {
      level: this._level,
      format: format.json(),
      transports: []
    };

    let response: Logger = createLogger(loggerOptions);

    this._transportConfigurations.forEach(async (transportConfiguration: IWinstonTransportConfiguration) => {
      if (!transportConfiguration) {
        response.silly("Dafuq u adding undefined transport !?");
      } else {
        try {
          let transport: any = await transportConfiguration.InitTransportAsync();
          response.add(transport);
          response.debug("Transport added", {
            transport: { type: transportConfiguration.constructor.name, configuration: transportConfiguration }
          });
        } catch (error) {
          response.error("Failed to add transport", {
            error,
            transport: { type: transportConfiguration.constructor.name, configuration: transportConfiguration }
          });
        }
      }
    });

    return response;
  }
}
