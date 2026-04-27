import { appLanguage, formatDisplayDate, getLocalizedList, t } from "./i18n.js";
import { createRenderers } from "./renderers.js";
import { createStorageApi } from "./storage.js";
import {
  ACTIVITY_LOG_STORAGE_KEY,
  baseGoals,
  CURRENT_PERIOD_CHART_COLOR,
  CUSTOM_QUOTE_STORAGE_KEY,
  DRAG_SCROLL_EDGE_PX,
  DRAG_SCROLL_MAX_STEP,
  GOALS_STORAGE_KEY,
  GOAL_PALETTE,
  LAST_SYNC_DATE_STORAGE_KEY,
  LEGACY_TASKS_STORAGE_KEY,
  MODAL_TRANSITION_MS,
  MONTH_CHART_COLORS,
  PANEL_TRANSITION_MS,
  SCHEDULES_STORAGE_KEY,
  SHOW_FINISHED_TASKS_STORAGE_KEY,
  STATS_STORAGE_KEY,
  TASKS_STORAGE_KEY,
  THEME_STORAGE_KEY,
  TOUCH_DRAG_HOLD_MS,
  TOUCH_MOVE_CANCEL_PX,
  WEEKDAY_CHART_COLORS,
} from "./constants.js";
import {
  appSubtitle,
  backProjectsButton,
  badgeListElement,
  bestStreakElement,
  cancelClearAllButton,
  cancelDeleteButton,
  cancelProgressQuoteButton,
  cancelRemoveGoalButton,
  checkedCountElement,
  clearAllButton,
  clearAllModal,
  clearProgressQuoteButton,
  closeProgressButton,
  closeScheduleButton,
  confirmClearAllButton,
  confirmDeleteButton,
  confirmRemoveGoalButton,
  congratsMessage,
  currentStreakElement,
  deleteModal,
  deleteModalMessage,
  deleteModalTitle,
  editProgressQuoteButton,
  finishedGoalsList,
  finishedGoalsPanel,
  goalColorInput,
  goalDurationInput,
  goalForm,
  goalIntervalInput,
  goalList,
  goalProgressList,
  goalStartDateInput,
  goalTitleInput,
  goalTypeSelect,
  goalWeekdayPicker,
  installAppButton,
  monthChart,
  openProgressButton,
  openScheduleButton,
  progressModal,
  progressQuoteCard,
  progressQuoteDisplay,
  progressQuoteEditor,
  progressQuoteInput,
  removeGoalModal,
  rewardProgressBarElement,
  saveProgressQuoteButton,
  scheduleForm,
  scheduleGoalSelect,
  scheduleInput,
  scheduleIntervalField,
  scheduleIntervalInput,
  scheduleList,
  scheduleModal,
  scheduleStartDateInput,
  scheduleTypeSelect,
  scheduleWeekdayPicker,
  scheduleWeekdaysField,
  streakMessageElement,
  taskForm,
  taskInput,
  themeToggleButton,
  todoList,
  toggleFinishedGoalsButton,
  toggleFinishedTasksButton,
  weekChart,
  yearChartLabel,
} from "./dom.js";
import {
  addDaysToDateStamp,
  ALL_WEEKDAYS,
  areWeekdayListsEqual,
  DAY_IN_MS,
  daysBetweenDateStamps,
  formatWeekdaysLabel,
  getCurrentDateStamp,
  getDateStampWeekday,
  getWeekdayLabel,
  normalizeDateStamp,
  normalizeOptionalPositiveInteger,
  normalizePositiveInteger,
  normalizeWeekdayList,
  parseDateStampUtc,
} from "./date-utils.js";

("use strict");

const getTaskWord = (count) => (count === 1 ? t("task") : t("tasks"));
const getDayWord = (count) => (count === 1 ? t("day") : t("days"));

const state = {
  tasks: [],
  schedules: [],
  goals: [],
  stats: {
    dailyCompletions: {},
    goalDailyCompletions: {},
  },
  customQuote: "",
  showFinishedTasks: false,
  activityLog: [],
};

let pendingDeleteTaskId = null;
let pendingDeleteScheduleId = null;
let pendingRemoveGoalId = null;
let deferredInstallPrompt = null;
let draggedTaskId = null;
let dropInsertIndex = null;
let lastDragPointerY = null;
let activeDragScrollFrame = null;
let touchDragActivationTimer = null;
let touchCandidateTaskId = null;
let touchStartX = 0;
let touchStartY = 0;
let touchDidMove = false;
let isTouchDragging = false;
let isTouchReorderMode = false;
let suppressClickUntil = 0;
let toastTimer = null;

const syncFinishedTasksToggleButton = () => {
  if (!toggleFinishedTasksButton) {
    return;
  }

  const label = state.showFinishedTasks
    ? t("hideFinishedTasks")
    : t("showFinishedTasks");
  const icon = toggleFinishedTasksButton.querySelector("i");

  if (icon) {
    icon.className = state.showFinishedTasks
      ? "fa-solid fa-eye-slash"
      : "fa-solid fa-eye";
    icon.setAttribute("aria-hidden", "true");
  } else {
    toggleFinishedTasksButton.innerHTML = `<i class="fa-solid ${state.showFinishedTasks ? "fa-eye-slash" : "fa-eye"}" aria-hidden="true"></i>`;
  }

  toggleFinishedTasksButton.setAttribute("aria-label", label);
  toggleFinishedTasksButton.setAttribute("title", label);
  toggleFinishedTasksButton.setAttribute(
    "aria-pressed",
    String(state.showFinishedTasks),
  );
};

const applyTheme = (theme) => {
  const normalizedTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = normalizedTheme;
  document.body.classList.toggle("is-dark", normalizedTheme === "dark");
  localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);

  if (themeToggleButton) {
    const nextThemeLabel =
      normalizedTheme === "dark" ? t("themeLight") : t("themeDark");
    const nextThemeAction =
      normalizedTheme === "dark"
        ? t("switchToLightMode")
        : t("switchToDarkMode");
    themeToggleButton.textContent = nextThemeLabel;
    themeToggleButton.setAttribute("aria-label", nextThemeAction);
    themeToggleButton.title = nextThemeAction;
  }
};

const applyStaticTranslations = () => {
  syncFinishedTasksToggleButton();
};

const openModalOverlay = (modal, bodyClassName = "is-modal-open") => {
  if (!modal) {
    return;
  }

  modal.hidden = false;
  modal.removeAttribute("inert");
  modal.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => {
    modal.classList.add("is-open");
    document.body.classList.add(bodyClassName);
  });
};

const closeModalOverlay = (modal, bodyClassName = "is-modal-open") => {
  if (!modal) {
    return;
  }

  if (
    document.activeElement instanceof HTMLElement &&
    modal.contains(document.activeElement)
  ) {
    document.activeElement.blur();
  }

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  modal.setAttribute("inert", "");
  document.body.classList.remove(bodyClassName);
  window.setTimeout(() => {
    modal.hidden = true;
  }, MODAL_TRANSITION_MS);
};

const openCollapsiblePanel = (panel) => {
  if (!panel) {
    return;
  }

  panel.hidden = false;
  requestAnimationFrame(() => panel.classList.add("is-open"));
};

const closeCollapsiblePanel = (panel) => {
  if (!panel) {
    return;
  }

  panel.classList.remove("is-open");
  window.setTimeout(() => {
    if (!panel.classList.contains("is-open")) {
      panel.hidden = true;
    }
  }, PANEL_TRANSITION_MS);
};

const toggleTheme = () => {
  const currentTheme =
    document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  applyTheme(currentTheme === "dark" ? "light" : "dark");
};

const updateInstallButtonState = () => {
  if (!installAppButton) {
    return;
  }

  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  installAppButton.hidden = isStandalone || !deferredInstallPrompt;
};

const getTaskTextElement = (taskItem) =>
  taskItem?.querySelector(".todo-item-text") || null;

const getSaveButton = (taskItem) =>
  taskItem?.querySelector(".todo-save-btn") || null;

const getEditButton = (taskItem) =>
  taskItem?.querySelector(".todo-edit-btn") || null;

const cancelTouchDragActivation = () => {
  if (touchDragActivationTimer) {
    clearTimeout(touchDragActivationTimer);
    touchDragActivationTimer = null;
  }

  touchCandidateTaskId = null;
};

const stopDragAutoScroll = () => {
  if (activeDragScrollFrame) {
    cancelAnimationFrame(activeDragScrollFrame);
    activeDragScrollFrame = null;
  }
};

const runDragAutoScroll = () => {
  if (!draggedTaskId || typeof lastDragPointerY !== "number") {
    activeDragScrollFrame = null;
    return;
  }

  const viewportHeight = window.innerHeight;
  let scrollDelta = 0;

  if (lastDragPointerY < DRAG_SCROLL_EDGE_PX) {
    scrollDelta = -Math.max(
      4,
      ((DRAG_SCROLL_EDGE_PX - lastDragPointerY) / DRAG_SCROLL_EDGE_PX) *
        DRAG_SCROLL_MAX_STEP,
    );
  } else if (lastDragPointerY > viewportHeight - DRAG_SCROLL_EDGE_PX) {
    scrollDelta = Math.max(
      4,
      ((lastDragPointerY - (viewportHeight - DRAG_SCROLL_EDGE_PX)) /
        DRAG_SCROLL_EDGE_PX) *
        DRAG_SCROLL_MAX_STEP,
    );
  }

  if (scrollDelta !== 0) {
    window.scrollBy({ top: scrollDelta });
  }

  activeDragScrollFrame = requestAnimationFrame(runDragAutoScroll);
};

const ensureDragAutoScroll = () => {
  if (!activeDragScrollFrame) {
    activeDragScrollFrame = requestAnimationFrame(runDragAutoScroll);
  }
};

const createId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getGoalColorFromId = (goalId) => {
  const safeGoalId = String(goalId || "goal");
  let hash = 0;
  for (const char of safeGoalId) {
    hash = (hash * 31 + char.charCodeAt(0)) % GOAL_PALETTE.length;
  }
  return GOAL_PALETTE[Math.abs(hash) % GOAL_PALETTE.length];
};

const isHexColor = (value) => /^#[0-9a-f]{6}$/i.test(String(value || ""));

const normalizeGoalColor = (value) => {
  if (!isHexColor(value)) {
    return null;
  }

  return String(value).toLowerCase();
};

