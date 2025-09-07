export function renderTeamMembers() {
    const container = document.getElementById('team-container');
    container.innerHTML = '';
    window.users.forEach(u => container.innerHTML += `<div>${u.name}</div>`);
}