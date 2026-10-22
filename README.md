# Task Manager API

   ![CI](https://github.com/nuhiila/task-manager-api/actions/workflows/ci.yml/badge.svg)
   
A small REST API to manage tasks, built with **Node.js** and **Express**, and tested with **Jest** and **Supertest**.

The goal of this mini project is to show a clean, testable structure:

- `src/taskStore.js` – business logic (validation, CRUD, statistics), no HTTP
- `src/app.js` – Express routes (app factory, easy to test)
- `src/server.js` – starts the server
- `tests/` – unit tests (store) and integration tests (API)
- `.github/workflows/ci.yml` – runs the tests automatically on every push

## Getting started

```bash
npm install
npm start        # http://localhost:3000
npm test         # runs all tests with coverage
```

## Endpoints

| Method | Route            | Description                              |
|--------|------------------|------------------------------------------|
| GET    | `/health`        | Health check                             |
| GET    | `/tasks`         | List tasks (`?done=true` / `?done=false`)|
| GET    | `/tasks/stats`   | Total, done, pending, completion rate    |
| GET    | `/tasks/:id`     | Get one task                             |
| POST   | `/tasks`         | Create a task `{ "title": "..." }`       |
| PATCH  | `/tasks/:id`     | Update `title` and/or `done`             |
| DELETE | `/tasks/:id`     | Delete a task                            |

### Example

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Push my project to GitHub"}'
```

## Tests

- **Unit tests** (`tests/taskStore.test.js`): validation rules, CRUD, filters, statistics.
- **Integration tests** (`tests/app.test.js`): HTTP status codes and responses with Supertest.

## Possible improvements

- Persist tasks in a database (SQLite / MongoDB / PostgreSQL)
- Add authentication (JWT)
- Add Swagger / OpenAPI documentation
- Dockerize the app

## License

MIT
