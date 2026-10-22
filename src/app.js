const express = require('express');
const TaskStore = require('./taskStore');

/**
 * App factory: each call creates a fresh app with its own store,
 * which keeps API tests isolated from each other.
 */
function createApp(store = new TaskStore()) {
  const app = express();
  app.use(express.json());

  app.get('/', (req, res) => {
  res.json({
    name: 'Task Manager API',
    endpoints: ['/health', '/tasks', '/tasks/stats'],
  });
});

  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/tasks/stats', (req, res) => {
    res.json(store.stats());
  });

  app.get('/tasks', (req, res) => {
    const filter = {};
    if (req.query.done === 'true') filter.done = true;
    if (req.query.done === 'false') filter.done = false;
    res.json(store.getAll(filter));
  });

  app.get('/tasks/:id', (req, res) => {
    const task = store.getById(Number(req.params.id));
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  });

  app.post('/tasks', (req, res) => {
    try {
      const task = store.create(req.body.title);
      res.status(201).json(task);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/tasks/:id', (req, res) => {
    try {
      const task = store.update(Number(req.params.id), req.body);
      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.json(task);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/tasks/:id', (req, res) => {
    const deleted = store.delete(Number(req.params.id));
    if (!deleted) return res.status(404).json({ error: 'Task not found' });
    res.status(204).send();
  });

  return app;
}

module.exports = createApp;
