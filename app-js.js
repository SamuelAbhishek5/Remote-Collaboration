// Global Variables
let currentUser = null;
let projects = [];
let tasks = [];
let documents = [];
let users = [];
let activeSection = 'auth-section';

// API URLs - Replace with your actual backend URLs when deployed on Render
const API_BASE_URL = 'https://teamcollab-api.onrender.com/api'; // Replace with your actual Render URL
const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/auth/login`,
        REGISTER: `${API_BASE_URL}/auth/register`
    },
    USERS: `${API_BASE_URL}/users`,
    PROJECTS: `${API_BASE_URL}/projects`,
    TASKS: `${API_BASE_URL}/tasks`,
    DOCUMENTS: `${API_BASE_URL}/documents`
};

// DOM Elements
const DOM = {
    sidebar: {
        menu: document.querySelector('.sidebar-menu'),
        userName: document.getElementById('current-user-name'),
        loginBtn: document.getElementById('login-btn'),
        logoutBtn: document.getElementById('logout-btn')
    },
    sections: {
        auth: document.getElementById('auth-section'),
        dashboard: document.getElementById('dashboard'),
        projects: document.getElementById('projects'),
        tasks: document.getElementById('tasks'),
        documents: document.getElementById('documents'),
        team: document.getElementById('team')
    },
    auth: {
        loginForm: document.getElementById('login-form'),
        registerForm: document.getElementById('register-form'),
        showRegisterLink: document.getElementById('show-register'),
        showLoginLink: document.getElementById('show-login')
    },
    dashboard: {
        projectsCount: document.getElementById('projects-count'),
        tasksCount: document.getElementById('tasks-count'),
        docsCount: document.getElementById('docs-count'),
        usersCount: document.getElementById('users-count'),
        recentActivities: document.getElementById('recent-activities'),
        upcomingDeadlines: document.getElementById('upcoming-deadlines')
    },
    projects: {
        container: document.getElementById('projects-container'),
        addBtn: document.getElementById('add-project-btn'),
        searchInput: document.getElementById('project-search'),
        statusFilter: document.getElementById('project-status-filter'),
        modal: document.getElementById('project-modal'),
        modalTitle: document.getElementById('project-modal-title'),
        form: document.getElementById('project-form'),
        idInput: document.getElementById('project-id'),
        nameInput: document.getElementById('project-name'),
        descriptionInput: document.getElementById('project-description'),
        startDateInput: document.getElementById('project-start-date'),
        endDateInput: document.getElementById('project-end-date'),
        statusInput: document.getElementById('project-status'),
        teamInput: document.getElementById('project-team'),
        cancelBtn: document.getElementById('cancel-project'),
        detailsModal: document.getElementById('project-details-modal'),
        detailsContent: document.getElementById('project-details-content')
    },
    tasks: {
        container: document.getElementById('tasks-container'),
        columns: {
            todo: document.getElementById('todo-tasks'),
            progress: document.getElementById('progress-tasks'),
            review: document.getElementById('review-tasks'),
            completed: document.getElementById('completed-tasks')
        },
        addBtn: document.getElementById('add-task-btn'),
        searchInput: document.getElementById('task-search'),
        projectFilter: document.getElementById('task-project-filter'),
        statusFilter: document.getElementById('task-status-filter'),
        modal: document.getElementById('task-modal'),
        modalTitle: document.getElementById('task-modal-title'),
        form: document.getElementById('task-form'),
        idInput: document.getElementById('task-id'),
        titleInput: document.getElementById('task-title'),
        descriptionInput: document.getElementById('task-description'),
        projectInput: document.getElementById('task-project'),
        dueDateInput: document.getElementById('task-due-date'),
        priorityInput: document.getElementById('task-priority'),
        statusInput: document.getElementById('task-status'),
        assigneeInput: document.getElementById('task-assignee'),
        cancelBtn: document.getElementById('cancel-task')
    },
    documents: {
        container: document.getElementById('documents-container'),
        addBtn: document.getElementById('add-document-btn'),
        searchInput: document.getElementById('document-search'),
        projectFilter: document.getElementById('document-project-filter'),
        typeFilter: document.getElementById('document-type-filter'),
        modal: document.getElementById('document-modal'),
        modalTitle: document.getElementById('document-modal-title'),
        form: document.getElementById('document-form'),
        idInput: document.getElementById('document-id'),
        titleInput: document.getElementById('document-title'),
        descriptionInput: document.getElementById('document-description'),
        projectInput: document.getElementById('document-project'),
        typeInput: document.getElementById('document-type'),
        urlInput: document.getElementById('document-url'),
        cancelBtn: document.getElementById('cancel-document')
    },
    team: {
        container: document.getElementById('team-container'),
        inviteBtn: document.getElementById('invite-team-btn'),
        searchInput: document.getElementById('team-search'),
        roleFilter: document.getElementById('team-role-filter'),
        modal: document.getElementById('invite-modal'),
        form: document.getElementById('invite-form'),
        emailInput: document.getElementById('invite-email'),
        roleInput: document.getElementById('invite-role'),
        projectsInput: document.getElementById('invite-projects'),
        cancelBtn: document.getElementById('cancel-invite'),
        detailsModal: document.getElementById('member-details-modal'),
        detailsContent: document.getElementById('member-details-content')
    },
    closeBtns: document.querySelectorAll('.close')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkAuth();
});

// Setup Event Listeners
function setupEventListeners() {
    // Sidebar menu navigation
    DOM.sidebar.menu.addEventListener('click', handleNavigation);
    
    // Authentication events
    DOM.sidebar.loginBtn.addEventListener('click', () => showSection('auth-section'));
    DOM.sidebar.logoutBtn.addEventListener('click', handleLogout);
    DOM.auth.loginForm.addEventListener('submit', handleLogin);
    DOM.auth.registerForm.addEventListener('submit', handleRegister);
    DOM.auth.showRegisterLink.addEventListener('click', toggleAuthForms);
    DOM.auth.showLoginLink.addEventListener('click', toggleAuthForms);
    
    // Projects events
    DOM.projects.addBtn.addEventListener('click', () => openProjectModal());
    DOM.projects.form.addEventListener('submit', handleProjectSubmit);
    DOM.projects.cancelBtn.addEventListener('click', () => closeModal(DOM.projects.modal));
    DOM.projects.searchInput.addEventListener('input', () => filterProjects());
    DOM.projects.statusFilter.addEventListener('change', () => filterProjects());
    
    // Tasks events
    DOM.tasks.addBtn.addEventListener('click', () => openTaskModal());
    DOM.tasks.form.addEventListener('submit', handleTaskSubmit);
    DOM.tasks.cancelBtn.addEventListener('click', () => closeModal(DOM.tasks.modal));
    DOM.tasks.searchInput.addEventListener('input', () => filterTasks());
    DOM.tasks.projectFilter.addEventListener('change', () => filterTasks());
    DOM.tasks.statusFilter.addEventListener('change', () => filterTasks());
    
    // Documents events
    DOM.documents.addBtn.addEventListener('click', () => openDocumentModal());
    DOM.documents.form.addEventListener('submit', handleDocumentSubmit);
    DOM.documents.cancelBtn.addEventListener('click', () => closeModal(DOM.documents.modal));
    DOM.documents.searchInput.addEventListener('input', () => filterDocuments());
    DOM.documents.projectFilter.addEventListener('change', () => filterDocuments());
    DOM.documents.typeFilter.addEventListener('change', () => filterDocuments());
    
    // Team events
    DOM.team.inviteBtn.addEventListener('click', () => openInviteModal());
    DOM.team.form.addEventListener('submit', handleInviteSubmit);
    DOM.team.cancelBtn.addEventListener('click', () => closeModal(DOM.team.modal));
    DOM.team.searchInput.addEventListener('input', () => filterTeamMembers());
    DOM.team.roleFilter.addEventListener('change', () => filterTeamMembers());
    
    // Close modal buttons
    DOM.closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
}

// Authentication Functions
function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        // Validate token and get user data
        fetch(API_ENDPOINTS.AUTH.LOGIN, {
            method: 'GET',
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
        .then(data => {
            setCurrentUser(data.user);
            showSection('dashboard');
            loadDashboardData();
        })
        .catch(error => {
            console.error('Auth error:', error);
            localStorage.removeItem('token');
            showSection('auth-section');
        });
    } else {
        showSection('auth-section');
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = DOM.auth.loginForm.querySelector('#login-email').value;
    const password = DOM.auth.loginForm.querySelector('#login-password').value;
    
    // For demo purposes, using mock data
    if (isDemoMode()) {
        // Mock login for demo
        const mockUser = {
            _id: 'user1',
            name: 'Demo User',
            email: email,
            role: 'project-manager'
        };
        
        setCurrentUser(mockUser);
        localStorage.setItem('token', 'demo-token');
        showSection('dashboard');
        loadDashboardData();
        DOM.auth.loginForm.reset();
        return;
    }
    
    // Real API call for login
    fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Login failed');
        }
    })
    .then(data => {
        setCurrentUser(data.user);
        localStorage.setItem('token', data.token);
        showSection('dashboard');
        loadDashboardData();
        DOM.auth.loginForm.reset();
    })
    .catch(error => {
        console.error('Login error:', error);
        alert('Login failed. Please check your credentials.');
    });
}

function handleRegister(e) {
    e.preventDefault();
    
    const name = DOM.auth.registerForm.querySelector('#register-name').value;
    const email = DOM.auth.registerForm.querySelector('#register-email').value;
    const password = DOM.auth.registerForm.querySelector('#register-password').value;
    const role = DOM.auth.registerForm.querySelector('#register-role').value;
    
    // For demo purposes, using mock data
    if (isDemoMode()) {
        // Mock registration for demo
        const mockUser = {
            _id: 'user1',
            name: name,
            email: email,
            role: role
        };
        
        setCurrentUser(mockUser);
        localStorage.setItem('token', 'demo-token');
        showSection('dashboard');
        loadDashboardData();
        DOM.auth.registerForm.reset();
        return;
    }
    
    // Real API call for registration
    fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password, role })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Registration failed');
        }
    })
    .then(data => {
        setCurrentUser(data.user);
        localStorage.setItem('token', data.token);
        showSection('dashboard');
        loadDashboardData();
        DOM.auth.registerForm.reset();
    })
    .catch(error => {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    });
}

function handleLogout() {
    localStorage.removeItem('token');
    currentUser = null;
    
    // Update UI
    DOM.sidebar.userName.textContent = 'Not logged in';
    DOM.sidebar.loginBtn.style.display = 'block';
    DOM.sidebar.logoutBtn.style.display = 'none';
    
    showSection('auth-section');
}

function setCurrentUser(user) {
    currentUser = user;
    
    // Update UI
    DOM.sidebar.userName.textContent = user.name;
    DOM.sidebar.loginBtn.style.display = 'none';
    DOM.sidebar.logoutBtn.style.display = 'block';
}

// Navigation Functions
function handleNavigation(e) {
    const target = e.target.closest('li');
    if (target) {
        const section = target.dataset.section;
        
        // Only proceed if user is authenticated
        if (!currentUser && section !== 'auth-section') {
            showSection('auth-section');
            return;
        }
        
        // Update active menu item
        DOM.sidebar.menu.querySelectorAll('li').forEach(item => {
            item.classList.remove('active');
        });
        target.classList.add('active');
        
        // Show selected section
        showSection(section);
        
        // Load section data
        switch (section) {
            case 'dashboard':
                loadDashboardData();
                break;
            case 'projects':
                loadProjects();
                break;
            case 'tasks':
                loadTasks();
                break;
            case 'documents':
                loadDocuments();
                break;
            case 'team':
                loadTeamMembers();
                break;
        }
    }
}

function showSection(sectionId) {
    // Hide all sections
    Object.values(DOM.sections).forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    DOM.sections[sectionId].style.display = 'block';
    activeSection = sectionId;
}

// Toggle between login and register forms
function toggleAuthForms(e) {
    e.preventDefault();
    const authForms = document.querySelectorAll('.auth-form');
    authForms.forEach(form => {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });
}

// Dashboard Functions
function loadDashboardData() {
    // If demo mode, load mock data
    if (isDemoMode()) {
        loadMockData();
        updateDashboard();
        return;
    }
    
    // Load actual data from API
    Promise.all([
        fetch(API_ENDPOINTS.PROJECTS, getAuthHeader()),
        fetch(API_ENDPOINTS.TASKS, getAuthHeader()),
        fetch(API_ENDPOINTS.DOCUMENTS, getAuthHeader()),
        fetch(API_ENDPOINTS.USERS, getAuthHeader())
    ])
    .then(responses => {
        if (responses.some(res => !res.ok)) {
            throw new Error('Failed to fetch data');
        }
        return Promise.all(responses.map(res => res.json()));
    })
    .then(([projectsData, tasksData, documentsData, usersData]) => {
        projects = projectsData;
        tasks = tasksData;
        documents = documentsData;
        users = usersData;
        
        updateDashboard();
    })
    .catch(error => {
        console.error('Error loading dashboard data:', error);
        alert('Failed to load dashboard data. Please try again.');
    });
}

function updateDashboard() {
    // Update stats
    DOM.dashboard.projectsCount.textContent = projects.length;
    DOM.dashboard.tasksCount.textContent = tasks.length;
    DOM.dashboard.docsCount.textContent = documents.length;
    DOM.dashboard.usersCount.textContent = users.length;
    
    // Recent activities (using tasks as activities for simplicity)
    const recentActivities = tasks
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5);
    
    DOM.dashboard.recentActivities.innerHTML = '';
    
    if (recentActivities.length > 0) {
        recentActivities.forEach(activity => {
            const activityProject = projects.find(p => p._id === activity.projectId);
            const activityUser = users.find(u => u._id === activity.assigneeId);
            
            DOM.dashboard.recentActivities.innerHTML += `
                <div class="activity-item">
                    <div class="activity-icon" style="background-color: var(--primary-color);">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <div class="activity-content">
                        <p>${activityUser ? activityUser.name : 'Someone'} ${getActivityAction(activity.status)} task "${activity.title}"</p>
                        <p class="activity-time">${formatDate(activity.updatedAt)}</p>
                    </div>
                </div>
            `;
        });
    } else {
        DOM.dashboard.recentActivities.innerHTML = '<p>No recent activities</p>';
    }
    
    // Upcoming deadlines
    const upcomingDeadlines = tasks
        .filter(task => new Date(task.dueDate) > new Date() && task.status !== 'completed')
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5);
    
    DOM.dashboard.upcomingDeadlines.innerHTML = '';
    
    if (upcomingDeadlines.length > 0) {
        upcomingDeadlines.forEach(deadline => {
            const deadlineProject = projects.find(p => p._id === deadline.projectId);
            
            DOM.dashboard.upcomingDeadlines.innerHTML += `
                <div class="deadline-item">
                    <div class="deadline-icon" style="background-color: ${getPriorityColor(deadline.priority)};">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <div class="deadline-content">
                        <p>${deadline.title}</p>
                        <p class="deadline-date">Due on ${formatDate(deadline.dueDate)}</p>
                    </div>
                </div>
            `;
        });
    } else {
        DOM.dashboard.upcomingDeadlines.innerHTML = '<p>No upcoming deadlines</p>';
    }
}

// Projects Functions
function loadProjects() {
    // If demo mode, use mock data
    if (isDemoMode()) {
        renderProjects(projects);
        return;
    }
    
    // Load actual data from API
    fetch(API_ENDPOINTS.PROJECTS, getAuthHeader())
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to fetch projects');
            }
        })
        .then(data => {
            projects = data;
            renderProjects(projects);
        })
        .catch(error => {
            console.error('Error loading projects:', error);
            alert('Failed to load projects. Please try again.');
        });
}

function renderProjects(projectsToRender) {
    DOM.projects.container.innerHTML = '';
    
    if (projectsToRender.length > 0) {
        projectsToRender.forEach(project => {
            const projectTeamMembers = users.filter(user => 
                project.teamMembers.includes(user._id)
            );
            
            const progressPercentage = calculateProjectProgress(project._id);
            
            DOM.projects.container.innerHTML += `
                <div class="project-card" data-id="${project._id}">
                    <div class="project-header">
                        <h3 class="project-title">${project.name}</h3>
                        <span class="project-status status-${project.status}">${formatStatus(project.status)}</span>
                    </div>
                    <div class="project-content">
                        <p class="project-description">${project.description}</p>
                        <div class="project-info">
                            <div class="project-info-item">
                                <i class="fas fa-calendar-alt"></i>
                                <span>${formatDate(project.startDate)} - ${formatDate(project.endDate)}</span>
                            </div>
                            <div class="project-info-item">
                                <i class="fas fa-tasks"></i>
                                <span>Progress: ${progressPercentage}%</span>
                            </div>
                        </div>
                        <div class="project-team">
                            <div class="team-label">Team Members:</div>
                            <div class="team-avatars">
                                ${renderTeamAvatars(projectTeamMembers, 4)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        // Add click event to project cards
        const projectCards = DOM.projects.container.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.addEventListener('click', () => {
                const projectId = card.dataset.id;
                openProjectDetails(projectId);
            });
        });
    } else {
        DOM.projects.container.innerHTML = '<p>No projects found</p>';
    }
    
    // Populate project team select options
    populateTeamSelect(DOM.projects.teamInput);
}

