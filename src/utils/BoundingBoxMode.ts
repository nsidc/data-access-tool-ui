import * as Cesium from "cesium";

import { CesiumUtils } from "./CesiumUtils";

export const MIN_VERTICES = 3;

export class BoundingBoxMode {

  private ellipsoid: Cesium.Ellipsoid;
  private finishedDrawingCallback: any;
  private renderBoundingBox: any;
  private mouseHandler: any;
  private point1: Cesium.Cartesian3 | null;
  private point2: Cesium.Cartesian3 | null;
  private isMovingPoint2: boolean;
  private doneDrawing: boolean;
  private scene: any;

  public constructor(scene: any, ellipsoid: Cesium.Ellipsoid,
                     renderBoundingBox: any, finishedDrawingCallback: any) {
    this.scene = scene;
    this.ellipsoid = ellipsoid;
    this.finishedDrawingCallback = finishedDrawingCallback;
    this.renderBoundingBox = renderBoundingBox;
  }

  public start = () => {
    this.initializeMouseHandler();
    this.isMovingPoint2 = false;
    this.doneDrawing = false;
  }

  public reset = () => {
    this.scene.primitives.removeAll();
    if (this.mouseHandler && !this.mouseHandler.isDestroyed()) {
      this.mouseHandler.destroy();
      this.mouseHandler = null;
    }
    this.scene.requestRender();
  }

  private initializeMouseHandler = () => {
    if (!this.mouseHandler) {
      this.mouseHandler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);

      this.mouseHandler.setInputAction(this.onLeftClick,
                                       Cesium.ScreenSpaceEventType.LEFT_CLICK);

      this.mouseHandler.setInputAction(this.onMouseMove,
                                       Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
  }

  private getBoundingBox = () => {
    if (this.point1 && this.point2) {
    const ll1 = CesiumUtils.cartesianToLonLat(this.point1);
    const ll2 = CesiumUtils.cartesianToLonLat(this.point2);
    const bbox = [ll1.lon, ll1.lat, ll2.lon, ll2.lat];
    if (bbox[0] > bbox[2]) { [bbox[0], bbox[2]] = [bbox[2], bbox[0]]; }
    if (bbox[1] > bbox[3]) { [bbox[1], bbox[3]] = [bbox[3], bbox[1]]; }
    return bbox;
    } else {
      return [-180, -90, 180, 90];
    }
  }

  private interactionRender = () => {
    if (this.point1 && this.point2) {
      this.renderBoundingBox(this.getBoundingBox(), true);
    }
  }

  private screenPositionToCartesian = (screenPosition: Cesium.Cartesian2): Cesium.Cartesian3 | null => {
    return CesiumUtils.screenPositionToCartesian(screenPosition, this.scene.camera, this.ellipsoid);
  }

  private onLeftClick = ({position}: {position: Cesium.Cartesian2}) => {
    const cartesian = this.screenPositionToCartesian(position);
    if (cartesian) {
      if (!this.isMovingPoint2) {
        this.isMovingPoint2 = true;
      } else {
        this.doneDrawing = true;
        this.finishedDrawingCallback(this.getBoundingBox());
      }
    }
  }

  private onMouseMove = ({ endPosition }: { endPosition: Cesium.Cartesian2}) => {
    if (endPosition && !this.doneDrawing) {
      const cartesian = this.screenPositionToCartesian(endPosition);
      if (cartesian) {
        if (this.isMovingPoint2) {
          this.point2 = cartesian;
        } else {
          this.point1 = cartesian;
        }
        this.interactionRender();
      }
    }
  }
}
