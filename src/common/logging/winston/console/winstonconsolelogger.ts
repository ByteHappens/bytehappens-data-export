import { logging } from "bytehappens";

import { WinstonLogger } from "common/logging/winston";

export class WinstonConsoleLogger<TLog extends logging.ILog> extends WinstonLogger<TLog> {}
