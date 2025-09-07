import { API_ENDPOINTS } from '../app.js';
import { getAuthHeader } from '../utils/authHeader.js';

export function loadDashboardData() {
    Promise.all([
        fetch(`${API_ENDPOINTS.PROJECTS}/count`, getAuthHeader()),
        fetch(`${API_ENDPOINTS.TASKS}/count`, getAuthHeader()),
        fetch(`${API_ENDPOINTS.DOCUMENTS}/count`, getAuthHeader()),
        fetch(`${API_ENDPOINTS.USERS}/count`, getAuthHeader()),
        fetch(`${API_ENDPOINTS.ACTIVITIES}/recent`, getAuthHeader()),
        fetch(`${API_ENDPOINTS.TASKS}/upcoming-deadlines`, getAuthHeader())
    ])
    .then(responses => Promise.all(responses.map(res => res.json())))
    .then(([projectsCount, tasksCount, docsCount, usersCount, recentActivities, upcomingDeadlines]) => {
        document.getElementById('projects-count').textContent = projectsCount.count;
        document.getElementById('tasks-count').textContent = tasksCount.count;
        document.getElementById('docs-count').textContent = docsCount.count;
        document.getElementById('users-count').textContent = usersCount.count;

        window.activities = recentActivities;
    });
}

export function logActivity(description, type, target = '') {
    const activity = {
        description,
        type,
        target,
        timestamp: new Date().toISOString(),
        userId: window.currentUser._id
    };

    fetch(API_ENDPOINTS.ACTIVITIES, {
        method: 'POST',
        headers: getAuthHeader().headers,
        body: JSON.stringify(activity)
    })
    .then(res => res.json())
    .then(data => window.activities.unshift(data));
}