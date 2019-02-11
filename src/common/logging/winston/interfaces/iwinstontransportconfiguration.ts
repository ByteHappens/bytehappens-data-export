export interface IWinstonTransportConfiguration {
  level: string;

  Validate(): void;
  InitTransportAsync(): Promise<any>;
}
