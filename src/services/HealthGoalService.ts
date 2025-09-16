import { OpenAIService } from './OpenAIService'
import type { HealthData } from './GoogleFitService'

export interface HealthGoal {
  id: string
  goal: string
  createdAt: Date
  status: 'active' | 'completed' | 'paused'
}

export interface PersonalizedPlan {
  id?: string
  overview: string
  recommendations: string[]
  weeklyPlan: Array<{
    day: string
    activities: string
  }>
  milestones: Array<{
    title: string
    description: string
    timeline: string
  }>
  tips: string[]
  estimatedDuration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  healthMetrics: {
    current: any
    target: any
  }
}

export class HealthGoalService {
  private openaiService: OpenAIService
  private savedPlans: PersonalizedPlan[] = []

  constructor() {
    this.openaiService = new OpenAIService()
  }

  /**
   * Generate a personalized health plan based on user goal and health data
   */
  async generatePersonalizedPlan(goal: string, healthData: HealthData): Promise<PersonalizedPlan> {
    try {
      const systemPrompt = this.createSystemPrompt()
      const userPrompt = this.createUserPrompt(goal, healthData)

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userPrompt }
      ]

      const response = await this.openaiService.sendMessage(messages, 0.7)
      const planData = this.parsePlanResponse(response.content)

