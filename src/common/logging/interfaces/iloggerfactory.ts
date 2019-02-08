import { ILog } from "./ilog";
import { ILogger } from "./ilogger";

export interface ILoggerFactory<TLog extends ILog, TLogger extends ILogger<TLog>> {
  GetLoggerAsync(): Promise<TLogger>;
}
