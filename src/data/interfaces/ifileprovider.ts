import { IFile } from "./ifile";

export interface IFileProvider<TFile extends IFile> {
  LoadAsync(filename: string): Promise<TFile>;
}
