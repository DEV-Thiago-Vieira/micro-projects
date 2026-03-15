const todoList = document.getElementById('todo-list');
const taskForm = document.querySelector('.new-task-form');
const taskInput = document.querySelector('.new-task-input');
const checkedCountElement = document.getElementById('checked-count');
const uncheckedCountElement = document.getElementById('unchecked-count');
const clearAllButton = document.getElementById('clear-all-btn');
const installAppButton = document.getElementById('install-app-btn');
const backProjectsButton = document.querySelector('.back-projects-btn');
const congratsMessage = document.getElementById('todo-congrats');

const scheduleForm = document.getElementById('schedule-form');
const scheduleInput = document.getElementById('schedule-input');
const scheduleList = document.getElementById('schedule-list');
const openScheduleButton = document.getElementById('open-schedule-btn');
const scheduleModal = document.getElementById('schedule-modal');
const closeScheduleButton = document.getElementById('close-schedule-btn');

const openProgressButton = document.getElementById('open-progress-btn');
const closeProgressButton = document.getElementById('close-progress-btn');
const progressModal = document.getElementById('progress-modal');
const weekChart = document.getElementById('week-chart');
const monthChart = document.getElementById('month-chart');
const yearChartLabel = document.getElementById('year-chart-label');

const currentStreakElement = document.getElementById('current-streak');
const bestStreakElement = document.getElementById('best-streak');
const streakMessageElement = document.getElementById('streak-message');
const rewardProgressBarElement = document.getElementById('reward-progress-bar');
const rewardNextElement = document.getElementById('reward-next');
const badgeListElement = document.getElementById('badge-list');

const deleteModal = document.getElementById('delete-modal');
const cancelDeleteButton = document.getElementById('cancel-delete-btn');
const confirmDeleteButton = document.getElementById('confirm-delete-btn');
const clearAllModal = document.getElementById('clear-all-modal');
const cancelClearAllButton = document.getElementById('cancel-clear-all-btn');
const confirmClearAllButton = document.getElementById('confirm-clear-all-btn');

const TASKS_STORAGE_KEY = 'todo-items-v2';
const LEGACY_TASKS_STORAGE_KEY = 'todo-items-v1';
const SCHEDULES_STORAGE_KEY = 'todo-schedules-v1';
const LAST_SYNC_DATE_STORAGE_KEY = 'todo-last-sync-date-v1';
const STATS_STORAGE_KEY = 'todo-stats-v1';

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
	lastSyncDate: null,
	stats: {
		dailyCompletions: {},
	},
};

let pendingDeleteTaskId = null;
let toastTimer = null;
let deferredInstallPrompt = null;

const isStandaloneMode = () =>
	window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

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

