const calendarGrid = document.getElementById('calendar-grid');
const calendarTitle = document.getElementById('calendar-title');
const calendarCard = document.querySelector('.calendar-card');
const prevMonthButton = document.getElementById('prev-month-btn');
const nextMonthButton = document.getElementById('next-month-btn');
const motivationMessageElement = document.getElementById('motivation-message');
const rewardProgressBarElement = document.getElementById('reward-progress-bar');
const rewardNextElement = document.getElementById('reward-next');
const badgeListElement = document.getElementById('badge-list');
const openProgressButton = document.getElementById('open-progress-btn');
const closeProgressButton = document.getElementById('close-progress-btn');
const progressOverlay = document.getElementById('progress-overlay');
const progressCaption = document.getElementById('progress-caption');
const monthChart = document.getElementById('month-chart');
const heatmapMonths = document.getElementById('heatmap-months');
const heatmapGrid = document.getElementById('heatmap-grid');
const yearChartLabel = document.getElementById('year-chart-label');

const monthNames = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

const today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth();

const formatDateKey = (year, monthIndex, day) => {
	const month = String(monthIndex + 1).padStart(2, '0');
	const dayOfMonth = String(day).padStart(2, '0');
	return `${year}-${month}-${dayOfMonth}`;
};

const getDateKeyFromDate = (date) => {
	return formatDateKey(date.getFullYear(), date.getMonth(), date.getDate());
};

const getNextInfiniteGoal = (streak) => {
	if (streak < 3) {
		return 3;
	}

	return Math.ceil((streak + 1) / 7) * 7;
};

const getVisibleInfiniteGoals = (streak) => {
	const nextGoal = getNextInfiniteGoal(streak);
	const goals = [3];

	for (let goal = 7; goal <= nextGoal + 21; goal += 7) {
		goals.push(goal);
	}

	const nextIndex = goals.findIndex((goal) => goal > streak);
	const centerIndex = nextIndex === -1 ? goals.length - 1 : nextIndex;
	const sliceStart = Math.max(0, centerIndex - 2);
	return goals.slice(sliceStart, sliceStart + 5);
};

const getTotalProjectsCount = () => {
	return Object.values(projectsByDate).reduce((count, projects) => count + projects.length, 0);
};

const getDailyStreak = () => {
	const projectDateKeys = Object.entries(projectsByDate)
		.filter(([, projects]) => Array.isArray(projects) && projects.length > 0)
		.map(([dateKey]) => dateKey)
		.sort();

	if (projectDateKeys.length === 0) {
		return 0;
	}

	const parseDateKeyToUTC = (dateKey) => {
		const [year, month, day] = dateKey.split('-').map(Number);
		return Date.UTC(year, month - 1, day);
	};

	let streak = 1;
	for (let i = projectDateKeys.length - 1; i > 0; i -= 1) {
		const current = parseDateKeyToUTC(projectDateKeys[i]);
		const previous = parseDateKeyToUTC(projectDateKeys[i - 1]);
		const dayDifference = (current - previous) / (1000 * 60 * 60 * 24);

		if (dayDifference === 1) {
			streak += 1;
		} else {
			break;
		}
	}

	return streak;
};

