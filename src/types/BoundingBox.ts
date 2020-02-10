
export class BoundingBox {
  [key: string]: any;

  get rect(): number[] {
    return [this.west, this.south, this.east, this.north];
  }

  public static global() {
    return new BoundingBox(-180, -90, 180, 90);
  }

  public west: number;
  public south: number;
  public east: number;
  public north: number;

  constructor(west: number, south: number, east: number, north: number) {
    this.west = west;
    this.south = south;
    this.east = east;
    this.north = north;
  }

  public clone() {
    return new BoundingBox(this.west, this.south, this.east, this.north);
  }

  public equals(other: BoundingBox | null) {
    if (other) {
      return this.west === other.west && this.south === other.south &&
        this.east === other.east && this.north === other.north;
    }
    return false;
  }
}
