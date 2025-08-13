<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Course Management</h1>
        <p class="text-gray-600 dark:text-gray-400">Manage courses, schedules, and enrollment</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Add Course
      </button>
    </div>

    <!-- Courses Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Loading courses...</p>
      </div>

      <div v-else-if="error" class="p-8 text-center text-red-600 dark:text-red-400">
        {{ error }}
      </div>

      <div v-else>
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Credits</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Semester</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="course in courses" :key="course.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4">
                <div>
                  <div class="text-sm font-medium text-gray-900 dark:text-white">{{ course.courseName }}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">{{ course.courseCode }}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">{{ course.instructor || 'No instructor assigned' }}</div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                {{ course.credits }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                {{ course.semester }} {{ course.year }}
              </td>
              <td class="px-6 py-4">
                <span 
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': course.status === 'ACTIVE',
                    'bg-yellow-100 text-yellow-800': course.status === 'INACTIVE',
                    'bg-gray-100 text-gray-800': course.status === 'COMPLETED'
                  }"
                >
                  {{ course.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right text-sm font-medium">
                <button
                  @click="editCourse(course)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Edit
                </button>
                <button
                  @click="deleteCourse(course)"
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

    <!-- Create/Edit Course Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {{ showCreateModal ? 'Add New Course' : 'Edit Course' }}
        </h3>
        
        <form @submit.prevent="showCreateModal ? createCourse() : updateCourse()">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Code</label>
                <input
                  v-model="courseForm.courseCode"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Credits</label>
                <input
                  v-model="courseForm.credits"
                  type="number"
                  min="1"
                  max="6"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course Name</label>
              <input
                v-model="courseForm.courseName"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                v-model="courseForm.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                <select
                  v-model="courseForm.semester"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Semester</option>
                  <option value="FALL">Fall</option>
                  <option value="SPRING">Spring</option>
                  <option value="SUMMER">Summer</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                <input
                  v-model="courseForm.year"
                  type="number"
                  min="2020"
                  max="2030"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instructor</label>
                <input
                  v-model="courseForm.instructor"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Students</label>
                <input
                  v-model="courseForm.maxStudents"
                  type="number"
                  min="1"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
              </div>
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
              {{ submitting ? 'Saving...' : (showCreateModal ? 'Create Course' : 'Update Course') }}
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
  title: 'Course Management'
})

// Data
const courses = ref([])
const loading = ref(false)
const error = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const submitting = ref(false)
const editingCourse = ref(null)

const courseForm = ref({
  courseCode: '',
  courseName: '',
  description: '',
  credits: 3,
  semester: '',
  year: new Date().getFullYear(),
  instructor: '',
  maxStudents: 30
})

// Fetch courses
const fetchCourses = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const token = useCookie('auth-token')
    if (!token.value) {
      await navigateTo('/auth/login')
      return
    }

    const response = await $fetch('/api/courses', {
      headers: { Authorization: `Bearer ${token.value}` }
    })

    if (response.success) {
      courses.value = response.data.courses
    } else {
      error.value = response.message || 'Failed to fetch courses'
    }
  } catch (err: any) {
    console.error('Fetch courses error:', err)
    error.value = err.statusMessage || 'Failed to fetch courses'
    
    if (err.statusCode === 401) {
      await navigateTo('/auth/login')
    }
  } finally {
    loading.value = false
  }
}

// Create course
const createCourse = async () => {
  submitting.value = true
  
  try {
    const token = useCookie('auth-token')
    const response = await $fetch('/api/courses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: courseForm.value
    })

    if (response.success) {
      closeModal()
      await fetchCourses()
    } else {
      error.value = response.message || 'Failed to create course'
    }
  } catch (err: any) {
    console.error('Create course error:', err)
    error.value = err.statusMessage || 'Failed to create course'
  } finally {
    submitting.value = false
  }
}

// Edit course
const editCourse = (course: any) => {
  editingCourse.value = course
  courseForm.value = {
    courseCode: course.courseCode,
    courseName: course.courseName,
    description: course.description || '',
    credits: course.credits,
    semester: course.semester,
    year: course.year,
    instructor: course.instructor || '',
    maxStudents: course.maxStudents
  }
  showEditModal.value = true
}

// Update course
const updateCourse = async () => {
  if (!editingCourse.value) return
  
  submitting.value = true
  
  try {
    const token = useCookie('auth-token')
    const response = await $fetch(`/api/courses/${editingCourse.value.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token.value}` },
      body: courseForm.value
    })

    if (response.success) {
      closeModal()
      await fetchCourses()
    } else {
      error.value = response.message || 'Failed to update course'
    }
  } catch (err: any) {
    console.error('Update course error:', err)
    error.value = err.statusMessage || 'Failed to update course'
  } finally {
    submitting.value = false
  }
}

// Delete course
const deleteCourse = async (course: any) => {
  if (!confirm(`Are you sure you want to delete course "${course.courseCode}"?`)) {
    return
  }
  
  try {
    const token = useCookie('auth-token')
    const response = await $fetch(`/api/courses/${course.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` }
    })

    if (response.success) {
      await fetchCourses()
    } else {
      error.value = response.message || 'Failed to delete course'
    }
  } catch (err: any) {
    console.error('Delete course error:', err)
    error.value = err.statusMessage || 'Failed to delete course'
  }
}

// Close modal
const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingCourse.value = null
  courseForm.value = {
    courseCode: '',
    courseName: '',
    description: '',
    credits: 3,
    semester: '',
    year: new Date().getFullYear(),
    instructor: '',
    maxStudents: 30
  }
}

// Load data on mount
onMounted(() => {
  fetchCourses()
})
</script>