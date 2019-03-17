import { Request, Response } from "express";
import { Parser } from "json2csv";
import { logging } from "bytehappens";

import { BaseSimpleGetExpressRoute } from "common/hosting/express";

import { IField, IFieldProvider, IEntry, IEntryProvider } from "../data";

export class DataExportRoute<
  TField extends IField,
  TFieldProvider extends IFieldProvider<TField>,
  TEntry extends IEntry<TField>,
  TEntryProvider extends IEntryProvider<TField, TEntry>,
  TLog extends logging.ILog,
  TLogger extends logging.ILogger<TLog>,
  TLoggerFactory extends logging.ILoggerFactory<TLog, TLogger>
> extends BaseSimpleGetExpressRoute<TLog, TLogger, TLoggerFactory> {
  private _fieldProvider: TFieldProvider;
  private _entryProvider: TEntryProvider;

  public constructor(
    fieldProvider: TFieldProvider,
    entryProvider: TEntryProvider,
    path: string,
    loggerFactory: TLoggerFactory
  ) {
    super(path, loggerFactory);

    this._fieldProvider = fieldProvider;
    this._entryProvider = entryProvider;
  }

  private GetExportConfiguration(): any {
    return {
      delimiter: ";"
    };
  }

  private GetContent(fields: TField[], entries: TEntry[], exportConfiguration: any): string {
    let fieldNames = fields.map((field: TField, idx: number) => field.Name);

    let options: any = { fields: fieldNames, delimiter: exportConfiguration.delimiter };
    let parser: any = new Parser(options);

    return parser.parse(entries.map((entry: TEntry, idx: number) => entry.ExtractValues(fields)));
  }

  protected async ProcessRequestInternalAsync(request: Request, response: Response): Promise<void> {
    this._logger.Log(<TLog>{ level: "info", message: "Exporting data to CSV" });

    let fields: TField[] = await this._fieldProvider.GetFieldsAsync();
    let entries: TEntry[] = await this._entryProvider.GetEntriesAsync();
    let exportConfiguration: any = this.GetExportConfiguration();
    let content: string = this.GetContent(fields, entries, exportConfiguration);

    response.status(200);
    response.type("csv");
    response.send(content);
  }
}
