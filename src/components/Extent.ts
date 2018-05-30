export class Extent {
  public a: any;
  public b: any;

  constructor(a: any = null, b: any = null) {
    this.a = a;
    this.b = b;
  }
  public valid(): boolean {
    return (this.a && this.b);
  }
}
