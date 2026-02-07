import { createModal } from '@weikee/headless-ui';

const trigger = document.getElementById('open-btn')!;
const content = document.getElementById('modal-panel')!;
const backdrop = document.getElementById('modal-backdrop')!;
const closeBtn = document.getElementById('close-btn')!;

const modal = createModal({
  trigger,
  content,
  backdrop,
  labelledBy: 'modal-title',
  describedBy: 'modal-desc',
  onOpen: () => {
    content.classList.remove('hidden');
    backdrop.classList.remove('hidden');
  },
  onClose: () => {
    content.classList.add('hidden');
    backdrop.classList.add('hidden');
  },
});

trigger.addEventListener('click', () => modal.open());
closeBtn.addEventListener('click', () => modal.close());
