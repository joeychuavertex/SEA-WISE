<template>
  <div class="health-chat" role="dialog" aria-labelledby="chat-title" aria-describedby="chat-description">
    <!-- Chat Header -->
    <header class="chat-header">
      <div class="chat-title">
        <span class="chat-icon" aria-hidden="true">💬</span>
        <h3 id="chat-title">Health Assistant</h3>
      </div>
      <div class="chat-controls">
        <button 
          @click="closeChat" 
          class="close-btn"
          aria-label="Close chat"
          type="button"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </header>

    <!-- Chat Interface -->
    <div v-if="modelValue" class="chat-interface">
      <!-- Messages Container -->
      <div 
        class="messages-container" 
        ref="messagesContainer"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        <div 
          v-for="(message, index) in messages" 
          :key="index" 
          class="message"
          :class="message.type"
          :role="message.type === 'user' ? 'user-message' : 'assistant-message'"
        >
          <div class="message-content">
            <div class="message-text">{{ message.text }}</div>
            <div class="message-time" aria-label="Message sent at {{ formatTime(message.timestamp) }}">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
        
        <!-- Loading indicator -->
        <div v-if="isLoading" class="message ai" role="status" aria-label="AI is typing">
          <div class="message-content">
            <div class="typing-indicator" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span class="sr-only">AI is typing a response...</span>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="input-area">
        <label for="chat-input" class="sr-only">Type your message</label>
        <input
          id="chat-input"
          v-model="userInput"
          @keyup.enter="sendMessage"
          @keyup.esc="clearInput"
          @focus="onInputFocus"
          @blur="onInputBlur"
          type="text"
          placeholder="Ask about your health data..."
          class="message-input"
          :disabled="isLoading"
          aria-describedby="input-help"
        />
        <button 
          @click="sendMessage" 
          class="send-btn"
          :disabled="!userInput.trim() || isLoading"
          :aria-label="isLoading ? 'Sending message' : 'Send message'"
          type="button"
        >
          <span class="send-icon" aria-hidden="true">➤</span>
        </button>
        <div id="input-help" class="sr-only">Press Enter to send or Escape to clear</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { HealthChatService } from '../services/HealthChatService'

// Props
interface Props {
  isConnected: boolean
  modelValue: boolean // for v-model support
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'close'): void
  (e: 'update:modelValue', value: boolean): void
  (e: 'generateTips', sessionId?: string): void
}

const emit = defineEmits<Emits>()

// Reactive state
const isOpen = ref(props.modelValue)
const messages = ref<Array<{
  type: 'user' | 'ai'
  text: string
  timestamp: Date
}>>([])
const userInput = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement>()

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
  isOpen.value = newValue
})

// Watch for local changes
watch(isOpen, (newValue) => {
  emit('update:modelValue', newValue)
})

// Chat service with analytics enabled
const chatService = new HealthChatService(true)

// Initialize with welcome message
const initializeChat = () => {
  // Get a personalized welcome message based on health data
  const getWelcomeMessage = () => {
    try {
      // Try to get health data for a personalized greeting
      const healthData = chatService.getLatestHealthData?.()
      if (healthData) {
        const hasRecentData = healthData.steps > 0 || healthData.calories > 0
        if (hasRecentData) {
          return "Hello! I'm your health assistant. I can see you have some recent health data available. I can help you understand your health metrics, track your progress, and provide personalized insights. What would you like to know about your health today?"
        }
      }
    } catch (error) {
      console.log('Could not get health data for welcome message:', error)
    }
    
    return "Hello! I'm your health assistant. I can help you understand your health data, track your progress, and provide insights. What would you like to know about your health today?"
  }

  messages.value = [{
    type: 'ai',
    text: getWelcomeMessage(),
    timestamp: new Date()
  }]
}

