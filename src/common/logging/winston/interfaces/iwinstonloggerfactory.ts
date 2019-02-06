import { Logger } from "winston";

export interface IWinstonLoggerFactory {
  GetWinstonLoggerAsync(): Promise<Logger>;
}
