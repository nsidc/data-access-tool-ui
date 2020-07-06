import * as Cesium from "cesium";

import { BoundingBox } from "../types/BoundingBox";
import { CesiumUtils, ILonLat } from "./CesiumUtils";

export const MIN_VERTICES = 3;

enum BoundingBoxState {
  startDrawing,
  isDrawing,
  doneDrawing,
}

export class BoundingBoxMode {

  private ellipsoid: Cesium.Ellipsoid;
  private finishedDrawingCallback: any;
  private renderBoundingBox: any;
  private labels: any;
  private mouseHandler: any;
  private lonlat1: ILonLat | null;
  private lonlat2: ILonLat | null;
  private scene: any;
  private state: BoundingBoxState;
  private tooltip: any;
  private updateLonLatLabel: (cartesian: Cesium.Cartesian3 | null) => void;

  public constructor(scene: Cesium.Scene, ellipsoid: Cesium.Ellipsoid,
                     renderBoundingBox: (boundingBox: BoundingBox, doRender: boolean) => void,
                     finishedDrawingCallback: (s: BoundingBox) => void,
                     updateLonLatLabel: (cartesian: Cesium.Cartesian3 | null) => void) {
    this.scene = scene;
    this.ellipsoid = ellipsoid;
    this.finishedDrawingCallback = finishedDrawingCallback;
    this.renderBoundingBox = renderBoundingBox;
    this.updateLonLatLabel = updateLonLatLabel;
  }

  public start = () => {
    this.initializeMouseHandler();
    CesiumUtils.setCursorCrosshair();
    this.state = BoundingBoxState.startDrawing;
    this.lonlat1 = this.lonlat2 = null;
    this.labels = this.scene.primitives.add(new Cesium.LabelCollection());
    this.tooltip = this.labels.add({
      backgroundColor: Cesium.Color.fromAlpha(Cesium.Color.BLACK, 0.4),
      font: "11pt sans-serif",
      horizontalOrigin: Cesium.HorizontalOrigin.RIGHT,
      pixelOffset: new Cesium.Cartesian2(-10, -10),
      show: false,
      showBackground: true,
      text: "Click and drag from west to east",
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
    });
  }

  public reset = () => {
    this.state = BoundingBoxState.startDrawing;
    this.scene.primitives.remove(this.labels);
    this.renderBoundingBox(null, false);
    CesiumUtils.unsetCursorCrosshair();
    if (this.mouseHandler && !this.mouseHandler.isDestroyed()) {
      this.mouseHandler.destroy();
      this.mouseHandler = null;
    }
    this.tooltip = null;
    this.lonlat1 = this.lonlat2 = null;
    this.updateLonLatLabel(null);
  }

  private initializeMouseHandler = () => {
    if (!this.mouseHandler) {
      this.mouseHandler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);

      this.mouseHandler.setInputAction(this.onLeftDown,
                                       Cesium.ScreenSpaceEventType.LEFT_DOWN);

      this.mouseHandler.setInputAction(this.onMouseMove,
                                       Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      this.mouseHandler.setInputAction(this.onLeftUp,
                                       Cesium.ScreenSpaceEventType.LEFT_UP);
    }
  }

  private getBoundingBox = () => {
    if (this.lonlat1 && this.lonlat2) {
      const bbox = new BoundingBox(this.lonlat1.lon, this.lonlat1.lat, this.lonlat2.lon, this.lonlat2.lat);
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
    if (this.lonlat1 && this.lonlat2) {
      this.renderBoundingBox(this.getBoundingBox(), true);
    }
  }

  private disableGlobeMovement = () => {
    this.scene.screenSpaceCameraController.enableInputs = false;
  }

  private enableGlobeMovement = () => {
    this.scene.screenSpaceCameraController.enableInputs = true;
  }

  private screenPositionToCartesian = (screenPosition: Cesium.Cartesian2): Cesium.Cartesian3 | null => {
    return CesiumUtils.screenPositionToCartesian(screenPosition, this.scene.camera, this.ellipsoid);
  }

  private onLeftDown = ({position}: {position: Cesium.Cartesian2}) => {
    const cartesian = this.screenPositionToCartesian(position);
    if (cartesian) {
      this.state = BoundingBoxState.isDrawing;
      this.disableGlobeMovement();
      this.tooltip.text = "Release to finish drawing";
      this.lonlat1 = CesiumUtils.cartesianToLonLat(cartesian);
    }
  }

  private updateTooltipLocation = () => {
    if (this.lonlat1 && this.lonlat2) {
      this.tooltip.horizontalOrigin = (this.lonlat2.lon > this.lonlat1.lon) ?
        Cesium.HorizontalOrigin.LEFT : Cesium.HorizontalOrigin.RIGHT;
      this.tooltip.verticalOrigin = (this.lonlat2.lat > this.lonlat1.lat) ?
        Cesium.VerticalOrigin.BOTTOM : Cesium.VerticalOrigin.TOP;
      this.tooltip.pixelOffset = new Cesium.Cartesian2(
        (this.lonlat2.lon > this.lonlat1.lon) ? 10 : -10, (this.lonlat2.lat > this.lonlat1.lat) ? -10 : 10);
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
          if (this.state === BoundingBoxState.isDrawing) {
            this.lonlat2 = CesiumUtils.cartesianToLonLat(cartesian);
            this.updateTooltipLocation();
          }
        }
        this.interactionRender();
      }
    }
    this.tooltip.show = showTooltip;
    this.scene.requestRender();
  }

  private onLeftUp = ({ position }: { position: Cesium.Cartesian2 }) => {
    if (this.state === BoundingBoxState.isDrawing) {
      this.state = BoundingBoxState.doneDrawing;
      this.enableGlobeMovement();
      this.tooltip.text = "Release to finish drawing";
      this.tooltip.show = false;
      const bbox = this.getBoundingBox();
      this.reset();
      this.finishedDrawingCallback(bbox);
    }
  }

}
