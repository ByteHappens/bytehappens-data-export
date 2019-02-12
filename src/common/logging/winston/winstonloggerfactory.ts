import { Logger, LoggerOptions, createLogger, format } from "winston";
import { logging } from "bytehappens";

import { IWinstonTransportConfiguration } from "./interfaces/iwinstontransportconfiguration";
import { WinstonLogger } from "./winstonlogger";

interface AddedTransportResult {
  transportName: string;
  added: boolean;
}

export class WinstonLoggerFactory<TLog extends logging.ILog, TWinstonLogger extends WinstonLogger<TLog>>
  implements logging.ILoggerFactory<TLog, TWinstonLogger> {
  private readonly _level: string;
  private readonly _transportConfigurations: IWinstonTransportConfiguration[];

  private _logger: Promise<TWinstonLogger>;

  constructor(level: string, configurations: IWinstonTransportConfiguration[]) {
    this._level = level;
    this._transportConfigurations = configurations;
  }

  private async AddTransportAsync(transportConfiguration: IWinstonTransportConfiguration, logger: Logger): Promise<boolean> {
    let response: boolean = false;

    try {
      let transport: any = await transportConfiguration.InitTransportAsync();
      logger.add(transport);
      logger.log("debug", "Added transport", {
        transport: { type: transportConfiguration.constructor.name, configuration: transportConfiguration }
      });

      response = true;
    } catch (error) {
      logger.log("error", "Failed to add transport", {
        error,
        transport: { type: transportConfiguration.constructor.name, configuration: transportConfiguration }
      });
    }

    return response;
  }

  private async InitWinstonLoggerAsync(): Promise<TWinstonLogger> {
    let loggerOptions: LoggerOptions = {
      level: this._level,
      format: format.combine(format.timestamp(), format.combine(format.align(), format.simple())),
      transports: []
    };

    let logger: Logger = createLogger(loggerOptions);

    let requestedTransports: { [id: string]: boolean } = {};
    let addTransportResponses = await Promise.all(
      this._transportConfigurations.map(async (transportConfiguration: IWinstonTransportConfiguration) => {
        let responseInternal: AddedTransportResult;

        if (!transportConfiguration) {
          logger.log("silly", "Dafuq u adding undefined transport !?");
          responseInternal = { transportName: transportConfiguration.constructor.name, added: false };
        } else {
          try {
            let added: boolean = await this.AddTransportAsync(transportConfiguration, logger);
            responseInternal = { transportName: transportConfiguration.constructor.name, added };
          } catch (error) {
            logger.error("Failed to add transport", {
              error,
              transport: { type: transportConfiguration.constructor.name, configuration: transportConfiguration }
            });

            responseInternal = { transportName: transportConfiguration.constructor.name, added: false };
          }
        }

        return responseInternal;
      })
    );

    addTransportResponses.forEach((result: AddedTransportResult) => {
      requestedTransports[result.transportName] = result.added;
    });

    let addedTransportCount: number = Object.keys(requestedTransports).filter((key: string) => requestedTransports[key]).length;
    logger.log("debug", `Added ${addedTransportCount} / ${this._transportConfigurations.length} transports`, {
      requestedTransports
    });

    let response: TWinstonLogger = <TWinstonLogger>new WinstonLogger(logger);
    return response;
  }

  public async CreateLoggerAsync(): Promise<TWinstonLogger> {
    if (!this._logger) {
      this._logger = this.InitWinstonLoggerAsync();
    }

    return this._logger;
  }
}
