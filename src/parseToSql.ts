export { parseToSql, Db };

type MongoOperator = "$gt" | "$gte" | "$lt" | "$lte" | "$ne" | "$in" | "$nin";

type Condition<T> = {
  [K in keyof T]?: T[K] | { [operator in MongoOperator]?: T[K] | T[K][] };
};

interface MongoQuery<T> {
  [key: string]: any | Condition<T>;
}

type Projection<T> = Partial<Record<keyof T, 1 | 0>>;

interface ICollection<T> {
  find(query: MongoQuery<T>, projection?: Projection<T>): this;
  getQueryDetails(): { query: MongoQuery<T>; projection: Projection<T> };
}

interface IDb {
  [collectionName: string]: ICollection<{ name: string; age: number }>;
}

class Collection<T> implements ICollection<T> {
  name: string;
  query: MongoQuery<T> | null = null;
  projection: Projection<T> | null = null;

  constructor(name: string) {
    this.name = name;
  }

  find(query: MongoQuery<T>, projection: Projection<T> = {}): this {
    this.query = query;
    this.projection = projection;
    return this;
  }

  getQueryDetails() {
    return {
      query: this.query as MongoQuery<T>,
      projection: this.projection as Projection<T>,
    };
  }
}

class Db<T> implements IDb {
  [collectionName: string]: ICollection<T>;

  constructor() {
    return new Proxy(this, {
      get: (target, collectionName: string) => {
        if (!target[collectionName]) {
          target[collectionName] = new Collection<T>(collectionName);
        }
        return target[collectionName];
      },
    });
  }
}

function parseToSql<T>(collectionInstance: ICollection<T>): string {
  const { query, projection } = collectionInstance.getQueryDetails();
  const tableName = (collectionInstance as Collection<T>).name;

  let sqlQuery = `SELECT ${castProjection(projection)} FROM ${tableName}`;

  if (query && Object.keys(query).length > 0) {
    const conditions = castConditions(query);
    sqlQuery += " WHERE " + conditions.join(" AND ");
  }

  return sqlQuery;
}

function castProjection<T>(projection: Projection<T>) {
  if (!projection) {
    return "*";
  }

  const columns = Object.entries(projection)
    .filter(([, value]) => Boolean(value))
    .map(([key]) => key);

  return columns.length > 0 ? columns.join(", ") : "*";
}

function castConditions<T>(query: MongoQuery<T>): string[] {
  return Object.entries(query).map(([field, condition]) => {
    if (typeof condition === "object") {
      if (Array.isArray(condition)) {
        const conditions = condition.map((value) =>
          castConditions(value as MongoQuery<T>)
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
        return Object.entries(condition)
          .map(([op, value]) =>
            translateCondition(field, op as MongoOperator, value)
          )
          .join(" AND ");
      }
    } else {
      return `${field} = ${valueParser(condition)}`;
    }
  });
}

function translateCondition(
  field: string,
  operator: MongoOperator,
  value: any
): string {
  switch (operator) {
    case "$gt":
      return `${field} > ${valueParser(value)}`;
    case "$gte":
      return `${field} >= ${valueParser(value)}`;
    case "$lt":
      return `${field} < ${valueParser(value)}`;
    case "$lte":
      return `${field} <= ${valueParser(value)}`;
    case "$ne":
      return `${field} != ${valueParser(value)}`;
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

function valueParser(value: any) {
  switch (typeof value) {
    case "string":
      return `'${value}'`;
    case "number":
      return value;
    case "boolean":
      return value;
    default:
      throw new Error(`Unsupported value: ${value}`);
  }
}

