import { Connection } from "jsforce";

export interface Credentials {
  clientId: string;
  clientSecret: string;
  loginUrl: string;
  password: string;
  username: string;
}

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
