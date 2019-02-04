import { Logger } from "winston";

import { BaseTask } from "../bases/basetask";

export class Exit extends BaseTask {
  public constructor(taskName: string, logger: Logger) {
    super(taskName, logger);
  }

  protected async ExecuteInternalAsync(): Promise<boolean> {
    this._logger.verbose("Exiting");
    process.exit();

    //  EBU: Might not be reached
    return true;
  }
}