const getCurrentDateStamp = () => {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

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
	if (lastDay !== today) {
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

const createTaskElement = (task) => {
	const taskElement = document.createElement('div');
	taskElement.className = 'todo-item';
	taskElement.dataset.taskId = task.id;

	taskElement.innerHTML = `
		<div class="todo-item-label">
			<input type="checkbox" />
			<span class="todo-item-text"></span>
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
	}

	return taskElement;
};

const findTaskById = (taskId) => state.tasks.find((task) => task.id === taskId);

const saveStateToStorage = () => {
	localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(state.tasks));
	localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(state.schedules));
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
				createdAt: typeof schedule.createdAt === 'number' ? schedule.createdAt : Date.now(),
			}));
	} catch {
		return [];
	}
};

const loadStoredStats = () => {
	const rawStats = localStorage.getItem(STATS_STORAGE_KEY);
	if (!rawStats) {
		return { dailyCompletions: {} };
	}

	try {
		const parsed = JSON.parse(rawStats);
		if (!parsed || typeof parsed !== 'object') {
			return { dailyCompletions: {} };
		}

		const dailyCompletions = parsed.dailyCompletions;
		if (!dailyCompletions || typeof dailyCompletions !== 'object') {
			return { dailyCompletions: {} };
		}

		const normalized = {};
		Object.entries(dailyCompletions).forEach(([dateStamp, count]) => {
			const numericCount = Number(count);
			if (!Number.isNaN(numericCount) && numericCount > 0) {
				normalized[dateStamp] = Math.floor(numericCount);
			}
		});

		return { dailyCompletions: normalized };
	} catch {
		return { dailyCompletions: {} };
	}
};

const syncScheduledTasksForToday = () => {
	const today = getCurrentDateStamp();
	const needsNewDaySync = state.lastSyncDate !== today;

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
		state.schedules.forEach((schedule) => {
			state.tasks.push({
				id: createId('task'),
				text: schedule.text,
				done: false,
				isScheduled: true,
				scheduleId: schedule.id,
				createdForDate: today,
			});
		});
		state.lastSyncDate = today;
		return;
	}

	state.tasks = state.tasks.filter((task) => {
		if (!task.isScheduled) {
			return true;
		}
		return state.schedules.some((schedule) => schedule.id === task.scheduleId);
	});

	state.schedules.forEach((schedule) => {
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
	state.schedules.forEach((schedule) => {
		const scheduleItem = document.createElement('li');
		scheduleItem.className = 'schedule-item';
		scheduleItem.dataset.scheduleId = schedule.id;
		scheduleItem.innerHTML = `
			<span>${schedule.text}</span>
			<button type="button" class="schedule-remove-btn">Remove schedule</button>
		`;
		scheduleList.appendChild(scheduleItem);
	});
};

const initializeState = () => {
	state.tasks = loadStoredTasks();
	state.schedules = loadStoredSchedules();
	state.stats = loadStoredStats();
	state.lastSyncDate = localStorage.getItem(LAST_SYNC_DATE_STORAGE_KEY) || null;

	syncScheduledTasksForToday();
	renderTasks();
	renderSchedules();
	renderStreakDashboard();
	renderProgressCharts();
	saveStateToStorage();
};

const showDeleteModal = (taskId) => {
	pendingDeleteTaskId = taskId;
	deleteModal.classList.add('is-open');
	deleteModal.setAttribute('aria-hidden', 'false');
};

const hideDeleteModal = () => {
	pendingDeleteTaskId = null;
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
	scheduleModal.classList.add('is-open');
	scheduleModal.setAttribute('aria-hidden', 'false');
};

const hideScheduleModal = () => {
	scheduleModal.classList.remove('is-open');
	scheduleModal.setAttribute('aria-hidden', 'true');
};

const showProgressModal = () => {
	renderProgressCharts();
	progressModal.classList.add('is-open');
	progressModal.setAttribute('aria-hidden', 'false');
};

const hideProgressModal = () => {
	progressModal.classList.remove('is-open');
	progressModal.setAttribute('aria-hidden', 'true');
};

const applyTaskDoneState = (task, isDone) => {
	const wasDone = Boolean(task.done);
	task.done = Boolean(isDone);
	if (!wasDone && task.done) {
		adjustTodayCompletionCount(1);
		showCompletionToast();
	}
	if (wasDone && !task.done) {
		adjustTodayCompletionCount(-1);
	}
};

clearAllButton.addEventListener('click', showClearAllModal);
openScheduleButton.addEventListener('click', showScheduleModal);
closeScheduleButton.addEventListener('click', hideScheduleModal);
openProgressButton.addEventListener('click', showProgressModal);
closeProgressButton.addEventListener('click', hideProgressModal);

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
	renderTasks();
	scheduleInput.value = '';
	scheduleInput.focus();
	showSuccessToast('Daily schedule created successfully.');
	saveStateToStorage();
});

scheduleList.addEventListener('click', (event) => {
	const removeButton = event.target.closest('.schedule-remove-btn');
	if (!removeButton) {
		return;
	}

	const scheduleItem = removeButton.closest('.schedule-item');
	if (!scheduleItem) {
		return;
	}

	const scheduleId = scheduleItem.dataset.scheduleId;
	state.schedules = state.schedules.filter((schedule) => schedule.id !== scheduleId);
	state.tasks = state.tasks.filter((task) => task.scheduleId !== scheduleId);

	renderSchedules();
	renderTasks();
	showSuccessToast('Daily schedule removed successfully.');
	saveStateToStorage();
});

todoList.addEventListener('click', (event) => {
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
		const nextText = taskText.textContent.trim() || 'Untitled task';
		task.text = nextText;
		taskText.textContent = nextText;
		taskText.contentEditable = 'false';
		clickedTaskItem.classList.remove('is-editing');
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
	}

	if (clickedButton.classList.contains('todo-delete-btn')) {
		if (task.isScheduled) {
			return;
		}
		showDeleteModal(task.id);
	}
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

cancelDeleteButton.addEventListener('click', hideDeleteModal);

confirmDeleteButton.addEventListener('click', () => {
	if (pendingDeleteTaskId) {
		state.tasks = state.tasks.filter((task) => task.id !== pendingDeleteTaskId);
		renderTasks();
		saveStateToStorage();
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

initializeState();

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
