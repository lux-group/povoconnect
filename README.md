# Povo Connect

A persistence agnostic replacement for Heroku Connect.

```
npm install @luxuryescapes/povoconnect
```

## Credentials

Create credentials for connection:

```js
export const credentials = {
  clientId: "ABCDEFG",
  clientSecret: "123456",
  loginUrl: "https://cs6.salesforce.com",
  password: "password",
  username: "foo@bar.com"
}
```

## Create Topic

```js
import { connect, createTopic } from "@luxuryescapes/povoconnect";
import { credentials } from "./config";

async function createTopic() {
  const conn = await connect(credentials);

  const topic = await upsertTopic(conn, "OpportunityUpdates")
}
```

## Subscribe To Topic

Subscribe to the topic to sync data in real time.

Note: store `message.data.replayId` of the latest processed message for use next
time you run a job.

```js
import { connect, subscribe } from "@luxuryescapes/povoconnect";
import { credentials } from "./config";

const timeout = Infinity;

async function onReceive(message) {
  // do something here 
}

async function subscribeToOpportunityUpdates() {
  const conn = await connect(credentials);

  const subscription = {
    topic: "OpportunityUpdates",
    replayId: null
  }

  await subscribe(
    conn,
    subscription,
    timeout,
    onReceive
  );
}
```

## Find

Retrieves the object to sync.

```js
import { connect, findOne } from "@luxuryescapes/povoconnect";
import { credentials } from "./config";

const fields = ["Id", "Name"]

function mapper(sobject) {
  return {
    sfid: sobject.Id,
    name: sobject.Name
  }
}

async function findOpportunityById(sfid) {
  const conn = await connect(credentials);
  
  const model = await findOne(
    conn,
    "Opportunity",
    sfid,
    mapper,
    onReceive,
    fields
  );

  return model
}
```

## Find All

`findAll` returns all objects so you can make sure data is in sync.

```js
import { connect, findAll } from "@luxuryescapes/povoconnect";
import { credentials } from "./config";

const timeout = 60000;

function mapper(sobject) {
  return {
    sfid: sobject.Id,
    name: sobject.Name
  }
}

const query = {
  fields: ["Id", "CreatedDate"],
  where: "foo = 'bar'",
  limit: 100
}

async function findAllOpportunity() {
  const conn = await connect(credentials);

  const models = await findAll(
    conn,
    "Opportunity",
    timeout,
    mapper,
    query
  );
}
```
