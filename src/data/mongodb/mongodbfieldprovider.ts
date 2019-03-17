import { IFieldProvider } from "../interfaces/ifieldprovider";
import { MongoDbField } from "./mongodbfield";

export class MongoDbFieldProvider implements IFieldProvider<MongoDbField> {
  GetFieldsAsync(): Promise<MongoDbField[]> {
    throw new Error("Method not implemented.");
  }
}
