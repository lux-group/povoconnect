import { OpportunitySObject, OpportunityModel } from "./types";

export const OpportunityFields = [
  "Id",
  "Name",
  "SystemModstamp",
  "CreatedDate"
];

export function OpportunityMapper(o: OpportunitySObject): OpportunityModel {
  return {
    sfid: o.Id,
    name: o.Name,
    systemmodstamp: o.SystemModstamp,
    createddate: o.CreatedDate
  };
}
