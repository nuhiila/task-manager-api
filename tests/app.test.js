const request = require('supertest');
const createApp = require('../src/app');

describe('Task Manager API (integration tests)', () => {
  let app;

  beforeEach(() => {
    app = createApp(); // fresh app + empty store for every test
  });

  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  describe('POST /tasks', () => {
    test('creates a task', async () => {
      const res = await request(app).post('/tasks').send({ title: 'Write tests' });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ id: 1, title: 'Write tests', done: false });
    });

    test('returns 400 when the title is missing', async () => {
      const res = await request(app).post('/tasks').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Title is required');
    });
  });

  describe('GET /tasks', () => {
    beforeEach(async () => {
      await request(app).post('/tasks').send({ title: 'A' });
      await request(app).post('/tasks').send({ title: 'B' });
      await request(app).patch('/tasks/2').send({ done: true });
    });

    test('lists all tasks', async () => {
      const res = await request(app).get('/tasks');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    test('filters done tasks', async () => {
      const res = await request(app).get('/tasks?done=true');
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe('B');
    });

    test('filters pending tasks', async () => {
      const res = await request(app).get('/tasks?done=false');
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe('A');
    });
  });

  describe('GET /tasks/:id', () => {
    test('returns one task', async () => {
      await request(app).post('/tasks').send({ title: 'Solo' });
      const res = await request(app).get('/tasks/1');
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Solo');
    });

    test('returns 404 for an unknown task', async () => {
      const res = await request(app).get('/tasks/999');
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /tasks/:id', () => {
    test('marks a task as done', async () => {
      await request(app).post('/tasks').send({ title: 'Finish' });
      const res = await request(app).patch('/tasks/1').send({ done: true });
      expect(res.status).toBe(200);
      expect(res.body.done).toBe(true);
    });

    test('returns 400 on invalid data', async () => {
      await request(app).post('/tasks').send({ title: 'Task' });
      const res = await request(app).patch('/tasks/1').send({ done: 'nope' });
      expect(res.status).toBe(400);
    });

    test('returns 404 for an unknown task', async () => {
      const res = await request(app).patch('/tasks/999').send({ done: true });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /tasks/:id', () => {
    test('deletes a task', async () => {
      await request(app).post('/tasks').send({ title: 'Bye' });
      const res = await request(app).delete('/tasks/1');
      expect(res.status).toBe(204);
      const after = await request(app).get('/tasks/1');
      expect(after.status).toBe(404);
    });

    test('returns 404 for an unknown task', async () => {
      const res = await request(app).delete('/tasks/999');
      expect(res.status).toBe(404);
    });
  });

  test('GET /tasks/stats returns statistics', async () => {
    await request(app).post('/tasks').send({ title: 'A' });
    await request(app).post('/tasks').send({ title: 'B' });
    await request(app).patch('/tasks/1').send({ done: true });
    const res = await request(app).get('/tasks/stats');
    expect(res.body).toEqual({ total: 2, done: 1, pending: 1, completionRate: 50 });
  });
});
