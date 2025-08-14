<template>
  <div class="health-chat">
    <!-- Chat Header -->
    <div class="chat-header">
      <div class="chat-title">
        <span class="chat-icon">💬</span>
        <h3>Health Assistant</h3>
      </div>
      <div class="chat-controls">
        <button @click="toggleChat" class="toggle-btn">
          {{ isOpen ? '−' : '+' }}
        </button>
        <button @click="closeChat" class="close-btn">
          ×
        </button>
      </div>
    </div>

    <!-- Chat Interface -->
    <div v-if="isOpen" class="chat-interface">
      <!-- Messages Container -->
      <div class="messages-container" ref="messagesContainer">
        <div 
          v-for="(message, index) in messages" 
          :key="index" 
          class="message"
          :class="message.type"
        >
          <div class="message-content">
            <div class="message-text">{{ message.text }}</div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
        
        <!-- Loading indicator -->
        <div v-if="isLoading" class="message ai">
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="input-area">
        <input
          v-model="userInput"
          @keyup.enter="sendMessage"
          @keyup.esc="clearInput"
          type="text"
          placeholder="Ask about your health data..."
          class="message-input"
          :disabled="isLoading"
        />
        <button 
          @click="sendMessage" 
          class="send-btn"
          :disabled="!userInput.trim() || isLoading"
        >
          <span class="send-icon">➤</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { HealthChatService } from '../services/HealthChatService'

// Emits
interface Emits {
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

// Reactive state
const isOpen = ref(false)
const messages = ref<Array<{
  type: 'user' | 'ai'
  text: string
  timestamp: Date
}>>([])
const userInput = ref('')
const isLoading = ref(false)
const messagesContainer = ref<HTMLElement>()

// Chat service
const chatService = new HealthChatService()

// Initialize with welcome message
const initializeChat = () => {
  messages.value = [{
    type: 'ai',
    text: "Hello! I'm your health assistant. I can help you understand your health data, track your progress, and provide insights. What would you like to know about your health today?",
    timestamp: new Date()
  }]
}

// Toggle chat visibility
const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value && messages.value.length === 0) {
    initializeChat()
  }
}

// Close chat and emit close event
const closeChat = () => {
  isOpen.value = false
  emit('close')
}

// Send message
const sendMessage = async () => {
  const message = userInput.value.trim()
  if (!message || isLoading.value) return

  // Add user message
  messages.value.push({
    type: 'user',
    text: message,
    timestamp: new Date()
  })

  // Clear input and show loading
  userInput.value = ''
  isLoading.value = true

  try {
    // Get AI response
    const response = await chatService.sendMessage(message)
    
    // Add AI response
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
  bottom: 2rem;
  right: 2rem;
  width: 400px;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.85);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.chat-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chat-icon {
  font-size: 1.2rem;
}

.chat-title h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  transition: all 0.2s ease;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.close-btn {
  background: rgba(239, 68, 68, 0.8);
  border: none;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 1);
  transform: scale(1.05);
}

.chat-interface {
  height: 500px;
  display: flex;
  flex-direction: column;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  margin-bottom: 0.5rem;
}

.message.user {
  justify-content: flex-end;
}

.message.ai {
  justify-content: flex-start;
}

.message-content {
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 18px;
  position: relative;
}

.message.user .message-content {
  background: rgba(99, 102, 241, 0.9);
  color: white;
  border-bottom-right-radius: 4px;
}

.message.ai .message-content {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border-bottom-left-radius: 4px;
}

.message-text {
  margin-bottom: 0.25rem;
  line-height: 1.4;
  word-wrap: break-word;
}

.message-time {
  font-size: 0.75rem;
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
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.message-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
}

.message-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.message-input:focus {
  border-color: rgba(99, 102, 241, 0.8);
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.message-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.9);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.send-btn:hover:not(:disabled) {
  background: rgba(99, 102, 241, 1);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
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
  gap: 0.25rem;
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
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Responsive design */
@media (max-width: 768px) {
  .health-chat {
    width: calc(100vw - 2rem);
    right: 1rem;
    bottom: 1rem;
  }
  
  .chat-interface {
    height: 400px;
  }
}
</style> 