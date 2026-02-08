'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc-client';

export function BookmarkForm() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  const utils = trpc.useUtils();
  const createMutation = trpc.bookmark.create.useMutation({
    onSuccess: () => {
      utils.bookmark.list.invalidate();
      setTitle('');
      setUrl('');
      setDescription('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      title,
      url,
      description: description || undefined,
    });
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2>Add Bookmark</h2>

      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My Bookmark"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="url">URL</label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="desc">Description (optional)</label>
        <input
          id="desc"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A short note..."
        />
      </div>

      {createMutation.error && (
        <p className="field-error">{createMutation.error.message}</p>
      )}

      <button
        type="submit"
        className="btn btn-primary"
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? 'Adding...' : 'Add Bookmark'}
      </button>
    </form>
  );
}
