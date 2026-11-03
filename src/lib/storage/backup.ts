"use client";

import { STORE_NAMES, getAllRecords, putRecord, type StoreName } from "./indexed-db";

type Row = { id: string; [key: string]: unknown };
type Stores = Record<StoreName, Row[]>;
export type Backup = { version: 1; app: "dhu-al-jalal"; exportedAt: string; stores: Stores; preferences: Record<string, string> };

function isSafePath(value: unknown) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !/[\u0000-\u001f]/.test(value);
}

function isValidRecord(store: StoreName, input: unknown): input is Row {
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;
  const row = input as Row;
  if (typeof row.id !== "string" || row.id.length < 1 || row.id.length > 200) return false;
  if (store === "saved") return typeof row.title === "string" && isSafePath(row.href) && typeof row.type === "string";
  if (store === "history") return typeof row.title === "string" && isSafePath(row.href);
  if (store === "progress") return Number.isInteger(row.pageNumber) && Number(row.pageNumber) >= 1 && Number(row.pageNumber) <= 604;
  if (store === "reminders") return typeof row.label === "string" && row.label.length <= 80
    && typeof row.time === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(row.time)
    && Array.isArray(row.days) && row.days.every((day: unknown) => Number.isInteger(day) && Number(day) >= 0 && Number(day) <= 6);
  if (store === "adhkar-session") return typeof row.category === "string" && Array.isArray(row.completedItemIds);
  return true; // Future goals use a namespaced ID; they are plain local records.
}

export function parseBackup(text: string): Backup {
  if (text.length > 5_000_000) throw new Error("النسخة كبيرة جدًا");
  const value: unknown = JSON.parse(text);
  if (!value || typeof value !== "object") throw new Error("الملف غير صالح");
  const obj = value as Record<string, unknown>;
  if (obj.version !== 1 || obj.app !== "dhu-al-jalal") throw new Error("هذه ليست نسخة مدعومة من ذُو الجلال");
  const stores: Partial<Stores> = {};
  if (!obj.stores || typeof obj.stores !== "object") throw new Error("بيانات النسخة غير مكتملة");
  for (const name of STORE_NAMES) {
    const records = (obj.stores as Record<string, unknown>)[name];
    if (!Array.isArray(records) || records.length > 10_000 || !records.every((record) => isValidRecord(name, record))) {
      throw new Error(`بيانات ${name} غير صالحة`);
    }
    stores[name] = records as Row[];
  }
  const preferences: Record<string, string> = {};
  if (obj.preferences && typeof obj.preferences === "object" && !Array.isArray(obj.preferences)) {
    for (const [key, val] of Object.entries(obj.preferences)) {
      if (/^dhu-al-jalal:[a-z0-9:-]{1,90}$/.test(key) && typeof val === "string" && val.length < 20_000) preferences[key] = val;
    }
  }
  return { version: 1, app: "dhu-al-jalal", exportedAt: typeof obj.exportedAt === "string" ? obj.exportedAt : "", stores: stores as Stores, preferences };
}

export async function exportBackup() {
  const stores = {} as Stores;
  for (const name of STORE_NAMES) stores[name] = await getAllRecords<Row>(name);
  const preferences: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("dhu-al-jalal:")) preferences[key] = localStorage.getItem(key) ?? "";
  }
  const payload: Backup = { version: 1, app: "dhu-al-jalal", exportedAt: new Date().toISOString(), stores, preferences };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `dhu-al-jalal-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function restoreBackup(file: File) {
  if (file.size > 5_000_000) throw new Error("الملف أكبر من الحد المسموح");
  const backup = parseBackup(await file.text());
  let count = 0;
  // Validate the entire backup before applying any records.
  for (const name of STORE_NAMES) {
    for (const record of backup.stores[name]) { await putRecord(name, record); count++; }
  }
  for (const [key, val] of Object.entries(backup.preferences)) localStorage.setItem(key, val);
  return count;
}
