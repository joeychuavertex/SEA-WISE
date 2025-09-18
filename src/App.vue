<script setup lang="ts">
import HealthConnector from './components/HealthConnector.vue'
import PersonalInfoPanel from './components/PersonalInfoPanel.vue'
import HealthGoalPlanner from './components/HealthGoalPlanner.vue'
import { onMounted, ref } from 'vue'
import type { HealthData } from './services/GoogleFitService'

// Connection state
const isConnected = ref(false)
const isConnecting = ref(false)
const isSyncing = ref(false)
const healthConnectorRef = ref()

// Health data
const healthData = ref<HealthData>({
  steps: 0,
  calories: 0,
  activeMinutes: 0,
  heartRate: 0
})

// Handle OAuth callback from Google
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const error = urlParams.get('error')
  
  if (code || error) {
    // Send message to parent window if this is a popup
    if (window.opener) {
              if (code) {
          window.opener.postMessage({
            type: 'GOOGLE_HEALTH_CONNECT_AUTH_SUCCESS',
            code: code
          }, window.location.origin)
        } else if (error) {
          window.opener.postMessage({
            type: 'GOOGLE_HEALTH_CONNECT_AUTH_ERROR',
            error: error
          }, window.location.origin)
        }
      window.close()
    } else {
      // If not a popup, clear the URL parameters
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }
  }
})

// Handle connection state changes from HealthConnector
const handleConnectionChanged = (connectionState: { isConnected: boolean, isConnecting: boolean, isSyncing?: boolean }) => {
  isConnected.value = connectionState.isConnected
  isConnecting.value = connectionState.isConnecting
  if (connectionState.isSyncing !== undefined) {
    isSyncing.value = connectionState.isSyncing
  }
}

// Handle health goal planner events
const handlePlanGenerated = (plan: any) => {
  console.log('Plan generated:', plan)
  // You can add additional logic here if needed
}

const handlePlanSaved = (plan: any) => {
  console.log('Plan saved:', plan)
  // You can add additional logic here if needed
}

// Connection methods
const connectService = () => {
  if (healthConnectorRef.value) {
    healthConnectorRef.value.connectService()
  }
}

const disconnectService = () => {
  if (healthConnectorRef.value) {
    healthConnectorRef.value.disconnectService()
  }
}

const syncHealthData = () => {
  if (healthConnectorRef.value) {
    healthConnectorRef.value.syncHealthData()
  }
}

const openChat = () => {
  if (healthConnectorRef.value) {
    healthConnectorRef.value.openChat()
  }
}
</script>

<template>
  <div class="app">
    <!-- Skip to main content link for keyboard users -->
    <a href="#main-content" class="skip-link">Skip to main content</a>
    
    <header class="app-header" role="banner">
      <div class="container">
        <div class="header-content">
          <div class="header-text">
            <h1>SEA-WISE Health Connector</h1>
            <p>Connect your health devices and sync your wellness data</p>
          </div>
          <div class="header-actions">
            <button 
              v-if="!isConnected" 
              @click="connectService" 
              class="header-connect-btn"
              :disabled="isConnecting"
              :aria-describedby="isConnecting ? 'connecting-status' : undefined"
              aria-label="Connect to health data service"
            >
              <span v-if="!isConnecting">Connect</span>
              <span v-else id="connecting-status">Connecting...</span>
            </button>
            <div v-else class="header-connected-actions">
              <button 
                @click="syncHealthData" 
                class="header-sync-btn"
                :disabled="isSyncing"
                :aria-describedby="isSyncing ? 'syncing-status' : undefined"
                aria-label="Sync latest health data"
              >
                <span v-if="!isSyncing">Sync</span>
                <span v-else id="syncing-status">Syncing...</span>
              </button>
              <button 
                @click="disconnectService" 
                class="header-disconnect-btn"
                aria-label="Disconnect from health data service"
              >
                Disconnect
              </button>
              <button 
                @click="openChat" 
                class="header-chat-btn"
                aria-label="Open chat with health data assistant"
              >
                <span class="chat-icon" aria-hidden="true">💬</span>
                Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
    
    <main id="main-content" class="app-main" role="main" tabindex="-1">
      <div class="container">
        <div class="main-layout">
          <div class="sidebar">
            <PersonalInfoPanel />
            <HealthGoalPlanner 
              :isConnected="isConnected"
              :healthData="healthData"
              @planGenerated="handlePlanGenerated"
              @planSaved="handlePlanSaved"
            />
          </div>
          <div class="main-content">
            <HealthConnector 
              ref="healthConnectorRef"
              @connection-changed="handleConnectionChanged"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: #f5f5f5;
  color: #000000;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  box-sizing: border-box;
}

