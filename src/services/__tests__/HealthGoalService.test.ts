import { HealthGoalService } from '../HealthGoalService'
import type { HealthData } from '../GoogleFitService'

// Mock the OpenAIService
jest.mock('../OpenAIService', () => ({
  OpenAIService: jest.fn().mockImplementation(() => ({
    sendMessage: jest.fn().mockResolvedValue({
      content: JSON.stringify({
        overview: 'Test plan overview',
        recommendations: ['Test recommendation 1', 'Test recommendation 2'],
        weeklyPlan: [
          { day: 'Monday', activities: 'Test activity' }
        ],
        milestones: [
          { title: 'Test milestone', description: 'Test description', timeline: '1 week' }
        ],
        tips: ['Test tip 1', 'Test tip 2'],
        estimatedDuration: '4 weeks',
        difficulty: 'beginner',
        healthMetrics: { current: {}, target: {} }
      })
    })
  }))
}))

describe('HealthGoalService', () => {
  let service: HealthGoalService
  let mockHealthData: HealthData

  beforeEach(() => {
    service = new HealthGoalService()
    mockHealthData = {
      steps: 8000,
      calories: 2000,
      activeMinutes: 30,
      heartRate: 75,
      totalSleepRecords: 7,
      totalMinutesAsleep: 420,
      totalTimeInBed: 480,
      weightKg: 70,
      weightPounds: 154,
      fat: 20,
      bmi: 22.5,
      totalDistance: 5.5,
      veryActiveDistance: 1.0,
      moderatelyActiveDistance: 2.0,
      lightActiveDistance: 2.5,
      sedentaryActiveDistance: 0,
      veryActiveMinutes: 15,
      fairlyActiveMinutes: 20,
      lightlyActiveMinutes: 45,
      sedentaryMinutes: 600,
      hourlySteps: [],
      hourlyCalories: [],
      hourlyIntensities: []
    }
  })

  describe('generatePersonalizedPlan', () => {
    it('should generate a personalized plan based on goal and health data', async () => {
      const goal = 'I want to lose 10kg in 3 months'
      
      const plan = await service.generatePersonalizedPlan(goal, mockHealthData)
      
      expect(plan).toBeDefined()
      expect(plan.overview).toBe('Test plan overview')
      expect(plan.recommendations).toHaveLength(2)
      expect(plan.weeklyPlan).toHaveLength(1)
      expect(plan.milestones).toHaveLength(1)
      expect(plan.tips).toHaveLength(2)
      expect(plan.estimatedDuration).toBe('4 weeks')
      expect(plan.difficulty).toBe('beginner')
    })

    it('should handle errors gracefully and return fallback plan', async () => {
      // Mock the service to throw an error
      const mockService = new HealthGoalService()
      jest.spyOn(mockService as any, 'openaiService').mockImplementation(() => ({
        sendMessage: jest.fn().mockRejectedValue(new Error('API Error'))
      }))

      const goal = 'Test goal'
      const plan = await mockService.generatePersonalizedPlan(goal, mockHealthData)
      
      expect(plan).toBeDefined()
      expect(plan.overview).toContain('personalized health plan')
      expect(plan.recommendations).toBeDefined()
      expect(plan.weeklyPlan).toBeDefined()
    })
  })

  describe('analyzeGoalFeasibility', () => {
    it('should return high feasibility for normal health data', () => {
      const analysis = service.analyzeGoalFeasibility(mockHealthData)
      
      expect(analysis.feasibility).toBe('high')
      expect(analysis.concerns).toHaveLength(0)
    })

    it('should identify concerns for high BMI', () => {
      const highBmiData = { ...mockHealthData, bmi: 35 }
      const analysis = service.analyzeGoalFeasibility(highBmiData)
      
      expect(analysis.feasibility).toBe('medium')
      expect(analysis.concerns).toContain('High BMI may require medical supervision for weight loss goals')
    })

    it('should identify concerns for high sedentary time', () => {
      const sedentaryData = { ...mockHealthData, sedentaryMinutes: 800 }
      const analysis = service.analyzeGoalFeasibility(sedentaryData)
      
      expect(analysis.feasibility).toBe('medium')
      expect(analysis.concerns).toContain('High sedentary time')
    })
  })

  describe('plan management', () => {
    it('should save and retrieve plans', async () => {
      const plan = {
        overview: 'Test plan',
        recommendations: ['Test rec'],
        weeklyPlan: [],
        milestones: [],
        tips: [],
        estimatedDuration: '4 weeks',
        difficulty: 'beginner' as const,
        healthMetrics: { current: {}, target: {} }
      }

      await service.savePlan(plan)
      const savedPlans = service.getSavedPlans()
      
      expect(savedPlans).toHaveLength(1)
      expect(savedPlans[0].overview).toBe('Test plan')
    })

    it('should delete plans', async () => {
      const plan = {
        overview: 'Test plan',
        recommendations: ['Test rec'],
        weeklyPlan: [],
        milestones: [],
        tips: [],
        estimatedDuration: '4 weeks',
        difficulty: 'beginner' as const,
        healthMetrics: { current: {}, target: {} }
      }

      await service.savePlan(plan)
      const savedPlans = service.getSavedPlans()
      const planId = savedPlans[0].id

      await service.deletePlan(planId)
      const remainingPlans = service.getSavedPlans()
      
      expect(remainingPlans).toHaveLength(0)
    })
  })
})
