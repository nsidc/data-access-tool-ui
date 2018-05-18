import { ISpatialSelection } from "../SpatialSelection";

/* tslint:disable:no-var-requires */
const Cesium = require("cesium/Cesium");
require("cesium/Widgets/widgets.css");
/* tslint:enable:no-var-requires */

export class CesiumAdapter {
    private viewer: any;
    private positions: any;
    private defaultShapeOptions: any;
    private selectionIsDone: boolean;
    private spatialSelection: ISpatialSelection;
    private handleExtentSelected: (s: ISpatialSelection) => void;

    constructor(extentSelected: (s: ISpatialSelection) => void) {
        this.defaultShapeOptions = {
            appearance: new Cesium.EllipsoidSurfaceAppearance({
                aboveGround : false,
            }),
            asynchronous: true,
            debugShowBoundingVolume: false,
            ellipsoid: Cesium.Ellipsoid.WGS84,
            granularity: Math.PI / 180.0,
            height: 0.0,
            material: Cesium.Material.fromType(Cesium.Material.ColorType),
            show: true,
            textureRotationAngle: 0.0,
        };
        this.positions = [],
        this.selectionIsDone = false;
        this.handleExtentSelected = extentSelected;
    }

    public createViewer(elementId: string, spatialSelection: ISpatialSelection) {
        this.viewer = new Cesium.Viewer(elementId, {
            animation: false,
            baseLayerPicker: false,
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
        handler.setInputAction(
            (movement: any) => this.handleLeftClick("leftClick", movement.position),
            Cesium.ScreenSpaceEventType.LEFT_CLICK,
        );

        this.spatialSelection = spatialSelection;
        const positions = this.rectangleFromSpatialSelection(this.spatialSelection);

        console.log("positions in cesium init: " + positions);
    }

    public showSpatialSelection() {
        if (this.positions.length > 0 && this.viewer.scene) {
            console.log("adding primitive");
            this.viewer.scene.primitives.add(this.extentPrimitive());
        }
    }

    public handleReset() {
        console.log("Reset spatial selection");

        this.viewer.scene.primitives.removeAll();
        this.positions = [];
    }

    public handleSelectionStart() {
        console.log("Start drawing extent");

        this.positions = [];
        this.selectionIsDone = false;
    }

    // Save selected point
    private handleLeftClick(name: string, position: any) {
        console.log("event on globe: " + name + " position: " + position);
        if (this.selectionOff()) {
            return;
        }
        this.savePosition(position);
        if (this.extentEndTest(name) === true) {
            this.selectionIsDone = true;
            this.showSpatialSelection();
            // TODO: convert our points into a spatial selection!
            this.handleExtentSelected(this.spatialSelection);
        }
    }

    private savePosition(position: any) {
        const ellipsoid = this.defaultShapeOptions.ellipsoid;
        const cartesian = this.viewer.scene.camera.pickEllipsoid(position, ellipsoid);
        if (cartesian) {
            console.log("add point " + cartesian);
            this.positions.push(cartesian);
        }
    }

    private extentEndTest(action: string) {
        if (this.positions && (this.positions.length === 2 )) {
            console.log("extent end is true");
            return true;
        } else {
            return false;
        }
    }

    private extentPrimitive() {
        console.log("in extent primitive builder");

        return new Cesium.GroundPrimitive({
            geometryInstances: new Cesium.GeometryInstance({
                attributes: {
                    color : new Cesium.ColorGeometryInstanceAttribute(0.0, 1.0, 1.0, 0.5),
                },
                geometry: this.extentGeometry(),
                id: {name},
            }),
        });
    }

    private extentGeometry() {
        console.log("positions in extent geometry: " + this.positions);

        const rectangle = new Cesium.Rectangle.fromCartesianArray(this.positions);
        return new Cesium.RectangleGeometry({
            ellipsoid: this.defaultShapeOptions.ellipsoid,
            granularity: this.defaultShapeOptions.granularity,
            height: this.defaultShapeOptions.height,
            rectangle,
            stRotation: this.defaultShapeOptions.textureRotationAngle,
            vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
        });
    }

    // TODO Alert user if they haven't selected a shape
    private selectionOff() {
        if (this.selectionIsDone) {
            console.log("Globe clicked, but no shape selected");
            return true;
        }
        return false;
    }

    private rectangleFromSpatialSelection(spatialSelection: ISpatialSelection) {
        const degArray = [
            spatialSelection.lower_left_lon, spatialSelection.lower_left_lat,
            spatialSelection.upper_right_lon, spatialSelection.upper_right_lat
        ];
        return Cesium.Cartesian3.fromDegreesArray(degArray);
    }

}
