import { ISpatialSelection } from "../SpatialSelection";

/* tslint:disable:no-var-requires */
const Cesium = require("cesium/Cesium");
require("cesium/Widgets/widgets.css");
/* tslint:enable:no-var-requires */

export class CesiumAdapter {
    private viewer: any;
    private positions: any;
    private defaultShapeOptions: any;
    private selectionEnd: any;
    private selectionEndTest: any;
    private selectionIsDone: boolean;
    private primitiveBuilder: any;
    private spatialSelection: ISpatialSelection;

    constructor() {
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
        handler.setInputAction(
            (movement: any) => this.handlePolygonEnd("leftDoubleClick", movement.position),
            Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
        );

        this.spatialSelection = spatialSelection;
        const positions = this.rectangleFromSpatialSelection(this.spatialSelection);
        this.handleSelectionStart("square");

        console.log("positions in cesium init: " + positions);
    }

    public handleReset() {
        console.log("Reset spatial selection");

        // Is this breaking rules about using "this.state" to set state?
        this.viewer.scene.primitives.removeAll();
        this.positions = [];
        this.selectionEnd = null;
    }

    public handleSelectionStart(name: string) {
        console.log("Start drawing " + name);

        if (name === "polygon") {
            this.selectionEnd = this.handlePolygonEnd;
            this.selectionEndTest = this.polygonEndTest;
            this.primitiveBuilder = this.polygonPrimitiveBuilder;
        } else {
            this.selectionEnd = this.handleLeftClick;
            this.selectionEndTest = this.extentEndTest;
            this.primitiveBuilder = this.extentPrimitiveBuilder;
        }

        this.positions = [];
        this.selectionIsDone = false;
    }

    public showSpatialSelection() {
        if (this.positions.length > 0 &&
            this.viewer.scene &&
            this.primitiveBuilder) {
            console.log("adding primitive");

            // Is this technically changing the state?
            this.viewer.scene.primitives.add(this.primitiveBuilder());
        }
    }

    // Polygon ends with a double-left click, so always return false when testing
    // "polygon end" from any other action.
    // TODO Still need to remove extra entry (due to double click) from positions array
    private polygonEndTest(action: string) {
        console.log("test for polygon end");
        if ((action === "leftDoubleClick") && this.positions && (this.positions.length >= 4)) {
            return true;
        } else {
            return false;
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

    private handlePolygonEnd(name: string, position: any) {
        if (this.selectionOff()) {
            return;
        }
        console.log("finish event on globe: " + name + " position: " + position);
        if (this.selectionEndTest(name) === true) {
            this.selectionIsDone = true;
        } else {
            this.savePosition(position);
        }
    }

    private polygonPrimitiveBuilder() {
        console.log("in polygon primitive builder");
        return this.genericPrimitiveBuilder("polygon", this.polygonGeometryBuilder);
    }

    private polygonGeometryBuilder() {
        // TODO: get rid of duplicate points (e.g. from double click)
        const positions = this.positions;
        console.log("positions: " + positions);

        return new Cesium.PolygonGeometry.fromPositions({
            height : this.defaultShapeOptions.height,
            positions,
            stRotation : this.defaultShapeOptions.textureRotationAngle,
            vertexFormat : Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
        });
    }

    private extentPrimitiveBuilder() {
        console.log("in extent primitive builder");
        return this.genericPrimitiveBuilder("square", this.extentGeometryBuilder);
    }

    private extentGeometryBuilder() {
        const positions = this.positions;
        console.log("positions in extent geometry: " + positions);

        const rectangle = new Cesium.Rectangle.fromCartesianArray(positions);
        return new Cesium.RectangleGeometry({
            ellipsoid: this.defaultShapeOptions.ellipsoid,
            granularity: this.defaultShapeOptions.granularity,
            height: this.defaultShapeOptions.height,
            rectangle,
            stRotation: this.defaultShapeOptions.textureRotationAngle,
            vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
        });
    }

    private genericPrimitiveBuilder(name: any, geometryBuilder: any) {
        const geometry = geometryBuilder();

        return new Cesium.GroundPrimitive({
            geometryInstances: new Cesium.GeometryInstance({
                attributes: {
                    color : new Cesium.ColorGeometryInstanceAttribute(0.0, 1.0, 1.0, 0.5),
                },
                geometry,
                id: {name},
            }),
        });
    }

    // Save selected point
    private handleLeftClick(name: string, position: any) {
        console.log("event on globe: " + name + " position: " + position);
        if (this.selectionOff()) {
            return;
        }
        this.savePosition(position);
        if (this.selectionEndTest(name) === true) {
            this.selectionIsDone = true;
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

    // TODO Alert user if they haven't selected a shape
    private selectionOff() {
        if (this.selectionIsDone && this.selectionEnd) {
            console.log("Globe clicked, but no shape selected");
            return true;
        }
        return false;
    }

    // @ts-ignore: TS6133; positionsFromSpatialSelection declared and not called
    // Should this functionality be part of the spatialSelection class itself?
    private positionsFromSpatialSelection(spatialSelection: ISpatialSelection) {
        const degArray = [
            spatialSelection.lower_left_lon, spatialSelection.lower_left_lat, 0,
            spatialSelection.lower_left_lon, spatialSelection.upper_right_lat, 0,
            spatialSelection.upper_right_lon, spatialSelection.upper_right_lat, 0,
            spatialSelection.upper_right_lon, spatialSelection.lower_left_lat, 0,
            spatialSelection.lower_left_lon, spatialSelection.lower_left_lat, 0,
        ];
        return Cesium.Cartesian3.fromDegreesArrayHeights(degArray);
    }

    private rectangleFromSpatialSelection(spatialSelection: ISpatialSelection) {
        const degArray = [
            spatialSelection.lower_left_lon, spatialSelection.lower_left_lat, 0,
            spatialSelection.upper_right_lon, spatialSelection.upper_right_lat, 0,
        ];
        return Cesium.Cartesian3.fromDegreesArrayHeights(degArray);
    }

}
