import { IGeoJsonPolygon } from "../src/types/GeoJson";
import { spatialParameter, versionParameters } from "../src/utils/CMR";

describe("CMR version_id query parameters", () => {
  it("should be correctly generated for one-digit version_ids", () => {
    expect(versionParameters(1)).toBe("version=1&version=01&version=001");
  });
  it("should be correctly generated for two-digit version_ids", () => {
    expect(versionParameters(12)).toBe("version=12&version=012");
  });
  it("should be correctly generated for three-digit version_ids", () => {
    expect(versionParameters(123)).toBe("version=123");
  });
});

describe("CMR spatial parameters", () => {
  // NSIDC-0642's bounding box
  const defaultCollectionSpatialCoverage = {
    bbox: [60, -75, 83, -14],
    geometry: {
      coordinates: [[]],
      type: "Polygon",
    },
    type: "Feature",
  };

  // polygon (triangle) drawn on NSIDC-0642
  const defaultSpatialSelection = {
      geometry: {
        coordinates: [[
          [-41.4, 75.1],
          [-76.5, 76.4],
          [-58.5, 70.9],
          [-41.4, 75.1],
        ]],
        type: "Polygon",
      },
      type: "Feature",
    };

  let spatialSelection: IGeoJsonPolygon | null = defaultSpatialSelection;
  let collectionSpatialCoverage: IGeoJsonPolygon | null = defaultCollectionSpatialCoverage;

  describe("with a user-defined spatial selection", () => {
    beforeEach(() => {
      spatialSelection = defaultSpatialSelection;
      collectionSpatialCoverage = defaultCollectionSpatialCoverage;
    });

    it("should use the user's polygon", () => {
      const expected = "polygon=-41.4,75.1,-76.5,76.4,-58.5,70.9,-41.4,75.1";
      expect(spatialParameter(spatialSelection, collectionSpatialCoverage)).toBe(expected);
    });
  });

  describe("with a user-defined spatial selection, and no collection coverage", () => {
    beforeEach(() => {
      spatialSelection = defaultSpatialSelection;
      collectionSpatialCoverage = null;
    });

    it("should use the user's polygon", () => {
      const expected = "polygon=-41.4,75.1,-76.5,76.4,-58.5,70.9,-41.4,75.1";
      expect(spatialParameter(spatialSelection, collectionSpatialCoverage)).toBe(expected);
    });
  });

  describe("with no user-defined spatial selection, but with a collection coverage", () => {
    beforeEach(() => {
      spatialSelection = null;
      collectionSpatialCoverage = defaultCollectionSpatialCoverage;
    });

    it("should use the collection's bounding box", () => {
      const expected = "bounding_box=60,-75,83,-14";
      expect(spatialParameter(spatialSelection, collectionSpatialCoverage)).toBe(expected);
    });
  });

  describe("with no user-defined spatial selection, nor collection coverage", () => {
    beforeEach(() => {
      spatialSelection = null;
      collectionSpatialCoverage = null;
    });

    it("should use the global bounding box", () => {
      const expected = "bounding_box=-180,-90,180,90";
      expect(spatialParameter(spatialSelection, collectionSpatialCoverage)).toBe(expected);
    });
  });
});
