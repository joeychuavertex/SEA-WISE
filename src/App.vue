<script setup lang="ts">
import HealthConnector from './components/HealthConnector.vue'
import PersonalInfoPanel from './components/PersonalInfoPanel.vue'
import { onMounted, ref } from 'vue'

// Connection state
const isConnected = ref(false)
const isConnecting = ref(false)
const isSyncing = ref(false)
const healthConnectorRef = ref()

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
</script>

<template>
  <div class="app">
    <!-- Skip to main content link for keyboard users -->
    <a href="#main-content" class="skip-link">Skip to main content</a>
    
    <header class="app-header" role="banner">
      <div class="container container-xl">
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
            </div>
          </div>
        </div>
      </div>
    </header>
    
    <main id="main-content" class="app-main" role="main" tabindex="-1">
      <div class="container container-xl">
        <div class="main-layout">
          <div class="sidebar">
            <PersonalInfoPanel />
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
}

.app-header {
  padding: var(--spacing-lg) var(--spacing-md);
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header-text {
  flex: 1;
  text-align: left;
}

.header-actions {
  flex-shrink: 0;
}

.header-connect-btn, .header-disconnect-btn, .header-sync-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.header-connected-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
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
  padding: var(--spacing-lg) var(--spacing-md);
  width: 100%;
}

.main-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
  align-items: start;
}

.main-content {
  min-width: 0; /* Prevents grid overflow */
}

.sidebar {
  width: 100%;
}

/* Desktop layout - sidebar on the left */
@media (min-width: 1024px) {
  .main-layout {
    grid-template-columns: 350px 1fr;
    gap: var(--spacing-xl);
  }
  
  .sidebar {
    width: 350px;
  }
}

/* Large desktop layout - wider sidebar */
@media (min-width: 1400px) {
  .main-layout {
    grid-template-columns: 400px 1fr;
    gap: var(--spacing-2xl);
  }
  
  .sidebar {
    width: 400px;
  }
}

/* Mobile-first responsive adjustments */
@media (max-width: 480px) {
  .app-header {
    padding: var(--spacing-md) var(--spacing-sm);
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .header-text {
    text-align: center;
  }
  
  .header-actions {
    display: flex;
    justify-content: center;
  }
  
  .app-header h1 {
    font-size: 1.75rem;
  }
  
  .app-header p {
    font-size: 0.875rem;
    padding: 0 var(--spacing-sm);
  }
  
  .app-main {
    padding: var(--spacing-md) var(--spacing-sm);
  }
  
  .main-layout {
    gap: var(--spacing-md);
  }
  
  .header-connect-btn, .header-disconnect-btn {
    min-width: 100px;
    padding: 0.6rem 1.2rem;
    font-size: 0.85rem;
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
