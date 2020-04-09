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
import { queueupSFEventLogs } from "@luxuryescapes/povoconnect";
import { credentials } from "./config";

const timeout = Infinity;

async function onReceive(message) {
  // do something here 
}

async function povo() {
  const conn = await connect(credentials);

  const subscription = {
    topic: "OpportunityUpdates",
    replayId: null
  }

  await queueupSFEventLogs(conn, subscription, timeout, onReceive);
}
```

## Processing Messages

This will retrieve the object from salesforce to map into an existing Heroku
Connect table.

```js
import { processSFEventLogs } from "@luxuryescapes/povoconnect";
import { credentials } from "./config";

const fields = ["Id", "Name"];

function mapper(sobject) {
  return {
    sfid: sobject.Id,
    name: sobject.Name
  }
}

async function onCreate(model) {
  // insert
}

async function onUpdate(model) {
  // update
}

async function onDelete(id) {
  // delete
}

async function onUnDelete(id) {
  // un-delete
}

async function povo() {
  const conn = await connect(credentials);

  const message = {
    sobject: {
      Id: "SA0000000000"
    }
  }

  await processSFEventLogs(
    conn,
    "Opportunity",
    [message],
    mapper,
    onCreate,
    onUpdate,
    onDelete,
    onUnDelete,
    fields
  );
}
```

Note: `fields` argument is optional, if ommited entire object will be retrieved.

## Retrieving All Object IDs

If you need to resync all your data because you want to sync a new field from
Salesforce.

list` return all ids for you object so you can create jobs to sync the data.

```js
import { queueupSync } from "@luxuryescapes/povoconnect";
import { credentials } from "./config";

const timeout = 60000;

async function onReceive(id) {
  // do something here
}

async function povo() {
  const conn = await connect(credentials);

  await queueupSync(conn, "Opportunity", timeout, onReceive);
}

povo();
```

## Sync Object

Retrieves the object to sync.

```js
import { processSync } from "@luxuryescapes/povoconnect";
import { credentials } from "./config";

const fields = ["Id", "Name"]

function mapper(sobject) {
  return {
    sfid: sobject.Id,
    name: sobject.Name
  }
}

async function onReceive(model) {
  // do something here
}

async function povo() {
  const conn = await connect(credentials);
  
  await processSync(
    conn,
    "Opportunity",
    "SA0000000000",
    mapper,
    onReceive,
    fields
  );
}
```
