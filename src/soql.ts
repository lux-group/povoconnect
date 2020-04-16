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
