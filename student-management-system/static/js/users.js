let users = [];
let currentUser = null;
let deleteUserId = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/users') {
        checkAdminAccess();
        loadUsers();
        setupEventListeners();
    }
});

// Check if current user is admin
async function checkAdminAccess() {
    try {
        const token = Auth.getToken();
        if (!token) {
            window.location.href = '/login';
            return;
        }

        // Try to fetch users to verify admin access
        const response = await API.request('/api/users', {
            method: 'GET'
        });

        if (response.status === 403) {
            alert('Admin access required');
            window.location.href = '/dashboard';
        }
    } catch (error) {
        console.error('Error checking admin access:', error);
        window.location.href = '/dashboard';
    }
}

// Set up event listeners
function setupEventListeners() {
    // Search functionality
    document.getElementById('searchUsers').addEventListener('input', handleSearch);
    
    // Modal close functionality
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModals();
        }
    });
    
    // Form submissions
    document.getElementById('addUserForm').addEventListener('submit', handleAddUser);
    document.getElementById('editUserForm').addEventListener('submit', handleEditUser);
}

// Load all users
async function loadUsers() {
    try {
        const response = await API.request('/api/users');
        if (response.ok) {
            users = await response.json();
            renderUsers(users);
        } else {
            throw new Error('Failed to load users');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showError('Failed to load users. Please try again.');
    }
}

// Render users in table
function renderUsers(usersToRender) {
    const tbody = document.getElementById('usersTableBody');
    const noUsersDiv = document.getElementById('noUsers');
    
    if (usersToRender.length === 0) {
        tbody.innerHTML = '';
        noUsersDiv.style.display = 'block';
        return;
    }
    
    noUsersDiv.style.display = 'none';
    
    tbody.innerHTML = usersToRender.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>
                <span class="badge badge-${getRoleBadgeClass(user.role)}">
                    ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
            </td>
            <td>
                <span class="badge ${user.is_active ? 'badge-green' : 'badge-red'}">
                    ${user.is_active ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>${formatDate(user.created_at)}</td>
            <td>
                <div class="flex gap-2">
                    <button class="button button-sm button-outline" onclick="openEditUserModal(${user.id})">
                        Edit
                    </button>
                    <button class="button button-sm button-destructive" onclick="openDeleteUserModal(${user.id})">
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Get role badge class
function getRoleBadgeClass(role) {
    switch (role) {
        case 'admin': return 'red';
        case 'teacher': return 'blue';
        case 'student': return 'green';
        default: return 'gray';
    }
}

// Format date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

// Handle search
function handleSearch(event) {
    const query = event.target.value.toLowerCase();
    
    if (query === '') {
        renderUsers(users);
        return;
    }
    
    const filteredUsers = users.filter(user => 
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
    );
    
    renderUsers(filteredUsers);
}

// Modal functions
function openAddUserModal() {
    document.getElementById('addUserModal').style.display = 'block';
    document.getElementById('addUserForm').reset();
}

function closeAddUserModal() {
    document.getElementById('addUserModal').style.display = 'none';
}

function openEditUserModal(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) {
        console.error('User not found:', userId);
        return;
    }
    
    currentUser = user;
    
    // Debug logging
    console.log('Opening edit modal for user:', user);
    
    // Show modal first
    document.getElementById('editUserModal').style.display = 'block';
    
    // Wait a moment for modal to be visible, then populate
    setTimeout(() => {
        // Populate form fields
        const userIdField = document.getElementById('editUserId');
        const usernameField = document.getElementById('editUsername');
        const emailField = document.getElementById('editEmail');
        const roleField = document.getElementById('editRole');
        const isActiveField = document.getElementById('editIsActive');
        const passwordField = document.getElementById('editPassword');
        
        if (userIdField) userIdField.value = user.id;
        if (usernameField) usernameField.value = user.username || '';
        if (emailField) emailField.value = user.email || '';
        if (roleField) roleField.value = user.role || 'student';
        if (isActiveField) isActiveField.value = user.is_active ? 'true' : 'false';
        if (passwordField) passwordField.value = '';
        
        // Verify the values were set
        console.log('Form populated with:', {
            id: userIdField ? userIdField.value : 'NOT FOUND',
            username: usernameField ? usernameField.value : 'NOT FOUND',
            email: emailField ? emailField.value : 'NOT FOUND',
            role: roleField ? roleField.value : 'NOT FOUND',
            is_active: isActiveField ? isActiveField.value : 'NOT FOUND'
        });
    }, 50);
}

function closeEditUserModal() {
    document.getElementById('editUserModal').style.display = 'none';
    currentUser = null;
}

function openDeleteUserModal(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    deleteUserId = userId;
    document.getElementById('deleteUserName').textContent = user.username;
    document.getElementById('deleteUserModal').style.display = 'block';
}

function closeDeleteUserModal() {
    document.getElementById('deleteUserModal').style.display = 'none';
    deleteUserId = null;
}

function closeModals() {
    closeAddUserModal();
    closeEditUserModal();
    closeDeleteUserModal();
}

// Handle add user
async function handleAddUser(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${Auth.getToken()}`
            },
            body: formData
        });
        
        // Handle authentication errors
        if (response.status === 401) {
            Auth.removeToken();
            Auth.removeUserInfo();
            window.location.href = '/login';
            return;
        }
        
        if (response.ok) {
            const newUser = await response.json();
            users.push(newUser);
            renderUsers(users);
            closeAddUserModal();
            showSuccess('User created successfully!');
        } else {
            const errorData = await response.json();
            let errorMessage = 'Failed to create user';
            
            if (errorData.detail) {
                if (Array.isArray(errorData.detail)) {
                    // Handle FastAPI validation errors
                    errorMessage = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
                } else {
                    errorMessage = errorData.detail;
                }
            }
            
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Error creating user:', error);
        showError(error.message || 'Failed to create user. Please try again.');
    }
}

// Handle edit user
async function handleEditUser(event) {
    event.preventDefault();
    
    const form = event.target;
    
    // Create FormData from the form directly
    const formData = new FormData(form);
    const userId = formData.get('userId');
    
    // Debug logging - show form data
    console.log('Form data entries:');
    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${key === 'password' && value ? '***' : value}`);
    }
    
    // Validate required fields
    const username = formData.get('username');
    const email = formData.get('email');
    const role = formData.get('role');
    
    if (!username || !username.trim()) {
        showError('Username is required');
        return;
    }
    if (!email || !email.trim()) {
        showError('Email is required');
        return;
    }
    if (!role || !role.trim()) {
        showError('Role is required');
        return;
    }
    
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${Auth.getToken()}`
            },
            body: formData // Don't set Content-Type - let browser set it for FormData
        });
        
        // Handle authentication errors
        if (response.status === 401) {
            Auth.removeToken();
            Auth.removeUserInfo();
            window.location.href = '/login';
            return;
        }
        
        if (response.ok) {
            const updatedUser = await response.json();
            const index = users.findIndex(u => u.id === parseInt(userId));
            if (index !== -1) {
                users[index] = updatedUser;
                renderUsers(users);
            }
            closeEditUserModal();
            showSuccess('User updated successfully!');
        } else {
            const errorData = await response.json();
            let errorMessage = 'Failed to update user';
            
            if (errorData.detail) {
                if (Array.isArray(errorData.detail)) {
                    // Handle FastAPI validation errors
                    errorMessage = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
                } else {
                    errorMessage = errorData.detail;
                }
            }
            
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Error updating user:', error);
        showError(error.message || 'Failed to update user. Please try again.');
    }
}

// Confirm delete user
async function confirmDeleteUser() {
    if (!deleteUserId) return;
    
    try {
        const response = await API.request(`/api/users/${deleteUserId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            users = users.filter(u => u.id !== deleteUserId);
            renderUsers(users);
            closeDeleteUserModal();
            showSuccess('User deleted successfully!');
        } else {
            const errorData = await response.json();
            let errorMessage = 'Failed to delete user';
            
            if (errorData.detail) {
                if (Array.isArray(errorData.detail)) {
                    // Handle FastAPI validation errors
                    errorMessage = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
                } else {
                    errorMessage = errorData.detail;
                }
            }
            
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showError(error.message || 'Failed to delete user. Please try again.');
    }
}

// Utility functions
function showSuccess(message) {
    // You can implement a toast notification here
    alert(message);
}

function showError(message) {
    // You can implement a toast notification here
    alert(message);
} 