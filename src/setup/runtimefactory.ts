import { MongoClient } from "mongodb";
import { logging, runtimes } from "bytehappens";
import { storageMongoDb } from "bytehappens-storage-mongodb";
import { loggingWinston } from "bytehappens-logging-winston";

export class RuntimeFactory<
  TLog extends logging.ILog,
  TLoggerFactory extends loggingWinston.console.WinstonConsoleLoggerFactory<TLog>
> implements runtimes.core.IRuntimeFactory<runtimes.tasks.ITask> {
  private LoadWinstonConsoleTransportConfiguration(): loggingWinston.console.IWinstonConsoleTransportConfiguration {
    let level: string = process.env.LOGGING_CONSOLE_LEVEL;
    return new loggingWinston.console.WinstonConsoleTransportConfiguration(level);
  }

  private GetCreateMongoDbLogUserTask(setupLoggerFactory: TLoggerFactory): runtimes.tasks.ITask {
    let response: runtimes.tasks.ITask;

    let useMongoDb: boolean = process.env.LOGGING_MONGODB_USE === "true";
    if (useMongoDb) {
      let host: string = process.env.LOGGING_MONGODB_HOST;
      let port: number = parseInt(process.env.LOGGING_MONGODB_PORT);
      let connection: storageMongoDb.core.IMongoDbConnection = {
        host: host,
        port: port
      };

      let newUsername: string = process.env.LOGGING_MONGODB_USERNAME;
      let newPassword: string = process.env.LOGGING_MONGODB_PASSWORD;
      let databaseName: string = process.env.LOGGING_MONGODB_DATABASE;
      let newUser: storageMongoDb.core.IMongoDbUser = {
        username: newUsername,
        password: newPassword,
        databaseName: databaseName
      };

      let checkMongoDbAvailabilityTask: runtimes.tasks.ITask = new runtimes.tasks.LambdaTask(
        async () => {
          //  SCK: If we can create client, then it is available
          let client: MongoClient = await storageMongoDb.core.CreateMongoDbClientAsync(connection, newUser);
          return true;
        },
        "CheckMongoDbAvailabilityTask",
        setupLoggerFactory
      );

      response = new runtimes.tasks.RetriableTask(
        checkMongoDbAvailabilityTask,
        5,
        5000,
        "RetryCheckMongoDbAvailabilityTask",
        setupLoggerFactory
      );
    }

    return response;
  }

  public async CreateRuntimeAsync(): Promise<runtimes.tasks.ITask> {
    let response: runtimes.tasks.ITask;

    let consoleTransportConfiguration: loggingWinston.console.IWinstonConsoleTransportConfiguration = this.LoadWinstonConsoleTransportConfiguration();
    let setupLoggerFactory: TLoggerFactory = <TLoggerFactory>(
      new loggingWinston.console.WinstonConsoleLoggerFactory<TLog>(
        consoleTransportConfiguration.level,
        consoleTransportConfiguration
      )
    );

    response = this.GetCreateMongoDbLogUserTask(setupLoggerFactory);
    return response;
  }
}
