import { IField } from "./ifield";
import { IEntry } from "./ientry";

export interface IEntryProvider<TField extends IField, TEntry extends IEntry<TField>> {
  GetEntriesAsync(): Promise<TEntry[]>;
}
