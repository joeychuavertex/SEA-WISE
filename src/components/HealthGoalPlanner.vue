<template>
  <div class="health-goal-planner" v-if="isConnected">
    <!-- Goal Setting Section -->
    <section class="goal-section" aria-labelledby="goal-heading">
      <h3 id="goal-heading">Set Your Health Goal</h3>
      <p class="section-description">
        Tell us what you want to achieve, and we'll create a personalized plan based on your health data.
      </p>
      
      <div class="goal-input-container">
        <label for="goal-input" class="sr-only">Enter your health goal</label>
        <textarea
          id="goal-input"
          v-model="userGoal"
          @keyup.enter.ctrl="generatePlan"
          @focus="onInputFocus"
          @blur="onInputBlur"
          placeholder="e.g., I want to lose 10kg in 3 months, improve my sleep quality, increase my daily steps to 10,000, or build muscle..."
          class="goal-input"
          :disabled="isGenerating"
          rows="3"
          aria-describedby="goal-help"
        ></textarea>
        <div id="goal-help" class="input-help">
          Press Ctrl+Enter to generate your plan, or click the button below.
        </div>
      </div>

      <div class="goal-actions">
        <button 
          @click="generatePlan" 
          class="generate-btn"
          :disabled="!userGoal.trim() || isGenerating"
          :aria-label="isGenerating ? 'Generating your plan' : 'Generate personalized health plan'"
        >
          <span v-if="!isGenerating">
            <span class="btn-icon" aria-hidden="true">🎯</span>
            Generate My Plan
          </span>
          <span v-else>
            <span class="loading-spinner" aria-hidden="true"></span>
            Generating Plan...
          </span>
        </button>
        
        <button 
          @click="clearGoal" 
          class="clear-btn"
          :disabled="!userGoal.trim() || isGenerating"
          aria-label="Clear goal input"
        >
          Clear
        </button>
      </div>
    </section>

    <!-- Generated Plan Display -->
    <section v-if="generatedPlan" class="plan-section" aria-labelledby="plan-heading">
      <h3 id="plan-heading">Your Personalized Health Plan</h3>
      
      <div class="plan-content">
        <div class="plan-header">
          <div class="goal-summary">
            <h4>Your Goal:</h4>
            <p class="goal-text">{{ userGoal }}</p>
          </div>
          <div class="plan-meta">
            <span class="plan-date">Generated on {{ formatDate(new Date()) }}</span>
          </div>
        </div>

        <div class="plan-details">
          <div v-if="generatedPlan.dailyRoutine" class="plan-section-item">
            <h4>🏃‍♂️ {{ generatedPlan.dailyRoutine.title }}</h4>
            <div class="daily-routine">
              <div class="routine-commitment">
                <p><strong>Duration:</strong> {{ generatedPlan.dailyRoutine.duration }}</p>
                <p><strong>Commitment:</strong> {{ generatedPlan.dailyRoutine.commitment }}</p>
              </div>
              
              <div class="exercises-section">
                <h5>💪 Daily Exercises</h5>
                <div class="exercises-grid">
                  <div v-for="(exercise, index) in generatedPlan.dailyRoutine.exercises" :key="index" class="exercise-item">
                    <div class="exercise-header">
                      <span class="exercise-name">{{ exercise.exercise }}</span>
                      <span class="exercise-reps">{{ exercise.reps }} reps</span>
                    </div>
                    <div class="exercise-details">
                      <span class="exercise-sets">{{ exercise.sets }} sets</span>
                      <span class="exercise-timing">{{ exercise.timing }}</span>
                    </div>
                    <p class="exercise-notes">{{ exercise.notes }}</p>
                  </div>
                </div>
              </div>

              <div class="lifestyle-section">
                <h5>🏠 Lifestyle Rules</h5>
                <ul class="lifestyle-list">
                  <li v-for="(rule, index) in generatedPlan.dailyRoutine.lifestyle" :key="index">
                    {{ rule }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div v-if="generatedPlan.nutrition" class="plan-section-item">
            <h4>🍎 Nutrition Guidelines</h4>
            <div class="nutrition-plan">
              <div class="meal-item">
                <h5>🌅 Breakfast</h5>
                <p>{{ generatedPlan.nutrition.breakfast }}</p>
              </div>
              <div class="meal-item">
                <h5>🌞 Lunch</h5>
                <p>{{ generatedPlan.nutrition.lunch }}</p>
              </div>
              <div class="meal-item">
                <h5>🌙 Dinner</h5>
                <p>{{ generatedPlan.nutrition.dinner }}</p>
              </div>
              <div class="meal-item">
                <h5>💧 Hydration</h5>
                <p>{{ generatedPlan.nutrition.hydration }}</p>
              </div>
              <div class="meal-item">
                <h5>💊 Supplements</h5>
                <p>{{ generatedPlan.nutrition.supplements }}</p>
              </div>
            </div>
          </div>

          <div v-if="generatedPlan.weeklyPlan && generatedPlan.weeklyPlan.length > 0" class="plan-section-item">
            <h4>📅 Weekly Plan</h4>
            <div class="weekly-plan">
              <div v-for="(day, index) in generatedPlan.weeklyPlan" :key="index" class="day-plan">
                <h5>{{ day.day }}</h5>
                <p class="day-activities">{{ day.activities }}</p>
                <div class="day-details">
                  <span class="day-timing">⏰ {{ day.timing }}</span>
                  <span class="day-calories">🔥 {{ day.calories }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="generatedPlan.milestones && generatedPlan.milestones.length > 0" class="plan-section-item">
            <h4>🏆 Milestones</h4>
            <div class="milestones">
              <div v-for="(milestone, index) in generatedPlan.milestones" :key="index" class="milestone">
                <div class="milestone-icon">🎯</div>
                <div class="milestone-content">
                  <h5>{{ milestone.title }}</h5>
                  <p>{{ milestone.description }}</p>
                  <div class="milestone-details">
                    <span class="milestone-timeline">⏱️ {{ milestone.timeline }}</span>
                    <span class="milestone-measurement">📊 {{ milestone.measurement }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="generatedPlan.tips && generatedPlan.tips.length > 0" class="plan-section-item">
            <h4>💡 Pro Tips</h4>
            <ul class="tips-list">
              <li v-for="(tip, index) in generatedPlan.tips" :key="index">
                {{ tip }}
              </li>
            </ul>
          </div>

          <div v-if="generatedPlan.warnings && generatedPlan.warnings.length > 0" class="plan-section-item">
            <h4>⚠️ Important Warnings</h4>
            <div class="warnings-section">
              <ul class="warnings-list">
                <li v-for="(warning, index) in generatedPlan.warnings" :key="index" class="warning-item">
                  {{ warning }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="plan-actions">
          <button 
            @click="savePlan" 
            class="save-btn"
            :disabled="isSaving"
            aria-label="Save this plan"
          >
            <span v-if="!isSaving">
              <span class="btn-icon" aria-hidden="true">💾</span>
              Save Plan
            </span>
            <span v-else>
              <span class="loading-spinner" aria-hidden="true"></span>
              Saving...
            </span>
          </button>
          
          <button 
            @click="sharePlan" 
            class="share-btn"
            :disabled="isSharing"
            aria-label="Share this plan"
          >
            <span v-if="!isSharing">
              <span class="btn-icon" aria-hidden="true">📤</span>
              Share Plan
            </span>
            <span v-else>
              <span class="loading-spinner" aria-hidden="true"></span>
              Sharing...
            </span>
          </button>
          
          <button 
            @click="regeneratePlan" 
            class="regenerate-btn"
            :disabled="isGenerating"
            aria-label="Generate a new plan"
          >
            <span v-if="!isGenerating">
              <span class="btn-icon" aria-hidden="true">🔄</span>
              Regenerate
            </span>
            <span v-else>
              <span class="loading-spinner" aria-hidden="true"></span>
              Regenerating...
            </span>
          </button>
        </div>
      </div>
    </section>

    <!-- Error Display -->
    <div v-if="error" class="error-message" role="alert">
      <span class="error-icon" aria-hidden="true">⚠️</span>
      <p>{{ error }}</p>
      <button @click="clearError" class="error-close" aria-label="Close error message">×</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { HealthGoalService } from '../services/HealthGoalService'
import type { HealthData } from '../services/GoogleFitService'

// Props
interface Props {
  isConnected: boolean
  healthData: HealthData
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'planGenerated', plan: any): void
  (e: 'planSaved', plan: any): void
}

const emit = defineEmits<Emits>()

// Reactive state
const userGoal = ref('')
const generatedPlan = ref<any>(null)
const isGenerating = ref(false)
const isSaving = ref(false)
const isSharing = ref(false)
const error = ref('')

// Services
const goalService = new HealthGoalService()

// Generate personalized health plan
const generatePlan = async () => {
  if (!userGoal.value.trim() || isGenerating.value) return

  try {
    isGenerating.value = true
    error.value = ''
    
    const plan = await goalService.generatePersonalizedPlan(
      userGoal.value.trim(),
      props.healthData
    )
    
    generatedPlan.value = plan
    emit('planGenerated', plan)
  } catch (err) {
    console.error('Failed to generate plan:', err)
    error.value = 'Failed to generate your personalized plan. Please try again.'
  } finally {
    isGenerating.value = false
  }
}

// Clear goal input
const clearGoal = () => {
  userGoal.value = ''
  generatedPlan.value = null
  error.value = ''
}

// Save plan
const savePlan = async () => {
  if (!generatedPlan.value || isSaving.value) return

  try {
    isSaving.value = true
    error.value = ''
    
    await goalService.savePlan(generatedPlan.value)
    emit('planSaved', generatedPlan.value)
  } catch (err) {
    console.error('Failed to save plan:', err)
    error.value = 'Failed to save your plan. Please try again.'
  } finally {
    isSaving.value = false
  }
}

// Share plan
const sharePlan = async () => {
  if (!generatedPlan.value || isSharing.value) return

  try {
    isSharing.value = true
    error.value = ''
    
    if (navigator.share) {
      await navigator.share({
        title: 'My Health Plan',
        text: `Check out my personalized health plan: ${userGoal.value}`,
        url: window.location.href
      })
    } else {
      // Fallback: copy to clipboard
      const planText = `My Health Goal: ${userGoal.value}\n\n${JSON.stringify(generatedPlan.value, null, 2)}`
      await navigator.clipboard.writeText(planText)
      alert('Plan copied to clipboard!')
    }
  } catch (err) {
    console.error('Failed to share plan:', err)
    error.value = 'Failed to share your plan. Please try again.'
  } finally {
    isSharing.value = false
  }
}

// Regenerate plan
const regeneratePlan = async () => {
  await generatePlan()
}

// Clear error
const clearError = () => {
  error.value = ''
}

// Input handlers
const onInputFocus = () => {
  // Analytics or other focus handling
}

const onInputBlur = () => {
  // Analytics or other blur handling
}

// Format date helper
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.health-goal-planner {
  margin-top: 2rem;
}

.goal-section {
  background: var(--primary-light);
  border-radius: 15px;
  padding: 2rem;
  border: 1px solid var(--primary-color);
  box-shadow: 0 1px 3px rgba(37, 99, 235, 0.2);
  margin-bottom: 2rem;
}

.goal-section h3 {
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: #000000;
  font-weight: 600;
}

.section-description {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #374151;
  font-size: 0.9rem;
  line-height: 1.5;
}

.goal-input-container {
  margin-bottom: 1.5rem;
}

.goal-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #d1d5db;
  border-radius: 12px;
  background: #ffffff;
  color: #000000;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.goal-input::placeholder {
  color: #9ca3af;
}

.goal-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.goal-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-help {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #6b7280;
  text-align: center;
}

.goal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.generate-btn, .clear-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 180px;
  justify-content: center;
}

.generate-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
}

