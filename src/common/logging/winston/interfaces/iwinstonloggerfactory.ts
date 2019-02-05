import { Logger } from "winston";

export interface IWinstonLoggerFactory {
  CreateWinstonLoggerAsync(): Promise<Logger>;
}
