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

  constructor(level: string, configurations: IWinstonTransportConfiguration[]) {
    this._level = level;
    this._transportConfigurations = configurations;
  }

  private async AddTransportAsync(transportConfiguration: IWinstonTransportConfiguration, logger: Logger): Promise<boolean> {
    let response: boolean = false;

    try {
      let transport: any = await transportConfiguration.InitTransportAsync();
      logger.add(transport);
      logger.debug("Transport added", {
        transport: { type: transportConfiguration.constructor.name, configuration: transportConfiguration }
      });

      response = true;
    } catch (error) {
      logger.error("Failed to add transport", {
        error,
        transport: { type: transportConfiguration.constructor.name, configuration: transportConfiguration }
      });
    }

    return response;
  }

  public async CreateWinstonLoggerAsync(): Promise<Logger> {
    let loggerOptions: LoggerOptions = {
      level: this._level,
      format: format.json(),
      transports: []
    };

    let response: Logger = createLogger(loggerOptions);

    let requestedTransports: { [id: string]: boolean } = {};
    let addTransportResponses = await Promise.all(
      this._transportConfigurations.map((transportConfiguration: IWinstonTransportConfiguration) => {
        let responseInternal: Promise<AddedTransportResult>;
        if (!transportConfiguration) {
          response.silly("Dafuq u adding undefined transport !?");
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
    response.debug(`Added ${addedTransportCount} / ${this._transportConfigurations.length} transports`, {
      requestedTransports
    });

    return response;
  }
}
