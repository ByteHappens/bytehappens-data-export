import { IFile } from "../interfaces/ifile";
import { IField } from "../interfaces/ifield";
import { IEntry } from "../interfaces/ientry";

export abstract class BaseFile implements IFile {
  public Name: string;

  constructor(name: string) {
    this.Name = name;
  }

  public abstract SerializeContent<TField extends IField, TEntry extends IEntry<TField>>(
    fields: TField[],
    entries: TEntry[],
    format: string
  ): string;
}
