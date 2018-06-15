import { ILonLat } from "../types/LonLat";
import { ISpatialSelection } from "../types/SpatialSelection";

export class Extent {
  public startLonLat: any;
  public endLonLat: any;
  public drawDirection: any;

  public lowerLeftLat: number;
  public lowerLeftLon: number;
  public upperRightLat: number;
  public upperRightLon: number;

  constructor(spatialSelection: any = null) {
    this.startLonLat = null;
    this.endLonLat = null;
    this.drawDirection = null;

    if (spatialSelection) {
      this.lowerLeftLat = spatialSelection.lower_left_lat;
      this.lowerLeftLon = spatialSelection.lower_left_lon;
      this.upperRightLat = spatialSelection.upper_right_lat;
      this.upperRightLon = spatialSelection.upper_right_lon;
    }
  }

  public isGlobal(): boolean {
    return this.lowerLeftLon === -180
      && this.lowerLeftLat === -90
      && this.upperRightLon === 180
      && this.upperRightLat === 90;
  }

  // [west, south, east, north]
  public degreesArr(): number[] {
    return [
      this.lowerLeftLon,
      this.lowerLeftLat,
      this.upperRightLon,
      this.upperRightLat,
    ];
  }

  public asSpatialSelection(): ISpatialSelection {
    return {
      lower_left_lat: this.lowerLeftLat,
      lower_left_lon: this.lowerLeftLon,
      upper_right_lat: this.upperRightLat,
      upper_right_lon: this.upperRightLon,
    };
  }

  public updateDrawDirection(lonLat: ILonLat) {
    const initialLon = this.startLonLat.lon;
    const finalLon = lonLat.lon;

    const deltaLon = finalLon - initialLon;

    // mouse moves produce small changes; if the delta is almost 360, it's
    // probably from moving westward past the antimeridian, from nearly -180 to
    // nearly 180
    if (deltaLon > 355) {
      this.drawDirection = "west";
    }

    // if deltaLon === 0, we've only moved north/south, and can't determine an
    // east/west direction yet
    if (deltaLon < 0) {
      this.drawDirection = "west";
    } else if (deltaLon > 0) {
      this.drawDirection = "east";
    }
  }

  public startDrawing(lonLat: ILonLat) {
    this.startLonLat = lonLat;
    this.endLonLat = null;
    this.drawDirection = null;

    this.lowerLeftLat = lonLat.lat;
    this.lowerLeftLon = lonLat.lon;
    this.upperRightLat = lonLat.lat;
    this.upperRightLon = lonLat.lon;
  }

  public updateFromDrawing(lonLat: ILonLat) {
    this.endLonLat = lonLat;

    this.lowerLeftLat = Math.min(this.startLonLat.lat, lonLat.lat);
    this.upperRightLat = Math.max(this.startLonLat.lat, lonLat.lat);

    if (this.drawDirection === "west") {
      this.upperRightLon = this.startLonLat.lon;
      this.lowerLeftLon = this.endLonLat.lon;
    } else if (this.drawDirection === "east") {
      this.lowerLeftLon = this.startLonLat.lon;
      this.upperRightLon = this.endLonLat.lon;
    }
  }

  public stopDrawing(lonLat: ILonLat) {
    this.updateFromDrawing(lonLat);

    this.startLonLat = null;
    this.endLonLat = null;
    this.drawDirection = null;
  }
}
