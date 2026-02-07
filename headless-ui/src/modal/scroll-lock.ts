let scrollLockCount = 0;
let originalOverflow = '';
let originalPaddingRight = '';

export function lockScroll(): void {
  if (scrollLockCount === 0) {
    originalOverflow = document.body.style.overflow;
    originalPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  scrollLockCount++;
}

export function unlockScroll(): void {
  scrollLockCount--;
  if (scrollLockCount <= 0) {
    scrollLockCount = 0;
    document.body.style.overflow = originalOverflow;
    document.body.style.paddingRight = originalPaddingRight;
  }
}
