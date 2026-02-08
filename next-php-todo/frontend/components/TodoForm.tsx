'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import type { components } from '@/lib/schema';

type Todo = components['schemas']['Todo'];

export function TodoForm({ onCreated }: { onCreated: (todo: Todo) => void }) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setLoading(true);
    const { data, error } = await api.POST('/todos', {
      body: { title: trimmed },
    });
    setLoading(false);

    if (data) {
      setTitle('');
      onCreated(data);
    } else {
      console.error('Failed to create todo:', error);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        maxLength={200}
      />
      <button type="submit" disabled={loading || !title.trim()}>
        Add
      </button>
    </form>
  );
}
