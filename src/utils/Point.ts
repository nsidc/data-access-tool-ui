import * as dragImg from "../img/dragIcon.png";
import { IBillboard, IBillboardCollection, ICartesian3 } from "./CesiumUtils";

export class Point {
  public readonly cartesian: ICartesian3;

  private billboard: IBillboard;
  private billboardProps: Partial<IBillboard>;

  public constructor(cartesian: ICartesian3 | undefined) {
    if (cartesian) {
      this.cartesian = cartesian;

      this.billboardProps = {
        image: dragImg,
        position: cartesian,
      };
    }
  }

  public getBillboard = (): IBillboard => {
    return this.billboard;
  }

  public addBillboard = (billboardCollection: IBillboardCollection): IBillboard => {
    this.billboard = billboardCollection.add(this.billboardProps);
    return this.billboard;
  }

  public removeBillboard = (billboardCollection: IBillboardCollection): boolean => {
    return billboardCollection.remove(this.billboard);
  }
}
