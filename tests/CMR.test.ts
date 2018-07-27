import * as fetchMock from "fetch-mock";

import * as CMR from "../src/utils/CMR";


describe("CMR utils", () => {
  describe("cmrStatusRequest()", () => {
    let text = "";

    afterEach(() => {
      fetchMock.restore();
      text = "";
    });

    test("should call the success callback when the request is ok", () => {
      fetchMock.mock(CMR.CMR_STATUS_URL, 200);

      const callbacks = {onFailure: null, onSuccess: () => { text = "onSuccess"; }}
      return CMR.cmrStatusRequest(callbacks).then(() => {
        expect(text).toEqual("onSuccess");
      });
    });

    test("should call the failure callback when the request is not ok", () => {
      fetchMock.mock(CMR.CMR_STATUS_URL, 500);

      const callbacks = {onFailure: () => { text = "onFailure"; }, onSuccess: null};
      return CMR.cmrStatusRequest(callbacks).then(() => {
        expect(text).toEqual("onFailure");
      });
    });
  });
});
