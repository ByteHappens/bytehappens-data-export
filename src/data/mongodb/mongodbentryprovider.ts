import { IEntryProvider } from "../interfaces/ientryprovider";

import { MongoDbField } from "./mongodbfield";
import { MongoDbEntry } from "./mongodbentry";

export class MongoDbEntryProvider implements IEntryProvider<MongoDbField, MongoDbEntry> {
  GetEntriesAsync(filename: string): Promise<MongoDbEntry[]> {
    throw new Error("Method not implemented.");
  }
}
