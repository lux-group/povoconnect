/// <reference types="./types/@luxuryescapes/lib-factories" />

import "mocha";
import { assert } from "chai";

import { findOne } from "../src";

import * as credentials from "./support/credentials";
import { OpportunitySObject, OpportunityModel } from "./support/types";
import { OpportunityMapper } from "./support/mapping";
import { connect } from "./support/connection";

describe("findOne", function() {
  it("retrieves a model", async () => {
    const conn = await connect(credentials);

    const model = await findOne<OpportunitySObject, OpportunityModel>(
      conn,
      "Opportunity",
      "AA0000000000",
      OpportunityMapper
    );

    if (!model) {
      throw new Error("model is undefined");
    }

    assert(model.sfid);
    assert(model.name);
    assert(model.systemmodstamp);
    assert(model.createddate);
  });
});