function openProjectModal(projectId = null) {
    const isEdit = projectId !== null;
    DOM.projects.modalTitle.textContent = isEdit ? 'Edit Project' : 'Add New Project';
    
    // Reset form
    DOM.projects.form.reset();
    DOM.projects.idInput.value = '';
    
    // Populate team select options
    populateTeamSelect(DOM.projects.teamInput);
    
    if (isEdit) {
        const project = projects.find(p => p._id === projectId);
        if (project) {
            DOM.projects.idInput.value = project._id;
            DOM.projects.nameInput.value = project.name;
            DOM.projects.descriptionInput.value = project.description;
            DOM.projects.startDateInput.value = formatDateForInput(project.startDate);
            DOM.projects.endDateInput.value = formatDateForInput(project.endDate);
            DOM.projects.statusInput.value = project.status;
            
            // Select team members
            const teamSelect = DOM.projects.teamInput;
            for (let i = 0; i < teamSelect.options.length; i++) {
                teamSelect.options[i].selected = project.teamMembers.includes(teamSelect.options[i].value);
            }
        }
    } else {
        // Set default values for new project
        DOM.projects.startDateInput.value = formatDateForInput(new Date());
        
        // Set end date to one month from now
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        DOM.projects.endDateInput.value = formatDateForInput(endDate);
    }
    
    // Show modal
    DOM.projects.modal.style.display = 'block';
}

