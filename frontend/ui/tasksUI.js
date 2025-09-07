export function renderTasks() {
    const todo = document.getElementById('todo-tasks');
    todo.innerHTML = '';
    window.tasks.forEach(t => todo.innerHTML += `<div>${t.title}</div>`);
}

export function openTaskModal(taskId = null) {
    const modal = document.getElementById('task-modal');
    modal.style.display = 'block';
}