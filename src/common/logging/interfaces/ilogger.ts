import { ILog } from "./ilog";

export interface ILogger<T extends ILog> {
  Log(log: T): void;
}
