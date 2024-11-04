import { describe, expect, test } from "@jest/globals";

import { parseToSql, Db } from "./parseToSql";

describe("parseToSql", () => {
  const db = new Db();

  describe("projection", () => {
    test("should return sql query with all columns as '*' when projection is not provided", () => {
      const query = db.user.find({});

      expect(parseToSql(query)).toBe("SELECT * FROM user");
    });

    test("should return sql query with columns name and age when projection is provided", () => {
      const query = db.user.find({}, { name: 1, age: 1 });

      expect(parseToSql(query)).toBe("SELECT name, age FROM user");
    });

    test("should return sql query with column name when column 'age' have off projection", () => {
      const query = db.user.find({}, { name: 1, age: 0 });

      expect(parseToSql(query)).toBe("SELECT name FROM user");
    });

    test("should return sql query with column name when column 'age' have off projection", () => {
      const query = db.user.find({}, { age: 0 });

      expect(parseToSql(query)).toBe("SELECT * FROM user");
    });
  });

  describe("query", () => {
    test("should return sql query with all columns as '*' when no projection is provided", () => {
      const query = db.user.find({ name: "Test", age: { $gte: 18, $lte: 30 } });

      expect(parseToSql(query)).toBe(
        "SELECT * FROM user WHERE name = 'Test' AND age >= 18 AND age <= 30"
      );
    });

    test("should return sql query when $and operator is provided", () => {
      const query = db.user.find({
        $and: [{ name: "Test" }, { age: { $gte: 18, $lte: 30 } }],
      });

      expect(parseToSql(query)).toBe(
        "SELECT * FROM user WHERE name = 'Test' AND age >= 18 AND age <= 30"
      );
    });

    test("should return sql query when $or operator is provided", () => {
      const query = db.user.find({
        $or: [{ name: "Test" }, { name: "John" }],
      });

      expect(parseToSql(query)).toBe(
        "SELECT * FROM user WHERE (name = 'Test' OR name = 'John')"
      );
    });

    test("should return sql query when $or and $and operator is provided", () => {
      const query = db.user.find({
        $and: [
          { name: "Test" },
          { $or: [{ age: { $lte: 18 } }, { age: { $gte: 30 } }] },
        ],
      });

      expect(parseToSql(query)).toBe(
        "SELECT * FROM user WHERE name = 'Test' AND (age <= 18 OR age >= 30)"
      );
    });
  });
});