const hslToHex = (hue, saturation, lightness) => {
  const normalizedLightness = lightness / 100;
  const chroma =
    (1 - Math.abs(2 * normalizedLightness - 1)) * (saturation / 100);
  const hueSection = hue / 60;
  const x = chroma * (1 - Math.abs((hueSection % 2) - 1));
  let red = 0;
  let green = 0;
  let blue = 0;

  if (hueSection >= 0 && hueSection < 1) {
    red = chroma;
    green = x;
  } else if (hueSection < 2) {
    red = x;
    green = chroma;
  } else if (hueSection < 3) {
    green = chroma;
    blue = x;
  } else if (hueSection < 4) {
    green = x;
    blue = chroma;
  } else if (hueSection < 5) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  const match = normalizedLightness - chroma / 2;
  const toHex = (value) =>
    Math.round((value + match) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
};

const getGoalColor = (goal) =>
  normalizeGoalColor(goal?.color) || getGoalColorFromId(goal?.id);

const isGoalColorInUse = (color, excludedGoalId = null) =>
  state.goals.some(
    (goal) => goal.id !== excludedGoalId && getGoalColor(goal) === color,
  );

const getNextAvailableGoalColor = (
  excludedGoalId = null,
  preferredColor = null,
) => {
  const normalizedPreferredColor = normalizeGoalColor(preferredColor);
  if (
    normalizedPreferredColor &&
    !isGoalColorInUse(normalizedPreferredColor, excludedGoalId)
  ) {
    return normalizedPreferredColor;
  }

  for (const color of GOAL_PALETTE) {
    if (!isGoalColorInUse(color, excludedGoalId)) {
      return color;
    }
  }

  for (let index = 0; index < 360; index += 1) {
    const hue = (index * 37) % 360;
    const candidateColor = hslToHex(hue, 70, 52);
    if (!isGoalColorInUse(candidateColor, excludedGoalId)) {
      return candidateColor;
    }
  }

  return normalizedPreferredColor || "#3b82f6";
};

const ensureDistinctGoalColors = () => {
  const usedColors = new Set();

  state.goals.forEach((goal) => {
    let candidateColor =
      normalizeGoalColor(goal.color) || getGoalColorFromId(goal.id);

    if (usedColors.has(candidateColor)) {
      candidateColor = getNextAvailableGoalColor(goal.id, candidateColor);
    }

    goal.color = candidateColor;
    usedColors.add(candidateColor);
  });
};

const normalizeText = (text) => text.trim().toLowerCase();

const normalizeScheduleType = (value) =>
  value === "one-time" ? "one-time" : "recurring";

const isDuplicateTaskText = (text, excludedTaskId = null) => {
  const normalizedText = normalizeText(text);
  return state.tasks.some(
    (task) =>
      task.id !== excludedTaskId && normalizeText(task.text) === normalizedText,
  );
};

const isDuplicateScheduleText = (text, excludedScheduleId = null) => {
  const normalizedText = normalizeText(text);
  return state.schedules.some(
    (schedule) =>
      schedule.id !== excludedScheduleId &&
      normalizeText(schedule.text) === normalizedText,
  );
};

const isDuplicateGoalTitle = (title, excludedGoalId = null) => {
  const normalizedTitle = normalizeText(title);
  return state.goals.some(
    (goal) =>
      goal.id !== excludedGoalId &&
      normalizeText(goal.title) === normalizedTitle,
  );
};

const getGoalById = (goalId) => {
  if (!goalId) {
    return null;
  }

  return state.goals.find((item) => item.id === goalId) || null;
};

const getAllowedWeekdaysForGoal = (goalId) => {
  const goal = getGoalById(goalId);
  return goal ? normalizeWeekdayList(goal.weekdays) : null;
};

const constrainWeekdaysToGoal = (
  weekdays,
  goalId,
  { fallback = ALL_WEEKDAYS, preferGoalWeekdaysOnEmpty = false } = {},
) => {
  const normalizedWeekdays = normalizeWeekdayList(weekdays, fallback);
  const allowedWeekdays = getAllowedWeekdaysForGoal(goalId);

  if (!allowedWeekdays) {
    return normalizedWeekdays;
  }

  const allowedSet = new Set(allowedWeekdays);
  const constrainedWeekdays = normalizedWeekdays.filter((day) =>
    allowedSet.has(day),
  );

  if (constrainedWeekdays.length === 0 && preferGoalWeekdaysOnEmpty) {
    return [...allowedWeekdays];
  }

  return constrainedWeekdays;
};

const sanitizeSchedulesForGoal = (
  goalId,
  { preferGoalWeekdaysOnEmpty = true } = {},
) => {
  const allowedWeekdays = getAllowedWeekdaysForGoal(goalId);
  if (!allowedWeekdays) {
    return false;
  }

  let didChange = false;
  state.schedules = state.schedules.map((schedule) => {
    if (
      schedule.goalId !== goalId ||
      normalizeScheduleType(schedule.type) === "one-time"
    ) {
      return schedule;
    }

    const nextWeekdays = constrainWeekdaysToGoal(schedule.weekdays, goalId, {
      fallback: ALL_WEEKDAYS,
      preferGoalWeekdaysOnEmpty,
    });

    if (areWeekdayListsEqual(schedule.weekdays, nextWeekdays)) {
      return schedule;
    }

    didChange = true;
    return {
      ...schedule,
      weekdays: nextWeekdays,
    };
  });

  return didChange;
};

const getGoalPeriodEndDate = (goal) => {
  if (!goal || goal.type !== "period") {
    return null;
  }

  if (typeof goal.endDate === "string" && goal.endDate) {
    return goal.endDate;
  }

  if (!goal.durationDays) {
    return null;
  }

  return addDaysToDateStamp(goal.startDate, goal.durationDays - 1);
};

const getGoalRangeForSchedule = (goal) => {
  if (!goal) {
    return { minDate: null, maxDate: null };
  }

  return {
    minDate: goal.startDate,
    maxDate:
      goal.type === "period" && !goal.cycleDays
        ? getGoalPeriodEndDate(goal)
        : null,
  };
};

const alignScheduleStartDateWithGoal = (startDate, goal) => {
  if (!goal) {
    return { startDate, adjusted: false, invalid: false };
  }

  const { minDate, maxDate } = getGoalRangeForSchedule(goal);
  let nextStartDate = startDate;
  let adjusted = false;

  if (minDate && daysBetweenDateStamps(nextStartDate, minDate) > 0) {
    nextStartDate = minDate;
    adjusted = true;
  }

  if (maxDate && daysBetweenDateStamps(maxDate, nextStartDate) > 0) {
    return { startDate: nextStartDate, adjusted, invalid: true };
  }

  return { startDate: nextStartDate, adjusted, invalid: false };
};

const renderWeekdayPickerButtons = (
  container,
  selectedWeekdays = ALL_WEEKDAYS,
  { allowedWeekdays = null } = {},
) => {
  if (!container) {
    return;
  }

  const selectedSet = new Set(normalizeWeekdayList(selectedWeekdays));
  const allowedSet = allowedWeekdays ? new Set(allowedWeekdays) : null;

  container.querySelectorAll(".weekday-btn").forEach((button) => {
    const weekday = Number(button.dataset.weekday);
    const isAllowed = !allowedSet || allowedSet.has(weekday);
    button.textContent = getWeekdayLabel(weekday);
    button.classList.toggle("is-active", selectedSet.has(weekday));
    button.classList.toggle("is-disabled", !isAllowed);
    button.disabled = !isAllowed;
    button.setAttribute("aria-pressed", String(selectedSet.has(weekday)));
  });
};

const getSelectedWeekdaysFromPicker = (container) => {
  if (!container) {
    return [...ALL_WEEKDAYS];
  }

  return normalizeWeekdayList(
    Array.from(container.querySelectorAll(".weekday-btn.is-active")).map(
      (button) => Number(button.dataset.weekday),
    ),
  );
};

const syncScheduleWeekdayPicker = (
  container,
  goalId,
  { preferGoalWeekdaysOnEmpty = false } = {},
) => {
  if (!container) {
    return { adjusted: false, weekdays: [] };
  }

  const selectedWeekdays = getSelectedWeekdaysFromPicker(container);
  const nextWeekdays = constrainWeekdaysToGoal(selectedWeekdays, goalId, {
    fallback: [],
    preferGoalWeekdaysOnEmpty,
  });

  renderWeekdayPickerButtons(container, nextWeekdays, {
    allowedWeekdays: getAllowedWeekdaysForGoal(goalId),
  });

  return {
    adjusted: !areWeekdayListsEqual(selectedWeekdays, nextWeekdays),
    weekdays: nextWeekdays,
  };
};

const getGoalTrackingEndDate = (goal, todayDateStamp) => {
  if (goal.type === "period" && !goal.cycleDays) {
    const endDate = getGoalPeriodEndDate(goal);
    if (endDate) {
      return daysBetweenDateStamps(endDate, todayDateStamp) < 0
        ? endDate
        : todayDateStamp;
    }
  }

  return todayDateStamp;
};

const getDateStampsInRange = (startDateStamp, endDateStamp) => {
  if (daysBetweenDateStamps(startDateStamp, endDateStamp) < 0) {
    return [];
  }

  const dates = [];
  let cursorUtc = parseDateStampUtc(startDateStamp);
  const endUtc = parseDateStampUtc(endDateStamp);

  while (cursorUtc <= endUtc) {
    const date = new Date(cursorUtc);
    const dateStamp = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
    dates.push(dateStamp);
    cursorUtc += 1000 * 60 * 60 * 24;
  }

  return dates;
};

const isGoalFinished = (goal, dateStamp = getCurrentDateStamp()) => {
  if (!goal) {
    return false;
  }

  if (typeof goal.finishedAt === "string" && goal.finishedAt) {
    return true;
  }

  if (goal.type !== "period" || goal.cycleDays) {
    return false;
  }

  const endDate = getGoalPeriodEndDate(goal);
  if (!endDate) {
    return false;
  }

  return daysBetweenDateStamps(endDate, dateStamp) > 0;
};

const isScheduleFinished = (schedule, dateStamp = getCurrentDateStamp()) => {
  if (!schedule) {
    return false;
  }

  if (normalizeScheduleType(schedule.type) === "one-time") {
    return daysBetweenDateStamps(schedule.startDate, dateStamp) > 0;
  }

  if (!schedule.goalId) {
    return false;
  }

  const goal = state.goals.find((item) => item.id === schedule.goalId);
  return Boolean(goal) && isGoalFinished(goal, dateStamp);
};

const getActiveGoals = (dateStamp = getCurrentDateStamp()) =>
  state.goals.filter((goal) => !isGoalFinished(goal, dateStamp));

const getFinishedGoals = (dateStamp = getCurrentDateStamp()) =>
  state.goals.filter((goal) => isGoalFinished(goal, dateStamp));

const getDailyCompletionCount = (dateStamp) => {
  return Number(state.stats.dailyCompletions[dateStamp] || 0);
};

const setDailyCompletionCount = (dateStamp, count) => {
  const nextValue = Math.max(0, Math.floor(count));
  if (nextValue === 0) {
    delete state.stats.dailyCompletions[dateStamp];
    return;
  }

  state.stats.dailyCompletions[dateStamp] = nextValue;
};

const adjustTodayCompletionCount = (delta) => {
  if (delta === 0) {
    return;
  }

  const today = getCurrentDateStamp();
  const current = getDailyCompletionCount(today);
  setDailyCompletionCount(today, current + delta);
};

const getGoalDailyCompletionCount = (goalId, dateStamp) => {
  return Number(state.stats.goalDailyCompletions?.[goalId]?.[dateStamp] || 0);
};

const setGoalDailyCompletionCount = (goalId, dateStamp, count) => {
  if (!goalId || !dateStamp) {
    return;
  }

  const nextValue = Math.max(0, Math.floor(count));
  if (!state.stats.goalDailyCompletions[goalId]) {
    state.stats.goalDailyCompletions[goalId] = {};
  }

  if (nextValue === 0) {
    delete state.stats.goalDailyCompletions[goalId][dateStamp];
    if (Object.keys(state.stats.goalDailyCompletions[goalId]).length === 0) {
      delete state.stats.goalDailyCompletions[goalId];
    }
    return;
  }

  state.stats.goalDailyCompletions[goalId][dateStamp] = nextValue;
};

const adjustGoalCompletionCount = (goalId, dateStamp, delta) => {
  if (!goalId || !dateStamp || !delta) {
    return;
  }

  const current = getGoalDailyCompletionCount(goalId, dateStamp);
  setGoalDailyCompletionCount(goalId, dateStamp, current + delta);
};

const syncScheduleDateBounds = (
  goalId,
  dateInput,
  { enforceValue = false } = {},
) => {
  if (!dateInput) {
    return { adjusted: false, invalid: false };
  }

  const goal = goalId ? state.goals.find((item) => item.id === goalId) : null;
  if (!goal) {
    dateInput.removeAttribute("min");
    dateInput.removeAttribute("max");
    return { adjusted: false, invalid: false };
  }

  const { minDate, maxDate } = getGoalRangeForSchedule(goal);
  if (minDate) {
    dateInput.min = minDate;
  }
  if (maxDate) {
    dateInput.max = maxDate;
  } else {
    dateInput.removeAttribute("max");
  }

  if (!enforceValue) {
    return { adjusted: false, invalid: false };
  }

  const currentValue = normalizeDateStamp(
    dateInput.value || getCurrentDateStamp(),
  );
  const aligned = alignScheduleStartDateWithGoal(currentValue, goal);
  if (!aligned.invalid) {
    dateInput.value = aligned.startDate;
  }

  return { adjusted: aligned.adjusted, invalid: aligned.invalid };
};

const isGoalActiveOnDate = (goal, dateStamp) => {
  if (!goal || !dateStamp) {
    return false;
  }

  const diff = daysBetweenDateStamps(goal.startDate, dateStamp);
  if (diff < 0) {
    return false;
  }

  const goalWeekdays = normalizeWeekdayList(goal.weekdays);
  const weekday = getDateStampWeekday(dateStamp);
  if (!goalWeekdays.includes(weekday)) {
    return false;
  }

  if (goal.type === "period") {
    const durationDays = normalizePositiveInteger(
      goal.durationDays || getGoalDurationDays(goal) || 1,
      1,
    );
    if (goal.cycleDays) {
      const cycleDays = normalizePositiveInteger(goal.cycleDays, durationDays);
      return diff % cycleDays < durationDays;
    }

    return diff < durationDays;
  }

  const intervalDays = normalizePositiveInteger(goal.intervalDays, 1);
  return diff % intervalDays === 0;
};

const isDateWithinGoalBounds = (goal, dateStamp) => {
  if (!goal || !dateStamp) {
    return true;
  }

  if (daysBetweenDateStamps(goal.startDate, dateStamp) < 0) {
    return false;
  }

  const goalWeekdays = normalizeWeekdayList(goal.weekdays);
  const weekday = getDateStampWeekday(dateStamp);
  if (!goalWeekdays.includes(weekday)) {
    return false;
  }

  if (goal.type === "period") {
    if (goal.cycleDays) {
      return isGoalActiveOnDate(goal, dateStamp);
    }

    const endDate = getGoalPeriodEndDate(goal);
    if (!endDate) {
      return true;
    }

    return daysBetweenDateStamps(endDate, dateStamp) <= 0;
  }

  return true;
};

const isRecurringScheduleActiveOnDate = (schedule, dateStamp) => {
  if (!schedule || !dateStamp) {
    return false;
  }

  const startDate = normalizeDateStamp(schedule.startDate);
  if (normalizeScheduleType(schedule.type) === "one-time") {
    return startDate === dateStamp;
  }

  const diff = daysBetweenDateStamps(startDate, dateStamp);
  if (diff < 0) {
    return false;
  }

  const intervalDays = normalizePositiveInteger(schedule.intervalDays, 1);
  if (diff % intervalDays !== 0) {
    return false;
  }

  const weekdays = normalizeWeekdayList(schedule.weekdays);
  const weekday = getDateStampWeekday(dateStamp);
  return weekdays.includes(weekday);
};

const formatEveryXDays = (intervalDays) => {
  const normalizedInterval = normalizePositiveInteger(intervalDays, 1);
  return normalizedInterval === 1
    ? t("everyDay")
    : t("everyNDays", { count: normalizedInterval });
};

const getGoalScheduleLabel = (goal) => {
  if (!goal) {
    return "";
  }

  const goalWeekdayLabel = formatWeekdaysLabel(goal.weekdays);

  if (goal.type === "period") {
    if (goal.cycleDays) {
      const cycleLabel = t("cycleLabel", {
        duration: goal.durationDays,
        cycle: goal.cycleDays,
        start: formatDisplayDate(goal.startDate),
      });
      return goalWeekdayLabel === t("everyDay")
        ? cycleLabel
        : `${cycleLabel} • ${goalWeekdayLabel}`;
    }

    const endDate = getGoalPeriodEndDate(goal);
    const rangeLabel = endDate
      ? t("dateRange", {
          start: formatDisplayDate(goal.startDate),
          end: formatDisplayDate(endDate),
        })
      : t("startsOn", { date: formatDisplayDate(goal.startDate) });

    return goalWeekdayLabel === t("everyDay")
      ? rangeLabel
      : `${rangeLabel} • ${goalWeekdayLabel}`;
  }

  const cadenceLabel = t("fromDate", {
    label: formatEveryXDays(goal.intervalDays),
    date: formatDisplayDate(goal.startDate),
  });

  return goalWeekdayLabel === t("everyDay")
    ? cadenceLabel
    : `${cadenceLabel} • ${goalWeekdayLabel}`;
};

const getScheduleTimingLabel = (schedule) => {
  if (!schedule) {
    return "";
  }

  if (normalizeScheduleType(schedule.type) === "one-time") {
    return t("oneTimeOn", {
      date: formatDisplayDate(schedule.startDate),
    });
  }

  const weekdayLabel = formatWeekdaysLabel(schedule.weekdays);
  const intervalLabel = formatEveryXDays(schedule.intervalDays);
  const cadenceLabel =
    weekdayLabel === t("everyDay")
      ? intervalLabel
      : `${intervalLabel} • ${weekdayLabel}`;

  return t("fromDate", {
    label: cadenceLabel,
    date: formatDisplayDate(schedule.startDate),
  });
};

const hasScheduleStarted = (schedule) => {
  if (!schedule) {
    return false;
  }

  return daysBetweenDateStamps(schedule.startDate, getCurrentDateStamp()) >= 0;
};

const scheduleHasCompletedTaskHistory = (scheduleId) =>
  state.tasks.some(
    (task) => task.isScheduled && task.scheduleId === scheduleId && task.done,
  );

const shouldLockScheduleStartDate = (schedule) =>
  Boolean(schedule) &&
  hasScheduleStarted(schedule) &&
  scheduleHasCompletedTaskHistory(schedule.id);

const syncGoalFrequencyInputs = ({
  type,
  durationInput,
  intervalInput,
  intervalValue = "",
}) => {
  if (!durationInput || !intervalInput) {
    return;
  }

  const isPeriodGoal = type === "period";
  durationInput.disabled = !isPeriodGoal;
  durationInput.required = isPeriodGoal;
  intervalInput.disabled = false;
  intervalInput.required = !isPeriodGoal;
  intervalInput.placeholder = isPeriodGoal
    ? t("cycleEveryXDaysOptional")
    : t("everyXDays");

  if (isPeriodGoal) {
    if (intervalValue === "") {
      intervalInput.value = "";
    }
    return;
  }

  if (!intervalInput.value) {
    intervalInput.value = intervalValue || "1";
  }
  if (durationInput.value) {
    durationInput.value = "";
  }
};

const syncScheduleItemFormMode = (
  scheduleItem,
  { type, goalId, startDateLocked = false } = {},
) => {
  if (!scheduleItem) {
    return { adjusted: false, weekdays: [] };
  }

  const resolvedType = normalizeScheduleType(type);
  const isOneTime = resolvedType === "one-time";
  const intervalInput = scheduleItem.querySelector(
    ".schedule-edit-interval-input",
  );
  const startDateInput = scheduleItem.querySelector(
    ".schedule-edit-start-date-input",
  );
  const weekdayWrap = scheduleItem.querySelector(
    ".schedule-edit-weekdays-wrap",
  );
  const weekdayPicker = scheduleItem.querySelector(
    ".schedule-edit-weekday-picker",
  );

  if (weekdayWrap) {
    weekdayWrap.hidden = isOneTime;
  }

  if (intervalInput) {
    if (isOneTime) {
      intervalInput.value = "1";
      intervalInput.disabled = true;
      intervalInput.title = t("everyXDaysTitle");
    } else {
      syncScheduleIntervalLock(goalId || null, intervalInput);
    }
  }

  if (startDateInput) {
    startDateInput.disabled = Boolean(startDateLocked);
    startDateInput.title = startDateLocked
      ? t("startDateLocked")
      : t("startFromTitle");

    if (isOneTime && startDateInput.value) {
      renderWeekdayPickerButtons(weekdayPicker, [
        getDateStampWeekday(normalizeDateStamp(startDateInput.value)),
      ]);
      return { adjusted: false, weekdays: [] };
    }
  }

  return syncScheduleWeekdayPicker(weekdayPicker, goalId || null, {
    preferGoalWeekdaysOnEmpty: true,
  });
};

const renderGoalOptions = () => {
  if (!scheduleGoalSelect) {
    return;
  }

  const previousValue = scheduleGoalSelect.value;
  scheduleGoalSelect.innerHTML = `<option value="">${t("noGoal")}</option>`;

  getActiveGoals().forEach((goal) => {
    const option = document.createElement("option");
    option.value = goal.id;
    option.textContent = goal.title;
    scheduleGoalSelect.appendChild(option);
  });

  if (previousValue && state.goals.some((goal) => goal.id === previousValue)) {
    scheduleGoalSelect.value = previousValue;
  }

  syncScheduleIntervalLock(
    scheduleGoalSelect.value || null,
    scheduleIntervalInput,
  );
  syncScheduleDateBounds(
    scheduleGoalSelect.value || null,
    scheduleStartDateInput,
    { enforceValue: true },
  );
};

const shouldLockScheduleIntervalToGoal = (goalId) => {
  if (!goalId) {
    return false;
  }

  const goal = state.goals.find((item) => item.id === goalId);
  if (!goal || goal.type !== "habit") {
    return false;
  }

  return normalizePositiveInteger(goal.intervalDays, 1) > 1;
};

const syncScheduleIntervalLock = (goalId, intervalInput) => {
  if (!intervalInput) {
    return;
  }

  const shouldLock = shouldLockScheduleIntervalToGoal(goalId);
  if (shouldLock) {
    intervalInput.value = "1";
  }

  intervalInput.disabled = shouldLock;
  intervalInput.title = shouldLock
    ? t("scheduleIntervalLocked")
    : t("everyXDaysTitle");
};

const getGoalDurationDays = (goal) => {
  if (!goal || goal.type !== "period") {
    return "";
  }

  if (goal.durationDays) {
    return String(normalizePositiveInteger(goal.durationDays, 1));
  }

  const endDate = getGoalPeriodEndDate(goal);
  if (!endDate) {
    return "";
  }

  return String(
    Math.max(1, daysBetweenDateStamps(goal.startDate, endDate) + 1),
  );
};

const moveGoalInActiveOrder = (goalId, direction) => {
  if (!goalId || (direction !== -1 && direction !== 1)) {
    return false;
  }

  const activeGoals = getActiveGoals();
  const activeGoalIds = activeGoals.map((goal) => goal.id);
  const fromIndex = activeGoalIds.indexOf(goalId);
  if (fromIndex === -1) {
    return false;
  }

  const toIndex = fromIndex + direction;
  if (toIndex < 0 || toIndex >= activeGoalIds.length) {
    return false;
  }

  const reorderedActiveGoalIds = [...activeGoalIds];
  [reorderedActiveGoalIds[fromIndex], reorderedActiveGoalIds[toIndex]] = [
    reorderedActiveGoalIds[toIndex],
    reorderedActiveGoalIds[fromIndex],
  ];

  const goalsById = new Map(state.goals.map((goal) => [goal.id, goal]));
  const reorderedActiveGoals = reorderedActiveGoalIds
    .map((id) => goalsById.get(id))
    .filter(Boolean);
  const finishedGoals = state.goals.filter((goal) => isGoalFinished(goal));
  state.goals = [...reorderedActiveGoals, ...finishedGoals];

  return true;
};

const showToast = (message, icon = "🎉", variant = "success") => {
  const toast = document.getElementById("completion-toast");
  if (!toast) {
    return;
  }
  toast.classList.remove("is-warning", "is-error");
  if (variant === "warning") {
    toast.classList.add("is-warning");
  }
  if (variant === "error") {
    toast.classList.add("is-error");
  }
  const toastIcon = toast.querySelector(".toast-icon");
  const toastMessage = toast.querySelector(".toast-msg");
  if (toastIcon) {
    toastIcon.textContent = icon;
  }
  if (toastMessage) {
    toastMessage.textContent = message;
  }
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1200);
};

