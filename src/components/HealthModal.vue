<template>
  <div v-if="isVisible" class="health-modal-overlay" @click="closeModal">
    <div class="health-modal" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="modal-title">
          <span class="metric-icon">{{ getMetricIcon(insight?.metric) }}</span>
          <h2>{{ getMetricTitle(insight?.metric) }}</h2>
        </div>
        <button @click="closeModal" class="close-btn">×</button>
      </div>

      <!-- Modal Content -->
      <div class="modal-content">
        <!-- Health Status Overview -->
        <div class="status-section">
          <div class="status-card" :class="`status-${insight?.healthStatus}`">
            <div class="status-header">
              <span class="status-icon">{{ getStatusIcon(insight?.healthStatus) }}</span>
              <div class="status-info">
                <h3>{{ getStatusText(insight?.healthStatus) }}</h3>
                <p class="status-description">{{ insight?.context }}</p>
              </div>
            </div>
            <div class="metric-display">
              <span class="metric-value">{{ insight?.value }}{{ insight?.unit ? ` ${insight?.unit}` : '' }}</span>
              <span class="metric-label">{{ insight?.metric }}</span>
            </div>
          </div>
        </div>

        <!-- Fitness Standards -->
        <div class="info-section">
          <h3>🏆 Fitness Standards</h3>
          <div class="fitness-info">
            <p><strong>Current Level:</strong> {{ insight?.fitnessStandard }}</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: getProgressPercentage() + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- Cultural Health Practices -->
        <div class="info-section" v-if="insight?.culturalSuggestions?.length">
          <h3>🌍 Cultural Health Practices</h3>
          <div class="region-selector">
            <label for="region-select">View practices from:</label>
            <select 
              id="region-select" 
              v-model="selectedRegion" 
              @change="updateCulturalContext"
              class="region-select"
            >
              <option value="asian">Asian Traditions</option>
              <option value="mediterranean">Mediterranean</option>
              <option value="nordic">Nordic</option>
              <option value="latin_american">Latin American</option>
            </select>
          </div>
          <div class="cultural-practices">
            <div 
              v-for="(suggestion, index) in insight.culturalSuggestions.slice(0, 4)" 
              :key="index"
              class="cultural-practice"
            >
              {{ suggestion }}
            </div>
          </div>
        </div>

        <!-- Recommendations -->
        <div class="info-section" v-if="insight?.generalRecommendations?.length">
          <h3>💡 Personalized Recommendations</h3>
          <div class="recommendations">
            <div 
              v-for="(recommendation, index) in insight.generalRecommendations.slice(0, 4)" 
              :key="index"
              class="recommendation"
            >
              <span class="recommendation-icon">→</span>
              {{ recommendation }}
            </div>
          </div>
        </div>

        <!-- Cultural Context -->
        <div class="info-section" v-if="culturalContext">
          <h3>{{ culturalContext.region }} Health Traditions</h3>
          <div class="cultural-context">
            <div class="context-group">
              <h4>Traditional Practices</h4>
              <ul>
                <li v-for="practice in culturalContext.traditionalPractices.slice(0, 3)" :key="practice">
                  {{ practice }}
                </li>
              </ul>
            </div>
            <div class="context-group">
              <h4>Cultural Values</h4>
              <ul>
                <li v-for="value in culturalContext.culturalValues.slice(0, 3)" :key="value">
                  {{ value }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="modal-actions">
          <button @click="closeModal" class="btn-secondary">Close</button>
          <button @click="openChat" class="btn-primary">Ask AI Health Assistant</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { HealthInsight, CulturalHealthContext } from '../services/HealthInsightsService'
import { HealthInsightsService } from '../services/HealthInsightsService'

// Props
interface Props {
  insight: HealthInsight | null
  isVisible: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  openChat: []
}>()

// Reactive state
const selectedRegion = ref('asian')
const culturalContext = ref<CulturalHealthContext | null>(null)
const healthInsightsService = new HealthInsightsService()

// Methods
const closeModal = () => {
  emit('close')
}

const openChat = () => {
  emit('openChat')
}

const getMetricIcon = (metric: string | undefined): string => {
  switch (metric) {
    case 'steps': return '🚶'
    case 'calories': return '🔥'
    case 'sleep': return '😴'
    case 'heartRate': return '💓'
    case 'weight': return '⚖️'
    case 'activity': return '⏱️'
    case 'bmi': return '📊'
    default: return '📈'
  }
}

const getMetricTitle = (metric: string | undefined): string => {
  switch (metric) {
    case 'steps': return 'Daily Steps Analysis'
    case 'calories': return 'Calories Burned Analysis'
    case 'sleep': return 'Sleep Quality Analysis'
    case 'heartRate': return 'Heart Rate Analysis'
    case 'weight': return 'Weight & Body Composition'
    case 'activity': return 'Physical Activity Analysis'
    case 'bmi': return 'BMI & Health Assessment'
    default: return 'Health Metric Analysis'
  }
}

const getStatusIcon = (status: string | undefined): string => {
  switch (status) {
    case 'excellent': return '🌟'
    case 'good': return '✅'
    case 'fair': return '⚠️'
    case 'poor': return '❌'
    case 'needs_attention': return '🚨'
    default: return 'ℹ️'
  }
}

const getStatusText = (status: string | undefined): string => {
  switch (status) {
    case 'excellent': return 'Excellent'
    case 'good': return 'Good'
    case 'fair': return 'Fair'
    case 'poor': return 'Poor'
    case 'needs_attention': return 'Needs Attention'
    default: return 'Unknown'
  }
}

const getProgressPercentage = (): number => {
  if (!props.insight) return 0
  
  switch (props.insight.healthStatus) {
    case 'excellent': return 100
    case 'good': return 80
    case 'fair': return 60
    case 'poor': return 40
    case 'needs_attention': return 20
    default: return 50
  }
}

const updateCulturalContext = () => {
  culturalContext.value = healthInsightsService.getCulturalHealthContext(selectedRegion.value)
}

// Lifecycle
onMounted(() => {
  updateCulturalContext()
})
</script>

<style scoped>
.health-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 1rem 1rem 1rem;
  animation: modalFadeIn 0.3s ease-out;
}

