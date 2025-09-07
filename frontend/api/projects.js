import { API_ENDPOINTS } from '../app.js';
import { getAuthHeader } from '../utils/authHeader.js';
import { renderProjects } from '../ui/projectsUI.js';
import { logActivity } from './activities.js';

export function loadProjects() {
    fetch(API_ENDPOINTS.PROJECTS, getAuthHeader())
        .then(res => res.json())
        .then(data => { window.projects = data; renderProjects(); });
}

export function handleProjectSubmit(e) {
    e.preventDefault();
    const projectData = {
        name: document.getElementById('project-name').value.trim(),
        description: document.getElementById('project-description').value.trim(),
        startDate: document.getElementById('project-start-date').value,
        endDate: document.getElementById('project-end-date').value,
        status: document.getElementById('project-status').value
    };

    const projectId = document.getElementById('project-id')?.value;
    const method = projectId ? 'PUT' : 'POST';
    const url = projectId ? `${API_ENDPOINTS.PROJECTS}/${projectId}` : API_ENDPOINTS.PROJECTS;

    fetch(url, { method, ...getAuthHeader(), body: JSON.stringify(projectData) })
    .then(res => res.json())
    .then(data => {
        if (projectId) {
            const idx = window.projects.findIndex(p => p._id === projectId);
            window.projects[idx] = data.project;
        } else {
            window.projects.push(data.project);
        }
        renderProjects();
        logActivity(projectId ? 'Project updated' : 'Project created', 'project', data.project.name);
    });
}

export function validateProjectData(data) {
    const errors = {};
    if (!data.name) errors.name = 'Project name required';
    if (!data.description) errors.description = 'Project description required';
    return errors;
}

export async function fetchProjects() {
    const res = await fetch(API_ENDPOINTS.PROJECTS, getAuthHeader());
    return await res.json();
}