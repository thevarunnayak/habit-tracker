export function getTodayBit(date = new Date()) {
  // JS: 0=Sun ... 6=Sat
  const day = date.getDay();

  // Convert to our bitmask
  switch (day) {
    case 1: return 1;   // Mon
    case 2: return 2;   // Tue
    case 3: return 4;   // Wed
    case 4: return 8;   // Thu
    case 5: return 16;  // Fri
    case 6: return 32;  // Sat
    case 0: return 64;  // Sun
    default: return 0;
  }
}

export function isHabitSetActiveToday(
  activeDays: number,
  date = new Date()
) {
  const todayBit = getTodayBit(date);
  return (activeDays & todayBit) === todayBit;
}
