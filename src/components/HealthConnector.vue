<template>
  <div class="health-connector">
    <!-- Connection Status -->
    <div class="status-card" :class="{ connected: isConnected }">
      <div class="status-icon">
        <span v-if="isConnected">✓</span>
        <span v-else>⚡</span>
      </div>
      <div class="status-content">
        <h3 v-if="isConnected">
          {{ isSampleDataMode ? 'Connected to Sample Data' : 'Connected to Demo Mode' }}
        </h3>
        <h3 v-else>Not Connected</h3>
        <p v-if="isConnected">
          {{ isSampleDataMode ? `Viewing real health data for User ${selectedUserId}` : 'Your health data is syncing automatically' }}
        </p>
        <p v-else>Connect to demo mode or sample data to see health metrics</p>
      </div>
    </div>

    <!-- Connect Buttons -->
    <div class="connect-section" v-if="!isConnected">
      <div class="button-group">
        <button 
          @click="connectService" 
          class="connect-btn"
          :disabled="isConnecting"
        >
          <span v-if="!isConnecting">Connect</span>
          <span v-else>Connecting...</span>
        </button>
      </div>
    </div>
    
    <!-- Disconnect Button -->
    <div class="connect-section" v-else>
      <button 
        @click="disconnectService" 
        class="disconnect-btn"
      >
        Disconnect
      </button>
    </div>

    <!-- Health Data Display -->
    <div v-if="isConnected" class="health-data">
      <h3>Your Health Data</h3>
      
      <!-- Basic Metrics -->
      <div class="metrics-section">
        <h4>Today's Activity</h4>
        <div class="data-grid">
          <div class="data-card">
            <div class="data-icon">🚶</div>
            <div class="data-content">
              <h4>Steps Today</h4>
              <p class="data-value">{{ healthData.steps || '0' }}</p>
            </div>
          </div>
          
          <div class="data-card">
            <div class="data-icon">🔥</div>
            <div class="data-content">
              <h4>Calories Burned</h4>
              <p class="data-value">{{ healthData.calories || '0' }}</p>
            </div>
          </div>
          
          <div class="data-card">
            <div class="data-icon">⏱️</div>
            <div class="data-content">
              <h4>Active Minutes</h4>
              <p class="data-value">{{ healthData.activeMinutes || '0' }}</p>
            </div>
          </div>
          
          <div class="data-card">
            <div class="data-icon">💓</div>
            <div class="data-content">
              <h4>Heart Rate</h4>
              <p class="data-value">{{ healthData.heartRate || '--' }} BPM</p>
            </div>
          </div>
        </div>
      </div>

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
          
          <div class="data-card">
            <div class="data-icon">🌙</div>
            <div class="data-content">
              <h4>Time Asleep</h4>
              <p class="data-value">{{ formatTime(healthData.totalMinutesAsleep || 0) }}</p>
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
          <div class="data-card">
            <div class="data-icon">⚖️</div>
            <div class="data-content">
              <h4>Weight (kg)</h4>
              <p class="data-value">{{ (healthData.weightKg || 0).toFixed(1) }}</p>
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
          
          <div class="data-card">
            <div class="data-icon">📈</div>
            <div class="data-content">
              <h4>BMI</h4>
              <p class="data-value">{{ (healthData.bmi || 0).toFixed(1) }}</p>
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

      <!-- Sync Button -->
      <button @click="syncHealthData" class="sync-btn" :disabled="isSyncing">
        <span v-if="!isSyncing">Sync Latest Data</span>
        <span v-else>Syncing...</span>
      </button>

      <!-- Chat with Health Data Button -->
      <div class="chat-section">
        <button @click="openChat" class="chat-btn">
          <span class="chat-icon">💬</span>
          Chat with Your Health Data
        </button>
        <p class="chat-description">
          Ask questions about your health metrics, get insights, and track your progress
        </p>
      </div>
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
      v-if="isChatOpen" 
      :isConnected="isConnected"
      @close="isChatOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DemoHealthService } from '../services/DemoHealthService'
import { SampleDataService } from '../services/SampleDataService'
import type { HealthData } from '../services/GoogleFitService'
import HealthChat from './HealthChat.vue'

// Reactive state
const isConnected = ref(false)
const isConnecting = ref(false)
const isSyncing = ref(false)
const isChatOpen = ref(false)
const isSampleDataMode = ref(false)
const selectedUserId = ref('')
const availableUsers = ref<string[]>([])
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

// Health service instances
const demoService = new DemoHealthService()
const sampleDataService = new SampleDataService()
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
    }
    
    await syncHealthData()
  } catch (error) {
    console.error('Failed to connect:', error)
    alert('Failed to connect. Please try again.')
  } finally {
    isConnecting.value = false
  }
}

// Handle user selection change
const onUserChange = async () => {
  if (isSampleDataMode.value && isConnected.value) {
    sampleDataService.setCurrentUser(selectedUserId.value)
    await syncHealthData()
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

// Open chat interface
const openChat = () => {
  isChatOpen.value = true
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
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.status-card.connected {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.4);
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.status-card.connected .status-icon {
  background: rgba(34, 197, 94, 0.3);
}

.status-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.status-content p {
  margin: 0;
  opacity: 0.8;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.connect-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
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
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.user-selector label {
  color: #e2e8f0;
  font-weight: 500;
  font-size: 0.9rem;
}

.user-select {
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.user-select:hover {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.15);
}

.user-select option {
  background: #1e293b;
  color: white;
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

.sync-btn {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  margin: 1rem 0;
}

.sync-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
}

.sync-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.instructions {
  margin-top: 2rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.instructions h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #f8fafc;
}

.instructions ol {
  text-align: left;
  margin: 0;
  padding-left: 1.5rem;
  color: #e2e8f0;
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
  color: #fef3c7;
  font-size: 0.9rem;
  line-height: 1.5;
}

.note strong {
  color: #fbbf24;
}

.chat-section {
  text-align: center;
  margin-top: 2rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.chat-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
}

.chat-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
}

.chat-icon {
  font-size: 1.2rem;
}

.chat-description {
  margin: 0;
  color: #e2e8f0;
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
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
}

.metrics-section h4 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  color: #f8fafc;
  font-weight: 600;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.data-card {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.data-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.data-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.data-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #e2e8f0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-value {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #f8fafc;
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


@media (max-width: 768px) {
  .data-grid {
    grid-template-columns: 1fr;
  }
  
  .health-connector {
    padding: 1rem;
  }
}
</style> 