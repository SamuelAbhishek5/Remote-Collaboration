// TeamCollab2 - Remote Team Collaboration App
// JavaScript functionality for the frontend
// Connects to MongoDB via a backend API

// Global variables
let currentUser = null;
let projects = [];
let tasks = [];
let documents = [];
let users = [];
let activities = [];

// API endpoints - replace with your actual backend URLs
const API_BASE_URL = 'http://localhost:5000/api';
const API_ENDPOINTS = {
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
//document.getElementById("project-modal").style.display = "flex";
// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in (from session/localStorage)  // Setup event listeners
    setupEventListeners();
    checkAuthStatus();
    // Handle browser navigation
    window.addEventListener('hashchange', () => {
        const currentPath = window.location.hash.slice(1) || 'dashboard';
        showSection(currentPath);
    });  
});

// Setup all event listeners
function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            
            // Check authentication before showing section
            const token = localStorage.getItem('authToken');
            if (!token) {
                showAuthSection();
                return;
            }
            
            showSection(section);
        });
    });

    // Auth form toggling
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthForms();
    });
    
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthForms();
    });
    

    // Login form submission
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Register form submission
    document.getElementById('register-form').addEventListener('submit', handleRegister);

    // Logout button
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // Project modal events
    document.getElementById('add-project-btn').addEventListener('click', () => openProjectModal());
    document.getElementById('cancel-project').addEventListener('click', () => closeModal('project-modal'));
    document.getElementById('project-form').addEventListener('submit', handleProjectSubmit);

    // Task modal events
    document.getElementById('add-task-btn').addEventListener('click', () => openTaskModal());
    document.getElementById('cancel-task').addEventListener('click', () => closeModal('task-modal'));
    document.getElementById('task-form').addEventListener('submit', handleTaskSubmit);

    // Document modal events
    document.getElementById('add-document-btn').addEventListener('click', () => openDocumentModal());
    document.getElementById('cancel-document').addEventListener('click', () => closeModal('document-modal'));
    document.getElementById('document-form').addEventListener('submit', handleDocumentSubmit);

    // Team modal events
    document.getElementById('invite-team-btn').addEventListener('click', () => openInviteModal());
    document.getElementById('cancel-invite').addEventListener('click', () => closeModal('invite-modal'));
    document.getElementById('invite-form').addEventListener('submit', handleInviteSubmit);

    // Search and filter events
    document.getElementById('project-search').addEventListener('input', filterProjects);
    document.getElementById('project-status-filter').addEventListener('change', filterProjects);
    
    document.getElementById('task-search').addEventListener('input', filterTasks);
    document.getElementById('task-project-filter').addEventListener('change', filterTasks);
    document.getElementById('task-status-filter').addEventListener('change', filterTasks);
    
    document.getElementById('document-search').addEventListener('input', filterDocuments);
    document.getElementById('document-project-filter').addEventListener('change', filterDocuments);
    document.getElementById('document-type-filter').addEventListener('change', filterDocuments);
    
    document.getElementById('team-search').addEventListener('input', filterTeamMembers);
    document.getElementById('team-role-filter').addEventListener('change', filterTeamMembers);

    // Close modals with X button
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modal = closeBtn.closest('.modal');
            if (modal) modal.style.display = 'none';
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}
// Check authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const currentPath = window.location.hash.slice(1) || 'dashboard';

    // If no token, show auth section and hide all other sections
    if (!token) {
        hideAllSections();
        showAuthSection();
        return;
    }

    // Validate token with backend
    fetch(`${API_ENDPOINTS.USERS}/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Invalid token');
        }
    })
    .then(userData => {
        currentUser = userData;
        showLoggedInState();
        showSection(currentPath);
        loadDashboardData();
    })
    .catch(error => {
        console.error('Auth validation error:', error);
        localStorage.removeItem('authToken');
        hideAllSections();
        showAuthSection();
    });
}
// Hide all content sections
function hideAllSections() {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
}


// Add this to the beginning of any function that makes API calls
function checkAuthTokenValidity() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        showAuthSection();
        return false;
    }
    
    // Verify token format
    try {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) throw new Error('Invalid token format');
        return true;
    } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem('authToken');
        showAuthSection();
        return false;
    }
}
// Toggle between login and register forms
function toggleAuthForms() {
    const authForms = document.querySelectorAll('.auth-form');
    authForms.forEach(form => {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });
}
// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        return response.json().then(data => {
            if (response.ok) {
                return data;
            } else {
                throw new Error(data.message || 'Login failed');
            }
        });
    })
    .then(data => {
        // Store auth token
        localStorage.setItem('authToken', data.token);
        currentUser = data.user;
        
        // Hide auth section
        document.getElementById('auth-section').style.display = 'none';
        
        // Update UI and show dashboard
        showLoggedInState();
        showSection('dashboard');
        loadDashboardData();
        
        // Log activity
        logActivity('User login', 'login');
    })
    .catch(error => {
        console.error('Login error:', error);
        alert(error.message || 'Login failed. Please check your credentials.');
    });
}

// Handle register form submission
function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;
    
    // Basic validation
    if (!name || !email || !password || !role) {
        alert('Please fill in all fields');
        return;
    }
    
    fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, role })
    })
    .then(response => {
        return response.json().then(data => {
            if (response.ok) {
                return data;
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        });
    })
    .then(data => {
        // Store auth token
        localStorage.setItem('authToken', data.token);
        currentUser = data.user;
        
        // Hide auth section
        document.getElementById('auth-section').style.display = 'none';
        
        // Update UI and show dashboard
        showLoggedInState();
        showSection('dashboard');
        loadDashboardData();
        
        // Log activity
        logActivity('User registration', 'register');
    })
    .catch(error => {
        console.error('Registration error:', error);
        alert(error.message || 'Registration failed. Please try again.');
    });
}

// Handle logout
function handleLogout() {
    // Call logout endpoint to invalidate token on server
    fetch(API_ENDPOINTS.LOGOUT, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
    .then(() => {
        // Clear local storage and session data
        localStorage.removeItem('authToken');
        currentUser = null;
        
        // Reset UI
        document.getElementById('current-user-name').textContent = 'Not logged in';
        document.getElementById('login-btn').style.display = 'block';
        document.getElementById('logout-btn').style.display = 'none';
        
        showAuthSection();
    })
    .catch(error => {
        console.error('Logout error:', error);
    });
}

// UI STATE MANAGEMENT

// Show the auth section
function showAuthSection() {
    hideAllSections();
    document.getElementById('auth-section').style.display = 'flex';
    document.getElementById('login-form-container').style.display = 'block';
    document.getElementById('register-form-container').style.display = 'none';
    
    // Clear any stored auth data
    localStorage.removeItem('authToken');
    currentUser = null;
    
    // Update UI elements
    document.getElementById('current-user-name').textContent = 'Not logged in';
    document.getElementById('login-btn').style.display = 'block';
    document.getElementById('logout-btn').style.display = 'none';
}


// Show logged in state
function showLoggedInState() {
    if (!currentUser) {
        showAuthSection();
        return;
    }
    
    // Update user info
    document.getElementById('current-user-name').textContent = currentUser.name;
    document.getElementById('login-btn').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'block';
}

// Show specific section
function showSection(sectionId) {
    const token = localStorage.getItem('authToken');
    
    // If no token, redirect to auth section
    if (!token) {
        showAuthSection();
        return;
    }
    
    // List of protected sections
    const protectedSections = ['dashboard', 'projects', 'tasks', 'documents', 'team'];
    
    // If trying to access protected section without auth, show auth section
    if (protectedSections.includes(sectionId) && !currentUser) {
        showAuthSection();
        return;
    }

    // Hide all sections - UNCOMMENT THIS LINE
    hideAllSections();
    
    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.style.display = 'block';
        
        // Update active state in sidebar
        document.querySelectorAll('.sidebar-menu li').forEach(li => {
            li.classList.remove('active');
            if (li.getAttribute('data-section') === sectionId) {
                li.classList.add('active');
            }
        });
        
        // Load section data if needed
        if (sectionId === 'dashboard') loadDashboardData();
        else if (sectionId === 'projects') loadProjects();
        else if (sectionId === 'tasks') loadTasks();
        else if (sectionId === 'documents') loadDocuments();
        else if (sectionId === 'team') loadTeamMembers();
    }
}

// DATA LOADING FUNCTIONS

// Load dashboard data
function loadDashboardData() {
    // Get counts and summaries
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
        // Update stats
        document.getElementById('projects-count').textContent = projectsCount.count;
        document.getElementById('tasks-count').textContent = tasksCount.count;
        document.getElementById('docs-count').textContent = docsCount.count;
        document.getElementById('users-count').textContent = usersCount.count;
        
        // Update activities
        activities = recentActivities;
        renderActivities();
        
        // Update deadlines
        renderDeadlines(upcomingDeadlines);
    })
    .catch(error => {
        console.error('Error loading dashboard data:', error);
    });
}

// Load projects data
function loadProjects() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        showAuthSection();
        return;
    }
    fetch(API_ENDPOINTS.PROJECTS, getAuthHeader())
        .then(response => response.json())
        .then(data => {
            projects = data;
            renderProjects();
            //updateProjectDropdowns();
        })
        .catch(error => {
            console.error('Error loading projects:', error);
        });
}

// Load tasks data
function loadTasks() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        showAuthSection();
        return;
    }
    Promise.all([
        fetch(API_ENDPOINTS.TASKS, getAuthHeader()),
        fetch(API_ENDPOINTS.PROJECTS, getAuthHeader())
    ])
    .then(responses => Promise.all(responses.map(res => res.json())))
    .then(([tasksData, projectsData]) => {
        tasks = tasksData;
        projects = projectsData;
        
        renderTasks();
        updateProjectDropdowns();
        updateTaskProjectFilter();
    })
    .catch(error => {
        console.error('Error loading tasks data:', error);
    });
}

// Load documents data
function loadDocuments() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        showAuthSection();
        return;
    }
    Promise.all([
        fetch(API_ENDPOINTS.DOCUMENTS, getAuthHeader()),
        fetch(API_ENDPOINTS.PROJECTS, getAuthHeader())
    ])
    .then(responses => Promise.all(responses.map(res => res.json())))
    .then(([documentsData, projectsData]) => {
        documents = documentsData;
        projects = projectsData;
        
        renderDocuments();
        updateProjectDropdowns();
        updateDocumentProjectFilter();
    })
    .catch(error => {
        console.error('Error loading documents data:', error);
    });
}

// Load team members data
function loadTeamMembers() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        showAuthSection();
        return;
    }
    Promise.all([
        fetch(API_ENDPOINTS.USERS, getAuthHeader()),
        fetch(API_ENDPOINTS.PROJECTS, getAuthHeader())
    ])
    .then(responses => Promise.all(responses.map(res => res.json())))
    .then(([usersData, projectsData]) => {
        users = usersData;
        projects = projectsData;
        
        renderTeamMembers();
        updateProjectDropdowns();
    })
    .catch(error => {
        console.error('Error loading team data:', error);
    });
}

// RENDERING FUNCTIONS

// Render recent activities
function renderActivities() {
    const container = document.getElementById('recent-activities');
    container.innerHTML = '';
    
    if (activities.length === 0) {
        container.innerHTML = '<p>No recent activities.</p>';
        return;
    }
    
    activities.forEach(activity => {
        const activityElement = document.createElement('div');
        activityElement.className = 'activity-item';
        
        // Set icon background based on activity type
        let iconClass = 'fas fa-info-circle';
        let iconBg = 'var(--info-color)';
        
        switch(activity.type) {
            case 'project':
                iconClass = 'fas fa-project-diagram';
                iconBg = 'var(--primary-color)';
                break;
            case 'task':
                iconClass = 'fas fa-tasks';
                iconBg = 'var(--warning-color)';
                break;
            case 'document':
                iconClass = 'fas fa-file-alt';
                iconBg = 'var(--success-color)';
                break;
            case 'user':
                iconClass = 'fas fa-user';
                iconBg = 'var(--secondary-color)';
                break;
        }
        
        activityElement.innerHTML = `
            <div class="activity-icon" style="background-color: ${iconBg};">
                <i class="${iconClass}"></i>
            </div>
            <div class="activity-content">
                <p>${activity.description}</p>
                <span class="activity-time">${formatTimeAgo(new Date(activity.timestamp))}</span>
            </div>
        `;
        
        container.appendChild(activityElement);
    });
}

// Render upcoming deadlines
function renderDeadlines(deadlines) {
    const container = document.getElementById('upcoming-deadlines');
    container.innerHTML = '';
    
    if (deadlines.length === 0) {
        container.innerHTML = '<p>No upcoming deadlines.</p>';
        return;
    }
    
    deadlines.forEach(deadline => {
        const daysRemaining = calculateDaysRemaining(new Date(deadline.dueDate));
        let iconBg = 'var(--info-color)'; // Default blue
        
        // Change color based on urgency
        if (daysRemaining <= 1) {
            iconBg = 'var(--danger-color)'; // Red for urgent
        } else if (daysRemaining <= 3) {
            iconBg = 'var(--warning-color)'; // Yellow for approaching
        }
        
        const deadlineElement = document.createElement('div');
        deadlineElement.className = 'deadline-item';
        deadlineElement.innerHTML = `
            <div class="deadline-icon" style="background-color: ${iconBg};">
                <i class="fas fa-calendar-day"></i>
            </div>
            <div class="deadline-content">
                <p>${deadline.title}</p>
                <span class="deadline-date">${formatDate(new Date(deadline.dueDate))} (${daysRemaining} days remaining)</span>
            </div>
        `;
        
        container.appendChild(deadlineElement);
    });
}

// Render projects
function renderProjects() {
    const container = document.getElementById('projects-container');
    container.innerHTML = '';
    
    if (projects.length === 0) {
        container.innerHTML = '<p>No projects found. Create your first project!</p>';
        return;
    }
    
    projects.forEach(project => {
        const projectElement = document.createElement('div');
        projectElement.className = 'project-card';
        projectElement.setAttribute('data-id', project._id);
        projectElement.onclick = () => openProjectDetails(project._id);
        
        // Calculate progress percentage
        const startDate = new Date(project.startDate);
        const endDate = new Date(project.endDate);
        const currentDate = new Date();
        const totalDuration = endDate - startDate;
        const elapsed = currentDate - startDate;
        const progress = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
        
        // Format team members display
        const teamAvatars = project.team.slice(0, 3).map(member => {
            const initials = member.name.split(' ').map(n => n[0]).join('');
            return `<div class="team-avatar">${initials}</div>`;
        }).join('');
        
        const moreMembers = project.team.length > 3 ? 
            `<div class="team-avatar team-more">+${project.team.length - 3}</div>` : '';
        
        projectElement.innerHTML = `
            <div class="project-header">
                <div class="project-title">${project.name}</div>
                <div class="project-status status-${project.status}">${formatStatus(project.status)}</div>
            </div>
            <div class="project-content">
                <div class="project-description">${project.description}</div>
                <div class="project-info">
                    <div class="project-info-item">
                        <i class="fas fa-calendar-alt"></i>
                        ${formatDate(startDate)} - ${formatDate(endDate)}
                    </div>
                    <div class="project-info-item">
                        <i class="fas fa-tasks"></i>
                        ${project.tasksCount || 0} Tasks
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${progress}%;"></div>
                </div>
                <div class="project-team">
                    <div class="team-label">Team</div>
                    <div class="team-avatars">
                        ${teamAvatars}
                        ${moreMembers}
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(projectElement);
    });
}