const showCompletionToast = () => {
  showToast(t("taskCompleteToast"), "🎉", "success");
};

const showDuplicateWarning = (message) => {
  showToast(message, "🚫", "warning");
};

const showSuccessToast = (message) => {
  showToast(message, "✅", "success");
};
const TASK_HIDE_ANIMATION_MS = 220;

const sortTasks = () => {
  const taskItems = Array.from(todoList.querySelectorAll(".todo-item"));
  const unchecked = taskItems.filter(
    (item) => !item.classList.contains("is-done"),
  );
  const checked = taskItems.filter((item) =>
    item.classList.contains("is-done"),
  );
  [...unchecked, ...checked].forEach((item) => todoList.appendChild(item));
};

const reorderUncheckedTasksByInsertIndex = (dragTaskId, rawInsertIndex) => {
  const uncheckedTasks = state.tasks.filter((task) => !task.done);
  const fromIndex = uncheckedTasks.findIndex((task) => task.id === dragTaskId);
  if (fromIndex === -1) {
    return false;
  }

  const insertIndexClamped = Math.max(
    0,
    Math.min(rawInsertIndex, uncheckedTasks.length),
  );

  const reorderedUnchecked = [...uncheckedTasks];
  const [movedTask] = reorderedUnchecked.splice(fromIndex, 1);
  const normalizedInsertIndex =
    insertIndexClamped > fromIndex
      ? insertIndexClamped - 1
      : insertIndexClamped;
  if (normalizedInsertIndex === fromIndex) {
    return false;
  }

  reorderedUnchecked.splice(normalizedInsertIndex, 0, movedTask);

  state.tasks = [
    ...reorderedUnchecked,
    ...state.tasks.filter((task) => task.done),
  ];

  return true;
};

const clearDropIndicators = (keepDragging = false) => {
  todoList
    .querySelectorAll(
      ".todo-item.is-drop-before, .todo-item.is-drop-after, .todo-item.is-dragging",
    )
    .forEach((item) => {
      item.classList.remove("is-drop-before", "is-drop-after", "is-dragging");
      if (keepDragging && item.dataset.taskId === draggedTaskId) {
        item.classList.add("is-dragging");
      }
    });
  dropInsertIndex = null;
};

