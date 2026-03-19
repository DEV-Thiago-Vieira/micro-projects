const todoList = document.getElementById('todo-list');
const taskForm = document.querySelector('.new-task-form');
const taskInput = document.querySelector('.new-task-input');
const checkedCountElement = document.getElementById('checked-count');
const uncheckedCountElement = document.getElementById('unchecked-count');
const clearAllButton = document.getElementById('clear-all-btn');
const installAppButton = document.getElementById('install-app-btn');
const backProjectsButton = document.querySelector('.back-projects-btn');
const themeToggleButton = document.getElementById('theme-toggle-btn');
const congratsMessage = document.getElementById('todo-congrats');

const scheduleForm = document.getElementById('schedule-form');
const scheduleInput = document.getElementById('schedule-input');
const scheduleList = document.getElementById('schedule-list');
const scheduleGoalSelect = document.getElementById('schedule-goal-select');
const goalForm = document.getElementById('goal-form');
const goalTitleInput = document.getElementById('goal-title-input');
const goalTypeSelect = document.getElementById('goal-type-select');
const goalDurationInput = document.getElementById('goal-duration-input');
const goalColorInput = document.getElementById('goal-color-input');
const goalList = document.getElementById('goal-list');
const toggleFinishedGoalsButton = document.getElementById('toggle-finished-goals-btn');
const finishedGoalsPanel = document.getElementById('finished-goals-panel');
const finishedGoalsList = document.getElementById('finished-goals-list');
const openScheduleButton = document.getElementById('open-schedule-btn');
const scheduleModal = document.getElementById('schedule-modal');
const closeScheduleButton = document.getElementById('close-schedule-btn');

const openProgressButton = document.getElementById('open-progress-btn');
const closeProgressButton = document.getElementById('close-progress-btn');
const progressModal = document.getElementById('progress-modal');
const weekChart = document.getElementById('week-chart');
const monthChart = document.getElementById('month-chart');
const yearChartLabel = document.getElementById('year-chart-label');
const goalProgressList = document.getElementById('goal-progress-list');

const currentStreakElement = document.getElementById('current-streak');
const bestStreakElement = document.getElementById('best-streak');
const streakMessageElement = document.getElementById('streak-message');
const rewardProgressBarElement = document.getElementById('reward-progress-bar');
const rewardNextElement = document.getElementById('reward-next');
const badgeListElement = document.getElementById('badge-list');

const deleteModal = document.getElementById('delete-modal');
const deleteModalTitle = document.getElementById('delete-modal-title');
const deleteModalMessage = document.getElementById('delete-modal-message');
const cancelDeleteButton = document.getElementById('cancel-delete-btn');
const confirmDeleteButton = document.getElementById('confirm-delete-btn');
const clearAllModal = document.getElementById('clear-all-modal');
const cancelClearAllButton = document.getElementById('cancel-clear-all-btn');
const confirmClearAllButton = document.getElementById('confirm-clear-all-btn');
const removeGoalModal = document.getElementById('remove-goal-modal');
const cancelRemoveGoalButton = document.getElementById('cancel-remove-goal-btn');
const confirmRemoveGoalButton = document.getElementById('confirm-remove-goal-btn');

const TASKS_STORAGE_KEY = 'todo-items-v2';
const LEGACY_TASKS_STORAGE_KEY = 'todo-items-v1';
const SCHEDULES_STORAGE_KEY = 'todo-schedules-v1';
const GOALS_STORAGE_KEY = 'todo-goals-v1';
const LAST_SYNC_DATE_STORAGE_KEY = 'todo-last-sync-date-v1';
const STATS_STORAGE_KEY = 'todo-stats-v1';
const THEME_STORAGE_KEY = 'todo-theme-v1';

const monthNames = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
];

const baseGoals = [3, 7, 14, 30, 60, 90];

const state = {
	tasks: [],
	schedules: [],
	goals: [],
	lastSyncDate: null,
	stats: {
		dailyCompletions: {},
		goalDailyCompletions: {},
	},
};

let pendingDeleteTaskId = null;
let pendingDeleteScheduleId = null;
let pendingRemoveGoalId = null;
let toastTimer = null;
let deferredInstallPrompt = null;

const getStoredTheme = () => {
	const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
	return savedTheme === 'dark' ? 'dark' : 'light';
};

const applyTheme = (theme) => {
	const isDarkTheme = theme === 'dark';
	document.body.classList.toggle('is-dark', isDarkTheme);

	if (themeToggleButton) {
		themeToggleButton.textContent = isDarkTheme ? '☀️ Light' : '🌙 Dark';
		themeToggleButton.setAttribute(
			'aria-label',
			isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode',
		);
	}

	const themeColorMeta = document.querySelector('meta[name="theme-color"]');
	if (themeColorMeta) {
		themeColorMeta.setAttribute('content', isDarkTheme ? '#0f172a' : '#22c55e');
	}
};

const toggleTheme = () => {
	const nextTheme = document.body.classList.contains('is-dark') ? 'light' : 'dark';
	localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
	applyTheme(nextTheme);
};

const isStandaloneMode = () =>
	window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

const isTouchReorderMode =
	window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;

const updateInstallButtonState = () => {
	if (!installAppButton) {
		return;
	}

	if (isStandaloneMode()) {
		installAppButton.hidden = true;
		if (backProjectsButton) {
			backProjectsButton.hidden = true;
		}
		return;
	}

	installAppButton.hidden = false;
	if (backProjectsButton) {
		backProjectsButton.hidden = false;
	}
};

const getTaskTextElement = (taskItem) => taskItem.querySelector('.todo-item-text');
const getSaveButton = (taskItem) => taskItem.querySelector('.todo-save-btn');
const getEditButton = (taskItem) => taskItem.querySelector('.todo-edit-btn');

let draggedTaskId = null;
let dropInsertIndex = null;
let isTouchDragging = false;
let touchDidMove = false;
let suppressClickUntil = 0;
let lastDragPointerY = null;
let dragAutoScrollFrame = null;
let touchDragActivationTimer = null;
let touchCandidateTaskId = null;
let touchStartX = 0;
let touchStartY = 0;

const TOUCH_DRAG_HOLD_MS = 180;
const TOUCH_MOVE_CANCEL_PX = 10;
const DRAG_SCROLL_EDGE_PX = 56;
const DRAG_SCROLL_MAX_STEP = 16;

const cancelTouchDragActivation = () => {
	if (touchDragActivationTimer) {
		clearTimeout(touchDragActivationTimer);
		touchDragActivationTimer = null;
	}
	touchCandidateTaskId = null;
};

const stopDragAutoScroll = () => {
	if (dragAutoScrollFrame !== null) {
		cancelAnimationFrame(dragAutoScrollFrame);
		dragAutoScrollFrame = null;
	}
};

const getDragAutoScrollStep = (pointerY) => {
	if (typeof pointerY !== 'number') {
		return 0;
	}

	const rect = todoList.getBoundingClientRect();
	if (pointerY < rect.top + DRAG_SCROLL_EDGE_PX) {
		const intensity = (rect.top + DRAG_SCROLL_EDGE_PX - pointerY) / DRAG_SCROLL_EDGE_PX;
		return -Math.max(2, Math.round(DRAG_SCROLL_MAX_STEP * intensity));
	}

	if (pointerY > rect.bottom - DRAG_SCROLL_EDGE_PX) {
		const intensity = (pointerY - (rect.bottom - DRAG_SCROLL_EDGE_PX)) / DRAG_SCROLL_EDGE_PX;
		return Math.max(2, Math.round(DRAG_SCROLL_MAX_STEP * intensity));
	}

	return 0;
};

const runDragAutoScroll = () => {
	if (!draggedTaskId || typeof lastDragPointerY !== 'number') {
		stopDragAutoScroll();
		return;
	}

	const step = getDragAutoScrollStep(lastDragPointerY);
	if (step !== 0) {
		todoList.scrollTop += step;
		dropInsertIndex = getDropInsertIndexFromPointer(lastDragPointerY);
		updateDropIndicatorByInsertIndex(dropInsertIndex);
	}

	dragAutoScrollFrame = requestAnimationFrame(runDragAutoScroll);
};

const ensureDragAutoScroll = () => {
	if (dragAutoScrollFrame === null) {
		dragAutoScrollFrame = requestAnimationFrame(runDragAutoScroll);
	}
};

