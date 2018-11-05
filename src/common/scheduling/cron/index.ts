import { CronJob } from "cron";
import { Logger } from "winston";

import { BaseApp } from "../../app";
import { ITask } from "../../task";

export class CronApp extends BaseApp {
  private readonly _task: ITask;
  private readonly _job: CronJob;

  constructor(task: ITask, cronTime: string, appName: string, logger: Logger) {
    super(appName, logger);
    this._task = task;
    this._job = new CronJob(cronTime, () => this._task.Execute());
  }

  protected StartInternal(): void {
    this._job.start();
  }
}
