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
      var mimeTypeFromExt = mime.getType(request.params.ext);

      if (!request.accepts(mimeTypeFromExt)) {
        let message: string = `Mime Type for ${request.params.ext} (${mimeTypeFromExt}) not found in Accepted Mime Types`;

        this._logger.Log(<TLog>{ level: "error", message: message });

        response.status(400);
        response.send(message);
      } else {
        this._logger.Log(<TLog>{
          level: "verbose",
          message: "Using explicit content type",
          meta: { mimeType: mimeTypeFromExt }
        });

        request.headers["accept"] = mimeTypeFromExt;
        response.contentType(mimeTypeFromExt);
      }
    }

    let file: TFile;
    let fields: TField[];
    let entries: TEntry[];

    let format: string;
    if (response.statusCode === 200) {
      this._logger.Log(<TLog>{
        level: "verbose",
        message: "[Export] Exporting data",
        meta: { path: request.path, filename: request.params.filename, ext: request.params.ext, mimeType: request.accepts() }
      });

      file = await this._fileProvider.LoadAsync(request.params.filename);
      this._logger.Log(<TLog>{ level: "verbose", message: "[Export] Found file" });

      fields = await this._fieldProvider.GetFieldsAsync(file.Name);
      this._logger.Log(<TLog>{ level: "verbose", message: "[Export] Found fields", meta: { fieldCount: fields.length } });

      entries = await this._entryProvider.GetEntriesAsync(file.Name);
      this._logger.Log(<TLog>{ level: "verbose", message: "[Export] Found entries", meta: { entryCount: entries.length } });

      response.format({
        "application/json": () => {
          format = "json";
        },
        "text/csv": () => {
          format = "csv";
        },
        default: function() {
          response.status(406).send("Not Acceptable");
        }
      });
    }

    if (response.statusCode === 200) {
      let content: string = file.SerializeContent(fields, entries, format);

      this._logger.Log(<TLog>{
        level: "info",
        message: `[Export] Exporting ${entries.length} entries for filename ${file.Name} in ${format.toUpperCase()}`
      });

      response.send(content);
    }
  }
}
