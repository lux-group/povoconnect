import { build, define } from "@luxuryescapes/lib-factories";

define("message", ({ counter }) => ({
  event: {
    createdDate: new Date().toISOString(),
    replayId: counter(),
    type: "updated"
  },
  sobject: {
    Id: "0060I00000Y42b9QAB"
  }
}));

export { build };
