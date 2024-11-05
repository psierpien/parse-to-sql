# MongoDB to SQL Query Translator

This is a simple Node.js application that translates MongoDB style queries into SQL queries. Supports only `find()` method and provides simulated mongodb DB implementation.

#### Supported methods

- `find`

#### Supports operators

- `$and`
- `$or`
- `$gt`
- `$gte`
- `$lt`
- `$lte`
- `$ne`
- `$in`
- `$nin`

## Examples

Simple query with out providing types

```
parseToSql(db.collection('user').find({_id: 23113}));
// SELECT * FROM user WHERE _id = 23113;
```

Example when you wanna provide types for query collection

```
interface User {
  name: string;
  age: number;
}

parseToSql(db.collection<User>('user').find({ name: "Test", age: { $gte: 18 } }, { name: 1, age: 1 }));
// SELECT name, age FROM user WHERE name = 'Test' AND age >= 18
```

## Installation

To install the project dependencies, run:

```bash
npm install
```

## Usage

To start the application, use:

```bash
npm start
```

This will run the main.ts file, which demonstrates the usage of the query translator with simple demo query.

## Testing

To run the tests, use:

```bash
npm test
```

This will execute the test suite using Jest.

## Project Structure

src/
├── main.ts # The entry point of the application (provide demo setup)
├── parseToSql.ts # Contains the main logic for translating MongoDB queries to SQL
└── parseToSql.test.ts # Contains the test cases for the query translator

