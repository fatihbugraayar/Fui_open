<template>
  <div class="fixed inset-0 bg-gray-50 flex items-center justify-center">
    <div class="max-w-4xl w-full mx-4">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome to Fui Designer</h1>
        <p class="text-gray-600">Choose a template or create a custom project</p>
      </div>

      <!-- Action Tabs -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <!-- Tab Headers -->
        <div class="flex border-b border-gray-200">
          <button
            :class="[
              'px-6 py-3 text-sm font-medium transition-colors',
              activeTab === 'templates' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                : 'text-gray-500 hover:text-gray-700'
            ]"
            @click="activeTab = 'templates'"
          >
            Templates
          </button>
          <button
            :class="[
              'px-6 py-3 text-sm font-medium transition-colors',
              activeTab === 'custom' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                : 'text-gray-500 hover:text-gray-700'
            ]"
            @click="activeTab = 'custom'"
          >
            Custom Size
          </button>
          <button
            :class="[
              'px-6 py-3 text-sm font-medium transition-colors',
              activeTab === 'recent' 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                : 'text-gray-500 hover:text-gray-700'
            ]"
            @click="activeTab = 'recent'"
          >
            Recent Projects
          </button>
        </div>        <!-- Tab Content -->
        <div class="p-6">
          <!-- Get Started Tab -->
          <div v-if="activeTab === 'start'" class="text-center">
            <div class="max-w-md mx-auto">
              <div class="mb-8">
                <svg class="w-20 h-20 mx-auto mb-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <h3 class="text-2xl font-bold text-gray-900 mb-2">Welcome to Fui Designer</h3>
                <p class="text-gray-600 mb-6">
                  Create beautiful designs with our powerful yet simple design tool. 
                  Start with a template or create a custom project.
                </p>
              </div>
              
              <div class="space-y-4">
                <button
                  class="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  @click="quickStart"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Quick Start (1440×1024)
                </button>
                
                <button
                  class="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  @click="activeTab = 'templates'"
                >
                  Browse Templates
                </button>
                
                <button
                  class="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  @click="activeTab = 'custom'"
                >
                  Custom Project
                </button>
              </div>
            </div>
          </div>
          <!-- Templates Tab -->
          <div v-if="activeTab === 'templates'" class="space-y-6">
            <h3 class="text-lg font-medium text-gray-900">Choose a Template</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="template in templates"
                :key="template.id"
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                @click="selectTemplate(template)"
              >
                <div 
                  class="w-full h-32 bg-gray-100 rounded mb-3 flex items-center justify-center group-hover:bg-gray-200 transition-colors"
                  :style="{ aspectRatio: template.width / template.height }"
                >
                  <div 
                    class="bg-white border border-gray-300 rounded shadow-sm"
                    :style="{ 
                      width: Math.min(80, (80 * template.width) / template.height) + 'px',
                      height: Math.min(80, (80 * template.height) / template.width) + 'px'
                    }"
                  ></div>
                </div>
                <h4 class="font-medium text-gray-900">{{ template.name }}</h4>
                <p class="text-sm text-gray-500">{{ template.width }} × {{ template.height }}px</p>
                <p class="text-xs text-gray-400 mt-1">{{ template.description }}</p>
              </div>
            </div>
          </div>

          <!-- Custom Size Tab -->
          <div v-if="activeTab === 'custom'" class="space-y-6">
            <h3 class="text-lg font-medium text-gray-900">Create Custom Project</h3>
            <div class="max-w-md space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  v-model="customProject.name"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Project"
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
                  <input
                    v-model.number="customProject.width"
                    type="number"
                    min="100"
                    max="10000"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
                  <input
                    v-model.number="customProject.height"
                    type="number"
                    min="100"
                    max="10000"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                <div class="flex items-center space-x-2">
                  <input
                    v-model="customProject.backgroundColor"
                    type="color"
                    class="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <input
                    v-model="customProject.backgroundColor"
                    type="text"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                @click="createCustomProject"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Project
              </button>
            </div>
          </div>

          <!-- Recent Projects Tab -->
          <div v-if="activeTab === 'recent'" class="space-y-6">
            <h3 class="text-lg font-medium text-gray-900">Recent Projects</h3>
            <div v-if="recentProjects.length === 0" class="text-center py-8 text-gray-500">
              No recent projects found
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="project in recentProjects"
                :key="project.id"
                class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                @click="openProject(project)"
              >
                <div class="w-full h-32 bg-gray-100 rounded mb-3"></div>
                <h4 class="font-medium text-gray-900">{{ project.name }}</h4>
                <p class="text-sm text-gray-500">{{ formatDate(project.updatedAt) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Emits
const emit = defineEmits<{
  'project-created': [project: any]
}>()

// Data
const activeTab = ref('templates')

const templates = ref([
  {
    id: 'mobile-app',
    name: 'Mobile App',
    description: 'iOS App Design',
    width: 390,
    height: 844,
    backgroundColor: '#ffffff'
  },
  {
    id: 'web-desktop',
    name: 'Web Desktop',
    description: 'Desktop Website',
    width: 1440,
    height: 1024,
    backgroundColor: '#ffffff'
  },
  {
    id: 'tablet',
    name: 'Tablet',
    description: 'iPad Design',
    width: 820,
    height: 1180,
    backgroundColor: '#ffffff'
  },
  {
    id: 'social-post',
    name: 'Social Media Post',
    description: 'Instagram Square',
    width: 1080,
    height: 1080,
    backgroundColor: '#ffffff'
  },
  {
    id: 'presentation',
    name: 'Presentation',
    description: 'Slide Deck',
    width: 1920,
    height: 1080,
    backgroundColor: '#ffffff'
  },
  {
    id: 'business-card',
    name: 'Business Card',
    description: 'Standard Card',
    width: 350,
    height: 200,
    backgroundColor: '#ffffff'
  }
])

const customProject = ref({
  name: 'My Project',
  width: 1440,
  height: 1024,
  backgroundColor: '#ffffff'
})

const recentProjects = ref([
  // Bu liste API'den gelecek
])

// Methods
function selectTemplate(template: any) {
  const project = {
    name: template.name,
    width: template.width,
    height: template.height,
    backgroundColor: template.backgroundColor,
    type: 'template',
    templateId: template.id
  }
  emit('project-created', project)
}

function createCustomProject() {
  const project = {
    name: customProject.value.name,
    width: customProject.value.width,
    height: customProject.value.height,
    backgroundColor: customProject.value.backgroundColor,
    type: 'custom'
  }
  emit('project-created', project)
}

function openProject(project: any) {
  emit('project-created', project)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString()
}
</script>
