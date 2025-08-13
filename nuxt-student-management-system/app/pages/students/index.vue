<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Student Management</h1>
        <p class="text-gray-600 dark:text-gray-400">Manage student records and academic information</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Add Student
      </button>
    </div>

    <!-- Students Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Loading students...</p>
      </div>

      <div v-else-if="error" class="p-8 text-center text-red-600 dark:text-red-400">
        {{ error }}
      </div>

      <div v-else>
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Student ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Major</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="student in students" :key="student.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-medium">
                      {{ (student.firstName).charAt(0).toUpperCase() }}{{ (student.lastName).charAt(0).toUpperCase() }}
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ student.firstName }} {{ student.lastName }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ student.email }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ student.phone || 'No phone' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ student.studentId }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ student.major || 'Not specified' }}
                <div v-if="student.yearOfStudy" class="text-xs text-gray-500 dark:text-gray-400">
                  Year {{ student.yearOfStudy }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': student.status === 'ACTIVE',
                    'bg-yellow-100 text-yellow-800': student.status === 'INACTIVE',
                    'bg-blue-100 text-blue-800': student.status === 'GRADUATED',
                    'bg-red-100 text-red-800': student.status === 'SUSPENDED'
                  }"
                >
                  {{ student.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="editStudent(student)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Edit
                </button>
                <button
                  @click="deleteStudent(student)"
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

    <!-- Create/Edit Student Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {{ showCreateModal ? 'Add New Student' : 'Edit Student' }}
        </h3>
        
        <form @submit.prevent="showCreateModal ? createStudent() : updateStudent()">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student ID</label>
                <input
                  v-model="studentForm.studentId"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  v-model="studentForm.email"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                <input
                  v-model="studentForm.firstName"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                <input
                  v-model="studentForm.lastName"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input
                  v-model="studentForm.phone"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                <input
                  v-model="studentForm.dateOfBirth"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Major</label>
                <input
                  v-model="studentForm.major"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year of Study</label>
                <select
                  v-model="studentForm.yearOfStudy"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="5">5th Year</option>
                </select>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enrollment Date</label>
              <input
                v-model="studentForm.enrollmentDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
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
              {{ submitting ? 'Saving...' : (showCreateModal ? 'Create Student' : 'Update Student') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Page meta
definePageMeta({
  title: 'Student Management'
})

// Data
const students = ref([])
const loading = ref(false)
const error = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const submitting = ref(false)
const editingStudent = ref(null)

const studentForm = ref({
  studentId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  major: '',
  yearOfStudy: '',
  enrollmentDate: ''
})

// Fetch students
const fetchStudents = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const token = useCookie('auth-token')
    if (!token.value) {
      await navigateTo('/auth/login')
      return
    }

    const response = await $fetch('/api/students', {
      headers: { Authorization: `Bearer ${token.value}` }
    })

    if (response.success) {
      students.value = response.data.students
    } else {
      error.value = response.message || 'Failed to fetch students'
    }
  } catch (err: any) {
    console.error('Fetch students error:', err)
    error.value = err.statusMessage || 'Failed to fetch students'
    
    if (err.statusCode === 401) {
      await navigateTo('/auth/login')
    }
  } finally {
    loading.value = false
  }
}

// Create student
const createStudent = async () => {
  submitting.value = true
  
  try {
    const token = useCookie('auth-token')
    
    // Convert form data
    const formData = {
      ...studentForm.value,
      yearOfStudy: studentForm.value.yearOfStudy ? parseInt(studentForm.value.yearOfStudy) : null
    }
    
    const response = await $fetch('/api/students', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: formData
    })

    if (response.success) {
      closeModal()
      await fetchStudents()
    } else {
      error.value = response.message || 'Failed to create student'
    }
  } catch (err: any) {
    console.error('Create student error:', err)
    error.value = err.statusMessage || 'Failed to create student'
  } finally {
    submitting.value = false
  }
}

// Edit student
const editStudent = (student: any) => {
  editingStudent.value = student
  studentForm.value = {
    studentId: student.studentId,
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    phone: student.phone || '',
    dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
    major: student.major || '',
    yearOfStudy: student.yearOfStudy ? student.yearOfStudy.toString() : '',
    enrollmentDate: student.enrollmentDate ? new Date(student.enrollmentDate).toISOString().split('T')[0] : ''
  }
  showEditModal.value = true
}

// Update student  
const updateStudent = async () => {
  if (!editingStudent.value) return
  
  submitting.value = true
  
  try {
    const token = useCookie('auth-token')
    
    // Convert form data
    const formData = {
      ...studentForm.value,
      yearOfStudy: studentForm.value.yearOfStudy ? parseInt(studentForm.value.yearOfStudy) : null
    }
    
    const response = await $fetch(`/api/students/${editingStudent.value.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: formData
    })

    if (response.success) {
      closeModal()
      await fetchStudents()
    } else {
      error.value = response.message || 'Failed to update student'
    }
  } catch (err: any) {
    console.error('Update student error:', err)
    error.value = err.statusMessage || 'Failed to update student'
  } finally {
    submitting.value = false
  }
}

// Delete student
const deleteStudent = async (student: any) => {
  if (!confirm(`Are you sure you want to delete student "${student.firstName} ${student.lastName}"?`)) {
    return
  }
  
  try {
    const token = useCookie('auth-token')
    const response = await $fetch(`/api/students/${student.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` }
    })

    if (response.success) {
      await fetchStudents()
    } else {
      error.value = response.message || 'Failed to delete student'
    }
  } catch (err: any) {
    console.error('Delete student error:', err)
    error.value = err.statusMessage || 'Failed to delete student'
  }
}

// Close modal
const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingStudent.value = null
  studentForm.value = {
    studentId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    major: '',
    yearOfStudy: '',
    enrollmentDate: ''
  }
}

// Load data on mount
onMounted(() => {
  fetchStudents()
})
</script> 