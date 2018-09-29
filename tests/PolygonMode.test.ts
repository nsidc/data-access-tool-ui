import * as Cesium from "cesium";

import { cartesiansEqual } from "../src/utils/PolygonMode";

describe("cartesiansEqual", () => {
  describe("with points that are equal", () => {
    test("and no tolerance given", () => {
      const p1 = new Cesium.Cartesian3(2, 3, 5);
      const p2 = new Cesium.Cartesian3(2.0, 3.0, 5.0);

      expect(cartesiansEqual(p1, p2)).toBe(true);
    });

    test("within the given tolerance", () => {
      const p1 = new Cesium.Cartesian3(2, 3, 5);
      const p2 = new Cesium.Cartesian3(2.01, 3.01, 5.01);

      const tolerance = 1e-2;

      expect(cartesiansEqual(p1, p2, tolerance)).toBe(true);
    });
  });

  describe("with points that are not equal", () => {
    test("and no tolerance given", () => {
      const p1 = new Cesium.Cartesian3(2, 3, 5);
      const p2 = new Cesium.Cartesian3(2.01, 3.01, 5.01);

      expect(cartesiansEqual(p1, p2)).toBe(false);
    });

    test("and the difference is greater than the given tolerance", () => {
      const p1 = new Cesium.Cartesian3(2, 3, 5);
      const p2 = new Cesium.Cartesian3(2.01, 3.01, 5.01);

      const tolerance = 1e-3;

      expect(cartesiansEqual(p1, p2, tolerance)).toBe(false);
    });
  });
});
