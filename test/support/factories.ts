import { build, define } from "@luxuryescapes/lib-factories";

define("Message", ({ counter }) => ({
  event: {
    createdDate: new Date().toISOString(),
    replayId: counter(),
    type: "updated"
  },
  sobject: {
    Id: "0060I00000Y42b9QAB"
  }
}));

define("OpportunitySObject", () => ({
  Id: "0060I00000Y42b9QAB",
  Name: "Alcyone Hotel Residences, Brisbane - October 2018",
  CreatedDate: "2018-10-17T11:12:23.000+0000",
  SystemModstamp: "2020-04-07T03:02:10.000+0000"
}));

export { build };
