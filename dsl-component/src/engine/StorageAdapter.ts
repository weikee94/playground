import type { DataRecord, FormSchema } from './types';

export class StorageAdapter {
  private key: string;

  constructor(schema: FormSchema) {
    this.key = schema.storage.key;
  }

  list(): DataRecord[] {
    const raw = localStorage.getItem(this.key);
    return raw ? JSON.parse(raw) : [];
  }

  getById(id: number): DataRecord | undefined {
    return this.list().find((i) => i.id === id);
  }

  create(item: Omit<DataRecord, 'id' | 'createdAt' | 'updatedAt'>): DataRecord {
    const items = this.list();
    const now = new Date().toISOString();
    const newItem: DataRecord = {
      ...item,
      id: Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    items.push(newItem);
    localStorage.setItem(this.key, JSON.stringify(items));
    return newItem;
  }

  update(id: number, updates: Partial<DataRecord>): DataRecord {
    const items = this.list();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Item not found');
    items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(this.key, JSON.stringify(items));
    return items[idx];
  }

  delete(id: number): void {
    const items = this.list().filter((i) => i.id !== id);
    localStorage.setItem(this.key, JSON.stringify(items));
  }
}
