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
const appSubtitle = document.getElementById('app-subtitle');

const scheduleForm = document.getElementById('schedule-form');
const scheduleInput = document.getElementById('schedule-input');
const scheduleList = document.getElementById('schedule-list');
const scheduleGoalSelect = document.getElementById('schedule-goal-select');
const scheduleIntervalInput = document.getElementById('schedule-interval-input');
const scheduleStartDateInput = document.getElementById('schedule-start-date-input');
const goalForm = document.getElementById('goal-form');
const goalTitleInput = document.getElementById('goal-title-input');
const goalTypeSelect = document.getElementById('goal-type-select');
const goalDurationInput = document.getElementById('goal-duration-input');
const goalIntervalInput = document.getElementById('goal-interval-input');
const goalStartDateInput = document.getElementById('goal-start-date-input');
const goalColorInput = document.getElementById('goal-color-input');
const goalList = document.getElementById('goal-list');
const toggleFinishedGoalsButton = document.getElementById('toggle-finished-goals-btn');
const finishedGoalsPanel = document.getElementById('finished-goals-panel');
const finishedGoalsList = document.getElementById('finished-goals-list');
const openScheduleButton = document.getElementById('open-schedule-btn');
const scheduleModal = document.getElementById('schedule-modal');
const closeScheduleButton = document.getElementById('close-schedule-btn');
const toggleFinishedTasksButton = document.getElementById('toggle-finished-tasks-btn');

const openProgressButton = document.getElementById('open-progress-btn');
const closeProgressButton = document.getElementById('close-progress-btn');
const progressModal = document.getElementById('progress-modal');
const weekChart = document.getElementById('week-chart');
const monthChart = document.getElementById('month-chart');
const yearChartLabel = document.getElementById('year-chart-label');
const goalProgressList = document.getElementById('goal-progress-list');
const progressQuoteCard = document.querySelector('.progress-quote-card');
const progressQuoteDisplay = document.getElementById('progress-quote-display');
const progressQuoteEditor = document.getElementById('progress-quote-editor');
const progressQuoteInput = document.getElementById('progress-quote-input');
const editProgressQuoteButton = document.getElementById('edit-progress-quote-btn');
const saveProgressQuoteButton = document.getElementById('save-progress-quote-btn');
const clearProgressQuoteButton = document.getElementById('clear-progress-quote-btn');
const cancelProgressQuoteButton = document.getElementById('cancel-progress-quote-btn');

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
const CUSTOM_QUOTE_STORAGE_KEY = 'todo-custom-quote-v1';
const SHOW_FINISHED_TASKS_STORAGE_KEY = 'todo-show-finished-tasks-v1';

const resolveAppLanguage = (rawLanguage = '') =>
	typeof rawLanguage === 'string' && rawLanguage.toLowerCase().startsWith('pt')
		? 'pt-BR'
		: 'en';

const appLanguage = resolveAppLanguage(navigator.language || 'en');
document.documentElement.lang = appLanguage;

