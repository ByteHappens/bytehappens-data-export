import { IWinstonLoggerFactory } from "common/logging/winston";
import { BaseTask } from "../bases/basetask";

export class Exit extends BaseTask {
  public constructor(taskName: string, loggerFactory: IWinstonLoggerFactory) {
    super(taskName, loggerFactory);
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
