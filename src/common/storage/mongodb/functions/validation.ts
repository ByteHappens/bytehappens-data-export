import { IMongoDbConnection } from "../interfaces/imongodbconnection";
import { IMongoDbUser } from "../interfaces/imongodbuser";

export function ValidateMongoDbConnection(mongoDbConfiguration: IMongoDbConnection): void {
  if (mongoDbConfiguration.host === undefined || mongoDbConfiguration.port === undefined) {
    throw new Error("Invalid MongoDb connection detected");
  }
}

export function ValidateMongoDbUser(mongoDbUser: IMongoDbUser): void {
  if (mongoDbUser.username === undefined || mongoDbUser.password === undefined) {
    throw new Error("Invalid MongoDb User detected");
  }
}
