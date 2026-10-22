const TaskStore = require('../src/taskStore');

describe('TaskStore (unit tests)', () => {
  let store;

  beforeEach(() => {
    store = new TaskStore();
  });

  describe('create', () => {
    test('creates a task with default values', () => {
      const task = store.create('Learn Jest');
      expect(task).toMatchObject({ id: 1, title: 'Learn Jest', done: false });
      expect(task.createdAt).toBeDefined();
    });

    test('increments ids', () => {
      const a = store.create('A');
      const b = store.create('B');
      expect(b.id).toBe(a.id + 1);
    });

    test('trims the title', () => {
      expect(store.create('  spaced  ').title).toBe('spaced');
    });

    test.each([[''], ['   '], [undefined], [null], [42]])(
      'rejects invalid title: %p',
      (title) => {
        expect(() => store.create(title)).toThrow('Title is required');
      }
    );

    test('rejects a title longer than 100 characters', () => {
      expect(() => store.create('x'.repeat(101))).toThrow('100 characters');
    });
  });

  describe('getAll / getById', () => {
    beforeEach(() => {
      store.create('One');
      store.create('Two');
      store.update(2, { done: true });
    });

    test('returns all tasks', () => {
      expect(store.getAll()).toHaveLength(2);
    });

    test('filters by done status', () => {
      expect(store.getAll({ done: true })).toHaveLength(1);
      expect(store.getAll({ done: false })).toHaveLength(1);
    });

    test('returns a task by id', () => {
      expect(store.getById(1).title).toBe('One');
    });

    test('returns null for an unknown id', () => {
      expect(store.getById(999)).toBeNull();
    });
  });

  describe('update', () => {
    test('updates title and done', () => {
      store.create('Old');
      const updated = store.update(1, { title: 'New', done: true });
      expect(updated).toMatchObject({ title: 'New', done: true });
    });

    test('returns null for an unknown id', () => {
      expect(store.update(42, { done: true })).toBeNull();
    });

    test('rejects an invalid title', () => {
      store.create('Task');
      expect(() => store.update(1, { title: '' })).toThrow('Title is required');
    });

    test('rejects a non-boolean done value', () => {
      store.create('Task');
      expect(() => store.update(1, { done: 'yes' })).toThrow('boolean');
    });
  });

  describe('delete', () => {
    test('deletes an existing task', () => {
      store.create('Temp');
      expect(store.delete(1)).toBe(true);
      expect(store.getAll()).toHaveLength(0);
    });

    test('returns false for an unknown id', () => {
      expect(store.delete(5)).toBe(false);
    });
  });

  describe('stats', () => {
    test('returns zeros when empty', () => {
      expect(store.stats()).toEqual({
        total: 0,
        done: 0,
        pending: 0,
        completionRate: 0,
      });
    });

    test('computes the completion rate', () => {
      store.create('A');
      store.create('B');
      store.create('C');
      store.update(1, { done: true });
      expect(store.stats()).toEqual({
        total: 3,
        done: 1,
        pending: 2,
        completionRate: 33,
      });
    });
  });
});
