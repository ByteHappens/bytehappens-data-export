import { IFieldProvider } from "../interfaces/ifieldprovider";
import { StaticField } from "./staticfield";

export class StaticFieldProvider implements IFieldProvider<StaticField> {
  public async GetFieldsAsync(filename: string): Promise<StaticField[]> {
    if (filename !== "products") {
      throw new Error(`Unknown fields for ${filename} requested`);
    }

    return [
      new StaticField("Sku"),
      new StaticField("Title"),
      new StaticField("Short Description"),
      new StaticField("Long Description"),
      new StaticField("Price"),
      new StaticField("In Stock"),
      new StaticField("Stock"),
      new StaticField("Delivery (days)")
    ];
  }
}