.clear-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.clear-btn:hover:not(:disabled) {
  background: #e5e7eb;
  transform: translateY(-2px);
}

.generate-btn:disabled, .clear-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 1.1rem;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.plan-section {
  background: #ffffff;
  border-radius: 15px;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.plan-section h3 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #000000;
  font-weight: 600;
}

.plan-content {
  max-width: 800px;
  margin: 0 auto;
}

.plan-header {
  background: var(--primary-light);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid var(--primary-color);
}

.goal-summary h4 {
  margin: 0 0 0.5rem 0;
  color: #000000;
  font-size: 1.1rem;
}

.goal-text {
  margin: 0 0 1rem 0;
  color: #374151;
  font-style: italic;
  font-size: 1rem;
  line-height: 1.5;
}

.plan-meta {
  text-align: right;
}

.plan-date {
  font-size: 0.8rem;
  color: #6b7280;
}

.plan-details {
  margin-bottom: 2rem;
}

.plan-section-item {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
  border-left: 4px solid var(--primary-color);
}

.plan-section-item h4 {
  margin: 0 0 1rem 0;
  color: #000000;
  font-size: 1.2rem;
  font-weight: 600;
}

.plan-section-item p {
  margin: 0 0 1rem 0;
  color: #374151;
  line-height: 1.6;
}

