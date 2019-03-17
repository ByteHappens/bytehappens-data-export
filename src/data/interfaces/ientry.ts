import { IField } from "./ifield";

export interface IEntry<TField extends IField> {
  ExtractValues(fields: TField[]): any;
}
