import type { ModelConfig, DataRecord } from './types';

export class StorageAdapter {
  private key: string;

  constructor(model: ModelConfig) {
    this.key = model.storage.key;
  }

  list(): DataRecord[] {
    const raw = localStorage.getItem(this.key);
    return raw ? JSON.parse(raw) : [];
  }

  create(item: Omit<DataRecord, 'id' | 'createdAt'>): DataRecord {
    const items = this.list();
    const newItem: DataRecord = {
      ...item,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    items.push(newItem);
    localStorage.setItem(this.key, JSON.stringify(items));
    return newItem;
  }

  update(id: number, updates: Partial<DataRecord>): DataRecord {
    const items = this.list();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Item not found');
    items[idx] = { ...items[idx], ...updates };
    localStorage.setItem(this.key, JSON.stringify(items));
    return items[idx];
  }

  delete(id: number): void {
    const items = this.list().filter((i) => i.id !== id);
    localStorage.setItem(this.key, JSON.stringify(items));
  }

  filter(conditions: Record<string, string>): DataRecord[] {
    return this.list().filter((item) =>
      Object.entries(conditions).every(
        ([key, value]) => !value || item[key] === value,
      ),
    );
  }
}
