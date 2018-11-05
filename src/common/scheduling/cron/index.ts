import { CronJob } from "cron";
import { Logger } from "winston";

import { IStartableApp } from "../../app";

export interface ICronTask {
  Execute(): void;
}

export class CronApp implements IStartableApp {
  private _task: ICronTask;
  private _job: CronJob;
  private _logger: Logger;

  constructor(task: ICronTask, cronTime: string, logger: Logger) {
    this._task = task;
    this._job = new CronJob(cronTime, () => this._task.Execute());
    this._logger = logger;
  }

  public Start(): void {
    this._logger.info("Starting Cron App");
    this._job.start();
  }
}
