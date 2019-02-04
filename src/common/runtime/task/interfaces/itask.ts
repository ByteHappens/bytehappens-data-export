export interface ITask {
  ExecuteAsync(): Promise<boolean>;
}