const getUncheckedTaskItems = () => {
  return Array.from(todoList.querySelectorAll(".todo-item")).filter(
    (item) => !item.classList.contains("is-done"),
  );
};

const getDropInsertIndexFromPointer = (clientY) => {
  const uncheckedItems = getUncheckedTaskItems();
  if (uncheckedItems.length === 0) {
    return null;
  }

  const firstRect = uncheckedItems[0].getBoundingClientRect();
  if (clientY <= firstRect.top) {
    return 0;
  }

  const lastRect =
    uncheckedItems[uncheckedItems.length - 1].getBoundingClientRect();
  if (clientY >= lastRect.bottom) {
    return uncheckedItems.length;
  }

  for (let index = 0; index < uncheckedItems.length; index += 1) {
    const rect = uncheckedItems[index].getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    if (clientY < midpoint) {
      return index;
    }
  }

  return uncheckedItems.length;
};

const updateDropIndicatorByInsertIndex = (insertIndex) => {
  todoList
    .querySelectorAll(".todo-item.is-drop-before, .todo-item.is-drop-after")
    .forEach((item) => {
      item.classList.remove("is-drop-before", "is-drop-after");
    });

  if (insertIndex === null) {
    return;
  }

  const uncheckedItems = getUncheckedTaskItems();
  if (uncheckedItems.length === 0) {
    return;
  }

  if (insertIndex <= 0) {
    uncheckedItems[0].classList.add("is-drop-before");
    return;
  }

  if (insertIndex >= uncheckedItems.length) {
    uncheckedItems[uncheckedItems.length - 1].classList.add("is-drop-after");
    return;
  }

  uncheckedItems[insertIndex].classList.add("is-drop-before");
};

const handleDropReorder = () => {
  if (!draggedTaskId) {
    return;
  }

  const resolvedInsertIndex =
    dropInsertIndex === null && typeof lastDragPointerY === "number"
      ? getDropInsertIndexFromPointer(lastDragPointerY)
      : dropInsertIndex;

  if (resolvedInsertIndex === null) {
    return;
  }

  const didReorder = reorderUncheckedTasksByInsertIndex(
    draggedTaskId,
    resolvedInsertIndex,
  );

  if (didReorder) {
    renderTasks();
    saveStateToStorage();
  }
};

const createTaskElement = (task) => {
  const taskElement = document.createElement("div");
  taskElement.className = "todo-item";
  taskElement.dataset.taskId = task.id;
  taskElement.draggable = !task.done && !isTouchReorderMode;

  taskElement.innerHTML = `
		<div class="todo-item-label">
			<input type="checkbox" />
			<div class="todo-item-label-content">
				<span class="todo-item-text"></span>
			</div>
		</div>
		<div class="todo-item-actions">
			<button type="button" class="todo-action-btn todo-edit-btn" aria-label="${t("edit")}">
				<i title="${t("edit")}" class="fa-solid fa-pen"></i>
			</button>
			<button type="button" class="todo-action-btn todo-save-btn" aria-label="${t("save")}">
				<i title="${t("save")}" class="fa-solid fa-floppy-disk"></i>
			</button>
			<button type="button" class="todo-action-btn todo-delete-btn" aria-label="${t("delete")}">
				<i title="${t("delete")}" class="fa-solid fa-trash"></i>
			</button>
		</div>
	`;

  const taskTextElement = taskElement.querySelector(".todo-item-text");
  const taskCheckbox = taskElement.querySelector('input[type="checkbox"]');
  const deleteButton = taskElement.querySelector(".todo-delete-btn");

  taskTextElement.textContent = task.text;
  taskCheckbox.checked = Boolean(task.done);
  taskElement.classList.toggle("is-done", taskCheckbox.checked);
  taskElement.classList.toggle("is-scheduled", Boolean(task.isScheduled));

  if (task.isScheduled) {
    deleteButton.setAttribute("aria-disabled", "true");
    deleteButton.setAttribute("title", t("removeFromRecurringSchedules"));

    if (task.scheduleId) {
      const schedule = state.schedules.find((s) => s.id === task.scheduleId);
      if (schedule?.goalId) {
        const goal = state.goals.find((g) => g.id === schedule.goalId);
        if (goal) {
          const color = getGoalColor(goal);
          taskElement.style.setProperty("--task-goal-color", color);
          taskElement.classList.add("has-goal-color");
          const badge = document.createElement("span");
          badge.className = "task-goal-badge";
          badge.textContent = goal.title;
          taskTextElement.parentElement.appendChild(badge);
        }
      }
    }
  }

  return taskElement;
};

const getOrderedActiveSchedules = (dateStamp = getCurrentDateStamp()) => {
  const goalOrderById = new Map(
    getActiveGoals(dateStamp).map((goal, index) => [goal.id, index]),
  );
  const scheduleOrderById = new Map(
    state.schedules.map((schedule, index) => [schedule.id, index]),
  );
  const noGoalOrder = Number.MAX_SAFE_INTEGER;
  const noScheduleOrder = Number.MAX_SAFE_INTEGER;

  return state.schedules
    .filter((schedule) => !isScheduleFinished(schedule, dateStamp))
    .sort((left, right) => {
      const leftGoalOrder =
        left.goalId && goalOrderById.has(left.goalId)
          ? goalOrderById.get(left.goalId)
          : noGoalOrder;
      const rightGoalOrder =
        right.goalId && goalOrderById.has(right.goalId)
          ? goalOrderById.get(right.goalId)
          : noGoalOrder;

      if (leftGoalOrder !== rightGoalOrder) {
        return leftGoalOrder - rightGoalOrder;
      }

      const leftScheduleOrder = scheduleOrderById.has(left.id)
        ? scheduleOrderById.get(left.id)
        : noScheduleOrder;
      const rightScheduleOrder = scheduleOrderById.has(right.id)
        ? scheduleOrderById.get(right.id)
        : noScheduleOrder;
      if (leftScheduleOrder !== rightScheduleOrder) {
        return leftScheduleOrder - rightScheduleOrder;
      }

      return left.text.localeCompare(right.text);
    });
};

const moveScheduleWithinGoalGroup = (scheduleId, direction) => {
  if (!scheduleId || (direction !== -1 && direction !== 1)) {
    return false;
  }

  const orderedSchedules = getOrderedActiveSchedules();
  const fromIndex = orderedSchedules.findIndex(
    (schedule) => schedule.id === scheduleId,
  );
  if (fromIndex === -1) {
    return false;
  }

  const toIndex = fromIndex + direction;
  if (toIndex < 0 || toIndex >= orderedSchedules.length) {
    return false;
  }

  const fromSchedule = orderedSchedules[fromIndex];
  const toSchedule = orderedSchedules[toIndex];
  const fromGoalId = fromSchedule.goalId || null;
  const toGoalId = toSchedule.goalId || null;

  // Keep movement inside the same goal group to preserve grouped ordering.
  if (fromGoalId !== toGoalId) {
    return false;
  }

  const fromStateIndex = state.schedules.findIndex(
    (schedule) => schedule.id === fromSchedule.id,
  );
  const toStateIndex = state.schedules.findIndex(
    (schedule) => schedule.id === toSchedule.id,
  );
  if (fromStateIndex === -1 || toStateIndex === -1) {
    return false;
  }

  [state.schedules[fromStateIndex], state.schedules[toStateIndex]] = [
    state.schedules[toStateIndex],
    state.schedules[fromStateIndex],
  ];

  return true;
};

const sortScheduledTasksByGoalOrder = () => {
  const orderedSchedules = getOrderedActiveSchedules();
  const scheduleOrderById = new Map(
    orderedSchedules.map((schedule, index) => [schedule.id, index]),
  );
  const noScheduleOrder = Number.MAX_SAFE_INTEGER;

  const unscheduledTasks = state.tasks.filter((task) => !task.isScheduled);
  const scheduledTasks = state.tasks
    .filter((task) => task.isScheduled)
    .sort((left, right) => {
      const leftOrder =
        left.scheduleId && scheduleOrderById.has(left.scheduleId)
          ? scheduleOrderById.get(left.scheduleId)
          : noScheduleOrder;
      const rightOrder =
        right.scheduleId && scheduleOrderById.has(right.scheduleId)
          ? scheduleOrderById.get(right.scheduleId)
          : noScheduleOrder;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      const leftDate = left.createdForDate || "";
      const rightDate = right.createdForDate || "";
      if (leftDate !== rightDate) {
        return leftDate.localeCompare(rightDate);
      }

      return left.text.localeCompare(right.text);
    });

  state.tasks = [...unscheduledTasks, ...scheduledTasks];
};

const findTaskById = (taskId) => state.tasks.find((task) => task.id === taskId);

const syncScheduledTasksForToday = () => {
  const today = getCurrentDateStamp();
  const needsNewDaySync = state.lastSyncDate !== today;
  const isScheduleActiveForDate = (schedule, dateStamp) => {
    if (!isRecurringScheduleActiveOnDate(schedule, dateStamp)) {
      return false;
    }

    if (!schedule?.goalId) {
      return true;
    }

    const goal = state.goals.find((item) => item.id === schedule.goalId);
    if (!goal) {
      return true;
    }

    if (isGoalFinished(goal, dateStamp)) {
      return false;
    }

    return isDateWithinGoalBounds(goal, dateStamp);
  };

  // Keep one scheduled task instance per schedule/day in case storage was duplicated.
  const seenScheduledKeys = new Set();
  state.tasks = state.tasks.filter((task) => {
    if (!task.isScheduled) {
      return true;
    }

    const dedupeKey = `${task.scheduleId || ""}|${task.createdForDate || ""}`;
    if (seenScheduledKeys.has(dedupeKey)) {
      return false;
    }
    seenScheduledKeys.add(dedupeKey);
    return true;
  });

  if (needsNewDaySync) {
    state.tasks = state.tasks.filter((task) => !task.isScheduled && !task.done);
    getOrderedActiveSchedules(today).forEach((schedule) => {
      if (!isScheduleActiveForDate(schedule, today)) {
        return;
      }

      state.tasks.push({
        id: createId("task"),
        text: schedule.text,
        done: false,
        isScheduled: true,
        scheduleId: schedule.id,
        createdForDate: today,
      });
    });
    sortScheduledTasksByGoalOrder();
    state.lastSyncDate = today;
    return;
  }

  state.tasks = state.tasks.filter((task) => {
    if (!task.isScheduled) {
      return true;
    }
    const linkedSchedule = state.schedules.find(
      (schedule) => schedule.id === task.scheduleId,
    );
    if (!linkedSchedule) {
      return false;
    }

    return isScheduleActiveForDate(
      linkedSchedule,
      task.createdForDate || today,
    );
  });

  state.schedules.forEach((schedule) => {
    if (!isScheduleActiveForDate(schedule, today)) {
      return;
    }

    const hasTaskForToday = state.tasks.some(
      (task) =>
        task.isScheduled &&
        task.scheduleId === schedule.id &&
        task.createdForDate === today,
    );

    if (!hasTaskForToday) {
      state.tasks.push({
        id: createId("task"),
        text: schedule.text,
        done: false,
        isScheduled: true,
        scheduleId: schedule.id,
        createdForDate: today,
      });
    }
  });

  sortScheduledTasksByGoalOrder();
};
const animateTaskHide = (taskItem, onComplete) => {
  if (!taskItem) {
    onComplete();
    return;
  }

  const fallbackTimeout = window.setTimeout(() => {
    cleanup();
    onComplete();
  }, TASK_HIDE_ANIMATION_MS + 80);

  let isFinished = false;
  const finish = () => {
    if (isFinished) {
      return;
    }
    isFinished = true;
    window.clearTimeout(fallbackTimeout);
    taskItem.removeEventListener("transitionend", handleTransitionEnd);
    onComplete();
  };

  const handleTransitionEnd = (event) => {
    if (event.target !== taskItem) {
      return;
    }
    finish();
  };

  const cleanup = () => {
    taskItem.removeEventListener("transitionend", handleTransitionEnd);
  };

  taskItem.style.height = `${taskItem.offsetHeight}px`;
  taskItem.addEventListener("transitionend", handleTransitionEnd);
  requestAnimationFrame(() => {
    taskItem.classList.add("is-hiding");
  });
};

const handleTaskCompletionToggle = (taskItem, task, isDone) => {
  if (!taskItem || !task) {
    return;
  }

  applyTaskDoneState(task, isDone);
  taskItem.classList.toggle("is-done", isDone);

  if (isDone && !state.showFinishedTasks) {
    saveStateToStorage();
    animateTaskHide(taskItem, () => {
      renderTasks();
    });
    return;
  }

  sortTasks();
  saveStateToStorage();
};

