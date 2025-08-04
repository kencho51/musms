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

    static isAuthenticated() {
        return !!this.getToken();
    }

    static async logout() {
        this.removeToken();
        window.location.href = '/';
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
}

// Check authentication on protected pages
function checkAuth() {
    const protectedPaths = ['/dashboard', '/students'];
    const currentPath = window.location.pathname;
    
    if (protectedPaths.includes(currentPath) && !Auth.isAuthenticated()) {
        window.location.href = '/login';
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    checkAuth();
    
    // Add logout functionality
    const logoutButtons = document.querySelectorAll('[data-logout]');
    logoutButtons.forEach(button => {
        button.addEventListener('click', Auth.logout);
    });
}); 