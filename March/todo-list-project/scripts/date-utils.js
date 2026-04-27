import { appLanguage, t } from "./i18n.js";

export const DAY_IN_MS = 1000 * 60 * 60 * 24;
export const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];
export const DISPLAY_WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
export const REFERENCE_SUNDAY_UTC = Date.UTC(2024, 0, 7);

export const getCurrentDateStamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseDateStampUtc = (dateStamp) => {
  const [year, month, day] = dateStamp.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
};

export const isValidDateStamp = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export const normalizeDateStamp = (value, fallback = getCurrentDateStamp()) =>
  isValidDateStamp(value) ? value : fallback;

export const addDaysToDateStamp = (dateStamp, daysToAdd) => {
  const utc = parseDateStampUtc(dateStamp) + Math.floor(daysToAdd) * DAY_IN_MS;
  const date = new Date(utc);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
};

export const normalizePositiveInteger = (value, fallback = 1) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return Math.max(1, Math.floor(fallback));
  }

  return Math.floor(parsed);
};

export const normalizeOptionalPositiveInteger = (value) => {
  if (value === "" || value === null || typeof value === "undefined") {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return null;
  }

  return Math.floor(parsed);
};

export const normalizeWeekdayList = (value, fallback = ALL_WEEKDAYS) => {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  const normalized = [
    ...new Set(
      value
        .map((day) => Number(day))
        .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6),
    ),
  ].sort(
    (left, right) =>
      DISPLAY_WEEKDAY_ORDER.indexOf(left) -
      DISPLAY_WEEKDAY_ORDER.indexOf(right),
  );

  if (normalized.length === 0) {
    return [...fallback];
  }

  return normalized;
};

export const areWeekdayListsEqual = (left, right) => {
  const normalizedLeft = normalizeWeekdayList(left, []);
  const normalizedRight = normalizeWeekdayList(right, []);

  return (
    normalizedLeft.length === normalizedRight.length &&
    normalizedLeft.every((day, index) => day === normalizedRight[index])
  );
};

export const orderWeekdaysForDisplay = (weekdays) => {
  const daySet = new Set(normalizeWeekdayList(weekdays));
  return DISPLAY_WEEKDAY_ORDER.filter((day) => daySet.has(day));
};

export const getWeekdayLabel = (weekday) => {
  const date = new Date(REFERENCE_SUNDAY_UTC + weekday * DAY_IN_MS);
  const rawLabel = new Intl.DateTimeFormat(appLanguage, {
    weekday: "short",
    timeZone: "UTC",
  }).format(date);
  return rawLabel.replace(/\.$/, "");
};

export const formatWeekdaysLabel = (weekdays) => {
  const normalized = normalizeWeekdayList(weekdays);
  if (normalized.length === ALL_WEEKDAYS.length) {
    return t("everyDay");
  }

  const labels = orderWeekdaysForDisplay(normalized).map((day) =>
    getWeekdayLabel(day),
  );
  return t("onDays", { days: labels.join(", ") });
};

export const getDateStampWeekday = (dateStamp) => {
  const utc = parseDateStampUtc(dateStamp);
  return new Date(utc).getUTCDay();
};

export const daysBetweenDateStamps = (fromDateStamp, toDateStamp) => {
  const fromUtc = parseDateStampUtc(fromDateStamp);
  const toUtc = parseDateStampUtc(toDateStamp);
  return Math.floor((toUtc - fromUtc) / DAY_IN_MS);
};