const renderers = createRenderers({
  closeCollapsiblePanel,
  createTaskElement,
  getActiveGoals,
  getDayWord,
  getFinishedGoals,
  getGoalColor,
  getGoalDurationDays,
  getGoalIdFromTask: (task) => getGoalIdFromTask(task),
  getGoalScheduleLabel,
  getOrderedActiveSchedules,
  getScheduleTimingLabel,
  getTaskWord,
  isDateWithinGoalBounds,
  isRecurringScheduleActiveOnDate,
  normalizeScheduleType,
  openCollapsiblePanel,
  renderWeekdayPickerButtons,
  shouldLockScheduleStartDate,
  sortTasks,
  state,
  syncFinishedTasksToggleButton,
  syncGoalFrequencyInputs,
  syncScheduleDateBounds,
  syncScheduleIntervalLock,
});

renderers.bindDeps({
  getGoalPeriodEndDate,
  isGoalActiveOnDate,
  syncScheduleItemFormMode,
});

const {
  buildGoalOptionsMarkup,
  renderFinishedGoals,
  renderGoalProgress,
  renderGoals,
  renderProgressCharts,
  renderProgressQuote,
  renderSchedules,
  renderStreakDashboard,
  renderTasks,
  setProgressQuoteEditing,
  syncDailyQuoteSurface,
  updateScheduleItemView,
  updateTaskSummary,
} = renderers;

const {
  getStoredShowFinishedTasks,
  getStoredTheme,
  loadStoredActivityLog,
  loadStoredCustomQuote,
  loadStoredGoals,
  loadStoredSchedules,
  loadStoredStats,
  loadStoredTasks,
  saveStateToStorage,
} = createStorageApi({
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
  onPersist: () => {
    updateTaskSummary();
    renderStreakDashboard();
  },
});

const initializeState = () => {
  state.tasks = loadStoredTasks();
  state.goals = loadStoredGoals();
  ensureDistinctGoalColors();
  state.schedules = loadStoredSchedules();
  state.schedules = state.schedules.map((schedule) => {
    const goalId =
      schedule.goalId && state.goals.some((goal) => goal.id === schedule.goalId)
        ? schedule.goalId
        : null;
    const type = normalizeScheduleType(schedule.type);

    return {
      ...schedule,
      type,
      goalId,
      weekdays:
        type === "one-time"
          ? [getDateStampWeekday(normalizeDateStamp(schedule.startDate))]
          : constrainWeekdaysToGoal(schedule.weekdays, goalId, {
              fallback: ALL_WEEKDAYS,
              preferGoalWeekdaysOnEmpty: true,
            }),
    };
  });
  state.stats = loadStoredStats();
  state.activityLog = loadStoredActivityLog();
  state.customQuote = loadStoredCustomQuote();
  state.showFinishedTasks = getStoredShowFinishedTasks();
  state.lastSyncDate = localStorage.getItem(LAST_SYNC_DATE_STORAGE_KEY) || null;

  syncScheduledTasksForToday();
  renderTasks();
  renderGoals();
  renderFinishedGoals();
  renderSchedules();
  renderStreakDashboard();
  renderProgressCharts();
  saveStateToStorage();
};

const showDeleteModal = ({
  taskId = null,
  scheduleId = null,
  title = t("deleteTaskQuestion"),
  message = t("actionCannotBeUndone"),
} = {}) => {
  pendingDeleteTaskId = taskId;
  pendingDeleteScheduleId = scheduleId;
  if (deleteModalTitle) {
    deleteModalTitle.textContent = title;
  }
  if (deleteModalMessage) {
    deleteModalMessage.textContent = message;
  }
  openModalOverlay(deleteModal);
};

const hideDeleteModal = () => {
  pendingDeleteTaskId = null;
  pendingDeleteScheduleId = null;
  if (deleteModalTitle) {
    deleteModalTitle.textContent = t("deleteTaskQuestion");
  }
  if (deleteModalMessage) {
    deleteModalMessage.textContent = t("actionCannotBeUndone");
  }
  closeModalOverlay(deleteModal);
};

const showClearAllModal = () => {
  openModalOverlay(clearAllModal);
};

const hideClearAllModal = () => {
  closeModalOverlay(clearAllModal);
};

const showScheduleModal = () => {
  syncScheduledTasksForToday();
  renderGoals();
  renderFinishedGoals();
  renderSchedules();
  if (goalColorInput) {
    goalColorInput.value = getNextAvailableGoalColor();
  }
  if (goalStartDateInput && !goalStartDateInput.value) {
    goalStartDateInput.value = getCurrentDateStamp();
  }
  if (
    goalWeekdayPicker &&
    getSelectedWeekdaysFromPicker(goalWeekdayPicker).length === 0
  ) {
    renderWeekdayPickerButtons(goalWeekdayPicker, ALL_WEEKDAYS);
  }
  if (scheduleStartDateInput && !scheduleStartDateInput.value) {
    scheduleStartDateInput.value = getCurrentDateStamp();
  }
  if (scheduleWeekdayPicker) {
    renderWeekdayPickerButtons(scheduleWeekdayPicker, ALL_WEEKDAYS);
  }
  syncScheduleDateBounds(
    scheduleGoalSelect?.value || null,
    scheduleStartDateInput,
    { enforceValue: true },
  );
  openModalOverlay(scheduleModal, "is-schedule-open");
};

const hideScheduleModal = () => {
  closeModalOverlay(scheduleModal, "is-schedule-open");
};

const showProgressModal = () => {
  renderProgressCharts();
  setProgressQuoteEditing(false);
  openModalOverlay(progressModal, "is-progress-open");
};

const hideProgressModal = () => {
  closeModalOverlay(progressModal, "is-progress-open");
};

const showRemoveGoalModal = (goalId) => {
  pendingRemoveGoalId = goalId;
  openModalOverlay(removeGoalModal);
};

const hideRemoveGoalModal = () => {
  pendingRemoveGoalId = null;
  closeModalOverlay(removeGoalModal);
};

const removeGoalById = (goalId) => {
  state.goals = state.goals.filter((goal) => goal.id !== goalId);
  state.schedules = state.schedules.map((schedule) =>
    schedule.goalId === goalId ? { ...schedule, goalId: null } : schedule,
  );
  delete state.stats.goalDailyCompletions[goalId];

  syncScheduledTasksForToday();
  renderGoals();
  renderFinishedGoals();
  renderSchedules();
  renderProgressCharts();
  renderTasks();
  showSuccessToast(t("goalRemoved"));
  saveStateToStorage();
};

const removeScheduleById = (scheduleId) => {
  state.schedules = state.schedules.filter(
    (schedule) => schedule.id !== scheduleId,
  );
  state.tasks = state.tasks.filter((task) => task.scheduleId !== scheduleId);

  renderSchedules();
  renderGoals();
  renderFinishedGoals();
  renderProgressCharts();
  renderTasks();
  showSuccessToast(t("recurringScheduleRemoved"));
  saveStateToStorage();
};

const getGoalIdFromTask = (task) => {
  if (!task?.isScheduled || !task.scheduleId) {
    return null;
  }

  const schedule = state.schedules.find((item) => item.id === task.scheduleId);
  return schedule?.goalId || null;
};

const transferCompletedScheduleScoresToGoal = (
  scheduleId,
  previousGoalId,
  nextGoalId,
) => {
  if (previousGoalId === nextGoalId) {
    return;
  }

  state.tasks
    .filter(
      (task) => task.isScheduled && task.scheduleId === scheduleId && task.done,
    )
    .forEach((task) => {
      const completionDate = task.createdForDate || getCurrentDateStamp();
      if (previousGoalId) {
        adjustGoalCompletionCount(previousGoalId, completionDate, -1);
      }
      if (nextGoalId) {
        adjustGoalCompletionCount(nextGoalId, completionDate, 1);
      }
    });
};

const syncActivityLogForTask = (task) => {
  if (!task) {
    return;
  }

  const completionDate = task.createdForDate || getCurrentDateStamp();
  const matchingIndex = state.activityLog.findIndex(
    (entry) => entry.sourceTaskId === task.id && entry.date === completionDate,
  );

  if (!task.done) {
    if (matchingIndex >= 0) {
      state.activityLog.splice(matchingIndex, 1);
    }
    return;
  }

  const schedule = task.scheduleId
    ? state.schedules.find((item) => item.id === task.scheduleId)
    : null;
  const nextEntry = {
    id:
      matchingIndex >= 0
        ? state.activityLog[matchingIndex].id
        : createId("activity"),
    sourceTaskId: task.id,
    text: task.text,
    date: completionDate,
    goalId: getGoalIdFromTask(task),
    scheduleId: task.scheduleId || null,
    type: schedule ? normalizeScheduleType(schedule.type) : "manual",
    completedAt: Date.now(),
  };

  if (matchingIndex >= 0) {
    state.activityLog[matchingIndex] = nextEntry;
  } else {
    state.activityLog.unshift(nextEntry);
  }

  state.activityLog = state.activityLog
    .sort((left, right) => right.completedAt - left.completedAt)
    .slice(0, 600);
};

const applyTaskDoneState = (task, isDone) => {
  const wasDone = Boolean(task.done);
  task.done = Boolean(isDone);
  const taskGoalId = getGoalIdFromTask(task);
  const completionDate = task.createdForDate || getCurrentDateStamp();
  if (!wasDone && task.done) {
    adjustTodayCompletionCount(1);
    adjustGoalCompletionCount(taskGoalId, completionDate, 1);
    syncActivityLogForTask(task);
    showCompletionToast();
  }
  if (wasDone && !task.done) {
    adjustTodayCompletionCount(-1);
    adjustGoalCompletionCount(taskGoalId, completionDate, -1);
    syncActivityLogForTask(task);
  }
};

const finishTaskEditing = (taskItem, task) => {
  if (!taskItem || !task) {
    return;
  }

  const taskText = getTaskTextElement(taskItem);
  const saveButton = getSaveButton(taskItem);
  const editButton = getEditButton(taskItem);
  const nextText = taskText.textContent.trim() || "Untitled task";

  task.text = nextText;
  if (task.done) {
    syncActivityLogForTask(task);
  }
  taskText.textContent = nextText;
  taskText.contentEditable = "false";
  taskItem.classList.remove("is-editing");
  saveButton.classList.remove("is-visible");
  editButton.classList.remove("is-hidden");

  if (task.isScheduled) {
    const schedule = state.schedules.find(
      (item) => item.id === task.scheduleId,
    );
    if (schedule) {
      schedule.text = nextText;
      renderSchedules();
    }
  }

  saveStateToStorage();
};

clearAllButton.addEventListener("click", showClearAllModal);
openScheduleButton.addEventListener("click", showScheduleModal);
closeScheduleButton.addEventListener("click", hideScheduleModal);
openProgressButton.addEventListener("click", showProgressModal);
closeProgressButton.addEventListener("click", hideProgressModal);

if (toggleFinishedTasksButton) {
  toggleFinishedTasksButton.addEventListener("click", () => {
    state.showFinishedTasks = !state.showFinishedTasks;
    renderTasks();
    showSuccessToast(
      state.showFinishedTasks
        ? t("finishedTasksVisible")
        : t("finishedTasksHidden"),
    );
    saveStateToStorage();
  });
}

if (saveProgressQuoteButton) {
  saveProgressQuoteButton.addEventListener("click", () => {
    if (!progressQuoteInput) {
      return;
    }

    state.customQuote = progressQuoteInput.value.trim().slice(0, 180);
    renderProgressQuote();
    setProgressQuoteEditing(false);
    saveStateToStorage();
    showSuccessToast(
      state.customQuote ? t("customQuoteSaved") : t("usingDailyQuote"),
    );
  });
}

if (clearProgressQuoteButton) {
  clearProgressQuoteButton.addEventListener("click", () => {
    state.customQuote = "";
    renderProgressQuote();
    setProgressQuoteEditing(false);
    saveStateToStorage();
    showSuccessToast(t("dailyQuoteEnabled"));
  });
}

if (editProgressQuoteButton) {
  editProgressQuoteButton.addEventListener("click", () => {
    setProgressQuoteEditing(true);
  });
}

if (cancelProgressQuoteButton) {
  cancelProgressQuoteButton.addEventListener("click", () => {
    setProgressQuoteEditing(false);
    renderProgressQuote();
  });
}

if (themeToggleButton) {
  themeToggleButton.addEventListener("click", toggleTheme);
}

