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
      <div class="container container-xl">
        <h1>SEA-WISE Health Connector</h1>
        <p>Connect your health devices and sync your wellness data</p>
      </div>
    </header>
    <main class="app-main">
      <div class="container container-xl">
        <HealthConnector />
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
  text-align: center;
  padding: var(--spacing-lg) var(--spacing-md);
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  margin: 0 auto;
  line-height: 1.5;
}

.app-main {
  padding: var(--spacing-lg) var(--spacing-md);
  width: 100%;
}

/* Mobile-first responsive adjustments */
@media (max-width: 480px) {
  .app-header {
    padding: var(--spacing-md) var(--spacing-sm);
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