// Render tasks (Kanban board)
function renderTasks() {
    // Clear all task columns
    document.getElementById('todo-tasks').innerHTML = '';
    document.getElementById('progress-tasks').innerHTML = '';
    document.getElementById('review-tasks').innerHTML = '';
    document.getElementById('completed-tasks').innerHTML = '';
    
    if (tasks.length === 0) {
        const columns = ['todo-tasks', 'progress-tasks', 'review-tasks', 'completed-tasks'];
        columns.forEach(col => {
            document.getElementById(col).innerHTML = '<p class="empty-column">No tasks</p>';
        });
        return;
    }
    
    // Group tasks by status
    const tasksByStatus = {
        'todo': [],
        'in-progress': [],
        'review': [],
        'completed': []
    };
    
    tasks.forEach(task => {
        if (tasksByStatus[task.status]) {
            tasksByStatus[task.status].push(task);
        }
    });
    
    // Render each task in its appropriate column
    Object.keys(tasksByStatus).forEach(status => {
        const columnId = status === 'in-progress' ? 'progress-tasks' : `${status}-tasks`;
        const column = document.getElementById(columnId);
        
        tasksByStatus[status].forEach(task => {
            const taskProject = projects.find(p => p._id === task.projectId);
            const assignee = users.find(u => u._id === task.assigneeId);
            
            const taskElement = document.createElement('div');
            taskElement.className = 'task-card';
            taskElement.setAttribute('data-id', task._id);
            taskElement.setAttribute('draggable', 'true');
            taskElement.addEventListener('dragstart', handleDragStart);
            
            // Get initials for assignee avatar
            let assigneeInitials = '';
            if (assignee) {
                assigneeInitials = assignee.name.split(' ').map(n => n[0]).join('');
            }
            
            taskElement.innerHTML = `
                <div class="task-header">
                    <span class="task-priority priority-${task.priority}">${formatPriority(task.priority)}</span>
                    <span class="task-project"><i class="fas fa-project-diagram"></i> ${taskProject ? taskProject.name : 'N/A'}</span>
                </div>
                <h3 class="task-title">${task.title}</h3>
                <div class="task-description">${task.description}</div>
                <div class="task-meta">
                    <span class="task-due"><i class="fas fa-calendar-day"></i> ${formatDate(new Date(task.dueDate))}</span>
                </div>
                <div class="task-assignee">
                    <div class="assignee-avatar">${assigneeInitials}</div>
                    <span class="assignee-name">${assignee ? assignee.name : 'Unassigned'}</span>
                </div>
            `;
            
            column.appendChild(taskElement);
        });
        
        // If no tasks in this column
        if (tasksByStatus[status].length === 0) {
            column.innerHTML = '<p class="empty-column">No tasks</p>';
        }
    });
    
    // Setup drop zones for drag and drop
    setupDropZones();
}