function handleProjectSubmit(e) {
    e.preventDefault();
    
    const projectData = {
        name: DOM.projects.nameInput.value,
        description: DOM.projects.descriptionInput.value,
        startDate: DOM.projects.startDateInput.value,
        endDate: DOM.projects.endDateInput.value,
        status: DOM.projects.statusInput.value,
        teamMembers: Array.from(DOM.projects.teamInput.selectedOptions).map(option => option.value)
    };
    
    const projectId = DOM.projects.idInput.value;
    const isEdit = projectId !== '';
    
    // If demo mode, update mock data
    if (isDemoMode()) {
        if (isEdit) {
            const index = projects.findIndex(p => p._id === projectId);
            if (index !== -1) {
                projects[index] = {
                    ...projects[index],
                    ...projectData,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            const newProject = {
                _id: 'proj_' + Date.now(),
                ...projectData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            projects.push(newProject);
        }
        
        closeModal(DOM.projects.modal);
        renderProjects(projects);
        updateDashboard();
        return;
    }
    
    // API request
    const url = isEdit ? `${API_ENDPOINTS.PROJECTS}/${projectId}` : API_ENDPOINTS.PROJECTS;
    const method = isEdit ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(projectData)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to save project');
        }
    })
    .then(data => {
        if (isEdit) {
            const index = projects.findIndex(p => p._id === projectId);
            if (index !== -1) {
                projects[index] = data;
            }
        } else {
            projects.push(data);
        }
        
        closeModal(DOM.projects.modal);
        renderProjects(projects);
        updateDashboard();
    })
    .catch(error => {
        console.error('Error saving project:', error);
        alert('Failed to save project. Please try again.');
    });
}

