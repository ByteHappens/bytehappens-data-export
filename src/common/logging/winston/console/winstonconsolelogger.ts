import { ILog } from "common/logging";
import { WinstonLogger } from "common/logging/winston";

export class WinstonConsoleLogger<TLog extends ILog> extends WinstonLogger<TLog> {}
