export interface WorkdaySettings {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

const DEFAULT_SETTINGS: WorkdaySettings = {
  startHour: 9,
  startMinute: 0,
  endHour: 16,
  endMinute: 0,
};

const STORAGE_KEY = "workdaySettings";

export function getWorkdaySettings(): WorkdaySettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // 유효성 검사
      if (
        typeof parsed.startHour === "number" &&
        typeof parsed.startMinute === "number" &&
        typeof parsed.endHour === "number" &&
        typeof parsed.endMinute === "number" &&
        parsed.startHour >= 0 &&
        parsed.startHour < 24 &&
        parsed.startMinute >= 0 &&
        parsed.startMinute < 60 &&
        parsed.endHour >= 0 &&
        parsed.endHour < 24 &&
        parsed.endMinute >= 0 &&
        parsed.endMinute < 60
      ) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to load workday settings:", error);
  }
  return DEFAULT_SETTINGS;
}

export function saveWorkdaySettings(settings: WorkdaySettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save workday settings:", error);
  }
}

