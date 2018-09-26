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
}
