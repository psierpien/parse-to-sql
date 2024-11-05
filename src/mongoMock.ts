import { Filter, FilterOperators } from "mongodb";

export {
  Db,
  type Projection,
  type ICollection,
  type FilterOperators,
  type Filter,
  type Operators,
};

type Operators = Extract<keyof FilterOperators<unknown>, string>;

type Projection<T> = Partial<Record<keyof T, 1 | 0>>;

interface ICollection<T> {
  find(
    query: Filter<T>,
    projection?: Projection<T>
  ): {
    name: string;
    query: Filter<T>;
    projection: Projection<T>;
  };
}

class Collection<T> implements ICollection<T> {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  find(query: Filter<T>, projection: Projection<T> = {}) {
    return {
      name: this.name,
      query: query,
      projection: projection,
    };
  }
}

class Db {
  constructor() {}

  collection<T>(name: string) {
    return new Collection<T>(name);
  }
}