const I18N = {
	en: {
		appTitle: 'To Do List',
		metaDescription: 'Installable to-do list with flexible recurring schedules, goal planning, and streak tracking.',
		allProjects: 'All Projects',
		checkedLabel: 'Checked:',
		uncheckedLabel: 'Unchecked:',
		installApp: 'Install app',
		recurringSchedules: 'Recurring schedules',
		clearAllTasks: 'Clear all tasks',
		allTasksCompleted: 'Great job! You completed all your tasks.',
		writeTaskPlaceholder: 'Write your task...',
		consistencyRewards: 'Consistency Rewards',
		viewProgress: 'View progress',
		currentStreak: 'CURRENT STREAK',
		bestStreak: 'BEST STREAK',
		day: 'day',
		days: 'days',
		unlockedBadge: '{count}d unlocked',
		defaultQuote: 'Keep going. Your future self will thank you.',
		dailyQuotes: [
			'Progress, not perfection.',
			'Show up today, even if it is small.',
			'Consistency beats intensity.',
			'One task at a time, one day at a time.',
			'Discipline is a gift to your future self.',
			'Start before you feel ready.',
			'Momentum is built in ordinary days.',
			'You do not need to be extreme, just consistent.',
			'Protect your streak with one meaningful action.',
			'Your habits are writing your story.',
		],
		themeLight: '☀️ Light',
		themeDark: '🌙 Dark',
		switchToLightMode: 'Switch to light mode',
		switchToDarkMode: 'Switch to dark mode',
		hideFinishedTasks: 'Hide finished tasks',
		showFinishedTasks: 'Show finished tasks',
		closeRecurringSchedules: 'Close recurring schedules',
		scheduleSubtitle: 'Create schedules that start later, repeat every X days, and stay linked to goals.',
		goals: 'Goals',
		goalName: 'Goal Name',
		goalType: 'Goal Type',
		habitIndefinite: 'Habit (indefinite)',
		periodGoal: 'Period goal',
		durationDays: 'Duration (Days)',
		everyXDays: 'Every X Days',
		everyXDaysPlaceholder: 'Every X days (default: 1)',
		everyXDaysTitle: 'Every X days (default 1)',
		startFrom: 'Start From',
		startFromTitle: 'Start from (default today)',
		color: 'Color',
		goalColor: 'Goal color',
		chooseGoalColor: 'Choose goal color',
		createGoal: 'Create goal',
		seeFinishedGoals: 'See finished goals ({count})',
		hideFinishedGoals: 'Hide finished goals ({count})',
		noFinishedGoalsYet: 'No finished goals yet.',
		reactivate: 'Reactivate',
		taskName: 'Task Name',
		goal: 'Goal',
		noGoal: 'No goal',
		createRecurringTask: 'Create a recurring task...',
		schedule: 'Schedule',
		edit: 'Edit',
		finish: 'Finish',
		removeGoal: 'Remove goal',
		save: 'Save',
		cancel: 'Cancel',
		moveUp: 'Move up',
		moveDown: 'Move down',
		daysPlaceholderShort: 'Days',
		progressDashboard: 'Progress Dashboard',
		closeProgressDashboard: 'Close progress dashboard',
		currentStreakLabel: 'Current Streak',
		bestStreakLabel: 'Best Streak',
		motivationQuote: 'Motivation Quote',
		editMotivationQuote: 'Edit motivation quote',
		editQuote: 'Edit quote',
		customQuoteOptional: 'Custom quote (optional)',
		writeOwnQuote: 'Write your own motivation quote...',
		saveQuote: 'Save quote',
		useDailyQuote: 'Use daily quote',
		completedTasksLast7Days: 'Completed Tasks (Last 7 Days)',
		consistencyByMonth: 'Consistency by Month (Year View)',
		goalProgress: 'Goal Progress',
		progressPeriod: 'Period: {label}',
		progressHabit: 'Habit: {label}',
		completedChecksSummary: '{completed}/{expected} completed checks • {count} attached {taskWord}',
		showFinishedGoalsProgress: 'Show finished goals ({count})',
		hideFinishedGoalsProgress: 'Hide finished goals ({count})',
		noGoalsYet: 'No goals yet.',
		activeDaysInYear: '{activeDays}/{totalDays} active {dayWord} in {year} ({percent}% consistency)',
		completedTasksTitle: '{date}: {count} completed {taskWord}',
		activeDaysTitle: '{month}: {count} active {dayWord}',
		everyDay: 'Every day',
		everyNDays: 'Every {count} days',
		startsOn: 'Starts on {date}',
		fromDate: '{label} from {date}',
		dateRange: '{start} to {end}',
		cycleLabel: '{duration}-day cycle every {cycle} days from {start}',
		endedOn: 'Ended on {date}',
		removeGoalQuestion: 'Remove goal?',
		removeGoalMessage: 'This will detach the goal from related schedules and stop tracking it.',
		deleteTaskQuestion: 'Delete task?',
		actionCannotBeUndone: 'This action cannot be undone.',
		delete: 'Delete',
		clearAllTasksQuestion: 'Clear all tasks?',
		clearAllTasksMessage: 'This will remove all current tasks.',
		clearAll: 'Clear all',
		removeGoalTaskQuestion: 'Remove goal task?',
		removeGoalTaskMessage: 'This task is linked to a goal. This action cannot be undone.',
		taskCompleteToast: 'Task complete! Keep it up!',
		finishedTasksVisible: 'Finished tasks are now visible.',
		finishedTasksHidden: 'Finished tasks are now hidden.',
		customQuoteSaved: 'Custom quote saved.',
		usingDailyQuote: 'Using daily quote.',
		dailyQuoteEnabled: 'Daily quote enabled.',
		installHelp: 'Use browser menu and choose Install app or Add to Home Screen.',
		installCanceled: 'Install canceled. You can try again anytime.',
		appInstalled: 'App installed successfully.',
		duplicateTask: 'This task already exists.',
		duplicateSchedule: 'This recurring schedule already exists.',
		recurringScheduleCreated: 'Recurring schedule created successfully.',
		duplicateGoal: 'This goal already exists.',
		invalidGoalColor: 'Choose a valid goal color.',
		goalColorInUse: 'This color is already used by another goal.',
		invalidPeriodDays: 'Choose a valid number of days for a period goal.',
		cycleEveryXDaysOptional: 'Cycle every X days (optional)',
		scheduleIntervalLocked: 'This task period is fixed to 1 because the selected habit already controls cadence.',
		invalidHabitFrequency: 'Choose how often this habit should appear.',
		goalCreated: 'Goal created successfully.',
		goalFinished: 'Goal marked as finished.',
		goalNameEmpty: 'Goal name cannot be empty.',
		goalUpdated: 'Goal updated successfully.',
		goalReactivated: 'Goal reactivated.',
		scheduleTextEmpty: 'Schedule text cannot be empty.',
		recurringScheduleUpdated: 'Recurring schedule updated successfully.',
		onlyTaskInGoal: 'This is the only task in the goal. Add another task before removing it.',
		goalRemoved: 'Goal removed successfully.',
		recurringScheduleRemoved: 'Recurring schedule removed successfully.',
		removeFromRecurringSchedules: 'Remove this from Recurring Schedules to delete it',
		startDateLocked: 'Start From is locked because this recurring task has already started and has completed entries.',
		taskSingular: 'task',
		taskPlural: 'tasks',
		dayLowerSingular: 'day',
		dayLowerPlural: 'days',
	},
	'pt-BR': {
		appTitle: 'Lista de tarefas',
		metaDescription: 'Lista de tarefas instalável com rotinas recorrentes flexíveis, planejamento de metas e acompanhamento de sequência.',
		allProjects: 'Todos os projetos',
		checkedLabel: 'Concluídas:',
		uncheckedLabel: 'Pendentes:',
		installApp: 'Instalar app',
		recurringSchedules: 'Tarefas recorrentes',
		clearAllTasks: 'Limpar tarefas',
		allTasksCompleted: 'Ótimo trabalho! Você concluiu todas as tarefas.',
		writeTaskPlaceholder: 'Escreva sua tarefa...',
		consistencyRewards: 'Recompensas de consistência',
		viewProgress: 'Ver progresso',
		currentStreak: 'SEQUÊNCIA ATUAL',
		bestStreak: 'MELHOR SEQUÊNCIA',
		day: 'dia',
		days: 'dias',
		unlockedBadge: '{count}d liberados',
		defaultQuote: 'Continue. Seu eu do futuro vai agradecer.',
		dailyQuotes: [
			'Progresso, não perfeição.',
			'Apareça hoje, mesmo que seja pouco.',
			'Consistência vence intensidade.',
			'Uma tarefa por vez, um dia por vez.',
			'Disciplina é um presente para o seu eu do futuro.',
			'Comece antes de se sentir pronto.',
			'Momento é construído nos dias comuns.',
			'Você não precisa ser extremo, só consistente.',
			'Proteja sua sequência com uma ação significativa.',
			'Seus hábitos estão escrevendo sua história.',
		],
		themeLight: '☀️ Claro',
		themeDark: '🌙 Escuro',
		switchToLightMode: 'Mudar para o tema claro',
		switchToDarkMode: 'Mudar para o tema escuro',
		hideFinishedTasks: 'Ocultar tarefas concluídas',
		showFinishedTasks: 'Mostrar tarefas concluídas',
		closeRecurringSchedules: 'Fechar tarefas recorrentes',
		scheduleSubtitle: 'Crie tarefas que começam depois, se repetem a cada X dias e permanecem vinculadas a metas.',
		goals: 'Metas',
		goalName: 'Nome da meta',
		goalType: 'Tipo de meta',
		habitIndefinite: 'Hábito (indefinido)',
		periodGoal: 'Meta por período',
		durationDays: 'Duração (dias)',
		everyXDays: 'A cada X dias',
		everyXDaysPlaceholder: 'A cada X dias (padrão: 1)',
		everyXDaysTitle: 'A cada X dias (padrão 1)',
		startFrom: 'Começar em',
		startFromTitle: 'Começar em (padrão hoje)',
		color: 'Cor',
		goalColor: 'Cor da meta',
		chooseGoalColor: 'Escolher cor da meta',
		createGoal: 'Criar meta',
		seeFinishedGoals: 'Ver metas concluídas ({count})',
		hideFinishedGoals: 'Ocultar metas concluídas ({count})',
		noFinishedGoalsYet: 'Nenhuma meta concluída ainda.',
		reactivate: 'Reativar',
		taskName: 'Nome da tarefa',
		goal: 'Meta',
		noGoal: 'Sem meta',
		createRecurringTask: 'Crie uma tarefa recorrente...',
		schedule: 'Agendar',
		edit: 'Editar',
		finish: 'Concluir',
		removeGoal: 'Remover meta',
		save: 'Salvar',
		cancel: 'Cancelar',
		moveUp: 'Mover para cima',
		moveDown: 'Mover para baixo',
		daysPlaceholderShort: 'Dias',
		progressDashboard: 'Painel de progresso',
		closeProgressDashboard: 'Fechar painel de progresso',
		currentStreakLabel: 'Sequência atual',
		bestStreakLabel: 'Melhor sequência',
		motivationQuote: 'Frase motivacional',
		editMotivationQuote: 'Editar frase motivacional',
		editQuote: 'Editar frase',
		customQuoteOptional: 'Frase personalizada (opcional)',
		writeOwnQuote: 'Escreva sua própria frase motivacional...',
		saveQuote: 'Salvar frase',
		useDailyQuote: 'Usar frase diária',
		completedTasksLast7Days: 'Tarefas concluídas (últimos 7 dias)',
		consistencyByMonth: 'Consistência por mês (visão anual)',
		goalProgress: 'Progresso das metas',
		progressPeriod: 'Período: {label}',
		progressHabit: 'Hábito: {label}',
		completedChecksSummary: '{completed}/{expected} marcações concluídas • {count} {taskWord} vinculadas',
		showFinishedGoalsProgress: 'Mostrar metas concluídas ({count})',
		hideFinishedGoalsProgress: 'Ocultar metas concluídas ({count})',
		noGoalsYet: 'Nenhuma meta ainda.',
		activeDaysInYear: '{activeDays}/{totalDays} {dayWord} ativos em {year} ({percent}% de consistência)',
		completedTasksTitle: '{date}: {count} {taskWord} concluídas',
		activeDaysTitle: '{month}: {count} {dayWord} ativos',
		everyDay: 'Todos os dias',
		everyNDays: 'A cada {count} dias',
		startsOn: 'Começa em {date}',
		fromDate: '{label} desde {date}',
		dateRange: '{start} até {end}',
		cycleLabel: 'ciclo de {duration} dias a cada {cycle} dias desde {start}',
		endedOn: 'Encerrada em {date}',
		removeGoalQuestion: 'Remover meta?',
		removeGoalMessage: 'Isso vai desvincular a meta das tarefas relacionadas e parar o acompanhamento.',
		deleteTaskQuestion: 'Excluir tarefa?',
		actionCannotBeUndone: 'Esta ação não pode ser desfeita.',
		delete: 'Excluir',
		clearAllTasksQuestion: 'Limpar todas as tarefas?',
		clearAllTasksMessage: 'Isso removerá todas as tarefas atuais.',
		clearAll: 'Limpar tudo',
		removeGoalTaskQuestion: 'Remover tarefa da meta?',
		removeGoalTaskMessage: 'Esta tarefa está vinculada a uma meta. Esta ação não pode ser desfeita.',
		taskCompleteToast: 'Tarefa concluída! Continue assim!',
		finishedTasksVisible: 'As tarefas concluídas agora estão visíveis.',
		finishedTasksHidden: 'As tarefas concluídas agora estão ocultas.',
		customQuoteSaved: 'Frase personalizada salva.',
		usingDailyQuote: 'Usando frase diária.',
		dailyQuoteEnabled: 'Frase diária ativada.',
		installHelp: 'Use o menu do navegador e escolha Instalar app ou Adicionar à tela inicial.',
		installCanceled: 'Instalação cancelada. Você pode tentar novamente a qualquer momento.',
		appInstalled: 'App instalado com sucesso.',
		duplicateTask: 'Esta tarefa já existe.',
		duplicateSchedule: 'Esta tarefa recorrente já existe.',
		recurringScheduleCreated: 'Tarefa recorrente criada com sucesso.',
		duplicateGoal: 'Esta meta já existe.',
		invalidGoalColor: 'Escolha uma cor de meta válida.',
		goalColorInUse: 'Esta cor já está sendo usada por outra meta.',
		invalidPeriodDays: 'Escolha um número válido de dias para a meta por período.',
		cycleEveryXDaysOptional: 'Ciclo a cada X dias (opcional)',
		scheduleIntervalLocked: 'O período desta tarefa foi fixado em 1 porque o hábito selecionado já controla a cadência.',
		invalidHabitFrequency: 'Escolha com que frequência este hábito deve aparecer.',
		goalCreated: 'Meta criada com sucesso.',
		goalFinished: 'Meta marcada como concluída.',
		goalNameEmpty: 'O nome da meta não pode ficar vazio.',
		goalUpdated: 'Meta atualizada com sucesso.',
		goalReactivated: 'Meta reativada.',
		scheduleTextEmpty: 'O texto da tarefa recorrente não pode ficar vazio.',
		recurringScheduleUpdated: 'Tarefa recorrente atualizada com sucesso.',
		onlyTaskInGoal: 'Esta é a única tarefa da meta. Adicione outra tarefa antes de remover.',
		goalRemoved: 'Meta removida com sucesso.',
		recurringScheduleRemoved: 'Tarefa recorrente removida com sucesso.',
		removeFromRecurringSchedules: 'Remova isso de Tarefas recorrentes para excluir',
		startDateLocked: 'Começar em está bloqueado porque esta tarefa recorrente já começou e possui registros concluídos.',
		taskSingular: 'tarefa',
		taskPlural: 'tarefas',
		dayLowerSingular: 'dia',
		dayLowerPlural: 'dias',
	},
};

