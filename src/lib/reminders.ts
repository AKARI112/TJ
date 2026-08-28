import type { Reminder } from "@/domain/personal";
export function sanitizeReminderLabel(value: string) { return value.replace(/[<>\u0000-\u001f]/g, "").trim().slice(0, 80); }
export function nextReminderOccurrence(reminder: Reminder, now = new Date()) {
  if (!reminder.enabled || reminder.days.length === 0) return null;
  const [hour, minute] = reminder.time.split(":").map(Number);
  for (let offset = 0; offset <= 7; offset++) { const candidate = new Date(now); candidate.setDate(now.getDate() + offset); candidate.setHours(hour, minute, 0, 0); if (reminder.days.includes(candidate.getDay()) && candidate > now) return candidate; }
  return null;
}
