export type KhatmaPlan = { id: "khatma-plan"; startedAt: string; startPage: number; days: number };

/** A suggested reading pace, not a claim about how much the user has completed. */
export function khatmaPace(plan: KhatmaPlan, today: Date) {
  const [year, month, day] = plan.startedAt.split("-").map(Number);
  const startUtc = Date.UTC(year, month - 1, day);
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const elapsed = Math.max(0, Math.floor((todayUtc - startUtc) / 86_400_000));
  const remainingPages = 605 - plan.startPage;
  const pagesPerDay = Math.ceil(remainingPages / plan.days);
  const targetPage = Math.min(604, plan.startPage - 1 + Math.ceil(remainingPages * Math.min(elapsed + 1, plan.days) / plan.days));
  return { pagesPerDay, targetPage, daysRemaining: Math.max(0, plan.days - elapsed - 1) };
}

export function localIsoDate(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}
