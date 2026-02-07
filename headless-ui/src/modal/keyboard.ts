export interface KeyboardHandlerOptions {
  onEscape?: () => void;
}

export function attachKeyboardHandler(
  options: KeyboardHandlerOptions,
): () => void {
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && options.onEscape) {
      e.preventDefault();
      e.stopPropagation();
      options.onEscape();
    }
  }

  document.addEventListener('keydown', handleKeyDown);

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}