const getCurrentDateStamp = () => {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const GOAL_PALETTE = [
	'#3b82f6', '#8b5cf6', '#ec4899', '#f97316',
	'#14b8a6', '#84cc16', '#f59e0b', '#06b6d4',
	'#10b981', '#ef4444',
];

const getGoalColorFromId = (goalId) => {
	let hash = 0;
	for (let i = 0; i < goalId.length; i++) {
		hash = (hash * 31 + goalId.charCodeAt(i)) & 0xffff;
	}
	return GOAL_PALETTE[hash % GOAL_PALETTE.length];
};

const isHexColor = (value) => /^#[0-9a-f]{6}$/i.test(value);

const normalizeGoalColor = (value) => {
	if (typeof value !== 'string') {
		return null;
	}

	const normalized = value.trim().toLowerCase();
	return isHexColor(normalized) ? normalized : null;
};

const hslToHex = (hue, saturation, lightness) => {
	const s = saturation / 100;
	const l = lightness / 100;
	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
	const m = l - c / 2;

	let rPrime = 0;
	let gPrime = 0;
	let bPrime = 0;

	if (hue < 60) {
		rPrime = c;
		gPrime = x;
	} else if (hue < 120) {
		rPrime = x;
		gPrime = c;
	} else if (hue < 180) {
		gPrime = c;
		bPrime = x;
	} else if (hue < 240) {
		gPrime = x;
		bPrime = c;
	} else if (hue < 300) {
		rPrime = x;
		bPrime = c;
	} else {
		rPrime = c;
		bPrime = x;
	}

	const toHex = (component) => {
		const value = Math.round((component + m) * 255);
		return value.toString(16).padStart(2, '0');
	};

	return `#${toHex(rPrime)}${toHex(gPrime)}${toHex(bPrime)}`;
};

const getGoalColor = (goal) => {
	if (!goal) {
		return '#3b82f6';
	}

	return normalizeGoalColor(goal.color) || getGoalColorFromId(goal.id);
};

const isGoalColorInUse = (color, excludedGoalId = null) => {
	const normalizedColor = normalizeGoalColor(color);
	if (!normalizedColor) {
		return false;
	}

	return state.goals.some(
		(goal) => goal.id !== excludedGoalId && getGoalColor(goal) === normalizedColor,
	);
};

const getNextAvailableGoalColor = (excludedGoalId = null, preferredColor = null) => {
	const normalizedPreferredColor = normalizeGoalColor(preferredColor);
	if (normalizedPreferredColor && !isGoalColorInUse(normalizedPreferredColor, excludedGoalId)) {
		return normalizedPreferredColor;
	}

	for (const color of GOAL_PALETTE) {
		if (!isGoalColorInUse(color, excludedGoalId)) {
			return color;
		}
	}

	for (let i = 0; i < 360; i += 1) {
		const hue = (i * 37) % 360;
		const candidateColor = hslToHex(hue, 70, 52);
		if (!isGoalColorInUse(candidateColor, excludedGoalId)) {
			return candidateColor;
		}
	}

	return normalizedPreferredColor || '#3b82f6';
};

const ensureDistinctGoalColors = () => {
	const usedColors = new Set();

	state.goals.forEach((goal) => {
		let candidateColor = normalizeGoalColor(goal.color) || getGoalColorFromId(goal.id);

		if (usedColors.has(candidateColor)) {
			candidateColor = getNextAvailableGoalColor(goal.id, candidateColor);
		}

		goal.color = candidateColor;
		usedColors.add(candidateColor);
	});
};

const normalizeText = (text) => text.trim().toLowerCase();

const isDuplicateTaskText = (text, excludedTaskId = null) => {
	const normalizedText = normalizeText(text);
	return state.tasks.some(
		(task) => task.id !== excludedTaskId && normalizeText(task.text) === normalizedText,
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
		(goal) => goal.id !== excludedGoalId && normalizeText(goal.title) === normalizedTitle,
	);
};

const parseDateStampUtc = (dateStamp) => {
	const [year, month, day] = dateStamp.split('-').map(Number);
	return Date.UTC(year, month - 1, day);
};

const daysBetweenDateStamps = (fromDateStamp, toDateStamp) => {
	const fromUtc = parseDateStampUtc(fromDateStamp);
	const toUtc = parseDateStampUtc(toDateStamp);
	return Math.floor((toUtc - fromUtc) / (1000 * 60 * 60 * 24));
};

const isGoalActiveOnDate = (goal, dateStamp) => {
	if (!goal || !dateStamp) {
		return false;
	}

	if (daysBetweenDateStamps(goal.startDate, dateStamp) < 0) {
		return false;
	}

	if (goal.type === 'period' && goal.endDate) {
		return daysBetweenDateStamps(dateStamp, goal.endDate) >= 0;
	}

	return true;
};

const isGoalFinished = (goal, dateStamp = getCurrentDateStamp()) => {
	if (!goal) {
		return false;
	}

	if (typeof goal.finishedAt === 'string' && goal.finishedAt) {
		return true;
	}

	if (goal.type !== 'period' || !goal.endDate) {
		return false;
	}

	return daysBetweenDateStamps(goal.endDate, dateStamp) > 0;
};

const isScheduleFinished = (schedule, dateStamp = getCurrentDateStamp()) => {
	if (!schedule?.goalId) {
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

	if (!state.stats.goalDailyCompletions[goalId]) {
		state.stats.goalDailyCompletions[goalId] = {};
	}

	const nextValue = Math.max(0, Math.floor(count));
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
	if (!goalId || !dateStamp || delta === 0) {
		return;
	}

	const current = getGoalDailyCompletionCount(goalId, dateStamp);
	setGoalDailyCompletionCount(goalId, dateStamp, current + delta);
};

const getSortedCompletionDays = () => {
	return Object.keys(state.stats.dailyCompletions)
		.filter((dateStamp) => Number(state.stats.dailyCompletions[dateStamp]) > 0)
		.sort();
};

const getCurrentStreak = () => {
	const completionDays = getSortedCompletionDays();
	if (completionDays.length === 0) {
		return 0;
	}

	const today = getCurrentDateStamp();
	const parseUtc = (dateStamp) => {
		const [year, month, day] = dateStamp.split('-').map(Number);
		return Date.UTC(year, month - 1, day);
	};

	const lastDay = completionDays[completionDays.length - 1];
	const todayUtc = parseUtc(today);
	const lastDayUtc = parseUtc(lastDay);
	const daysSinceLastCompletion = (todayUtc - lastDayUtc) / (1000 * 60 * 60 * 24);

	// Keep streak visible if the latest completion was yesterday.
	if (daysSinceLastCompletion > 1) {
		return 0;
	}

	let streak = 1;
	for (let i = completionDays.length - 1; i > 0; i -= 1) {
		const current = parseUtc(completionDays[i]);
		const previous = parseUtc(completionDays[i - 1]);
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
		const [year, month, day] = dateStamp.split('-').map(Number);
		return Date.UTC(year, month - 1, day);
	};

	let best = 1;
	let current = 1;
	for (let i = 1; i < completionDays.length; i += 1) {
		const prev = parseUtc(completionDays[i - 1]);
		const curr = parseUtc(completionDays[i]);
		const diff = (curr - prev) / (1000 * 60 * 60 * 24);
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
		nextGoal === 3 ? 0 : baseGoals.includes(nextGoal) ? baseGoals[baseGoals.indexOf(nextGoal) - 1] : nextGoal - 30;
	const tierLength = Math.max(nextGoal - previousGoal, 1);
	const tierProgress = Math.min(((streak - previousGoal) / tierLength) * 100, 100);

	currentStreakElement.textContent = String(streak);
	bestStreakElement.textContent = String(bestStreak);
	rewardProgressBarElement.style.width = `${Math.max(tierProgress, 0)}%`;
	rewardNextElement.textContent = `Next goal: ${nextGoal} days`;

	if (streak >= 60) {
		streakMessageElement.textContent = 'This is long-term discipline. Keep the chain alive one day at a time.';
	} else if (streak >= 30) {
		streakMessageElement.textContent = 'One full month. You are building identity, not just a habit.';
	} else if (streak >= 14) {
		streakMessageElement.textContent = 'You are building a real habit now. Keep protecting this streak.';
	} else if (streak >= 7) {
		streakMessageElement.textContent = 'Strong momentum. You are proving consistency is possible.';
	} else if (streak >= 3) {
		streakMessageElement.textContent = 'Nice run. You are close to your first weekly reward.';
	} else {
		streakMessageElement.textContent = 'Finish at least one task today to keep your streak alive.';
	}

	badgeListElement.innerHTML = '';
	baseGoals
		.filter((goal) => streak >= goal)
		.forEach((goal) => {
			const badge = document.createElement('span');
			badge.className = 'badge-chip';
			badge.textContent = `${goal}d unlocked`;
			badgeListElement.appendChild(badge);
		});
};

const renderProgressCharts = () => {
	const today = new Date();
	const currentYear = today.getFullYear();

	const weekItems = [];
	for (let i = 6; i >= 0; i -= 1) {
		const day = new Date(today);
		day.setDate(today.getDate() - i);
		const label = day.toLocaleDateString('en-US', { weekday: 'short' });
		const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
		const count = getDailyCompletionCount(key);
		weekItems.push({ label, key, count });
	}

	const maxWeekCount = Math.max(...weekItems.map((item) => item.count), 1);
	weekChart.innerHTML = '';
	weekItems.forEach((item) => {
		const weekItem = document.createElement('div');
		weekItem.className = 'week-item';

		const countLabel = document.createElement('span');
		countLabel.className = 'week-bar-count';
		countLabel.textContent = String(item.count);

		const bar = document.createElement('div');
		bar.className = `week-bar${item.count > 0 ? ' is-active' : ''}`;
		bar.style.height = `${Math.max((item.count / maxWeekCount) * 100, 8)}%`;
		bar.title = `${item.key}: ${item.count} completed task${item.count === 1 ? '' : 's'}`;

		const label = document.createElement('span');
		label.className = 'week-bar-label';
		label.textContent = item.label;

		weekItem.appendChild(countLabel);
		weekItem.appendChild(bar);
		weekItem.appendChild(label);
		weekChart.appendChild(weekItem);
	});

	const monthActiveDays = new Array(12).fill(0);
	Object.entries(state.stats.dailyCompletions).forEach(([dateStamp, count]) => {
		if (Number(count) <= 0) {
			return;
		}

		const [year, month] = dateStamp.split('-').map(Number);
		if (year === currentYear) {
			monthActiveDays[month - 1] += 1;
		}
	});

	const maxMonthCount = Math.max(...monthActiveDays, 1);
	monthChart.innerHTML = '';
	monthActiveDays.forEach((count, index) => {
		const monthItem = document.createElement('div');
		monthItem.className = 'month-item';

		const countLabel = document.createElement('span');
		countLabel.className = 'month-bar-count';
		countLabel.textContent = String(count);

		const bar = document.createElement('div');
		bar.className = `month-bar${count > 0 ? ' is-active' : ''}`;
		bar.style.height = `${Math.max((count / maxMonthCount) * 100, 8)}%`;
		bar.title = `${monthNames[index]}: ${count} active day${count === 1 ? '' : 's'}`;

		const label = document.createElement('span');
		label.className = 'month-bar-label';
		label.textContent = monthNames[index];

		monthItem.appendChild(countLabel);
		monthItem.appendChild(bar);
		monthItem.appendChild(label);
		monthChart.appendChild(monthItem);
	});

	const activeDays = monthActiveDays.reduce((sum, count) => sum + count, 0);
	const yearStartUtc = Date.UTC(currentYear, 0, 1);
	const yearEndUtc = Date.UTC(currentYear, 11, 31);
	const totalDaysInYear = Math.floor((yearEndUtc - yearStartUtc) / (1000 * 60 * 60 * 24)) + 1;
	const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
	const elapsedDays = Math.floor((todayUtc - yearStartUtc) / (1000 * 60 * 60 * 24)) + 1;
	const consistencyPercent = elapsedDays > 0 ? Math.round((activeDays / elapsedDays) * 100) : 0;
	yearChartLabel.textContent = `${activeDays}/${totalDaysInYear} active days in ${currentYear} (${consistencyPercent}% consistency)`;
	renderGoalProgress();
};

const getGoalTrackingEndDate = (goal, todayDateStamp) => {
	if (goal.type === 'period' && goal.endDate) {
		return daysBetweenDateStamps(goal.endDate, todayDateStamp) < 0 ? goal.endDate : todayDateStamp;
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
		const dateStamp = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
		dates.push(dateStamp);
		cursorUtc += 1000 * 60 * 60 * 24;
	}

	return dates;
};

const renderGoalOptions = () => {
	if (!scheduleGoalSelect) {
		return;
	}

	const previousValue = scheduleGoalSelect.value;
	scheduleGoalSelect.innerHTML = '<option value="">No goal</option>';

	getActiveGoals().forEach((goal) => {
		const option = document.createElement('option');
		option.value = goal.id;
		option.textContent = goal.title;
		scheduleGoalSelect.appendChild(option);
	});

	if (previousValue && state.goals.some((goal) => goal.id === previousValue)) {
		scheduleGoalSelect.value = previousValue;
	}
};

const buildGoalOptionsMarkup = (selectedGoalId = '') => {
	const options = ['<option value="">No goal</option>'];
	getActiveGoals().forEach((goal) => {
		const selected = goal.id === selectedGoalId ? ' selected' : '';
		options.push(`<option value="${goal.id}"${selected}>${goal.title}</option>`);
	});
	return options.join('');
};

const getGoalDurationDays = (goal) => {
	if (!goal || goal.type !== 'period' || !goal.endDate) {
		return '';
	}

	return String(Math.max(1, daysBetweenDateStamps(goal.startDate, goal.endDate) + 1));
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

const renderGoals = () => {
	if (!goalList) {
		return;
	}

	goalList.innerHTML = '';
	const activeGoals = getActiveGoals();
	activeGoals.forEach((goal, index) => {
		const scheduleCount = state.schedules.filter((schedule) => schedule.goalId === goal.id).length;
		const goalColor = getGoalColor(goal);
		const canMoveUp = index > 0;
		const canMoveDown = index < activeGoals.length - 1;
		const goalItem = document.createElement('li');
		goalItem.className = 'goal-item';
		goalItem.dataset.goalId = goal.id;
		goalItem.style.setProperty('--goal-color', goalColor);

		const goalTypeLabel = goal.type === 'period' && goal.endDate
			? `${goal.startDate} to ${goal.endDate}`
			: 'Habit (indefinite)';

		goalItem.innerHTML = `
			<div class="goal-item-view">
				<div class="goal-item-text">
					<strong>${goal.title}</strong>
					<span>${goalTypeLabel} | ${scheduleCount} task${scheduleCount === 1 ? '' : 's'}</span>
				</div>
				<div class="goal-item-actions">
					<span class="goal-color-dot" aria-hidden="true"></span>
					<button type="button" class="goal-move-btn goal-move-up-btn" ${canMoveUp ? '' : 'disabled'} aria-label="Move goal up" title="Move up">↑</button>
					<button type="button" class="goal-move-btn goal-move-down-btn" ${canMoveDown ? '' : 'disabled'} aria-label="Move goal down" title="Move down">↓</button>
					<button type="button" class="goal-edit-btn">Edit</button>
					<button type="button" class="goal-finish-btn">Finish</button>
					<button type="button" class="goal-remove-btn">Remove goal</button>
				</div>
			</div>
			<form class="goal-edit-form">
				<input type="text" class="goal-edit-title-input" required />
				<select class="goal-edit-type-select">
					<option value="habit">Habit (indefinite)</option>
					<option value="period">Period goal</option>
				</select>
				<input type="number" class="goal-edit-duration-input" min="1" placeholder="Days" />
				<input type="color" class="goal-edit-color-input" aria-label="Goal color" title="Goal color" />
				<button type="button" class="goal-save-btn">Save</button>
				<button type="button" class="goal-cancel-btn">Cancel</button>
			</form>
		`;

		const titleInput = goalItem.querySelector('.goal-edit-title-input');
		if (titleInput) {
			titleInput.value = goal.title;
		}

		const typeSelect = goalItem.querySelector('.goal-edit-type-select');
		const durationInput = goalItem.querySelector('.goal-edit-duration-input');
		if (typeSelect) {
			typeSelect.value = goal.type;
		}
		if (durationInput) {
			durationInput.value = getGoalDurationDays(goal);
			durationInput.disabled = goal.type !== 'period';
			durationInput.required = goal.type === 'period';
		}

		const colorInput = goalItem.querySelector('.goal-edit-color-input');
		if (colorInput) {
			colorInput.value = goalColor;
		}

		goalList.appendChild(goalItem);
	});

	renderGoalOptions();
};

const renderFinishedGoals = () => {
	if (!toggleFinishedGoalsButton || !finishedGoalsPanel || !finishedGoalsList) {
		return;
	}

	const finishedGoals = getFinishedGoals();
	toggleFinishedGoalsButton.hidden = false;
	const isExpanded = !finishedGoalsPanel.hidden;
	toggleFinishedGoalsButton.textContent = `${isExpanded ? 'Hide' : 'See'} finished goals (${finishedGoals.length})`;
	toggleFinishedGoalsButton.setAttribute('aria-expanded', String(isExpanded));

	finishedGoalsList.innerHTML = '';
	if (finishedGoals.length === 0) {
		const emptyItem = document.createElement('li');
		emptyItem.className = 'finished-goal-empty';
		emptyItem.textContent = 'No finished goals yet.';
		finishedGoalsList.appendChild(emptyItem);
		return;
	}

	finishedGoals.forEach((goal) => {
		const goalColor = getGoalColor(goal);
		const item = document.createElement('li');
		item.className = 'finished-goal-item';
		item.dataset.goalId = goal.id;
		item.style.setProperty('--goal-color', goalColor);

		const head = document.createElement('div');
		head.className = 'finished-goal-head';
		const title = document.createElement('strong');
		title.textContent = goal.title;
		const meta = document.createElement('span');
		meta.textContent = `Ended on ${goal.finishedAt || goal.endDate}`;
		const unfinishBtn = document.createElement('button');
		unfinishBtn.type = 'button';
		unfinishBtn.className = 'goal-unfinish-btn';
		unfinishBtn.textContent = 'Reactivate';
		head.appendChild(title);
		head.appendChild(meta);
		head.appendChild(unfinishBtn);
		item.appendChild(head);

		const linkedSchedules = state.schedules.filter((schedule) => schedule.goalId === goal.id);
		if (linkedSchedules.length > 0) {
			const taskList = document.createElement('ul');
			taskList.className = 'finished-goal-task-list';
			linkedSchedules.forEach((schedule) => {
				const taskItem = document.createElement('li');
				taskItem.textContent = schedule.text;
				taskList.appendChild(taskItem);
			});
			item.appendChild(taskList);
		}

		finishedGoalsList.appendChild(item);
	});
};

const buildGoalProgressItem = (goal, today, extraClass = '') => {
	const goalColor = getGoalColor(goal);
	const attachedSchedules = state.schedules.filter((schedule) => schedule.goalId === goal.id);
	const trackingEndDate = getGoalTrackingEndDate(goal, today);
	const trackingDates = getDateStampsInRange(goal.startDate, trackingEndDate);
	const validDates = trackingDates.filter((dateStamp) => isGoalActiveOnDate(goal, dateStamp));

	const baseExpectedCompletions = validDates.length * attachedSchedules.length;
	const goalDateCompletions = state.stats.goalDailyCompletions?.[goal.id] || {};
	let completedCompletions = 0;
	validDates.forEach((dateStamp) => {
		completedCompletions += Number(goalDateCompletions[dateStamp] || 0);
	});

	// Keep the denominator coherent with historical tracked completions.
	const expectedCompletions = Math.max(baseExpectedCompletions, completedCompletions);

	const progressPercent = expectedCompletions > 0
		? Math.min(Math.round((completedCompletions / expectedCompletions) * 100), 100)
		: 0;

	const goalItem = document.createElement('li');
	goalItem.className = `goal-progress-item${extraClass ? ' ' + extraClass : ''}`;
	goalItem.style.setProperty('--goal-color', goalColor);
	goalItem.innerHTML = `
		<div class="goal-progress-head">
			<strong>${goal.title}</strong>
			<span>${progressPercent}%</span>
		</div>
		<p class="goal-progress-meta">
			${goal.type === 'period' && goal.endDate ? `Period: ${goal.startDate} to ${goal.endDate}` : `Habit since ${goal.startDate}`}
		</p>
		<p class="goal-progress-meta">
			${completedCompletions}/${expectedCompletions} completed checks • ${attachedSchedules.length} attached task${attachedSchedules.length === 1 ? '' : 's'}
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

	goalProgressList.innerHTML = '';
	const activeGoals = getActiveGoals();
	const finishedGoals = getFinishedGoals();
	const today = getCurrentDateStamp();

	if (activeGoals.length === 0 && finishedGoals.length === 0) {
		const emptyItem = document.createElement('li');
		emptyItem.className = 'goal-progress-item goal-progress-empty';
		emptyItem.textContent = 'No goals yet.';
		goalProgressList.appendChild(emptyItem);
		return;
	}

	activeGoals.forEach((goal) => {
		goalProgressList.appendChild(buildGoalProgressItem(goal, today));
	});

	if (finishedGoals.length > 0) {
		const wrapItem = document.createElement('li');
		wrapItem.className = 'goal-progress-finished-wrap';

		const toggleBtn = document.createElement('button');
		toggleBtn.type = 'button';
		toggleBtn.className = 'goal-progress-finished-toggle';
		toggleBtn.textContent = `Show finished goals (${finishedGoals.length})`;
		toggleBtn.setAttribute('aria-expanded', 'false');

		const panel = document.createElement('ul');
		panel.className = 'goal-progress-finished-list';
		panel.classList.remove('is-open');
		panel.hidden = true;

		finishedGoals.forEach((goal) => {
			panel.appendChild(buildGoalProgressItem(goal, today, 'goal-progress-item--finished'));
		});

		toggleBtn.addEventListener('click', () => {
			const isOpen = panel.classList.toggle('is-open');
			panel.hidden = !isOpen;
			toggleBtn.setAttribute('aria-expanded', String(isOpen));
			toggleBtn.textContent = `${isOpen ? 'Hide' : 'Show'} finished goals (${finishedGoals.length})`;
		});

		wrapItem.appendChild(toggleBtn);
		wrapItem.appendChild(panel);
		goalProgressList.appendChild(wrapItem);
	}
};

const showToast = (message, icon = '🎉', variant = 'success') => {
	const toast = document.getElementById('completion-toast');
	if (!toast) {
		return;
	}
	toast.classList.remove('is-warning', 'is-error');
	if (variant === 'warning') {
		toast.classList.add('is-warning');
	}
	if (variant === 'error') {
		toast.classList.add('is-error');
	}
	const toastIcon = toast.querySelector('.toast-icon');
	const toastMessage = toast.querySelector('.toast-msg');
	if (toastIcon) {
		toastIcon.textContent = icon;
	}
	if (toastMessage) {
		toastMessage.textContent = message;
	}
	toast.classList.add('is-visible');
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => {
		toast.classList.remove('is-visible');
	}, 1200);
};

const showCompletionToast = () => {
	showToast('Task complete! Keep it up!', '🎉', 'success');
};

const showDuplicateWarning = (message) => {
	showToast(message, '🚫', 'warning');
};

const showSuccessToast = (message) => {
	showToast(message, '✅', 'success');
};

const sortTasks = () => {
	const taskItems = Array.from(todoList.querySelectorAll('.todo-item'));
	const unchecked = taskItems.filter((item) => !item.classList.contains('is-done'));
	const checked = taskItems.filter((item) => item.classList.contains('is-done'));
	[...unchecked, ...checked].forEach((item) => todoList.appendChild(item));
};

const reorderUncheckedTasksByInsertIndex = (dragTaskId, rawInsertIndex) => {
	const uncheckedTasks = state.tasks.filter((task) => !task.done);
	const fromIndex = uncheckedTasks.findIndex((task) => task.id === dragTaskId);
	if (fromIndex === -1) {
		return false;
	}

	const insertIndexClamped = Math.max(0, Math.min(rawInsertIndex, uncheckedTasks.length));

	const reorderedUnchecked = [...uncheckedTasks];
	const [movedTask] = reorderedUnchecked.splice(fromIndex, 1);
	const normalizedInsertIndex = insertIndexClamped > fromIndex ? insertIndexClamped - 1 : insertIndexClamped;
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
		.querySelectorAll('.todo-item.is-drop-before, .todo-item.is-drop-after, .todo-item.is-dragging')
		.forEach((item) => {
			item.classList.remove('is-drop-before', 'is-drop-after', 'is-dragging');
			if (keepDragging && item.dataset.taskId === draggedTaskId) {
				item.classList.add('is-dragging');
			}
		});
	dropInsertIndex = null;
};

const getUncheckedTaskItems = () => {
	return Array.from(todoList.querySelectorAll('.todo-item')).filter(
		(item) => !item.classList.contains('is-done'),
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

	const lastRect = uncheckedItems[uncheckedItems.length - 1].getBoundingClientRect();
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
		.querySelectorAll('.todo-item.is-drop-before, .todo-item.is-drop-after')
		.forEach((item) => {
			item.classList.remove('is-drop-before', 'is-drop-after');
		});

	if (insertIndex === null) {
		return;
	}

	const uncheckedItems = getUncheckedTaskItems();
	if (uncheckedItems.length === 0) {
		return;
	}

	if (insertIndex <= 0) {
		uncheckedItems[0].classList.add('is-drop-before');
		return;
	}

	if (insertIndex >= uncheckedItems.length) {
		uncheckedItems[uncheckedItems.length - 1].classList.add('is-drop-after');
		return;
	}

	uncheckedItems[insertIndex].classList.add('is-drop-before');
};

const handleDropReorder = () => {
	if (!draggedTaskId) {
		return;
	}

	const resolvedInsertIndex =
		dropInsertIndex === null && typeof lastDragPointerY === 'number'
			? getDropInsertIndexFromPointer(lastDragPointerY)
			: dropInsertIndex;

	if (resolvedInsertIndex === null) {
		return;
	}

	const didReorder = reorderUncheckedTasksByInsertIndex(draggedTaskId, resolvedInsertIndex);

	if (didReorder) {
		renderTasks();
		saveStateToStorage();
	}
};

const createTaskElement = (task) => {
	const taskElement = document.createElement('div');
	taskElement.className = 'todo-item';
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
			<button type="button" class="todo-action-btn todo-edit-btn" aria-label="Edit task">
				<i title="Edit" class="fa-solid fa-pen"></i>
			</button>
			<button type="button" class="todo-action-btn todo-save-btn" aria-label="Save task">
				<i title="Save" class="fa-solid fa-floppy-disk"></i>
			</button>
			<button type="button" class="todo-action-btn todo-delete-btn" aria-label="Delete task">
				<i title="Delete" class="fa-solid fa-trash"></i>
			</button>
		</div>
	`;

	const taskTextElement = taskElement.querySelector('.todo-item-text');
	const taskCheckbox = taskElement.querySelector('input[type="checkbox"]');
	const deleteButton = taskElement.querySelector('.todo-delete-btn');

	taskTextElement.textContent = task.text;
	taskCheckbox.checked = Boolean(task.done);
	taskElement.classList.toggle('is-done', taskCheckbox.checked);
	taskElement.classList.toggle('is-scheduled', Boolean(task.isScheduled));

	if (task.isScheduled) {
		deleteButton.setAttribute('aria-disabled', 'true');
		deleteButton.setAttribute('title', 'Remove this from Daily Schedules to delete it');

		if (task.scheduleId) {
			const schedule = state.schedules.find((s) => s.id === task.scheduleId);
			if (schedule?.goalId) {
				const goal = state.goals.find((g) => g.id === schedule.goalId);
				if (goal) {
					const color = getGoalColor(goal);
					taskElement.style.setProperty('--task-goal-color', color);
					taskElement.classList.add('has-goal-color');
					const badge = document.createElement('span');
					badge.className = 'task-goal-badge';
					badge.textContent = goal.title;
					taskTextElement.parentElement.appendChild(badge);
				}
			}
		}
	}

	return taskElement;
};

const getOrderedActiveSchedules = (dateStamp = getCurrentDateStamp()) => {
	const goalOrderById = new Map(getActiveGoals(dateStamp).map((goal, index) => [goal.id, index]));
	const scheduleOrderById = new Map(state.schedules.map((schedule, index) => [schedule.id, index]));
	const noGoalOrder = Number.MAX_SAFE_INTEGER;
	const noScheduleOrder = Number.MAX_SAFE_INTEGER;

	return state.schedules
		.filter((schedule) => !isScheduleFinished(schedule, dateStamp))
		.sort((left, right) => {
			const leftGoalOrder = left.goalId && goalOrderById.has(left.goalId)
				? goalOrderById.get(left.goalId)
				: noGoalOrder;
			const rightGoalOrder = right.goalId && goalOrderById.has(right.goalId)
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
	const fromIndex = orderedSchedules.findIndex((schedule) => schedule.id === scheduleId);
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

	const fromStateIndex = state.schedules.findIndex((schedule) => schedule.id === fromSchedule.id);
	const toStateIndex = state.schedules.findIndex((schedule) => schedule.id === toSchedule.id);
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
			const leftOrder = left.scheduleId && scheduleOrderById.has(left.scheduleId)
				? scheduleOrderById.get(left.scheduleId)
				: noScheduleOrder;
			const rightOrder = right.scheduleId && scheduleOrderById.has(right.scheduleId)
				? scheduleOrderById.get(right.scheduleId)
				: noScheduleOrder;

			if (leftOrder !== rightOrder) {
				return leftOrder - rightOrder;
			}

			const leftDate = left.createdForDate || '';
			const rightDate = right.createdForDate || '';
			if (leftDate !== rightDate) {
				return leftDate.localeCompare(rightDate);
			}

			return left.text.localeCompare(right.text);
		});

	state.tasks = [...unscheduledTasks, ...scheduledTasks];
};

const findTaskById = (taskId) => state.tasks.find((task) => task.id === taskId);

const saveStateToStorage = () => {
	localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(state.tasks));
	localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(state.schedules));
	localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(state.goals));
	localStorage.setItem(LAST_SYNC_DATE_STORAGE_KEY, state.lastSyncDate || '');
	localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(state.stats));
	updateTaskSummary();
	renderStreakDashboard();
};

