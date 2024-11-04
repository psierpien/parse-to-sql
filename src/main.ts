import { parseToSql, Db } from "./parseToSql";

main();

function main() {
  const db = new Db();
  const sqlQuery = parseToSql(
    db.user.find({ name: "Test", age: { $gte: 18 } }, { name: 1, age: 1 })
  );

  console.log(sqlQuery);
}

