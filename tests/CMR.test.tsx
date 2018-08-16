import { versionParameters } from "../src/utils/CMR";

describe("CMR version_id query parameters", () => {
  it("should be correctly genreated for one-digit version_ids", () => {
    expect(versionParameters(1)).toBe("version=1&version=01&version=001");
  });
  it("should be correctly genreated for two-digit version_ids", () => {
    expect(versionParameters(12)).toBe("version=12&version=012");
  });
  it("should be correctly genreated for three-digit version_ids", () => {
    expect(versionParameters(123)).toBe("version=123");
  });
});
