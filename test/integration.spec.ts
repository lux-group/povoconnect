// import { expect } from "chai";
import "mocha";

import { getConnection } from "../src";

const credentials = {
  clientId: process.env.SALESFORCE_CLIENT_ID || "",
  clientSecret: process.env.SALESFORCE_CLIENT_SECRET || "",
  loginUrl: process.env.SALESFORCE_LOGIN_URL || "",
  password: process.env.SALESFORCE_PASSWORD || "",
  username: process.env.SALESFORCE_USERNAME || ""
};

describe("Integration Tests", function() {
  this.timeout(5000);

  it("gets the connection", () => getConnection(credentials));
});