.recommendations-list, .tips-list {
  margin: 0;
  padding-left: 1.5rem;
  color: #374151;
  line-height: 1.6;
}

.recommendations-list li, .tips-list li {
  margin-bottom: 0.5rem;
}

.weekly-plan {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.day-plan {
  background: #ffffff;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.day-plan h5 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
  font-size: 1rem;
  font-weight: 600;
}

.day-plan p {
  margin: 0;
  color: #374151;
  font-size: 0.9rem;
  line-height: 1.4;
}

.milestones {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.milestone {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.milestone-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.milestone-content h5 {
  margin: 0 0 0.5rem 0;
  color: #000000;
  font-size: 1rem;
  font-weight: 600;
}

.milestone-content p {
  margin: 0 0 0.5rem 0;
  color: #374151;
  font-size: 0.9rem;
  line-height: 1.4;
}

.milestone-timeline {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.plan-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.save-btn, .share-btn, .regenerate-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: center;
}

.save-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.share-btn {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.regenerate-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.save-btn:hover:not(:disabled), .share-btn:hover, .regenerate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.save-btn:disabled, .regenerate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc2626;
}

.error-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.error-message p {
  margin: 0;
  flex: 1;
}

.error-close {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.error-close:hover {
  background: rgba(220, 38, 38, 0.1);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .goal-section, .plan-section {
    padding: 1rem;
  }
  
  .goal-actions, .plan-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .generate-btn, .clear-btn, .save-btn, .share-btn, .regenerate-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .weekly-plan {
    grid-template-columns: 1fr;
  }
  
  .milestone {
    flex-direction: column;
    text-align: center;
  }
  
  .exercises-grid {
    grid-template-columns: 1fr;
  }
  
  .day-details, .milestone-details {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* New detailed plan styles */
.daily-routine {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.routine-commitment {
  background: #e0f2fe;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.routine-commitment p {
  margin: 0.5rem 0;
  color: #0c4a6e;
  font-weight: 500;
}

.exercises-section {
  margin-bottom: 1.5rem;
}

.exercises-section h5 {
  color: #1f2937;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.exercises-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.exercise-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.exercise-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 1rem;
}

.exercise-reps {
  background: #3b82f6;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.exercise-details {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.exercise-notes {
  margin: 0;
  font-size: 0.85rem;
  color: #4b5563;
  font-style: italic;
}

.lifestyle-section h5 {
  color: #1f2937;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.lifestyle-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.lifestyle-list li {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
}

.nutrition-plan {
  background: #f0fdf4;
  border: 1px solid #22c55e;
  border-radius: 12px;
  padding: 1.5rem;
}

.meal-item {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.meal-item:last-child {
  margin-bottom: 0;
}

.meal-item h5 {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
  font-size: 1rem;
}

.meal-item p {
  margin: 0;
  color: #374151;
  line-height: 1.5;
}

.day-details {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.day-timing, .day-calories {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.milestone-details {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  font-size: 0.9rem;
}

.milestone-timeline, .milestone-measurement {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #6b7280;
}

.warnings-section {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 1.5rem;
}

.warnings-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.warning-item {
  background: white;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  color: #dc2626;
  font-weight: 500;
}

.warning-item:last-child {
  margin-bottom: 0;
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
</style>
