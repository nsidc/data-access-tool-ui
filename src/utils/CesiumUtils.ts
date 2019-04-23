import * as Cesium from "cesium";

export interface ILonLat {
  readonly lat: number;
  readonly lon: number;
}

export class CesiumUtils {

  public static viewerId: string = "globe";

  public static setCursorCrosshair() {
    const el = document.getElementById(this.viewerId);

    if (el && el.classList && el.classList.add) {
      el.classList.add("cursor-crosshair");
    }
  }

  public static unsetCursorCrosshair() {
    const el = document.getElementById(this.viewerId);

    if (el && el.classList && el.classList.remove) {
      el.classList.remove("cursor-crosshair");
    }
  }

  // cartesian: 3D coordinates for position on earth's surface
  // https://en.wikipedia.org/wiki/ECEF
  public static cartesianToLonLat(cartesian: Cesium.Cartesian3): ILonLat {
    // this means the position is not on the globe
    if (cartesian === undefined) {
      return {lat: NaN, lon: NaN};
    }

    // @types/cesium is lacking some methods on the Cartographic class
    const cartographicRadians = (Cesium.Cartographic as any).fromCartesian(cartesian);

    let lat = Cesium.Math.toDegrees(cartographicRadians.latitude);
    let lon = Cesium.Math.toDegrees(cartographicRadians.longitude);

    const ilat = Math.round(lat * 100);
    if (Cesium.Math.equalsEpsilon(ilat, lat * 100, 1e-13, 1e-13)) {
      lat = ilat / 100;
    }
    const ilon = Math.round(lon * 100);
    if (Cesium.Math.equalsEpsilon(ilon, lon * 100, 1e-13, 1e-13)) {
      lon = ilon / 100;
    }

    return {lon, lat};
  }

  public static lonLatToCartesian(lonLat: ILonLat, ellipsoid: Cesium.Ellipsoid): Cesium.Cartesian3 {
    const cart = Cesium.Cartographic.fromDegrees(lonLat.lon, lonLat.lat);

    // @types/cesium is lacking some methods on the Cartographic class
    const point = (Cesium.Cartographic as any).toCartesian(cart, ellipsoid);
    return point;
  }

  public static screenPositionToCartesian = (screenPosition: Cesium.Cartesian2,
                                             camera: Cesium.Camera,
                                             ellipsoid: Cesium.Ellipsoid): Cesium.Cartesian3 | null => {
    if (screenPosition === null) { return null; }

    const cartesian = camera.pickEllipsoid(screenPosition, ellipsoid);
    if (!cartesian) { return null; }
    return cartesian;
  }
}
