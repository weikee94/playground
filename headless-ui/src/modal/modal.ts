import type { ModalOptions, ModalInstance } from '../types';
import { setAriaAttributes, removeAriaAttributes } from './aria';
import { lockScroll, unlockScroll } from './scroll-lock';
import { trapFocus } from './focus-trap';
import { attachKeyboardHandler } from './keyboard';

export function createModal(options: ModalOptions): ModalInstance {
  let isOpen = false;
  let focusTrapCleanup: (() => void) | null = null;
  let keyboardCleanup: (() => void) | null = null;

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === options.backdrop) {
      close();
    }
  }

  function open() {
    if (isOpen) return;
    isOpen = true;

    setAriaAttributes(options.content, options);
    lockScroll();
    options.onOpen?.();
    focusTrapCleanup = trapFocus(options.content);
    keyboardCleanup = attachKeyboardHandler({
      onEscape: () => {
        if (options.closeOnEscape !== false) close();
      },
    });

    if (options.backdrop && options.closeOnBackdropClick !== false) {
      options.backdrop.addEventListener('click', handleBackdropClick);
    }
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;

    removeAriaAttributes(options.content);
    unlockScroll();

    focusTrapCleanup?.();
    focusTrapCleanup = null;

    keyboardCleanup?.();
    keyboardCleanup = null;

    if (options.backdrop) {
      options.backdrop.removeEventListener('click', handleBackdropClick);
    }

    options.onClose();
    options.trigger.focus();
  }

  function destroy() {
    if (isOpen) close();
  }

  return {
    open,
    close,
    destroy,
    get isOpen() {
      return isOpen;
    },
  };
}
