<template>
  <div class="oauth-callback">
    <div class="callback-content">
      <div v-if="isProcessing" class="processing">
        <div class="spinner"></div>
        <h3>Processing authentication...</h3>
        <p>Please wait while we complete your connection to Google Fit.</p>
      </div>
      
      <div v-else-if="isSuccess" class="success">
        <div class="success-icon">✓</div>
        <h3>Successfully Connected!</h3>
        <p>You can now close this window and return to the main app.</p>
        <button @click="closeWindow" class="close-btn">Close Window</button>
      </div>
      
      <div v-else-if="isError" class="error">
        <div class="error-icon">✗</div>
        <h3>Connection Failed</h3>
        <p>{{ errorMessage }}</p>
        <button @click="retry" class="retry-btn">Try Again</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isProcessing = ref(true)
const isSuccess = ref(false)
const isError = ref(false)
const errorMessage = ref('')

onMounted(() => {
  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get('code')
  const error = urlParams.get('error')
  
  if (error) {
    handleError(error)
  } else if (code) {
    handleSuccess(code)
  } else {
    handleError('No authorization code received')
  }
})

const handleSuccess = (code: string) => {
  // Send the authorization code back to the parent window
  if (window.opener) {
    window.opener.postMessage({
      type: 'GOOGLE_FIT_AUTH_SUCCESS',
      code: code
    }, window.location.origin)
    
    isProcessing.value = false
    isSuccess.value = true
  } else {
    handleError('Unable to communicate with parent window')
  }
}

const handleError = (error: string) => {
  isProcessing.value = false
  isError.value = true
  errorMessage.value = error
  
  // Send error message to parent window
  if (window.opener) {
    window.opener.postMessage({
      type: 'GOOGLE_FIT_AUTH_ERROR',
      error: error
    }, window.location.origin)
  }
}

const closeWindow = () => {
  window.close()
}

const retry = () => {
  // Redirect back to Google OAuth
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}&` +
    `redirect_uri=${encodeURIComponent(window.location.origin + '/oauth-callback')}&` +
    `scope=${encodeURIComponent('https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.heart_rate.read')}&` +
    `response_type=code&` +
    `access_type=offline&` +
    `prompt=consent`
  
  window.location.href = authUrl
}
</script>

<style scoped>
.oauth-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.callback-content {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 400px;
  width: 90%;
}

.processing .spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.success-icon, .error-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin: 0 auto 1rem;
}

.success-icon {
  background: rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.error-icon {
  background: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

p {
  margin: 0 0 1.5rem 0;
  opacity: 0.9;
  line-height: 1.5;
}

.close-btn, .retry-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn {
  background: rgba(34, 197, 94, 0.8);
  color: white;
}

.close-btn:hover {
  background: rgba(34, 197, 94, 1);
  transform: translateY(-1px);
}

.retry-btn {
  background: rgba(59, 130, 246, 0.8);
  color: white;
}

.retry-btn:hover {
  background: rgba(59, 130, 246, 1);
  transform: translateY(-1px);
}
</style> 