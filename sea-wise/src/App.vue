<script setup lang="ts">
import HealthConnector from './components/HealthConnector.vue'
import { onMounted } from 'vue'

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
</script>

<template>
  <div class="app">
    <header class="app-header">
      <h1>SEA-WISE Health Connector</h1>
      <p>Connect your health devices and sync your wellness data</p>
    </header>
    <main class="app-main">
      <HealthConnector />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.app-header {
  text-align: center;
  padding: 2rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.app-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.app-header p {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.app-main {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}
</style>
