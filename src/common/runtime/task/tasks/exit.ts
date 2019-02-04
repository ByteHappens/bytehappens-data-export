import { Logger } from "winston";

import { BaseTask } from "../bases/basetask";

export class Exit extends BaseTask {
  public constructor(taskName: string, initLogger: Promise<Logger>) {
    super(taskName, initLogger);
  }

  protected async ExecuteInternalAsync(): Promise<boolean> {
    if (this._logger) {
      this._logger.verbose("Exiting");
    }

    process.exit();

    //  EBU: Might not be reached
    return true;
  }
}
