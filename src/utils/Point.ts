import * as Cesium from "cesium";

import * as dragImg from "../img/dragIcon.png";

export class Point {
  public readonly cartesian: Cesium.Cartesian3;

  private billboard: Cesium.Billboard;
  private billboardProps: Partial<Cesium.Billboard>;

  public constructor(cartesian: Cesium.Cartesian3 | undefined) {
    if (cartesian) {
      this.cartesian = cartesian;

      this.billboardProps = {
        image: dragImg,
        position: cartesian,
      };
    }
  }

  public getBillboard = (): Cesium.Billboard => {
    return this.billboard;
  }

  public addBillboard = (billboardCollection: Cesium.BillboardCollection): Cesium.Billboard => {
    this.billboard = billboardCollection.add(this.billboardProps);
    return this.billboard;
  }

  public removeBillboard = (billboardCollection: Cesium.BillboardCollection): boolean => {
    return billboardCollection.remove(this.billboard);
  }
}
