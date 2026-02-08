'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { TodoForm } from '@/components/TodoForm';
import { TodoList } from '@/components/TodoList';
import type { components } from '@/lib/schema';

type Todo = components['schemas']['TodoOut'];

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    api.GET('/todos').then(({ data }) => {
      if (data) setTodos(data);
    });
  }, []);

  function handleCreated(todo: Todo) {
    setTodos((prev) => [todo, ...prev]);
  }

  function handleUpdate(updated: Todo) {
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  function handleDelete(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="container">
      <h1>Python Todo</h1>
      <TodoForm onCreated={handleCreated} />
      <TodoList todos={todos} onUpdate={handleUpdate} onDelete={handleDelete} />
    </div>
  );
}
