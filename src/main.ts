import { parseToSql } from "./parseToSql";
import { Db } from "./mongoMock";
type UserCollection = {
  name: string;
  age: number;
  isBlocked: boolean;
};

type ProductCollection = {
  name: string;
  price: number;
  isAvailable: boolean;
};

main();

function main() {
  const db = new Db();

  // Users collection query example
  const usersSqlQuery = parseToSql(
    db
      .collection<UserCollection>("users")
      .find(
        { name: "Test", isBlocked: false, age: { $gte: 18 } },
        { name: 1, age: 1 }
      )
  );

  console.log(usersSqlQuery);

  // Product collection query example
  const productsSqlQuery = parseToSql(
    db
      .collection<ProductCollection>("products")
      .find({ isAvailable: true, price: { $gt: 100 } }, { name: 1, price: 1 })
  );

  console.log(productsSqlQuery);
}

