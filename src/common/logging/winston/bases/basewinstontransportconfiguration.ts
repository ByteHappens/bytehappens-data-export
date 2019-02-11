import { IWinstonTransportConfiguration } from "../interfaces/iwinstontransportconfiguration";

export abstract class BaseWinstonTransportConfiguration implements IWinstonTransportConfiguration {
  public readonly level: string;

  constructor(level: string) {
    this.level = level;
  }

  public Validate(): void {
    if (this.level === undefined || this.level.length === 0) {
      throw "Invalid logging level";
    }
  }

  public abstract InitTransportAsync(): Promise<any>;
}
