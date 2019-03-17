import * as mime from "mime";
import { Request, Response } from "express";
import { logging } from "bytehappens";

import { BaseSimpleGetExpressRoute } from "common/hosting/express";

import { IField, IFieldProvider, IEntry, IEntryProvider, IFile, IFileProvider } from "../data";

export class DataExportRoute<
  TFile extends IFile,
  TFileProvider extends IFileProvider<TFile>,
  TField extends IField,
  TFieldProvider extends IFieldProvider<TField>,
  TEntry extends IEntry<TField>,
  TEntryProvider extends IEntryProvider<TField, TEntry>,
  TLog extends logging.ILog,
  TLogger extends logging.ILogger<TLog>,
  TLoggerFactory extends logging.ILoggerFactory<TLog, TLogger>
> extends BaseSimpleGetExpressRoute<TLog, TLogger, TLoggerFactory> {
  private _fileProvider: TFileProvider;
  private _fieldProvider: TFieldProvider;
  private _entryProvider: TEntryProvider;

  public constructor(
    fileProvider: TFileProvider,
    fieldProvider: TFieldProvider,
    entryProvider: TEntryProvider,
    path: string,
    loggerFactory: TLoggerFactory
  ) {
    super(path, loggerFactory);

    this._fileProvider = fileProvider;
    this._fieldProvider = fieldProvider;
    this._entryProvider = entryProvider;
  }

  protected async ProcessRequestInternalAsync(request: Request, response: Response): Promise<void> {
    if (request.params.ext) {
      var extensionMimeType = mime.getType(request.params.ext);

      if (
        request.accepts().filter((mimeType: string, idx: number) => mimeType === extensionMimeType || mimeType === "*/*")
          .length === 0
      ) {
        let message: string = `Mime Type for ${request.params.ext} (${extensionMimeType}) not found in Accepted Mime Types`;
        response.status(400);
        response.send(message);
      } else {
        request.accepts(extensionMimeType);
      }
    }

    if (response.statusCode === 200) {
      this._logger.Log(<TLog>{
        level: "verbose",
        message: "[Export] Exporting data",
        meta: { path: request.path, filename: request.params.filename, ext: request.params.ext, mimeType: request.accepts() }
      });

      let file: TFile = await this._fileProvider.LoadAsync(request.params.filename);
      this._logger.Log(<TLog>{ level: "verbose", message: `[Export] Exporting ${file.Name}` });

      let fields: TField[] = await this._fieldProvider.GetFieldsAsync(file.Name);
      this._logger.Log(<TLog>{ level: "verbose", message: `[Export] Found ${fields.length} fields` });

      let entries: TEntry[] = await this._entryProvider.GetEntriesAsync(file.Name);
      this._logger.Log(<TLog>{ level: "verbose", message: `[Export] Found ${entries.length} entries` });

      let content: string;
      response.format({
        "application/json": () => {
          content = file.SerializeContent(fields, entries, "json");
        },
        "text/csv": () => {
          content = file.SerializeContent(fields, entries, "csv");
        },
        default: function() {
          response.status(406).send("Not Acceptable");
        }
      });

      response.send(content);
    }
  }
}