// Render documents
function renderDocuments() {
    const container = document.getElementById('documents-container');
    container.innerHTML = '';
    
    if (documents.length === 0) {
        container.innerHTML = '<p>No documents found. Add your first document!</p>';
        return;
    }
    
    documents.forEach(doc => {
        const projectName = projects.find(p => p._id === doc.projectId)?.name || 'N/A';
        
        // Determine icon based on document type
        let icon = 'fas fa-file-alt';
        switch(doc.type) {
            case 'documentation':
                icon = 'fas fa-file-code';
                break;
            case 'report':
                icon = 'fas fa-file-chart-line';
                break;
            case 'design':
                icon = 'fas fa-file-image';
                break;
        }
        
        const documentElement = document.createElement('div');
        documentElement.className = 'document-card';
        documentElement.innerHTML = `
            <div class="document-icon">
                <i class="${icon}"></i>
            </div>
            <div class="document-content">
                <h3 class="document-title">${doc.title}</h3>
                <div class="document-description">${doc.description}</div>
                <div class="document-meta">
                    <span class="document-type"><i class="fas fa-file-alt"></i> ${formatDocType(doc.type)}</span>
                    <span class="document-project"><i class="fas fa-project-diagram"></i> ${projectName}</span>
                </div>
                <div class="document-actions">
                    <a href="${doc.url}" target="_blank"><i class="fas fa-external-link-alt"></i> Open</a>
                    <a href="#" class="edit-document" data-id="${doc._id}"><i class="fas fa-edit"></i> Edit</a>
                </div>
            </div>
        `;
        
        container.appendChild(documentElement);
        
        // Add event listener for edit button
        documentElement.querySelector('.edit-document').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openDocumentModal(doc._id);
        });
    });
}

