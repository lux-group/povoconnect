import { OpportunitySObject, OpportunityModel } from "./types";

export function OpportunityMapper(o: OpportunitySObject): OpportunityModel {
  return {
    sfid: o.Id,
    name: o.Name,
    systemmodstamp: o.SystemModstamp,
    createddate: o.CreatedDate
  };
}
