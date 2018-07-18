import * as fetchMock from "fetch-mock";

import * as CMR from "../src/utils/CMR.ts";


describe("CMR utils", () => {
  describe("cmrStatusRequest()", () => {
    let text = "";
    const onSuccess = () => { text = "onSuccess"; };
    const onFailure = () => { text = "onFailure"; };

    afterEach(() => {
      fetchMock.restore();
      text = "";
    });

    test("should call the success callback when the request is ok", () => {
      fetchMock.mock(CMR.CMR_STATUS_URL, 200);

      return CMR.cmrStatusRequest(onSuccess, null).then(() => {
        expect(text).toEqual("onSuccess");
      });
    });

    test("should call the failure callback when the request is not ok", () => {
      fetchMock.mock(CMR.CMR_STATUS_URL, 500);

      return CMR.cmrStatusRequest(null, onFailure).then(() => {
        expect(text).toEqual("onFailure");
      });
    });
  });
});
