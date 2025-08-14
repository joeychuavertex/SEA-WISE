<template>
  <div class="health-connector">
    <!-- Connection Status -->
    <div class="status-card" :class="{ connected: isConnected }">
      <div class="status-icon">
        <span v-if="isConnected">✓</span>
        <span v-else>⚡</span>
      </div>
      <div class="status-content">
        <h3>{{ isConnected ? 'Connected to Demo Mode' : 'Not Connected' }}</h3>
        <p>{{ isConnected ? 'Your health data is syncing automatically' : 'Connect to demo mode to see sample health data' }}</p>
      </div>
    </div>

    <!-- Connect Buttons -->
    <div class="connect-section" v-if="!isConnected">
      <div class="button-group">
        <button 
          @click="connectDemo" 
          class="connect-btn demo-btn"
          :disabled="isConnecting"
        >
          <span v-if="!isConnecting">Connect Demo Mode</span>
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
      
      <!-- Data Cards -->
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
        <ol>
          <li>Click the "Connect Demo Mode" button above</li>
          <li>Demo mode will simulate realistic health data</li>
          <li>Data updates automatically to show real-time changes</li>
          <li>Perfect for testing and development</li>
        </ol>
        
        <div class="note">
          <strong>Note:</strong> Demo mode generates simulated data for testing purposes. No real health data is collected.
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
import HealthChat from './HealthChat.vue'

// Reactive state
const isConnected = ref(false)
const isConnecting = ref(false)
const isSyncing = ref(false)
const isChatOpen = ref(false)
const healthData = ref({
  steps: 0,
  calories: 0,
  activeMinutes: 0,
  heartRate: 0
})

// Health service instance (Demo only)
const demoService = new DemoHealthService()
let currentService = demoService // Default to demo mode

// Check connection status on mount
onMounted(async () => {
  // Start with demo service by default
  currentService = demoService
  isConnected.value = await demoService.isConnected()
  
  if (isConnected.value) {
    await syncHealthData()
  }
})

// Connect to Demo service
const connectDemo = async () => {
  try {
    isConnecting.value = true
    currentService = demoService
    await demoService.connect()
    isConnected.value = true
    await syncHealthData()
  } catch (error) {
    console.error('Failed to connect to demo:', error)
    alert('Failed to connect to demo mode. Please try again.')
  } finally {
    isConnecting.value = false
  }
}

// Disconnect from current service
const disconnectService = async () => {
  try {
    await currentService.disconnect()
    isConnected.value = false
    healthData.value = { steps: 0, calories: 0, activeMinutes: 0, heartRate: 0 }
  } catch (error) {
    console.error('Failed to disconnect:', error)
  }
}

// Sync health data
const syncHealthData = async () => {
  if (!isConnected.value) return
  
  try {
    isSyncing.value = true
    const data = await currentService.getHealthData()
    healthData.value = data
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
  justify-content: center;
  flex-wrap: wrap;
}



.connect-btn, .disconnect-btn, .sync-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.connect-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.connect-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.connect-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.disconnect-btn {
  background: rgba(239, 68, 68, 0.8);
  color: white;
}

.disconnect-btn:hover {
  background: rgba(239, 68, 68, 1);
}

.health-data {
  margin-top: 2rem;
}

.health-data h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.data-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.data-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.data-content h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  opacity: 0.9;
}

.data-value {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #fbbf24;
}

.sync-btn {
  background: rgba(34, 197, 94, 0.8);
  color: white;
  width: 100%;
  margin-top: 1rem;
}

.sync-btn:hover:not(:disabled) {
  background: rgba(34, 197, 94, 1);
}

.sync-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.instructions {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.instructions h3 {
  margin: 0 0 1rem 0;
  text-align: center;
}

.instructions ol {
  margin: 0 0 1rem 0;
  padding-left: 1.5rem;
}

.instructions li {
  margin-bottom: 0.5rem;
  opacity: 0.9;
}

.note {
  padding: 1rem;
  background: rgba(251, 191, 36, 0.2);
  border-radius: 8px;
  border: 1px solid rgba(251, 191, 36, 0.3);
  font-size: 0.9rem;
}

.chat-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
}

.chat-btn {
  background: rgba(99, 102, 241, 0.8);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto 1rem auto;
}

.chat-btn:hover {
  background: rgba(99, 102, 241, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.chat-icon {
  font-size: 1.2rem;
}

.chat-description {
  margin: 0;
  opacity: 0.8;
  font-size: 0.9rem;
  line-height: 1.4;
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