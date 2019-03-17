import { IField } from "../interfaces/ifield";
import { IEntry } from "../interfaces/ientry";

export abstract class BaseEntry<TField extends IField> implements IEntry<TField> {
  public Id: string;
  public Values: { [fieldName: string]: any };

  public constructor(id: string, values: { [fieldName: string]: any }) {
    this.Id = id;
    this.Values = values;
  }

  public ExtractValues(fields: TField[]): any {
    let response: any = {};

    fields.forEach((field: TField) => {
      response[field.Name] = this.Values[field.Name];
    });

    return response;
  }
}
