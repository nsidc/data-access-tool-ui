import { Extent } from "../utils/Extent";

import { ILonLat } from "../LonLat";
import { ISpatialSelection } from "../SpatialSelection";

/* tslint:disable:no-var-requires */
const Cesium = require("cesium/Cesium");
require("cesium/Widgets/widgets.css");
/* tslint:enable:no-var-requires */

export class CesiumAdapter {
  private static extentColor = new Cesium.Color(0.0, 1.0, 1.0, 0.5);
  private static ellipsoid = Cesium.Ellipsoid.WGS84;

  public extentSelectionInProgress: boolean;

  private viewer: any;
  private extent: Extent;
  private handleExtentSelected: (s: ISpatialSelection) => void;

  constructor(extentSelected: (s: ISpatialSelection) => void) {
    this.extentSelectionInProgress = false;
    this.handleExtentSelected = extentSelected;
  }

  public createViewer(elementId: string, spatialSelection: ISpatialSelection) {
    this.viewer = new Cesium.Viewer(elementId, {
      animation: false,
      baseLayerPicker: false,
      creditContainer: "credit",
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      scene3DOnly: true,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
    });

    const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    handler.setInputAction(this.leftClickCallback.bind(this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
    handler.setInputAction(this.mouseMoveCallback.bind(this), Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    this.updateSpatialSelection(spatialSelection);
  }

  public updateSpatialSelection(s: ISpatialSelection) {
    this.extent = new Extent(s);
    this.showSpatialSelection();
  }

  public handleSelectionStart() {
    this.extent = new Extent();
    this.extentSelectionInProgress = true;
    this.viewer.container.style.cursor = "crosshair";
  }

  public canvasPositionToLonLatDegrees(position: any): ILonLat {
    const cartesianProjectedXY = this.viewer.scene.camera.pickEllipsoid(position, CesiumAdapter.ellipsoid);

    // this means the position is not on the globe
    if (cartesianProjectedXY === undefined) {
      return {lat: NaN, lon: NaN};
    }

    const cartographicRadians = Cesium.Cartographic.fromCartesian(cartesianProjectedXY);

    const lonLatDegrees = {
      lat: Number.parseFloat(Cesium.Math.toDegrees(cartographicRadians.latitude).toFixed(2)),
      lon: Number.parseFloat(Cesium.Math.toDegrees(cartographicRadians.longitude).toFixed(2)),
    };

    return lonLatDegrees;
  }

  public lonLatIsNaN(lonLat: ILonLat) {
    return [lonLat.lat, lonLat.lon].some(Number.isNaN);
  }

  private handleSelectionEnd() {
    this.extentSelectionInProgress = false;
    this.viewer.container.style.cursor = "";
  }

  private clearSpatialSelection() {
    this.viewer.entities.removeById("extent");
  }

  private showSpatialSelection() {
    if (!this.viewer.scene) {
      return;
    }

    this.clearSpatialSelection();

    if (this.extent.isGlobal()) {
      return;
    }

    const entity = this.viewer.entities.getById("extent");
    const degrees = this.extent.degreesArr();
    const rectangle = {
      coordinates: Cesium.Rectangle.fromDegrees(...degrees),
      material: CesiumAdapter.extentColor,
    };

    if (!entity) {
      this.viewer.entities.add({
        id: "extent",
        name: "extent",
        rectangle,
      });
    } else {
      entity.rectangle = rectangle;
    }
  }

  @skipIfSelectionIsNotActive
  @canvasPositionArgToLonLat("position")
  @skipIfLonLatIsInvalid()
  private leftClickCallback(lonLat: ILonLat) {
    const startingExtentSelection = !this.extent.startLonLat;
    const endingExtentSelection = this.extent.startLonLat;

    if (startingExtentSelection) {
      this.extent.startDrawing(lonLat);

    } else if (endingExtentSelection) {
      this.extent.stopDrawing(lonLat);

      this.handleSelectionEnd();
      this.handleExtentSelected(this.extent.asSpatialSelection());
    }
  }

  @skipIfSelectionIsNotActive
  @skipIfSelectionIsNotStarted
  @canvasPositionArgToLonLat("endPosition")
  @skipIfLonLatIsInvalid()
  private mouseMoveCallback(lonLat: ILonLat) {
    if (this.extent.drawDirection === null) {
      this.extent.updateDrawDirection(lonLat);
    }

    this.extent.updateFromDrawing(lonLat);
    this.showSpatialSelection();
  }
}

// decorator
//
// if the selection is not active, the decorated function is not called
function skipIfSelectionIsNotActive(target: any, name: string, descriptor: any) {
  const original = descriptor.value;

  descriptor.value = function(...args: any[]) {
    const selectionInactive = !this.extentSelectionInProgress;
    if (selectionInactive) { return; }

    return original.apply(this, args);
  };

  return descriptor;
}

// decorator
//
// if the selection is active but the first click on the globe has not been
// made, the decorated function is not called
function skipIfSelectionIsNotStarted(target: any, name: string, descriptor: any) {
  const original = descriptor.value;

  descriptor.value = function(...args: any[]) {
    const selectionStarted = !!this.extent.startLonLat;
    if (!selectionStarted) { return; }

    return original.apply(this, args);
  };

  return descriptor;
}

// decorator factory
// key: string - name of the key in the cesium event object that contains the
//     relevant position; for example, the mouse click event object contains
//     only the key "position", while the mouse move event object has
//     "endPosition" and "startPosition"
// index: number - position in the args array of the cesium position object
//
// The first argument passed to the decorated function should be a cesium event
// object; this decorator takes one of the properties on that object (as chosen
// by the decorator factory argument `key`) and converts it to a lonLat object,
// matching the ILonLat interface, then calls the decorated function with that
// lonLat instead of the cesium position. We don't call this directly, instead
// registering it with Cesium as an event handler.
//
// Example:
//
//     @canvasPositionArgToLonLat("position")
//     public leftClickCallback(lonLat) { ... }
//
//     const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
//     handler.setInputAction(this.leftClickCallback.bind(this), Cesium.ScreenSpaceEventType.LEFT_CLICK);
//
// When the LEFT_CLICK event fires, Cesium will call leftClickCallback, passing
// in an object with the "position" key, and this decorator will translate that
// position to a lonLat before passing it on to leftClickCallback
function canvasPositionArgToLonLat(key: string = "position", index: number = 0) {
  return (target: any, name: string, descriptor: any) => {
    const original = descriptor.value;

    descriptor.value = function(...args: any[]) {
      const position = args[index][key];
      const lonLat = this.canvasPositionToLonLatDegrees(position);

      const newArgs = args.slice();
      newArgs[index] = lonLat;

      return original.apply(this, newArgs);
    };

    return descriptor;
  };
}

// decorator
// index: number - position in the args array of the lonLat object
//
// if the lonLat argument is not valid--or if either the lat or lon is NaN,
// meaning the point is not on the globe--the decorated function is not called
function skipIfLonLatIsInvalid(index: number = 0) {
  return (target: any, name: string, descriptor: any) => {
    const original = descriptor.value;

    descriptor.value = function(...args: any[]) {
      if (this.lonLatIsNaN(args[index])) { return; }

      return original.apply(this, args);
    };

    return descriptor;
  };
}
