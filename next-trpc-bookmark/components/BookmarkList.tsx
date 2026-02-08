'use client';

import { trpc } from '@/lib/trpc-client';

export function BookmarkList() {
  const { data: bookmarks, isLoading, error } = trpc.bookmark.list.useQuery();
  const utils = trpc.useUtils();

  const deleteMutation = trpc.bookmark.delete.useMutation({
    onSuccess: () => {
      utils.bookmark.list.invalidate();
    },
  });

  if (isLoading) {
    return <p className="loading">Loading bookmarks...</p>;
  }

  if (error) {
    return <p className="error-msg">{error.message}</p>;
  }

  if (!bookmarks || bookmarks.length === 0) {
    return (
      <div className="empty-state">
        <p>No bookmarks yet. Add your first one above.</p>
      </div>
    );
  }

  return (
    <div className="bookmark-list">
      <h2>Bookmarks ({bookmarks.length})</h2>
      {bookmarks.map((bookmark) => (
        <div key={bookmark.id} className="bookmark-item">
          <div className="bookmark-info">
            <div className="bookmark-title">
              <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                {bookmark.title}
              </a>
            </div>
            <div className="bookmark-url">{bookmark.url}</div>
            {bookmark.description && (
              <div className="bookmark-desc">{bookmark.description}</div>
            )}
            <div className="bookmark-date">
              {new Date(bookmark.created_at).toLocaleDateString()}
            </div>
          </div>
          <button
            className="btn btn-danger"
            onClick={() => deleteMutation.mutate({ id: bookmark.id })}
            disabled={deleteMutation.isPending}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
