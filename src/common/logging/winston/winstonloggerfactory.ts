import { Logger, LoggerOptions, createLogger, format } from "winston";

import { IWinstonTransportConfiguration } from "./interfaces/iwinstontransportconfiguration";
import { IWinstonLoggerFactory } from "./interfaces/iwinstonloggerfactory";

interface AddedTransportResult {
  transportName: string;
  added: boolean;
}

export class WinstonLoggerFactory implements IWinstonLoggerFactory {
  private readonly _level: string;
  private readonly _transportConfigurations: IWinstonTransportConfiguration[];

  private _logger: Promise<Logger>;

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

  private async InitWinstonLoggerAsync(): Promise<Logger> {
    let loggerOptions: LoggerOptions = {
      level: this._level,
      format: format.combine(format.timestamp(), format.combine(format.align(), format.simple())),
      transports: []
    };

    let response: Logger = createLogger(loggerOptions);

    let requestedTransports: { [id: string]: boolean } = {};
    let addTransportResponses = await Promise.all(
      this._transportConfigurations.map((transportConfiguration: IWinstonTransportConfiguration) => {
        let responseInternal: Promise<AddedTransportResult>;
        if (!transportConfiguration) {
          response.log("silly", "Dafuq u adding undefined transport !?");
          responseInternal = Promise.resolve({ transportName: transportConfiguration.constructor.name, added: false });
        } else {
          responseInternal = this.AddTransportAsync(transportConfiguration, response)
            .then((added: boolean) => {
              return { transportName: transportConfiguration.constructor.name, added };
            })
            .catch(error => {
              response.error("Failed to add transport", {
                error,
                transport: { type: transportConfiguration.constructor.name, configuration: transportConfiguration }
              });

              return { transportName: transportConfiguration.constructor.name, added: false };
            });
        }

        return responseInternal;
      })
    );

    addTransportResponses.forEach((result: AddedTransportResult) => {
      requestedTransports[result.transportName] = result.added;
    });

    let addedTransportCount: number = Object.keys(requestedTransports).filter((key: string) => requestedTransports[key]).length;
    response.log("debug", `Added ${addedTransportCount} / ${this._transportConfigurations.length} transports`, {
      requestedTransports
    });

    return response;
  }

  public async GetWinstonLoggerAsync(): Promise<Logger> {
    if (!this._logger) {
      this._logger = this.InitWinstonLoggerAsync();
    } else {
      let logger: Logger = await this._logger;
      logger.log("debug", "Logger already created");
    }

    return this._logger;
  }
}
