import { Logger } from "winston";
import { CronJob } from "cron";

import { BaseStartableApplication } from "common/runtime/application";
import { ITask } from "common/runtime/task";

export class CronApplication extends BaseStartableApplication {
  private readonly _cronTime: string;
  private readonly _task: ITask;
  private readonly _job: CronJob;

  public constructor(task: ITask, cronTime: string, applicationName: string, logger: Logger = undefined) {
    super(applicationName, logger);

    this._cronTime = cronTime;
    this._task = task;
    this._job = new CronJob(this._cronTime, async () => await this._task.ExecuteAsync());
  }

  protected StartInternal(): void {
    if (this._logger) {
      this._logger.verbose(`Running task with schedule ${this._cronTime}`);
    }
    
    this._job.start();
  }
}