function openProjectDetails(projectId) {
    const project = projects.find(p => p._id === projectId);
    if (!project) return;
    
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
    const progressPercentage = projectTasks.length > 0 
        ? Math.round((completedTasks / projectTasks.length) * 100) 
        : 0;
    
    const projectTeamMembers = users.filter(user => 
        project.teamMembers.includes(user._id)
    );
    
    DOM.projects.detailsContent.innerHTML = `
        <div class="details-header">
            <h2>${project.name}</h2>
            <span class="status status-${project.status}">${formatStatus(project.status)}</span>
        </div>
        
        <div class="details-info">
            <div class="details-info-item">
                <div class="details-info-label">Description:</div>
                <div>${project.description}</div>
            </div>
            <div class="details-info-item">
                <div class="details-info-label">Timeline:</div>
                <div>${formatDate(project.startDate)} to ${formatDate(project.endDate)}</div>
            </div>
            <div class="details-info-item">
                <div class="details-info-label">Progress:</div>
                <div>${progressPercentage}% (${completedTasks} of ${projectTasks.length} tasks completed)</div>
            </div>
        </div>
        
        <div class="details-section">
            <h3>Team Members</h3>
            <div class="team-grid">
                ${projectTeamMembers.map(member => `
                    <div class="member-card">
                        <div class="member-avatar">
                            <div class="member-avatar-icon">
                                <i class="fas fa-user"></i>
                            </div>
                        </div>
                        <div class="member-content">
                            <h4 class="member-name">${member.name}</h4>
                            <div class="member-role">
                                <i class="fas fa-user-tag"></i>
                                ${formatRole(member.role)}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="details-section">
            <h3>Tasks (${projectTasks.length})</h3>
            ${projectTasks.length > 0 ? `
                <div class="task-list" style="max-height: 300px; overflow-y: auto;">
                    ${projectTasks.map(task => `
                        <div class="task-card">
                            <div class="task-header">
                                <h4 class="task-title">${task.title}</h4>
                                <span class="task-priority priority-${task.priority}">${formatPriority(task.priority)}</span>
                            </div>
                            <p class="task-description">${task.description}</p>
                            <div class="task-meta">
                                <div class="task-due">
                                    <i class="fas fa-calendar-alt"></i>
                                    ${formatDate(task.dueDate)}
                                </div>
                                <div class="task-status">
                                    ${formatStatus(task.status)}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '<p>No tasks for this project</p>'}
        </div>
        
        <div class="details-actions">
            <button class="btn primary-btn" onclick="openProjectModal('${project._id}')">
                <i class="fas fa-edit"></i> Edit Project
            </button>
            <button class="btn danger-btn" onclick="deleteProject('${project._id}')">
                <i class="fas fa-trash-alt"></i> Delete Project
            </button>
        </div>
    `;
    
    // Show modal
    DOM.projects.detailsModal.style.display = 'block';
}

function deleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project?')) {
        // If demo mode, update mock data
        if (isDemoMode()) {
            projects = projects.filter(p => p._id !== projectId);
            closeModal(DOM.projects.detailsModal);
            renderProjects(projects);
            updateDashboard();
            return;
        }

        // API request to delete project
        fetch(`${API_ENDPOINTS.PROJECTS}/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            if (response.ok) {
                projects = projects.filter(p => p._id !== projectId);
                closeModal(DOM.projects.detailsModal);
                renderProjects(projects);
                updateDashboard();
            } else {
                throw new Error('Failed to delete project');
            }
        })
        .catch(error => {
            console.error('Error deleting project:', error);
            alert('Failed to delete project. Please try again.');
        });
    }
}
// Utility Functions

