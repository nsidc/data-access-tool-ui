/* tslint:disable:no-var-requires */
const Cesium = require("cesium/Cesium");
/* tslint:enable:no-var-requires */

export interface IScreenPosition {
  x: number;
  y: number;
}

export interface ICartesian3 {
  x: number;
  y: number;
  z: number;
}

// https://cesiumjs.org/Cesium/Build/Documentation/Billboard.html
export interface IBillboard {
  alignedAxis: ICartesian3;
  color: any;
  disableDepthTestDistance: number;
  distanceDsiplayCondition: any;
  eyeOffset: ICartesian3;
  height: number;
  heightReference: any;
  horizontalOrigin: any;
  id: any;
  image: string;
  pixelOffset: any;
  pixelOffsetScaleByDistance: any;
  position: ICartesian3;
  rotation: number;
  scale: number;
  scaleByDistance: any;
  show: boolean;
  sizeInMeters: boolean;
  translucencyByDistance: any;
  verticalOrigin: any;
  width: number;
}

// https://cesiumjs.org/Cesium/Build/Documentation/BillboardCollection.html
export interface IBillboardCollection {
  blendOption: any;
  debugShowBoundingVolume: any;
  length: number;
  modelMatrix: number;
  add: (billboard: Partial<IBillboard>) => IBillboard;
  contains: (billboard: IBillboard) => boolean;
  destroy: () => void;
  get: (index: number) => IBillboard;
  isDestroyed: () => boolean;
  remove: (billboard: IBillboard) => boolean;
  removeAll: () => void;
  update: () => void;
}

export interface ILonLat {
  readonly lat: number;
  readonly lon: number;
  readonly index?: number;
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
  public static cartesianToLonLat(cartesian: ICartesian3): ILonLat {
    // this means the position is not on the globe
    if (cartesian === undefined) {
      return {lat: NaN, lon: NaN};
    }

    const cartographicRadians = Cesium.Cartographic.fromCartesian(cartesian);

    const lonLatDegrees = {
      lat: Number.parseFloat(Cesium.Math.toDegrees(cartographicRadians.latitude)),
      lon: Number.parseFloat(Cesium.Math.toDegrees(cartographicRadians.longitude)),
    };

    return lonLatDegrees;
  }

  public static lonLatToCartesian(lonLat: ILonLat, ellipsoid: any): ICartesian3 {
    const cart = Cesium.Cartographic.fromDegrees(lonLat.lon, lonLat.lat);
    const point = Cesium.Cartographic.toCartesian(cart, ellipsoid);
    return point;
  }

  public static screenPositionToCartesian = (screenPosition: IScreenPosition,
                                             camera: any,
                                             ellipsoid: any): ICartesian3 | null => {
    if (screenPosition === null) { return null; }

    const cartesian = camera.pickEllipsoid(screenPosition, ellipsoid);
    if (!cartesian) { return null; }
    return cartesian;
  }
}