if (goalTypeSelect && goalDurationInput) {
  goalTypeSelect.addEventListener("change", () => {
    syncGoalFrequencyInputs({
      type: goalTypeSelect.value,
      durationInput: goalDurationInput,
      intervalInput: goalIntervalInput,
      intervalValue: goalTypeSelect.value === "period" ? "" : "1",
    });
  });
}

if (installAppButton) {
  installAppButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      showToast(t("installHelp"), "📲", "warning");
      return;
    }

    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome !== "accepted") {
      showToast(t("installCanceled"), "📲", "warning");
    }
    deferredInstallPrompt = null;
    updateInstallButtonState();
  });
}

confirmClearAllButton.addEventListener("click", () => {
  state.tasks = state.tasks.filter((task) => task.isScheduled);
  pendingDeleteTaskId = null;
  hideDeleteModal();
  hideClearAllModal();
  renderTasks();
  saveStateToStorage();
});

cancelClearAllButton.addEventListener("click", hideClearAllModal);

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = taskInput.value.trim();
  if (!text) {
    return;
  }

  state.tasks.push({
    id: createId("task"),
    text,
    done: false,
    isScheduled: false,
    scheduleId: null,
    createdForDate: null,
  });

  renderTasks();
  taskInput.value = "";
  taskInput.focus();
  saveStateToStorage();
});

scheduleForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = scheduleInput.value.trim();
  if (!text) {
    return;
  }
  const selectedGoalId = scheduleGoalSelect?.value || null;
  const scheduleType = normalizeScheduleType(scheduleTypeSelect?.value);
  let startDate = normalizeDateStamp(scheduleStartDateInput?.value);
  const intervalDays =
    scheduleType === "one-time"
      ? 1
      : shouldLockScheduleIntervalToGoal(selectedGoalId)
        ? 1
        : normalizePositiveInteger(scheduleIntervalInput?.value, 1);
  const weekdays =
    scheduleType === "one-time"
      ? [getDateStampWeekday(startDate)]
      : constrainWeekdaysToGoal(
          getSelectedWeekdaysFromPicker(scheduleWeekdayPicker),
          selectedGoalId,
          { fallback: [] },
        );

  if (scheduleType !== "one-time" && weekdays.length === 0) {
    showDuplicateWarning(t("selectAtLeastOneWeekday"));
    return;
  }

  if (selectedGoalId) {
    const goal = state.goals.find((item) => item.id === selectedGoalId);
    if (goal) {
      const aligned = alignScheduleStartDateWithGoal(startDate, goal);
      if (aligned.invalid) {
        showDuplicateWarning(t("scheduleOutsideGoalRange"));
        return;
      }

      if (aligned.adjusted) {
        showToast(t("scheduleStartAdjustedToGoal"), "ℹ️", "warning");
      }

      startDate = aligned.startDate;

      if (
        scheduleType === "one-time" &&
        !isDateWithinGoalBounds(goal, startDate)
      ) {
        showDuplicateWarning(t("scheduleOutsideGoalRange"));
        return;
      }
    }
  }

  const newSchedule = {
    id: createId("schedule"),
    text,
    type: scheduleType,
    goalId: selectedGoalId,
    startDate,
    intervalDays,
    weekdays,
    createdAt: Date.now(),
  };

  state.schedules.push(newSchedule);
  syncScheduledTasksForToday();

  renderSchedules();
  renderGoals();
  renderFinishedGoals();
  renderTasks();
  scheduleInput.value = "";
  if (scheduleIntervalInput) {
    scheduleIntervalInput.value = "1";
  }
  if (scheduleStartDateInput) {
    scheduleStartDateInput.value = getCurrentDateStamp();
  }
  if (scheduleWeekdayPicker) {
    renderWeekdayPickerButtons(scheduleWeekdayPicker, ALL_WEEKDAYS);
  }
  if (scheduleGoalSelect) {
    scheduleGoalSelect.value = "";
  }
  if (scheduleTypeSelect) {
    scheduleTypeSelect.value = "recurring";
  }
  syncScheduleDateBounds(null, scheduleStartDateInput);
  syncPrimaryScheduleFormMode();
  scheduleInput.focus();
  showSuccessToast(t("recurringScheduleCreated"));
  saveStateToStorage();
});

if (scheduleGoalSelect && scheduleIntervalInput) {
  scheduleGoalSelect.addEventListener("change", () => {
    syncScheduleIntervalLock(
      scheduleGoalSelect.value || null,
      scheduleIntervalInput,
    );
    const boundsResult = syncScheduleDateBounds(
      scheduleGoalSelect.value || null,
      scheduleStartDateInput,
      { enforceValue: true },
    );
    const weekdayResult = syncPrimaryScheduleFormMode();
    if (boundsResult.adjusted) {
      showToast(t("scheduleStartAdjustedToGoal"), "ℹ️", "warning");
    }
    if (boundsResult.invalid) {
      showDuplicateWarning(t("scheduleOutsideGoalRange"));
    }
    if (weekdayResult?.adjusted) {
      showToast(t("scheduleWeekdaysAdjustedToGoal"), "ℹ️", "warning");
    }
  });
}

if (scheduleTypeSelect) {
  scheduleTypeSelect.addEventListener("change", () => {
    const boundsResult = syncScheduleDateBounds(
      scheduleGoalSelect?.value || null,
      scheduleStartDateInput,
      { enforceValue: true },
    );
    syncPrimaryScheduleFormMode();
    if (boundsResult.adjusted) {
      showToast(t("scheduleStartAdjustedToGoal"), "ℹ️", "warning");
    }
    if (boundsResult.invalid) {
      showDuplicateWarning(t("scheduleOutsideGoalRange"));
    }
  });
}

if (scheduleWeekdayPicker) {
  scheduleWeekdayPicker.addEventListener("click", (event) => {
    const weekdayButton = event.target.closest(".weekday-btn");
    if (!weekdayButton) {
      return;
    }

    const willBeActive = !weekdayButton.classList.contains("is-active");
    weekdayButton.classList.toggle("is-active", willBeActive);
    weekdayButton.setAttribute("aria-pressed", String(willBeActive));
  });
}

if (goalWeekdayPicker) {
  goalWeekdayPicker.addEventListener("click", (event) => {
    const weekdayButton = event.target.closest(".weekday-btn");
    if (!weekdayButton) {
      return;
    }

    const willBeActive = !weekdayButton.classList.contains("is-active");
    weekdayButton.classList.toggle("is-active", willBeActive);
    weekdayButton.setAttribute("aria-pressed", String(willBeActive));
  });
}

goalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = goalTitleInput.value.trim();
  if (!title) {
    return;
  }

  if (isDuplicateGoalTitle(title)) {
    showDuplicateWarning(t("duplicateGoal"));
    goalTitleInput.focus();
    goalTitleInput.select();
    return;
  }

  const startDate = normalizeDateStamp(goalStartDateInput?.value);
  const isPeriodGoal = goalTypeSelect.value === "period";
  const durationDays = normalizePositiveInteger(
    goalDurationInput.value || 0,
    1,
  );
  const intervalDays = normalizePositiveInteger(
    goalIntervalInput?.value || 1,
    1,
  );
  const cycleDays = normalizeOptionalPositiveInteger(goalIntervalInput?.value);
  const goalWeekdays = getSelectedWeekdaysFromPicker(goalWeekdayPicker);
  const selectedColor = normalizeGoalColor(goalColorInput?.value);
  let endDate = null;

  if (goalWeekdays.length === 0) {
    showDuplicateWarning(t("selectAtLeastOneWeekday"));
    return;
  }

  if (!selectedColor) {
    showDuplicateWarning(t("invalidGoalColor"));
    goalColorInput?.focus();
    return;
  }

  if (isGoalColorInUse(selectedColor)) {
    showDuplicateWarning(t("goalColorInUse"));
    goalColorInput?.focus();
    return;
  }

  if (isPeriodGoal) {
    if (!Number.isFinite(durationDays) || durationDays < 1) {
      showDuplicateWarning(t("invalidPeriodDays"));
      goalDurationInput.focus();
      return;
    }
    if (!cycleDays) {
      endDate = addDaysToDateStamp(startDate, durationDays - 1);
    }
  } else if (!goalIntervalInput?.value || intervalDays < 1) {
    showDuplicateWarning(t("invalidHabitFrequency"));
    goalIntervalInput?.focus();
    return;
  }

  state.goals.push({
    id: createId("goal"),
    title,
    type: isPeriodGoal ? "period" : "habit",
    color: selectedColor,
    startDate,
    weekdays: goalWeekdays,
    endDate,
    durationDays: isPeriodGoal ? durationDays : null,
    intervalDays: isPeriodGoal ? 1 : intervalDays,
    cycleDays: isPeriodGoal ? cycleDays : null,
    finishedAt: null,
    createdAt: Date.now(),
  });

  renderGoals();
  renderFinishedGoals();
  renderProgressCharts();
  goalTitleInput.value = "";
  goalTypeSelect.value = "habit";
  goalDurationInput.value = "";
  if (goalIntervalInput) {
    goalIntervalInput.value = "1";
  }
  if (goalStartDateInput) {
    goalStartDateInput.value = getCurrentDateStamp();
  }
  if (goalWeekdayPicker) {
    renderWeekdayPickerButtons(goalWeekdayPicker, ALL_WEEKDAYS);
  }
  syncGoalFrequencyInputs({
    type: "habit",
    durationInput: goalDurationInput,
    intervalInput: goalIntervalInput,
    intervalValue: "1",
  });
  if (goalColorInput) {
    goalColorInput.value = getNextAvailableGoalColor();
  }
  goalTitleInput.focus();
  showSuccessToast(t("goalCreated"));
  saveStateToStorage();
});

