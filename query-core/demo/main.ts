import { Query } from '@weikee/query-core';
import type { QueryState } from '@weikee/query-core';

// --- DOM refs ---

const staleTimeInput = document.getElementById('stale-time') as HTMLInputElement;
const delayInput = document.getElementById('delay') as HTMLInputElement;
const shouldFailInput = document.getElementById('should-fail') as HTMLInputElement;
const fetchBtn = document.getElementById('fetch-btn') as HTMLButtonElement;
const newBtn = document.getElementById('new-btn') as HTMLButtonElement;
const logEl = document.getElementById('log')!;

const sStatus = document.getElementById('s-status')!;
const sData = document.getElementById('s-data')!;
const sError = document.getElementById('s-error')!;
const sUpdated = document.getElementById('s-updated')!;
const sFresh = document.getElementById('s-fresh')!;

// --- Helpers ---

let fetchCount = 0;

function createQueryFn() {
  return () => {
    const delay = Number(delayInput.value) || 1000;
    const fail = shouldFailInput.checked;
    fetchCount++;
    const id = fetchCount;

    return new Promise<{ id: number; users: string[]; ts: string }>(
      (resolve, reject) => {
        setTimeout(() => {
          if (fail) {
            reject(new Error(`Fetch #${id} failed`));
          } else {
            resolve({
              id,
              users: ['Alice', 'Bob', 'Charlie'],
              ts: new Date().toLocaleTimeString(),
            });
          }
        }, delay);
      },
    );
  };
}

// --- State display ---

function renderState(state: QueryState) {
  sStatus.textContent = state.status;
  sStatus.className = `state-value badge badge-${state.status}`;
  sData.textContent =
    state.data !== undefined ? JSON.stringify(state.data) : 'undefined';
  sError.textContent =
    state.error !== undefined ? String(state.error) : 'undefined';
  sUpdated.textContent =
    state.dataUpdatedAt !== undefined
      ? new Date(state.dataUpdatedAt).toLocaleTimeString()
      : 'undefined';
  sFresh.textContent = String(state.isFresh);
  sFresh.className = `state-value ${state.isFresh ? 'fresh' : 'stale'}`;
}

// --- Transition log ---

let logCount = 0;

function logTransition(state: QueryState) {
  logCount++;
  const entry = document.createElement('div');
  entry.className = `log-entry log-${state.status}`;
  entry.innerHTML =
    `<span class="log-count">${logCount}</span>` +
    `<span class="log-status badge badge-${state.status}">${state.status}</span>` +
    `<span class="log-detail">${formatDetail(state)}</span>`;
  logEl.prepend(entry);

  if (logEl.children.length > 50) {
    logEl.lastElementChild?.remove();
  }
}

function formatDetail(state: QueryState): string {
  if (state.status === 'success' && state.data) {
    return `data=${JSON.stringify(state.data)} fresh=${state.isFresh}`;
  }
  if (state.status === 'error' && state.error) {
    return String(state.error);
  }
  return '';
}

// --- Init query ---

let unsub: (() => void) | null = null;
let query: Query;

function initQuery() {
  unsub?.();
  logEl.innerHTML = '';
  logCount = 0;
  fetchCount = 0;

  const staleTime = Number(staleTimeInput.value) || 0;

  query = new Query({
    queryFn: createQueryFn(),
    staleTime,
  });

  unsub = query.subscribe((state) => {
    renderState(state);
    logTransition(state);
  });
}

initQuery();

// --- Events ---

fetchBtn.addEventListener('click', () => {
  query.fetch().catch(() => {
    // error already handled via subscriber
  });
});

newBtn.addEventListener('click', () => {
  initQuery();
});
