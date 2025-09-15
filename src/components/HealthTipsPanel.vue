<template>
  <div class="health-tips-panel" v-if="tips.length > 0">
    <div class="tips-header">
      <div class="tips-title">
        <span class="tips-icon">💡</span>
        <h3>Personalized Health Tips</h3>
      </div>
      <button @click="refreshTips" class="refresh-btn" :disabled="isLoading">
        <span class="refresh-icon" :class="{ spinning: isLoading }">🔄</span>
      </button>
    </div>

    <div class="tips-content">
      <div 
        v-for="tip in tips" 
        :key="tip.id" 
        class="tip-card"
        :class="[`priority-${tip.priority}`, `category-${tip.category}`]"
      >
        <div class="tip-header">
          <h4 class="tip-title">{{ tip.title }}</h4>
          <div class="tip-meta">
            <span class="tip-category">{{ formatCategory(tip.category) }}</span>
            <span class="tip-priority" :class="`priority-${tip.priority}`">
              {{ formatPriority(tip.priority) }}
            </span>
          </div>
        </div>
        
        <p class="tip-description">{{ tip.description }}</p>
        
        <div class="tip-footer">
          <div class="tip-basis">
            <span class="basis-label">Based on:</span>
            <span class="basis-items">{{ tip.basedOn.join(', ') }}</span>
          </div>
          <div class="tip-time">
            {{ formatTime(tip.timestamp) }}
          </div>
        </div>
      </div>
    </div>

    <div class="tips-footer">
      <p class="tips-note">
        Tips are generated based on your recent chat history and health data
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { HealthTipsService, HealthTip } from '../services/HealthTipsService'

// Props
interface Props {
  sessionId?: string
  autoRefresh?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoRefresh: true
})

// State
const tips = ref<HealthTip[]>([])
const isLoading = ref(false)
const healthTipsService = new HealthTipsService()

// Methods
const loadTips = async () => {
  isLoading.value = true
  try {
    console.log('HealthTipsPanel: Loading health tips...')
    const generatedTips = await healthTipsService.generateHealthTips(props.sessionId)
    tips.value = generatedTips
    console.log('HealthTipsPanel: Loaded tips:', generatedTips.length)
  } catch (error) {
    console.error('HealthTipsPanel: Failed to load tips:', error)
  } finally {
    isLoading.value = false
  }
}

const refreshTips = async () => {
  await loadTips()
}

const formatCategory = (category: string): string => {
  const categoryMap: Record<string, string> = {
    exercise: 'Exercise',
    nutrition: 'Nutrition',
    sleep: 'Sleep',
    stress: 'Stress Relief',
    hydration: 'Hydration',
    general: 'General Health'
  }
  return categoryMap[category] || 'General'
}

const formatPriority = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    high: 'High Priority',
    medium: 'Medium Priority',
    low: 'Low Priority'
  }
  return priorityMap[priority] || 'Medium Priority'
}

const formatTime = (timestamp: Date): string => {
  return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Lifecycle
onMounted(() => {
  if (props.autoRefresh) {
    loadTips()
  }
})

// Expose methods for parent components
defineExpose({
  loadTips,
  refreshTips
})
</script>

<style scoped>
.health-tips-panel {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  color: white;
}

.tips-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.tips-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.tips-icon {
  font-size: 1.5rem;
}

.tips-title h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-icon {
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.tips-content {
  display: grid;
  gap: var(--spacing-md);
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.tip-card {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: var(--spacing-md);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.tip-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.tip-card.priority-high {
  border-left: 4px solid #ff6b6b;
}

.tip-card.priority-medium {
  border-left: 4px solid #ffd93d;
}

.tip-card.priority-low {
  border-left: 4px solid #6bcf7f;
}

.tip-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
}

.tip-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  flex: 1;
  margin-right: var(--spacing-sm);
}

.tip-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-xs);
}

.tip-category {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.tip-priority {
  font-size: 0.7rem;
  font-weight: 500;
  opacity: 0.8;
}

.tip-priority.priority-high {
  color: #ff6b6b;
}

.tip-priority.priority-medium {
  color: #ffd93d;
}

.tip-priority.priority-low {
  color: #6bcf7f;
}

.tip-description {
  margin: 0 0 var(--spacing-sm) 0;
  line-height: 1.5;
  opacity: 0.9;
}

.tip-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  opacity: 0.7;
}

.tip-basis {
  flex: 1;
}

.basis-label {
  font-weight: 500;
  margin-right: var(--spacing-xs);
}

.basis-items {
  font-style: italic;
}

.tip-time {
  font-size: 0.75rem;
}

.tips-footer {
  margin-top: var(--spacing-lg);
  text-align: center;
}

.tips-note {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.8;
  font-style: italic;
}

/* Category-specific styling */
.tip-card.category-exercise {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.2) 0%, rgba(255, 107, 107, 0.1) 100%);
}

.tip-card.category-nutrition {
  background: linear-gradient(135deg, rgba(255, 217, 61, 0.2) 0%, rgba(255, 217, 61, 0.1) 100%);
}

.tip-card.category-sleep {
  background: linear-gradient(135deg, rgba(107, 207, 127, 0.2) 0%, rgba(107, 207, 127, 0.1) 100%);
}

.tip-card.category-stress {
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.2) 0%, rgba(155, 89, 182, 0.1) 100%);
}

.tip-card.category-hydration {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.2) 0%, rgba(52, 152, 219, 0.1) 100%);
}

.tip-card.category-general {
  background: linear-gradient(135deg, rgba(149, 165, 166, 0.2) 0%, rgba(149, 165, 166, 0.1) 100%);
}

/* Responsive design */
@media (max-width: 768px) {
  .health-tips-panel {
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }
  
  .tips-content {
    grid-template-columns: 1fr;
  }
  
  .tip-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
  
  .tip-meta {
    align-items: flex-start;
    flex-direction: row;
    gap: var(--spacing-sm);
  }
  
  .tip-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
}
</style>