goalList.addEventListener("click", (event) => {
  const weekdayButton = event.target.closest(
    ".goal-edit-weekday-picker .weekday-btn",
  );
  if (weekdayButton) {
    const willBeActive = !weekdayButton.classList.contains("is-active");
    weekdayButton.classList.toggle("is-active", willBeActive);
    weekdayButton.setAttribute("aria-pressed", String(willBeActive));
    return;
  }

  const moveUpButton = event.target.closest(".goal-move-up-btn");
  const moveDownButton = event.target.closest(".goal-move-down-btn");
  if (moveUpButton || moveDownButton) {
    const goalItem = event.target.closest(".goal-item");
    if (!goalItem) {
      return;
    }

    const goalId = goalItem.dataset.goalId;
    const direction = moveUpButton ? -1 : 1;
    const moved = moveGoalInActiveOrder(goalId, direction);
    if (!moved) {
      return;
    }

    sortScheduledTasksByGoalOrder();
    renderGoals();
    renderSchedules();
    renderProgressCharts();
    renderTasks();
    saveStateToStorage();
    return;
  }

  const editButton = event.target.closest(".goal-edit-btn");
  if (editButton) {
    const goalItem = editButton.closest(".goal-item");
    if (!goalItem) {
      return;
    }

    goalItem.classList.add("is-editing");
    const titleInput = goalItem.querySelector(".goal-edit-title-input");
    if (titleInput) {
      titleInput.focus();
      titleInput.select();
    }
    return;
  }

  const cancelButton = event.target.closest(".goal-cancel-btn");
  if (cancelButton) {
    const goalItem = cancelButton.closest(".goal-item");
    if (!goalItem) {
      return;
    }

    goalItem.classList.remove("is-editing");
    return;
  }

  const finishButton = event.target.closest(".goal-finish-btn");
  if (finishButton) {
    const goalItem = finishButton.closest(".goal-item");
    if (!goalItem) {
      return;
    }

    const goalId = goalItem.dataset.goalId;
    const goal = state.goals.find((item) => item.id === goalId);
    if (!goal) {
      return;
    }

    goal.finishedAt = getCurrentDateStamp();
    syncScheduledTasksForToday();
    renderGoals();
    renderFinishedGoals();
    renderSchedules();
    renderProgressCharts();
    renderTasks();
    showSuccessToast(t("goalFinished"));
    saveStateToStorage();
    return;
  }

  const saveButton = event.target.closest(".goal-save-btn");
  if (saveButton) {
    const goalItem = saveButton.closest(".goal-item");
    if (!goalItem) {
      return;
    }

    const goalId = goalItem.dataset.goalId;
    const goal = state.goals.find((item) => item.id === goalId);
    if (!goal) {
      return;
    }

    const titleInput = goalItem.querySelector(".goal-edit-title-input");
    const typeSelect = goalItem.querySelector(".goal-edit-type-select");
    const durationInput = goalItem.querySelector(".goal-edit-duration-input");
    const intervalInput = goalItem.querySelector(".goal-edit-interval-input");
    const startDateInput = goalItem.querySelector(
      ".goal-edit-start-date-input",
    );
    const weekdayPicker = goalItem.querySelector(".goal-edit-weekday-picker");
    const colorInput = goalItem.querySelector(".goal-edit-color-input");

    const nextTitle = titleInput?.value.trim() || "";
    const nextType = typeSelect?.value === "period" ? "period" : "habit";
    const nextStartDate = normalizeDateStamp(startDateInput?.value);
    const nextWeekdays = getSelectedWeekdaysFromPicker(weekdayPicker);

    if (nextWeekdays.length === 0) {
      showDuplicateWarning(t("selectAtLeastOneWeekday"));
      return;
    }

    if (!nextTitle) {
      showDuplicateWarning(t("goalNameEmpty"));
      titleInput?.focus();
      return;
    }

    if (isDuplicateGoalTitle(nextTitle, goalId)) {
      showDuplicateWarning(t("duplicateGoal"));
      titleInput?.focus();
      titleInput?.select();
      return;
    }

    let nextEndDate = null;
    let nextDurationDays = null;
    let nextIntervalDays = 1;
    let nextCycleDays = null;
    if (nextType === "period") {
      const durationDays = Number(durationInput?.value || 0);
      if (!Number.isFinite(durationDays) || durationDays < 1) {
        showDuplicateWarning(t("invalidPeriodDays"));
        durationInput?.focus();
        return;
      }
      nextDurationDays = Math.floor(durationDays);
      nextCycleDays = normalizeOptionalPositiveInteger(intervalInput?.value);
      nextEndDate = nextCycleDays
        ? null
        : addDaysToDateStamp(nextStartDate, nextDurationDays - 1);
    } else {
      nextIntervalDays = normalizePositiveInteger(intervalInput?.value, 1);
      if (!intervalInput?.value || nextIntervalDays < 1) {
        showDuplicateWarning(t("invalidHabitFrequency"));
        intervalInput?.focus();
        return;
      }
    }

    const nextColor = normalizeGoalColor(colorInput?.value);
    if (!nextColor) {
      showDuplicateWarning(t("invalidGoalColor"));
      colorInput?.focus();
      return;
    }

    if (isGoalColorInUse(nextColor, goalId)) {
      showDuplicateWarning(t("goalColorInUse"));
      colorInput?.focus();
      return;
    }

    goal.title = nextTitle;
    goal.type = nextType;
    goal.startDate = nextStartDate;
    goal.weekdays = nextWeekdays;
    goal.endDate = nextEndDate;
    goal.durationDays = nextDurationDays;
    goal.intervalDays = nextIntervalDays;
    goal.cycleDays = nextCycleDays;
    goal.color = nextColor;
    const scheduleDaysAdjusted = sanitizeSchedulesForGoal(goalId);

    goalItem.classList.remove("is-editing");
    syncScheduledTasksForToday();
    renderGoals();
    renderFinishedGoals();
    renderSchedules();
    renderProgressCharts();
    renderTasks();
    if (scheduleDaysAdjusted) {
      showToast(t("scheduleWeekdaysAdjustedToGoal"), "ℹ️", "warning");
    }
    showSuccessToast(t("goalUpdated"));
    saveStateToStorage();
    return;
  }

  const removeButton = event.target.closest(".goal-remove-btn");
  if (!removeButton) {
    return;
  }

  const goalItem = removeButton.closest(".goal-item");
  if (!goalItem) {
    return;
  }

  const goalId = goalItem.dataset.goalId;
  showRemoveGoalModal(goalId);
});

cancelRemoveGoalButton.addEventListener("click", hideRemoveGoalModal);

if (finishedGoalsList) {
  finishedGoalsList.addEventListener("click", (event) => {
    const unfinishBtn = event.target.closest(".goal-unfinish-btn");
    if (!unfinishBtn) {
      return;
    }

    const item = unfinishBtn.closest(".finished-goal-item");
    if (!item) {
      return;
    }

    const goalId = item.dataset.goalId;
    const goal = state.goals.find((g) => g.id === goalId);
    if (!goal) {
      return;
    }

    goal.finishedAt = null;
    // If it's a period goal whose end date is already in the past, extend to today so it's active.
    if (goal.type === "period" && goal.endDate) {
      const today = getCurrentDateStamp();
      if (daysBetweenDateStamps(goal.endDate, today) > 0) {
        goal.endDate = today;
      }
    }

    syncScheduledTasksForToday();
    renderGoals();
    renderFinishedGoals();
    renderSchedules();
    renderProgressCharts();
    renderTasks();
    showSuccessToast(t("goalReactivated"));
    saveStateToStorage();
  });
}

confirmRemoveGoalButton.addEventListener("click", () => {
  if (!pendingRemoveGoalId) {
    hideRemoveGoalModal();
    return;
  }

  const goalIdToRemove = pendingRemoveGoalId;
  hideRemoveGoalModal();
  removeGoalById(goalIdToRemove);
});

if (toggleFinishedGoalsButton && finishedGoalsPanel) {
  toggleFinishedGoalsButton.addEventListener("click", () => {
    const isOpen = !finishedGoalsPanel.classList.contains("is-open");
    if (isOpen) {
      openCollapsiblePanel(finishedGoalsPanel);
    } else {
      closeCollapsiblePanel(finishedGoalsPanel);
    }
    renderFinishedGoals();
  });
}

goalList.addEventListener("change", (event) => {
  const typeSelect = event.target.closest(".goal-edit-type-select");
  if (!typeSelect) {
    return;
  }

  const goalItem = typeSelect.closest(".goal-item");
  if (!goalItem) {
    return;
  }

  const durationInput = goalItem.querySelector(".goal-edit-duration-input");
  const intervalInput = goalItem.querySelector(".goal-edit-interval-input");
  if (!durationInput || !intervalInput) {
    return;
  }

  syncGoalFrequencyInputs({
    type: typeSelect.value,
    durationInput,
    intervalInput,
    intervalValue: typeSelect.value === "period" ? "" : "1",
  });
});

scheduleList.addEventListener("click", (event) => {
  const weekdayButton = event.target.closest(
    ".schedule-edit-weekday-picker .weekday-btn",
  );
  if (weekdayButton) {
    const willBeActive = !weekdayButton.classList.contains("is-active");
    weekdayButton.classList.toggle("is-active", willBeActive);
    weekdayButton.setAttribute("aria-pressed", String(willBeActive));
    return;
  }

  const moveUpButton = event.target.closest(".schedule-move-up-btn");
  const moveDownButton = event.target.closest(".schedule-move-down-btn");
  if (moveUpButton || moveDownButton) {
    const scheduleItem = event.target.closest(".schedule-item");
    if (!scheduleItem) {
      return;
    }

    const scheduleId = scheduleItem.dataset.scheduleId;
    const direction = moveUpButton ? -1 : 1;
    const moved = moveScheduleWithinGoalGroup(scheduleId, direction);
    if (!moved) {
      return;
    }

    syncScheduledTasksForToday();
    renderSchedules();
    renderGoals();
    renderTasks();
    saveStateToStorage();
    return;
  }

  const editButton = event.target.closest(".schedule-edit-btn");
  if (editButton) {
    const scheduleItem = editButton.closest(".schedule-item");
    if (!scheduleItem) {
      return;
    }

    const scheduleId = scheduleItem.dataset.scheduleId;
    const schedule = state.schedules.find((item) => item.id === scheduleId);
    const goalSelect = scheduleItem.querySelector(".schedule-edit-goal-select");
    if (schedule && goalSelect) {
      goalSelect.innerHTML = buildGoalOptionsMarkup(schedule.goalId || "");
    }
    const typeSelect = scheduleItem.querySelector(".schedule-edit-type-select");
    if (typeSelect) {
      typeSelect.value = normalizeScheduleType(schedule?.type);
    }
    const intervalInput = scheduleItem.querySelector(
      ".schedule-edit-interval-input",
    );
    syncScheduleItemFormMode(scheduleItem, {
      type: typeSelect?.value || schedule?.type,
      goalId: schedule?.goalId || null,
      startDateLocked: shouldLockScheduleStartDate(schedule),
    });

    scheduleItem.classList.add("is-editing");
    const editInput = scheduleItem.querySelector(".schedule-edit-input");
    if (editInput) {
      editInput.focus();
      editInput.select();
    }
    return;
  }

  const cancelButton = event.target.closest(".schedule-cancel-btn");
  if (cancelButton) {
    const scheduleItem = cancelButton.closest(".schedule-item");
    if (!scheduleItem) {
      return;
    }
    scheduleItem.classList.remove("is-editing");
    return;
  }

  const saveButton = event.target.closest(".schedule-save-btn");
  if (saveButton) {
    const scheduleItem = saveButton.closest(".schedule-item");
    if (!scheduleItem) {
      return;
    }

    const scheduleId = scheduleItem.dataset.scheduleId;
    const schedule = state.schedules.find((item) => item.id === scheduleId);
    if (!schedule) {
      return;
    }

    const editInput = scheduleItem.querySelector(".schedule-edit-input");
    const typeSelect = scheduleItem.querySelector(".schedule-edit-type-select");
    const goalSelect = scheduleItem.querySelector(".schedule-edit-goal-select");
    const intervalInput = scheduleItem.querySelector(
      ".schedule-edit-interval-input",
    );
    const startDateInput = scheduleItem.querySelector(
      ".schedule-edit-start-date-input",
    );
    const weekdayPicker = scheduleItem.querySelector(
      ".schedule-edit-weekday-picker",
    );
    const isStartDateLocked = shouldLockScheduleStartDate(schedule);
    const nextText = editInput?.value.trim() || "";
    const nextType = normalizeScheduleType(typeSelect?.value);
    const nextGoalId = goalSelect?.value || null;

    let nextStartDate = isStartDateLocked
      ? schedule.startDate
      : normalizeDateStamp(startDateInput?.value);

    const nextIntervalDays =
      nextType === "one-time"
        ? 1
        : shouldLockScheduleIntervalToGoal(nextGoalId)
          ? 1
          : normalizePositiveInteger(intervalInput?.value, 1);
    const selectedWeekdays =
      nextType === "one-time"
        ? [getDateStampWeekday(nextStartDate)]
        : constrainWeekdaysToGoal(
            getSelectedWeekdaysFromPicker(weekdayPicker),
            nextGoalId,
            { fallback: [] },
          );
    if (nextType !== "one-time" && selectedWeekdays.length === 0) {
      showDuplicateWarning(t("selectAtLeastOneWeekday"));
      return;
    }

    if (!nextText) {
      showDuplicateWarning(t("scheduleTextEmpty"));
      editInput?.focus();
      return;
    }

    if (nextGoalId) {
      const goal = state.goals.find((item) => item.id === nextGoalId);
      if (goal) {
        const aligned = alignScheduleStartDateWithGoal(nextStartDate, goal);
        if (aligned.invalid) {
          showDuplicateWarning(t("scheduleOutsideGoalRange"));
          return;
        }

        if (aligned.adjusted) {
          showToast(t("scheduleStartAdjustedToGoal"), "ℹ️", "warning");
        }

        nextStartDate = aligned.startDate;

        if (
          nextType === "one-time" &&
          !isDateWithinGoalBounds(goal, nextStartDate)
        ) {
          showDuplicateWarning(t("scheduleOutsideGoalRange"));
          return;
        }
      }
    }

    const previousGoalId = schedule.goalId || null;
    schedule.text = nextText;
    schedule.type = nextType;
    schedule.goalId = nextGoalId;
    schedule.intervalDays = nextIntervalDays;
    schedule.startDate = nextStartDate;
    schedule.weekdays = selectedWeekdays;

    state.tasks = state.tasks.map((task) =>
      task.scheduleId === scheduleId ? { ...task, text: nextText } : task,
    );
    transferCompletedScheduleScoresToGoal(
      scheduleId,
      previousGoalId,
      nextGoalId,
    );

    syncScheduledTasksForToday();
    renderSchedules();
    renderGoals();
    renderFinishedGoals();
    renderProgressCharts();
    renderTasks();
    showSuccessToast(t("recurringScheduleUpdated"));
    saveStateToStorage();
    return;
  }

  const removeButton = event.target.closest(".schedule-remove-btn");
  if (!removeButton) {
    return;
  }

  const scheduleItem = removeButton.closest(".schedule-item");
  if (!scheduleItem) {
    return;
  }

  const scheduleId = scheduleItem.dataset.scheduleId;
  const schedule = state.schedules.find((item) => item.id === scheduleId);
  if (!schedule) {
    return;
  }

  if (schedule.goalId) {
    const linkedTaskCount = state.schedules.filter(
      (item) => item.goalId === schedule.goalId,
    ).length;
    if (linkedTaskCount <= 1) {
      showDuplicateWarning(t("onlyTaskInGoal"));
      return;
    }

    showDeleteModal({
      scheduleId,
      title: t("removeGoalTaskQuestion"),
      message: t("removeGoalTaskMessage"),
    });
    return;
  }

  removeScheduleById(scheduleId);
});

