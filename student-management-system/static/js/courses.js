// Course management functionality
let coursesData = [];
let editingCourseId = null;
let courseModal = null;

// Load courses
async function loadCourses() {
    try {
        const response = await API.request('/api/courses');
        if (response.ok) {
            coursesData = await response.json();
            renderCoursesTable();
        }
    } catch (error) {
        showAlert('Error loading courses', 'error');
    }
}

// Render courses table
function renderCoursesTable() {
    const tbody = document.getElementById('coursesTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    coursesData.forEach(course => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${course.course_code}</strong></td>
            <td>${course.course_name}</td>
            <td>${course.instructor || 'N/A'}</td>
            <td>${course.credits}</td>
            <td>${course.semester || 'N/A'}</td>
            <td>${course.year || 'N/A'}</td>
            <td>${course.max_students}</td>
            <td>
                <div class="flex gap-2">
                    <button class="button button-sm button-outline" onclick="editCourse(${course.id})">
                        Edit
                    </button>
                    <button class="button button-sm button-secondary" onclick="viewCourseGrades(${course.id})">
                        Grades
                    </button>
                    <button class="button button-sm button-destructive" onclick="deleteCourse(${course.id})">
                        Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Open add course modal
function openAddCourseModal() {
    if (!courseModal) {
        console.error('Course modal not initialized');
        return;
    }
    
    editingCourseId = null;
    const modalTitle = document.getElementById('modalTitle');
    const courseForm = document.getElementById('courseForm');
    
    if (modalTitle) modalTitle.textContent = 'Add New Course';
    if (courseForm) courseForm.reset();
    
    courseModal.open();
}

// Edit course
function editCourse(courseId) {
    const course = coursesData.find(c => c.id === courseId);
    if (!course) return;

    editingCourseId = courseId;
    document.getElementById('modalTitle').textContent = 'Edit Course';
    
    // Fill form with course data
    document.getElementById('course_code').value = course.course_code;
    document.getElementById('course_code').disabled = true; // Don't allow editing course code
    document.getElementById('course_name').value = course.course_name;
    document.getElementById('description').value = course.description || '';
    document.getElementById('credits').value = course.credits;
    document.getElementById('instructor').value = course.instructor || '';
    document.getElementById('semester').value = course.semester || '';
    document.getElementById('year').value = course.year || '';
    document.getElementById('max_students').value = course.max_students;
    
    courseModal.open();
}

// View course grades
function viewCourseGrades(courseId) {
    const course = coursesData.find(c => c.id === courseId);
    if (!course) return;
    
    // Store course info and redirect to grades page with course filter
    sessionStorage.setItem('selectedCourse', JSON.stringify(course));
    window.location.href = `/grades?course_id=${courseId}`;
}

// Delete course
async function deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course? This will also delete all associated grades.')) return;

    try {
        const response = await API.request(`/api/courses/${courseId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlert('Course deleted successfully');
            loadCourses();
        } else {
            const result = await response.json();
            showAlert(result.detail || 'Error deleting course', 'error');
        }
    } catch (error) {
        showAlert('Network error occurred', 'error');
    }
}

// Handle course form submission
async function handleCourseForm(e) {
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

        const url = editingCourseId 
            ? `/api/courses/${editingCourseId}`
            : '/api/courses';
        
        const method = editingCourseId ? 'PUT' : 'POST';
        
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
                showAlert(errorJson.detail || 'Error saving course', 'error');
            } catch {
                showAlert(`Server error: ${response.status}`, 'error');
            }
            return;
        }

        const result = await response.json();
        console.log('Success result:', result);

        showAlert(editingCourseId ? 'Course updated successfully' : 'Course created successfully');
        if (courseModal) {
            courseModal.close();
        }
        
        // Re-enable course code field if it was disabled
        document.getElementById('course_code').disabled = false;
        
        loadCourses();
        
    } catch (error) {
        console.error('Network error:', error);
        showAlert(`Network error: ${error.message}`, 'error');
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Search courses
function searchCourses() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        renderCoursesTable();
        return;
    }

    const filteredCourses = coursesData.filter(course => 
        course.course_code.toLowerCase().includes(searchTerm) ||
        course.course_name.toLowerCase().includes(searchTerm) ||
        (course.instructor && course.instructor.toLowerCase().includes(searchTerm)) ||
        (course.description && course.description.toLowerCase().includes(searchTerm))
    );

    const tbody = document.getElementById('coursesTableBody');
    tbody.innerHTML = '';

    filteredCourses.forEach(course => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${course.course_code}</strong></td>
            <td>${course.course_name}</td>
            <td>${course.instructor || 'N/A'}</td>
            <td>${course.credits}</td>
            <td>${course.semester || 'N/A'}</td>
            <td>${course.year || 'N/A'}</td>
            <td>${course.max_students}</td>
            <td>
                <div class="flex gap-2">
                    <button class="button button-sm button-outline" onclick="editCourse(${course.id})">
                        Edit
                    </button>
                    <button class="button button-sm button-secondary" onclick="viewCourseGrades(${course.id})">
                        Grades
                    </button>
                    <button class="button button-sm button-destructive" onclick="deleteCourse(${course.id})">
                        Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Initialize courses page
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/courses') {
        // Initialize modal after DOM is ready
        courseModal = new Modal('courseModal');
        
        loadCourses();
        
        // Setup event listeners
        const courseForm = document.getElementById('courseForm');
        if (courseForm) {
            courseForm.addEventListener('submit', handleCourseForm);
        }

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', searchCourses);
        }

        // Setup cancel button
        const cancelButton = document.getElementById('cancelButton');
        if (cancelButton) {
            cancelButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Cancel button clicked');
                
                // Re-enable course code field if it was disabled
                document.getElementById('course_code').disabled = false;
                
                if (courseModal) {
                    courseModal.close();
                } else {
                    console.error('Course modal not available');
                }
            });
        }

        // Make courseModal globally accessible for debugging
        window.courseModal = courseModal;

        // Global function to close course modal
        window.closeCourseModal = function() {
            console.log('Global closeCourseModal called');
            if (window.courseModal) {
                window.courseModal.close();
            } else {
                console.error('Course modal not available globally');
            }
        };
    }
}); 