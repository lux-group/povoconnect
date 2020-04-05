import { Connection, UserInfo } from "jsforce";

interface Credentials {
  clientId: string;
  clientSecret: string;
  loginUrl: string;
  password: string;
  username: string;
}

interface ConnectionSuccess {
  conn: Connection;
  userInfo: UserInfo;
}

export function getConnection(
  credentials: Credentials
): Promise<ConnectionSuccess> {
  return new Promise(function(resolve, reject) {
    const conn = new Connection({
      oauth2: {
        loginUrl: credentials.loginUrl,
        clientId: credentials.clientId,
        clientSecret: credentials.clientSecret
      }
    });

    conn.login(credentials.username, credentials.password, function(
      err,
      userInfo
    ) {
      if (err) {
        reject(err);
      } else {
        resolve({ conn, userInfo });
      }
    });
  });
}