const loadStoredTasks = () => {
	const rawTasksV2 = localStorage.getItem(TASKS_STORAGE_KEY);
	if (rawTasksV2) {
		try {
			const parsed = JSON.parse(rawTasksV2);
			if (Array.isArray(parsed)) {
				return parsed
					.filter((task) => task && typeof task.text === 'string')
					.map((task) => ({
						id: typeof task.id === 'string' ? task.id : createId('task'),
						text: task.text.trim() || 'Untitled task',
						done: Boolean(task.done),
						isScheduled: Boolean(task.isScheduled),
						scheduleId: typeof task.scheduleId === 'string' ? task.scheduleId : null,
						createdForDate: typeof task.createdForDate === 'string' ? task.createdForDate : null,
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
			.filter((task) => task && typeof task.text === 'string')
			.map((task) => ({
				id: createId('task'),
				text: task.text.trim() || 'Untitled task',
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
			.filter((schedule) => schedule && typeof schedule.text === 'string')
			.map((schedule) => ({
				id: typeof schedule.id === 'string' ? schedule.id : createId('schedule'),
				text: schedule.text.trim() || 'Untitled scheduled task',
				goalId: typeof schedule.goalId === 'string' ? schedule.goalId : null,
				createdAt: typeof schedule.createdAt === 'number' ? schedule.createdAt : Date.now(),
			}));
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
			.filter((goal) => goal && typeof goal.title === 'string')
			.map((goal) => {
				const startDate = typeof goal.startDate === 'string' ? goal.startDate : getCurrentDateStamp();
				const isPeriodGoal = goal.type === 'period' && typeof goal.endDate === 'string';
				return {
					id: typeof goal.id === 'string' ? goal.id : createId('goal'),
					title: goal.title.trim() || 'Untitled goal',
					type: isPeriodGoal ? 'period' : 'habit',
					color: normalizeGoalColor(goal.color),
					startDate,
					endDate: isPeriodGoal ? goal.endDate : null,
					finishedAt: typeof goal.finishedAt === 'string' ? goal.finishedAt : null,
					createdAt: typeof goal.createdAt === 'number' ? goal.createdAt : Date.now(),
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
		if (!parsed || typeof parsed !== 'object') {
			return { dailyCompletions: {}, goalDailyCompletions: {} };
		}

		const dailyCompletions = parsed.dailyCompletions;
		if (!dailyCompletions || typeof dailyCompletions !== 'object') {
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
		if (parsed.goalDailyCompletions && typeof parsed.goalDailyCompletions === 'object') {
			Object.entries(parsed.goalDailyCompletions).forEach(([goalId, dailyMap]) => {
				if (!dailyMap || typeof dailyMap !== 'object') {
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
			});
		}

		return { dailyCompletions: normalized, goalDailyCompletions };
	} catch {
		return { dailyCompletions: {}, goalDailyCompletions: {} };
	}
};

const syncScheduledTasksForToday = () => {
	const today = getCurrentDateStamp();
	const needsNewDaySync = state.lastSyncDate !== today;
	const isScheduleActiveForDate = (schedule, dateStamp) => {
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

		return isGoalActiveOnDate(goal, dateStamp);
	};

	// Keep one scheduled task instance per schedule/day in case storage was duplicated.
	const seenScheduledKeys = new Set();
	state.tasks = state.tasks.filter((task) => {
		if (!task.isScheduled) {
			return true;
		}

		const dedupeKey = `${task.scheduleId || ''}|${task.createdForDate || ''}`;
		if (seenScheduledKeys.has(dedupeKey)) {
			return false;
		}
		seenScheduledKeys.add(dedupeKey);
		return true;
	});

	if (needsNewDaySync) {
		state.tasks = state.tasks.filter((task) => !task.isScheduled);
		getOrderedActiveSchedules(today).forEach((schedule) => {
			if (!isScheduleActiveForDate(schedule, today)) {
				return;
			}

			state.tasks.push({
				id: createId('task'),
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
		const linkedSchedule = state.schedules.find((schedule) => schedule.id === task.scheduleId);
		if (!linkedSchedule) {
			return false;
		}

		return isScheduleActiveForDate(linkedSchedule, task.createdForDate || today);
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
				id: createId('task'),
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

const renderTasks = () => {
	todoList.querySelectorAll('.todo-item').forEach((taskItem) => taskItem.remove());
	state.tasks.forEach((task) => {
		todoList.appendChild(createTaskElement(task));
	});
	sortTasks();
	updateTaskSummary();
};

const renderSchedules = () => {
	scheduleList.innerHTML = '';
	const orderedSchedules = getOrderedActiveSchedules();
	if (orderedSchedules.length === 0) {
		return;
	}

	let currentGroupKey = null;
	orderedSchedules.forEach((schedule, currentIndex) => {
		const groupedGoal = schedule.goalId
			? state.goals.find((item) => item.id === schedule.goalId)
			: null;
		const groupKey = groupedGoal?.id || '__no-goal__';
		const previousSchedule = currentIndex > 0 ? orderedSchedules[currentIndex - 1] : null;
		const nextSchedule = currentIndex < orderedSchedules.length - 1
			? orderedSchedules[currentIndex + 1]
			: null;
		const previousGroupKey = previousSchedule ? (previousSchedule.goalId || '__no-goal__') : null;
		const nextGroupKey = nextSchedule ? (nextSchedule.goalId || '__no-goal__') : null;
		const canMoveUp = previousGroupKey === groupKey;
		const canMoveDown = nextGroupKey === groupKey;

		if (groupKey !== currentGroupKey) {
			currentGroupKey = groupKey;
			const groupTitle = document.createElement('li');
			groupTitle.className = 'schedule-group-title';
			groupTitle.textContent = groupedGoal ? groupedGoal.title : 'No goal';
			scheduleList.appendChild(groupTitle);
		}

		const scheduleItem = document.createElement('li');
		scheduleItem.className = 'schedule-item';
		scheduleItem.dataset.scheduleId = schedule.id;
		const goal = groupedGoal;
		const goalColor = goal ? getGoalColor(goal) : null;
		const goalLabel = goal
			? `<small class="schedule-goal-badge" style="--goal-badge-color: ${goalColor};">${goal.title}</small>`
			: '';
		scheduleItem.innerHTML = `
			<div class="schedule-item-view">
				<span>${schedule.text} ${goalLabel}</span>
				<div class="schedule-item-actions">
					<button type="button" class="schedule-move-btn schedule-move-up-btn" ${canMoveUp ? '' : 'disabled'} aria-label="Move schedule up" title="Move up">↑</button>
					<button type="button" class="schedule-move-btn schedule-move-down-btn" ${canMoveDown ? '' : 'disabled'} aria-label="Move schedule down" title="Move down">↓</button>
					<button type="button" class="schedule-edit-btn">Edit</button>
					<button type="button" class="schedule-remove-btn">Remove</button>
				</div>
			</div>
			<form class="schedule-edit-form">
				<input type="text" class="schedule-edit-input" required />
				<select class="schedule-edit-goal-select">${buildGoalOptionsMarkup(schedule.goalId || '')}</select>
				<button type="button" class="schedule-save-btn">Save</button>
				<button type="button" class="schedule-cancel-btn">Cancel</button>
			</form>
		`;

		const editInput = scheduleItem.querySelector('.schedule-edit-input');
		if (editInput) {
			editInput.value = schedule.text;
		}
		scheduleList.appendChild(scheduleItem);
	});
};

const updateScheduleItemView = (scheduleItem, schedule) => {
	if (!scheduleItem || !schedule) {
		return;
	}

	const labelElement = scheduleItem.querySelector('.schedule-item-view span');
	if (labelElement) {
		labelElement.textContent = schedule.text;
		const goal = state.goals.find((item) => item.id === schedule.goalId);
		if (goal) {
			labelElement.appendChild(document.createTextNode(' '));
			const badge = document.createElement('small');
			badge.className = 'schedule-goal-badge';
			badge.style.setProperty('--goal-badge-color', getGoalColor(goal));
			badge.textContent = goal.title;
			labelElement.appendChild(badge);
		}
	}

	const editInput = scheduleItem.querySelector('.schedule-edit-input');
	if (editInput) {
		editInput.value = schedule.text;
	}

	const goalSelect = scheduleItem.querySelector('.schedule-edit-goal-select');
	if (goalSelect) {
		goalSelect.innerHTML = buildGoalOptionsMarkup(schedule.goalId || '');
	}
};

const initializeState = () => {
	state.tasks = loadStoredTasks();
	state.goals = loadStoredGoals();
	ensureDistinctGoalColors();
	state.schedules = loadStoredSchedules();
	state.schedules = state.schedules.map((schedule) => ({
		...schedule,
		goalId: schedule.goalId && state.goals.some((goal) => goal.id === schedule.goalId)
			? schedule.goalId
			: null,
	}));
	state.stats = loadStoredStats();
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
	title = 'Delete task?',
	message = 'This action cannot be undone.',
} = {}) => {
	pendingDeleteTaskId = taskId;
	pendingDeleteScheduleId = scheduleId;
	if (deleteModalTitle) {
		deleteModalTitle.textContent = title;
	}
	if (deleteModalMessage) {
		deleteModalMessage.textContent = message;
	}
	deleteModal.classList.add('is-open');
	deleteModal.setAttribute('aria-hidden', 'false');
};

const hideDeleteModal = () => {
	pendingDeleteTaskId = null;
	pendingDeleteScheduleId = null;
	if (deleteModalTitle) {
		deleteModalTitle.textContent = 'Delete task?';
	}
	if (deleteModalMessage) {
		deleteModalMessage.textContent = 'This action cannot be undone.';
	}
	deleteModal.classList.remove('is-open');
	deleteModal.setAttribute('aria-hidden', 'true');
};

const showClearAllModal = () => {
	clearAllModal.classList.add('is-open');
	clearAllModal.setAttribute('aria-hidden', 'false');
};

const hideClearAllModal = () => {
	clearAllModal.classList.remove('is-open');
	clearAllModal.setAttribute('aria-hidden', 'true');
};

const showScheduleModal = () => {
	syncScheduledTasksForToday();
	renderGoals();
	renderFinishedGoals();
	renderSchedules();
	if (goalColorInput) {
		goalColorInput.value = getNextAvailableGoalColor();
	}
	scheduleModal.classList.add('is-open');
	scheduleModal.setAttribute('aria-hidden', 'false');
	document.body.classList.add('is-schedule-open');
};

const hideScheduleModal = () => {
	scheduleModal.classList.remove('is-open');
	scheduleModal.setAttribute('aria-hidden', 'true');
	document.body.classList.remove('is-schedule-open');
};

const showProgressModal = () => {
	renderProgressCharts();
	progressModal.classList.add('is-open');
	progressModal.setAttribute('aria-hidden', 'false');
	document.body.classList.add('is-progress-open');
};

const hideProgressModal = () => {
	progressModal.classList.remove('is-open');
	progressModal.setAttribute('aria-hidden', 'true');
	document.body.classList.remove('is-progress-open');
};

const showRemoveGoalModal = (goalId) => {
	pendingRemoveGoalId = goalId;
	removeGoalModal.classList.add('is-open');
	removeGoalModal.setAttribute('aria-hidden', 'false');
};

const hideRemoveGoalModal = () => {
	pendingRemoveGoalId = null;
	removeGoalModal.classList.remove('is-open');
	removeGoalModal.setAttribute('aria-hidden', 'true');
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
	showSuccessToast('Goal removed successfully.');
	saveStateToStorage();
};

const removeScheduleById = (scheduleId) => {
	state.schedules = state.schedules.filter((schedule) => schedule.id !== scheduleId);
	state.tasks = state.tasks.filter((task) => task.scheduleId !== scheduleId);

	renderSchedules();
	renderGoals();
	renderFinishedGoals();
	renderProgressCharts();
	renderTasks();
	showSuccessToast('Daily schedule removed successfully.');
	saveStateToStorage();
};

const getGoalIdFromTask = (task) => {
	if (!task?.isScheduled || !task.scheduleId) {
		return null;
	}

	const schedule = state.schedules.find((item) => item.id === task.scheduleId);
	return schedule?.goalId || null;
};

const transferCompletedScheduleScoresToGoal = (scheduleId, previousGoalId, nextGoalId) => {
	if (previousGoalId === nextGoalId) {
		return;
	}

	state.tasks
		.filter((task) => task.isScheduled && task.scheduleId === scheduleId && task.done)
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

const applyTaskDoneState = (task, isDone) => {
	const wasDone = Boolean(task.done);
	task.done = Boolean(isDone);
	const taskGoalId = getGoalIdFromTask(task);
	const completionDate = task.createdForDate || getCurrentDateStamp();
	if (!wasDone && task.done) {
		adjustTodayCompletionCount(1);
		adjustGoalCompletionCount(taskGoalId, completionDate, 1);
		showCompletionToast();
	}
	if (wasDone && !task.done) {
		adjustTodayCompletionCount(-1);
		adjustGoalCompletionCount(taskGoalId, completionDate, -1);
	}
};

const finishTaskEditing = (taskItem, task) => {
	if (!taskItem || !task) {
		return;
	}

	const taskText = getTaskTextElement(taskItem);
	const saveButton = getSaveButton(taskItem);
	const editButton = getEditButton(taskItem);
	const nextText = taskText.textContent.trim() || 'Untitled task';

	task.text = nextText;
	taskText.textContent = nextText;
	taskText.contentEditable = 'false';
	taskItem.classList.remove('is-editing');
	saveButton.classList.remove('is-visible');
	editButton.classList.remove('is-hidden');

	if (task.isScheduled) {
		const schedule = state.schedules.find((item) => item.id === task.scheduleId);
		if (schedule) {
			schedule.text = nextText;
			renderSchedules();
		}
	}

	saveStateToStorage();
};

clearAllButton.addEventListener('click', showClearAllModal);
openScheduleButton.addEventListener('click', showScheduleModal);
closeScheduleButton.addEventListener('click', hideScheduleModal);
openProgressButton.addEventListener('click', showProgressModal);
closeProgressButton.addEventListener('click', hideProgressModal);

if (themeToggleButton) {
	themeToggleButton.addEventListener('click', toggleTheme);
}

if (goalTypeSelect && goalDurationInput) {
	goalTypeSelect.addEventListener('change', () => {
		const isPeriodGoal = goalTypeSelect.value === 'period';
		goalDurationInput.disabled = !isPeriodGoal;
		goalDurationInput.required = isPeriodGoal;
		if (!isPeriodGoal) {
			goalDurationInput.value = '';
		}
	});
}

if (installAppButton) {
	installAppButton.addEventListener('click', async () => {
		if (!deferredInstallPrompt) {
			showToast('Use browser menu and choose Install app or Add to Home Screen.', '📲', 'warning');
			return;
		}

		deferredInstallPrompt.prompt();
		const { outcome } = await deferredInstallPrompt.userChoice;
		if (outcome !== 'accepted') {
			showToast('Install canceled. You can try again anytime.', '📲', 'warning');
		}
		deferredInstallPrompt = null;
		updateInstallButtonState();
	});
}

confirmClearAllButton.addEventListener('click', () => {
	state.tasks = state.tasks.filter((task) => task.isScheduled);
	pendingDeleteTaskId = null;
	hideDeleteModal();
	hideClearAllModal();
	renderTasks();
	saveStateToStorage();
});

cancelClearAllButton.addEventListener('click', hideClearAllModal);

taskForm.addEventListener('submit', (event) => {
	event.preventDefault();

	const text = taskInput.value.trim();
	if (!text) {
		return;
	}

	if (isDuplicateTaskText(text)) {
		showDuplicateWarning('This task already exists.');
		taskInput.focus();
		taskInput.select();
		return;
	}

	state.tasks.push({
		id: createId('task'),
		text,
		done: false,
		isScheduled: false,
		scheduleId: null,
		createdForDate: null,
	});

	renderTasks();
	taskInput.value = '';
	taskInput.focus();
	saveStateToStorage();
});

scheduleForm.addEventListener('submit', (event) => {
	event.preventDefault();
	const text = scheduleInput.value.trim();
	if (!text) {
		return;
	}
	const selectedGoalId = scheduleGoalSelect?.value || null;

	const hasSameSchedule = isDuplicateScheduleText(text);
	if (hasSameSchedule) {
		showDuplicateWarning('This daily schedule already exists.');
		scheduleInput.focus();
		scheduleInput.select();
		return;
	}

	const newSchedule = {
		id: createId('schedule'),
		text,
		goalId: selectedGoalId,
		createdAt: Date.now(),
	};

	state.schedules.push(newSchedule);
	state.tasks.push({
		id: createId('task'),
		text,
		done: false,
		isScheduled: true,
		scheduleId: newSchedule.id,
		createdForDate: getCurrentDateStamp(),
	});

	renderSchedules();
	renderGoals();
	renderFinishedGoals();
	renderTasks();
	scheduleInput.value = '';
	if (scheduleGoalSelect) {
		scheduleGoalSelect.value = '';
	}
	scheduleInput.focus();
	showSuccessToast('Daily schedule created successfully.');
	saveStateToStorage();
});

goalForm.addEventListener('submit', (event) => {
	event.preventDefault();
	const title = goalTitleInput.value.trim();
	if (!title) {
		return;
	}

	if (isDuplicateGoalTitle(title)) {
		showDuplicateWarning('This goal already exists.');
		goalTitleInput.focus();
		goalTitleInput.select();
		return;
	}

	const today = getCurrentDateStamp();
	const isPeriodGoal = goalTypeSelect.value === 'period';
	const durationDays = Math.max(1, Number(goalDurationInput.value || 0));
	const selectedColor = normalizeGoalColor(goalColorInput?.value);
	let endDate = null;

	if (!selectedColor) {
		showDuplicateWarning('Choose a valid goal color.');
		goalColorInput?.focus();
		return;
	}

	if (isGoalColorInUse(selectedColor)) {
		showDuplicateWarning('This color is already used by another goal.');
		goalColorInput?.focus();
		return;
	}

	if (isPeriodGoal) {
		if (!Number.isFinite(durationDays) || durationDays < 1) {
			showDuplicateWarning('Choose a valid number of days for a period goal.');
			goalDurationInput.focus();
			return;
		}
		const endUtc = parseDateStampUtc(today) + ((durationDays - 1) * 24 * 60 * 60 * 1000);
		const endDateObj = new Date(endUtc);
		endDate = `${endDateObj.getUTCFullYear()}-${String(endDateObj.getUTCMonth() + 1).padStart(2, '0')}-${String(endDateObj.getUTCDate()).padStart(2, '0')}`;
	}

	state.goals.push({
		id: createId('goal'),
		title,
		type: isPeriodGoal ? 'period' : 'habit',
		color: selectedColor,
		startDate: today,
		endDate,
		finishedAt: null,
		createdAt: Date.now(),
	});

	renderGoals();
	renderFinishedGoals();
	renderProgressCharts();
	goalTitleInput.value = '';
	goalTypeSelect.value = 'habit';
	goalDurationInput.value = '';
	goalDurationInput.disabled = true;
	goalDurationInput.required = false;
	if (goalColorInput) {
		goalColorInput.value = getNextAvailableGoalColor();
	}
	goalTitleInput.focus();
	showSuccessToast('Goal created successfully.');
	saveStateToStorage();
});

goalList.addEventListener('click', (event) => {
	const moveUpButton = event.target.closest('.goal-move-up-btn');
	const moveDownButton = event.target.closest('.goal-move-down-btn');
	if (moveUpButton || moveDownButton) {
		const goalItem = event.target.closest('.goal-item');
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

	const editButton = event.target.closest('.goal-edit-btn');
	if (editButton) {
		const goalItem = editButton.closest('.goal-item');
		if (!goalItem) {
			return;
		}

		goalItem.classList.add('is-editing');
		const titleInput = goalItem.querySelector('.goal-edit-title-input');
		if (titleInput) {
			titleInput.focus();
			titleInput.select();
		}
		return;
	}

	const cancelButton = event.target.closest('.goal-cancel-btn');
	if (cancelButton) {
		const goalItem = cancelButton.closest('.goal-item');
		if (!goalItem) {
			return;
		}

		goalItem.classList.remove('is-editing');
		return;
	}

	const finishButton = event.target.closest('.goal-finish-btn');
	if (finishButton) {
		const goalItem = finishButton.closest('.goal-item');
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
		showSuccessToast('Goal marked as finished.');
		saveStateToStorage();
		return;
	}

	const saveButton = event.target.closest('.goal-save-btn');
	if (saveButton) {
		const goalItem = saveButton.closest('.goal-item');
		if (!goalItem) {
			return;
		}

		const goalId = goalItem.dataset.goalId;
		const goal = state.goals.find((item) => item.id === goalId);
		if (!goal) {
			return;
		}

		const titleInput = goalItem.querySelector('.goal-edit-title-input');
		const typeSelect = goalItem.querySelector('.goal-edit-type-select');
		const durationInput = goalItem.querySelector('.goal-edit-duration-input');
		const colorInput = goalItem.querySelector('.goal-edit-color-input');

		const nextTitle = titleInput?.value.trim() || '';
		const nextType = typeSelect?.value === 'period' ? 'period' : 'habit';

		if (!nextTitle) {
			showDuplicateWarning('Goal name cannot be empty.');
			titleInput?.focus();
			return;
		}

		if (isDuplicateGoalTitle(nextTitle, goalId)) {
			showDuplicateWarning('This goal already exists.');
			titleInput?.focus();
			titleInput?.select();
			return;
		}

		let nextEndDate = null;
		if (nextType === 'period') {
			const durationDays = Number(durationInput?.value || 0);
			if (!Number.isFinite(durationDays) || durationDays < 1) {
				showDuplicateWarning('Choose a valid number of days for a period goal.');
				durationInput?.focus();
				return;
			}

			const endUtc = parseDateStampUtc(goal.startDate) + ((Math.floor(durationDays) - 1) * 24 * 60 * 60 * 1000);
			const endDateObj = new Date(endUtc);
			nextEndDate = `${endDateObj.getUTCFullYear()}-${String(endDateObj.getUTCMonth() + 1).padStart(2, '0')}-${String(endDateObj.getUTCDate()).padStart(2, '0')}`;
		}

		const nextColor = normalizeGoalColor(colorInput?.value);
		if (!nextColor) {
			showDuplicateWarning('Choose a valid goal color.');
			colorInput?.focus();
			return;
		}

		if (isGoalColorInUse(nextColor, goalId)) {
			showDuplicateWarning('This color is already used by another goal.');
			colorInput?.focus();
			return;
		}

		goal.title = nextTitle;
		goal.type = nextType;
		goal.endDate = nextEndDate;
		goal.color = nextColor;

		goalItem.classList.remove('is-editing');
		syncScheduledTasksForToday();
		renderGoals();
		renderFinishedGoals();
		renderSchedules();
		renderProgressCharts();
		renderTasks();
		showSuccessToast('Goal updated successfully.');
		saveStateToStorage();
		return;
	}

	const removeButton = event.target.closest('.goal-remove-btn');
	if (!removeButton) {
		return;
	}

	const goalItem = removeButton.closest('.goal-item');
	if (!goalItem) {
		return;
	}

	const goalId = goalItem.dataset.goalId;
	showRemoveGoalModal(goalId);
});

cancelRemoveGoalButton.addEventListener('click', hideRemoveGoalModal);

if (finishedGoalsList) {
	finishedGoalsList.addEventListener('click', (event) => {
		const unfinishBtn = event.target.closest('.goal-unfinish-btn');
		if (!unfinishBtn) {
			return;
		}

		const item = unfinishBtn.closest('.finished-goal-item');
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
		if (goal.type === 'period' && goal.endDate) {
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
		showSuccessToast('Goal reactivated.');
		saveStateToStorage();
	});
}

confirmRemoveGoalButton.addEventListener('click', () => {
	if (!pendingRemoveGoalId) {
		hideRemoveGoalModal();
		return;
	}

	const goalIdToRemove = pendingRemoveGoalId;
	hideRemoveGoalModal();
	removeGoalById(goalIdToRemove);
});

if (toggleFinishedGoalsButton && finishedGoalsPanel) {
	toggleFinishedGoalsButton.addEventListener('click', () => {
		finishedGoalsPanel.hidden = !finishedGoalsPanel.hidden;
		renderFinishedGoals();
	});
}

goalList.addEventListener('change', (event) => {
	const typeSelect = event.target.closest('.goal-edit-type-select');
	if (!typeSelect) {
		return;
	}

	const goalItem = typeSelect.closest('.goal-item');
	if (!goalItem) {
		return;
	}

	const durationInput = goalItem.querySelector('.goal-edit-duration-input');
	if (!durationInput) {
		return;
	}

	const isPeriod = typeSelect.value === 'period';
	durationInput.disabled = !isPeriod;
	durationInput.required = isPeriod;
	if (!isPeriod) {
		durationInput.value = '';
	}
});

scheduleList.addEventListener('click', (event) => {
	const moveUpButton = event.target.closest('.schedule-move-up-btn');
	const moveDownButton = event.target.closest('.schedule-move-down-btn');
	if (moveUpButton || moveDownButton) {
		const scheduleItem = event.target.closest('.schedule-item');
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

	const editButton = event.target.closest('.schedule-edit-btn');
	if (editButton) {
		const scheduleItem = editButton.closest('.schedule-item');
		if (!scheduleItem) {
			return;
		}

		const scheduleId = scheduleItem.dataset.scheduleId;
		const schedule = state.schedules.find((item) => item.id === scheduleId);
		const goalSelect = scheduleItem.querySelector('.schedule-edit-goal-select');
		if (schedule && goalSelect) {
			goalSelect.innerHTML = buildGoalOptionsMarkup(schedule.goalId || '');
		}

		scheduleItem.classList.add('is-editing');
		const editInput = scheduleItem.querySelector('.schedule-edit-input');
		if (editInput) {
			editInput.focus();
			editInput.select();
		}
		return;
	}

	const cancelButton = event.target.closest('.schedule-cancel-btn');
	if (cancelButton) {
		const scheduleItem = cancelButton.closest('.schedule-item');
		if (!scheduleItem) {
			return;
		}
		scheduleItem.classList.remove('is-editing');
		return;
	}

	const saveButton = event.target.closest('.schedule-save-btn');
	if (saveButton) {
		const scheduleItem = saveButton.closest('.schedule-item');
		if (!scheduleItem) {
			return;
		}

		const scheduleId = scheduleItem.dataset.scheduleId;
		const schedule = state.schedules.find((item) => item.id === scheduleId);
		if (!schedule) {
			return;
		}

		const editInput = scheduleItem.querySelector('.schedule-edit-input');
		const goalSelect = scheduleItem.querySelector('.schedule-edit-goal-select');
		const nextText = editInput?.value.trim() || '';
		const nextGoalId = goalSelect?.value || null;

		if (!nextText) {
			showDuplicateWarning('Schedule text cannot be empty.');
			editInput?.focus();
			return;
		}

		if (isDuplicateScheduleText(nextText, scheduleId)) {
			showDuplicateWarning('This daily schedule already exists.');
			editInput?.focus();
			editInput?.select();
			return;
		}

		const previousGoalId = schedule.goalId || null;
		schedule.text = nextText;
		schedule.goalId = nextGoalId;

		state.tasks = state.tasks.map((task) =>
			task.scheduleId === scheduleId ? { ...task, text: nextText } : task,
		);
		transferCompletedScheduleScoresToGoal(scheduleId, previousGoalId, nextGoalId);

		updateScheduleItemView(scheduleItem, schedule);
		scheduleItem.classList.remove('is-editing');
		renderGoals();
		renderFinishedGoals();
		renderProgressCharts();
		renderTasks();
		showSuccessToast('Daily schedule updated successfully.');
		saveStateToStorage();
		return;
	}

	const removeButton = event.target.closest('.schedule-remove-btn');
	if (!removeButton) {
		return;
	}

	const scheduleItem = removeButton.closest('.schedule-item');
	if (!scheduleItem) {
		return;
	}

	const scheduleId = scheduleItem.dataset.scheduleId;
	const schedule = state.schedules.find((item) => item.id === scheduleId);
	if (!schedule) {
		return;
	}

	if (schedule.goalId) {
		const linkedTaskCount = state.schedules.filter((item) => item.goalId === schedule.goalId).length;
		if (linkedTaskCount <= 1) {
			showDuplicateWarning('This is the only task in the goal. Add another task before removing it.');
			return;
		}

		showDeleteModal({
			scheduleId,
			title: 'Remove goal task?',
			message: 'This task is linked to a goal. This action cannot be undone.',
		});
		return;
	}

	removeScheduleById(scheduleId);
});

scheduleList.addEventListener('keydown', (event) => {
	if (event.key !== 'Enter') {
		return;
	}

	const editInput = event.target.closest('.schedule-edit-input');
	if (!editInput) {
		return;
	}

	event.preventDefault();
	const scheduleItem = editInput.closest('.schedule-item');
	if (!scheduleItem) {
		return;
	}

	const saveButton = scheduleItem.querySelector('.schedule-save-btn');
	if (saveButton) {
		saveButton.click();
	}
});

todoList.addEventListener('click', (event) => {
	if (Date.now() < suppressClickUntil) {
		event.preventDefault();
		return;
	}

	const taskItem = event.target.closest('.todo-item');
	if (taskItem) {
		const clickedActionButton = event.target.closest('.todo-action-btn');
		const clickedCheckbox = event.target.matches('input[type="checkbox"]');
		const isEditing = taskItem.classList.contains('is-editing');

		if (!clickedActionButton && !clickedCheckbox && !isEditing) {
			const checkbox = taskItem.querySelector('input[type="checkbox"]');
			if (checkbox) {
				checkbox.checked = !checkbox.checked;
				const task = findTaskById(taskItem.dataset.taskId);
				if (task) {
					applyTaskDoneState(task, checkbox.checked);
				}
				taskItem.classList.toggle('is-done', checkbox.checked);
				sortTasks();
				saveStateToStorage();
			}
		}
	}

	const clickedButton = event.target.closest('.todo-action-btn');
	if (!clickedButton) {
		return;
	}

	const clickedTaskItem = clickedButton.closest('.todo-item');
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

	if (clickedButton.classList.contains('todo-edit-btn')) {
		taskText.contentEditable = 'true';
		taskText.focus();
		const selection = document.getSelection();
		if (selection) {
			selection.selectAllChildren(taskText);
			selection.collapseToEnd();
		}
		clickedTaskItem.classList.add('is-editing');
		saveButton.classList.add('is-visible');
		editButton.classList.add('is-hidden');
	}

	if (clickedButton.classList.contains('todo-save-btn')) {
		finishTaskEditing(clickedTaskItem, task);
	}

	if (clickedButton.classList.contains('todo-delete-btn')) {
		if (task.isScheduled) {
			return;
		}
		showDeleteModal({ taskId: task.id });
	}

});

todoList.addEventListener('keydown', (event) => {
	if (event.key !== 'Enter') {
		return;
	}

	const editableText = event.target.closest('.todo-item-text');
	if (!editableText || editableText.contentEditable !== 'true') {
		return;
	}

	event.preventDefault();

	const taskItem = editableText.closest('.todo-item');
	if (!taskItem) {
		return;
	}

	const task = findTaskById(taskItem.dataset.taskId);
	if (!task) {
		return;
	}

	finishTaskEditing(taskItem, task);
});

todoList.addEventListener('change', (event) => {
	if (!event.target.matches('input[type="checkbox"]')) {
		return;
	}

	const taskItem = event.target.closest('.todo-item');
	if (!taskItem) {
		return;
	}

	const task = findTaskById(taskItem.dataset.taskId);
	if (!task) {
		return;
	}

	applyTaskDoneState(task, event.target.checked);
	taskItem.classList.toggle('is-done', event.target.checked);
	sortTasks();
	saveStateToStorage();
});

todoList.addEventListener('dragstart', (event) => {
	if (isTouchReorderMode) {
		event.preventDefault();
		return;
	}

	const taskItem = event.target.closest('.todo-item');
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
	taskItem.classList.add('is-dragging');
	event.dataTransfer.effectAllowed = 'move';
	event.dataTransfer.setData('text/plain', task.id);
	ensureDragAutoScroll();
});

todoList.addEventListener('dragover', (event) => {
	if (!draggedTaskId) {
		return;
	}

	event.preventDefault();
	lastDragPointerY = event.clientY;
	dropInsertIndex = getDropInsertIndexFromPointer(event.clientY);
	updateDropIndicatorByInsertIndex(dropInsertIndex);
	ensureDragAutoScroll();
});

todoList.addEventListener('drop', (event) => {
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

todoList.addEventListener('dragend', () => {
	if (draggedTaskId) {
		handleDropReorder();
	}
	clearDropIndicators();
	draggedTaskId = null;
	lastDragPointerY = null;
	stopDragAutoScroll();
});

todoList.addEventListener('touchstart', (event) => {
	if (event.touches.length !== 1) {
		return;
	}

	const taskItem = event.target.closest('.todo-item');
	if (!taskItem) {
		return;
	}

	if (
		event.target.closest('.todo-action-btn') ||
		event.target.closest('input[type="checkbox"]') ||
		taskItem.classList.contains('is-editing')
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
		const dragItem = todoList.querySelector(`.todo-item[data-task-id="${draggedTaskId}"]`);
		if (dragItem) {
			dragItem.classList.add('is-dragging');
		}
		ensureDragAutoScroll();
		touchDragActivationTimer = null;
	}, TOUCH_DRAG_HOLD_MS);
}, { passive: true });

todoList.addEventListener('touchmove', (event) => {
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
	const hoveredElement = document.elementFromPoint(touch.clientX, touch.clientY);
	void hoveredElement;

	dropInsertIndex = getDropInsertIndexFromPointer(touch.clientY);
	updateDropIndicatorByInsertIndex(dropInsertIndex);
	ensureDragAutoScroll();
}, { passive: false });

todoList.addEventListener('touchend', () => {
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

todoList.addEventListener('touchcancel', () => {
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

cancelDeleteButton.addEventListener('click', hideDeleteModal);

confirmDeleteButton.addEventListener('click', () => {
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

deleteModal.addEventListener('click', (event) => {
	if (event.target === deleteModal) {
		hideDeleteModal();
	}
});

clearAllModal.addEventListener('click', (event) => {
	if (event.target === clearAllModal) {
		hideClearAllModal();
	}
});

scheduleModal.addEventListener('click', (event) => {
	if (event.target === scheduleModal) {
		hideScheduleModal();
	}
});

progressModal.addEventListener('click', (event) => {
	if (event.target === progressModal) {
		hideProgressModal();
	}
});

removeGoalModal.addEventListener('click', (event) => {
	if (event.target === removeGoalModal) {
		hideRemoveGoalModal();
	}
});

initializeState();
if (goalColorInput) {
	goalColorInput.value = getNextAvailableGoalColor();
}
applyTheme(getStoredTheme());

window.addEventListener('beforeinstallprompt', (event) => {
	event.preventDefault();
	deferredInstallPrompt = event;
	updateInstallButtonState();
});

window.addEventListener('appinstalled', () => {
	deferredInstallPrompt = null;
	updateInstallButtonState();
	showSuccessToast('App installed successfully.');
});

window.addEventListener('resize', updateInstallButtonState);

window.addEventListener('load', () => {
	const loader = document.getElementById('page-loader');
	if (loader) {
		loader.classList.add('is-hidden');
	}

	updateInstallButtonState();

	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('./sw.js').then((registration) => {
			registration.update();
		}).catch(() => {
			// Keep app functional even if SW registration fails.
		});
	}
});
