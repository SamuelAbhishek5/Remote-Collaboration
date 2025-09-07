export const API_BASE_URL = 'http://localhost:5000/api';
export const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    USERS: `${API_BASE_URL}/users`,
    PROJECTS: `${API_BASE_URL}/projects`,
    TASKS: `${API_BASE_URL}/tasks`,
    DOCUMENTS: `${API_BASE_URL}/documents`,
    ACTIVITIES: `${API_BASE_URL}/activities`,
    INVITATIONS: `${API_BASE_URL}/invitations`,
    REFRESH: `${API_BASE_URL}/auth/refresh`
};

import { setupEventListeners, showSection } from './ui/navigation.js';
import { checkAuthStatus } from './api/auth.js';

window.currentUser = null;
window.projects = [];
window.tasks = [];
window.documents = [];
window.users = [];
window.activities = [];

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkAuthStatus();
    window.addEventListener('hashchange', () => {
        const currentPath = window.location.hash.slice(1) || 'dashboard';
        showSection(currentPath);
    });
});