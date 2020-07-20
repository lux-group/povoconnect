export interface OpportunitySObject {
  Id: string;
  Name: string;
  SystemModstamp: string | number;
  CreatedDate: string | number;
}

export interface OpportunityModel {
  sfid: string;
  name: string;
  systemmodstamp: Date;
  createddate: Date;
}
