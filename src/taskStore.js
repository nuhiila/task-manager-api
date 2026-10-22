/**
 * In-memory task store: all the business logic lives here,
 * so it can be unit tested without any HTTP layer.
 */
class TaskStore {
  constructor() {
    this.tasks = [];
    this.nextId = 1;
  }

  validateTitle(title) {
    if (typeof title !== 'string' || title.trim() === '') {
      throw new Error('Title is required');
    }
    if (title.trim().length > 100) {
      throw new Error('Title must be 100 characters or less');
    }
  }

  create(title) {
    this.validateTitle(title);
    const task = {
      id: this.nextId++,
      title: title.trim(),
      done: false,
      createdAt: new Date().toISOString(),
    };
    this.tasks.push(task);
    return task;
  }

  getAll(filter = {}) {
    if (filter.done === undefined) return [...this.tasks];
    return this.tasks.filter((t) => t.done === filter.done);
  }

  getById(id) {
    return this.tasks.find((t) => t.id === id) || null;
  }

  update(id, changes) {
    const task = this.getById(id);
    if (!task) return null;

    if (changes.title !== undefined) {
      this.validateTitle(changes.title);
      task.title = changes.title.trim();
    }
    if (changes.done !== undefined) {
      if (typeof changes.done !== 'boolean') {
        throw new Error('done must be a boolean');
      }
      task.done = changes.done;
    }
    return task;
  }

  delete(id) {
    const index = this.tasks.findIndex((t) => t.id === id);
    if (index === -1) return false;
    this.tasks.splice(index, 1);
    return true;
  }

  stats() {
    const total = this.tasks.length;
    const done = this.tasks.filter((t) => t.done).length;
    return {
      total,
      done,
      pending: total - done,
      completionRate: total === 0 ? 0 : Math.round((done / total) * 100),
    };
  }
}

module.exports = TaskStore;
