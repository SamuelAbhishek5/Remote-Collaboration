export function renderActivities() {
    const container = document.getElementById('recent-activities');
    container.innerHTML = '';
    if (!window.activities.length) { container.innerHTML = '<p>No recent activities.</p>'; return; }

    window.activities.forEach(activity => {
        const div = document.createElement('div');
        div.textContent = `${activity.description} - ${activity.type}`;
        container.appendChild(div);
    });
}

export function renderDeadlines(deadlines) {
    const container = document.getElementById('upcoming-deadlines');
    container.innerHTML = '';
    deadlines.forEach(d => container.innerHTML += `<div>${d.title} - ${d.dueDate}</div>`);
}