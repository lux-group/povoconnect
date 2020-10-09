import { Connection } from "jsforce";
import xml2js from "xml2js";
import fetch from "node-fetch";
import { promisify } from "util";

import timeout from "./timeout";
import { createSOQL, parseQuery, Query } from "./soql";

const parseXML = promisify(xml2js.parseString);

interface Job {
  id: string;
}

interface Batch {
  id: string;
}

interface BatchStatus {
  apexProcessingTime: number;
  apiActiveProcessingTime: number;
  createdDate: string;
  id: string;
  jobId: string;
  numberRecordsFailed: number;
  numberRecordsProcessed: number;
  state: string;
  stateMessage: string | null;
  systemModstamp: string;
  totalProcessingTime: number;
}

interface Result {
  id: string;
}

interface JobXML {
  jobInfo: {
    id: string[];
  };
}

async function getBatchStatus(
  accessToken: string,
  baseUrl: string,
  jobId: string,
  batchId: string
): Promise<BatchStatus> {
  const response = await fetch(`${baseUrl}/job/${jobId}/batch/${batchId}`, {
    headers: {
      "X-SFDC-Session": accessToken
    }
  });

  const result = await response.json();

  return result;
}

async function batchCompletion(
  accessToken: string,
  baseUrl: string,
  jobId: string,
  batchId: string
): Promise<void> {
  const start = new Date().getTime();

  let batchStatus = await getBatchStatus(accessToken, baseUrl, jobId, batchId);

  let ms = 1000;

  while (batchStatus.state !== "Completed") {
    const end = new Date().getTime();
    const time = end - start;

    if (time > 600000) {
      throw new Error("timeout error");
    }

    await timeout(ms);

    if (ms < 5000) {
      ms = ms + 1000;
    }

    batchStatus = await getBatchStatus(accessToken, baseUrl, jobId, batchId);
  }
}

async function createJob(
  accessToken: string,
  baseUrl: string,
  sobjectName: string
): Promise<Job> {
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
  };

  const builder = new xml2js.Builder();

  const body = builder.buildObject(obj);

  const response = await fetch(`${baseUrl}/job`, {
    method: "POST",
    body,
    headers: {
      "X-SFDC-Session": accessToken,
      "Content-Type": "application/xml"
    }
  });

  const xml = await response.text();

  const result = (await parseXML(xml)) as JobXML;

  return {
    id: result["jobInfo"]["id"][0]
  };
}

async function createBatch(
  accessToken: string,
  baseUrl: string,
  jobId: string,
  soql: string
): Promise<Batch> {
  const response = await fetch(`${baseUrl}/job/${jobId}/batch`, {
    method: "POST",
    body: soql,
    headers: {
      "X-SFDC-Session": accessToken,
      "Content-Type": "application/json"
    }
  });

  const result = await response.json();

  return result;
}

async function getResult(
  accessToken: string,
  baseUrl: string,
  jobId: string,
  batchId: string
): Promise<Result> {
  const resultResponse = await fetch(
    `${baseUrl}/job/${jobId}/batch/${batchId}/result`,
    {
      headers: {
        "X-SFDC-Session": accessToken
      }
    }
  );

  const [resultId] = await resultResponse.json();

  return {
    id: resultId
  };
}

async function getSObjects<O>(
  accessToken: string,
  baseUrl: string,
  jobId: string,
  batchId: string,
  resultId: string
): Promise<O[]> {
  const response = await fetch(
    `${baseUrl}/job/${jobId}/batch/${batchId}/result/${resultId}`,
    {
      headers: {
        "X-SFDC-Session": accessToken
      }
    }
  );

  const result = (await response.json()) as O[];

  return result;
}

export async function find<O, M>(
  conn: Connection,
  sobjectName: string,
  maxFetch: number,
  mapper: (sobject: O) => M,
  query?: Query
): Promise<M[]> {
  const { fields, where, limit } = parseQuery(query);

  const { instanceUrl, version, accessToken } = conn;

  const soql = createSOQL(sobjectName, fields, where, limit);

  const baseUrl = `${instanceUrl}/services/async/${version}`;

  const job = await createJob(accessToken, baseUrl, sobjectName);

  const batch = await createBatch(accessToken, baseUrl, job.id, soql);

  await batchCompletion(accessToken, baseUrl, job.id, batch.id);

  const result = await getResult(accessToken, baseUrl, job.id, batch.id);

  const sobjects = await getSObjects<O>(
    conn.accessToken,
    baseUrl,
    job.id,
    batch.id,
    result.id
  );

  const models: M[] = [];

  for (const sobject of sobjects) {
    models.push(mapper(sobject));
  }

  return models;
}
