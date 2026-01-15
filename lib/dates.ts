// lib/dates.ts

const IST_TZ = "Asia/Kolkata";

/**
 * ✅ Returns the IST calendar day's start (00:00 IST),
 * but stored as a UTC Date object (so Prisma can store it in DateTime).
 */
export function getISTDayStart(date: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);

  // Construct IST midnight but expressed in UTC timestamp
  // IST midnight = UTC midnight - 5:30
  const utc = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  utc.setMinutes(utc.getMinutes() - 330);

  return utc;
}

export function isSameISTDay(a: Date, b: Date) {
  return getISTDayStart(a).getTime() === getISTDayStart(b).getTime();
}