// Render team members
function renderTeamMembers() {
    const container = document.getElementById('team-container');
    container.innerHTML = '';
    
    if (users.length === 0) {
        container.innerHTML = '<p>No team members found. Invite your first team member!</p>';
        return;
    }
    
    users.forEach(user => {
        // Get user's projects
        const userProjects = projects.filter(p => 
            p.team.some(member => member._id === user._id)
        );
        
        // Format project badges
        const projectBadges = userProjects.slice(0, 3).map(p => 
            `<div class="member-project-item">${p.name}</div>`
        ).join('');
        
        const moreProjects = userProjects.length > 3 ? 
            `<div class="member-project-item">+${userProjects.length - 3} more</div>` : '';
        
        // Get initials for avatar
        const initials = user.name.split(' ').map(n => n[0]).join('');
        
        const memberElement = document.createElement('div');
        memberElement.className = 'member-card';
        memberElement.setAttribute('data-id', user._id);
        memberElement.onclick = () => openMemberDetails(user._id);
        
        memberElement.innerHTML = `
            <div class="member-avatar">
                <div class="member-avatar-icon">${initials}</div>
            </div>
            <div class="member-content">
                <h3 class="member-name">${user.name}</h3>
                <div class="member-role"><i class="fas fa-briefcase"></i> ${formatRole(user.role)}</div>
                <div class="member-info">
                    <div class="member-info-item">
                        <i class="fas fa-envelope"></i> ${user.email}
                    </div>
                    <div class="member-info-item">
                        <i class="fas fa-project-diagram"></i> ${userProjects.length} Projects
                    </div>
                    <div class="member-info-item">
                        <i class="fas fa-tasks"></i> ${user.tasksCount || 0} Tasks Assigned
                    </div>
                </div>
                <div class="member-projects">
                    <div class="projects-label">Projects</div>
                    <div class="member-project-list">
                        ${projectBadges}
                        ${moreProjects}
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(memberElement);
    });
}

// MODAL HANDLING FUNCTIONS

// Open project modal (create or edit)
function openProjectModal(projectId = null) {
    const modal = document.getElementById('project-modal');
    const form = document.getElementById('project-form');
    const modalTitle = document.getElementById('project-modal-title');

    // Reset form
    form.reset();

    // Handle edit vs create mode
    if (projectId) {
        // Edit mode - fetch existing project data
        fetch(`${API_ENDPOINTS.PROJECTS}/${projectId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(project => {
            modalTitle.textContent = 'Edit Project';
            // Populate form with project data matching the schema
            //document.getElementById('project-id').value = project._id;
            document.getElementById('project-name').value = project.name;
            document.getElementById('project-description').value = project.description;
            document.getElementById('project-start-date').value = formatDateForInput(new Date(project.startDate));
            document.getElementById('project-end-date').value = formatDateForInput(new Date(project.endDate));
            document.getElementById('project-status').value = project.status;
            document.getElementById('project-owner').value = project.owner;
            // Note: owner field is not editable in the form since it's set on creation
        })
        .catch(err => console.error('Error fetching project:', err));
    } else {
        // Create mode
        modalTitle.textContent = 'Create New Project';
        document.getElementById('project-id').value = '';
        
        // Set default dates
        // Populate project owner dropdown with users
        fetch(`${API_ENDPOINTS.USERS}/names`, getAuthHeader())
            .then(response => response.json())
            .then(users => {
                const ownerSelect = document.getElementById('project-owner');
                ownerSelect.innerHTML = '';
                users.forEach(user => {
                    const option = document.createElement('option');
                    option.value = user._id;
                    option.textContent = user.name;
                    ownerSelect.appendChild(option);
                });
                // Set current user as default owner
                if (currentUser) {
                    ownerSelect.value = currentUser._id;
                }
            })
            .catch(error => {
                console.error('Error loading users:', error);
                // Add a default option if users can't be loaded
                const option = document.createElement('option');
                option.value = currentUser._id;
                option.textContent = currentUser.name;
                document.getElementById('project-owner').appendChild(option);
            });
        
        const today = new Date();
        document.getElementById('project-start-date').value = formatDateForInput(today);
        document.getElementById('project-end-date').value = formatDateForInput(new Date(today.setMonth(today.getMonth() + 1)));
    }


    modal.style.display = 'block';
}

// Format date for input fields (YYYY-MM-DD format)
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
// Open task modal (create or edit)
function openTaskModal(taskId = null) {
    const modal = document.getElementById('task-modal');
    /**
     * A reference to the HTML element with the ID 'task-modal-title'.
     * Typically used to manipulate or retrieve the title of a modal dialog.
     * 
     * @type {HTMLElement | null}
     */
    const modalTitle = document.getElementById('task-modal-title');
    const form = document.getElementById('task-form');
    
    // Reset form
    form.reset();
    
    // Populate project dropdown
    populateProjectDropdown('task-project');
    
    // Populate assignee dropdown
    populateTeamMembersDropdown('task-assignee', false);
    
    if (taskId) {
        // Edit existing task
        const task = tasks.find(t => t._id === taskId);
        if (!task) return;
        
        modalTitle.textContent = 'Edit Task';
        document.getElementById('task-id').value = task._id;
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description;
        document.getElementById('task-due-date').value = formatDateForInput(new Date(task.dueDate));
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-status').value = task.status;
        document.getElementById('task-project').value = task.projectId;
        document.getElementById('task-assignee').value = task.assigneeId || '';
    } else {
        // Create new task
        modalTitle.textContent = 'Add New Task';
        document.getElementById('task-id').value = '';
        
        // Set default due date to today + 1 week
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        document.getElementById('task-due-date').value = formatDateForInput(nextWeek);
    }
    
    // Show modal
    modal.style.display = 'block';
}
// UTILITY FUNCTIONS

// Format date to readable string
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format time ago (for activities)
function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (let [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
        }
    }
    return 'Just now';
}

// Format status for display
function formatStatus(status) {
    return status.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Format document type for display
function formatDocType(type) {
    return type.charAt(0).toUpperCase() + type.slice(1);
}

// Calculate days remaining until deadline
function calculateDaysRemaining(dueDate) {
    const today = new Date();
    const diffTime = dueDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Get authorization header
function getAuthHeader() {
    return {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    };
}

// MODAL FUNCTIONS

// Open document modal
function openDocumentModal(docId = null) {
    const modal = document.getElementById('document-modal');
    const modalTitle = document.getElementById('document-modal-title');
    const form = document.getElementById('document-form');
    
    if (docId) {
        const doc = documents.find(d => d._id === docId);
        if (doc) {
            modalTitle.textContent = 'Edit Document';
            form.elements['document-id'].value = doc._id;
            form.elements['document-title'].value = doc.title;
            form.elements['document-description'].value = doc.description;
            form.elements['document-project'].value = doc.projectId;
            form.elements['document-type'].value = doc.type;
        }
    } else {
        modalTitle.textContent = 'Add New Document';
        form.reset();
        form.elements['document-id'].value = '';
    }
    
    modal.style.display = 'block';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// FILTERING FUNCTIONS

// Filter projects
function filterProjects() {
    const searchTerm = document.getElementById('project-search').value.toLowerCase();
    const statusFilter = document.getElementById('project-status-filter').value;
    
    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm) ||
                            project.description.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    renderProjects(filteredProjects);
}

// Filter tasks
function filterTasks() {
    const searchTerm = document.getElementById('task-search').value.toLowerCase();
    const projectFilter = document.getElementById('task-project-filter').value;
    const statusFilter = document.getElementById('task-status-filter').value;
    
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm) ||
                            task.description.toLowerCase().includes(searchTerm);
        const matchesProject = projectFilter === 'all' || task.projectId === projectFilter;
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        
        return matchesSearch && matchesProject && matchesStatus;
    });
    
    renderTasks(filteredTasks);
}

