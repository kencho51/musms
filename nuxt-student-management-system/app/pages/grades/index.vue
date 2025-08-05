<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Grade Management</h1>
        <p class="text-gray-600 dark:text-gray-400">Manage student grades and academic assessments</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Add Grade
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course</label>
          <select
            v-model="courseFilter"
            @change="fetchGrades"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Courses</option>
            <option v-for="course in courses" :key="course.id" :value="course.id">
              {{ course.courseCode }} - {{ course.courseName }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student</label>
          <select
            v-model="studentFilter"
            @change="fetchGrades"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Students</option>
            <option v-for="student in students" :key="student.id" :value="student.id">
              {{ student.firstName }} {{ student.lastName }} ({{ student.studentId }})
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam Type</label>
          <input
            v-model="examTypeFilter"
            @input="debouncedFetch"
            type="text"
            placeholder="Filter by exam type..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
        </div>
      </div>
    </div>

    <!-- Grades Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Loading grades...</p>
      </div>

      <div v-else-if="error" class="p-8 text-center text-red-600 dark:text-red-400">
        {{ error }}
      </div>

      <div v-else>
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Exam Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Grade</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="grade in grades" :key="grade.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                      {{ grade.student.firstName.charAt(0) }}{{ grade.student.lastName.charAt(0) }}
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ grade.student.firstName }} {{ grade.student.lastName }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ grade.student.studentId }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">{{ grade.course.courseCode }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">{{ grade.course.courseName }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ grade.examType || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  <span v-if="grade.gradeValue !== null">{{ grade.gradeValue }}%</span>
                  <span v-if="grade.letterGrade" class="ml-2 px-2 py-1 text-xs font-semibold rounded-full"
                    :class="getGradeColor(grade.letterGrade)">
                    {{ grade.letterGrade }}
                  </span>
                </div>
                <div v-if="grade.gpaPoints" class="text-sm text-gray-500 dark:text-gray-400">
                  GPA: {{ grade.gpaPoints }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ grade.examDate ? formatDate(grade.examDate) : 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="editGrade(grade)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Edit
                </button>
                <button
                  @click="deleteGrade(grade)"
                  class="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Grade Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {{ showCreateModal ? 'Add New Grade' : 'Edit Grade' }}
        </h3>
        
        <form @submit.prevent="showCreateModal ? createGrade() : updateGrade()">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student</label>
                <select
                  v-model="gradeForm.studentId"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Student</option>
                  <option v-for="student in students" :key="student.id" :value="student.id">
                    {{ student.firstName }} {{ student.lastName }} ({{ student.studentId }})
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course</label>
                <select
                  v-model="gradeForm.courseId"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Course</option>
                  <option v-for="course in courses" :key="course.id" :value="course.id">
                    {{ course.courseCode }} - {{ course.courseName }}
                  </option>
                </select>
              </div>
            </div>
            
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grade Value (%)</label>
                <input
                  v-model="gradeForm.gradeValue"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Letter Grade</label>
                <select
                  v-model="gradeForm.letterGrade"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GPA Points</label>
                <input
                  v-model="gradeForm.gpaPoints"
                  type="number"
                  min="0"
                  max="4"
                  step="0.1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam Type</label>
                <input
                  v-model="gradeForm.examType"
                  type="text"
                  placeholder="e.g., Midterm, Final, Quiz, Assignment"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exam Date</label>
                <input
                  v-model="gradeForm.examDate"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea
                v-model="gradeForm.notes"
                rows="3"
                placeholder="Additional notes about this grade..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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
  title: 'Grade Management',
  layout: false
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
  if (['A+', 'A', 'A-'].includes(letterGrade)) return 'bg-green-100 text-green-800'
  if (['B+', 'B', 'B-'].includes(letterGrade)) return 'bg-blue-100 text-blue-800'
  if (['C+', 'C', 'C-'].includes(letterGrade)) return 'bg-yellow-100 text-yellow-800'
  if (['D+', 'D'].includes(letterGrade)) return 'bg-orange-100 text-orange-800'
  if (letterGrade === 'F') return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
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