.app-header {
  padding: var(--spacing-md) var(--spacing-sm);
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap;
}

.header-text {
  flex: 1;
  text-align: left;
}

.header-actions {
  flex-shrink: 0;
  max-width: 100%;
  overflow: hidden;
}

.header-connect-btn, .header-disconnect-btn, .header-sync-btn, .header-chat-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-connected-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  max-width: 100%;
  overflow: hidden;
}

.header-connect-btn {
  background: var(--primary-color);
  color: white;
}

.header-connect-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  background: var(--primary-hover);
}

.header-connect-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.header-sync-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.header-sync-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.header-sync-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.header-disconnect-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.header-disconnect-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.header-chat-btn {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.header-chat-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.chat-icon {
  font-size: 1rem;
}

.app-header h1 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: clamp(1.75rem, 6vw, 2.5rem);
  font-weight: 700;
  line-height: 1.2;
  color: var(--primary-color);
}

.app-header p {
  margin: 0;
  font-size: clamp(0.875rem, 3vw, 1.1rem);
  color: #374151;
  max-width: 600px;
  line-height: 1.5;
}

.app-main {
  padding: var(--spacing-md) var(--spacing-sm);
  width: 100%;
}

.main-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
  align-items: start;
  min-height: calc(100vh - 200px); /* Ensure minimum height for scrolling */
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.main-content {
  min-width: 0; /* Prevents grid overflow */
  max-width: 100%;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

.sidebar {
  width: 100%;
  max-width: 100%;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
}

/* Desktop layout - sidebar on the left */
@media (min-width: 1024px) {
  .main-layout {
    grid-template-columns: 350px 1fr;
    gap: var(--spacing-lg);
    min-height: calc(100vh - 200px);
  }
  
  .sidebar {
    width: 350px;
    max-height: calc(100vh - 200px);
    overflow-y: auto;
  }
  
  .main-content {
    max-height: calc(100vh - 200px);
    overflow-y: auto;
  }
}

/* Large desktop layout - wider sidebar */
@media (min-width: 1400px) {
  .main-layout {
    grid-template-columns: 400px 1fr;
    gap: var(--spacing-xl);
    min-height: calc(100vh - 200px);
  }
  
  .sidebar {
    width: 400px;
    max-height: calc(100vh - 200px);
    overflow-y: auto;
  }
  
  .main-content {
    max-height: calc(100vh - 200px);
    overflow-y: auto;
  }
}

/* Mobile-first responsive adjustments */
@media (max-width: 480px) {
  .app-header {
    padding: var(--spacing-sm) var(--spacing-xs);
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-md);
  }
  
  .header-text {
    text-align: center;
  }
  
  .header-actions {
    display: flex;
    justify-content: center;
    width: 100%;
  }
  
  .app-header h1 {
    font-size: clamp(1.5rem, 8vw, 2rem);
    margin-bottom: var(--spacing-xs);
  }
  
  .app-header p {
    font-size: clamp(0.8rem, 3.5vw, 1rem);
    padding: 0;
    line-height: 1.4;
  }
  
  .app-main {
    padding: var(--spacing-sm) var(--spacing-xs);
  }
  
  .main-layout {
    gap: var(--spacing-sm);
    min-height: auto;
  }
  
  .sidebar, .main-content {
    max-height: none;
    overflow-y: visible;
  }
  
  .header-connect-btn, .header-disconnect-btn, .header-sync-btn, .header-chat-btn {
    min-width: 100px;
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
    flex: 1;
    max-width: 150px;
  }
  
  .header-connected-actions {
    flex-direction: row;
    gap: 0.5rem;
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .header-connected-actions .header-sync-btn,
  .header-connected-actions .header-chat-btn,
  .header-connected-actions .header-disconnect-btn {
    flex: 1;
    min-width: 100px;
    max-width: 120px;
  }
}

@media (min-width: 481px) and (max-width: 640px) {
  .app-header {
    padding: var(--spacing-md) var(--spacing-sm);
  }
  
  .header-content {
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-lg);
  }
  
  .header-text {
    text-align: center;
  }
  
  .header-actions {
    display: flex;
    justify-content: center;
    width: 100%;
  }
  
  .app-main {
    padding: var(--spacing-md) var(--spacing-sm);
  }
  
  .main-layout {
    gap: var(--spacing-md);
    min-height: auto;
  }
  
  .sidebar, .main-content {
    max-height: none;
    overflow-y: visible;
  }
  
  .header-connected-actions {
    flex-direction: row;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .header-connect-btn, .header-disconnect-btn, .header-sync-btn, .header-chat-btn {
    min-width: 120px;
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  .app-header {
    padding: var(--spacing-lg) var(--spacing-md);
  }
  
  .header-content {
    flex-direction: row;
    align-items: center;
    gap: 2rem;
  }
  
  .header-text {
    text-align: left;
    flex: 1;
  }
  
  .header-actions {
    flex-shrink: 0;
  }
  
  .app-main {
    padding: var(--spacing-lg) var(--spacing-md);
  }
  
  .main-layout {
    gap: var(--spacing-lg);
    min-height: auto;
  }
  
  .sidebar, .main-content {
    max-height: none;
    overflow-y: visible;
  }
  
  .header-connected-actions {
    flex-direction: row;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  
  .header-connect-btn, .header-disconnect-btn, .header-sync-btn, .header-chat-btn {
    min-width: 120px;
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }
}

@media (min-width: 769px) and (max-width: 1023px) {
  .app-header {
    padding: var(--spacing-xl) var(--spacing-lg);
  }
  
  .app-main {
    padding: var(--spacing-xl) var(--spacing-lg);
  }
  
  .main-layout {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
    max-width: 800px;
    margin: 0 auto;
  }
  
  .sidebar {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .main-content {
    width: 100%;
  }
}

@media (min-width: 768px) {
  .app-header {
    padding: var(--spacing-xl) var(--spacing-lg);
  }
  
  .app-main {
    padding: var(--spacing-xl) var(--spacing-lg);
  }
}

@media (min-width: 1024px) {
  .app-main {
    padding: var(--spacing-xl) var(--spacing-lg);
  }
}

@media (min-width: 1400px) {
  .app-header {
    padding: var(--spacing-2xl) var(--spacing-xl);
  }
  
  .app-main {
    padding: var(--spacing-2xl) var(--spacing-xl);
  }
}

@media (min-width: 1600px) {
  .app-header {
    padding: var(--spacing-2xl) var(--spacing-xl);
  }
  
  .app-main {
    padding: var(--spacing-2xl) var(--spacing-xl);
  }
}

/* Landscape orientation adjustments for mobile */
@media (max-width: 768px) and (orientation: landscape) {
  .app-header {
    padding: var(--spacing-md) var(--spacing-lg);
  }
  
  .app-header h1 {
    font-size: clamp(1.5rem, 4vw, 2rem);
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .app-header {
    border-bottom-width: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .app {
    background: #f5f5f5;
  }
}
</style>
