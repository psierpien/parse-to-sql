import { describe, expect, test } from "@jest/globals";

import { Db } from "./mongoMock";
import { parseToSql } from "./parseToSql";

interface UserCollection {
  name: string;
  age: number;
  isBlocked: boolean;
}

describe("parseToSql", () => {
  const db = new Db();

  describe("projection", () => {
    test("should return sql query with all columns as '*' when projection is not provided", () => {
      const query = db.collection<UserCollection>("user").find({});

      expect(parseToSql(query)).toBe("SELECT * FROM user");
    });

    test("should return sql query with columns name and age when projection is provided", () => {
      const query = db
        .collection<UserCollection>("user")
        .find({}, { name: 1, age: 1 });

      expect(parseToSql(query)).toBe("SELECT name, age FROM user");
    });

    test("should return sql query with column name when column age projection is disabled", () => {
      const query = db
        .collection<UserCollection>("user")
        .find({}, { name: 1, age: 0 });

      expect(parseToSql(query)).toBe("SELECT name FROM user");
    });

    test("should return sql query with all column as '*' when column age projection is disabled", () => {
      const query = db.collection<UserCollection>("user").find({}, { age: 0 });

      expect(parseToSql(query)).toBe("SELECT * FROM user");
    });
  });

  describe("query", () => {
    test("should return sql query when name and age is equal", () => {
      const query = db
        .collection<UserCollection>("user")
        .find({ name: "Test", age: 18 });

      expect(parseToSql(query)).toBe(
        "SELECT * FROM user WHERE name = 'Test' AND age = 18"
      );
    });

    test("should return sql query when age is greater than 18", () => {
      const query = db
        .collection<UserCollection>("user")
        .find({ age: { $gt: 18 } });

      expect(parseToSql(query)).toBe("SELECT * FROM user WHERE age > 18");
    });

    test("should return sql query when age is greater than or equal to 18", () => {
      const query = db
        .collection<UserCollection>("user")
        .find({ age: { $gte: 18 } });

      expect(parseToSql(query)).toBe("SELECT * FROM user WHERE age >= 18");
    });

    test("should return sql query when age is less than 30", () => {
      const query = db
        .collection<UserCollection>("user")
        .find({ age: { $lt: 30 } });

      expect(parseToSql(query)).toBe("SELECT * FROM user WHERE age < 30");
    });

    test("should return sql query when age is less than or equal to 30", () => {
      const query = db
        .collection<UserCollection>("user")
        .find({ age: { $lte: 30 } });

      expect(parseToSql(query)).toBe("SELECT * FROM user WHERE age <= 30");
    });

    test("should return sql query when age is greater than or equal to 18 and less than or equal to 30", () => {
      const query = db
        .collection<UserCollection>("user")
        .find({ age: { $gte: 18, $lte: 30 } });

      expect(parseToSql(query)).toBe(
        "SELECT * FROM user WHERE age >= 18 AND age <= 30"
      );
    });

    test("should return sql query when name is not equal to 'John'", () => {
      const query = db
        .collection<UserCollection>("user")
        .find({ name: { $ne: "John" } });

      expect(parseToSql(query)).toBe("SELECT * FROM user WHERE name <> 'John'");
    });

    test("should return sql query when age is in [20, 30]", () => {
      const query = db
        .collection<UserCollection>("user")
        .find({ age: { $in: [20, 30] } });

      expect(parseToSql(query)).toBe(
        "SELECT * FROM user WHERE age IN (20, 30)"
      );
    });

    test("should return sql query when age is not in [21, 31]", () => {
      const query = db
        .collection<UserCollection>("user")
        .find({ age: { $nin: [21, 31] } });

      expect(parseToSql(query)).toBe(
        "SELECT * FROM user WHERE age NOT IN (21, 31)"
      );
    });

    test("should return sql query when name is 'Test' or 'John'", () => {
      const query = db.collection<UserCollection>("user").find({
        $or: [{ name: "Test" }, { name: "John" }],
      });

      expect(parseToSql(query)).toBe(
        "SELECT * FROM user WHERE (name = 'Test' OR name = 'John')"
      );
    });

    test("should return sql query when name is 'Test' and age less than 18 or age grater than 30", () => {
      const query = db.collection<UserCollection>("user").find({
        $and: [
          { name: "Test" },
          { $or: [{ age: { $lt: 18 } }, { age: { $gt: 30 } }] },
        ],
      });

      expect(parseToSql(query)).toBe(
        "SELECT * FROM user WHERE name = 'Test' AND (age < 18 OR age > 30)"
      );
    });

    test("should return sql query when $or and $and operator is provided", () => {
      const query = db.collection<UserCollection>("user").find({
        $or: [
          { name: "Test" },
          { $and: [{ age: { $lte: 18 } }, { age: { $gte: 30 } }] },
        ],
      });

      expect(parseToSql(query)).toBe(
        "SELECT * FROM user WHERE (name = 'Test' OR age <= 18 AND age >= 30)"
      );
    });
  });
});