function isDemoMode() {
    // Set true if demo mode; false if working with real API
    return false; // Change to true to use mock/demo data
}

function getAuthHeader() {
    return {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    };
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateForInput(dateStr) {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
}

function formatStatus(status) {
    return status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatPriority(priority) {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function formatRole(role) {
    return role.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getPriorityColor(priority) {
    switch (priority) {
        case 'low': return 'var(--info-color)';
        case 'medium': return 'var(--warning-color)';
        case 'high': return 'var(--danger-color)';
        default: return 'var(--secondary-color)';
    }
}

function calculateProjectProgress(projectId) {
    const projTasks = tasks.filter(t => t.projectId === projectId);
    if (projTasks.length === 0) return 0;
    const completed = projTasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / projTasks.length) * 100);
}

function renderTeamAvatars(members, max = 4) {
    return members.slice(0, max).map(m =>
        `<div class="team-avatar" title="${m.name}">${m.name.charAt(0).toUpperCase()}</div>`
    ).join('') +
    (members.length > max ? `<div class="team-avatar team-more">+${members.length - max}</div>` : '');
}

function closeModal(modal) {
    if (modal) modal.style.display = 'none';
}

function populateTeamSelect(selectEl) {
    if (!users || !Array.isArray(users)) return;
    selectEl.innerHTML = '';
    users.forEach(user => {
        const opt = document.createElement('option');
        opt.value = user._id;
        opt.textContent = user.name;
        selectEl.appendChild(opt);
    });
}

function populateProjectSelect(selectEl) {
    if (!projects || !Array.isArray(projects)) return;
    selectEl.innerHTML = '';
    projects.forEach(project => {
        const opt = document.createElement('option');
        opt.value = project._id;
        opt.textContent = project.name;
        selectEl.appendChild(opt);
    });
}