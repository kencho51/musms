// Grade management functionality
let gradesData = [];
let studentsData = [];
let coursesData = [];
let editingGradeId = null;
let gradeModal = null;
let gpaModal = null;

// Load all data
async function loadAllData() {
    try {
        const [gradesResponse, studentsResponse, coursesResponse] = await Promise.all([
            API.request('/api/grades'),
            API.request('/api/students'),
            API.request('/api/courses')
        ]);

        if (gradesResponse.ok) {
            gradesData = await gradesResponse.json();
        }
        if (studentsResponse.ok) {
            studentsData = await studentsResponse.json();
        }
        if (coursesResponse.ok) {
            coursesData = await coursesResponse.json();
        }

        populateFilters();
        populateFormSelects();
        renderGradesTable();
    } catch (error) {
        showAlert('Error loading data', 'error');
    }
}

// Populate filter dropdowns
function populateFilters() {
    const studentFilter = document.getElementById('studentFilter');
    const courseFilter = document.getElementById('courseFilter');

    // Clear existing options
    studentFilter.innerHTML = '<option value="">Filter by Student</option>';
    courseFilter.innerHTML = '<option value="">Filter by Course</option>';

    // Populate student filter
    studentsData.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.first_name} ${student.last_name} (${student.student_id})`;
        studentFilter.appendChild(option);
    });

    // Populate course filter
    coursesData.forEach(course => {
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = `${course.course_code} - ${course.course_name}`;
        courseFilter.appendChild(option);
    });
}

// Populate form select dropdowns
function populateFormSelects() {
    const studentSelect = document.getElementById('student_id');
    const courseSelect = document.getElementById('course_id');

    // Clear existing options
    studentSelect.innerHTML = '<option value="">Select Student</option>';
    courseSelect.innerHTML = '<option value="">Select Course</option>';

    // Populate student select
    studentsData.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.first_name} ${student.last_name} (${student.student_id})`;
        studentSelect.appendChild(option);
    });

    // Populate course select
    coursesData.forEach(course => {
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = `${course.course_code} - ${course.course_name}`;
        courseSelect.appendChild(option);
    });
}

// Get student name by ID
function getStudentName(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : 'Unknown';
}

// Get course info by ID
function getCourseInfo(courseId) {
    const course = coursesData.find(c => c.id === courseId);
    return course ? `${course.course_code} - ${course.course_name}` : 'Unknown';
}

