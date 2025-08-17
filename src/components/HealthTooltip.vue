<template>
  <div 
    v-if="isVisible" 
    class="health-tooltip"
    :style="tooltipStyle"
  >
    <!-- Simple Test Tooltip -->
    <div class="tooltip-content">
      <h3>🎯 TOOLTIP IS WORKING!</h3>
      <p><strong>Metric:</strong> {{ insight?.metric }}</p>
      <p><strong>Value:</strong> {{ insight?.value }}{{ insight?.unit ? ` ${insight?.unit}` : '' }}</p>
      <p><strong>Status:</strong> {{ insight?.healthStatus }}</p>
      <p><strong>Position:</strong> x: {{ x }}, y: {{ y }}</p>
      
      <!-- Health Context -->
      <div class="tooltip-section" v-if="insight?.context">
        <h4>Health Context</h4>
        <p>{{ insight.context }}</p>
      </div>
      
      <!-- Recommendations -->
      <div class="tooltip-section" v-if="insight?.generalRecommendations?.length">
        <h4>Recommendations</h4>
        <ul>
          <li v-for="(rec, index) in insight.generalRecommendations.slice(0, 2)" :key="index">
            {{ rec }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { HealthInsight } from '../services/HealthInsightsService'

// Props
interface Props {
  insight: HealthInsight | null
  isVisible: boolean
  x: number
  y: number
}

const props = defineProps<Props>()

// Computed
const tooltipStyle = computed(() => {
  console.log('Computing tooltip style:', { x: props.x, y: props.y })
  
  // Simple positioning - always show below the element
  const left = props.x - 200 // Half of tooltip width (400/2)
  const top = props.y + 20
  
  console.log('Calculated position:', { left, top })
  
  return {
    left: `${left}px`,
    top: `${top}px`
  }
})
</script>

<style scoped>
.health-tooltip {
  position: fixed;
  z-index: 9999;
  max-width: 400px;
  background: #1e293b;
  border: 3px solid #3b82f6;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 0.875rem;
  line-height: 1.5;
  pointer-events: none;
  animation: tooltipFadeIn 0.2s ease-out;
}

.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: 10px solid transparent;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.health-tooltip.position-top .tooltip-arrow {
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: rgba(59, 130, 246, 0.5);
}

.health-tooltip.position-bottom .tooltip-arrow {
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: rgba(59, 130, 246, 0.5);
}

.health-tooltip.position-left .tooltip-arrow {
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: rgba(59, 130, 246, 0.5);
}

.health-tooltip.position-right .tooltip-arrow {
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: rgba(59, 130, 246, 0.5);
}

.tooltip-content {
  padding: 1.5rem;
}

.tooltip-content h3 {
  margin: 0 0 1rem 0;
  color: #60a5fa;
  text-align: center;
  font-size: 1.2rem;
}

.tooltip-content p {
  margin: 0.5rem 0;
  color: #e2e8f0;
}

.tooltip-content strong {
  color: #60a5fa;
}

.tooltip-section {
  margin: 1rem 0;
  padding: 1rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.tooltip-section h4 {
  margin: 0 0 0.5rem 0;
  color: #60a5fa;
  font-size: 1rem;
}

.tooltip-section ul {
  margin: 0;
  padding-left: 1.25rem;
}

.tooltip-section li {
  margin: 0.25rem 0;
  color: #cbd5e1;
}

.tooltip-footer {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(59, 130, 246, 0.2);
  text-align: center;
  color: #94a3b8;
  font-size: 0.75rem;
}

@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .health-tooltip {
    max-width: 300px;
    font-size: 0.8rem;
  }
  
  .tooltip-content {
    padding: 0.75rem;
  }
  
  .tooltip-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
