import { createForm } from '@weikee/form-core';

const form = createForm({
  initialValues: {
    name: '',
    email: '',
    message: '',
  },
});

// --- Wire inputs to proxy ---

const inputs = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
  '[data-field]',
);

inputs.forEach((input) => {
  const field = input.dataset.field!;

  // Input → proxy
  input.addEventListener('input', () => {
    form.values[field] = input.value;
  });

  // Proxy → input (for reset)
  form.subscribe(field, (value) => {
    input.value = value as string;
  });
});

// --- Subscription log ---

const logEl = document.getElementById('log')!;
let logCount = 0;

form.subscribeAll((value, field) => {
  logCount++;
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  entry.innerHTML =
    `<span class="log-count">${logCount}</span>` +
    `<span class="log-field">${String(field)}</span>` +
    `<span class="log-value">"${String(value)}"</span>`;

  logEl.prepend(entry);

  // Keep log manageable
  if (logEl.children.length > 50) {
    logEl.lastElementChild?.remove();
  }
});

// --- Reset button ---

document.getElementById('reset-btn')!.addEventListener('click', () => {
  form.reset();
  logEl.innerHTML = '';
  logCount = 0;
  document.getElementById('snapshot-section')!.classList.add('hidden');
});

// --- Snapshot button ---

document.getElementById('snapshot-btn')!.addEventListener('click', () => {
  const section = document.getElementById('snapshot-section')!;
  const pre = document.getElementById('snapshot')!;
  section.classList.remove('hidden');
  pre.textContent = JSON.stringify(form.getValues(), null, 2);
});
