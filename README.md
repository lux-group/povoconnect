# Povo Connect

A persistence agnostic replacement for Heroku Connect.

```
npm install @luxuryescapes/povoconnect
```

## Setup

Create topic in the apex debug console:

```
PushTopic pushTopic = new PushTopic();
pushTopic.Name = 'OpportunityUpdates';
pushTopic.Query = 'SELECT Id FROM Opportunity';
pushTopic.ApiVersion = 48.0;
pushTopic.NotifyForOperationCreate = true;
pushTopic.NotifyForOperationUpdate = true;
pushTopic.NotifyForOperationUndelete = true;
pushTopic.NotifyForOperationDelete = true;
pushTopic.NotifyForFields = 'All';
insert pushTopic;
```

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

## Processing Events

Subscribe to the topic and insert into existing `_sf_event_log` table if
migrating from Heroku Connect or create a job in Redis.

Note: store `message.data.replayId` of the latest processed message for use next
time you run a job.

```js
import { subscribe } from "@luxuryescapes/povoconnect";
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

## Retrieving All

If you need to resync all your data.

`list` returns all ids for you object so you can create jobs to sync the data.

```js
import { findAll } from "@luxuryescapes/povoconnect";
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

## Sync Object

Retrieves the object to sync.

```js
import { findOne } from "@luxuryescapes/povoconnect";
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
