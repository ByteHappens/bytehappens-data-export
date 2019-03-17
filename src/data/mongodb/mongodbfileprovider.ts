import { IFileProvider } from "../interfaces/ifileprovider";
import { File } from "../file";

export class MongoDbFileProvider implements IFileProvider<File> {
  public async LoadAsync(filename: string): Promise<File> {
    throw new Error("Method not implemented.");
  }
}