// Close chat
const closeChat = async () => {
  // Log user interaction analytics
  await chatService.logUserInteraction('button_click', 'close-btn', 'button')
  
  // Get current session ID for tips generation
  const sessionInfo = chatService.getAnalyticsSession()
  const sessionId = sessionInfo?.sessionId
  
  isOpen.value = false
  emit('update:modelValue', false)
  emit('close')
  
  // Trigger health tips generation
  if (sessionId) {
    console.log('HealthChat: Triggering health tips generation for session:', sessionId)
    emit('generateTips', sessionId)
  }
}

// Send message
const sendMessage = async () => {
  const message = userInput.value.trim()
  if (!message || isLoading.value) return

  // Log user interaction analytics
  await chatService.logUserInteraction('button_click', 'send-btn', 'button')

  // Add user message to UI
  messages.value.push({
    type: 'user',
    text: message,
    timestamp: new Date()
  })

  // Clear input and show loading
  userInput.value = ''
  isLoading.value = true

  try {
    // Get AI response - the service will handle conversation history internally
    const response = await chatService.sendMessage(message)
    
    // Add AI response to UI
    messages.value.push({
      type: 'ai',
      text: response,
      timestamp: new Date()
    })
  } catch (error) {
    console.error('Chat error:', error)
    messages.value.push({
      type: 'ai',
      text: "I'm sorry, I encountered an error while processing your request. Please try again or rephrase your question.",
      timestamp: new Date()
    })
  } finally {
    isLoading.value = false
    await nextTick()
    scrollToBottom()
  }
}

// Clear input
const clearInput = () => {
  userInput.value = ''
}

// Input focus handler
const onInputFocus = async () => {
  await chatService.logUserInteraction('input_focus', 'message-input', 'input')
}

// Input blur handler
const onInputBlur = async () => {
  await chatService.logUserInteraction('input_blur', 'message-input', 'input')
}

// Scroll to bottom of messages
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Format timestamp
const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Watch for new messages and scroll to bottom
watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

// Initialize chat when component mounts
initializeChat()
</script>

<style scoped>
.health-chat {
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  width: clamp(320px, 90vw, 400px);
  height: clamp(300px, 60vh, 500px);
  z-index: 1000;
  background: var(--primary-light);
  border-radius: 16px;
  border: 1px solid var(--primary-color);
  box-shadow: 0 8px 32px rgba(37, 99, 235, 0.3);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--primary-color);
  flex-shrink: 0;
}

.chat-controls {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  justify-content: flex-end;
  min-height: 28px;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex: 1;
  min-width: 0;
}

.chat-icon {
  font-size: clamp(1rem, 3vw, 1.2rem);
  flex-shrink: 0;
}

.chat-title h3 {
  margin: 0;
  font-size: clamp(0.9rem, 2.5vw, 1.1rem);
  font-weight: 600;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #000000;
}

.close-btn {
  background: rgba(239, 68, 68, 0.8);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  flex-shrink: 0;
  min-height: 44px;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 1);
  transform: scale(1.05);
}

.close-btn:focus {
  outline: 2px solid #fbbf24;
  outline-offset: 2px;
}

.chat-interface {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  min-height: 0;
}

.messages-container {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.message {
  display: flex;
  margin-bottom: var(--spacing-sm);
}

.message.user {
  justify-content: flex-end;
}

.message.ai {
  justify-content: flex-start;
}

.message-content {
  max-width: 85%;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: 18px;
  position: relative;
  word-wrap: break-word;
}

.message.user .message-content {
  background: var(--primary-color);
  color: white;
  border-bottom-right-radius: 4px;
}

.message.ai .message-content {
  background: #f3f4f6;
  color: #000000;
  border-bottom-left-radius: 4px;
}

.message-text {
  margin-bottom: var(--spacing-xs);
  line-height: 1.4;
  font-size: clamp(0.875rem, 2.5vw, 0.9rem);
}

.message-time {
  font-size: clamp(0.7rem, 2vw, 0.75rem);
  opacity: 0.7;
  text-align: right;
}

.message.user .message-time {
  text-align: right;
}

.message.ai .message-time {
  text-align: left;
}

.input-area {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-top: 1px solid var(--primary-color);
  flex-shrink: 0;
}

.message-input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid #d1d5db;
  border-radius: 25px;
  background: #ffffff;
  color: #000000;
  font-size: clamp(0.875rem, 2.5vw, 0.9rem);
  outline: none;
  transition: all 0.2s ease;
  min-height: 44px;
}