.health-modal {
  background: #1e293b;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(59, 130, 246, 0.3);
  animation: modalSlideIn 0.3s ease-out;
  margin-top: 2rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid rgba(59, 130, 246, 0.2);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1));
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.metric-icon {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.modal-title h2 {
  margin: 0;
  color: #f8fafc;
  font-size: 1.5rem;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.modal-content {
  padding: 2rem;
}

.status-section {
  margin-bottom: 2rem;
}

.status-card {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1));
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 16px;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

.status-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.status-card.status-excellent::before {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}

.status-card.status-good::before {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.status-card.status-fair::before {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.status-card.status-poor::before {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.status-card.status-needs_attention::before {
  background: linear-gradient(90deg, #ec4899, #f472b6);
}

.status-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.status-icon {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.status-info h3 {
  margin: 0 0 0.25rem 0;
  color: #f8fafc;
  font-size: 1.25rem;
  font-weight: 700;
}

.status-description {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.9rem;
}

.metric-display {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.metric-value {
  display: block;
  font-size: 2.5rem;
  font-weight: 800;
  color: #60a5fa;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: 0.5rem;
}

.metric-label {
  display: block;
  font-size: 0.9rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(148, 163, 184, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.info-section h3 {
  margin: 0 0 1rem 0;
  color: #f1f5f9;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.fitness-info p {
  margin: 0 0 1rem 0;
  color: #e2e8f0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(148, 163, 184, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.region-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.region-selector label {
  color: #cbd5e1;
  font-weight: 500;
}

.region-select {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.4);
  border-radius: 8px;
  color: #f8fafc;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.region-select:hover {
  border-color: rgba(59, 130, 246, 0.6);
  background: rgba(15, 23, 42, 0.9);
}

.region-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.cultural-practices {
  display: grid;
  gap: 0.75rem;
}

.cultural-practice {
  background: rgba(59, 130, 246, 0.1);
  color: #93c5fd;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
  font-size: 0.9rem;
  line-height: 1.4;
}

.recommendations {
  display: grid;
  gap: 0.75rem;
}

.recommendation {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(34, 197, 94, 0.1);
  color: #86efac;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #22c55e;
  font-size: 0.9rem;
  line-height: 1.4;
}

.recommendation-icon {
  color: #22c55e;
  font-weight: bold;
  font-size: 1.1rem;
}

.cultural-context {
  display: grid;
  gap: 1.5rem;
}

.context-group h4 {
  margin: 0 0 0.75rem 0;
  color: #e2e8f0;
  font-size: 1rem;
  font-weight: 600;
}

.context-group ul {
  margin: 0;
  padding-left: 1.25rem;
  color: #cbd5e1;
}

.context-group li {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 2px solid rgba(148, 163, 184, 0.2);
}

.btn-secondary, .btn-primary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-secondary {
  background: rgba(148, 163, 184, 0.2);
  color: #cbd5e1;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.btn-secondary:hover {
  background: rgba(148, 163, 184, 0.3);
  color: #e2e8f0;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .health-modal-overlay {
    padding: 1rem 0.5rem 0.5rem 0.5rem;
  }
  
  .health-modal {
    margin: 1rem 0.5rem;
    max-height: 90vh;
  }
  
  .modal-header {
    padding: 1rem 1.5rem;
  }
  
  .modal-content {
    padding: 1.5rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .btn-secondary, .btn-primary {
    width: 100%;
  }
}
</style>
