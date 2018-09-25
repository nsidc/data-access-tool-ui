import { List, Range, Set } from "immutable";

import { ICartesian3 } from "./CesiumUtils";

/* tslint:disable:no-var-requires */
const Cesium = require("cesium/Cesium");
/* tslint:enable:no-var-requires */

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
interface IBillboardCollection {
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

export class ReorderableBillboardCollection {
  private collection: IBillboardCollection;

  // List, but really like a Map from a billboards ordered index to the index it
  // has in the internal collection
  //
  // if orderedIndices = [3, 2, 4, 1, 0], then
  //
  // orderedBillBoardCollection[0] === orderedBillBoardCollection.collection[3]
  // orderedBillBoardCollection[1] === orderedBillBoardCollection.collection[2]
  // orderedBillBoardCollection[2] === orderedBillBoardCollection.collection[4]
  // orderedBillBoardCollection[3] === orderedBillBoardCollection.collection[1]
  // orderedBillBoardCollection[4] === orderedBillBoardCollection.collection[0]
  private orderedIndices: List<number>;

  public constructor() {
    this.collection = new Cesium.BillboardCollection();
    this.orderedIndices = List<number>();
  }

  public addToScene = (scene: any): void => {
    return scene.primitives.add(this.collection);
  }

  public indexOf = (billboard: IBillboard): number => {
    if (!this.contains(billboard)) { return -1; }

    for (let index = 0; index < this.length; index++) {
      if (billboard === this.get(index)) {
        return index;
      }
    }

    throw new Error("this.contains(billboard) returned true, but the billboard could not be found.");
  }

  public removeByIndex = (index: number): boolean => {
    if (!this.validIndex(index)) { return false; }

    const billboard = this.get(index);
    return this.remove(billboard);
  }

  public removeLast = (): boolean => {
    const index = this.length - 1;
    return this.removeByIndex(index);
  }

  // newIndices: array / map from current orderedIndex to new ordered index
  public reorder = (newIndices: number[]): void => {
    const newOrderedIndices = List(newIndices).map((newIndex: number | undefined): number => {
      if (newIndex === undefined) {
        return -1;
      }

      const billboard = this.get(newIndex);
      return this.collectionIndexOf(billboard);
    }).toList(); // toList for TypeScript - https://github.com/facebook/immutable-js/issues/684

    this.setOrderedIndices(newOrderedIndices);
  }

  //////////////////////////////////////////////////////////
  // match public interface of Cesium.BillboardCollection //
  //////////////////////////////////////////////////////////

  get length(): number {
    this.assertConsistentLength();
    return this.collection.length;
  }

  public add = (billboard: Partial<IBillboard>): IBillboard => {
    const addedBillboard = this.collection.add(billboard);
    this.setOrderedIndices(this.orderedIndices.push(this.orderedIndices.size));

    this.assertConsistentLength();
    return addedBillboard;
  }

  public contains = (billboard: IBillboard): boolean => {
    return this.collection.contains(billboard);
  }

  public destroy = (): void => {
    return this.collection.destroy();
  }

  public get = (index: number): IBillboard => {
    const collectionIndex = this.orderedIndices.get(index);
    return this.collection.get(collectionIndex);
  }

  public isDestroyed = (): boolean => {
    return this.collection.isDestroyed();
  }

  public remove = (billboard: IBillboard): boolean => {
    if (!this.contains(billboard)) {
      return false;
    }

    // get the index of the billboard in the collection while it's still there
    const collectionIndex = this.collectionIndexOf(billboard);

    // remove from collection
    const wasRemoved = this.collection.remove(billboard);

    // update orderedIndices
    const removedOrderedIndex: number = this.orderedIndices.indexOf(collectionIndex);

    const orderedIndices: List<number> = this.orderedIndices.remove(removedOrderedIndex)
      .map((orderedIndex: number | undefined): number => {
        if (orderedIndex === undefined) {
          return -1;
        }

        if (orderedIndex > removedOrderedIndex) {
          return orderedIndex - 1;
        }

        return orderedIndex;
      }).toList(); // toList for TypeScript - https://github.com/facebook/immutable-js/issues/684
    this.setOrderedIndices(orderedIndices);

    this.assertConsistentLength();
    return wasRemoved;
  }

  public removeAll = (): void => {
    if (this.length > 0) {
      this.collection.removeAll();
      this.setOrderedIndices(List<number>());
    }
  }

  ///////////////////////////////////////////////////////////
  // end of public interface of Cesium.BillboardCollection //
  ///////////////////////////////////////////////////////////

  private setOrderedIndices = (orderedIndices: List<number>): void => {
    this.assertOrderedIndicesValid(orderedIndices);
    this.orderedIndices = orderedIndices;
  }

  private assertConsistentLength = (): void => {
    if (this.collection.length !== this.orderedIndices.size) {
      throw new Error("Collection length and ordered index length are not equal.");
    }
  }

  private assertOrderedIndicesValid = (orderedIndices: List<number>): void => {
    const actualIndices = Set(orderedIndices);
    const expectedIndices = Set(Range(0, orderedIndices.size));

    if (!actualIndices.equals(expectedIndices)) {
      throw new Error("orderedIndices has an unexpected value; should be "
                      + "every integer from 0 to N-1 (N is the number of "
                      + "billboards in the collection)");
    }
  }

  // returns the index in the Cesium.BillboardCollection of the given billboard
  private collectionIndexOf = (billboard: IBillboard): number => {
    if (!this.contains(billboard)) { return -1; }

    for (let index = 0; index < this.collection.length; index++) {
      if (billboard === this.collection.get(index)) {
        return index;
      }
    }

    throw new Error("this.contains(billboard) returned true, but the billboard could not be found.");
  }

  private validIndex = (index: number): boolean => {
    if (!Number.isInteger(index)) {
      return false;
    }

    if (index < 0) {
      return false;
    }

    if (index >= this.length) {
      return false;
    }

    return true;
  }
}