// Filter documents
function filterDocuments() {
    const searchTerm = document.getElementById('document-search').value.toLowerCase();
    const projectFilter = document.getElementById('document-project-filter').value;
    const typeFilter = document.getElementById('document-type-filter').value;
    
    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm) ||
                            doc.description.toLowerCase().includes(searchTerm);
        const matchesProject = projectFilter === 'all' || doc.projectId === projectFilter;
        const matchesType = typeFilter === 'all' || doc.type === typeFilter;
        
        return matchesSearch && matchesProject && matchesType;
    });
    
    renderDocuments(filteredDocs);
}

// Filter team members
function filterTeamMembers() {
    const searchTerm = document.getElementById('team-search').value.toLowerCase();
    const roleFilter = document.getElementById('team-role-filter').value;
    
    const filteredMembers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm) ||
                            user.email.toLowerCase().includes(searchTerm);
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        
        return matchesSearch && matchesRole;
    });
    
    renderTeamMembers(filteredMembers);
}

// FORM HANDLING FUNCTIONS

function handleProjectSubmit(e) {
    e.preventDefault();
    
    // Get the auth token
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Authentication required. Please log in.');
        showAuthSection();
        return;
    }

    try {
        // Get and validate form data
        const projectData = {
            name: document.getElementById('project-name').value.trim(),
            description: document.getElementById('project-description').value.trim(),
            startDate: document.getElementById('project-start-date').value,
            endDate: document.getElementById('project-end-date').value,
            status: document.getElementById('project-status').value
        };

        // Client-side validation
        const validationErrors = validateProjectData(projectData);
        if (Object.keys(validationErrors).length > 0) {
            const errorMessage = Object.values(validationErrors).join('\n');
            alert(errorMessage);
            return;
        }

        // Get project ID if editing existing project
        const projectId = document.getElementById('project-id')?.value;
        
        const method = projectId ? 'PUT' : 'POST';
        const url = projectId ? 
            `${API_ENDPOINTS.PROJECTS}/${projectId}` : 
            API_ENDPOINTS.PROJECTS;

        // Show loading state
        const submitButton = document.querySelector('#project-form button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Saving...';
        submitButton.disabled = true;

        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(projectData)
        })
        .then(async response => {
            const data = await response.json();
            
            if (!response.ok) {
                // Handle specific error cases
                if (response.status === 401) {
                    throw new Error('token-invalid');
                }
                throw new Error(data.message || 'Failed to save project');
            }
            
            return data;
        })
        .then(data => {
            if (data.success) {
                if (projectId) {
                    const index = projects.findIndex(p => p._id === projectId);
                    if (index !== -1) projects[index] = data.project;
                } else {
                    projects.push(data.project);
                }
                
                closeModal('project-modal');
                renderProjects();
                
                // Log activity
                logActivity(
                    projectId ? 'Project updated' : 'Project created',
                    'project',
                    data.project.name
                );

                // Show success message
                alert(`Project successfully ${projectId ? 'updated' : 'created'}!`);
            } else {
                throw new Error(data.message || 'Failed to save project');
            }
        })
        .catch(error => {
            console.error('Project save error:', error);
            
            if (error.message === 'token-invalid') {
                localStorage.removeItem('authToken');
                currentUser = null;
                showAuthSection();
                alert('Your session has expired. Please log in again.');
            } else {
                alert(`Failed to ${projectId ? 'update' : 'create'} project: ${error.message}`);
            }
        })
        .finally(() => {
            // Reset button state
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        });

    } catch (error) {
        console.error('Form handling error:', error);
        alert('An error occurred while processing the form. Please try again.');
    }
}

