// Student management functionality
let studentsData = [];
let editingStudentId = null;
let studentModal = null;

// Load students
async function loadStudents() {
    try {
        const response = await API.request('/api/students');
        if (response.ok) {
            studentsData = await response.json();
            renderStudentsTable();
        }
    } catch (error) {
        showAlert('Error loading students', 'error');
    }
}

// Render students table
function renderStudentsTable() {
    const tbody = document.getElementById('studentsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    studentsData.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.student_id}</td>
            <td>${student.first_name} ${student.last_name}</td>
            <td>${student.email}</td>
            <td>${student.phone || 'N/A'}</td>
            <td>${student.major || 'N/A'}</td>
            <td>${student.year_of_study || 'N/A'}</td>
            <td>
                <div class="flex gap-2">
                    <button class="button button-sm button-outline" onclick="editStudent(${student.id})">
                        Edit
                    </button>
                    <button class="button button-sm button-destructive" onclick="deleteStudent(${student.id})">
                        Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Open add student modal
function openAddStudentModal() {
    if (!studentModal) {
        console.error('Student modal not initialized');
        return;
    }
    
    editingStudentId = null;
    const modalTitle = document.getElementById('modalTitle');
    const studentForm = document.getElementById('studentForm');
    
    if (modalTitle) modalTitle.textContent = 'Add New Student';
    if (studentForm) studentForm.reset();
    
    studentModal.open();
}

// Edit student
function editStudent(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) return;

    editingStudentId = studentId;
    document.getElementById('modalTitle').textContent = 'Edit Student';
    
    // Fill form with student data
    document.getElementById('student_id').value = student.student_id;
    document.getElementById('first_name').value = student.first_name;
    document.getElementById('last_name').value = student.last_name;
    document.getElementById('email').value = student.email;
    document.getElementById('phone').value = student.phone || '';
    document.getElementById('date_of_birth').value = student.date_of_birth || '';
    document.getElementById('major').value = student.major || '';
    document.getElementById('year_of_study').value = student.year_of_study || '';
    
    studentModal.open();
}

// Delete student
async function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
        const response = await API.request(`/api/students/${studentId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlert('Student deleted successfully');
            loadStudents();
        } else {
            const result = await response.json();
            showAlert(result.detail || 'Error deleting student', 'error');
        }
    } catch (error) {
        showAlert('Network error occurred', 'error');
    }
}

// Handle student form submission
async function handleStudentForm(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Saving...';
    submitButton.disabled = true;

    try {
        // Check if user is authenticated
        const token = Auth.getToken();
        if (!token) {
            showAlert('Please log in first', 'error');
            window.location.href = '/login';
            return;
        }

        const url = editingStudentId 
            ? `/api/students/${editingStudentId}`
            : '/api/students';
        
        const method = editingStudentId ? 'PUT' : 'POST';
        
        console.log('Submitting to:', url, 'Method:', method);
        console.log('Form data:', Object.fromEntries(formData));
        
        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            try {
                const errorJson = JSON.parse(errorText);
                showAlert(errorJson.detail || 'Error saving student', 'error');
            } catch {
                showAlert(`Server error: ${response.status}`, 'error');
            }
            return;
        }

        const result = await response.json();
        console.log('Success result:', result);

        showAlert(editingStudentId ? 'Student updated successfully' : 'Student created successfully');
        if (studentModal) {
            studentModal.close();
        }
        loadStudents();
        
    } catch (error) {
        console.error('Network error:', error);
        showAlert(`Network error: ${error.message}`, 'error');
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Search students
function searchStudents() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        renderStudentsTable();
        return;
    }

    const filteredStudents = studentsData.filter(student => 
        student.first_name.toLowerCase().includes(searchTerm) ||
        student.last_name.toLowerCase().includes(searchTerm) ||
        student.student_id.toLowerCase().includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm) ||
        (student.major && student.major.toLowerCase().includes(searchTerm))
    );

    const tbody = document.getElementById('studentsTableBody');
    tbody.innerHTML = '';

    filteredStudents.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.student_id}</td>
            <td>${student.first_name} ${student.last_name}</td>
            <td>${student.email}</td>
            <td>${student.phone || 'N/A'}</td>
            <td>${student.major || 'N/A'}</td>
            <td>${student.year_of_study || 'N/A'}</td>
            <td>
                <div class="flex gap-2">
                    <button class="button button-sm button-outline" onclick="editStudent(${student.id})">
                        Edit
                    </button>
                    <button class="button button-sm button-destructive" onclick="deleteStudent(${student.id})">
                        Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Initialize students page
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/students') {
        // Initialize modal after DOM is ready
        studentModal = new Modal('studentModal');
        
        loadStudents();
        
        // Setup event listeners
        const studentForm = document.getElementById('studentForm');
        if (studentForm) {
            studentForm.addEventListener('submit', handleStudentForm);
        }

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', searchStudents);
        }

        // Setup cancel button
        const cancelButton = document.getElementById('cancelButton');
        if (cancelButton) {
            cancelButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Cancel button clicked');
                if (studentModal) {
                    studentModal.close();
                } else {
                    console.error('Student modal not available');
                }
            });
        }

        // Make studentModal globally accessible for debugging
        window.studentModal = studentModal;

        // Global function to close student modal
        window.closeStudentModal = function() {
            console.log('Global closeStudentModal called');
            if (window.studentModal) {
                window.studentModal.close();
            } else {
                console.error('Student modal not available globally');
            }
        };
    }
}); 