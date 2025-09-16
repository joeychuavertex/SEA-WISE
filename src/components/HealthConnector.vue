<template>
  <div class="health-connector">
    <!-- Connection Status -->
    <section class="status-card" :class="{ connected: isConnected }" role="status" aria-live="polite">
      <div class="status-icon" aria-hidden="true">
        <span v-if="isConnected">✓</span>
        <span v-else>⚡</span>
      </div>
      <div class="status-content">
        <h2 v-if="isConnected" id="connection-status">
          {{ isSampleDataMode ? 'Connected to Sample Data' : 'Connected to Demo Mode' }}
        </h2>
        <h2 v-else id="connection-status">Not Connected</h2>
        <p v-if="isConnected" aria-describedby="connection-status">
          {{ isSampleDataMode ? `Viewing real health data for User ${selectedUserId}` : 'Your health data is syncing automatically' }}
        </p>
        <p v-else aria-describedby="connection-status">Connect to demo mode or sample data to see health metrics</p>
      </div>
    </section>

    <!-- Connect Buttons -->
    <section class="connect-section" v-if="!isConnected" aria-labelledby="connection-actions">
      <h3 id="connection-actions" class="sr-only">Connection Actions</h3>
      <div class="button-group">
        <button 
          @click="connectService" 
          class="connect-btn"
          :disabled="isConnecting"
          :aria-describedby="isConnecting ? 'connecting-status' : undefined"
          aria-label="Connect to health data service"
        >
          <span v-if="!isConnecting">Connect</span>
          <span v-else id="connecting-status">Connecting...</span>
        </button>
      </div>
    </section>
    
    <!-- Disconnect Button -->
    <section class="connect-section" v-else aria-labelledby="disconnect-actions">
      <h3 id="disconnect-actions" class="sr-only">Disconnect Actions</h3>
      <button 
        @click="disconnectService" 
        class="disconnect-btn"
        aria-label="Disconnect from health data service"
      >
        Disconnect
      </button>
    </section>

    <!-- Health Data Display -->
    <div v-if="isConnected" class="health-data">

      <section class="chat-section" aria-labelledby="chat-heading">
        <h3 id="chat-heading" class="sr-only">Health Data Chat</h3>
        <button 
          @click="openChat" 
          class="chat-btn" 
          type="button"
          aria-label="Open chat with health data assistant"
          aria-describedby="chat-description"
        >
          <span class="chat-icon" aria-hidden="true">💬</span>
          Chat with Your Health Data
        </button>
        <p id="chat-description" class="chat-description">
          Ask questions about your health metrics, get insights, and track your progress
        </p>
      </section>
      
      <!-- Health Goal Planner -->
      <HealthGoalPlanner 
        :isConnected="isConnected"
        :healthData="healthData"
        @planGenerated="handlePlanGenerated"
        @planSaved="handlePlanSaved"
      />

      <!-- Health Tips Panel -->
      <HealthTipsPanel 
        ref="healthTipsPanel"
        @refresh="refreshHealthTips"
      />

      <!-- Basic Metrics -->
      <section class="metrics-section" aria-labelledby="activity-heading">
        <h3 id="activity-heading">Today's Activity</h3>
        <p class="section-description">
          <span aria-hidden="true">💡</span> <strong>Click on the highlighted cards</strong> to see detailed health insights, 
          fitness standards, and culturally relevant health suggestions from around the world.
        </p>
        <div class="data-grid" role="grid" aria-label="Health metrics grid">
          <div 
            class="data-card tooltip-enabled"
            @click="openModal('steps', getMetricValue('steps'))"
            @keydown.enter="openModal('steps', getMetricValue('steps'))"
            @keydown.space.prevent="openModal('steps', getMetricValue('steps'))"
            role="gridcell"
            tabindex="0"
            :aria-label="`Steps Today: ${healthData.steps || '0'}. Click for detailed insights.`"
            :aria-describedby="`steps-description`"
          >
            <div class="data-icon" aria-hidden="true">🚶</div>
            <div class="data-content">
              <h4>Steps Today</h4>
              <p class="data-value" :id="`steps-value`">{{ healthData.steps || '0' }}</p>
              <small class="tooltip-hint" id="steps-description">Click for detailed insights</small>
            </div>
          </div>
          
          <div 
            class="data-card tooltip-enabled"
            @click="openModal('calories', getMetricValue('calories'))"
            @keydown.enter="openModal('calories', getMetricValue('calories'))"
            @keydown.space.prevent="openModal('calories', getMetricValue('calories'))"
            role="gridcell"
            tabindex="0"
            :aria-label="`Calories Burned: ${healthData.calories || '0'}. Click for detailed insights.`"
            :aria-describedby="`calories-description`"
          >
            <div class="data-icon" aria-hidden="true">🔥</div>
            <div class="data-content">
              <h4>Calories Burned</h4>
              <p class="data-value">{{ healthData.calories || '0' }}</p>
              <small class="tooltip-hint" id="calories-description">Click for detailed insights</small>
            </div>
          </div>
          
          <div 
            class="data-card tooltip-enabled"
            @click="openModal('activity', getMetricValue('activity'))"
            @keydown.enter="openModal('activity', getMetricValue('activity'))"
            @keydown.space.prevent="openModal('activity', getMetricValue('activity'))"
            role="gridcell"
            tabindex="0"
            :aria-label="`Active Minutes: ${healthData.activeMinutes || '0'}. Click for detailed insights.`"
            :aria-describedby="`activity-description`"
          >
            <div class="data-icon" aria-hidden="true">⏱️</div>
            <div class="data-content">
              <h4>Active Minutes</h4>
              <p class="data-value">{{ healthData.activeMinutes || '0' }}</p>
              <small class="tooltip-hint" id="activity-description">Click for detailed insights</small>
            </div>
          </div>
          
          <div 
            class="data-card tooltip-enabled"
            @click="openModal('heartRate', getMetricValue('heartRate'))"
            @keydown.enter="openModal('heartRate', getMetricValue('heartRate'))"
            @keydown.space.prevent="openModal('heartRate', getMetricValue('heartRate'))"
            role="gridcell"
            tabindex="0"
            :aria-label="`Heart Rate: ${healthData.heartRate || '--'} BPM. Click for detailed insights.`"
            :aria-describedby="`heartrate-description`"
          >
            <div class="data-icon" aria-hidden="true">💓</div>
            <div class="data-content">
              <h4>Heart Rate</h4>
              <p class="data-value">{{ healthData.heartRate || '--' }} BPM</p>
              <small class="tooltip-hint" id="heartrate-description">Click for detailed insights</small>
            </div>
          </div>
        </div>
      </section>

      <!-- Sleep Metrics -->
      <div class="metrics-section">
        <h4>Sleep Data</h4>
        <div class="data-grid">
          <div class="data-card">
            <div class="data-icon">😴</div>
            <div class="data-content">
              <h4>Sleep Records</h4>
              <p class="data-value">{{ healthData.totalSleepRecords || '0' }}</p>
            </div>
          </div>
          
          <div 
            class="data-card tooltip-enabled"
            @click="openModal('sleep', getMetricValue('sleep'))"
          >
            <div class="data-icon">🌙</div>
            <div class="data-content">
              <h4>Time Asleep</h4>
              <p class="data-value">{{ formatTime(healthData.totalMinutesAsleep || 0) }}</p>
              <small class="tooltip-hint">Click for detailed insights</small>
            </div>
          </div>
          
          <div class="data-card">
            <div class="data-icon">🛏️</div>
            <div class="data-content">
              <h4>Time in Bed</h4>
              <p class="data-value">{{ formatTime(healthData.totalTimeInBed || 0) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Body Metrics -->
      <div class="metrics-section">
        <h4>Body Metrics</h4>
        <div class="data-grid">
          <div 
            class="data-card tooltip-enabled"
            @click="openModal('weight', getMetricValue('weight'))"
          >
            <div class="data-icon">⚖️</div>
            <div class="data-content">
              <h4>Weight (kg)</h4>
              <p class="data-value">{{ (healthData.weightKg || 0).toFixed(1) }}</p>
              <small class="tooltip-hint">Click for detailed insights</small>
            </div>
          </div>
          
          <div class="data-card">
            <div class="data-icon">📏</div>
            <div class="data-content">
              <h4>Weight (lbs)</h4>
              <p class="data-value">{{ (healthData.weightPounds || 0).toFixed(1) }}</p>
            </div>
          </div>
          
          <div class="data-card">
            <div class="data-icon">📊</div>
            <div class="data-content">
              <h4>Body Fat %</h4>
              <p class="data-value">{{ (healthData.fat || 0).toFixed(1) }}%</p>
            </div>
          </div>
          
          <div 
            class="data-card tooltip-enabled"
            @click="openModal('bmi', getMetricValue('bmi'))"
          >
            <div class="data-icon">📈</div>
            <div class="data-content">
              <h4>BMI</h4>
              <p class="data-value">{{ (healthData.bmi || 0).toFixed(1) }}</p>
              <small class="tooltip-hint">Click for detailed insights</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Distance Metrics -->
      <div class="metrics-section">
        <h4>Distance & Movement</h4>
        <div class="data-grid">
          <div class="data-card">
            <div class="data-icon">🛣️</div>
            <div class="data-content">
              <h4>Total Distance</h4>
              <p class="data-value">{{ (healthData.totalDistance || 0).toFixed(2) }} km</p>
            </div>
          </div>
          
          <div class="data-card">
            <div class="data-icon">🏃</div>
            <div class="data-content">
              <h4>Very Active</h4>
              <p class="data-value">{{ (healthData.veryActiveDistance || 0).toFixed(2) }} km</p>
            </div>
          </div>
          
          <div class="data-card">
            <div class="data-icon">🚶</div>
            <div class="data-content">
              <h4>Moderate</h4>
              <p class="data-value">{{ (healthData.moderatelyActiveDistance || 0).toFixed(2) }} km</p>
            </div>
          </div>
          
          <div class="data-card">
            <div class="data-icon">🐌</div>
            <div class="data-content">
              <h4>Light Activity</h4>
              <p class="data-value">{{ (healthData.lightActiveDistance || 0).toFixed(2) }} km</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Minutes Breakdown -->
      <div class="metrics-section">
        <h4>Activity Minutes Breakdown</h4>
        <div class="data-grid">
          <div class="data-card">
            <div class="data-icon">🔥</div>
            <div class="data-content">
              <h4>Very Active</h4>
              <p class="data-value">{{ healthData.veryActiveMinutes || '0' }} min</p>
            </div>
          </div>
          
          <div class="data-card">
            <div class="data-icon">⚡</div>
            <div class="data-content">
              <h4>Fairly Active</h4>
              <p class="data-value">{{ healthData.fairlyActiveMinutes || '0' }} min</p>
            </div>
          </div>
          
          <div class="data-card">
            <div class="data-icon">🚶</div>
            <div class="data-content">
              <h4>Lightly Active</h4>
              <p class="data-value">{{ healthData.lightlyActiveMinutes || '0' }} min</p>
            </div>
          </div>
          
          <div class="data-card">
            <div class="data-icon">🪑</div>
            <div class="data-content">
              <h4>Sedentary</h4>
              <p class="data-value">{{ healthData.sedentaryMinutes || '0' }} min</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Hourly Activity Chart -->
      <div class="metrics-section" v-if="healthData.hourlySteps && healthData.hourlySteps.length > 0">
        <h4>Hourly Activity Pattern</h4>
        <div class="chart-container">
          <div class="hourly-chart">
            <div 
              v-for="(hourData, index) in healthData.hourlySteps.slice(0, 24)" 
              :key="index"
              class="hourly-bar"
              :style="{ height: `${(hourData.steps / Math.max(...healthData.hourlySteps.map((h: { steps: number }) => h.steps))) * 100}%` }"
              :title="`${hourData.hour}: ${hourData.steps} steps`"
            >
              <span class="hour-label">{{ hourData.hour }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <section class="action-buttons" aria-labelledby="action-heading">
        <h3 id="action-heading" class="sr-only">Data Actions</h3>
        <button 
          @click="syncHealthData" 
          class="sync-btn" 
          :disabled="isSyncing"
          :aria-label="isSyncing ? 'Syncing health data' : 'Sync latest health data'"
        >
          <span v-if="!isSyncing">Sync Latest Data</span>
          <span v-else>Syncing...</span>
        </button>
        
        <button 
          @click="exportToPDF" 
          class="export-btn" 
          :disabled="isExporting"
          :aria-label="isExporting ? 'Exporting PDF' : 'Export health data as PDF'"
        >
          <span v-if="!isExporting"><span aria-hidden="true">📄</span> Export as PDF</span>
          <span v-else>Exporting...</span>
        </button>
      </section>

      <!-- Chat with Health Data Button -->
      <HealthChat 
        v-if="isConnected && isChatOpen"
        v-model="isChatOpen" 
        :isConnected="isConnected"
        @close="isChatOpen = false"
        @generateTips="handleGenerateTips"
      />
    </div>



    <!-- Instructions -->
    <div v-if="!isConnected" class="instructions">
      <h3>How to Connect</h3>
      <div>
        <h4>Sample Data Mode</h4>
        <ol>
          <li>Click Connect to view real health data from actual fitness tracker users (https://www.kaggle.com/datasets/arashnic/fitbit)</li>
          <li>Explore comprehensive health metrics and patterns</li>
        </ol>
        
        <div class="note">
          <strong>Note:</strong> Demo mode generates simulated data for testing purposes. Sample data mode uses real anonymized health data from fitness tracker users. No personal health data is collected.
        </div>
      </div>
    </div>

    <!-- Health Chat Component -->
    <HealthChat 
      v-if="isConnected && isChatOpen"
      v-model="isChatOpen" 
      :isConnected="isConnected"
      @close="isChatOpen = false"
    />

    <!-- Health Modal -->
    <HealthModal
      :is-visible="modalState.isVisible"
      :insight="modalState.insight"
      @close="closeModal"
      @openChat="openModalChat"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DemoHealthService } from '../services/DemoHealthService'
import { SampleDataService } from '../services/SampleDataService'
import { HealthInsightsService } from '../services/HealthInsightsService'
import { PDFExportService } from '../services/PDFExportService'
import type { HealthData } from '../services/GoogleFitService'
import type { HealthInsight } from '../services/HealthInsightsService'
import HealthChat from './HealthChat.vue'
import HealthModal from './HealthModal.vue'
import HealthTipsPanel from './HealthTipsPanel.vue'
import HealthGoalPlanner from './HealthGoalPlanner.vue'

// Reactive state
const isConnected = ref(false)
const isConnecting = ref(false)
const isSyncing = ref(false)
const isExporting = ref(false)
const isChatOpen = ref(false)
const isSampleDataMode = ref(false)
const selectedUserId = ref('')
const availableUsers = ref<string[]>([])
const healthTipsPanel = ref<InstanceType<typeof HealthTipsPanel> | null>(null)
const showStatusCard = ref(true)
const healthData = ref<HealthData>({
  steps: 0,
  calories: 0,
  activeMinutes: 0,
  heartRate: 0,
  totalSleepRecords: 0,
  totalMinutesAsleep: 0,
  totalTimeInBed: 0,
  weightKg: 0,
  weightPounds: 0,
  fat: 0,
  bmi: 0,
  totalDistance: 0,
  veryActiveDistance: 0,
  moderatelyActiveDistance: 0,
  lightActiveDistance: 0,
  sedentaryActiveDistance: 0,
  veryActiveMinutes: 0,
  fairlyActiveMinutes: 0,
  lightlyActiveMinutes: 0,
  sedentaryMinutes: 0,
  hourlySteps: [],
  hourlyCalories: [],
  hourlyIntensities: []
})

// Modal state
const modalState = ref({
  isVisible: false,
  insight: null as HealthInsight | null
})

// Health service instances
const demoService = new DemoHealthService()
const sampleDataService = new SampleDataService()
const healthInsightsService = new HealthInsightsService()
const pdfExportService = new PDFExportService()
let currentService = demoService // Default to demo mode

// Check connection status on mount
onMounted(async () => {
  // Start with demo service by default
  currentService = demoService
  isConnected.value = await demoService.isConnected()
  
  // Load available users from sample data
  availableUsers.value = sampleDataService.getAvailableUsers()
  if (availableUsers.value.length > 0) {
    selectedUserId.value = availableUsers.value[0]
  }
  
  if (isConnected.value) {
    await syncHealthData()
  }
})

// Connect to service (toggles between demo and sample data)
const connectService = async () => {
  try {
    isConnecting.value = true
    
    // If sample data is available and user has selected a profile, use sample data
    if (sampleDataService.isDataLoaded() && selectedUserId.value) {
      isSampleDataMode.value = true
      isConnected.value = true
    } else {
      // Otherwise use demo mode
      currentService = demoService
      isSampleDataMode.value = false
      await demoService.connect()
      isConnected.value = true
      
      // Hide status card after 10 seconds for demo mode
      showStatusCard.value = true
      setTimeout(() => {
        showStatusCard.value = false
      }, 10000)
    }
    
    await syncHealthData()
  } catch (error) {
    console.error('Failed to connect:', error)
    alert('Failed to connect. Please try again.')
  } finally {
    isConnecting.value = false
  }
}

// Disconnect from current service
const disconnectService = async () => {
  try {
    if (!isSampleDataMode.value) {
      await currentService.disconnect()
    }
    isConnected.value = false
    isSampleDataMode.value = false
    healthData.value = {
      steps: 0,
      calories: 0,
      activeMinutes: 0,
      heartRate: 0,
      totalSleepRecords: 0,
      totalMinutesAsleep: 0,
      totalTimeInBed: 0,
      weightKg: 0,
      weightPounds: 0,
      fat: 0,
      bmi: 0,
      totalDistance: 0,
      veryActiveDistance: 0,
      moderatelyActiveDistance: 0,
      lightActiveDistance: 0,
      sedentaryActiveDistance: 0,
      veryActiveMinutes: 0,
      fairlyActiveMinutes: 0,
      lightlyActiveMinutes: 0,
      sedentaryMinutes: 0,
      hourlySteps: [],
      hourlyCalories: [],
      hourlyIntensities: []
    }
  } catch (error) {
    console.error('Failed to disconnect:', error)
  }
}

// Sync health data
const syncHealthData = async () => {
  if (!isConnected.value) return
  
  try {
    isSyncing.value = true
    
    if (isSampleDataMode.value) {
      // Get data from sample data service
      const data = sampleDataService.getLatestHealthData()
      if (data) {
        healthData.value = data
      }
    } else {
      // Get data from demo service
      const data = await currentService.getHealthData()
      healthData.value = data
    }
  } catch (error) {
    console.error('Failed to sync data:', error)
    alert('Failed to sync health data. Please try again.')
  } finally {
    isSyncing.value = false
  }
}

// Export health data as PDF
const exportToPDF = async () => {
  if (!isConnected.value) return
  
  try {
    isExporting.value = true
    
    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0]
    const filename = `health-report-${currentDate}.pdf`
    
    // Export the current page as PDF
    await pdfExportService.exportPage({
      filename,
      format: 'A4',
      orientation: 'portrait'
    })
  } catch (error) {
    console.error('Failed to export PDF:', error)
    alert('Failed to export PDF. Please try again.')
  } finally {
    isExporting.value = false
  }
}

// Open chat interface
const openChat = () => {
  console.log('Chat button clicked!')
  console.log('Current isChatOpen value:', isChatOpen.value)
  isChatOpen.value = true
  console.log('New isChatOpen value:', isChatOpen.value)
}

// Modal methods
const openModal = (metric: string, value: number) => {
  console.log('openModal called:', { metric, value })
  
  const insight = healthInsightsService.getHealthInsight(metric, value)
  console.log('Generated insight:', insight)
  
  modalState.value = {
    isVisible: true,
    insight
  }
  
  console.log('Modal state updated:', modalState.value)
}

const closeModal = () => {
  console.log('closeModal called')
  modalState.value.isVisible = false
}

const openModalChat = () => {
  closeModal()
  openChat()
}

// Health tips methods
const handleGenerateTips = async (sessionId?: string) => {
  console.log('HealthConnector: Generating health tips for session:', sessionId)
  if (healthTipsPanel.value) {
    await healthTipsPanel.value.loadTips()
  }
}

const refreshHealthTips = async () => {
  console.log('HealthConnector: Refreshing health tips')
  if (healthTipsPanel.value) {
    await healthTipsPanel.value.refreshTips()
  }
}

// Goal planner event handlers
const handlePlanGenerated = (plan: any) => {
  console.log('HealthConnector: Plan generated:', plan)
  // You can add additional logic here, such as analytics tracking
}

const handlePlanSaved = (plan: any) => {
  console.log('HealthConnector: Plan saved:', plan)
  // You can add additional logic here, such as showing a success message
}

const getMetricValue = (metric: string): number => {
  switch (metric) {
    case 'steps': return healthData.value.steps || 0
    case 'calories': return healthData.value.calories || 0
    case 'sleep': return (healthData.value.totalMinutesAsleep || 0) / 60
    case 'heartRate': return healthData.value.heartRate || 0
    case 'weight': return healthData.value.weightKg || 0
    case 'activity': return healthData.value.activeMinutes || 0
    case 'bmi': return healthData.value.bmi || 0
    default: return 0
  }
}

// Helper to format time (e.g., 300 minutes to "5:00")
const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}:${remainingMinutes < 10 ? '0' : ''}${remainingMinutes}`;
};
</script>

<style scoped>
.health-connector {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.status-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--primary-light);
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid var(--primary-color);
  box-shadow: 0 1px 3px rgba(37, 99, 235, 0.2);
}

.status-card.connected {
  background: #f0fdf4;
  border-color: #22c55e;
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #6b7280;
}

.status-card.connected .status-icon {
  background: #dcfce7;
  color: #22c55e;
}

.status-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #000000;
}

.status-content p {
  margin: 0;
  color: #6b7280;
}

.connect-section {
  text-align: center;
  margin-bottom: 2rem;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.connect-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
  background: var(--primary-color);
  color: white;
}

.connect-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3);
  background: var(--primary-hover);
}

.connect-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.user-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 1rem;
  background: var(--primary-light);
  border-radius: 12px;
  border: 1px solid var(--primary-color);
  box-shadow: 0 1px 3px rgba(37, 99, 235, 0.2);
}

.user-selector label {
  color: #374151;
  font-weight: 500;
  font-size: 0.9rem;
}

.user-select {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #ffffff;
  color: #000000;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-select:hover {
  border-color: var(--primary-color);
  background: #ffffff;
}

.user-select option {
  background: #ffffff;
  color: #000000;
}

.disconnect-btn, .sync-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
}

.disconnect-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.disconnect-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.sync-btn, .export-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
}

.sync-btn {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.sync-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
}

.export-btn {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
}

.export-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(5, 150, 105, 0.3);
}

.sync-btn:disabled, .export-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.instructions {
  margin-top: 2rem;
  padding: 2rem;
  background: var(--primary-light);
  border-radius: 15px;
  border: 1px solid var(--primary-color);
  box-shadow: 0 1px 3px rgba(37, 99, 235, 0.2);
}

.instructions h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #000000;
}

.instructions ol {
  text-align: left;
  margin: 0;
  padding-left: 1.5rem;
  color: #374151;
  line-height: 1.6;
}

.instructions li {
  margin-bottom: 0.5rem;
}

.note {
  margin-top: 1.5rem;
  padding: 1rem;
  background: rgba(245, 158, 11, 0.2);
  border-radius: 8px;
  border-left: 4px solid #f59e0b;
  color: #000000;
  font-size: 0.9rem;
  line-height: 1.5;
}

.note strong {
  color: #000000;
}

.chat-section {
  text-align: center;
  margin-top: 2rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background: var(--primary-light);
  border-radius: 15px;
  border: 1px solid var(--primary-color);
  box-shadow: 0 1px 3px rgba(37, 99, 235, 0.2);
  position: relative;
  z-index: 5;
}

.chat-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  pointer-events: auto;
  z-index: 10;
  position: relative;
}

.chat-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
}

.chat-btn:focus {
  outline: 2px solid #fbbf24;
  outline-offset: 2px;
}

.chat-btn:active {
  transform: translateY(0);
}

.chat-icon {
  font-size: 1.2rem;
}

.chat-description {
  margin: 0;
  color: #000000;
  font-size: 0.9rem;
  line-height: 1.5;
}

.health-data {
  margin-top: 2rem;
}

.health-data h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.metrics-section {
  margin-bottom: 2rem;
  background: var(--primary-light);
  border-radius: 15px;
  padding: 1.5rem;
  border: 1px solid var(--primary-color);
  box-shadow: 0 1px 3px rgba(37, 99, 235, 0.2);
}

.metrics-section h4 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  color: #000000;
  font-weight: 600;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.data-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.data-card:hover {
  transform: translateY(-2px);
  background: #ffffff;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1);
  border-color: rgba(0, 0, 0, 0.2);
}

.data-card.tooltip-enabled {
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.data-card.tooltip-enabled::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.data-card.tooltip-enabled:hover::before {
  left: 100%;
}

.data-card.tooltip-enabled:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.2),
    0 8px 25px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border-color: rgba(0, 0, 0, 0.2);
  background: #ffffff;
}

.data-card.tooltip-enabled::after {
  content: '📊';
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.75rem;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.data-card.tooltip-enabled:hover::after {
  opacity: 1;
  transform: scale(1.1);
}

.data-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.data-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #000000;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-value {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #000000;
}

.tooltip-hint {
  display: block;
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: #374151;
  opacity: 0.9;
  transition: all 0.3s ease;
  font-weight: 600;
  text-align: center;
  padding: 0.25rem 0.5rem;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(71, 85, 105, 0.3);
}

.data-card.tooltip-enabled:hover .tooltip-hint {
  opacity: 1;
  color: #000000;
  background: rgba(37, 99, 235, 0.2);
  border-color: var(--primary-color);
  transform: translateY(-2px);
  font-weight: 700;
}

.section-description {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #000000;
  font-size: 0.9rem;
  line-height: 1.5;
  padding: 0 1rem; /* Add some padding for better spacing */
}

.chart-container {
  height: 200px;
  display: flex;
  align-items: flex-end;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  overflow: hidden;
  margin-top: 1rem;
  padding: 1rem;
  backdrop-filter: blur(10px);
}

.hourly-chart {
  display: flex;
  align-items: flex-end;
  height: 100%;
  width: 100%;
  gap: 2px;
}

.hourly-bar {
  flex: 1;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 4px;
  margin: 0 1px;
  transition: all 0.3s ease;
  min-height: 20px;
}

.hourly-bar:hover {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  transform: scaleY(1.05);
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
}

.hour-label {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  white-space: nowrap;
  color: white;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.hourly-bar:hover .hour-label {
  opacity: 1;
}

.instructions h4 {
  margin: 1.5rem 0 1rem 0;
  color: #fbbf24;
  font-size: 1.1rem;
  font-weight: 600;
}

.instructions h4:first-child {
  margin-top: 0;
}

@media (max-width: 480px) {
  .health-connector {
    padding: var(--spacing-md);
    border-radius: 12px;
  }
  
  .status-card {
    padding: var(--spacing-md);
    gap: var(--spacing-sm);
  }
  
  .status-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }
  
  .data-card {
    padding: var(--spacing-md);
    min-height: 100px;
  }
  
  .metrics-section {
    padding: var(--spacing-md);
  }
  
  .chat-section {
    padding: var(--spacing-md);
  }
  
  .instructions {
    padding: var(--spacing-md);
  }
  
  .connect-btn,
  .disconnect-btn,
  .sync-btn,
  .export-btn {
    min-width: 140px;
    padding: var(--spacing-sm) var(--spacing-lg);
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .health-connector {
    padding: var(--spacing-lg);
  }
  
  .data-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .status-card {
    padding: var(--spacing-lg);
  }
}

@media (min-width: 769px) and (max-width: 1023px) {
  .health-connector {
    padding: var(--spacing-lg);
  }
  
  .data-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .status-card {
    padding: var(--spacing-lg);
  }
}

/* Landscape orientation adjustments for mobile */
@media (max-width: 768px) and (orientation: landscape) {
  .app-header {
    padding: var(--spacing-md) var(--spacing-lg);
  }
  
  .status-card {
    padding: var(--spacing-md);
  }
  
  .data-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .data-card.tooltip-enabled:hover {
    transform: none;
  }
  
  .data-card.tooltip-enabled:hover::before {
    display: none;
  }
  
  .hourly-bar:hover {
    transform: none;
  }
  
  .hour-label {
    display: none;
  }
  
  .connect-btn:hover,
  .disconnect-btn:hover,
  .sync-btn:hover,
  .export-btn:hover,
  .chat-btn:hover {
    transform: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .data-card {
    border-width: 2px;
  }
  
  .status-card {
    border-width: 2px;
  }
  
  .metrics-section {
    border: 2px solid rgba(255, 255, 255, 0.3);
  }
}

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .data-card,
  .connect-btn,
  .disconnect-btn,
  .sync-btn,
  .export-btn,
  .chat-btn,
  .hourly-bar {
    transition: none;
  }
  
  .data-card.tooltip-enabled::before {
    display: none;
  }
}
</style> 