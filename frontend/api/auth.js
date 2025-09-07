import { API_ENDPOINTS } from '../app.js';
import { showAuthSection, showLoggedInState } from '../ui/navigation.js';
import { logActivity } from './activities.js';

export function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json().then(data => {
        if (!res.ok) throw new Error(data.message || 'Login failed');
        return data;
    }))
    .then(data => {
        localStorage.setItem('authToken', data.token);
        window.currentUser = data.user;
        document.getElementById('auth-section').style.display = 'none';
        showLoggedInState();
        showSection('dashboard');
        logActivity('User login', 'login');
    })
    .catch(err => alert(err.message));
}

export function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;

    fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
    })
    .then(res => res.json().then(data => {
        if (!res.ok) throw new Error(data.message || 'Registration failed');
        return data;
    }))
    .then(data => {
        localStorage.setItem('authToken', data.token);
        window.currentUser = data.user;
        document.getElementById('auth-section').style.display = 'none';
        showLoggedInState();
        showSection('dashboard');
        logActivity('User registration', 'register');
    })
    .catch(err => alert(err.message));
}

export function handleLogout() {
    fetch(API_ENDPOINTS.LOGOUT, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
    })
    .finally(() => {
        localStorage.removeItem('authToken');
        window.currentUser = null;
        showAuthSection();
    });
}

export function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const currentPath = window.location.hash.slice(1) || 'dashboard';
    if (!token) { hideAllSections(); showAuthSection(); return; }

    fetch(`${API_ENDPOINTS.USERS}/me`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : Promise.reject('Invalid token'))
        .then(userData => {
            window.currentUser = userData;
            showLoggedInState();
            showSection(currentPath);
            loadDashboardData();
        })
        .catch(err => {
            console.error('Auth validation error:', err);
            localStorage.removeItem('authToken');
            hideAllSections();
            showAuthSection();
        });
}

export function checkAuthTokenValidity() {
    const token = localStorage.getItem('authToken');
    if (!token) { showAuthSection(); return false; }
    try {
        const parts = token.split('.');
        if (parts.length !== 3) throw new Error('Invalid');
        return true;
    } catch {
        localStorage.removeItem('authToken');
        showAuthSection();
        return false;
    }
}

export function validateAndRefreshToken() {
    return new Promise((resolve, reject) => {
        const token = localStorage.getItem('authToken');
        if (!token) return reject(new Error('No token'));

        fetch(`${API_ENDPOINTS.USERS}/me`, { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.ok ? resolve(token) : fetch(`${API_ENDPOINTS.LOGIN}/refresh`, {
            method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
        }))
        .then(res => res && res.json())
        .then(data => {
            if (data?.token) {
                localStorage.setItem('authToken', data.token);
                resolve(data.token);
            }
        })
        .catch(reject);
    });
}