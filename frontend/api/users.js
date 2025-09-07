import { API_ENDPOINTS } from '../app.js';
import { getAuthHeader } from '../utils/authHeader.js';
import { renderTeamMembers } from '../ui/teamUI.js';
import { logActivity } from './activities.js';

export function loadTeamMembers() {
    Promise.all([
        fetch(API_ENDPOINTS.USERS, getAuthHeader()),
        fetch(API_ENDPOINTS.PROJECTS, getAuthHeader())
    ])
    .then(responses => Promise.all(responses.map(res => res.json())))
    .then(([usersData, projectsData]) => {
        window.users = usersData;
        window.projects = projectsData;
        renderTeamMembers();
    });
}

export function handleInviteSubmit(e) {
    e.preventDefault();
    const inviteData = {
        email: document.getElementById('invite-email').value,
        role: document.getElementById('invite-role').value,
        projects: Array.from(document.getElementById('invite-projects').selectedOptions).map(opt => opt.value)
    };

    fetch(API_ENDPOINTS.INVITATIONS, {
        method: 'POST',
        headers: getAuthHeader().headers,
        body: JSON.stringify(inviteData)
    })
    .then(res => res.json())
    .then(data => {
        alert('Invitation sent successfully!');
        logActivity('Team member invited', 'user', inviteData.email);
    });
}

export async function fetchUsers() {
    const res = await fetch(API_ENDPOINTS.USERS, getAuthHeader());
    return await res.json();
}