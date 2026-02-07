export function setAriaAttributes(
  content: HTMLElement,
  options: { labelledBy?: string; describedBy?: string },
): void {
  content.setAttribute('role', 'dialog');
  content.setAttribute('aria-modal', 'true');

  if (options.labelledBy) {
    content.setAttribute('aria-labelledby', options.labelledBy);
  }
  if (options.describedBy) {
    content.setAttribute('aria-describedby', options.describedBy);
  }
}

export function removeAriaAttributes(content: HTMLElement): void {
  content.removeAttribute('role');
  content.removeAttribute('aria-modal');
  content.removeAttribute('aria-labelledby');
  content.removeAttribute('aria-describedby');
}
