export type Fields = string[];

export interface Query {
  where?: string;
  limit?: number;
  fields?: Fields;
}

export interface ParsedQuery {
  where: string | null;
  limit: number | null;
  fields: string[];
}

function getFields(query?: Query): string[] {
  const idOnly = ["Id"];

  if (!query) {
    return idOnly;
  }

  if (!query.fields) {
    return idOnly;
  }

  return query.fields;
}

function getWhere(query?: Query): string | null {
  if (!query) {
    return null;
  }

  if (!query.where) {
    return null;
  }

  return query.where;
}

function getLimit(query?: Query): number | null {
  if (!query) {
    return null;
  }

  if (!query.limit) {
    return null;
  }

  return query.limit;
}

// TODO: should be using the query builder from jsforce but it's not exposed.
export function createSOQL(
  sobjectName: string,
  fields: string[],
  where: string | null,
  limit: number | null
): string {
  const soql = ["SELECT", fields.join(", "), "FROM", sobjectName];

  if (where) {
    soql.push(`WHERE ${where}`);
  }

  if (limit) {
    soql.push(`LIMIT ${limit}`);
  }

  return soql.join(" ");
}

export function parseQuery(query?: Query): ParsedQuery {
  const fields = getFields(query);

  const where = getWhere(query);

  const limit = getLimit(query);

  return { fields, where, limit };
}
