import { IFileProvider } from "../interfaces/ifileprovider";
import { File } from "../file";

export class StaticFileProvider implements IFileProvider<File> {
  public async LoadAsync(filename: string): Promise<File> {
    if (filename !== "products") {
      throw new Error(`Unknown file ${filename} requested`);
    }

    return new File(filename);
  }
}
