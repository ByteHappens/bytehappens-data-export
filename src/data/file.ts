import { Parser } from "json2csv";

import { IField } from "./interfaces/ifield";
import { IEntry } from "./interfaces/ientry";

import { BaseFile } from "./bases/basefile";

export class File extends BaseFile {
  public SerializeContent<TField extends IField, TEntry extends IEntry<TField>>(
    fields: TField[],
    entries: TEntry[],
    format: string
  ): string {
    let response: string;

    let fieldNames = fields.map((field: TField, idx: number) => field.Name);
    let dataToExport: any[] = entries.map((entry: TEntry, idx: number) => entry.ExtractValues(fields));

    switch (format) {
      case "json":
        response = JSON.stringify(dataToExport);
        break;
      case "csv":
        let parser: Parser<any> = new Parser<any>({ fields: fieldNames, delimiter: ";" });
        response = parser.parse(dataToExport);
        break;
      default:
        throw new Error(`unsopported ${format} format`);
    }

    return response;
  }
}
