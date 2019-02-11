import { transports } from "winston";

import { BaseWinstonTransportConfiguration } from "common/logging/winston";

import { IWinstonConsoleTransportConfiguration } from "./interfaces/iwinstonconsoletransportconfiguration";

export class WinstonConsoleTransportConfiguration extends BaseWinstonTransportConfiguration
  implements IWinstonConsoleTransportConfiguration {
  constructor(level: string) {
    super(level);
  }

  public Validate(): void {
    super.Validate();
  }

  public async InitTransportAsync(): Promise<any> {
    let options: transports.ConsoleTransportOptions = {
      level: this.level
    };

    return new transports.Console(options);
  }
}
