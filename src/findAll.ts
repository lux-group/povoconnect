import { Connection } from "jsforce";
import xml2js from "xml2js";
import fetch from "node-fetch";
import { promisify } from "util";

import { createSOQL, parseQuery, Query } from "./soql";

const parseXML = promisify(xml2js.parseString);

export async function find<O, M>(
  conn: Connection,
  sobjectName: string,
  maxFetch: number,
  mapper: (sobject: O) => M,
  query?: Query
): Promise<M[]> {
  const { fields, where, limit } = parseQuery(query);

  const soql = createSOQL(sobjectName, fields, where, limit);

  const obj = {
    jobInfo: {
      $: {
        xmlns: "http://www.force.com/2009/06/asyncapi/dataload"
      },
      operation: "query",
      object: sobjectName,
      concurrencyMode: "Parallel",
      contentType: "JSON"
    }
  }

  const builder = new xml2js.Builder();
  const xml = builder.buildObject(obj);

  const job = await fetch(`${conn.instanceUrl}/services/async/${conn.version}/job`, {
    method: "POST",
    body: xml,
    headers: {
      "X-SFDC-Session": conn.accessToken,
      "Content-Type": "application/xml"
    }
  });

  const responseBody = await job.text();

  const responseXml = await parseXML(responseBody) as any;

  const jobId = responseXml['jobInfo']['id'][0]

  const batchResponse = await fetch(`${conn.instanceUrl}/services/async/${conn.version}/job/${jobId}/batch`, {
    method: "POST",
    body: soql,
    headers: {
      "X-SFDC-Session": conn.accessToken,
      "Content-Type": "application/json"
    }
  })

  const batch = await batchResponse.json()

  const batchId = batch.id

  const statusResponse = await fetch(`${conn.instanceUrl}/services/async/${conn.version}/job/${jobId}/batch/${batchId}`, {
    headers: {
      "X-SFDC-Session": conn.accessToken
    }
  })

  const status = await statusResponse.json()

  // switch(status) {
  //   case "Completed":
  //     break;
  //   default:
  // }

  console.log(status)

  const resultResponse = await fetch(`${conn.instanceUrl}/services/async/${conn.version}/job/${jobId}/batch/${batchId}/result`, {
    headers: {
      "X-SFDC-Session": conn.accessToken
    }
  })

  const [ resultId ] = await resultResponse.json()

  console.log(resultId)

  const resResponse = await fetch(`${conn.instanceUrl}/services/async/${conn.version}/job/${jobId}/batch/${batchId}/result/${resultId}`, {
    headers: {
      "X-SFDC-Session": conn.accessToken
    }
  })

  const foo = await resResponse.json() as O[]

  const models: M[] = [];

  for (const sobject of foo) {
    models.push(mapper(sobject));
  }

  return models
}
