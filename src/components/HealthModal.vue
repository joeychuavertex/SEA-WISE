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
import { ref, onMounted } from 'vue'
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
  padding: var(--spacing-lg) var(--spacing-md) var(--spacing-md) var(--spacing-md);
  animation: modalFadeIn 0.3s ease-out;
  overflow-y: auto;
}

.health-modal {
  background: #ffffff;
  border-radius: clamp(16px, 4vw, 20px);
  max-width: min(600px, 95vw);
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(37, 99, 235, 0.3);
  border: 2px solid var(--primary-color);
  animation: modalSlideIn 0.3s ease-out;
  margin-top: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 2px solid var(--primary-color);
  background: var(--primary-light);
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
  min-width: 0;
}

.metric-icon {
  font-size: clamp(1.5rem, 5vw, 2rem);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  flex-shrink: 0;
}

.modal-title h2 {
  margin: 0;
  color: #000000;
  font-size: clamp(1.25rem, 4vw, 1.5rem);
  font-weight: 700;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.close-btn {
  background: var(--primary-color);
  border: none;
  color: #ffffff;
  font-size: clamp(1.5rem, 4vw, 2rem);
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: 50%;
  transition: all 0.2s ease;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-height: 44px;
}

.close-btn:hover {
  background: var(--primary-hover);
  color: #ffffff;
}

.close-btn:focus {
  outline: 2px solid #fbbf24;
  outline-offset: 2px;
}

.modal-content {
  padding: var(--spacing-lg);
}

.status-section {
  margin-bottom: var(--spacing-xl);
}

.status-card {
  background: var(--primary-light);
  border: 2px solid var(--primary-color);
  border-radius: 16px;
  padding: var(--spacing-lg);
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
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

.status-icon {
  font-size: clamp(1.5rem, 5vw, 2rem);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  flex-shrink: 0;
}

.status-info {
  flex: 1;
  min-width: 0;
}

.status-info h3 {
  margin: 0 0 var(--spacing-xs) 0;
  color: #000000;
  font-size: clamp(1rem, 3vw, 1.25rem);
  font-weight: 700;
  line-height: 1.3;
}

.status-description {
  margin: 0;
  color: #374151;
  font-size: clamp(0.875rem, 2.5vw, 0.9rem);
  line-height: 1.5;
}

.metric-display {
  text-align: center;
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.metric-value {
  display: block;
  font-size: clamp(2rem, 6vw, 2.5rem);
  font-weight: 800;
  color: var(--primary-color);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: var(--spacing-sm);
  line-height: 1.2;
}

.metric-label {
  display: block;
  font-size: clamp(0.8rem, 2.5vw, 0.9rem);
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-section {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.info-section h3 {
  margin: 0 0 var(--spacing-md) 0;
  color: #000000;
  font-size: clamp(1rem, 3vw, 1.1rem);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  line-height: 1.3;
}

.fitness-info p {
  margin: 0 0 var(--spacing-md) 0;
  color: #374151;
  font-size: clamp(0.875rem, 2.5vw, 1rem);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
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
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

.region-selector label {
  color: #374151;
  font-weight: 500;
  font-size: clamp(0.875rem, 2.5vw, 0.9rem);
  flex-shrink: 0;
}

.region-select {
  background: #ffffff;
  border: 1px solid var(--primary-color);
  border-radius: 8px;
  color: #000000;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: clamp(0.875rem, 2.5vw, 0.9rem);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
  flex: 1;
  min-width: 0;
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
  gap: var(--spacing-sm);
}

.cultural-practice {
  background: rgba(59, 130, 246, 0.1);
  color: #93c5fd;
  padding: var(--spacing-md);
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
  font-size: clamp(0.875rem, 2.5vw, 0.9rem);
  line-height: 1.4;
}

.recommendations {
  display: grid;
  gap: var(--spacing-sm);
}

.recommendation {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: rgba(34, 197, 94, 0.1);
  color: #86efac;
  padding: var(--spacing-md);
  border-radius: 8px;
  border-left: 4px solid #22c55e;
  font-size: clamp(0.875rem, 2.5vw, 0.9rem);
  line-height: 1.4;
}

.recommendation-icon {
  color: #22c55e;
  font-weight: bold;
  font-size: clamp(1rem, 3vw, 1.1rem);
  flex-shrink: 0;
}

.cultural-context {
  display: grid;
  gap: var(--spacing-lg);
}

.context-group h4 {
  margin: 0 0 var(--spacing-sm) 0;
  color: #000000;
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  font-weight: 600;
}

.context-group ul {
  margin: 0;
  padding-left: var(--spacing-lg);
  color: #374151;
}

.context-group li {
  margin-bottom: var(--spacing-sm);
  font-size: clamp(0.875rem, 2.5vw, 0.9rem);
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  padding-top: var(--spacing-lg);
  border-top: 2px solid rgba(148, 163, 184, 0.2);
  flex-wrap: wrap;
}

.btn-secondary, .btn-primary {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: 8px;
  font-size: clamp(0.875rem, 2.5vw, 0.9rem);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-height: 44px;
  min-width: 120px;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
  color: #000000;
}

.btn-secondary:focus {
  outline: 2px solid #fbbf24;
  outline-offset: 2px;
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

.btn-primary:focus {
  outline: 2px solid #fbbf24;
  outline-offset: 2px;
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

/* Mobile-first responsive design */
@media (max-width: 480px) {
  .health-modal-overlay {
    padding: var(--spacing-sm);
  }
  
  .health-modal {
    margin: var(--spacing-sm) 0;
    max-height: 95vh;
    border-radius: 12px;
  }
  
  .modal-header {
    padding: var(--spacing-md);
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
  
  .modal-title {
    justify-content: center;
  }
  
  .close-btn {
    align-self: flex-end;
    width: 36px;
    height: 36px;
    min-height: 36px;
  }
  
  .modal-content {
    padding: var(--spacing-md);
  }
  
  .status-card {
    padding: var(--spacing-md);
  }
  
  .status-header {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-sm);
  }
  
  .info-section {
    padding: var(--spacing-md);
  }
  
  .region-selector {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
  
  .region-select {
    width: 100%;
  }
  
  .modal-actions {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .btn-secondary, .btn-primary {
    width: 100%;
    min-width: auto;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .health-modal-overlay {
    padding: var(--spacing-md);
  }
  
  .health-modal {
    margin: var(--spacing-md) 0;
    max-height: 90vh;
  }
  
  .modal-header {
    padding: var(--spacing-md) var(--spacing-lg);
  }
  
  .modal-content {
    padding: var(--spacing-lg);
  }
  
  .status-card {
    padding: var(--spacing-lg);
  }
  
  .info-section {
    padding: var(--spacing-lg);
  }
  
  .region-selector {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
  
  .region-select {
    width: 100%;
  }
  
  .modal-actions {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .btn-secondary, .btn-primary {
    width: 100%;
    min-width: auto;
  }
}

@media (min-width: 769px) {
  .health-modal-overlay {
    padding: var(--spacing-lg) var(--spacing-md) var(--spacing-md) var(--spacing-md);
  }
  
  .health-modal {
    margin: var(--spacing-lg) 0 var(--spacing-md) 0;
    max-height: 85vh;
  }
  
  .modal-header {
    padding: var(--spacing-lg) var(--spacing-xl);
  }
  
  .modal-content {
    padding: var(--spacing-xl);
  }
  
  .status-card {
    padding: var(--spacing-lg);
  }
  
  .info-section {
    padding: var(--spacing-lg);
  }
  
  .modal-actions {
    flex-direction: row;
    gap: var(--spacing-md);
  }
  
  .btn-secondary, .btn-primary {
    width: auto;
    min-width: 120px;
  }
}

/* Landscape orientation adjustments for mobile */
@media (max-width: 768px) and (orientation: landscape) {
  .health-modal-overlay {
    padding: var(--spacing-sm);
  }
  
  .health-modal {
    margin: var(--spacing-sm) 0;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: var(--spacing-sm) var(--spacing-md);
  }
  
  .modal-content {
    padding: var(--spacing-md);
  }
  
  .status-card {
    padding: var(--spacing-md);
  }
  
  .info-section {
    padding: var(--spacing-md);
  }
}

/* Touch device optimizations */
@media (hover: none) and (pointer: coarse) {
  .close-btn:hover,
  .btn-secondary:hover,
  .btn-primary:hover {
    transform: none;
  }
  
  .close-btn:active,
  .btn-secondary:active,
  .btn-primary:active {
    transform: scale(0.95);
  }
  
  .region-select {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .health-modal {
    border-width: 3px;
  }
  
  .modal-header {
    border-bottom-width: 3px;
  }
  
  .status-card {
    border-width: 3px;
  }
  
  .info-section {
    border-width: 2px;
  }
  
  .modal-actions {
    border-top-width: 3px;
  }
  
  .close-btn,
  .btn-secondary,
  .btn-primary {
    border-width: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .health-modal-overlay,
  .health-modal,
  .close-btn,
  .btn-secondary,
  .btn-primary,
  .progress-fill {
    animation: none;
    transition: none;
  }
  
  .modalSlideIn {
    animation: none;
  }
  
  .modalFadeIn {
    animation: none;
  }
}

/* Print styles */
@media print {
  .health-modal-overlay {
    position: static;
    background: white;
    padding: 0;
  }
  
  .health-modal {
    background: white;
    color: black;
    border: 1px solid #ccc;
    box-shadow: none;
    max-height: none;
    margin: 0;
  }
  
  .close-btn,
  .modal-actions {
    display: none;
  }
  
  .modal-content {
    padding: var(--spacing-md);
  }
}
</style>
