import {
  ACTIVITY_LOG_STORAGE_KEY,
  CUSTOM_QUOTE_STORAGE_KEY,
  GOALS_STORAGE_KEY,
  LEGACY_TASKS_STORAGE_KEY,
  SCHEDULES_STORAGE_KEY,
  SHOW_FINISHED_TASKS_STORAGE_KEY,
  STATS_STORAGE_KEY,
  TASKS_STORAGE_KEY,
  THEME_STORAGE_KEY,
} from "./constants.js";

export const createStorageApi = ({
  state,
  createId,
  daysBetweenDateStamps,
  getDateStampWeekday,
  normalizeDateStamp,
  normalizeGoalColor,
  normalizeOptionalPositiveInteger,
  normalizePositiveInteger,
  normalizeScheduleType,
  normalizeWeekdayList,
  onPersist,
}) => {
  const getStoredTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === "dark" ? "dark" : "light";
  };

  const getStoredShowFinishedTasks = () => {
    const savedValue = localStorage.getItem(SHOW_FINISHED_TASKS_STORAGE_KEY);
    if (savedValue === "1") {
      return true;
    }

    return false;
  };

  const saveStateToStorage = () => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(state.tasks));
    localStorage.setItem(
      SCHEDULES_STORAGE_KEY,
      JSON.stringify(state.schedules),
    );
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(state.goals));
    localStorage.setItem(
      ACTIVITY_LOG_STORAGE_KEY,
      JSON.stringify(state.activityLog.slice(0, 600)),
    );
    localStorage.setItem("todo-last-sync-date-v1", state.lastSyncDate || "");
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(state.stats));
    if (state.customQuote) {
      localStorage.setItem(CUSTOM_QUOTE_STORAGE_KEY, state.customQuote);
    } else {
      localStorage.removeItem(CUSTOM_QUOTE_STORAGE_KEY);
    }
    localStorage.setItem(
      SHOW_FINISHED_TASKS_STORAGE_KEY,
      state.showFinishedTasks ? "1" : "0",
    );

    if (typeof onPersist === "function") {
      onPersist();
    }
  };

  const loadStoredTasks = () => {
    const rawTasksV2 = localStorage.getItem(TASKS_STORAGE_KEY);
    if (rawTasksV2) {
      try {
        const parsed = JSON.parse(rawTasksV2);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((task) => task && typeof task.text === "string")
            .map((task) => ({
              id: typeof task.id === "string" ? task.id : createId("task"),
              text: task.text.trim() || "Untitled task",
              done: Boolean(task.done),
              isScheduled: Boolean(task.isScheduled),
              scheduleId:
                typeof task.scheduleId === "string" ? task.scheduleId : null,
              createdForDate:
                typeof task.createdForDate === "string"
                  ? task.createdForDate
                  : null,
            }));
        }
      } catch {
        return [];
      }
    }

    const rawLegacyTasks = localStorage.getItem(LEGACY_TASKS_STORAGE_KEY);
    if (!rawLegacyTasks) {
      return [];
    }

    try {
      const parsedLegacy = JSON.parse(rawLegacyTasks);
      if (!Array.isArray(parsedLegacy)) {
        return [];
      }

      return parsedLegacy
        .filter((task) => task && typeof task.text === "string")
        .map((task) => ({
          id: createId("task"),
          text: task.text.trim() || "Untitled task",
          done: Boolean(task.done),
          isScheduled: false,
          scheduleId: null,
          createdForDate: null,
        }));
    } catch {
      return [];
    }
  };

  const loadStoredSchedules = () => {
    const rawSchedules = localStorage.getItem(SCHEDULES_STORAGE_KEY);
    if (!rawSchedules) {
      return [];
    }

    try {
      const parsed = JSON.parse(rawSchedules);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter((schedule) => schedule && typeof schedule.text === "string")
        .map((schedule) => {
          const startDate = normalizeDateStamp(schedule.startDate);
          const type = normalizeScheduleType(schedule.type);
          return {
            id:
              typeof schedule.id === "string"
                ? schedule.id
                : createId("schedule"),
            text: schedule.text.trim() || "Untitled scheduled task",
            type,
            goalId:
              typeof schedule.goalId === "string" ? schedule.goalId : null,
            startDate,
            intervalDays: normalizePositiveInteger(schedule.intervalDays, 1),
            weekdays:
              type === "one-time"
                ? [getDateStampWeekday(startDate)]
                : normalizeWeekdayList(schedule.weekdays),
            createdAt:
              typeof schedule.createdAt === "number"
                ? schedule.createdAt
                : Date.now(),
          };
        });
    } catch {
      return [];
    }
  };

  const loadStoredGoals = () => {
    const rawGoals = localStorage.getItem(GOALS_STORAGE_KEY);
    if (!rawGoals) {
      return [];
    }

    try {
      const parsed = JSON.parse(rawGoals);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter((goal) => goal && typeof goal.title === "string")
        .map((goal) => {
          const startDate = normalizeDateStamp(goal.startDate);
          const isPeriodGoal = goal.type === "period";
          const durationDays = goal.durationDays
            ? normalizePositiveInteger(goal.durationDays, 1)
            : isPeriodGoal && typeof goal.endDate === "string"
              ? Math.max(1, daysBetweenDateStamps(startDate, goal.endDate) + 1)
              : null;
          return {
            id: typeof goal.id === "string" ? goal.id : createId("goal"),
            title: goal.title.trim() || "Untitled goal",
            type: isPeriodGoal ? "period" : "habit",
            color: normalizeGoalColor(goal.color),
            startDate,
            weekdays: normalizeWeekdayList(goal.weekdays),
            endDate: isPeriodGoal && !goal.cycleDays ? goal.endDate : null,
            durationDays,
            intervalDays: normalizePositiveInteger(goal.intervalDays, 1),
            cycleDays: normalizeOptionalPositiveInteger(goal.cycleDays),
            finishedAt:
              typeof goal.finishedAt === "string" ? goal.finishedAt : null,
            createdAt:
              typeof goal.createdAt === "number" ? goal.createdAt : Date.now(),
          };
        });
    } catch {
      return [];
    }
  };

  const loadStoredStats = () => {
    const rawStats = localStorage.getItem(STATS_STORAGE_KEY);
    if (!rawStats) {
      return { dailyCompletions: {}, goalDailyCompletions: {} };
    }

    try {
      const parsed = JSON.parse(rawStats);
      if (!parsed || typeof parsed !== "object") {
        return { dailyCompletions: {}, goalDailyCompletions: {} };
      }

      const dailyCompletions = parsed.dailyCompletions;
      if (!dailyCompletions || typeof dailyCompletions !== "object") {
        return { dailyCompletions: {}, goalDailyCompletions: {} };
      }

      const normalized = {};
      Object.entries(dailyCompletions).forEach(([dateStamp, count]) => {
        const numericCount = Number(count);
        if (!Number.isNaN(numericCount) && numericCount > 0) {
          normalized[dateStamp] = Math.floor(numericCount);
        }
      });

      const goalDailyCompletions = {};
      if (
        parsed.goalDailyCompletions &&
        typeof parsed.goalDailyCompletions === "object"
      ) {
        Object.entries(parsed.goalDailyCompletions).forEach(
          ([goalId, dailyMap]) => {
            if (!dailyMap || typeof dailyMap !== "object") {
              return;
            }

            const normalizedGoalMap = {};
            Object.entries(dailyMap).forEach(([dateStamp, count]) => {
              const numericCount = Number(count);
              if (!Number.isNaN(numericCount) && numericCount > 0) {
                normalizedGoalMap[dateStamp] = Math.floor(numericCount);
              }
            });

            if (Object.keys(normalizedGoalMap).length > 0) {
              goalDailyCompletions[goalId] = normalizedGoalMap;
            }
          },
        );
      }

      return { dailyCompletions: normalized, goalDailyCompletions };
    } catch {
      return { dailyCompletions: {}, goalDailyCompletions: {} };
    }
  };

  const loadStoredCustomQuote = () => {
    const rawQuote = localStorage.getItem(CUSTOM_QUOTE_STORAGE_KEY);
    if (!rawQuote || typeof rawQuote !== "string") {
      return "";
    }

    return rawQuote.trim().slice(0, 180);
  };

  const loadStoredActivityLog = () => {
    const rawLog = localStorage.getItem(ACTIVITY_LOG_STORAGE_KEY);
    if (!rawLog) {
      return [];
    }

    try {
      const parsed = JSON.parse(rawLog);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter((entry) => entry && typeof entry.text === "string")
        .map((entry) => ({
          id: typeof entry.id === "string" ? entry.id : createId("activity"),
          sourceTaskId:
            typeof entry.sourceTaskId === "string" ? entry.sourceTaskId : null,
          text: entry.text.trim() || "Untitled task",
          date: normalizeDateStamp(entry.date),
          goalId: typeof entry.goalId === "string" ? entry.goalId : null,
          scheduleId:
            typeof entry.scheduleId === "string" ? entry.scheduleId : null,
          type:
            entry.type === "one-time"
              ? "one-time"
              : entry.type === "recurring"
                ? "recurring"
                : "manual",
          completedAt:
            typeof entry.completedAt === "number"
              ? entry.completedAt
              : Date.now(),
        }))
        .sort((left, right) => right.completedAt - left.completedAt)
        .slice(0, 600);
    } catch {
      return [];
    }
  };

  return {
    getStoredShowFinishedTasks,
    getStoredTheme,
    loadStoredActivityLog,
    loadStoredCustomQuote,
    loadStoredGoals,
    loadStoredSchedules,
    loadStoredStats,
    loadStoredTasks,
    saveStateToStorage,
  };
};
