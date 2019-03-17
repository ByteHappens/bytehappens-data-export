import { IField } from "../interfaces/ifield";

export abstract class BaseField implements IField {
  public Name: string;

  public constructor(name: string) {
    this.Name = name;
  }
}