// Add this validation function
function validateProjectData(data) {
    const errors = {};

    // Name validation
    if (!data.name) {
        errors.name = 'Project name is required';
    } else if (data.name.length < 3) {
        errors.name = 'Project name must be at least 3 characters long';
    }

    // Description validation
    if (!data.description) {
        errors.description = 'Project description is required';
    } else if (data.description.length < 10) {
        errors.description = 'Project description must be at least 10 characters long';
    }

    // Date validation
    if (!data.startDate) {
        errors.startDate = 'Start date is required';
    }
    if (!data.endDate) {
        errors.endDate = 'End date is required';
    }

    if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        
        if (isNaN(start.getTime())) {
            errors.startDate = 'Invalid start date';
        }
        if (isNaN(end.getTime())) {
            errors.endDate = 'Invalid end date';
        }
        if (end < start) {
            errors.endDate = 'End date must be after start date';
        }
    }

    // Status validation
    const validStatuses = ['Not Started', 'In Progress', 'Completed', 'On Hold'];
    if (!validStatuses.includes(data.status)) {
        errors.status = 'Invalid project status';
    }

    return errors;
}
// Add this new token validation function
function validateAndRefreshToken() {
    return new Promise((resolve, reject) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            reject(new Error('No token found'));
            return;
        }

        // First try to validate the current token
        fetch(`${API_ENDPOINTS.USERS}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.ok) {
                resolve(token); // Current token is valid
            } else if (response.status === 401) {
                // Token is invalid/expired, try to refresh it
                return fetch(`${API_ENDPOINTS.LOGIN}/refresh`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                throw new Error('Token validation failed');
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Token refresh failed');
            }
            return response.json();
        })
        .then(data => {
            // Store new token and resolve with it
            localStorage.setItem('authToken', data.token);
            resolve(data.token);
        })
        .catch(error => {
            console.error('Token validation error:', error);
            reject(error);
        });
    });
}

// Update getAuthHeader function to include content type
function getAuthHeader() {
    const token = localStorage.getItem('authToken');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };
}
//Handle task form submission
function handleTaskSubmit(e) {
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
    const url = taskData.id ? 
        `${API_ENDPOINTS.TASKS}/${taskData.id}` : 
        API_ENDPOINTS.TASKS;
    
    fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(taskData)
    })
    .then(response => {
        if (response.ok) return response.json();
        throw new Error('Task save failed');
    })
    .then(data => {
        if (taskData.id) {
            const index = tasks.findIndex(t => t._id === taskData.id);
            if (index !== -1) tasks[index] = data;
        } else {
            tasks.push(data);
        }
        
        closeModal('task-modal');
        renderTasks();
        
        // Log activity
        logActivity(
            taskData.id ? 'Task updated' : 'Task created',
            'task',
            data.title
        );
    })
    .catch(error => {
        console.error('Task save error:', error);
        alert('Failed to save task. Please try again.');
    });
}

// Handle document form submission
function handleDocumentSubmit(e) {
    e.preventDefault();
    
    const documentData = {
        id: document.getElementById('document-id').value,
        title: document.getElementById('document-title').value,
        description: document.getElementById('document-description').value,
        projectId: document.getElementById('document-project').value,
        type: document.getElementById('document-type').value
    };
    
    const method = documentData.id ? 'PUT' : 'POST';
    const url = documentData.id ? 
        `${API_ENDPOINTS.DOCUMENTS}/${documentData.id}` : 
        API_ENDPOINTS.DOCUMENTS;
    
    fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(documentData)
    })
    .then(response => {
        if (response.ok) return response.json();
        throw new Error('Document save failed');
    })
    .then(data => {
        if (documentData.id) {
            const index = documents.findIndex(d => d._id === documentData.id);
            if (index !== -1) documents[index] = data;
        } else {
            documents.push(data);
        }
        
        closeModal('document-modal');
        renderDocuments();
        
        // Log activity
        logActivity(
            documentData.id ? 'Document updated' : 'Document created',
            'document',
            data.title
        );
    })
    .catch(error => {
        console.error('Document save error:', error);
        alert('Failed to save document. Please try again.');
    });
}

// Handle team member invitation
function handleInviteSubmit(e) {
    e.preventDefault();
    
    const inviteData = {
        email: document.getElementById('invite-email').value,
        role: document.getElementById('invite-role').value,
        projects: Array.from(document.getElementById('invite-projects').selectedOptions).map(opt => opt.value)
    };
    
    fetch(API_ENDPOINTS.INVITATIONS, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(inviteData)
    })
    .then(response => {
        if (response.ok) return response.json();
        throw new Error('Invitation failed');
    })
    .then(data => {
        closeModal('invite-modal');
        alert('Invitation sent successfully!');
        
        // Log activity
        logActivity(
            'Team member invited',
            'user',
            inviteData.email
        );
    })
    .catch(error => {
        console.error('Invitation error:', error);
        alert('Failed to send invitation. Please try again.');
    });
}

// Log activity
function logActivity(description, type, target = '') {
    const activity = {
        description,
        type,
        target,
        timestamp: new Date().toISOString(),
        userId: currentUser._id
    };
    
    fetch(API_ENDPOINTS.ACTIVITIES, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(activity)
    })
    .then(response => {
        if (response.ok) return response.json();
        throw new Error('Activity logging failed');
    })
    .then(data => {
        activities.unshift(data);
        renderActivities();
    })
    .catch(error => {
        console.error('Activity logging error:', error);
    });
}

// Update dropdowns with project options
function updateProjectDropdowns() {
    const dropdowns = [
        'task-project',
        'document-project',
        'invite-projects'
    ];
    
    const options = projects.map(project => 
        `<option value="${project._id}">${project.name}</option>`
    ).join('');
    
    dropdowns.forEach(id => {
        const dropdown = document.getElementById(id);
        if (dropdown) {
            const currentValue = dropdown.value;
            dropdown.innerHTML = '<option value="all">All Projects</option>' + options;
            if (currentValue && currentValue !== 'all') {
                dropdown.value = currentValue;
            }
        }
    });
}
async function fetchProjects() {
    try {
        const response = await fetch(`${API_BASE_URL}/projects`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const projects = await response.json();
        const projectSelect = document.getElementById('taskProject');
        projectSelect.innerHTML = '<option value="">Select Project</option>';
        projects.forEach(project => {
            projectSelect.innerHTML += `<option value="${project._id}">${project.name}</option>`;
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
}

// Fetch all users
async function fetchUsers() {
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const users = await response.json();
        const assigneeSelect = document.getElementById('taskAssignee');
        assigneeSelect.innerHTML = '<option value="">Select Assignee</option>';
        users.forEach(user => {
            assigneeSelect.innerHTML += `<option value="${user._id}">${user.name}</option>`;
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Fetch all tasks
async function fetchTasks() {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const tasks = await response.json();
        const taskSelect = document.getElementById('documentTask');
        taskSelect.innerHTML = '<option value="">Select Task</option>';
        tasks.forEach(task => {
            taskSelect.innerHTML += `<option value="${task._id}">${task.title}</option>`;
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}