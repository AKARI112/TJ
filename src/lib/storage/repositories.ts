"use client";

import type { AdhkarSession, HistoryItem, ReadingMarker, ReadingProgress, Reminder, SavedItem } from "@/domain/personal";
import { clearStore, deleteRecord, getAllRecords, getRecord, putRecord } from "@/lib/storage/indexed-db";

export const STORAGE_CHANGED_EVENT = "dhu-al-jalal:storage-changed";

function notify(store: string) {
  window.dispatchEvent(new CustomEvent(STORAGE_CHANGED_EVENT, { detail: { store } }));
}

export const savedRepository = {
  list: async () => (await getAllRecords<SavedItem>("saved")).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  get: (id: string) => getRecord<SavedItem>("saved", id),
  async save(item: SavedItem) { await putRecord("saved", item); notify("saved"); },
  async remove(id: string) { await deleteRecord("saved", id); notify("saved"); },
  async clear() { await clearStore("saved"); notify("saved"); },
};

export const progressRepository = {
  current: () => getRecord<ReadingProgress>("progress", "quran-current"),
  marker: () => getRecord<ReadingMarker>("progress", "quran-marker"),
  async save(progress: ReadingProgress | ReadingMarker) { await putRecord("progress", progress); notify("progress"); },
};

export const historyRepository = {
  list: async () => (await getAllRecords<HistoryItem>("history")).sort((a, b) => b.viewedAt.localeCompare(a.viewedAt)),
  async record(item: HistoryItem) { await putRecord("history", item); notify("history"); },
  async remove(id: string) { await deleteRecord("history", id); notify("history"); },
  async clear() { await clearStore("history"); notify("history"); },
};

export const reminderRepository = {
  list: async () => (await getAllRecords<Reminder>("reminders")).sort((a, b) => a.time.localeCompare(b.time)),
  async save(item: Reminder) { await putRecord("reminders", item); notify("reminders"); },
  async remove(id: string) { await deleteRecord("reminders", id); notify("reminders"); },
  async clear() { await clearStore("reminders"); notify("reminders"); },
};

export const adhkarSessionRepository = {
  get: (category: string) => getRecord<AdhkarSession>("adhkar-session", `adhkar:${category}`),
  async save(item: AdhkarSession) { await putRecord("adhkar-session", item); notify("adhkar-session"); },
  async clear(category: string) { await deleteRecord("adhkar-session", `adhkar:${category}`); notify("adhkar-session"); },
};
