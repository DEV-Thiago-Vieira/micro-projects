const todoList = document.getElementById('todo-list');
const taskForm = document.querySelector('.new-task-form');
const taskInput = document.querySelector('.new-task-input');
const checkedCountElement = document.getElementById('checked-count');
const uncheckedCountElement = document.getElementById('unchecked-count');
const clearAllButton = document.getElementById('clear-all-btn');
const congratsMessage = document.getElementById('todo-congrats');

const deleteModal = document.getElementById('delete-modal');
const cancelDeleteButton = document.getElementById('cancel-delete-btn');
const confirmDeleteButton = document.getElementById('confirm-delete-btn');
const clearAllModal = document.getElementById('clear-all-modal');
const cancelClearAllButton = document.getElementById('cancel-clear-all-btn');
const confirmClearAllButton = document.getElementById('confirm-clear-all-btn');
const LOCAL_STORAGE_KEY = 'todo-items-v1';

let pendingDeleteTask = null;

const updateTaskSummary = () => {
	const taskItems = Array.from(todoList.querySelectorAll('.todo-item'));
	const totalTasks = taskItems.length;
	const checkedTasks = taskItems.filter((taskItem) => {
		const checkbox = taskItem.querySelector('input[type="checkbox"]');
		return Boolean(checkbox && checkbox.checked);
	}).length;
	const uncheckedTasks = totalTasks - checkedTasks;

	checkedCountElement.textContent = String(checkedTasks);
	uncheckedCountElement.textContent = String(uncheckedTasks);
	clearAllButton.disabled = totalTasks === 0;

	const shouldCelebrate = totalTasks > 0 && checkedTasks === totalTasks;
	congratsMessage.hidden = !shouldCelebrate;
};

const createTaskElement = (taskText, isDone = false) => {
	const task = document.createElement('div');
	task.className = 'todo-item';

	task.innerHTML = `
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

	const taskTextElement = task.querySelector('.todo-item-text');
	const taskCheckbox = task.querySelector('input[type="checkbox"]');

	taskTextElement.textContent = taskText;
	taskCheckbox.checked = Boolean(isDone);
	task.classList.toggle('is-done', taskCheckbox.checked);
	return task;
};

const getTaskTextElement = (taskItem) => taskItem.querySelector('.todo-item-text');
const getSaveButton = (taskItem) => taskItem.querySelector('.todo-save-btn');
const getEditButton = (taskItem) => taskItem.querySelector('.todo-edit-btn');

const sortTasks = () => {
	const taskItems = Array.from(todoList.querySelectorAll('.todo-item'));
	const unchecked = taskItems.filter((item) => !item.classList.contains('is-done'));
	const checked = taskItems.filter((item) => item.classList.contains('is-done'));
	[...unchecked, ...checked].forEach((item) => todoList.appendChild(item));
};

let toastTimer = null;
const showCompletionToast = () => {
	const toast = document.getElementById('completion-toast');
	if (!toast) {
		return;
	}
	toast.classList.add('is-visible');
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => {
		toast.classList.remove('is-visible');
	}, 1200);
};

const showDeleteModal = (taskItem) => {
	pendingDeleteTask = taskItem;
	deleteModal.classList.add('is-open');
	deleteModal.setAttribute('aria-hidden', 'false');
};

const hideDeleteModal = () => {
	pendingDeleteTask = null;
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

const serializeTasks = () => {
	const taskItems = todoList.querySelectorAll('.todo-item');
	return Array.from(taskItems).map((taskItem) => {
		const taskText = getTaskTextElement(taskItem).textContent.trim();
		const taskCheckbox = taskItem.querySelector('input[type="checkbox"]');
		return {
			text: taskText,
			done: Boolean(taskCheckbox && taskCheckbox.checked),
		};
	});
};

const saveTasksToStorage = () => {
	const tasks = serializeTasks();
	localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
	updateTaskSummary();
};

const loadTasksFromStorage = () => {
	const rawTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
	if (!rawTasks) {
		return null;
	}

	try {
		const parsedTasks = JSON.parse(rawTasks);
		if (!Array.isArray(parsedTasks)) {
			return null;
		}

		return parsedTasks
			.filter((task) => task && typeof task.text === 'string')
			.map((task) => ({
				text: task.text,
				done: Boolean(task.done),
			}));
	} catch {
		return null;
	}
};

const renderTasks = (tasks) => {
	todoList.querySelectorAll('.todo-item').forEach((taskItem) => taskItem.remove());
	tasks.forEach((task) => {
		const taskElement = createTaskElement(task.text, task.done);
		todoList.appendChild(taskElement);
	});
};

const initializeTasks = () => {
	const storedTasks = loadTasksFromStorage();
	if (storedTasks) {
		renderTasks(storedTasks);
		sortTasks();
		updateTaskSummary();
		return;
	}

	saveTasksToStorage();
};

clearAllButton.addEventListener('click', () => {
	showClearAllModal();
});

confirmClearAllButton.addEventListener('click', () => {
	todoList.querySelectorAll('.todo-item').forEach((taskItem) => taskItem.remove());
	pendingDeleteTask = null;
	hideDeleteModal();
	hideClearAllModal();
	saveTasksToStorage();
});

cancelClearAllButton.addEventListener('click', hideClearAllModal);

taskForm.addEventListener('submit', (event) => {
	event.preventDefault();

	const text = taskInput.value.trim();
	if (!text) {
		return;
	}

	const newTask = createTaskElement(text);
	todoList.appendChild(newTask);
	sortTasks();
	taskInput.value = '';
	taskInput.focus();
	saveTasksToStorage();
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
				taskItem.classList.toggle('is-done', checkbox.checked);
				if (checkbox.checked) {
					showCompletionToast();
				}
				sortTasks();
				saveTasksToStorage();
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
		taskText.textContent = taskText.textContent.trim() || 'Untitled task';
		taskText.contentEditable = 'false';
		clickedTaskItem.classList.remove('is-editing');
		saveButton.classList.remove('is-visible');
		editButton.classList.remove('is-hidden');
		saveTasksToStorage();
	}

	if (clickedButton.classList.contains('todo-delete-btn')) {
		showDeleteModal(clickedTaskItem);
	}
});

todoList.addEventListener('change', (event) => {
	if (!event.target.matches('input[type="checkbox"]')) {
		return;
	}

	const taskItem = event.target.closest('.todo-item');
	if (taskItem) {
		taskItem.classList.toggle('is-done', event.target.checked);
		if (event.target.checked) {
			showCompletionToast();
		}
		sortTasks();
		saveTasksToStorage();
	}
});

cancelDeleteButton.addEventListener('click', hideDeleteModal);

confirmDeleteButton.addEventListener('click', () => {
	if (pendingDeleteTask) {
		pendingDeleteTask.remove();
		saveTasksToStorage();
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

initializeTasks();

window.addEventListener('load', () => {
	const loader = document.getElementById('page-loader');
	if (loader) {
		loader.classList.add('is-hidden');
	}
});