const t = (key, params = {}) => {
	const dictionary = I18N[appLanguage] || I18N.en;
	const fallbackValue = I18N.en[key];
	const value = dictionary[key] ?? fallbackValue ?? key;
	if (typeof value !== 'string') {
		return value;
	}

	return value.replace(/\{(\w+)\}/g, (_, token) => String(params[token] ?? ''));
};

const getLocalizedList = (key) => {
	const dictionary = I18N[appLanguage] || I18N.en;
	return dictionary[key] || I18N.en[key] || [];
};

const formatDisplayDate = (dateStamp) => {
	if (typeof dateStamp !== 'string' || !dateStamp) {
		return '';
	}

	const [year, month, day] = dateStamp.split('-').map(Number);
	if (!year || !month || !day) {
		return dateStamp;
	}

	return new Intl.DateTimeFormat(appLanguage, {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).format(new Date(Date.UTC(year, month - 1, day)));
};

const getTaskWord = (count) => (count === 1 ? t('taskSingular') : t('taskPlural'));
const getDayWord = (count) => (count === 1 ? t('dayLowerSingular') : t('dayLowerPlural'));

const WEEKDAY_CHART_COLORS = [
	'#fb923c', // Sun
	'#3b82f6', // Mon
	'#06b6d4', // Tue
	'#10b981', // Wed
	'#8b5cf6', // Thu
	'#f59e0b', // Fri
	'#6366f1', // Sat
];

const MONTH_CHART_COLORS = [
	'#3b82f6',
	'#0ea5e9',
	'#14b8a6',
	'#22c55e',
	'#84cc16',
	'#eab308',
	'#f59e0b',
	'#f97316',
	'#ec4899',
	'#8b5cf6',
	'#6366f1',
	'#06b6d4',
];

const CURRENT_PERIOD_CHART_COLOR = '#ef4444';

const DAILY_MOTIVATION_QUOTES = [
	'Progress, not perfection.',
	'Show up today, even if it is small.',
	'Consistency beats intensity.',
	'One task at a time, one day at a time.',
	'Discipline is a gift to your future self.',
	'Start before you feel ready.',
	'Momentum is built in ordinary days.',
	'You do not need to be extreme, just consistent.',
	'Protect your streak with one meaningful action.',
	'Your habits are writing your story.',
];

const baseGoals = [3, 7, 14, 30, 60, 90];
const DAY_IN_MS = 1000 * 60 * 60 * 24;

const state = {
	tasks: [],
	schedules: [],
	goals: [],
	lastSyncDate: null,
	customQuote: '',
	showFinishedTasks: true,
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
let isProgressQuoteEditing = false;

const MODAL_TRANSITION_MS = 240;
const PANEL_TRANSITION_MS = 220;

const getStoredTheme = () => {
	const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
	return savedTheme === 'dark' ? 'dark' : 'light';
};

const getStoredShowFinishedTasks = () => {
	const savedValue = localStorage.getItem(SHOW_FINISHED_TASKS_STORAGE_KEY);
	if (savedValue === '1') {
		return true;
	}

	return false;
};

const syncFinishedTasksToggleButton = () => {
	if (!toggleFinishedTasksButton) {
		return;
	}

	const isVisible = state.showFinishedTasks;
	toggleFinishedTasksButton.setAttribute('aria-pressed', String(!isVisible));
	toggleFinishedTasksButton.setAttribute(
		'aria-label',
		isVisible ? t('hideFinishedTasks') : t('showFinishedTasks'),
	);
	toggleFinishedTasksButton.setAttribute(
		'title',
		isVisible ? t('hideFinishedTasks') : t('showFinishedTasks'),
	);
	toggleFinishedTasksButton.innerHTML = isVisible
		? '<i class="fa-solid fa-eye" aria-hidden="true"></i>'
		: '<i class="fa-solid fa-eye-slash" aria-hidden="true"></i>';
};

const applyTheme = (theme) => {
	const isDarkTheme = theme === 'dark';
	document.body.classList.toggle('is-dark', isDarkTheme);

	if (themeToggleButton) {
		themeToggleButton.textContent = isDarkTheme ? t('themeLight') : t('themeDark');
		themeToggleButton.setAttribute(
			'aria-label',
			isDarkTheme ? t('switchToLightMode') : t('switchToDarkMode'),
		);
	}

	const themeColorMeta = document.querySelector('meta[name="theme-color"]');
	if (themeColorMeta) {
		themeColorMeta.setAttribute('content', isDarkTheme ? '#0f172a' : '#22c55e');
	}
};

const applyStaticTranslations = () => {
	document.title = t('appTitle');
	const metaDescription = document.querySelector('meta[name="description"]');
	if (metaDescription) {
		metaDescription.setAttribute('content', t('metaDescription'));
	}

	const checkedLabelElement = document.getElementById('checked-label');
	if (checkedLabelElement) {
		checkedLabelElement.textContent = t('checkedLabel');
	}
	const uncheckedLabelElement = document.getElementById('unchecked-label');
	if (uncheckedLabelElement) {
		uncheckedLabelElement.textContent = t('uncheckedLabel');
	}

	const pageTitle = document.querySelector('main > h1');
	if (pageTitle) {
		pageTitle.textContent = t('appTitle');
	}
	if (backProjectsButton?.querySelector('span')) {
		backProjectsButton.querySelector('span').textContent = t('allProjects');
	}
	if (installAppButton) {
		installAppButton.textContent = t('installApp');
	}
	if (openScheduleButton) {
		openScheduleButton.textContent = t('recurringSchedules');
	}
	if (clearAllButton) {
		clearAllButton.textContent = t('clearAllTasks');
	}
	if (congratsMessage) {
		congratsMessage.textContent = t('allTasksCompleted');
	}
	if (taskInput) {
		taskInput.placeholder = t('writeTaskPlaceholder');
	}

	const streakTitle = document.querySelector('.streak-head h2');
	if (streakTitle) {
		streakTitle.textContent = t('consistencyRewards');
	}
	if (openProgressButton) {
		openProgressButton.textContent = t('viewProgress');
	}
	const streakMainLabel = document.querySelector('.streak-main-label');
	if (streakMainLabel) {
		streakMainLabel.textContent = t('currentStreak');
	}
	const streakBestBadge = document.getElementById('streak-best-badge');
	if (streakBestBadge) {
		streakBestBadge.textContent = t('bestStreak');
	}

	if (deleteModalTitle) {
		deleteModalTitle.textContent = t('deleteTaskQuestion');
	}
	if (deleteModalMessage) {
		deleteModalMessage.textContent = t('actionCannotBeUndone');
	}
	if (cancelDeleteButton) {
		cancelDeleteButton.textContent = t('cancel');
	}
	if (confirmDeleteButton) {
		confirmDeleteButton.textContent = t('delete');
	}

	const clearAllTitle = document.getElementById('clear-all-modal-title');
	if (clearAllTitle) {
		clearAllTitle.textContent = t('clearAllTasksQuestion');
	}
	const clearAllMessage = clearAllModal?.querySelector('p');
	if (clearAllMessage) {
		clearAllMessage.textContent = t('clearAllTasksMessage');
	}
	if (cancelClearAllButton) {
		cancelClearAllButton.textContent = t('cancel');
	}
	if (confirmClearAllButton) {
		confirmClearAllButton.textContent = t('clearAll');
	}

	const scheduleModalTitle = document.getElementById('schedule-modal-title');
	if (scheduleModalTitle) {
		scheduleModalTitle.textContent = t('recurringSchedules');
	}
	const scheduleSubtitle = document.querySelector('.schedule-subtitle');
	if (scheduleSubtitle) {
		scheduleSubtitle.textContent = t('scheduleSubtitle');
	}
	if (closeScheduleButton) {
		closeScheduleButton.setAttribute('aria-label', t('closeRecurringSchedules'));
	}
	const goalSectionTitle = document.querySelector('.goal-section-title');
	if (goalSectionTitle) {
		goalSectionTitle.textContent = t('goals');
	}
	const goalTitleLabel = document.querySelector('label[for="goal-title-input"]');
	if (goalTitleLabel) {
		goalTitleLabel.textContent = t('goalName');
	}
	if (goalTitleInput) {
		goalTitleInput.placeholder = `${t('goalName')}...`;
	}
	const goalTypeLabel = document.querySelector('label[for="goal-type-select"]');
	if (goalTypeLabel) {
		goalTypeLabel.textContent = t('goalType');
	}
	if (goalTypeSelect?.options[0]) {
		goalTypeSelect.options[0].textContent = t('habitIndefinite');
	}
	if (goalTypeSelect?.options[1]) {
		goalTypeSelect.options[1].textContent = t('periodGoal');
	}
	const goalDurationLabel = document.querySelector('label[for="goal-duration-input"]');
	if (goalDurationLabel) {
		goalDurationLabel.textContent = t('durationDays');
	}
	if (goalDurationInput) {
		goalDurationInput.placeholder = t('durationDays');
	}
	const goalIntervalLabel = document.querySelector('label[for="goal-interval-input"]');
	if (goalIntervalLabel) {
		goalIntervalLabel.textContent = t('everyXDays');
	}
	if (goalIntervalInput) {
		goalIntervalInput.placeholder = t('everyXDaysPlaceholder');
		goalIntervalInput.setAttribute('aria-label', t('everyXDays'));
		goalIntervalInput.setAttribute('title', t('everyXDaysTitle'));
	}
	const goalStartLabel = document.querySelector('label[for="goal-start-date-input"]');
	if (goalStartLabel) {
		goalStartLabel.textContent = t('startFrom');
	}
	if (goalStartDateInput) {
		goalStartDateInput.setAttribute('aria-label', t('startFrom'));
		goalStartDateInput.setAttribute('title', t('startFromTitle'));
	}
	const goalColorLabel = document.querySelector('label[for="goal-color-input"]');
	if (goalColorLabel) {
		goalColorLabel.textContent = t('color');
	}
	if (goalColorInput) {
		goalColorInput.setAttribute('aria-label', t('chooseGoalColor'));
		goalColorInput.setAttribute('title', t('goalColor'));
	}
	const goalSubmitButton = document.querySelector('#goal-form .schedule-submit-btn');
	if (goalSubmitButton) {
		goalSubmitButton.textContent = t('createGoal');
	}

	const scheduleTaskLabel = document.querySelector('label[for="schedule-input"]');
	if (scheduleTaskLabel) {
		scheduleTaskLabel.textContent = t('taskName');
	}
	if (scheduleInput) {
		scheduleInput.placeholder = t('createRecurringTask');
	}
	const scheduleGoalLabel = document.querySelector('label[for="schedule-goal-select"]');
	if (scheduleGoalLabel) {
		scheduleGoalLabel.textContent = t('goal');
	}
	if (scheduleGoalSelect?.options[0]) {
		scheduleGoalSelect.options[0].textContent = t('noGoal');
	}
	const scheduleIntervalLabel = document.querySelector('label[for="schedule-interval-input"]');
	if (scheduleIntervalLabel) {
		scheduleIntervalLabel.textContent = t('everyXDays');
	}
	if (scheduleIntervalInput) {
		scheduleIntervalInput.placeholder = t('everyXDaysPlaceholder');
		scheduleIntervalInput.setAttribute('aria-label', t('everyXDays'));
		scheduleIntervalInput.setAttribute('title', t('everyXDaysTitle'));
	}
	const scheduleStartLabel = document.querySelector('label[for="schedule-start-date-input"]');
	if (scheduleStartLabel) {
		scheduleStartLabel.textContent = t('startFrom');
	}
	if (scheduleStartDateInput) {
		scheduleStartDateInput.setAttribute('aria-label', t('startFrom'));
		scheduleStartDateInput.setAttribute('title', t('startFromTitle'));
	}
	const scheduleSubmitButton = document.querySelector('#schedule-form .schedule-submit-btn');
	if (scheduleSubmitButton) {
		scheduleSubmitButton.textContent = t('schedule');
	}

	const removeGoalTitle = document.getElementById('remove-goal-modal-title');
	if (removeGoalTitle) {
		removeGoalTitle.textContent = t('removeGoalQuestion');
	}
	const removeGoalMessage = removeGoalModal?.querySelector('p');
	if (removeGoalMessage) {
		removeGoalMessage.textContent = t('removeGoalMessage');
	}
	if (cancelRemoveGoalButton) {
		cancelRemoveGoalButton.textContent = t('cancel');
	}
	if (confirmRemoveGoalButton) {
		confirmRemoveGoalButton.textContent = t('removeGoal');
	}

	const progressTitle = document.getElementById('progress-modal-title');
	if (progressTitle) {
		progressTitle.textContent = t('progressDashboard');
	}
	if (closeProgressButton) {
		closeProgressButton.setAttribute('aria-label', t('closeProgressDashboard'));
	}
	const progressCurrentLabel = document.querySelector('#progress-current-card .progress-stat-label');
	if (progressCurrentLabel) {
		progressCurrentLabel.textContent = t('currentStreakLabel');
	}
	const progressBestLabel = document.querySelector('#progress-best-card .progress-stat-label');
	if (progressBestLabel) {
		progressBestLabel.textContent = t('bestStreakLabel');
	}
	const progressQuoteTitle = document.getElementById('progress-quote-title');
	if (progressQuoteTitle) {
		progressQuoteTitle.textContent = t('motivationQuote');
	}
	if (editProgressQuoteButton) {
		editProgressQuoteButton.setAttribute('aria-label', t('editMotivationQuote'));
		editProgressQuoteButton.setAttribute('title', t('editQuote'));
	}
	const progressQuoteLabel = document.querySelector('label[for="progress-quote-input"]');
	if (progressQuoteLabel) {
		progressQuoteLabel.textContent = t('customQuoteOptional');
	}
	if (progressQuoteInput) {
		progressQuoteInput.placeholder = t('writeOwnQuote');
	}
	if (saveProgressQuoteButton) {
		saveProgressQuoteButton.textContent = t('saveQuote');
	}
	if (clearProgressQuoteButton) {
		clearProgressQuoteButton.textContent = t('useDailyQuote');
	}
	if (cancelProgressQuoteButton) {
		cancelProgressQuoteButton.textContent = t('cancel');
	}
	const chartTitles = document.querySelectorAll('.chart-card h3');
	if (chartTitles[0]) {
		chartTitles[0].textContent = t('completedTasksLast7Days');
	}
	if (chartTitles[1]) {
		chartTitles[1].textContent = t('consistencyByMonth');
	}
	if (chartTitles[2]) {
		chartTitles[2].textContent = t('goalProgress');
	}

	syncFinishedTasksToggleButton();
};

const openModalOverlay = (overlay, bodyClass = '') => {
	if (!overlay) {
		return;
	}

	if (overlay._closeTimer) {
		clearTimeout(overlay._closeTimer);
		overlay._closeTimer = null;
	}

	overlay.classList.remove('is-closing');
	overlay.classList.add('is-open');
	overlay.setAttribute('aria-hidden', 'false');
	if (bodyClass) {
		document.body.classList.add(bodyClass);
	}
};

const closeModalOverlay = (overlay, bodyClass = '') => {
	if (!overlay) {
		return;
	}

	overlay.setAttribute('aria-hidden', 'true');
	overlay.classList.remove('is-open');
	overlay.classList.add('is-closing');
	if (bodyClass) {
		document.body.classList.remove(bodyClass);
	}

	if (overlay._closeTimer) {
		clearTimeout(overlay._closeTimer);
	}

	overlay._closeTimer = setTimeout(() => {
		overlay.classList.remove('is-closing');
		overlay._closeTimer = null;
	}, MODAL_TRANSITION_MS);
};

const openCollapsiblePanel = (panel) => {
	if (!panel) {
		return;
	}

	if (panel._collapseTimer) {
		clearTimeout(panel._collapseTimer);
		panel._collapseTimer = null;
	}

	panel.hidden = false;
	requestAnimationFrame(() => {
		panel.classList.remove('is-closing');
		panel.classList.add('is-open');
	});
};

const closeCollapsiblePanel = (panel) => {
	if (!panel) {
		return;
	}

	panel.classList.remove('is-open');
	panel.classList.add('is-closing');

	if (panel._collapseTimer) {
		clearTimeout(panel._collapseTimer);
	}

	panel._collapseTimer = setTimeout(() => {
		panel.hidden = true;
		panel.classList.remove('is-closing');
		panel._collapseTimer = null;
	}, PANEL_TRANSITION_MS);
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

const isValidDateStamp = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const normalizeDateStamp = (value, fallback = getCurrentDateStamp()) =>
	isValidDateStamp(value) ? value : fallback;

const addDaysToDateStamp = (dateStamp, daysToAdd) => {
	const utc = parseDateStampUtc(dateStamp) + (Math.floor(daysToAdd) * DAY_IN_MS);
	const date = new Date(utc);
	return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
};

const normalizePositiveInteger = (value, fallback = 1) => {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed < 1) {
		return Math.max(1, Math.floor(fallback));
	}

	return Math.floor(parsed);
};

const normalizeOptionalPositiveInteger = (value) => {
	if (value === '' || value === null || typeof value === 'undefined') {
		return null;
	}

	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed < 1) {
		return null;
	}

	return Math.floor(parsed);
};

const daysBetweenDateStamps = (fromDateStamp, toDateStamp) => {
	const fromUtc = parseDateStampUtc(fromDateStamp);
	const toUtc = parseDateStampUtc(toDateStamp);
	return Math.floor((toUtc - fromUtc) / DAY_IN_MS);
};

const getGoalPeriodEndDate = (goal) => {
	if (!goal || goal.type !== 'period') {
		return null;
	}

	if (typeof goal.endDate === 'string' && goal.endDate) {
		return goal.endDate;
	}

	if (!goal.durationDays) {
		return null;
	}

	return addDaysToDateStamp(goal.startDate, goal.durationDays - 1);
};

const isRecurringScheduleActiveOnDate = (schedule, dateStamp) => {
	if (!schedule || !dateStamp) {
		return false;
	}

	const startDate = normalizeDateStamp(schedule.startDate);
	const diff = daysBetweenDateStamps(startDate, dateStamp);
	if (diff < 0) {
		return false;
	}

	const intervalDays = normalizePositiveInteger(schedule.intervalDays, 1);
	return diff % intervalDays === 0;
};

const formatEveryXDays = (intervalDays) => {
	const normalizedInterval = normalizePositiveInteger(intervalDays, 1);
	return normalizedInterval === 1
		? t('everyDay')
		: t('everyNDays', { count: normalizedInterval });
};

const getGoalScheduleLabel = (goal) => {
	if (!goal) {
		return '';
	}

	if (goal.type === 'period') {
		if (goal.cycleDays) {
			return t('cycleLabel', {
				duration: goal.durationDays,
				cycle: goal.cycleDays,
				start: formatDisplayDate(goal.startDate),
			});
		}

		const endDate = getGoalPeriodEndDate(goal);
		return endDate
			? t('dateRange', {
				start: formatDisplayDate(goal.startDate),
				end: formatDisplayDate(endDate),
			})
			: t('startsOn', { date: formatDisplayDate(goal.startDate) });
	}

	return t('fromDate', {
		label: formatEveryXDays(goal.intervalDays),
		date: formatDisplayDate(goal.startDate),
	});
};

const getScheduleTimingLabel = (schedule) => {
	if (!schedule) {
		return '';
	}

	return t('fromDate', {
		label: formatEveryXDays(schedule.intervalDays),
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
	state.tasks.some((task) => task.isScheduled && task.scheduleId === scheduleId && task.done);

const shouldLockScheduleStartDate = (schedule) =>
	Boolean(schedule) && hasScheduleStarted(schedule) && scheduleHasCompletedTaskHistory(schedule.id);

const syncGoalFrequencyInputs = ({ type, durationInput, intervalInput, intervalValue = '' }) => {
	if (!durationInput || !intervalInput) {
		return;
	}

	const isPeriodGoal = type === 'period';
	durationInput.disabled = !isPeriodGoal;
	durationInput.required = isPeriodGoal;
	intervalInput.disabled = false;
	intervalInput.required = !isPeriodGoal;
	intervalInput.placeholder = isPeriodGoal ? t('cycleEveryXDaysOptional') : t('everyXDays');

	if (isPeriodGoal) {
		if (intervalValue === '') {
			intervalInput.value = '';
		}
		return;
	}

	if (!intervalInput.value) {
		intervalInput.value = intervalValue || '1';
	}
	if (durationInput.value) {
		durationInput.value = '';
	}
};

const isGoalActiveOnDate = (goal, dateStamp) => {
	if (!goal || !dateStamp) {
		return false;
	}

	const diff = daysBetweenDateStamps(goal.startDate, dateStamp);
	if (diff < 0) {
		return false;
	}

	if (goal.type === 'period') {
		const durationDays = normalizePositiveInteger(goal.durationDays || getGoalDurationDays(goal) || 1, 1);
		if (goal.cycleDays) {
			const cycleDays = normalizePositiveInteger(goal.cycleDays, durationDays);
			return diff % cycleDays < durationDays;
		}

		return diff < durationDays;
	}

	const intervalDays = normalizePositiveInteger(goal.intervalDays, 1);
	return diff % intervalDays === 0;
};

const isGoalFinished = (goal, dateStamp = getCurrentDateStamp()) => {
	if (!goal) {
		return false;
	}

	if (typeof goal.finishedAt === 'string' && goal.finishedAt) {
		return true;
	}

	if (goal.type !== 'period' || goal.cycleDays) {
		return false;
	}

	const endDate = getGoalPeriodEndDate(goal);
	if (!endDate) {
		return false;
	}

	return daysBetweenDateStamps(endDate, dateStamp) > 0;
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

	const checkedLabelElement = document.getElementById('checked-label');
	const uncheckedLabelElement = document.getElementById('unchecked-label');
	if (checkedLabelElement) {
		checkedLabelElement.textContent = t('checkedLabel');
	}
	if (uncheckedLabelElement) {
		uncheckedLabelElement.textContent = t('uncheckedLabel');
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
		nextGoal === 3 ? 0 : baseGoals.includes(nextGoal) ? baseGoals[baseGoals.indexOf(nextGoal) - 1] : nextGoal - 30;
	const tierLength = Math.max(nextGoal - previousGoal, 1);
	const tierProgress = Math.min(((streak - previousGoal) / tierLength) * 100, 100);

	currentStreakElement.textContent = String(streak);
	bestStreakElement.textContent = String(bestStreak);
	rewardProgressBarElement.style.width = `${Math.max(tierProgress, 0)}%`;

	const streakFractionEl = document.getElementById('streak-goal-fraction');
	if (streakFractionEl) streakFractionEl.textContent = `/${nextGoal}`;

	const streakUnitEl = document.getElementById('streak-main-unit');
	if (streakUnitEl) streakUnitEl.textContent = streak === 1 ? t('day') : t('days');

	const streakBestBadge = document.getElementById('streak-best-badge');
	if (streakBestBadge) streakBestBadge.hidden = streak === 0 || streak < bestStreak;

	badgeListElement.innerHTML = '';
	baseGoals
		.filter((goal) => streak >= goal)
		.forEach((goal) => {
			const badge = document.createElement('span');
			badge.className = 'badge-chip';
			badge.textContent = t('unlockedBadge', { count: goal });
			badgeListElement.appendChild(badge);
		});
};

const getDailyMotivationQuote = (dateStamp) => {
	const localizedQuotes = getLocalizedList('dailyQuotes');
	if (!Array.isArray(localizedQuotes) || localizedQuotes.length === 0) {
		return t('defaultQuote');
	}

	const [year, month, day] = dateStamp.split('-').map(Number);
	const quoteSeed = ((year * 372) + (month * 31) + day) % localizedQuotes.length;
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
		progressQuoteCard.classList.toggle('is-editing', isProgressQuoteEditing);
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
		progressQuoteInput.setSelectionRange(progressQuoteInput.value.length, progressQuoteInput.value.length);
	}
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

const syncDailyQuoteSurface = (dateStamp = getCurrentDateStamp()) => {
	const quote = getResolvedProgressQuote(dateStamp);

	if (appSubtitle) {
		appSubtitle.textContent = quote;
	}

	return quote;
};

const renderProgressCharts = () => {
	const today = new Date();
	const currentYear = today.getFullYear();
	const todayDateStamp = getCurrentDateStamp();
	const currentMonthIndex = today.getMonth();

	const weekItems = [];
	for (let i = 6; i >= 0; i -= 1) {
		const day = new Date(today);
		day.setDate(today.getDate() - i);
		const label = new Intl.DateTimeFormat(appLanguage, { weekday: 'short' }).format(day);
		const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
		const count = getDailyCompletionCount(key);
		const weekdayIndex = day.getDay();
		const isCurrentDay = key === todayDateStamp;
		const chartColor = isCurrentDay
			? CURRENT_PERIOD_CHART_COLOR
			: WEEKDAY_CHART_COLORS[weekdayIndex] || '#3b82f6';
		weekItems.push({ label, key, count, chartColor, isCurrentDay });
	}

	const maxWeekCount = Math.max(...weekItems.map((item) => item.count), 1);
	weekChart.innerHTML = '';
	weekItems.forEach((item) => {
		const weekItem = document.createElement('div');
		weekItem.className = `week-item${item.isCurrentDay ? ' is-current' : ''}`;

		const countLabel = document.createElement('span');
		countLabel.className = 'week-bar-count';
		countLabel.textContent = String(item.count);

		const bar = document.createElement('div');
		bar.className = `week-bar${item.count > 0 ? ' is-active' : ''}${item.isCurrentDay ? ' is-current' : ''}`;
		bar.style.setProperty('--bar-color', item.chartColor);
		bar.style.height = `${Math.max((item.count / maxWeekCount) * 100, 8)}%`;
		bar.title = t('completedTasksTitle', {
			date: formatDisplayDate(item.key),
			count: item.count,
			taskWord: getTaskWord(item.count),
		});

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
		const isCurrentMonth = index === currentMonthIndex;
		const chartColor = isCurrentMonth
			? CURRENT_PERIOD_CHART_COLOR
			: MONTH_CHART_COLORS[index] || '#3b82f6';
		monthItem.className = `month-item${isCurrentMonth ? ' is-current' : ''}`;

		const countLabel = document.createElement('span');
		countLabel.className = 'month-bar-count';
		countLabel.textContent = String(count);

		const bar = document.createElement('div');
		bar.className = `month-bar${count > 0 ? ' is-active' : ''}${isCurrentMonth ? ' is-current' : ''}`;
		bar.style.setProperty('--bar-color', chartColor);
		bar.style.height = `${Math.max((count / maxMonthCount) * 100, 8)}%`;
		const monthLabelText = new Intl.DateTimeFormat(appLanguage, { month: 'short' }).format(
			new Date(Date.UTC(currentYear, index, 1)),
		);
		bar.title = t('activeDaysTitle', {
			month: monthLabelText,
			count,
			dayWord: getDayWord(count),
		});

		const label = document.createElement('span');
		label.className = 'month-bar-label';
		label.textContent = monthLabelText;

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
	yearChartLabel.textContent = t('activeDaysInYear', {
		activeDays,
		totalDays: totalDaysInYear,
		dayWord: getDayWord(activeDays),
		year: currentYear,
		percent: consistencyPercent,
	});

	const progressCurrentStreakElement = document.getElementById('progress-current-streak');
	const progressBestStreakElement = document.getElementById('progress-best-streak');
	const progressCurrentUnitElement = document.getElementById('progress-current-unit');
	const progressBestUnitElement = document.getElementById('progress-best-unit');
	const progressBestBadge = document.getElementById('progress-best-badge');
	const progressStreakStatsContainer = document.getElementById('progress-streak-stats');
	const progressCurrentCard = document.getElementById('progress-current-card');
	const progressBestCard = document.getElementById('progress-best-card');
	
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
		progressCurrentUnitElement.textContent = currentStreak === 1 ? t('day') : t('days');
	}
	if (progressBestUnitElement) {
		progressBestUnitElement.textContent = bestStreak === 1 ? t('day') : t('days');
	}
	if (progressBestBadge) {
		progressBestBadge.hidden = !isBestStreak;
	}
	if (progressStreakStatsContainer) {
		progressStreakStatsContainer.classList.toggle('is-best-streak', isBestStreak);
	}
	if (isBestStreak && progressBestCard) {
		progressBestCard.hidden = true;
	} else if (progressBestCard) {
		progressBestCard.hidden = false;
	}

	renderProgressQuote(todayDateStamp);

	renderGoalProgress();
};

const getGoalTrackingEndDate = (goal, todayDateStamp) => {
	if (goal.type === 'period' && !goal.cycleDays) {
		const endDate = getGoalPeriodEndDate(goal);
		if (endDate) {
			return daysBetweenDateStamps(endDate, todayDateStamp) < 0 ? endDate : todayDateStamp;
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
	scheduleGoalSelect.innerHTML = `<option value="">${t('noGoal')}</option>`;

	getActiveGoals().forEach((goal) => {
		const option = document.createElement('option');
		option.value = goal.id;
		option.textContent = goal.title;
		scheduleGoalSelect.appendChild(option);
	});

	if (previousValue && state.goals.some((goal) => goal.id === previousValue)) {
		scheduleGoalSelect.value = previousValue;
	}

	syncScheduleIntervalLock(scheduleGoalSelect.value || null, scheduleIntervalInput);
};

const buildGoalOptionsMarkup = (selectedGoalId = '') => {
	const options = [`<option value="">${t('noGoal')}</option>`];
	getActiveGoals().forEach((goal) => {
		const selected = goal.id === selectedGoalId ? ' selected' : '';
		options.push(`<option value="${goal.id}"${selected}>${goal.title}</option>`);
	});
	return options.join('');
};

const shouldLockScheduleIntervalToGoal = (goalId) => {
	if (!goalId) {
		return false;
	}

	const goal = state.goals.find((item) => item.id === goalId);
	if (!goal || goal.type !== 'habit') {
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
		intervalInput.value = '1';
	}

	intervalInput.disabled = shouldLock;
	intervalInput.title = shouldLock
		? t('scheduleIntervalLocked')
		: t('everyXDaysTitle');
};

const getGoalDurationDays = (goal) => {
	if (!goal || goal.type !== 'period') {
		return '';
	}

	if (goal.durationDays) {
		return String(normalizePositiveInteger(goal.durationDays, 1));
	}

	const endDate = getGoalPeriodEndDate(goal);
	if (!endDate) {
		return '';
	}

	return String(Math.max(1, daysBetweenDateStamps(goal.startDate, endDate) + 1));
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

		const goalTypeLabel = getGoalScheduleLabel(goal);

		goalItem.innerHTML = `
			<div class="goal-item-view">
				<div class="goal-item-text">
					<strong>${goal.title}</strong>
					<span>${goalTypeLabel} | ${scheduleCount} ${getTaskWord(scheduleCount)}</span>
				</div>
				<div class="goal-item-actions">
					<span class="goal-color-dot" aria-hidden="true"></span>
					<button type="button" class="goal-move-btn goal-move-up-btn" ${canMoveUp ? '' : 'disabled'} aria-label="${t('moveUp')}" title="${t('moveUp')}">↑</button>
					<button type="button" class="goal-move-btn goal-move-down-btn" ${canMoveDown ? '' : 'disabled'} aria-label="${t('moveDown')}" title="${t('moveDown')}">↓</button>
					<button type="button" class="goal-edit-btn">${t('edit')}</button>
					<button type="button" class="goal-finish-btn">${t('finish')}</button>
					<button type="button" class="goal-remove-btn">${t('removeGoal')}</button>
				</div>
			</div>
			<form class="goal-edit-form">
				<input type="text" class="goal-edit-title-input" required />
				<select class="goal-edit-type-select">
					<option value="habit">${t('habitIndefinite')}</option>
					<option value="period">${t('periodGoal')}</option>
				</select>
				<input type="number" class="goal-edit-duration-input" min="1" placeholder="${t('daysPlaceholderShort')}" />
				<input type="number" class="goal-edit-interval-input" min="1" placeholder="${t('everyXDays')}" />
				<input type="date" class="goal-edit-start-date-input" aria-label="${t('startFrom')}" title="${t('startFromTitle')}" />
				<input type="color" class="goal-edit-color-input" aria-label="${t('goalColor')}" title="${t('goalColor')}" />
				<button type="button" class="goal-save-btn">${t('save')}</button>
				<button type="button" class="goal-cancel-btn">${t('cancel')}</button>
			</form>
		`;

		const titleInput = goalItem.querySelector('.goal-edit-title-input');
		if (titleInput) {
			titleInput.value = goal.title;
		}

		const typeSelect = goalItem.querySelector('.goal-edit-type-select');
		const durationInput = goalItem.querySelector('.goal-edit-duration-input');
		const intervalInput = goalItem.querySelector('.goal-edit-interval-input');
		const startDateInput = goalItem.querySelector('.goal-edit-start-date-input');
		if (typeSelect) {
			typeSelect.value = goal.type;
		}
		if (durationInput) {
			durationInput.value = getGoalDurationDays(goal);
		}
		if (intervalInput) {
			intervalInput.value = goal.type === 'period'
				? String(goal.cycleDays || '')
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
				intervalValue: goal.type === 'period'
					? String(goal.cycleDays || '')
					: String(normalizePositiveInteger(goal.intervalDays, 1)),
			});
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
	const isExpanded = finishedGoalsPanel.classList.contains('is-open');
	toggleFinishedGoalsButton.textContent = isExpanded
		? t('hideFinishedGoals', { count: finishedGoals.length })
		: t('seeFinishedGoals', { count: finishedGoals.length });
	toggleFinishedGoalsButton.setAttribute('aria-expanded', String(isExpanded));

	finishedGoalsList.innerHTML = '';
	if (finishedGoals.length === 0) {
		const emptyItem = document.createElement('li');
		emptyItem.className = 'finished-goal-empty';
		emptyItem.textContent = t('noFinishedGoalsYet');
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
		meta.textContent = t('endedOn', {
			date: formatDisplayDate(goal.finishedAt || getGoalPeriodEndDate(goal) || goal.startDate),
		});
		const unfinishBtn = document.createElement('button');
		unfinishBtn.type = 'button';
		unfinishBtn.className = 'goal-unfinish-btn';
		unfinishBtn.textContent = t('reactivate');
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
			${goal.type === 'period' ? t('progressPeriod', { label: getGoalScheduleLabel(goal) }) : t('progressHabit', { label: getGoalScheduleLabel(goal) })}
		</p>
		<p class="goal-progress-meta">
			${t('completedChecksSummary', {
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

	goalProgressList.innerHTML = '';
	const activeGoals = getActiveGoals();
	const finishedGoals = getFinishedGoals();
	const today = getCurrentDateStamp();

	if (activeGoals.length === 0 && finishedGoals.length === 0) {
		const emptyItem = document.createElement('li');
		emptyItem.className = 'goal-progress-item goal-progress-empty';
		emptyItem.textContent = t('noGoalsYet');
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
		toggleBtn.textContent = t('showFinishedGoalsProgress', { count: finishedGoals.length });
		toggleBtn.setAttribute('aria-expanded', 'false');

		const panel = document.createElement('ul');
		panel.className = 'goal-progress-finished-list';
		panel.classList.remove('is-open');
		panel.hidden = true;

		finishedGoals.forEach((goal) => {
			panel.appendChild(buildGoalProgressItem(goal, today, 'goal-progress-item--finished'));
		});

		toggleBtn.addEventListener('click', () => {
			const isOpen = !panel.classList.contains('is-open');
			if (isOpen) {
				openCollapsiblePanel(panel);
			} else {
				closeCollapsiblePanel(panel);
			}
			toggleBtn.setAttribute('aria-expanded', String(isOpen));
			toggleBtn.textContent = isOpen
				? t('hideFinishedGoalsProgress', { count: finishedGoals.length })
				: t('showFinishedGoalsProgress', { count: finishedGoals.length });
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
	showToast(t('taskCompleteToast'), '🎉', 'success');
};

const showDuplicateWarning = (message) => {
	showToast(message, '🚫', 'warning');
};

const showSuccessToast = (message) => {
	showToast(message, '✅', 'success');
};
const TASK_HIDE_ANIMATION_MS = 220;

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
			<button type="button" class="todo-action-btn todo-edit-btn" aria-label="${t('edit')}">
				<i title="${t('edit')}" class="fa-solid fa-pen"></i>
			</button>
			<button type="button" class="todo-action-btn todo-save-btn" aria-label="${t('save')}">
				<i title="${t('save')}" class="fa-solid fa-floppy-disk"></i>
			</button>
			<button type="button" class="todo-action-btn todo-delete-btn" aria-label="${t('delete')}">
				<i title="${t('delete')}" class="fa-solid fa-trash"></i>
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
		deleteButton.setAttribute('title', t('removeFromRecurringSchedules'));

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
	if (state.customQuote) {
		localStorage.setItem(CUSTOM_QUOTE_STORAGE_KEY, state.customQuote);
	} else {
		localStorage.removeItem(CUSTOM_QUOTE_STORAGE_KEY);
	}
	localStorage.setItem(SHOW_FINISHED_TASKS_STORAGE_KEY, state.showFinishedTasks ? '1' : '0');
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
				startDate: normalizeDateStamp(schedule.startDate),
				intervalDays: normalizePositiveInteger(schedule.intervalDays, 1),
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
				const startDate = normalizeDateStamp(goal.startDate);
				const isPeriodGoal = goal.type === 'period';
				const durationDays = goal.durationDays
					? normalizePositiveInteger(goal.durationDays, 1)
					: (isPeriodGoal && typeof goal.endDate === 'string'
						? Math.max(1, daysBetweenDateStamps(startDate, goal.endDate) + 1)
						: null);
				return {
					id: typeof goal.id === 'string' ? goal.id : createId('goal'),
					title: goal.title.trim() || 'Untitled goal',
					type: isPeriodGoal ? 'period' : 'habit',
					color: normalizeGoalColor(goal.color),
					startDate,
					endDate: isPeriodGoal && !goal.cycleDays ? goal.endDate : null,
					durationDays,
					intervalDays: normalizePositiveInteger(goal.intervalDays, 1),
					cycleDays: normalizeOptionalPositiveInteger(goal.cycleDays),
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

const loadStoredCustomQuote = () => {
	const rawQuote = localStorage.getItem(CUSTOM_QUOTE_STORAGE_KEY);
	if (!rawQuote || typeof rawQuote !== 'string') {
		return '';
	}

	return rawQuote.trim().slice(0, 180);
};

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

		// Habit cadence should not force linked task cadence.
		if (goal.type === 'habit') {
			return true;
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
		taskItem.removeEventListener('transitionend', handleTransitionEnd);
		onComplete();
	};

	const handleTransitionEnd = (event) => {
		if (event.target !== taskItem) {
			return;
		}
		finish();
	};

	const cleanup = () => {
		taskItem.removeEventListener('transitionend', handleTransitionEnd);
	};

	taskItem.style.height = `${taskItem.offsetHeight}px`;
	taskItem.addEventListener('transitionend', handleTransitionEnd);
	requestAnimationFrame(() => {
		taskItem.classList.add('is-hiding');
	});
};

const handleTaskCompletionToggle = (taskItem, task, isDone) => {
	if (!taskItem || !task) {
		return;
	}

	applyTaskDoneState(task, isDone);
	taskItem.classList.toggle('is-done', isDone);

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

const renderTasks = () => {
	todoList.querySelectorAll('.todo-item').forEach((taskItem) => taskItem.remove());
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
			groupTitle.textContent = groupedGoal ? groupedGoal.title : t('noGoal');
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
		const timingLabel = getScheduleTimingLabel(schedule);
		scheduleItem.innerHTML = `
			<div class="schedule-item-view">
				<div class="schedule-item-text">
					<strong>${schedule.text}</strong>
					<small>${timingLabel} ${goalLabel}</small>
				</div>
				<div class="schedule-item-actions">
					<button type="button" class="schedule-move-btn schedule-move-up-btn" ${canMoveUp ? '' : 'disabled'} aria-label="${t('moveUp')}" title="${t('moveUp')}">↑</button>
					<button type="button" class="schedule-move-btn schedule-move-down-btn" ${canMoveDown ? '' : 'disabled'} aria-label="${t('moveDown')}" title="${t('moveDown')}">↓</button>
					<button type="button" class="schedule-edit-btn">${t('edit')}</button>
					<button type="button" class="schedule-remove-btn">${t('delete')}</button>
				</div>
			</div>
			<form class="schedule-edit-form">
				<input type="text" class="schedule-edit-input" required />
				<select class="schedule-edit-goal-select">${buildGoalOptionsMarkup(schedule.goalId || '')}</select>
				<input type="number" class="schedule-edit-interval-input" min="1" placeholder="${t('everyXDays')}" />
				<input type="date" class="schedule-edit-start-date-input" aria-label="${t('startFrom')}" title="${t('startFromTitle')}" />
				<button type="button" class="schedule-save-btn">${t('save')}</button>
				<button type="button" class="schedule-cancel-btn">${t('cancel')}</button>
			</form>
		`;

		const editInput = scheduleItem.querySelector('.schedule-edit-input');
		if (editInput) {
			editInput.value = schedule.text;
		}
		const intervalInput = scheduleItem.querySelector('.schedule-edit-interval-input');
		if (intervalInput) {
			intervalInput.value = String(normalizePositiveInteger(schedule.intervalDays, 1));
		}
		const startDateInput = scheduleItem.querySelector('.schedule-edit-start-date-input');
		if (startDateInput) {
			startDateInput.value = schedule.startDate;
			startDateInput.disabled = shouldLockScheduleStartDate(schedule);
			startDateInput.title = startDateInput.disabled
				? t('startDateLocked')
				: t('startFromTitle');
		}
		scheduleList.appendChild(scheduleItem);
	});
};

const updateScheduleItemView = (scheduleItem, schedule) => {
	if (!scheduleItem || !schedule) {
		return;
	}

	const titleElement = scheduleItem.querySelector('.schedule-item-text strong');
	if (titleElement) {
		titleElement.textContent = schedule.text;
	}

	const metaElement = scheduleItem.querySelector('.schedule-item-text small');
	if (metaElement) {
		metaElement.textContent = getScheduleTimingLabel(schedule);
		const goal = state.goals.find((item) => item.id === schedule.goalId);
		if (goal) {
			metaElement.appendChild(document.createTextNode(' '));
			const badge = document.createElement('small');
			badge.className = 'schedule-goal-badge';
			badge.style.setProperty('--goal-badge-color', getGoalColor(goal));
			badge.textContent = goal.title;
			metaElement.appendChild(badge);
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

	const intervalInput = scheduleItem.querySelector('.schedule-edit-interval-input');
	if (intervalInput) {
		intervalInput.value = String(normalizePositiveInteger(schedule.intervalDays, 1));
	}

	const startDateInput = scheduleItem.querySelector('.schedule-edit-start-date-input');
	if (startDateInput) {
		startDateInput.value = schedule.startDate;
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
	title = t('deleteTaskQuestion'),
	message = t('actionCannotBeUndone'),
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
		deleteModalTitle.textContent = t('deleteTaskQuestion');
	}
	if (deleteModalMessage) {
		deleteModalMessage.textContent = t('actionCannotBeUndone');
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
	if (scheduleStartDateInput && !scheduleStartDateInput.value) {
		scheduleStartDateInput.value = getCurrentDateStamp();
	}
	openModalOverlay(scheduleModal, 'is-schedule-open');
};

const hideScheduleModal = () => {
	closeModalOverlay(scheduleModal, 'is-schedule-open');
};

const showProgressModal = () => {
	renderProgressCharts();
	setProgressQuoteEditing(false);
	openModalOverlay(progressModal, 'is-progress-open');
};

const hideProgressModal = () => {
	closeModalOverlay(progressModal, 'is-progress-open');
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
	showSuccessToast(t('goalRemoved'));
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
	showSuccessToast(t('recurringScheduleRemoved'));
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

if (toggleFinishedTasksButton) {
	toggleFinishedTasksButton.addEventListener('click', () => {
		state.showFinishedTasks = !state.showFinishedTasks;
		renderTasks();
		showSuccessToast(
			state.showFinishedTasks
				? t('finishedTasksVisible')
				: t('finishedTasksHidden'),
		);
		saveStateToStorage();
	});
}

if (saveProgressQuoteButton) {
	saveProgressQuoteButton.addEventListener('click', () => {
		if (!progressQuoteInput) {
			return;
		}

		state.customQuote = progressQuoteInput.value.trim().slice(0, 180);
		renderProgressQuote();
		setProgressQuoteEditing(false);
		saveStateToStorage();
		showSuccessToast(state.customQuote ? t('customQuoteSaved') : t('usingDailyQuote'));
	});
}

if (clearProgressQuoteButton) {
	clearProgressQuoteButton.addEventListener('click', () => {
		state.customQuote = '';
		renderProgressQuote();
		setProgressQuoteEditing(false);
		saveStateToStorage();
		showSuccessToast(t('dailyQuoteEnabled'));
	});
}

if (editProgressQuoteButton) {
	editProgressQuoteButton.addEventListener('click', () => {
		setProgressQuoteEditing(true);
	});
}

if (cancelProgressQuoteButton) {
	cancelProgressQuoteButton.addEventListener('click', () => {
		setProgressQuoteEditing(false);
		renderProgressQuote();
	});
}

if (themeToggleButton) {
	themeToggleButton.addEventListener('click', toggleTheme);
}

if (goalTypeSelect && goalDurationInput) {
	goalTypeSelect.addEventListener('change', () => {
		syncGoalFrequencyInputs({
			type: goalTypeSelect.value,
			durationInput: goalDurationInput,
			intervalInput: goalIntervalInput,
			intervalValue: goalTypeSelect.value === 'period' ? '' : '1',
		});
	});
}

if (installAppButton) {
	installAppButton.addEventListener('click', async () => {
		if (!deferredInstallPrompt) {
			showToast(t('installHelp'), '📲', 'warning');
			return;
		}

		deferredInstallPrompt.prompt();
		const { outcome } = await deferredInstallPrompt.userChoice;
		if (outcome !== 'accepted') {
			showToast(t('installCanceled'), '📲', 'warning');
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
		showDuplicateWarning(t('duplicateTask'));
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
	const startDate = normalizeDateStamp(scheduleStartDateInput?.value);
	const intervalDays = shouldLockScheduleIntervalToGoal(selectedGoalId)
		? 1
		: normalizePositiveInteger(scheduleIntervalInput?.value, 1);

	const hasSameSchedule = isDuplicateScheduleText(text);
	if (hasSameSchedule) {
		showDuplicateWarning(t('duplicateSchedule'));
		scheduleInput.focus();
		scheduleInput.select();
		return;
	}

	const newSchedule = {
		id: createId('schedule'),
		text,
		goalId: selectedGoalId,
		startDate,
		intervalDays,
		createdAt: Date.now(),
	};

	state.schedules.push(newSchedule);
	syncScheduledTasksForToday();

	renderSchedules();
	renderGoals();
	renderFinishedGoals();
	renderTasks();
	scheduleInput.value = '';
	if (scheduleIntervalInput) {
		scheduleIntervalInput.value = '1';
	}
	if (scheduleStartDateInput) {
		scheduleStartDateInput.value = getCurrentDateStamp();
	}
	if (scheduleGoalSelect) {
		scheduleGoalSelect.value = '';
	}
	scheduleInput.focus();
	showSuccessToast(t('recurringScheduleCreated'));
	saveStateToStorage();
});

if (scheduleGoalSelect && scheduleIntervalInput) {
	scheduleGoalSelect.addEventListener('change', () => {
		syncScheduleIntervalLock(scheduleGoalSelect.value || null, scheduleIntervalInput);
	});
}

goalForm.addEventListener('submit', (event) => {
	event.preventDefault();
	const title = goalTitleInput.value.trim();
	if (!title) {
		return;
	}

	if (isDuplicateGoalTitle(title)) {
		showDuplicateWarning(t('duplicateGoal'));
		goalTitleInput.focus();
		goalTitleInput.select();
		return;
	}

	const startDate = normalizeDateStamp(goalStartDateInput?.value);
	const isPeriodGoal = goalTypeSelect.value === 'period';
	const durationDays = normalizePositiveInteger(goalDurationInput.value || 0, 1);
	const intervalDays = normalizePositiveInteger(goalIntervalInput?.value || 1, 1);
	const cycleDays = normalizeOptionalPositiveInteger(goalIntervalInput?.value);
	const selectedColor = normalizeGoalColor(goalColorInput?.value);
	let endDate = null;

	if (!selectedColor) {
		showDuplicateWarning(t('invalidGoalColor'));
		goalColorInput?.focus();
		return;
	}

	if (isGoalColorInUse(selectedColor)) {
		showDuplicateWarning(t('goalColorInUse'));
		goalColorInput?.focus();
		return;
	}

	if (isPeriodGoal) {
		if (!Number.isFinite(durationDays) || durationDays < 1) {
			showDuplicateWarning(t('invalidPeriodDays'));
			goalDurationInput.focus();
			return;
		}
		if (!cycleDays) {
			endDate = addDaysToDateStamp(startDate, durationDays - 1);
		}
	} else if (!goalIntervalInput?.value || intervalDays < 1) {
		showDuplicateWarning(t('invalidHabitFrequency'));
		goalIntervalInput?.focus();
		return;
	}

	state.goals.push({
		id: createId('goal'),
		title,
		type: isPeriodGoal ? 'period' : 'habit',
		color: selectedColor,
		startDate,
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
	goalTitleInput.value = '';
	goalTypeSelect.value = 'habit';
	goalDurationInput.value = '';
	if (goalIntervalInput) {
		goalIntervalInput.value = '1';
	}
	if (goalStartDateInput) {
		goalStartDateInput.value = getCurrentDateStamp();
	}
	syncGoalFrequencyInputs({
		type: 'habit',
		durationInput: goalDurationInput,
		intervalInput: goalIntervalInput,
		intervalValue: '1',
	});
	if (goalColorInput) {
		goalColorInput.value = getNextAvailableGoalColor();
	}
	goalTitleInput.focus();
	showSuccessToast(t('goalCreated'));
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
		showSuccessToast(t('goalFinished'));
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
		const intervalInput = goalItem.querySelector('.goal-edit-interval-input');
		const startDateInput = goalItem.querySelector('.goal-edit-start-date-input');
		const colorInput = goalItem.querySelector('.goal-edit-color-input');

		const nextTitle = titleInput?.value.trim() || '';
		const nextType = typeSelect?.value === 'period' ? 'period' : 'habit';
		const nextStartDate = normalizeDateStamp(startDateInput?.value);

		if (!nextTitle) {
			showDuplicateWarning(t('goalNameEmpty'));
			titleInput?.focus();
			return;
		}

		if (isDuplicateGoalTitle(nextTitle, goalId)) {
			showDuplicateWarning(t('duplicateGoal'));
			titleInput?.focus();
			titleInput?.select();
			return;
		}

		let nextEndDate = null;
		let nextDurationDays = null;
		let nextIntervalDays = 1;
		let nextCycleDays = null;
		if (nextType === 'period') {
			const durationDays = Number(durationInput?.value || 0);
			if (!Number.isFinite(durationDays) || durationDays < 1) {
				showDuplicateWarning(t('invalidPeriodDays'));
				durationInput?.focus();
				return;
			}
			nextDurationDays = Math.floor(durationDays);
			nextCycleDays = normalizeOptionalPositiveInteger(intervalInput?.value);
			nextEndDate = nextCycleDays ? null : addDaysToDateStamp(nextStartDate, nextDurationDays - 1);
		} else {
			nextIntervalDays = normalizePositiveInteger(intervalInput?.value, 1);
			if (!intervalInput?.value || nextIntervalDays < 1) {
				showDuplicateWarning(t('invalidHabitFrequency'));
				intervalInput?.focus();
				return;
			}
		}

		const nextColor = normalizeGoalColor(colorInput?.value);
		if (!nextColor) {
			showDuplicateWarning(t('invalidGoalColor'));
			colorInput?.focus();
			return;
		}

		if (isGoalColorInUse(nextColor, goalId)) {
			showDuplicateWarning(t('goalColorInUse'));
			colorInput?.focus();
			return;
		}

		goal.title = nextTitle;
		goal.type = nextType;
		goal.startDate = nextStartDate;
		goal.endDate = nextEndDate;
		goal.durationDays = nextDurationDays;
		goal.intervalDays = nextIntervalDays;
		goal.cycleDays = nextCycleDays;
		goal.color = nextColor;

		goalItem.classList.remove('is-editing');
		syncScheduledTasksForToday();
		renderGoals();
		renderFinishedGoals();
		renderSchedules();
		renderProgressCharts();
		renderTasks();
		showSuccessToast(t('goalUpdated'));
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
		showSuccessToast(t('goalReactivated'));
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
		const isOpen = !finishedGoalsPanel.classList.contains('is-open');
		if (isOpen) {
			openCollapsiblePanel(finishedGoalsPanel);
		} else {
			closeCollapsiblePanel(finishedGoalsPanel);
		}
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
	const intervalInput = goalItem.querySelector('.goal-edit-interval-input');
	if (!durationInput || !intervalInput) {
		return;
	}

	syncGoalFrequencyInputs({
		type: typeSelect.value,
		durationInput,
		intervalInput,
		intervalValue: typeSelect.value === 'period' ? '' : '1',
	});
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
		const intervalInput = scheduleItem.querySelector('.schedule-edit-interval-input');
		syncScheduleIntervalLock(schedule?.goalId || null, intervalInput);

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
		const intervalInput = scheduleItem.querySelector('.schedule-edit-interval-input');
		const startDateInput = scheduleItem.querySelector('.schedule-edit-start-date-input');
		const isStartDateLocked = shouldLockScheduleStartDate(schedule);
		const nextText = editInput?.value.trim() || '';
		const nextGoalId = goalSelect?.value || null;
		const nextIntervalDays = shouldLockScheduleIntervalToGoal(nextGoalId)
			? 1
			: normalizePositiveInteger(intervalInput?.value, 1);
		const nextStartDate = isStartDateLocked
			? schedule.startDate
			: normalizeDateStamp(startDateInput?.value);

		if (!nextText) {
			showDuplicateWarning(t('scheduleTextEmpty'));
			editInput?.focus();
			return;
		}

		if (isDuplicateScheduleText(nextText, scheduleId)) {
			showDuplicateWarning(t('duplicateSchedule'));
			editInput?.focus();
			editInput?.select();
			return;
		}

		const previousGoalId = schedule.goalId || null;
		schedule.text = nextText;
		schedule.goalId = nextGoalId;
		schedule.intervalDays = nextIntervalDays;
		schedule.startDate = nextStartDate;

		state.tasks = state.tasks.map((task) =>
			task.scheduleId === scheduleId ? { ...task, text: nextText } : task,
		);
		transferCompletedScheduleScoresToGoal(scheduleId, previousGoalId, nextGoalId);

		syncScheduledTasksForToday();
		updateScheduleItemView(scheduleItem, schedule);
		scheduleItem.classList.remove('is-editing');
		renderGoals();
		renderFinishedGoals();
		renderProgressCharts();
		renderTasks();
		showSuccessToast(t('recurringScheduleUpdated'));
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
			showDuplicateWarning(t('onlyTaskInGoal'));
			return;
		}

		showDeleteModal({
			scheduleId,
			title: t('removeGoalTaskQuestion'),
			message: t('removeGoalTaskMessage'),
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

scheduleList.addEventListener('change', (event) => {
	const goalSelect = event.target.closest('.schedule-edit-goal-select');
	if (!goalSelect) {
		return;
	}

	const scheduleItem = goalSelect.closest('.schedule-item');
	if (!scheduleItem) {
		return;
	}

	const intervalInput = scheduleItem.querySelector('.schedule-edit-interval-input');
	syncScheduleIntervalLock(goalSelect.value || null, intervalInput);
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
				handleTaskCompletionToggle(taskItem, task, checkbox.checked);
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

	handleTaskCompletionToggle(taskItem, task, event.target.checked);
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

applyStaticTranslations();
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
	type: goalTypeSelect?.value || 'habit',
	durationInput: goalDurationInput,
	intervalInput: goalIntervalInput,
	intervalValue: '1',
});
applyTheme(getStoredTheme());
syncDailyQuoteSurface();

window.addEventListener('beforeinstallprompt', (event) => {
	event.preventDefault();
	deferredInstallPrompt = event;
	updateInstallButtonState();
});

window.addEventListener('appinstalled', () => {
	deferredInstallPrompt = null;
	updateInstallButtonState();
	showSuccessToast(t('appInstalled'));
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
