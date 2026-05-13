import { appLanguage, formatDisplayDate, getLocalizedList, t } from "./i18n.js";
import {
  baseGoals,
  CURRENT_PERIOD_CHART_COLOR,
  MONTH_CHART_COLORS,
  WEEKDAY_CHART_COLORS,
} from "./constants.js";
import {
  appSubtitle,
  badgeListElement,
  bestStreakElement,
  checkedCountElement,
  clearAllButton,
  congratsMessage,
  currentStreakElement,
  editProgressQuoteButton,
  finishedGoalsList,
  finishedGoalsPanel,
  goalList,
  goalProgressList,
  monthChart,
  progressQuoteCard,
  progressQuoteDisplay,
  progressQuoteEditor,
  progressQuoteInput,
  rewardProgressBarElement,
  scheduleGoalSelect,
  scheduleIntervalInput,
  scheduleList,
  scheduleStartDateInput,
  todoList,
  toggleFinishedGoalsButton,
  uncheckedCountElement,
  weekChart,
  yearChartLabel,
} from "./dom.js";
import {
  addDaysToDateStamp,
  daysBetweenDateStamps,
  getCurrentDateStamp,
  normalizeDateStamp,
  normalizePositiveInteger,
  parseDateStampUtc,
} from "./date-utils.js";

