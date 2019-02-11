import { ILog } from "common/logging";
import { WinstonLoggerFactory } from "common/logging/winston";

import { IWinstonConsoleTransportConfiguration } from "./interfaces/iwinstonconsoletransportconfiguration";
import { WinstonConsoleLogger } from "./winstonconsolelogger";

export class WinstonConsoleLoggerFactory<TLog extends ILog> extends WinstonLoggerFactory<TLog, WinstonConsoleLogger<TLog>> {
  constructor(level: string, configuration: IWinstonConsoleTransportConfiguration) {
    super(level, [configuration]);
  }
}
