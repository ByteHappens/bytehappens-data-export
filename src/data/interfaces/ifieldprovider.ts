import { IField } from "./ifield";

export interface IFieldProvider<TField extends IField> {
  GetFieldsAsync(): Promise<TField[]>;
}
