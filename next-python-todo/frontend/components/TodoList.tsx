'use client';

import { api } from '@/lib/api';
import type { components } from '@/lib/schema';

type Todo = components['schemas']['TodoOut'];

export function TodoList({
  todos,
  onUpdate,
  onDelete,
}: {
  todos: Todo[];
  onUpdate: (todo: Todo) => void;
  onDelete: (id: string) => void;
}) {
  async function handleToggle(id: string) {
    const { data } = await api.PATCH('/todos/{id}', {
      params: { path: { id } },
    });
    if (data) onUpdate(data);
  }

  async function handleDelete(id: string) {
    const { data } = await api.DELETE('/todos/{id}', {
      params: { path: { id } },
    });
    if (data) onDelete(id);
  }

  if (todos.length === 0) {
    return <p className="empty">No todos yet. Add one above!</p>;
  }

  return (
    <ul className="list">
      {todos.map((todo) => (
        <li key={todo.id} className={`item ${todo.completed ? 'completed' : ''}`}>
          <span className="title" onClick={() => handleToggle(todo.id)}>
            {todo.title}
          </span>
          <button className="delete" onClick={() => handleDelete(todo.id)}>
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}
