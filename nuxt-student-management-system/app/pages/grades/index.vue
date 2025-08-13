<template>
  <div class="container mx-auto p-8 space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h2 class="text-2xl font-semibold tracking-tight">Grade Management</h2>
        <p class="text-sm text-muted-foreground">
          Manage student grades and academic assessments
        </p>
      </div>
      <button
        @click="showCreateModal = true"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Add Grade
      </button>
    </div>

    <!-- Filters Card -->
    <div class="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Course</label>
            <select
              v-model="courseFilter"
              @change="fetchGrades"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">All Courses</option>
              <option v-for="course in courses" :key="course.id" :value="course.id">
                {{ course.courseCode }} - {{ course.courseName }}
              </option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Student</label>
            <select
              v-model="studentFilter"
              @change="fetchGrades"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">All Students</option>
              <option v-for="student in students" :key="student.id" :value="student.id">
                {{ student.firstName }} {{ student.lastName }} ({{ student.studentId }})
              </option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Exam Type</label>
            <input
              v-model="examTypeFilter"
              @input="debouncedFetch"
              type="text"
              placeholder="Filter by exam type..."
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Grades Table -->
    <div class="rounded-md border">
      <div v-if="loading" class="flex items-center justify-center p-8">
        <div class="flex items-center space-x-2">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <p class="text-sm text-muted-foreground">Loading grades...</p>
        </div>
      </div>

      <div v-else-if="error" class="flex items-center justify-center p-8">
        <p class="text-sm text-destructive">{{ error }}</p>
      </div>

      <div v-else>
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Student</th>
              <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Course</th>
              <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Exam Type</th>
              <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Grade</th>
              <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
              <th class="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="grade in grades" :key="grade.id" class="border-b hover:bg-muted/50">
              <td class="p-4 align-middle">
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <span class="text-sm font-medium">
                      {{ grade.student.firstName.charAt(0) }}{{ grade.student.lastName.charAt(0) }}
                    </span>
                  </div>
                  <div class="grid gap-1">
                    <p class="text-sm font-medium leading-none">
                      {{ grade.student.firstName }} {{ grade.student.lastName }}
                    </p>
                    <p class="text-sm text-muted-foreground">{{ grade.student.studentId }}</p>
                  </div>
                </div>
              </td>
              <td class="p-4 align-middle">
                <div class="grid gap-1">
                  <p class="text-sm font-medium">{{ grade.course.courseCode }}</p>
                  <p class="text-sm text-muted-foreground">{{ grade.course.courseName }}</p>
                </div>
              </td>
              <td class="p-4 align-middle">
                <span class="text-sm">{{ grade.examType || 'N/A' }}</span>
              </td>
              <td class="p-4 align-middle">
                <div class="flex items-center gap-2">
                  <span v-if="grade.gradeValue !== null" class="text-sm font-medium">{{ grade.gradeValue }}%</span>
                  <span v-if="grade.letterGrade" class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                    :class="getGradeColor(grade.letterGrade)">
                    {{ grade.letterGrade }}
                  </span>
                </div>
                <div v-if="grade.gpaPoints" class="text-sm text-muted-foreground">
                  GPA: {{ grade.gpaPoints }}
                </div>
              </td>
              <td class="p-4 align-middle">
                <span class="text-sm text-muted-foreground">
                  {{ grade.examDate ? formatDate(grade.examDate) : 'N/A' }}
                </span>
              </td>
              <td class="p-4 align-middle text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="editGrade(grade)"
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteGrade(grade)"
                    class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 text-destructive hover:text-destructive"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Grade Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="relative bg-background border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex flex-col space-y-1.5 p-6">
          <h3 class="text-lg font-semibold leading-none tracking-tight">
            {{ showCreateModal ? 'Add New Grade' : 'Edit Grade' }}
          </h3>
          <p class="text-sm text-muted-foreground">
            {{ showCreateModal ? 'Add a new grade record for a student.' : 'Update the grade information.' }}
          </p>
        </div>
        
        <form @submit.prevent="showCreateModal ? createGrade() : updateGrade()" class="p-6 pt-0">
          <div class="grid gap-6">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Student *</label>
                <select
                  v-model="gradeForm.studentId"
                  required
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Student</option>
                  <option v-for="student in students" :key="student.id" :value="student.id">
                    {{ student.firstName }} {{ student.lastName }} ({{ student.studentId }})
                  </option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Course *</label>
                <select
                  v-model="gradeForm.courseId"
                  required
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Course</option>
                  <option v-for="course in courses" :key="course.id" :value="course.id">
                    {{ course.courseCode }} - {{ course.courseName }}
                  </option>
                </select>
              </div>
            </div>
            
            <div class="grid grid-cols-3 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Grade Value (%)</label>
                <input
                  v-model="gradeForm.gradeValue"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="85.5"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Letter Grade</label>
                <select
                  v-model="gradeForm.letterGrade"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Grade</option>
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                  <option value="B-">B-</option>
                  <option value="C+">C+</option>
                  <option value="C">C</option>
                  <option value="C-">C-</option>
                  <option value="D+">D+</option>
                  <option value="D">D</option>
                  <option value="F">F</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">GPA Points</label>
                <input
                  v-model="gradeForm.gpaPoints"
                  type="number"
                  min="0"
                  max="4"
                  step="0.1"
                  placeholder="3.7"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Exam Type</label>
                <input
                  v-model="gradeForm.examType"
                  type="text"
                  placeholder="e.g., Midterm, Final, Quiz, Assignment"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
              </div>
              <div class="space-y-2">
                <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Exam Date</label>
                <input
                  v-model="gradeForm.examDate"
                  type="date"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
              </div>
            </div>
            
            <div class="space-y-2">
              <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Notes</label>
              <textarea
                v-model="gradeForm.notes"
                rows="3"
                placeholder="Additional notes about this grade..."
                class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              ></textarea>
            </div>
          </div>
          
          <div class="flex items-center justify-end space-x-2 pt-6">
            <button
              type="button"
              @click="closeModal"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              {{ submitting ? 'Saving...' : (showCreateModal ? 'Create Grade' : 'Update Grade') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
// Page meta
definePageMeta({
  title: 'Grade Management'
})

// Data
const grades = ref([])
const students = ref([])
const courses = ref([])
const loading = ref(false)
const error = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const submitting = ref(false)
const editingGrade = ref(null)

// Filters
const courseFilter = ref('')
const studentFilter = ref('')
const examTypeFilter = ref('')

const gradeForm = ref({
  studentId: '',
  courseId: '',
  gradeValue: '',
  letterGrade: '',
  gpaPoints: '',
  examType: '',
  examDate: '',
  notes: ''
})

// Fetch data
const fetchGrades = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const token = useCookie('auth-token')
    if (!token.value) {
      await navigateTo('/auth/login')
      return
    }

    let queryString = ''
    const params = []
    if (courseFilter.value) params.push(`courseId=${courseFilter.value}`)
    if (studentFilter.value) params.push(`studentId=${studentFilter.value}`)
    if (examTypeFilter.value) params.push(`examType=${examTypeFilter.value}`)
    if (params.length > 0) queryString = '?' + params.join('&')

    const response = await $fetch(`/api/grades${queryString}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })

    if (response?.success) {
      grades.value = response.data.grades || []
    } else {
      error.value = response?.message || 'Failed to fetch grades'
    }
  } catch (err) {
    console.error('Fetch grades error:', err)
    error.value = err?.statusMessage || 'Failed to fetch grades'
    
    if (err?.statusCode === 401) {
      await navigateTo('/auth/login')
    }
  } finally {
    loading.value = false
  }
}

// Fetch students and courses for dropdowns
const fetchDropdownData = async () => {
  try {
    const token = useCookie('auth-token')
    if (!token.value) return

    const [studentsResponse, coursesResponse] = await Promise.all([
      $fetch('/api/students', { headers: { Authorization: `Bearer ${token.value}` } }),
      $fetch('/api/courses', { headers: { Authorization: `Bearer ${token.value}` } })
    ])

    if (studentsResponse?.success) {
      students.value = studentsResponse.data.students || []
    }
    if (coursesResponse?.success) {
      courses.value = coursesResponse.data.courses || []
    }
  } catch (err) {
    console.error('Fetch dropdown data error:', err)
  }
}

// Create grade
const createGrade = async () => {
  submitting.value = true
  
  try {
    const token = useCookie('auth-token')
    
    const formData = {
      ...gradeForm.value,
      studentId: parseInt(gradeForm.value.studentId),
      courseId: parseInt(gradeForm.value.courseId),
      gradeValue: gradeForm.value.gradeValue ? parseFloat(gradeForm.value.gradeValue) : null,
      gpaPoints: gradeForm.value.gpaPoints ? parseFloat(gradeForm.value.gpaPoints) : null
    }
    
    const response = await $fetch('/api/grades', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: formData
    })

    if (response?.success) {
      closeModal()
      await fetchGrades()
    } else {
      error.value = response?.message || 'Failed to create grade'
    }
  } catch (err) {
    console.error('Create grade error:', err)
    error.value = err?.statusMessage || 'Failed to create grade'
  } finally {
    submitting.value = false
  }
}

// Edit grade
const editGrade = (grade) => {
  editingGrade.value = grade
  gradeForm.value = {
    studentId: grade.student.id.toString(),
    courseId: grade.course.id.toString(),
    gradeValue: grade.gradeValue?.toString() || '',
    letterGrade: grade.letterGrade || '',
    gpaPoints: grade.gpaPoints?.toString() || '',
    examType: grade.examType || '',
    examDate: grade.examDate ? new Date(grade.examDate).toISOString().split('T')[0] : '',
    notes: grade.notes || ''
  }
  showEditModal.value = true
}

// Update grade - using fetch directly
const updateGrade = async () => {
  if (!editingGrade.value) return
  
  submitting.value = true
  
  try {
    const token = useCookie('auth-token')
    
    const formData = {
      ...gradeForm.value,
      studentId: parseInt(gradeForm.value.studentId),
      courseId: parseInt(gradeForm.value.courseId),
      gradeValue: gradeForm.value.gradeValue ? parseFloat(gradeForm.value.gradeValue) : null,
      gpaPoints: gradeForm.value.gpaPoints ? parseFloat(gradeForm.value.gpaPoints) : null
    }
    
    const response = await fetch(`/api/grades/${editingGrade.value.id}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })

    const result = await response.json()

    if (result?.success) {
      closeModal()
      await fetchGrades()
    } else {
      error.value = result?.message || 'Failed to update grade'
    }
  } catch (err) {
    console.error('Update grade error:', err)
    error.value = 'Failed to update grade'
  } finally {
    submitting.value = false
  }
}

