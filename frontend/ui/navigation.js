// ui/navigation.js
import { handleLogin, handleRegister, handleLogout, currentUser } from '../api/auth.js';
import { toggleAuthForms } from './authForms.js';
import { openProjectModal, openTaskModal, openDocumentModal, openInviteModal } from './modals.js';
import { closeModal } from './modals.js';
import { handleProjectSubmit } from '../api/projects.js';
import { handleTaskSubmit } from '../api/tasks.js';
import { handleDocumentSubmit } from '../api/documents.js';
import { handleInviteSubmit } from '../api/users.js';
import { filterProjects, filterTasks, filterDocuments, filterTeamMembers } from '../utils/filters.js';
import { showLoggedInState, showSection, hideAllSections, showAuthSection } from './uiHelpers.js';
import { loadDashboardData } from '../api/activities.js';
import { API_ENDPOINTS } from '../app.js';

export function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-menu li').forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            const token = localStorage.getItem('authToken');
            if (!token) {
                showAuthSection();
                return;
            }
            showSection(section);
        });
    });

    // Auth form toggling
    document.getElementById('show-register').addEventListener('click', e => { e.preventDefault(); toggleAuthForms(); });
    document.getElementById('show-login').addEventListener('click', e => { e.preventDefault(); toggleAuthForms(); });

    // Auth form submission
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
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

    // Search/filter events
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

    // Close modals
    document.querySelectorAll('.close').forEach(btn => btn.addEventListener('click', () => {
        const modal = btn.closest('.modal'); if(modal) modal.style.display = 'none';
    }));
    window.addEventListener('click', e => {
        document.querySelectorAll('.modal').forEach(modal => { if(e.target === modal) modal.style.display='none'; });
    });
}

export function showSection(sectionId) {
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