// Authentication and API utilities
class Auth {
    static getToken() {
        return localStorage.getItem('token');
    }

    static setToken(token) {
        localStorage.setItem('token', token);
    }

    static removeToken() {
        localStorage.removeItem('token');
    }

    static setUserInfo(userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
    }

    static getUserInfo() {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    }

    static removeUserInfo() {
        localStorage.removeItem('userInfo');
    }

    static isAuthenticated() {
        return !!this.getToken();
    }

    static isAdmin() {
        const userInfo = this.getUserInfo();
        return userInfo && userInfo.role === 'admin';
    }

    static async logout() {
        console.log('Logout initiated');
        this.removeToken();
        this.removeUserInfo();
        console.log('Tokens cleared');
        
        // Update navigation immediately before redirect
        if (typeof updateNavigation === 'function') {
            updateNavigation();
            console.log('Navigation updated');
        }
        
        // Small delay to show the navigation change, then redirect
        setTimeout(() => {
            console.log('Redirecting to home page');
            window.location.href = '/';
        }, 100);
    }
}

class API {
    static async request(url, options = {}) {
        const token = Auth.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            Auth.removeToken();
            window.location.href = '/login';
            return;
        }

        return response;
    }

    static async formRequest(url, formData) {
        const token = Auth.getToken();
        const headers = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData
        });

        if (response.status === 401) {
            Auth.removeToken();
            window.location.href = '/login';
            return;
        }

        return response;
    }
}

// Utility functions
function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
}

// Modal functionality
class Modal {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        if (!this.modal) {
            console.error(`Modal element with id '${modalId}' not found`);
            return;
        }
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (!this.modal) return;
        
        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            console.log('Modal clicked, target:', e.target, 'modal:', this.modal);
            if (e.target === this.modal) {
                console.log('Closing modal via outside click');
                this.close();
            }
        });

        // Close modal when clicking close button
        const closeButton = this.modal.querySelector('.close-button');
        if (closeButton) {
            console.log('Close button found, setting up listener');
            closeButton.addEventListener('click', (e) => {
                console.log('Close button clicked');
                e.preventDefault();
                e.stopPropagation();
                this.close();
            });
        } else {
            console.log('Close button not found in modal');
        }

        // Close modal with ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                console.log('ESC key pressed, closing modal');
                this.close();
            }
        });
    }

    open() {
        if (!this.modal) return;
        this.modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    close() {
        console.log('Modal close() called');
        if (!this.modal) {
            console.log('No modal to close');
            return;
        }
        console.log('Closing modal, adding hidden class');
        this.modal.classList.add('hidden');
        document.body.style.overflow = '';
        console.log('Modal closed successfully');
    }
}

// Form handling
function handleFormSubmit(formId, url, options = {}) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Loading...';
        submitButton.disabled = true;

        try {
            const formData = new FormData(form);
            const response = options.useFormData 
                ? await API.formRequest(url, formData)
                : await API.request(url, {
                    method: 'POST',
                    body: formData
                });

            const result = await response.json();

            if (response.ok) {
                if (options.onSuccess) {
                    options.onSuccess(result);
                } else {
                    showAlert(result.message || 'Operation successful');
                }
            } else {
                showAlert(result.detail || 'An error occurred', 'error');
            }
        } catch (error) {
            showAlert('Network error occurred', 'error');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
}

// Navigation
function updateNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname;
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
    
    // Update navigation based on authentication state and user role
    updateNavigationForAuth();
    updateNavigationForRole();
}

// Update navigation based on authentication state
function updateNavigationForAuth() {
    const isAuthenticated = Auth.isAuthenticated();
    
    // Get navigation elements
    const loginLink = document.querySelector('a[href="/login"]');
    const registerLink = document.querySelector('a[href="/register"]');
    const logoutButton = document.querySelector('[data-logout]');
    
    console.log('Updating navigation auth state:', { 
        isAuthenticated, 
        hasLoginLink: !!loginLink, 
        hasRegisterLink: !!registerLink, 
        hasLogoutButton: !!logoutButton 
    });
    
    if (isAuthenticated) {
        // User is logged in - hide login/register, show logout
        if (loginLink) loginLink.closest('li').style.display = 'none';
        if (registerLink) registerLink.closest('li').style.display = 'none';
        if (logoutButton) logoutButton.closest('li').style.display = 'block';
        console.log('Set navigation for authenticated user');
    } else {
        // User is not logged in - show login/register, hide logout
        if (loginLink) loginLink.closest('li').style.display = 'block';
        if (registerLink) registerLink.closest('li').style.display = 'block';
        if (logoutButton) logoutButton.closest('li').style.display = 'none';
        console.log('Set navigation for anonymous user');
    }
}

// Update navigation based on user role
function updateNavigationForRole() {
    if (!Auth.isAuthenticated()) return;
    
    if (Auth.isAdmin()) {
        showAdminNavigation();
    } else {
        hideAdminNavigation();
    }
}

// Show admin-specific navigation items
function showAdminNavigation() {
    // Add Users link if it doesn't exist
    const navList = document.querySelector('.nav-links');
    let usersLink = document.querySelector('.nav-link[href="/users"]');
    
    if (!usersLink && navList) {
        // Find the grades link to insert the users link after it
        const gradesLinkItem = Array.from(navList.children).find(li => 
            li.querySelector('a[href="/grades"]')
        );
        
        if (gradesLinkItem) {
            const usersLinkItem = document.createElement('li');
            usersLinkItem.innerHTML = '<a href="/users" class="nav-link">Users</a>';
            gradesLinkItem.after(usersLinkItem);
        }
    }
}

// Hide admin-specific navigation items
function hideAdminNavigation() {
    const usersLink = document.querySelector('.nav-link[href="/users"]');
    if (usersLink) {
        usersLink.closest('li').remove();
    }
}

// Check authentication on protected pages
function checkAuth() {
    const protectedPaths = ['/dashboard', '/students'];
    const adminOnlyPaths = ['/users'];
    const currentPath = window.location.pathname;
    
    if (protectedPaths.includes(currentPath) && !Auth.isAuthenticated()) {
        window.location.href = '/login';
    }
    
    if (adminOnlyPaths.includes(currentPath)) {
        if (!Auth.isAuthenticated()) {
            window.location.href = '/login';
        } else if (!Auth.isAdmin()) {
            window.location.href = '/dashboard';
        }
    }
}

// Force navigation update (can be called from anywhere)
function refreshNavigation() {
    updateNavigation();
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    checkAuth();
    
    // Add logout functionality
    const logoutButtons = document.querySelectorAll('[data-logout]');
    logoutButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logout();
        });
    });
    
    // Update navigation every 5 seconds to handle token expiration
    setInterval(updateNavigation, 5000);
}); 