export const createRenderers = ({
  closeCollapsiblePanel,
  createTaskElement,
  getActiveGoals,
  getDayWord,
  getFinishedGoals,
  getGoalColor,
  getGoalDurationDays,
  getGoalIdFromTask,
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
}) => {
  let isProgressQuoteEditing = false;

  const getSortedCompletionDays = () => {
    return Object.keys(state.stats.dailyCompletions)
      .filter(
        (dateStamp) => Number(state.stats.dailyCompletions[dateStamp]) > 0,
      )
      .sort();
  };

  const getCurrentStreak = () => {
    const completionDays = getSortedCompletionDays();
    if (completionDays.length === 0) {
      return 0;
    }

    const today = getCurrentDateStamp();
    const parseUtc = (dateStamp) => {
      const [year, month, day] = dateStamp.split("-").map(Number);
      return Date.UTC(year, month - 1, day);
    };

    const lastDay = completionDays[completionDays.length - 1];
    const todayUtc = parseUtc(today);
    const lastDayUtc = parseUtc(lastDay);
    const daysSinceLastCompletion =
      (todayUtc - lastDayUtc) / (1000 * 60 * 60 * 24);

    if (daysSinceLastCompletion > 1) {
      return 0;
    }

    let streak = 1;
    for (let index = completionDays.length - 1; index > 0; index -= 1) {
      const current = parseUtc(completionDays[index]);
      const previous = parseUtc(completionDays[index - 1]);
      const diff = (current - previous) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak += 1;
      } else {
        break;
      }
    }

    return streak;
  };

  const getBestStreak = () => {
    const completionDays = getSortedCompletionDays();
    if (completionDays.length === 0) {
      return 0;
    }

    const parseUtc = (dateStamp) => {
      const [year, month, day] = dateStamp.split("-").map(Number);
      return Date.UTC(year, month - 1, day);
    };

    let best = 1;
    let current = 1;
    for (let index = 1; index < completionDays.length; index += 1) {
      const previous = parseUtc(completionDays[index - 1]);
      const next = parseUtc(completionDays[index]);
      const diff = (next - previous) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        current += 1;
        if (current > best) {
          best = current;
        }
      } else {
        current = 1;
      }
    }

    return best;
  };

  const getNextGoal = (streak) => {
    const fixedGoal = baseGoals.find((goal) => goal > streak);
    if (fixedGoal) {
      return fixedGoal;
    }

    return Math.ceil((streak + 1) / 30) * 30;
  };

  const updateTaskSummary = () => {
    const totalTasks = state.tasks.length;
    const checkedTasks = state.tasks.filter((task) => task.done).length;
    const uncheckedTasks = totalTasks - checkedTasks;

    const checkedLabelElement = document.getElementById("checked-label");
    const uncheckedLabelElement = document.getElementById("unchecked-label");
    if (checkedLabelElement) {
      checkedLabelElement.textContent = t("checkedLabel");
    }
    if (uncheckedLabelElement) {
      uncheckedLabelElement.textContent = t("uncheckedLabel");
    }

    checkedCountElement.textContent = String(checkedTasks);
    uncheckedCountElement.textContent = String(uncheckedTasks);
    clearAllButton.disabled = totalTasks === 0;

    const shouldCelebrate = totalTasks > 0 && checkedTasks === totalTasks;
    congratsMessage.hidden = !shouldCelebrate;
  };

  const renderStreakDashboard = () => {
    const streak = getCurrentStreak();
    const bestStreak = getBestStreak();
    const nextGoal = getNextGoal(streak);
    const previousGoal =
      nextGoal === 3
        ? 0
        : baseGoals.includes(nextGoal)
          ? baseGoals[baseGoals.indexOf(nextGoal) - 1]
          : nextGoal - 30;
    const tierLength = Math.max(nextGoal - previousGoal, 1);
    const tierProgress = Math.min(
      ((streak - previousGoal) / tierLength) * 100,
      100,
    );

    currentStreakElement.textContent = String(streak);
    bestStreakElement.textContent = String(bestStreak);
    rewardProgressBarElement.style.width = `${Math.max(tierProgress, 0)}%`;

    const streakFractionEl = document.getElementById("streak-goal-fraction");
    if (streakFractionEl) {
      streakFractionEl.textContent = `/${nextGoal}`;
    }

    const streakUnitEl = document.getElementById("streak-main-unit");
    if (streakUnitEl) {
      streakUnitEl.textContent = streak === 1 ? t("day") : t("days");
    }

    const streakBestBadge = document.getElementById("streak-best-badge");
    if (streakBestBadge) {
      streakBestBadge.hidden = streak === 0 || streak < bestStreak;
    }

    badgeListElement.innerHTML = "";
    baseGoals
      .filter((goal) => streak >= goal)
      .forEach((goal) => {
        const badge = document.createElement("span");
        badge.className = "badge-chip";
        badge.textContent = t("unlockedBadge", { count: goal });
        badgeListElement.appendChild(badge);
      });
  };

  const getDailyMotivationQuote = (dateStamp) => {
    const localizedQuotes = getLocalizedList("dailyQuotes");
    if (!Array.isArray(localizedQuotes) || localizedQuotes.length === 0) {
      return t("defaultQuote");
    }

    const [year, month, day] = dateStamp.split("-").map(Number);
    const quoteSeed = (year * 372 + month * 31 + day) % localizedQuotes.length;
    return localizedQuotes[quoteSeed];
  };

  const getResolvedProgressQuote = (dateStamp = getCurrentDateStamp()) => {
    if (state.customQuote) {
      return state.customQuote;
    }

    return getDailyMotivationQuote(dateStamp);
  };

  const setProgressQuoteEditing = (isEditing) => {
    isProgressQuoteEditing = Boolean(isEditing);

    if (progressQuoteCard) {
      progressQuoteCard.classList.toggle("is-editing", isProgressQuoteEditing);
    }

    if (progressQuoteEditor) {
      progressQuoteEditor.hidden = !isProgressQuoteEditing;
    }

    if (editProgressQuoteButton) {
      editProgressQuoteButton.hidden = isProgressQuoteEditing;
    }

    if (progressQuoteInput && isProgressQuoteEditing) {
      progressQuoteInput.value = state.customQuote;
      progressQuoteInput.focus();
      progressQuoteInput.setSelectionRange(
        progressQuoteInput.value.length,
        progressQuoteInput.value.length,
      );
    }
  };

  const syncDailyQuoteSurface = (dateStamp = getCurrentDateStamp()) => {
    const quote = getResolvedProgressQuote(dateStamp);

    if (appSubtitle) {
      appSubtitle.textContent = quote;
    }

    return quote;
  };

  const renderProgressQuote = (dateStamp = getCurrentDateStamp()) => {
    if (progressQuoteDisplay) {
      progressQuoteDisplay.textContent = `"${getResolvedProgressQuote(dateStamp)}"`;
    }

    syncDailyQuoteSurface(dateStamp);

    if (progressQuoteInput && isProgressQuoteEditing) {
      progressQuoteInput.value = state.customQuote;
    }
  };

  const getGoalTrackingEndDate = (goal, todayDateStamp) => {
    if (goal.type === "period" && !goal.cycleDays) {
      const endDate = deps.getGoalPeriodEndDate(goal);
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

  const buildGoalProgressItem = (goal, today, extraClass = "") => {
    const goalColor = getGoalColor(goal);
    const attachedSchedules = state.schedules.filter(
      (schedule) => schedule.goalId === goal.id,
    );
    const trackingEndDate = getGoalTrackingEndDate(goal, today);
    const trackingDates = getDateStampsInRange(goal.startDate, trackingEndDate);
    const validDates = trackingDates.filter((dateStamp) =>
      deps.isGoalActiveOnDate(goal, dateStamp),
    );

    const baseExpectedCompletions =
      validDates.length * attachedSchedules.length;
    const goalDateCompletions =
      state.stats.goalDailyCompletions?.[goal.id] || {};
    let completedCompletions = 0;
    validDates.forEach((dateStamp) => {
      completedCompletions += Number(goalDateCompletions[dateStamp] || 0);
    });

    const expectedCompletions = Math.max(
      baseExpectedCompletions,
      completedCompletions,
    );

    const progressPercent =
      expectedCompletions > 0
        ? Math.min(
            Math.round((completedCompletions / expectedCompletions) * 100),
            100,
          )
        : 0;

    const goalItem = document.createElement("li");
    goalItem.className = `goal-progress-item${extraClass ? " " + extraClass : ""}`;
    goalItem.style.setProperty("--goal-color", goalColor);
    goalItem.innerHTML = `
		<div class="goal-progress-head">
			<strong>${goal.title}</strong>
			<span>${progressPercent}%</span>
		</div>
		<p class="goal-progress-meta">
			${goal.type === "period" ? t("progressPeriod", { label: getGoalScheduleLabel(goal) }) : t("progressHabit", { label: getGoalScheduleLabel(goal) })}
		</p>
		<p class="goal-progress-meta">
			${t("completedChecksSummary", {
        completed: completedCompletions,
        expected: expectedCompletions,
        count: attachedSchedules.length,
        taskWord: getTaskWord(attachedSchedules.length),
      })}
		</p>
		<div class="goal-progress-track">
			<div class="goal-progress-fill" style="width: ${progressPercent}%"></div>
		</div>
	`;
    return goalItem;
  };

  const renderGoalProgress = () => {
    if (!goalProgressList) {
      return;
    }

    goalProgressList.innerHTML = "";
    const activeGoals = getActiveGoals();
    const finishedGoals = getFinishedGoals();
    const today = getCurrentDateStamp();

    if (activeGoals.length === 0 && finishedGoals.length === 0) {
      const emptyItem = document.createElement("li");
      emptyItem.className = "goal-progress-item goal-progress-empty";
      emptyItem.textContent = t("noGoalsYet");
      goalProgressList.appendChild(emptyItem);
      return;
    }

    activeGoals.forEach((goal) => {
      goalProgressList.appendChild(buildGoalProgressItem(goal, today));
    });

    if (finishedGoals.length > 0) {
      const wrapItem = document.createElement("li");
      wrapItem.className = "goal-progress-finished-wrap";

      const toggleButton = document.createElement("button");
      toggleButton.type = "button";
      toggleButton.className = "goal-progress-finished-toggle";
      toggleButton.textContent = t("showFinishedGoalsProgress", {
        count: finishedGoals.length,
      });
      toggleButton.setAttribute("aria-expanded", "false");

      const panel = document.createElement("ul");
      panel.className = "goal-progress-finished-list";
      panel.classList.remove("is-open");
      panel.hidden = true;

      finishedGoals.forEach((goal) => {
        panel.appendChild(
          buildGoalProgressItem(goal, today, "goal-progress-item--finished"),
        );
      });

      toggleButton.addEventListener("click", () => {
        const isOpen = !panel.classList.contains("is-open");
        if (isOpen) {
          openCollapsiblePanel(panel);
        } else {
          closeCollapsiblePanel(panel);
        }
        toggleButton.setAttribute("aria-expanded", String(isOpen));
        toggleButton.textContent = isOpen
          ? t("hideFinishedGoalsProgress", { count: finishedGoals.length })
          : t("showFinishedGoalsProgress", { count: finishedGoals.length });
      });

      wrapItem.appendChild(toggleButton);
      wrapItem.appendChild(panel);
      goalProgressList.appendChild(wrapItem);
    }
  };

  const renderProgressCharts = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const todayDateStamp = getCurrentDateStamp();
    const currentMonthIndex = today.getMonth();

    const weekItems = [];
    for (let index = 6; index >= 0; index -= 1) {
      const day = new Date(today);
      day.setDate(today.getDate() - index);
      const label = new Intl.DateTimeFormat(appLanguage, {
        weekday: "short",
      }).format(day);
      const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
      const count = Number(state.stats.dailyCompletions[key] || 0);
      const weekdayIndex = (day.getDay() + 6) % 7;
      const isCurrentDay = key === todayDateStamp;
      const chartColor = isCurrentDay
        ? CURRENT_PERIOD_CHART_COLOR
        : WEEKDAY_CHART_COLORS[weekdayIndex] || "#3b82f6";
      weekItems.push({ label, key, count, chartColor, isCurrentDay });
    }

    const maxWeekCount = Math.max(...weekItems.map((item) => item.count), 1);
    weekChart.innerHTML = "";
    weekItems.forEach((item) => {
      const weekItem = document.createElement("div");
      weekItem.className = `week-item${item.isCurrentDay ? " is-current" : ""}`;

      const countLabel = document.createElement("span");
      countLabel.className = "week-bar-count";
      countLabel.textContent = String(item.count);

      const bar = document.createElement("div");
      bar.className = `week-bar${item.count > 0 ? " is-active" : ""}${item.isCurrentDay ? " is-current" : ""}`;
      bar.style.setProperty("--bar-color", item.chartColor);
      bar.style.height = `${Math.max((item.count / maxWeekCount) * 100, 8)}%`;
      bar.title = t("completedTasksTitle", {
        date: formatDisplayDate(item.key),
        count: item.count,
        taskWord: getTaskWord(item.count),
      });

      const label = document.createElement("span");
      label.className = "week-bar-label";
      label.textContent = item.label;

      weekItem.appendChild(countLabel);
      weekItem.appendChild(bar);
      weekItem.appendChild(label);
      weekChart.appendChild(weekItem);
    });

    const monthActiveDays = new Array(12).fill(0);
    Object.entries(state.stats.dailyCompletions).forEach(
      ([dateStamp, count]) => {
        if (Number(count) <= 0) {
          return;
        }

        const [year, month] = dateStamp.split("-").map(Number);
        if (year === currentYear) {
          monthActiveDays[month - 1] += 1;
        }
      },
    );

    const maxMonthCount = Math.max(...monthActiveDays, 1);
    monthChart.innerHTML = "";
    monthActiveDays.forEach((count, index) => {
      const monthItem = document.createElement("div");
      const isCurrentMonth = index === currentMonthIndex;
      const chartColor = isCurrentMonth
        ? CURRENT_PERIOD_CHART_COLOR
        : MONTH_CHART_COLORS[index] || "#3b82f6";
      monthItem.className = `month-item${isCurrentMonth ? " is-current" : ""}`;

      const countLabel = document.createElement("span");
      countLabel.className = "month-bar-count";
      countLabel.textContent = String(count);

      const bar = document.createElement("div");
      bar.className = `month-bar${count > 0 ? " is-active" : ""}${isCurrentMonth ? " is-current" : ""}`;
      bar.style.setProperty("--bar-color", chartColor);
      bar.style.height = `${Math.max((count / maxMonthCount) * 100, 8)}%`;
      const monthLabelText = new Intl.DateTimeFormat(appLanguage, {
        month: "short",
      }).format(new Date(Date.UTC(currentYear, index, 1)));
      bar.title = t("activeDaysTitle", {
        month: monthLabelText,
        count,
        dayWord: getDayWord(count),
      });

      const label = document.createElement("span");
      label.className = "month-bar-label";
      label.textContent = monthLabelText;

      monthItem.appendChild(countLabel);
      monthItem.appendChild(bar);
      monthItem.appendChild(label);
      monthChart.appendChild(monthItem);
    });

    const activeDays = monthActiveDays.reduce((sum, count) => sum + count, 0);
    const yearStartUtc = Date.UTC(currentYear, 0, 1);
    const yearEndUtc = Date.UTC(currentYear, 11, 31);
    const totalDaysInYear =
      Math.floor((yearEndUtc - yearStartUtc) / (1000 * 60 * 60 * 24)) + 1;
    const todayUtc = Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const elapsedDays =
      Math.floor((todayUtc - yearStartUtc) / (1000 * 60 * 60 * 24)) + 1;
    const consistencyPercent =
      elapsedDays > 0 ? Math.round((activeDays / elapsedDays) * 100) : 0;
    yearChartLabel.textContent = t("activeDaysInYear", {
      activeDays,
      totalDays: totalDaysInYear,
      dayWord: getDayWord(activeDays),
      year: currentYear,
      percent: consistencyPercent,
    });

    const progressCurrentStreakElement = document.getElementById(
      "progress-current-streak",
    );
    const progressBestStreakElement = document.getElementById(
      "progress-best-streak",
    );
    const progressCurrentUnitElement = document.getElementById(
      "progress-current-unit",
    );
    const progressBestUnitElement =
      document.getElementById("progress-best-unit");
    const progressBestBadge = document.getElementById("progress-best-badge");
    const progressStreakStatsContainer = document.getElementById(
      "progress-streak-stats",
    );
    const progressBestCard = document.getElementById("progress-best-card");

    const currentStreak = getCurrentStreak();
    const bestStreak = getBestStreak();
    const isBestStreak = currentStreak > 0 && currentStreak === bestStreak;

    if (progressCurrentStreakElement) {
      progressCurrentStreakElement.textContent = String(currentStreak);
    }
    if (progressBestStreakElement) {
      progressBestStreakElement.textContent = String(bestStreak);
    }
    if (progressCurrentUnitElement) {
      progressCurrentUnitElement.textContent =
        currentStreak === 1 ? t("day") : t("days");
    }
    if (progressBestUnitElement) {
      progressBestUnitElement.textContent =
        bestStreak === 1 ? t("day") : t("days");
    }
    if (progressBestBadge) {
      progressBestBadge.hidden = !isBestStreak;
    }
    if (progressStreakStatsContainer) {
      progressStreakStatsContainer.classList.toggle(
        "is-best-streak",
        isBestStreak,
      );
    }
    if (isBestStreak && progressBestCard) {
      progressBestCard.hidden = true;
    } else if (progressBestCard) {
      progressBestCard.hidden = false;
    }

    renderProgressQuote(todayDateStamp);
    renderGoalProgress();
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

    if (
      previousValue &&
      state.goals.some((goal) => goal.id === previousValue)
    ) {
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

  const buildGoalOptionsMarkup = (selectedGoalId = "") => {
    const options = [`<option value="">${t("noGoal")}</option>`];
    getActiveGoals().forEach((goal) => {
      const selected = goal.id === selectedGoalId ? " selected" : "";
      options.push(
        `<option value="${goal.id}"${selected}>${goal.title}</option>`,
      );
    });
    return options.join("");
  };

  const renderGoals = () => {
    if (!goalList) {
      return;
    }

    goalList.innerHTML = "";
    const activeGoals = getActiveGoals();
    activeGoals.forEach((goal, index) => {
      const scheduleCount = state.schedules.filter(
        (schedule) => schedule.goalId === goal.id,
      ).length;
      const goalColor = getGoalColor(goal);
      const canMoveUp = index > 0;
      const canMoveDown = index < activeGoals.length - 1;
      const goalItem = document.createElement("li");
      goalItem.className = "goal-item";
      goalItem.dataset.goalId = goal.id;
      goalItem.style.setProperty("--goal-color", goalColor);

      const goalTypeLabel = getGoalScheduleLabel(goal);

      goalItem.innerHTML = `
			<div class="goal-item-view">
				<div class="goal-item-text">
					<strong>${goal.title}</strong>
					<span>${goalTypeLabel} | ${scheduleCount} ${getTaskWord(scheduleCount)}</span>
				</div>
				<div class="goal-item-actions">
					<span class="goal-color-dot" aria-hidden="true"></span>
					<button type="button" class="goal-move-btn goal-move-up-btn" ${canMoveUp ? "" : "disabled"} aria-label="${t("moveUp")}" title="${t("moveUp")}">↑</button>
					<button type="button" class="goal-move-btn goal-move-down-btn" ${canMoveDown ? "" : "disabled"} aria-label="${t("moveDown")}" title="${t("moveDown")}">↓</button>
					<button type="button" class="goal-edit-btn">${t("edit")}</button>
					<button type="button" class="goal-finish-btn">${t("finish")}</button>
					<button type="button" class="goal-remove-btn">${t("removeGoal")}</button>
				</div>
			</div>
			<form class="goal-edit-form">
				<input type="text" class="goal-edit-title-input" required />
				<select class="goal-edit-type-select">
					<option value="habit">${t("habitIndefinite")}</option>
					<option value="period">${t("periodGoal")}</option>
				</select>
				<input type="number" class="goal-edit-duration-input" min="1" placeholder="${t("daysPlaceholderShort")}" />
				<input type="number" class="goal-edit-interval-input" min="1" placeholder="${t("everyXDays")}" />
				<input type="date" class="goal-edit-start-date-input" aria-label="${t("startFrom")}" title="${t("startFromTitle")}" />
        <div class="goal-edit-weekdays-wrap">
          <span class="goal-edit-weekdays-label">${t("weekdays")}</span>
          <div class="schedule-weekday-picker goal-edit-weekday-picker" role="group" aria-label="${t("weekdays")}">
            <button type="button" class="weekday-btn" data-weekday="1"></button>
            <button type="button" class="weekday-btn" data-weekday="2"></button>
            <button type="button" class="weekday-btn" data-weekday="3"></button>
            <button type="button" class="weekday-btn" data-weekday="4"></button>
            <button type="button" class="weekday-btn" data-weekday="5"></button>
            <button type="button" class="weekday-btn" data-weekday="6"></button>
            <button type="button" class="weekday-btn" data-weekday="0"></button>
          </div>
        </div>
				<input type="color" class="goal-edit-color-input" aria-label="${t("goalColor")}" title="${t("goalColor")}" />
				<button type="button" class="goal-save-btn">${t("save")}</button>
				<button type="button" class="goal-cancel-btn">${t("cancel")}</button>
			</form>
		`;

      const titleInput = goalItem.querySelector(".goal-edit-title-input");
      if (titleInput) {
        titleInput.value = goal.title;
      }

      const typeSelect = goalItem.querySelector(".goal-edit-type-select");
      const durationInput = goalItem.querySelector(".goal-edit-duration-input");
      const intervalInput = goalItem.querySelector(".goal-edit-interval-input");
      const startDateInput = goalItem.querySelector(
        ".goal-edit-start-date-input",
      );
      if (typeSelect) {
        typeSelect.value = goal.type;
      }
      if (durationInput) {
        durationInput.value = getGoalDurationDays(goal);
      }
      if (intervalInput) {
        intervalInput.value =
          goal.type === "period"
            ? String(goal.cycleDays || "")
            : String(normalizePositiveInteger(goal.intervalDays, 1));
      }
      if (startDateInput) {
        startDateInput.value = goal.startDate;
      }
      if (durationInput && intervalInput) {
        syncGoalFrequencyInputs({
          type: goal.type,
          durationInput,
          intervalInput,
          intervalValue:
            goal.type === "period"
              ? String(goal.cycleDays || "")
              : String(normalizePositiveInteger(goal.intervalDays, 1)),
        });
      }

      const colorInput = goalItem.querySelector(".goal-edit-color-input");
      if (colorInput) {
        colorInput.value = goalColor;
      }

      const weekdayPicker = goalItem.querySelector(".goal-edit-weekday-picker");
      renderWeekdayPickerButtons(weekdayPicker, goal.weekdays);

      goalList.appendChild(goalItem);
    });

    renderGoalOptions();
  };

  const renderFinishedGoals = () => {
    if (
      !toggleFinishedGoalsButton ||
      !finishedGoalsPanel ||
      !finishedGoalsList
    ) {
      return;
    }

    const finishedGoals = getFinishedGoals();
    toggleFinishedGoalsButton.hidden = false;
    const isExpanded = finishedGoalsPanel.classList.contains("is-open");
    toggleFinishedGoalsButton.textContent = isExpanded
      ? t("hideFinishedGoals", { count: finishedGoals.length })
      : t("seeFinishedGoals", { count: finishedGoals.length });
    toggleFinishedGoalsButton.setAttribute("aria-expanded", String(isExpanded));

    finishedGoalsList.innerHTML = "";
    if (finishedGoals.length === 0) {
      const emptyItem = document.createElement("li");
      emptyItem.className = "finished-goal-empty";
      emptyItem.textContent = t("noFinishedGoalsYet");
      finishedGoalsList.appendChild(emptyItem);
      return;
    }

    finishedGoals.forEach((goal) => {
      const goalColor = getGoalColor(goal);
      const item = document.createElement("li");
      item.className = "finished-goal-item";
      item.dataset.goalId = goal.id;
      item.style.setProperty("--goal-color", goalColor);

      const head = document.createElement("div");
      head.className = "finished-goal-head";
      const title = document.createElement("strong");
      title.textContent = goal.title;
      const meta = document.createElement("span");
      meta.textContent = t("endedOn", {
        date: formatDisplayDate(
          goal.finishedAt || deps.getGoalPeriodEndDate(goal) || goal.startDate,
        ),
      });
      const unfinishButton = document.createElement("button");
      unfinishButton.type = "button";
      unfinishButton.className = "goal-unfinish-btn";
      unfinishButton.textContent = t("reactivate");
      head.appendChild(title);
      head.appendChild(meta);
      head.appendChild(unfinishButton);
      item.appendChild(head);

      const linkedSchedules = state.schedules.filter(
        (schedule) => schedule.goalId === goal.id,
      );
      if (linkedSchedules.length > 0) {
        const taskList = document.createElement("ul");
        taskList.className = "finished-goal-task-list";
        linkedSchedules.forEach((schedule) => {
          const taskItem = document.createElement("li");
          taskItem.textContent = schedule.text;
          taskList.appendChild(taskItem);
        });
        item.appendChild(taskList);
      }

      finishedGoalsList.appendChild(item);
    });
  };

  const renderTasks = () => {
    todoList
      .querySelectorAll(".todo-item")
      .forEach((taskItem) => taskItem.remove());
    const visibleTasks = state.showFinishedTasks
      ? state.tasks
      : state.tasks.filter((task) => !task.done);
    visibleTasks.forEach((task) => {
      todoList.appendChild(createTaskElement(task));
    });
    sortTasks();
    updateTaskSummary();
    syncFinishedTasksToggleButton();
  };

  const renderSchedules = () => {
    scheduleList.innerHTML = "";
    const orderedSchedules = getOrderedActiveSchedules();
    if (orderedSchedules.length === 0) {
      return;
    }

    let currentGroupKey = null;
    orderedSchedules.forEach((schedule, currentIndex) => {
      const groupedGoal = schedule.goalId
        ? state.goals.find((item) => item.id === schedule.goalId)
        : null;
      const groupKey = groupedGoal?.id || "__no-goal__";
      const previousSchedule =
        currentIndex > 0 ? orderedSchedules[currentIndex - 1] : null;
      const nextSchedule =
        currentIndex < orderedSchedules.length - 1
          ? orderedSchedules[currentIndex + 1]
          : null;
      const previousGroupKey = previousSchedule
        ? previousSchedule.goalId || "__no-goal__"
        : null;
      const nextGroupKey = nextSchedule
        ? nextSchedule.goalId || "__no-goal__"
        : null;
      const canMoveUp = previousGroupKey === groupKey;
      const canMoveDown = nextGroupKey === groupKey;

      if (groupKey !== currentGroupKey) {
        currentGroupKey = groupKey;
        const groupTitle = document.createElement("li");
        groupTitle.className = "schedule-group-title";
        groupTitle.textContent = groupedGoal ? groupedGoal.title : t("noGoal");
        scheduleList.appendChild(groupTitle);
      }

      const scheduleItem = document.createElement("li");
      scheduleItem.className = "schedule-item";
      scheduleItem.dataset.scheduleId = schedule.id;
      const goalColor = groupedGoal ? getGoalColor(groupedGoal) : null;
      const goalLabel = groupedGoal
        ? `<small class="schedule-goal-badge" style="--goal-badge-color: ${goalColor};">${groupedGoal.title}</small>`
        : "";
      const timingLabel = getScheduleTimingLabel(schedule);
      scheduleItem.innerHTML = `
			<div class="schedule-item-view">
				<div class="schedule-item-text">
					<strong>${schedule.text}</strong>
					<small>${timingLabel} ${goalLabel}</small>
				</div>
				<div class="schedule-item-actions">
					<button type="button" class="schedule-move-btn schedule-move-up-btn" ${canMoveUp ? "" : "disabled"} aria-label="${t("moveUp")}" title="${t("moveUp")}">↑</button>
					<button type="button" class="schedule-move-btn schedule-move-down-btn" ${canMoveDown ? "" : "disabled"} aria-label="${t("moveDown")}" title="${t("moveDown")}">↓</button>
					<button type="button" class="schedule-edit-btn">${t("edit")}</button>
					<button type="button" class="schedule-remove-btn">${t("delete")}</button>
				</div>
			</div>
			<form class="schedule-edit-form">
				<input type="text" class="schedule-edit-input" required />
				<select class="schedule-edit-type-select goal-select" aria-label="${t("scheduleType")}">
					<option value="recurring">${t("scheduleRecurring")}</option>
					<option value="one-time">${t("scheduleOneTime")}</option>
				</select>
				<select class="schedule-edit-goal-select">${buildGoalOptionsMarkup(schedule.goalId || "")}</select>
				<input type="number" class="schedule-edit-interval-input" min="1" placeholder="${t("everyXDays")}" />
				<input type="date" class="schedule-edit-start-date-input" aria-label="${t("startFrom")}" title="${t("startFromTitle")}" />
				<div class="schedule-edit-weekdays-wrap">
					<span class="schedule-edit-weekdays-label">${t("weekdays")}</span>
					<div class="schedule-weekday-picker schedule-edit-weekday-picker" role="group" aria-label="${t("weekdays")}">
						<button type="button" class="weekday-btn" data-weekday="1"></button>
						<button type="button" class="weekday-btn" data-weekday="2"></button>
						<button type="button" class="weekday-btn" data-weekday="3"></button>
						<button type="button" class="weekday-btn" data-weekday="4"></button>
						<button type="button" class="weekday-btn" data-weekday="5"></button>
						<button type="button" class="weekday-btn" data-weekday="6"></button>
						<button type="button" class="weekday-btn" data-weekday="0"></button>
					</div>
				</div>
				<button type="button" class="schedule-save-btn">${t("save")}</button>
				<button type="button" class="schedule-cancel-btn">${t("cancel")}</button>
			</form>
		`;

      const editInput = scheduleItem.querySelector(".schedule-edit-input");
      if (editInput) {
        editInput.value = schedule.text;
      }
      const typeSelect = scheduleItem.querySelector(
        ".schedule-edit-type-select",
      );
      if (typeSelect) {
        typeSelect.value = normalizeScheduleType(schedule.type);
      }
      const intervalInput = scheduleItem.querySelector(
        ".schedule-edit-interval-input",
      );
      if (intervalInput) {
        intervalInput.value = String(
          normalizePositiveInteger(schedule.intervalDays, 1),
        );
      }
      const startDateInput = scheduleItem.querySelector(
        ".schedule-edit-start-date-input",
      );
      if (startDateInput) {
        startDateInput.value = schedule.startDate;
        startDateInput.disabled = shouldLockScheduleStartDate(schedule);
        startDateInput.title = startDateInput.disabled
          ? t("startDateLocked")
          : t("startFromTitle");
        syncScheduleDateBounds(schedule.goalId || null, startDateInput);
      }

      const weekdayPicker = scheduleItem.querySelector(
        ".schedule-edit-weekday-picker",
      );
      renderWeekdayPickerButtons(weekdayPicker, schedule.weekdays);
      deps.syncScheduleItemFormMode(scheduleItem, {
        type: schedule.type,
        goalId: schedule.goalId || null,
        startDateLocked: shouldLockScheduleStartDate(schedule),
      });
      scheduleList.appendChild(scheduleItem);
    });
  };

  const updateScheduleItemView = (scheduleItem, schedule) => {
    if (!scheduleItem || !schedule) {
      return;
    }

    const titleElement = scheduleItem.querySelector(
      ".schedule-item-text strong",
    );
    if (titleElement) {
      titleElement.textContent = schedule.text;
    }

    const metaElement = scheduleItem.querySelector(".schedule-item-text small");
    if (metaElement) {
      metaElement.textContent = getScheduleTimingLabel(schedule);
      const goal = state.goals.find((item) => item.id === schedule.goalId);
      if (goal) {
        metaElement.appendChild(document.createTextNode(" "));
        const badge = document.createElement("small");
        badge.className = "schedule-goal-badge";
        badge.style.setProperty("--goal-badge-color", getGoalColor(goal));
        badge.textContent = goal.title;
        metaElement.appendChild(badge);
      }
    }

    const editInput = scheduleItem.querySelector(".schedule-edit-input");
    if (editInput) {
      editInput.value = schedule.text;
    }

    const typeSelect = scheduleItem.querySelector(".schedule-edit-type-select");
    if (typeSelect) {
      typeSelect.value = normalizeScheduleType(schedule.type);
    }

    const goalSelect = scheduleItem.querySelector(".schedule-edit-goal-select");
    if (goalSelect) {
      goalSelect.innerHTML = buildGoalOptionsMarkup(schedule.goalId || "");
    }

    const intervalInput = scheduleItem.querySelector(
      ".schedule-edit-interval-input",
    );
    if (intervalInput) {
      intervalInput.value = String(
        normalizePositiveInteger(schedule.intervalDays, 1),
      );
    }

    const startDateInput = scheduleItem.querySelector(
      ".schedule-edit-start-date-input",
    );
    if (startDateInput) {
      startDateInput.value = schedule.startDate;
    }

    deps.syncScheduleItemFormMode(scheduleItem, {
      type: schedule.type,
      goalId: schedule.goalId || null,
      startDateLocked: shouldLockScheduleStartDate(schedule),
    });
  };

  const deps = {
    getGoalPeriodEndDate: null,
    isGoalActiveOnDate: null,
    syncScheduleItemFormMode: null,
  };

  return {
    bindDeps(extraDeps) {
      deps.getGoalPeriodEndDate = extraDeps.getGoalPeriodEndDate;
      deps.isGoalActiveOnDate = extraDeps.isGoalActiveOnDate;
      deps.syncScheduleItemFormMode = extraDeps.syncScheduleItemFormMode;
    },
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
  };
};
