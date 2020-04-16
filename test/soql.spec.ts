import "mocha";
import { assert } from "chai";

import { createSOQL } from "../src";

describe("createSOQL", function() {
  it("builds SOQL string", async () => {
    const fields = ["Id", "CreatedDate"];

    const where = "foo = 'bar'";

    const limit = 100;

    const result = createSOQL("opportunity", fields, where, limit);

    const expected =
      "SELECT Id, CreatedDate FROM opportunity WHERE foo = 'bar' LIMIT 100";

    assert(result === expected);
  });
});