.message-input::placeholder {
  color: #9ca3af;
}

.message-input:focus {
  border-color: var(--primary-color);
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.message-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-btn {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.send-btn:focus {
  outline: 2px solid #fbbf24;
  outline-offset: 2px;
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-icon {
  font-size: 0.9rem;
  transform: rotate(90deg);
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  gap: var(--spacing-xs);
  align-items: center;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Scrollbar styling */
.chat-interface::-webkit-scrollbar {
  width: 6px;
}

.chat-interface::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.chat-interface::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.chat-interface::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Mobile-first responsive design */
@media (max-width: 480px) {
  .health-chat {
    top: var(--spacing-sm);
    right: var(--spacing-sm);
    left: var(--spacing-sm);
    width: auto;
    max-height: calc(100vh - 2rem);
  }
  
  .chat-header {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .chat-title h3 {
    font-size: 0.9rem;
  }
  
  .close-btn {
    width: 28px;
    height: 28px;
    min-height: 28px;
  }
  
  .chat-interface {
    height: clamp(250px, 50vh, 400px);
  }
  
  .messages-container {
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
  }
  
  .message-content {
    max-width: 90%;
    padding: var(--spacing-sm);
  }
  
  .input-area {
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
  }
  
  .message-input {
    padding: var(--spacing-sm);
    font-size: 0.875rem;
  }
  
  .send-btn {
    width: 40px;
    height: 40px;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .health-chat {
    width: clamp(350px, 85vw, 400px);
    right: var(--spacing-md);
    top: var(--spacing-md);
  }
  
  .chat-interface {
    height: clamp(350px, 55vh, 450px);
  }
}

@media (min-width: 769px) {
  .health-chat {
    width: 400px;
    right: var(--spacing-lg);
    top: var(--spacing-lg);
  }
  
  .chat-interface {
    height: 500px;
  }
}

/* Landscape orientation adjustments for mobile */
@media (max-width: 768px) and (orientation: landscape) {
  .health-chat {
    top: var(--spacing-sm);
    bottom: var(--spacing-sm);
    max-height: calc(100vh - 2rem);
  }
  
  .chat-interface {
    height: clamp(200px, 40vh, 300px);
  }
  
  .chat-header {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .messages-container {
    padding: var(--spacing-sm);
  }
  
  .input-area {
    padding: var(--spacing-sm);
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .close-btn:hover,
  .send-btn:hover {
    transform: none;
  }
  
  .close-btn:active,
  .send-btn:active {
    transform: scale(0.95);
  }
  
  .message-input {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .health-chat {
    border-width: 2px;
  }
  
  .chat-header {
    border-bottom-width: 2px;
  }
  
  .input-area {
    border-top-width: 2px;
  }
  
  .close-btn,
  .send-btn {
    border: 2px solid white;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .health-chat,
  .close-btn,
  .send-btn {
    transition: none;
  }
  
  .typing-indicator span {
    animation: none;
    opacity: 0.8;
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

/* Print styles */
@media print {
  .health-chat {
    position: static;
    width: 100%;
    max-height: none;
    background: white;
    color: black;
    border: 1px solid #ccc;
    box-shadow: none;
  }
  
  .chat-header,
  .input-area {
    display: none;
  }
  
  .chat-interface {
    height: auto;
  }
  
  .messages-container {
    overflow: visible;
  }
}
</style> 