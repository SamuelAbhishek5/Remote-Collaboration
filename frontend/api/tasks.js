import { API_ENDPOINTS } from '../app.js';
import { getAuthHeader } from '../utils/authHeader.js';
import { renderTasks } from '../ui/tasksUI.js';
import { logActivity } from './activities.js';

export function loadTasks() {
    Promise.all([
        fetch(API_ENDPOINTS.TASKS, getAuthHeader()),
        fetch(API_ENDPOINTS.PROJECTS, getAuthHeader())
    ])
    .then(responses => Promise.all(responses.map(res => res.json())))
    .then(([tasksData, projectsData]) => {
        window.tasks = tasksData;
        window.projects = projectsData;
        renderTasks();
    });
}

export function handleTaskSubmit(e) {
    e.preventDefault();
    const taskData = {
        id: document.getElementById('task-id').value,
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-description').value,
        projectId: document.getElementById('task-project').value,
        dueDate: document.getElementById('task-due-date').value,
        priority: document.getElementById('task-priority').value,
        status: document.getElementById('task-status').value,
        assigneeId: document.getElementById('task-assignee').value
    };

    const method = taskData.id ? 'PUT' : 'POST';
    const url = taskData.id ? `${API_ENDPOINTS.TASKS}/${taskData.id}` : API_ENDPOINTS.TASKS;

    fetch(url, {
        method,
        headers: getAuthHeader().headers,
        body: JSON.stringify(taskData)
    })
    .then(res => res.json())
    .then(data => {
        if (taskData.id) {
            const idx = window.tasks.findIndex(t => t._id === taskData.id);
            window.tasks[idx] = data;
        } else {
            window.tasks.push(data);
        }
        renderTasks();
        logActivity(taskData.id ? 'Task updated' : 'Task created', 'task', data.title);
    });
}

export async function fetchTasks() {
    const res = await fetch(API_ENDPOINTS.TASKS, getAuthHeader());
    return await res.json();
}