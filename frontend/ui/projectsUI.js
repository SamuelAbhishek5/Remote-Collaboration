export function renderProjects() {
    const container = document.getElementById('projects-container');
    container.innerHTML = '';
    window.projects.forEach(p => container.innerHTML += `<div>${p.name}</div>`);
}

export function openProjectModal(projectId = null) {
    const modal = document.getElementById('project-modal');
    modal.style.display = 'block';
}