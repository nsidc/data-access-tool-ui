import { ISpatialSelection } from "../SpatialSelection";

export class Extent {
  public startLatLon: any;
  public endLatLon: any;

  constructor(startLatLon: any = null, endLatLon: any = null) {
    this.startLatLon = startLatLon;
    this.endLatLon = endLatLon;
  }

  public global(): boolean {
    const deg = this.degreesArr();

    return deg[0] === -180
      && deg[1] === -90
      && deg[2] === 180
      && deg[3] === 90;
  }

  public degreesArr(): number[] {
    if ((this.startLatLon === null) || (this.endLatLon === null)) {
      return [-180, -90, 180, 90];
    }

    const leftLon = Math.min.apply(null, [this.startLatLon.lon, this.endLatLon.lon]);
    const rightLon = Math.max.apply(null, [this.startLatLon.lon, this.endLatLon.lon]);
    const lowerLat = Math.min.apply(null, [this.startLatLon.lat, this.endLatLon.lat]);
    const upperLat = Math.max.apply(null, [this.startLatLon.lat, this.endLatLon.lat]);

    return [
      leftLon,
      lowerLat,
      rightLon,
      upperLat,
    ];
  }

  public asSpatialSelection(): ISpatialSelection {
    const degrees = this.degreesArr();

    return {
      lower_left_lat: degrees[1],
      lower_left_lon: degrees[0],
      upper_right_lat: degrees[3],
      upper_right_lon: degrees[2],
    };
  }
}
