import * as Cesium from "cesium";

import { BoundingBox } from "../types/BoundingBox";
import { CesiumUtils } from "./CesiumUtils";

export const MIN_VERTICES = 3;

enum BoundingBoxState {
  startDrawing,
  movePoint2,
  doneDrawing,
}

export class BoundingBoxMode {

  private ellipsoid: Cesium.Ellipsoid;
  private finishedDrawingCallback: any;
  private renderBoundingBox: any;
  private labels: any;
  private mouseHandler: any;
  private point1: Cesium.Cartesian3 | null;
  private point2: Cesium.Cartesian3 | null;
  private state: BoundingBoxState;
  private tooltip: any;
  private updateLonLatLabel: (cartesian: Cesium.Cartesian3 | null) => void;
  private viewer: any;

  public constructor(viewer: any, ellipsoid: Cesium.Ellipsoid,
                     renderBoundingBox: any, finishedDrawingCallback: any,
                     updateLonLatLabel: (cartesian: Cesium.Cartesian3 | null) => void) {
    this.viewer = viewer;
    this.ellipsoid = ellipsoid;
    this.finishedDrawingCallback = finishedDrawingCallback;
    this.renderBoundingBox = renderBoundingBox;
    this.updateLonLatLabel = updateLonLatLabel;
  }

  public start = () => {
    this.initializeMouseHandler();
    CesiumUtils.setCursorCrosshair();
    this.state = BoundingBoxState.startDrawing;
    this.point1 = this.point2 = null;
    this.labels = this.viewer.scene.primitives.add(new Cesium.LabelCollection());
    this.tooltip = this.labels.add({
      backgroundColor: Cesium.Color.fromAlpha(Cesium.Color.BLACK, 0.4),
      font: "11pt sans-serif",
      horizontalOrigin: Cesium.HorizontalOrigin.RIGHT,
      pixelOffset: new Cesium.Cartesian2(-10, -10),
      show: false,
      showBackground: true,
      text: "Click to set southwest corner",
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    });
  }

  public reset = () => {
    this.viewer.scene.primitives.remove(this.labels);
    this.renderBoundingBox(null, false);
    CesiumUtils.unsetCursorCrosshair();
    if (this.mouseHandler && !this.mouseHandler.isDestroyed()) {
      this.mouseHandler.destroy();
      this.mouseHandler = null;
    }
    this.tooltip = null;
    this.point1 = this.point2 = null;
    this.updateLonLatLabel(null);
  }

  private initializeMouseHandler = () => {
    if (!this.mouseHandler) {
      this.mouseHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

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
      const bbox = new BoundingBox(ll1.lon, ll1.lat, ll2.lon, ll2.lat);
      if (bbox.south > bbox.north) {
        const tmp = bbox.south;
        bbox.south = bbox.north;
        bbox.north = tmp;
      }
      return bbox;
    } else {
      return BoundingBox.global();
    }
  }

  private interactionRender = () => {
    if (this.point1 && this.point2) {
      this.renderBoundingBox(this.getBoundingBox(), true);
    }
  }

  private screenPositionToCartesian = (screenPosition: Cesium.Cartesian2): Cesium.Cartesian3 | null => {
    return CesiumUtils.screenPositionToCartesian(screenPosition, this.viewer.scene.camera, this.ellipsoid);
  }

  private onLeftClick = ({position}: {position: Cesium.Cartesian2}) => {
    const cartesian = this.screenPositionToCartesian(position);
    if (cartesian) {
      if (this.state === BoundingBoxState.startDrawing) {
        this.state = BoundingBoxState.movePoint2;
        this.tooltip.text = "Click to set northeast corner";
      } else if (this.state === BoundingBoxState.movePoint2 && this.point2) {
        this.state = BoundingBoxState.doneDrawing;
        this.tooltip.show = false;
        const bbox = this.getBoundingBox();
        this.reset();
        this.finishedDrawingCallback(bbox);
      }
    }
  }

  private updateTooltipLocation = () => {
    if (this.point1 && this.point2) {
      const ll1 = CesiumUtils.cartesianToLonLat(this.point1);
      const ll2 = CesiumUtils.cartesianToLonLat(this.point2);
      this.tooltip.horizontalOrigin = (ll2.lon > ll1.lon) ?
        Cesium.HorizontalOrigin.LEFT : Cesium.HorizontalOrigin.RIGHT;
      this.tooltip.verticalOrigin = (ll2.lat > ll1.lat) ?
        Cesium.VerticalOrigin.BOTTOM : Cesium.VerticalOrigin.TOP;
      this.tooltip.pixelOffset = new Cesium.Cartesian2(
        (ll2.lon > ll1.lon) ? 10 : -10, (ll2.lat > ll1.lat) ? -10 : 10);
    }
  }

  private onMouseMove = ({ endPosition }: { endPosition: Cesium.Cartesian2}) => {
    let showTooltip = false;
    if (endPosition) {
      const cartesian = this.screenPositionToCartesian(endPosition);
      if (cartesian) {
        this.updateLonLatLabel(cartesian);
        if (this.state !== BoundingBoxState.doneDrawing) {
          showTooltip = true;
          this.tooltip.position = cartesian;
          if (this.state === BoundingBoxState.movePoint2) {
            this.point2 = cartesian;
            this.updateTooltipLocation();
          } else {
            this.point1 = cartesian;
          }
        }
        this.interactionRender();
      }
    }
    this.tooltip.show = showTooltip;
    this.viewer.scene.requestRender();
  }
}
