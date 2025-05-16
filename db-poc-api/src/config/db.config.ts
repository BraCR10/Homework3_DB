import { config, ConnectionPool, IResult, TYPES } from "mssql";
import { config as SQLAuth } from "dotenv";
import { inSqlParameters, outSqlParameters } from "../types/queryParams.type";
import { console } from "inspector";

SQLAuth();
let dbListener: any = null;

const dbConfig: config = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER || "",
  port: Number(process.env.SQL_PORT) || 1433,
  database: process.env.SQL_DATABASE,
  options: {
    trustServerCertificate: true,
    encrypt: true,
  },
};
export async function initConnection(): Promise<void> {
  try {
    console.log("Connecting to the database...");
    dbListener = new ConnectionPool(dbConfig);
    await dbListener.connect();
  } catch (error) {
    console.log("Connection failed due to: " + error);
    throw error;
  }
}

export async function execute(
  storedProcedure: string,
  inParams: inSqlParameters | any,
  outParams: outSqlParameters | any,
): Promise<IResult<any>> {
  try {
    const request = dbListener.request();
    if (Object.keys(inParams).length > 0) {
      for (const key of Object.keys(inParams)) {
        const type = inParams[key][1];
        const value = inParams[key][0];
        request.input(key, type, value);
      }
    }

    request.output("outResultCode", TYPES.Int);

    if (outParams) {
      if (Object.keys(outParams).length > 0) {
        for (const key of Object.keys(outParams)) {
          const type = outParams[key];
          request.output(key, type);
        }
      }
    }

    const result = await request.execute(storedProcedure);

    return result;
  } catch (error) {
    console.log("Query failed due to: " + error);
    throw error;
  }
}