// Render grades table
function renderGradesTable() {
    const tbody = document.getElementById('gradesTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    let filteredGrades = [...gradesData];

    // Apply filters
    const studentFilter = document.getElementById('studentFilter').value;
    const courseFilter = document.getElementById('courseFilter').value;
    const examTypeFilter = document.getElementById('examTypeFilter').value;

    if (studentFilter) {
        filteredGrades = filteredGrades.filter(grade => grade.student_id == studentFilter);
    }
    if (courseFilter) {
        filteredGrades = filteredGrades.filter(grade => grade.course_id == courseFilter);
    }
    if (examTypeFilter) {
        filteredGrades = filteredGrades.filter(grade => grade.exam_type === examTypeFilter);
    }

    filteredGrades.forEach(grade => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong>${getStudentName(grade.student_id)}</strong>
                <br><small class="text-muted-foreground">ID: ${grade.student_id}</small>
            </td>
            <td>
                <strong>${getCourseInfo(grade.course_id)}</strong>
            </td>
            <td>${grade.exam_type || 'N/A'}</td>
            <td>${grade.grade_value !== null ? grade.grade_value : 'N/A'}</td>
            <td>
                <span class="font-semibold ${getGradeColor(grade.letter_grade)}">${grade.letter_grade || 'N/A'}</span>
            </td>
            <td>${grade.gpa_points !== null ? grade.gpa_points : 'N/A'}</td>
            <td>${formatDate(grade.exam_date)}</td>
            <td>
                <div class="flex gap-2">
                    <button class="button button-sm button-outline" onclick="editGrade(${grade.id})">
                        Edit
                    </button>
                    <button class="button button-sm button-secondary" onclick="viewStudentGPA(${grade.student_id})">
                        GPA
                    </button>
                    <button class="button button-sm button-destructive" onclick="deleteGrade(${grade.id})">
                        Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Get grade color based on letter grade
function getGradeColor(letterGrade) {
    if (!letterGrade) return '';
    if (letterGrade.startsWith('A')) return 'text-green-600';
    if (letterGrade.startsWith('B')) return 'text-blue-600';
    if (letterGrade.startsWith('C')) return 'text-yellow-600';
    if (letterGrade.startsWith('D')) return 'text-orange-600';
    if (letterGrade === 'F') return 'text-red-600';
    return '';
}

// Open add grade modal
function openAddGradeModal() {
    if (!gradeModal) {
        console.error('Grade modal not initialized');
        return;
    }
    
    editingGradeId = null;
    const modalTitle = document.getElementById('modalTitle');
    const gradeForm = document.getElementById('gradeForm');
    
    if (modalTitle) modalTitle.textContent = 'Add Grade Entry';
    if (gradeForm) gradeForm.reset();
    
    gradeModal.open();
}

// Edit grade
function editGrade(gradeId) {
    const grade = gradesData.find(g => g.id === gradeId);
    if (!grade) return;

    editingGradeId = gradeId;
    document.getElementById('modalTitle').textContent = 'Edit Grade';
    
    // Fill form with grade data
    document.getElementById('student_id').value = grade.student_id;
    document.getElementById('course_id').value = grade.course_id;
    document.getElementById('exam_type').value = grade.exam_type || '';
    document.getElementById('exam_date').value = grade.exam_date || '';
    document.getElementById('grade_value').value = grade.grade_value || '';
    document.getElementById('letter_grade').value = grade.letter_grade || '';
    document.getElementById('notes').value = grade.notes || '';
    
    gradeModal.open();
}

// View student GPA
async function viewStudentGPA(studentId) {
    try {
        const response = await API.request(`/api/students/${studentId}/gpa`);
        if (!response.ok) return;

        const gpaData = await response.json();
        const student = studentsData.find(s => s.id === studentId);
        const studentGrades = gradesData.filter(g => g.student_id === studentId);

        const gpaContent = document.getElementById('gpaContent');
        gpaContent.innerHTML = `
            <div class="mb-4">
                <h4 class="text-lg font-semibold">${student.first_name} ${student.last_name}</h4>
                <p class="text-muted-foreground">Student ID: ${student.student_id}</p>
            </div>
            
            <div class="card mb-4">
                <div class="card-content text-center">
                    <div class="text-3xl font-bold text-primary">${gpaData.gpa}</div>
                    <div class="text-sm text-muted-foreground">Current GPA</div>
                </div>
            </div>
            
            <h5 class="font-semibold mb-3">Grade History</h5>
            <div class="space-y-2">
                ${studentGrades.map(grade => `
                    <div class="flex justify-between items-center p-2 bg-muted rounded">
                        <span>${getCourseInfo(grade.course_id)}</span>
                        <span class="font-semibold ${getGradeColor(grade.letter_grade)}">${grade.letter_grade || 'N/A'}</span>
                    </div>
                `).join('')}
            </div>
        `;

        gpaModal.open();
    } catch (error) {
        showAlert('Error loading GPA data', 'error');
    }
}

// Delete grade
async function deleteGrade(gradeId) {
    if (!confirm('Are you sure you want to delete this grade entry?')) return;

    try {
        const response = await API.request(`/api/grades/${gradeId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlert('Grade deleted successfully');
            loadAllData();
        } else {
            const result = await response.json();
            showAlert(result.detail || 'Error deleting grade', 'error');
        }
    } catch (error) {
        showAlert('Network error occurred', 'error');
    }
}

// Handle grade form submission
async function handleGradeForm(e) {
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

        const url = editingGradeId 
            ? `/api/grades/${editingGradeId}`
            : '/api/grades';
        
        const method = editingGradeId ? 'PUT' : 'POST';
        
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
                showAlert(errorJson.detail || 'Error saving grade', 'error');
            } catch {
                showAlert(`Server error: ${response.status}`, 'error');
            }
            return;
        }

        const result = await response.json();
        console.log('Success result:', result);

        showAlert(editingGradeId ? 'Grade updated successfully' : 'Grade created successfully');
        if (gradeModal) {
            gradeModal.close();
        }
        
        loadAllData();
        
    } catch (error) {
        console.error('Network error:', error);
        showAlert(`Network error: ${error.message}`, 'error');
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Filter functions
function clearStudentFilter() {
    document.getElementById('studentFilter').value = '';
    renderGradesTable();
}

function clearCourseFilter() {
    document.getElementById('courseFilter').value = '';
    renderGradesTable();
}

function clearExamTypeFilter() {
    document.getElementById('examTypeFilter').value = '';
    renderGradesTable();
}

// Format date helper
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString();
    } catch {
        return 'N/A';
    }
}

// Initialize grades page
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/grades') {
        // Initialize modals after DOM is ready
        gradeModal = new Modal('gradeModal');
        gpaModal = new Modal('gpaModal');
        
        loadAllData();
        
        // Setup event listeners
        const gradeForm = document.getElementById('gradeForm');
        if (gradeForm) {
            gradeForm.addEventListener('submit', handleGradeForm);
        }

        // Setup filter listeners
        document.getElementById('studentFilter').addEventListener('change', renderGradesTable);
        document.getElementById('courseFilter').addEventListener('change', renderGradesTable);
        document.getElementById('examTypeFilter').addEventListener('change', renderGradesTable);

        // Setup cancel button
        const cancelButton = document.getElementById('cancelButton');
        if (cancelButton) {
            cancelButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Cancel button clicked');
                
                if (gradeModal) {
                    gradeModal.close();
                } else {
                    console.error('Grade modal not available');
                }
            });
        }

        // Make modals globally accessible for debugging
        window.gradeModal = gradeModal;
        window.gpaModal = gpaModal;

        // Check for URL parameters (e.g., course_id filter)
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('course_id');
        if (courseId) {
            // Wait for data to load then apply filter
            setTimeout(() => {
                document.getElementById('courseFilter').value = courseId;
                renderGradesTable();
            }, 1000);
        }
    }
}); 