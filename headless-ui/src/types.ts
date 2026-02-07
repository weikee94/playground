export interface ModalOptions {
  /** The trigger element that opens the modal (for focus restoration) */
  trigger: HTMLElement;
  /** The modal container element (the dialog panel) */
  content: HTMLElement;
  /** Optional backdrop element. If provided, clicking it closes the modal */
  backdrop?: HTMLElement;
  /** Called when the modal requests to close */
  onClose: () => void;
  /** Called when the modal opens */
  onOpen?: () => void;
  /** Whether clicking the backdrop closes the modal. Default: true */
  closeOnBackdropClick?: boolean;
  /** Whether pressing Escape closes the modal. Default: true */
  closeOnEscape?: boolean;
  /** ID of the element that labels the modal (for aria-labelledby) */
  labelledBy?: string;
  /** ID of the element that describes the modal (for aria-describedby) */
  describedBy?: string;
}

export interface ModalInstance {
  open(): void;
  close(): void;
  destroy(): void;
  readonly isOpen: boolean;
}
