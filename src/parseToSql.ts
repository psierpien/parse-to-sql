import { Operators, Filter, Projection } from "./mongoMock";

export { parseToSql };

interface ParseToSqlParams<T> {
  name: string;
  query: Filter<T>;
  projection?: Projection<T>;
}

function parseToSql<T>({ name, query, projection }: ParseToSqlParams<T>) {
  let sqlQuery = `SELECT ${castProjection(projection)} FROM ${name}`;

  if (query && Object.keys(query).length > 0) {
    const conditions = castConditions(query);
    sqlQuery += " WHERE " + conditions.join(" AND ");
  }

  return sqlQuery;
}

function castProjection<T>(projection?: Projection<T>) {
  if (!projection) {
    return "*";
  }

  const columns = Object.entries(projection)
    .filter(([, value]) => Boolean(value))
    .map(([key]) => key);

  return columns.length > 0 ? columns.join(", ") : "*";
}

function castConditions<T>(query: Filter<T>): string[] {
  return Object.entries(query).map(([field, condition]) => {
    if (typeof condition === "object") {
      if (Array.isArray(condition)) {
        const conditions = condition.map((value) =>
          castConditions(value as Filter<T>)
        );

        switch (field) {
          case "$or":
            return `(${conditions
              .map((condition) => `${condition}`)
              .join(" OR ")})`;
          case "$and":
            return conditions.map((condition) => `${condition}`).join(" AND ");
          default:
            throw new Error(`Unsupported operator: ${field}`);
        }
      } else {
        return `${Object.entries(condition)
          .map(([op, value]) =>
            translateCondition(field, op as Operators, value)
          )
          .join(" AND ")}`;
      }
    }

    return translateCondition(field, "$eq", condition);
  });
}

function translateCondition(field: string, operator: Operators, value: any) {
  switch (operator) {
    case "$eq":
      return `${field} = ${valueParser(value)}`;
    case "$gt":
      return `${field} > ${valueParser(value)}`;
    case "$gte":
      return `${field} >= ${valueParser(value)}`;
    case "$lt":
      return `${field} < ${valueParser(value)}`;
    case "$lte":
      return `${field} <= ${valueParser(value)}`;
    case "$ne":
      return `${field} <> ${valueParser(value)}`;
    case "$in":
      return `${field} IN (${(value as any[])
        .map((v) => valueParser(v))
        .join(", ")})`;
    case "$nin":
      return `${field} NOT IN (${(value as any[])
        .map((v) => valueParser(v))
        .join(", ")})`;

    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}

// Converts value to proper sql notation depending on its type
function valueParser(value: number | string | boolean) {
  switch (typeof value) {
    case "string":
      return `'${value}'`;
    case "number":
      return value;
    case "boolean":
      return value ? "true" : "false";
    default:
      throw new Error(`Unsupported value: ${value} of type ${typeof value}`);
  }
}