const getBestStreak = () => {
	const projectDateKeys = Object.entries(projectsByDate)
		.filter(([, projects]) => Array.isArray(projects) && projects.length > 0)
		.map(([dateKey]) => dateKey)
		.sort();

	if (projectDateKeys.length === 0) {
		return 0;
	}

	const parseDateKeyToUTC = (dateKey) => {
		const [year, month, day] = dateKey.split('-').map(Number);
		return Date.UTC(year, month - 1, day);
	};

	let best = 1;
	let current = 1;
	for (let i = 1; i < projectDateKeys.length; i += 1) {
		const prev = parseDateKeyToUTC(projectDateKeys[i - 1]);
		const curr = parseDateKeyToUTC(projectDateKeys[i]);
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

const getProjectDaysInYear = (year) => {
	const uniqueDays = new Set();
	Object.entries(projectsByDate).forEach(([dateKey, projects]) => {
		if (!Array.isArray(projects) || projects.length === 0) {
			return;
		}

		if (Number(dateKey.slice(0, 4)) === year) {
			uniqueDays.add(dateKey);
		}
	});

	return uniqueDays.size;
};

const renderProgressCharts = () => {
	const chartYear = currentYear;
	const monthFinishedDays = new Array(12).fill(0);
	const uniqueYearDays = new Set();

	Object.entries(projectsByDate).forEach(([dateKey, projects]) => {
		if (!Array.isArray(projects) || projects.length === 0) {
			return;
		}

		const [year, month] = dateKey.split('-').map(Number);
		if (year === chartYear) {
			uniqueYearDays.add(dateKey);
			monthFinishedDays[month - 1] += 1;
		}
	});

	const maxCount = Math.max(...monthFinishedDays, 1);
	monthChart.innerHTML = '';
	monthFinishedDays.forEach((count, index) => {
		const monthItem = document.createElement('div');
		monthItem.className = 'month-item';

		const countLabel = document.createElement('span');
		countLabel.className = 'month-bar-count';
		countLabel.textContent = String(count);

		const bar = document.createElement('div');
		bar.className = `month-bar${count > 0 ? ' is-active' : ''}`;
		bar.style.height = `${Math.max((count / maxCount) * 100, 8)}%`;
		bar.title = `${monthNames[index]}: ${count} finished day${count === 1 ? '' : 's'}`;

		const label = document.createElement('span');
		label.className = 'month-bar-label';
		label.textContent = monthNames[index].slice(0, 3);
		monthItem.appendChild(countLabel);
		monthItem.appendChild(bar);
		monthItem.appendChild(label);
		monthChart.appendChild(monthItem);
	});

	heatmapMonths.innerHTML = '';
	heatmapGrid.innerHTML = '';

	const yearStart = new Date(chartYear, 0, 1);
	const yearEnd = new Date(chartYear, 11, 31);
	const daysInYear = Math.floor((Date.UTC(chartYear, 11, 31) - Date.UTC(chartYear, 0, 1)) / (1000 * 60 * 60 * 24)) + 1;
	const startWeekday = yearStart.getDay();
	const totalWeeks = Math.ceil((startWeekday + daysInYear) / 7);

	const monthLabelByWeek = new Array(totalWeeks).fill('');
	for (let month = 0; month < 12; month += 1) {
		const monthStart = new Date(chartYear, month, 1);
		const monthOffset = Math.floor((Date.UTC(monthStart.getFullYear(), monthStart.getMonth(), monthStart.getDate()) - Date.UTC(chartYear, 0, 1)) / (1000 * 60 * 60 * 24));
		const weekIndex = Math.floor((startWeekday + monthOffset) / 7);
		monthLabelByWeek[weekIndex] = monthNames[month].slice(0, 3);
	}

	monthLabelByWeek.forEach((labelText) => {
		const monthLabel = document.createElement('span');
		monthLabel.className = 'heatmap-month-label';
		monthLabel.textContent = labelText;
		heatmapMonths.appendChild(monthLabel);
	});

	for (let week = 0; week < totalWeeks; week += 1) {
		const weekColumn = document.createElement('div');
		weekColumn.className = 'heatmap-week';

		for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
			const cell = document.createElement('span');
			cell.className = 'heatmap-cell';
			const dayIndex = (week * 7) + dayOffset - startWeekday;

			if (dayIndex < 0 || dayIndex >= daysInYear) {
				cell.classList.add('is-outside');
				cell.classList.add('level-0');
				weekColumn.appendChild(cell);
				continue;
			}

			const cellDate = new Date(chartYear, 0, dayIndex + 1);

			const key = getDateKeyFromDate(cellDate);
			const count = (projectsByDate[key] || []).length;
			const level = count > 0 ? 1 : 0;
			cell.classList.add(`level-${level}`);
			cell.title = `${key}: ${count} finished project${count === 1 ? '' : 's'}`;
			weekColumn.appendChild(cell);
		}

		heatmapGrid.appendChild(weekColumn);
	}

	const yearStartUtc = Date.UTC(chartYear, 0, 1);
	const yearEndUtc = Date.UTC(chartYear, 11, 31);
	const totalDaysInYear = Math.floor((yearEndUtc - yearStartUtc) / (1000 * 60 * 60 * 24)) + 1;
	const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
	const elapsedDays = chartYear === today.getFullYear()
		? Math.floor((todayUtc - yearStartUtc) / (1000 * 60 * 60 * 24)) + 1
		: Math.floor((yearEndUtc - yearStartUtc) / (1000 * 60 * 60 * 24)) + 1;
	const activeDays = uniqueYearDays.size;
	const consistencyPercent = elapsedDays > 0 ? Math.round((activeDays / elapsedDays) * 100) : 0;
	yearChartLabel.textContent = `${activeDays}/${totalDaysInYear} finished days in ${chartYear} (${consistencyPercent}%)`;

	const streak = getDailyStreak();
	progressCaption.textContent = `Current streak: ${streak} day${streak === 1 ? '' : 's'}. Keep pushing weekly goals.`;
};

const renderRewards = (streak, monthProjects, daysInCurrentMonth) => {
	const nextStreakGoal = getNextInfiniteGoal(streak);
	const previousGoal = nextStreakGoal === 3 ? 0 : (nextStreakGoal === 7 ? 3 : nextStreakGoal - 7);
	const progressInCurrentTier = streak - previousGoal;
	const tierLength = Math.max(nextStreakGoal - previousGoal, 1);
	const progressPercentage = Math.min((progressInCurrentTier / tierLength) * 100, 100);

	rewardProgressBarElement.style.width = `${progressPercentage}%`;

	const streakMainValueEl = document.getElementById('streak-main-value');
	if (streakMainValueEl) streakMainValueEl.textContent = String(streak);

	const streakFractionEl = document.getElementById('streak-goal-fraction');
	if (streakFractionEl) streakFractionEl.textContent = `/${nextStreakGoal}`;

	const streakUnitEl = document.getElementById('streak-main-unit');
	if (streakUnitEl) streakUnitEl.textContent = streak === 1 ? 'day' : 'days';

	const bestStreak = getBestStreak();
	const streakBestBadge = document.getElementById('streak-best-badge');
	if (streakBestBadge) streakBestBadge.hidden = streak === 0 || streak < bestStreak;

	const consistency = daysInCurrentMonth > 0 ? Math.round((monthProjects / daysInCurrentMonth) * 100) : 0;
	const visibleWeeklyGoals = getVisibleInfiniteGoals(streak);

	const milestoneLabels = [
		...visibleWeeklyGoals.map((goal) => ({
			label: `${goal}d streak`,
			isUnlocked: streak >= goal,
		})),
		{
			label: '100% month',
			isUnlocked: consistency === 100,
		},
	].filter((milestone) => milestone.isUnlocked);

	badgeListElement.innerHTML = '';
	if (milestoneLabels.length === 0) {
		badgeListElement.hidden = true;
		return;
	}

	badgeListElement.hidden = false;
	milestoneLabels.forEach((milestone) => {
		const badge = document.createElement('span');
		badge.className = `badge-chip${milestone.isUnlocked ? ' is-unlocked' : ''}`;
		badge.textContent = `Unlocked: ${milestone.label}`;
		badgeListElement.appendChild(badge);
	});
};

const renderCalendar = () => {
	calendarGrid.innerHTML = '';
	calendarTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;

	const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
	const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
	let currentMonthProjects = 0;
	let projectDaysInMonth = 0;

	for (let i = 0; i < firstDayOfMonth; i += 1) {
		const spacer = document.createElement('div');
		spacer.className = 'calendar-day is-padding';
		calendarGrid.appendChild(spacer);
	}

	for (let day = 1; day <= daysInCurrentMonth; day += 1) {
		const dateKey = formatDateKey(currentYear, currentMonth, day);
		const projects = projectsByDate[dateKey] || [];
		currentMonthProjects += projects.length;

		const dayCell = document.createElement('article');
		dayCell.className = 'calendar-day';

		const dayNumber = document.createElement('span');
		dayNumber.className = 'day-number';
		dayNumber.textContent = String(day);
		dayCell.appendChild(dayNumber);

		if (projects.length === 0) {
			const emptyNote = document.createElement('span');
			emptyNote.className = 'empty-day-note';
			emptyNote.textContent = 'No project';
			dayCell.appendChild(emptyNote);
		} else {
			projectDaysInMonth += 1;
			dayCell.classList.add('has-project');
			projects.forEach((project) => {
				const projectLink = document.createElement('a');
				projectLink.className = 'project-pill';
				projectLink.href = project.link;
				projectLink.textContent = project.title;
				dayCell.appendChild(projectLink);
			});
		}

		calendarGrid.appendChild(dayCell);
	}

	renderRewards(getDailyStreak(), currentMonthProjects, daysInCurrentMonth);
	renderProgressCharts();
	const isCompleteMonth = projectDaysInMonth === daysInCurrentMonth;
	calendarCard.classList.toggle('is-complete-month', isCompleteMonth);
};

openProgressButton.addEventListener('click', () => {
	renderProgressCharts();
	progressOverlay.classList.add('is-open');
	progressOverlay.setAttribute('aria-hidden', 'false');
});

closeProgressButton.addEventListener('click', () => {
	progressOverlay.classList.remove('is-open');
	progressOverlay.setAttribute('aria-hidden', 'true');
});

progressOverlay.addEventListener('click', (event) => {
	if (event.target === progressOverlay) {
		progressOverlay.classList.remove('is-open');
		progressOverlay.setAttribute('aria-hidden', 'true');
	}
});

prevMonthButton.addEventListener('click', () => {
	currentMonth -= 1;
	if (currentMonth < 0) {
		currentMonth = 11;
		currentYear -= 1;
	}
	renderCalendar();
});

nextMonthButton.addEventListener('click', () => {
	currentMonth += 1;
	if (currentMonth > 11) {
		currentMonth = 0;
		currentYear += 1;
	}
	renderCalendar();
});

renderCalendar();
