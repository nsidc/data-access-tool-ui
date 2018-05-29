import { Extent } from "./Extent";

import { ILatLon } from "../LatLon";
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
  }

  public cesiumPositionToLatLon(position: any): ILatLon {
    const cartesian = this.viewer.scene.camera.pickEllipsoid(position, CesiumAdapter.ellipsoid);

    // this means the position is not on the globe
    if (cartesian === undefined) {
      return {lat: NaN, lon: NaN};
    }

    const carto = Cesium.Cartographic.fromCartesian(cartesian);

    const latlon = {
      lat: Number.parseFloat(Cesium.Math.toDegrees(carto.latitude).toFixed(2)),
      lon: Number.parseFloat(Cesium.Math.toDegrees(carto.longitude).toFixed(2)),
    };

    return latlon;
  }

  public latLonIsNaN(latLon: ILatLon) {
    return [latLon.lat, latLon.lon].some(Number.isNaN);
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
  @cesiumPositionArgToLatLon("position")
  @skipIfLatLonIsInvalid()
  private leftClickCallback(latLon: ILatLon) {
    const startingExtentSelection = !this.extent.startLatLon;
    const endingExtentSelection = this.extent.startLatLon;

    if (startingExtentSelection) {
      this.extent.startDrawing(latLon);

    } else if (endingExtentSelection) {
      this.extent.stopDrawing(latLon);

      this.extentSelectionInProgress = false;
      this.handleExtentSelected(this.extent.asSpatialSelection());
    }
  }

  @skipIfSelectionIsNotActive
  @skipIfSelectionIsNotStarted
  @cesiumPositionArgToLatLon("endPosition")
  @skipIfLatLonIsInvalid()
  private mouseMoveCallback(latLon: ILatLon) {
    if (this.extent.drawDirection === null) {
      this.extent.updateDrawDirection(latLon);
    }

    this.extent.updateFromDrawing(latLon);
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
    const selectionStarted = !!this.extent.startLatLon;
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
// the first argument passed to the decorated function should be a cesium event
// object; this decorator takes one of the properties on that object (as chosen
// by the decorator factory argument `key`) and converts it to a latLon object,
// matching the ILatLon interface, then calls the decorated function with that
// latLon instead of the cesium position
//
// Example:  TODO: change this example to a callback registered on a cesium handler
//
// This function definition and call for `foo`...
//
//     @cesiumPositionArgToLatLon("startPosition")
//     public foo(latLon) { ... }
//
//     cesiumEvent = {startPosition: ... }
//     foo(cesiumEvent)
//
// ...is equivalent to this definition and call:
//
//     public foo(latLon) { ... }
//
//     cesiumEvent = {startPosition: ... }
//     foo(cesiumPositionToLatLon(cesiumEvent.startPosition))
function cesiumPositionArgToLatLon(key: string = "position", index: number = 0) {
  return (target: any, name: string, descriptor: any) => {
    const original = descriptor.value;

    descriptor.value = function(...args: any[]) {
      const position = args[index][key];
      const latLon = this.cesiumPositionToLatLon(position);

      const newArgs = args.slice();
      newArgs[index] = latLon;

      return original.apply(this, newArgs);
    };

    return descriptor;
  };
}

// decorator
// index: number - position in the args array of the latLon object
//
// if the latLon argument is not valid--or if either the lat or lon is NaN,
// meaning the point is not on the globe--the decorated function is not called
function skipIfLatLonIsInvalid(index: number = 0) {
  return (target: any, name: string, descriptor: any) => {
    const original = descriptor.value;

    descriptor.value = function(...args: any[]) {
      if (this.latLonIsNaN(args[index])) { return; }

      return original.apply(this, args);
    };

    return descriptor;
  };
}