// Delete grade - using fetch directly
const deleteGrade = async (grade) => {
  if (!confirm(`Are you sure you want to delete this grade for ${grade.student.firstName} ${grade.student.lastName}?`)) {
    return
  }
  
  try {
    const token = useCookie('auth-token')
    const response = await fetch(`/api/grades/${grade.id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token.value}`
      }
    })

    const result = await response.json()

    if (result?.success) {
      await fetchGrades()
    } else {
      error.value = result?.message || 'Failed to delete grade'
    }
  } catch (err) {
    console.error('Delete grade error:', err)
    error.value = 'Failed to delete grade'
  }
}

// Close modal
const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingGrade.value = null
  gradeForm.value = {
    studentId: '',
    courseId: '',
    gradeValue: '',
    letterGrade: '',
    gpaPoints: '',
    examType: '',
    examDate: '',
    notes: ''
  }
}

// Utility functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const getGradeColor = (letterGrade) => {
  if (['A+', 'A', 'A-'].includes(letterGrade)) return 'bg-green-100 text-green-700 border-green-200'
  if (['B+', 'B', 'B-'].includes(letterGrade)) return 'bg-blue-100 text-blue-700 border-blue-200'
  if (['C+', 'C', 'C-'].includes(letterGrade)) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  if (['D+', 'D'].includes(letterGrade)) return 'bg-orange-100 text-orange-700 border-orange-200'
  if (letterGrade === 'F') return 'bg-red-100 text-red-700 border-red-200'
  return 'bg-muted text-muted-foreground border-border'
}

// Debounced fetch for search
const debouncedFetch = (() => {
  let timeout
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(fetchGrades, 500)
  }
})()

// Load data on mount
onMounted(() => {
  fetchDropdownData()
  fetchGrades()
})
</script>