      return planData
    } catch (error) {
      console.error('Error generating personalized plan:', error)
      
      // Return a fallback plan instead of throwing an error
      console.log('HealthGoalService: Returning fallback plan due to API error')
      return this.createFallbackPlan(goal, healthData)
    }
  }

  /**
   * Create system prompt for the LLM
   */
  private createSystemPrompt(): string {
    return `You are a professional health and fitness coach with expertise in creating personalized health plans. Your role is to analyze user health data and goals to create comprehensive, actionable, and safe health plans.

Key principles:
1. Always prioritize safety and health
2. Create realistic, achievable goals
3. Consider the user's current fitness level and health metrics
4. Provide specific, actionable recommendations
5. Include cultural sensitivity and accessibility
6. Focus on sustainable lifestyle changes
7. Consider mental health and motivation

You must respond with a valid JSON object containing the following structure:
{
  "overview": "A brief overview of the plan and approach",
  "recommendations": ["Array of specific recommendations"],
  "weeklyPlan": [{"day": "Monday", "activities": "Specific activities for this day"}],
  "milestones": [{"title": "Milestone name", "description": "What to achieve", "timeline": "When to achieve it"}],
  "tips": ["Array of helpful tips"],
  "estimatedDuration": "Expected timeline for the plan",
  "difficulty": "beginner|intermediate|advanced",
  "healthMetrics": {"current": {}, "target": {}}
}

Be encouraging, specific, and practical in your recommendations.`
  }

  /**
   * Create user prompt with goal and health data
   */
  private createUserPrompt(goal: string, healthData: HealthData): string {
    const healthSummary = this.summarizeHealthData(healthData)
    
    return `Please create a personalized health plan for the following goal and current health data:

GOAL: "${goal}"

CURRENT HEALTH DATA:
${healthSummary}

Please analyze this data and create a comprehensive, personalized plan that:
1. Addresses the specific goal mentioned
2. Takes into account current health metrics and fitness level
3. Provides a realistic timeline and milestones
4. Includes specific daily/weekly activities
5. Offers practical tips for success
6. Considers any potential health concerns based on the data

Make the plan actionable, safe, and motivating. Focus on sustainable changes that can be maintained long-term.`
  }

  /**
   * Summarize health data for the LLM
   */
  private summarizeHealthData(healthData: HealthData): string {
    const summary = []
    
    if (healthData.steps) summary.push(`Daily Steps: ${healthData.steps}`)
    if (healthData.calories) summary.push(`Daily Calories Burned: ${healthData.calories}`)
    if (healthData.activeMinutes) summary.push(`Active Minutes: ${healthData.activeMinutes}`)
    if (healthData.heartRate) summary.push(`Average Heart Rate: ${healthData.heartRate} BPM`)
    if (healthData.totalMinutesAsleep) summary.push(`Sleep Duration: ${Math.round(healthData.totalMinutesAsleep / 60)} hours`)
    if (healthData.weightKg) summary.push(`Weight: ${healthData.weightKg.toFixed(1)} kg (${healthData.weightPounds?.toFixed(1)} lbs)`)
    if (healthData.bmi) summary.push(`BMI: ${healthData.bmi.toFixed(1)}`)
    if (healthData.veryActiveMinutes) summary.push(`Very Active Minutes: ${healthData.veryActiveMinutes}`)
    if (healthData.fairlyActiveMinutes) summary.push(`Fairly Active Minutes: ${healthData.fairlyActiveMinutes}`)
    if (healthData.lightlyActiveMinutes) summary.push(`Lightly Active Minutes: ${healthData.lightlyActiveMinutes}`)
    if (healthData.sedentaryMinutes) summary.push(`Sedentary Minutes: ${healthData.sedentaryMinutes}`)
    
    return summary.join('\n')
  }

  /**
   * Parse the LLM response into a structured plan
   */
  private parsePlanResponse(response: string): PersonalizedPlan {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const planData = JSON.parse(jsonMatch[0])
        return this.validateAndFormatPlan(planData)
      } else {
        throw new Error('No valid JSON found in response')
      }
    } catch (error) {
      console.error('Error parsing plan response:', error)
      // Return a fallback plan if parsing fails
      return this.createFallbackPlan()
    }
  }

  /**
   * Validate and format the parsed plan data
   */
  private validateAndFormatPlan(data: any): PersonalizedPlan {
    return {
      overview: data.overview || 'A personalized health plan to help you achieve your goals.',
      recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
      weeklyPlan: Array.isArray(data.weeklyPlan) ? data.weeklyPlan : [],
      milestones: Array.isArray(data.milestones) ? data.milestones : [],
      tips: Array.isArray(data.tips) ? data.tips : [],
      estimatedDuration: data.estimatedDuration || '4-8 weeks',
      difficulty: ['beginner', 'intermediate', 'advanced'].includes(data.difficulty) 
        ? data.difficulty 
        : 'beginner',
      healthMetrics: {
        current: data.healthMetrics?.current || {},
        target: data.healthMetrics?.target || {}
      }
    }
  }

  /**
   * Create a fallback plan if LLM response parsing fails
   */
  private createFallbackPlan(goal: string, healthData: HealthData): PersonalizedPlan {
    // Create a basic personalized plan based on the goal
    const isWeightLoss = goal.toLowerCase().includes('lose') || goal.toLowerCase().includes('weight')
    const isMuscleGain = goal.toLowerCase().includes('muscle') || goal.toLowerCase().includes('strength')
    const isCardio = goal.toLowerCase().includes('cardio') || goal.toLowerCase().includes('endurance')
    
    return {
      overview: `A personalized health plan to help you achieve your goal: "${goal}". This plan focuses on gradual, sustainable improvements to your health and fitness.`,
      recommendations: [
        'Start with small, achievable changes',
        'Track your progress regularly',
        'Stay consistent with your routine',
        'Listen to your body and adjust as needed',
        'Stay hydrated and get adequate sleep',
        ...(isWeightLoss ? ['Focus on calorie deficit through diet and exercise', 'Include both cardio and strength training'] : []),
        ...(isMuscleGain ? ['Prioritize strength training 3-4 times per week', 'Ensure adequate protein intake'] : []),
        ...(isCardio ? ['Gradually increase cardio duration and intensity', 'Include variety in your cardio activities'] : [])
      ],
      weeklyPlan: [
        { day: 'Monday', activities: isWeightLoss ? '30 min cardio + 15 min strength' : isMuscleGain ? 'Upper body strength training' : 'Light cardio and stretching' },
        { day: 'Tuesday', activities: isWeightLoss ? 'HIIT workout (20-30 min)' : isMuscleGain ? 'Lower body strength training' : 'Strength training or resistance exercises' },
        { day: 'Wednesday', activities: 'Active recovery or light activity' },
        { day: 'Thursday', activities: isWeightLoss ? 'Cardio + core work' : isMuscleGain ? 'Full body strength training' : 'Cardio or aerobic exercise' },
        { day: 'Friday', activities: isWeightLoss ? 'Strength training + cardio' : isMuscleGain ? 'Push/pull strength training' : 'Strength training or core work' },
        { day: 'Saturday', activities: isCardio ? 'Long cardio session' : 'Fun activity or sport' },
        { day: 'Sunday', activities: 'Rest or gentle movement' }
      ],
      milestones: [
        {
          title: 'First Week',
          description: 'Establish a consistent routine and track your progress',
          timeline: '1 week'
        },
        {
          title: 'First Month',
          description: isWeightLoss ? 'Lose 2-4 pounds and establish healthy habits' : 
                      isMuscleGain ? 'Increase strength and muscle mass' : 
                      'Notice initial improvements in energy and mood',
          timeline: '4 weeks'
        },
        {
          title: 'Three Months',
          description: isWeightLoss ? 'Achieve significant weight loss and maintain healthy lifestyle' :
                      isMuscleGain ? 'Build substantial muscle mass and strength' :
                      'Achieve significant progress toward your goal',
          timeline: '12 weeks'
        }
      ],
      tips: [
        'Start each day with a healthy breakfast',
        'Take regular breaks from sitting',
        'Find activities you enjoy',
        'Set realistic expectations',
        'Celebrate small wins'
      ],
      estimatedDuration: '8-12 weeks',
      difficulty: 'beginner',
      healthMetrics: {
        current: {},
        target: {}
      }
    }
  }

  /**
   * Save a plan to local storage
   */
  async savePlan(plan: PersonalizedPlan): Promise<void> {
    try {
      const planWithId = {
        ...plan,
        id: this.generatePlanId(),
        savedAt: new Date().toISOString()
      }
      
      this.savedPlans.push(planWithId)
      
      // Save to localStorage
      localStorage.setItem('healthPlans', JSON.stringify(this.savedPlans))
    } catch (error) {
      console.error('Error saving plan:', error)
      throw new Error('Failed to save plan')
    }
  }

  /**
   * Get all saved plans
   */
  getSavedPlans(): PersonalizedPlan[] {
    try {
      const saved = localStorage.getItem('healthPlans')
      if (saved) {
        this.savedPlans = JSON.parse(saved)
      }
      return [...this.savedPlans]
    } catch (error) {
      console.error('Error loading saved plans:', error)
      return []
    }
  }

  /**
   * Delete a saved plan
   */
  async deletePlan(planId: string): Promise<void> {
    try {
      this.savedPlans = this.savedPlans.filter(plan => plan.id !== planId)
      localStorage.setItem('healthPlans', JSON.stringify(this.savedPlans))
    } catch (error) {
      console.error('Error deleting plan:', error)
      throw new Error('Failed to delete plan')
    }
  }

  /**
   * Generate a unique plan ID
   */
  private generatePlanId(): string {
    return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Analyze goal feasibility based on health data
   */
  analyzeGoalFeasibility(healthData: HealthData): {
    feasibility: 'high' | 'medium' | 'low'
    concerns: string[]
    suggestions: string[]
  } {
    const concerns: string[] = []
    const suggestions: string[] = []

    // Analyze based on current health metrics
    if (healthData.bmi && healthData.bmi > 30) {
      concerns.push('High BMI may require medical supervision for weight loss goals')
      suggestions.push('Consult with a healthcare provider before starting any weight loss program')
    }

    if (healthData.heartRate && healthData.heartRate > 100) {
      concerns.push('Elevated resting heart rate')
      suggestions.push('Consider consulting a healthcare provider about your heart rate')
    }

    if (healthData.sedentaryMinutes && healthData.sedentaryMinutes > 600) {
      concerns.push('High sedentary time')
      suggestions.push('Start with gentle movement and gradually increase activity')
    }

    // Determine feasibility
    let feasibility: 'high' | 'medium' | 'low' = 'high'
    if (concerns.length > 2) {
      feasibility = 'low'
    } else if (concerns.length > 0) {
      feasibility = 'medium'
    }

    return { feasibility, concerns, suggestions }
  }
}
