import { IField } from "./ifield";
import { IEntry } from "./ientry";

export interface IFile {
  Name: string;

  SerializeContent<TField extends IField, TEntry extends IEntry<TField>>(
    fields: TField[],
    entries: TEntry[],
    format: string
  ): string;
}
