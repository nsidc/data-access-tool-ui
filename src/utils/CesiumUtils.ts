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

  public static setPointerCrosshair() {
    const el = document.getElementById(this.viewerId);

    if (el && el.classList && el.classList.add) {
      el.classList.add("cursor-pointer");
    }
  }

  public static unsetPointerCrosshair() {
    const el = document.getElementById(this.viewerId);

    if (el && el.classList && el.classList.remove) {
      el.classList.remove("cursor-pointer");
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

    const lat = this.removeRoundoffError(Cesium.Math.toDegrees(cartographicRadians.latitude));
    const lon = this.removeRoundoffError(Cesium.Math.toDegrees(cartographicRadians.longitude));

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

  public static getLonLatLabel(cartesian: Cesium.Cartesian3) {
    const ll = CesiumUtils.cartesianToLonLat(cartesian);
    const lat1 = Math.round(ll.lat * 100) / 100;
    const lat = "" + Math.abs(lat1) + ((lat1 > 0) ? "N" : "S");
    const lon1 = Math.round(ll.lon * 100) / 100;
    const lon = "" + Math.abs(lon1) + ((lon1 > 0) ? "E" : "W");
    return lat + ", " + lon;
  }

  private static removeRoundoffError = (val: number): number => {
    const ival = Math.round(val * 100);
    // Round off tiny trailing 0.99999's or 0.00001's to nearest hundredth.
    if (Cesium.Math.equalsEpsilon(ival, val * 100, 1e-13, 1e-13)) {
      return ival / 100;
    }
    return val;
  }
}