scheduleList.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") {
    return;
  }

  const editInput = event.target.closest(".schedule-edit-input");
  if (!editInput) {
    return;
  }

  event.preventDefault();
  const scheduleItem = editInput.closest(".schedule-item");
  if (!scheduleItem) {
    return;
  }

  const saveButton = scheduleItem.querySelector(".schedule-save-btn");
  if (saveButton) {
    saveButton.click();
  }
});

scheduleList.addEventListener("change", (event) => {
  const scheduleItem = event.target.closest(".schedule-item");
  if (!scheduleItem) {
    return;
  }

  const scheduleId = scheduleItem.dataset.scheduleId;
  const schedule = state.schedules.find((item) => item.id === scheduleId);
  const goalSelect = scheduleItem.querySelector(".schedule-edit-goal-select");
  const typeSelect = scheduleItem.querySelector(".schedule-edit-type-select");
  const startDateInput = scheduleItem.querySelector(
    ".schedule-edit-start-date-input",
  );

  if (event.target.closest(".schedule-edit-type-select")) {
    syncScheduleItemFormMode(scheduleItem, {
      type: typeSelect?.value,
      goalId: goalSelect?.value || null,
      startDateLocked: shouldLockScheduleStartDate(schedule),
    });
    return;
  }

  if (!event.target.closest(".schedule-edit-goal-select")) {
    return;
  }

  const boundsResult = syncScheduleDateBounds(
    goalSelect?.value || null,
    startDateInput,
    {
      enforceValue: true,
    },
  );
  const weekdayResult = syncScheduleItemFormMode(scheduleItem, {
    type: typeSelect?.value,
    goalId: goalSelect?.value || null,
    startDateLocked: shouldLockScheduleStartDate(schedule),
  });
  if (boundsResult.invalid) {
    showDuplicateWarning(t("scheduleOutsideGoalRange"));
  }
  if (boundsResult.adjusted) {
    showToast(t("scheduleStartAdjustedToGoal"), "ℹ️", "warning");
  }
  if (weekdayResult?.adjusted) {
    showToast(t("scheduleWeekdaysAdjustedToGoal"), "ℹ️", "warning");
  }
});

todoList.addEventListener("click", (event) => {
  if (Date.now() < suppressClickUntil) {
    event.preventDefault();
    return;
  }

  const taskItem = event.target.closest(".todo-item");
  if (taskItem) {
    const clickedActionButton = event.target.closest(".todo-action-btn");
    const clickedCheckbox = event.target.matches('input[type="checkbox"]');
    const isEditing = taskItem.classList.contains("is-editing");

    if (!clickedActionButton && !clickedCheckbox && !isEditing) {
      const checkbox = taskItem.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
        const task = findTaskById(taskItem.dataset.taskId);
        handleTaskCompletionToggle(taskItem, task, checkbox.checked);
      }
    }
  }

  const clickedButton = event.target.closest(".todo-action-btn");
  if (!clickedButton) {
    return;
  }

  const clickedTaskItem = clickedButton.closest(".todo-item");
  if (!clickedTaskItem) {
    return;
  }

  const task = findTaskById(clickedTaskItem.dataset.taskId);
  if (!task) {
    return;
  }

  const taskText = getTaskTextElement(clickedTaskItem);
  const saveButton = getSaveButton(clickedTaskItem);
  const editButton = getEditButton(clickedTaskItem);

  if (clickedButton.classList.contains("todo-edit-btn")) {
    taskText.contentEditable = "true";
    taskText.focus();
    const selection = document.getSelection();
    if (selection) {
      selection.selectAllChildren(taskText);
      selection.collapseToEnd();
    }
    clickedTaskItem.classList.add("is-editing");
    saveButton.classList.add("is-visible");
    editButton.classList.add("is-hidden");
  }

  if (clickedButton.classList.contains("todo-save-btn")) {
    finishTaskEditing(clickedTaskItem, task);
  }

  if (clickedButton.classList.contains("todo-delete-btn")) {
    if (task.isScheduled) {
      return;
    }
    showDeleteModal({ taskId: task.id });
  }
});

todoList.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") {
    return;
  }

  const editableText = event.target.closest(".todo-item-text");
  if (!editableText || editableText.contentEditable !== "true") {
    return;
  }

  event.preventDefault();

  const taskItem = editableText.closest(".todo-item");
  if (!taskItem) {
    return;
  }

  const task = findTaskById(taskItem.dataset.taskId);
  if (!task) {
    return;
  }

  finishTaskEditing(taskItem, task);
});

todoList.addEventListener("change", (event) => {
  if (!event.target.matches('input[type="checkbox"]')) {
    return;
  }

  const taskItem = event.target.closest(".todo-item");
  if (!taskItem) {
    return;
  }

  const task = findTaskById(taskItem.dataset.taskId);
  if (!task) {
    return;
  }

  handleTaskCompletionToggle(taskItem, task, event.target.checked);
});

todoList.addEventListener("dragstart", (event) => {
  if (isTouchReorderMode) {
    event.preventDefault();
    return;
  }

  const taskItem = event.target.closest(".todo-item");
  if (!taskItem) {
    return;
  }

  const task = findTaskById(taskItem.dataset.taskId);
  if (!task || task.done) {
    event.preventDefault();
    return;
  }

  draggedTaskId = task.id;
  lastDragPointerY = null;
  taskItem.classList.add("is-dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", task.id);
  ensureDragAutoScroll();
});

todoList.addEventListener("dragover", (event) => {
  if (!draggedTaskId) {
    return;
  }

  event.preventDefault();
  lastDragPointerY = event.clientY;
  dropInsertIndex = getDropInsertIndexFromPointer(event.clientY);
  updateDropIndicatorByInsertIndex(dropInsertIndex);
  ensureDragAutoScroll();
});

todoList.addEventListener("drop", (event) => {
  if (!draggedTaskId) {
    return;
  }

  event.preventDefault();
  lastDragPointerY = event.clientY;
  handleDropReorder();
  clearDropIndicators();
  draggedTaskId = null;
  lastDragPointerY = null;
  stopDragAutoScroll();
});

todoList.addEventListener("dragend", () => {
  if (draggedTaskId) {
    handleDropReorder();
  }
  clearDropIndicators();
  draggedTaskId = null;
  lastDragPointerY = null;
  stopDragAutoScroll();
});

todoList.addEventListener(
  "touchstart",
  (event) => {
    if (event.touches.length !== 1) {
      return;
    }

    const taskItem = event.target.closest(".todo-item");
    if (!taskItem) {
      return;
    }

    if (
      event.target.closest(".todo-action-btn") ||
      event.target.closest('input[type="checkbox"]') ||
      taskItem.classList.contains("is-editing")
    ) {
      return;
    }

    const task = findTaskById(taskItem.dataset.taskId);
    if (!task || task.done) {
      return;
    }

    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    touchDidMove = false;
    isTouchDragging = false;
    touchCandidateTaskId = task.id;

    if (touchDragActivationTimer) {
      clearTimeout(touchDragActivationTimer);
    }

    touchDragActivationTimer = setTimeout(() => {
      if (!touchCandidateTaskId) {
        return;
      }

      draggedTaskId = touchCandidateTaskId;
      isTouchDragging = true;
      lastDragPointerY = touchStartY;
      const dragItem = todoList.querySelector(
        `.todo-item[data-task-id="${draggedTaskId}"]`,
      );
      if (dragItem) {
        dragItem.classList.add("is-dragging");
      }
      ensureDragAutoScroll();
      touchDragActivationTimer = null;
    }, TOUCH_DRAG_HOLD_MS);
  },
  { passive: true },
);

todoList.addEventListener(
  "touchmove",
  (event) => {
    if (event.touches.length !== 1) {
      return;
    }

    const touch = event.touches[0];

    if (!isTouchDragging) {
      if (!touchCandidateTaskId) {
        return;
      }

      const movedX = Math.abs(touch.clientX - touchStartX);
      const movedY = Math.abs(touch.clientY - touchStartY);
      if (movedX > TOUCH_MOVE_CANCEL_PX || movedY > TOUCH_MOVE_CANCEL_PX) {
        cancelTouchDragActivation();
      }
      return;
    }

    if (!draggedTaskId) {
      return;
    }

    touchDidMove = true;
    event.preventDefault();
    lastDragPointerY = touch.clientY;
    const hoveredElement = document.elementFromPoint(
      touch.clientX,
      touch.clientY,
    );
    void hoveredElement;

    dropInsertIndex = getDropInsertIndexFromPointer(touch.clientY);
    updateDropIndicatorByInsertIndex(dropInsertIndex);
    ensureDragAutoScroll();
  },
  { passive: false },
);

todoList.addEventListener("touchend", () => {
  cancelTouchDragActivation();

  if (!isTouchDragging || !draggedTaskId) {
    return;
  }

  handleDropReorder();
  clearDropIndicators();
  if (touchDidMove) {
    suppressClickUntil = Date.now() + 250;
  }
  draggedTaskId = null;
  isTouchDragging = false;
  touchDidMove = false;
  lastDragPointerY = null;
  stopDragAutoScroll();
});

todoList.addEventListener("touchcancel", () => {
  cancelTouchDragActivation();

  if (!isTouchDragging) {
    return;
  }

  clearDropIndicators();
  draggedTaskId = null;
  isTouchDragging = false;
  touchDidMove = false;
  lastDragPointerY = null;
  stopDragAutoScroll();
});

cancelDeleteButton.addEventListener("click", hideDeleteModal);

confirmDeleteButton.addEventListener("click", () => {
  if (pendingDeleteTaskId) {
    state.tasks = state.tasks.filter((task) => task.id !== pendingDeleteTaskId);
    renderTasks();
    saveStateToStorage();
    hideDeleteModal();
    return;
  }

  if (pendingDeleteScheduleId) {
    removeScheduleById(pendingDeleteScheduleId);
    hideDeleteModal();
    return;
  }

  hideDeleteModal();
});

deleteModal.addEventListener("click", (event) => {
  if (event.target === deleteModal) {
    hideDeleteModal();
  }
});

clearAllModal.addEventListener("click", (event) => {
  if (event.target === clearAllModal) {
    hideClearAllModal();
  }
});

scheduleModal.addEventListener("click", (event) => {
  if (event.target === scheduleModal) {
    hideScheduleModal();
  }
});

progressModal.addEventListener("click", (event) => {
  if (event.target === progressModal) {
    hideProgressModal();
  }
});

removeGoalModal.addEventListener("click", (event) => {
  if (event.target === removeGoalModal) {
    hideRemoveGoalModal();
  }
});

applyStaticTranslations();
if (
  scheduleWeekdayPicker &&
  getSelectedWeekdaysFromPicker(scheduleWeekdayPicker).length === 0
) {
  renderWeekdayPickerButtons(scheduleWeekdayPicker, ALL_WEEKDAYS);
}
if (
  goalWeekdayPicker &&
  getSelectedWeekdaysFromPicker(goalWeekdayPicker).length === 0
) {
  renderWeekdayPickerButtons(goalWeekdayPicker, ALL_WEEKDAYS);
}
initializeState();
if (goalColorInput) {
  goalColorInput.value = getNextAvailableGoalColor();
}
if (goalStartDateInput && !goalStartDateInput.value) {
  goalStartDateInput.value = getCurrentDateStamp();
}
if (scheduleStartDateInput && !scheduleStartDateInput.value) {
  scheduleStartDateInput.value = getCurrentDateStamp();
}
syncGoalFrequencyInputs({
  type: goalTypeSelect?.value || "habit",
  durationInput: goalDurationInput,
  intervalInput: goalIntervalInput,
  intervalValue: "1",
});
applyTheme(getStoredTheme());
syncDailyQuoteSurface();

window.addEventListener("beforeinstallprompt", (event) => {
  deferredInstallPrompt = event;
  updateInstallButtonState();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  updateInstallButtonState();
  showSuccessToast(t("appInstalled"));
});

window.addEventListener("resize", updateInstallButtonState);

window.addEventListener("load", () => {
  const loader = document.getElementById("page-loader");
  if (loader) {
    loader.classList.add("is-hidden");
  }

  updateInstallButtonState();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./sw.js")
      .then((registration) => {
        registration.update();
      })
      .catch(() => {
        // Keep app functional even if SW registration fails.
      });
  }
});
