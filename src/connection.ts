import { Connection } from "jsforce";

import { Credentials } from "./types";

export function connect(credentials: Credentials): Promise<Connection> {
  return new Promise((resolve, reject) => {
    const conn = new Connection({
      oauth2: {
        loginUrl: credentials.loginUrl,
        clientId: credentials.clientId,
        clientSecret: credentials.clientSecret
      }
    });

    conn.login(credentials.username, credentials.password, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(conn);
      }
    });
  });
}
