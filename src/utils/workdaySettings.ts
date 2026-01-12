export interface WorkdaySettings {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  workdays: {
    monday: boolean;    // 1
    tuesday: boolean;   // 2
    wednesday: boolean; // 3
    thursday: boolean;  // 4
    friday: boolean;   // 5
    saturday: boolean;  // 6
    sunday: boolean;    // 0
  };
  visibleCards?: Record<string, boolean>;
}

const DEFAULT_SETTINGS: WorkdaySettings = {
  startHour: 9,
  startMinute: 0,
  endHour: 16,
  endMinute: 0,
  workdays: {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  },
  visibleCards: {
    hour: true,
    day: true,
    workday: true,
    week: true,
    workweek: true,
    month: true,
    year: true,
    decade: true,
    century: true,
    millenium: true,
  },
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
        // 요일 설정이 없거나 불완전하면 기본값으로 채움
        if (!parsed.workdays || typeof parsed.workdays !== "object") {
          parsed.workdays = { ...DEFAULT_SETTINGS.workdays };
        } else {
          // 각 요일이 없으면 기본값으로 채움
          const workdays = { ...DEFAULT_SETTINGS.workdays };
          Object.keys(workdays).forEach((key) => {
            if (typeof parsed.workdays[key] !== "boolean") {
              parsed.workdays[key] = workdays[key as keyof typeof workdays];
            } else {
              workdays[key as keyof typeof workdays] = parsed.workdays[key];
            }
          });
          parsed.workdays = workdays;
        }

        // visibleCards 설정이 없거나 불완전하면 기본값으로 채움
        if (!parsed.visibleCards || typeof parsed.visibleCards !== "object") {
          parsed.visibleCards = { ...DEFAULT_SETTINGS.visibleCards };
        } else {
          // 각 카드가 없으면 기본값으로 채움
          const visibleCards = { ...DEFAULT_SETTINGS.visibleCards };
          if (DEFAULT_SETTINGS.visibleCards) {
            Object.keys(DEFAULT_SETTINGS.visibleCards).forEach((key) => {
              if (typeof parsed.visibleCards![key] !== "boolean") {
                parsed.visibleCards![key] = visibleCards[key];
              } else {
                visibleCards[key] = parsed.visibleCards![key];
              }
            });
          }
          parsed.visibleCards = visibleCards;
        }

        return parsed as WorkdaySettings;
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

