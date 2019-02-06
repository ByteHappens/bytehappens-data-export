import { CronJob } from "cron";

import { IWinstonLoggerFactory } from "common/logging/winston";
import { BaseStartableApplication } from "common/runtime/application";
import { ITask } from "common/runtime/task";

export class CronApplication extends BaseStartableApplication {
  private readonly _cronTime: string;
  private readonly _task: ITask;
  private readonly _job: CronJob;

  public constructor(task: ITask, cronTime: string, applicationName: string, loggerFactory: IWinstonLoggerFactory) {
    super(applicationName, loggerFactory);

    this._cronTime = cronTime;
    this._task = task;
    this._job = new CronJob(this._cronTime, async () => await this._task.ExecuteAsync());
  }

  protected async StartInternalAsync(): Promise<void> {
    if (this._logger) {
      this._logger.log("verbose", `Starting ${this._applicationName} application with cron schedule ${this._cronTime}`);
    }

    this._job.start();
  }
}
