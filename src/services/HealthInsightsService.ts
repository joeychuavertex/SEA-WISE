import { SeaLionService } from './SeaLionService'
import type { SeaLionMessage } from './SeaLionService'

export interface HealthInsight {
  metric: string
  value: number
  unit: string
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'needs_attention'
  fitnessStandard: string
  culturalSuggestions: string[]
  generalRecommendations: string[]
  context: string
}

export interface CulturalHealthContext {
  region: string
  traditionalPractices: string[]
}

export class HealthInsightsService {
  private seaLionService: SeaLionService

  constructor() {
    try {
      this.seaLionService = new SeaLionService()
    } catch (error) {
      console.warn('SEA-LION service not available:', error)
      this.seaLionService = null as any
    }
  }
  
  /**
   * Get comprehensive health insights for a metric
   */
  getHealthInsight(metric: string, value: number): HealthInsight {
    switch (metric) {
      case 'steps': return this.getStepsInsight(value)
      case 'calories': return this.getCaloriesInsight(value)
      case 'sleep': return this.getSleepInsight(value)
      case 'heartRate': return this.getHeartRateInsight(value)
      case 'weight': return this.getWeightInsight(value)
      case 'activity': return this.getActivityInsight(value)
      case 'bmi': return this.getBMIInsight(value)
      default: return this.getDefaultInsight(metric, value)
    }
  }

  /**
   * Get insights for steps data
   */
  private getStepsInsight(value: number): HealthInsight {
    const healthStatus = this.getStepsHealthStatus(value)
    const fitnessStandard = this.getStepsFitnessStandard()
    const culturalSuggestions = this.getCulturalStepsSuggestions()
    const generalRecommendations = this.getStepsRecommendations()
    const context = this.getStepsContext(value)

    return {
      metric: 'steps',
      value,
      unit: 'steps',
      healthStatus,
      fitnessStandard,
      culturalSuggestions,
      generalRecommendations,
      context
    }
  }

  /**
   * Get insights for calories data
   */
  private getCaloriesInsight(value: number): HealthInsight {
    const healthStatus = this.getCaloriesHealthStatus(value)
    const fitnessStandard = this.getCaloriesFitnessStandard()
    const culturalSuggestions = this.getCulturalCaloriesSuggestions()
    const generalRecommendations = this.getCaloriesRecommendations()
    const context = this.getCaloriesContext(value)

    return {
      metric: 'calories',
      value,
      unit: 'calories',
      healthStatus,
      fitnessStandard,
      culturalSuggestions,
      generalRecommendations,
      context
    }
  }

  /**
   * Get insights for sleep data
   */
  private getSleepInsight(value: number): HealthInsight {
    const healthStatus = this.getSleepHealthStatus(value)
    const fitnessStandard = this.getSleepFitnessStandard()
    const culturalSuggestions = this.getCulturalSleepSuggestions()
    const generalRecommendations = this.getSleepRecommendations()
    const context = this.getSleepContext(value)

    return {
      metric: 'sleep',
      value,
      unit: 'hours',
      healthStatus,
      fitnessStandard,
      culturalSuggestions,
      generalRecommendations,
      context
    }
  }

  /**
   * Get insights for heart rate data
   */
  private getHeartRateInsight(value: number): HealthInsight {
    const healthStatus = this.getHeartRateHealthStatus(value)
    const fitnessStandard = this.getHeartRateFitnessStandard()
    const culturalSuggestions = this.getCulturalHeartRateSuggestions()
    const generalRecommendations = this.getHeartRateRecommendations()
    const context = this.getHeartRateContext(value)

    return {
      metric: 'heartRate',
      value,
      unit: 'bpm',
      healthStatus,
      fitnessStandard,
      culturalSuggestions,
      generalRecommendations,
      context
    }
  }

  /**
   * Get insights for weight data
   */
  private getWeightInsight(value: number): HealthInsight {
    const healthStatus = this.getWeightHealthStatus(value)
    const fitnessStandard = this.getWeightFitnessStandard()
    const culturalSuggestions = this.getCulturalWeightSuggestions()
    const generalRecommendations = this.getWeightRecommendations()
    const context = this.getWeightContext(value)

    return {
      metric: 'weight',
      value,
      unit: 'kg',
      healthStatus,
      fitnessStandard,
      culturalSuggestions,
      generalRecommendations,
      context
    }
  }

  /**
   * Get insights for activity data
   */
  private getActivityInsight(value: number): HealthInsight {
    const healthStatus = this.getActivityHealthStatus(value)
    const fitnessStandard = this.getActivityFitnessStandard()
    const culturalSuggestions = this.getCulturalActivitySuggestions()
    const generalRecommendations = this.getActivityRecommendations()
    const context = this.getActivityContext(value)

    return {
      metric: 'activity',
      value,
      unit: 'minutes',
      healthStatus,
      fitnessStandard,
      culturalSuggestions,
      generalRecommendations,
      context
    }
  }

  /**
   * Get insights for BMI data
   */
  private getBMIInsight(value: number): HealthInsight {
    const healthStatus = this.getBMIHealthStatus(value)
    const fitnessStandard = this.getBMIFitnessStandard()
    const culturalSuggestions = this.getCulturalBMISuggestions()
    const generalRecommendations = this.getBMIRecommendations()
    const context = this.getBMIContext(value)

    return {
      metric: 'bmi',
      value,
      unit: 'kg/m²',
      healthStatus,
      fitnessStandard,
      culturalSuggestions,
      generalRecommendations,
      context
    }
  }

  /**
   * Get default insight for unknown metrics
   */
  private getDefaultInsight(metric: string, value: number): HealthInsight {
    return {
      metric,
      value,
      unit: 'units',
      healthStatus: 'good',
      fitnessStandard: 'Standard varies by metric',
      culturalSuggestions: ['Consult local health traditions', 'Seek professional advice'],
      generalRecommendations: ['Monitor regularly', 'Maintain consistency'],
      context: `Data for ${metric} metric`
    }
  }

  /**
   * Get health status for steps
   */
  private getStepsHealthStatus(steps: number): HealthInsight['healthStatus'] {
    if (steps >= 10000) return 'excellent'
    if (steps >= 8000) return 'good'
    if (steps >= 6000) return 'fair'
    if (steps >= 4000) return 'poor'
    return 'needs_attention'
  }

  /**
   * Get health status for calories
   */
  private getCaloriesHealthStatus(calories: number): HealthInsight['healthStatus'] {
    if (calories >= 2000) return 'excellent'
    if (calories >= 1800) return 'good'
    if (calories >= 1600) return 'fair'
    if (calories >= 1400) return 'poor'
    return 'needs_attention'
  }

  /**
   * Get health status for sleep
   */
  private getSleepHealthStatus(hours: number): HealthInsight['healthStatus'] {
    if (hours >= 7 && hours <= 9) return 'excellent'
    if (hours >= 6 && hours <= 10) return 'good'
    if (hours >= 5 && hours <= 11) return 'fair'
    if (hours >= 4 && hours <= 12) return 'poor'
    return 'needs_attention'
  }

  /**
   * Get health status for heart rate
   */
  private getHeartRateHealthStatus(bpm: number): HealthInsight['healthStatus'] {
    if (bpm >= 60 && bpm <= 100) return 'excellent'
    if (bpm >= 50 && bpm <= 110) return 'good'
    if (bpm >= 40 && bpm <= 120) return 'fair'
    if (bpm >= 30 && bpm <= 130) return 'poor'
    return 'needs_attention'
  }

  /**
   * Get health status for weight
   */
  private getWeightHealthStatus(weight: number): HealthInsight['healthStatus'] {
    // This is a simplified example - real weight assessment would consider height, age, gender
    if (weight >= 45 && weight <= 90) return 'good'
    if (weight >= 40 && weight <= 100) return 'fair'
    if (weight >= 35 && weight <= 110) return 'poor'
    return 'needs_attention'
  }

  /**
   * Get health status for activity
   */
  private getActivityHealthStatus(minutes: number): HealthInsight['healthStatus'] {
    if (minutes >= 150) return 'excellent'
    if (minutes >= 120) return 'good'
    if (minutes >= 90) return 'fair'
    if (minutes >= 60) return 'poor'
    return 'needs_attention'
  }

  /**
   * Get health status for BMI
   */
  private getBMIHealthStatus(bmi: number): HealthInsight['healthStatus'] {
    if (bmi >= 18.5 && bmi <= 24.9) return 'excellent'
    if (bmi >= 17 && bmi <= 26) return 'good'
    if (bmi >= 16 && bmi <= 27) return 'fair'
    if (bmi >= 15 && bmi <= 28) return 'poor'
    return 'needs_attention'
  }

  // Helper methods for fitness standards
  private getStepsFitnessStandard(): string {
    return 'WHO recommends 10,000+ steps daily for optimal health'
  }

  private getCaloriesFitnessStandard(): string {
    return 'Aim for 2,000+ calories burned through daily activities'
  }

  private getSleepFitnessStandard(): string {
    return '7-9 hours of quality sleep recommended for adults'
  }

  private getHeartRateFitnessStandard(): string {
    return 'Normal resting heart rate: 60-100 BPM for adults'
  }

  private getWeightFitnessStandard(): string {
    return 'Maintain weight within healthy BMI range (18.5-24.9)'
  }

  private getActivityFitnessStandard(): string {
    return 'WHO recommends 150+ minutes of moderate activity weekly'
  }

  private getBMIFitnessStandard(): string {
    return 'Healthy BMI range: 18.5-24.9 kg/m²'
  }

  // Helper methods for context
  private getStepsContext(steps: number): string {
    if (steps >= 10000) return 'Excellent! You\'re meeting the global standard for daily physical activity.'
    if (steps >= 8000) return 'Great job! You\'re maintaining a healthy activity level.'
    if (steps >= 6000) return 'Good progress! You\'re getting regular movement.'
    if (steps >= 4000) return 'You\'re getting some activity, but could benefit from more movement.'
    return 'Your activity level needs attention. Start with small steps to build momentum.'
  }

  private getCaloriesContext(calories: number): string {
    if (calories >= 2000) return 'Outstanding calorie burn! You\'re very active.'
    if (calories >= 1800) return 'Great energy expenditure! You\'re maintaining good activity levels.'
    if (calories >= 1600) return 'Good calorie burn through your daily activities.'
    if (calories >= 1400) return 'Moderate activity level with room for improvement.'
    return 'Consider increasing your daily movement to boost calorie burn.'
  }

  private getSleepContext(hours: number): string {
    if (hours >= 7 && hours <= 9) return 'Perfect sleep duration for optimal health and recovery!'
    if (hours >= 6 && hours <= 10) return 'Good sleep duration within healthy range.'
    if (hours >= 5 && hours <= 11) return 'Adequate sleep, but could benefit from more rest.'
    if (hours >= 4 && hours <= 12) return 'Sleep duration is below recommended levels.'
    return 'Your sleep pattern needs attention for better health outcomes.'
  }

  private getHeartRateContext(bpm: number): string {
    if (bpm >= 60 && bpm <= 100) return 'Excellent! Your heart rate is in the healthy range.'
    if (bpm >= 50 && bpm <= 110) return 'Good heart rate, typical of active individuals.'
    if (bpm >= 40 && bpm <= 120) return 'Your heart rate is elevated, possibly due to recent activity.'
    if (bpm >= 30 && bpm <= 130) return 'Heart rate is outside normal range, consider monitoring.'
    return 'Your heart rate needs attention, consider consulting a healthcare provider.'
  }

  private getWeightContext(weight: number): string {
    if (weight >= 45 && weight <= 90) return 'Your weight appears to be in a healthy range.'
    if (weight >= 40 && weight <= 100) return 'Consider monitoring your weight trends.'
    if (weight >= 35 && weight <= 110) return 'Your weight may need attention.'
    return 'Consider professional guidance for weight management.'
  }

  private getActivityContext(minutes: number): string {
    if (minutes >= 150) return 'Excellent! You\'re exceeding weekly activity recommendations.'
    if (minutes >= 120) return 'Great job! You\'re meeting weekly activity goals.'
    if (minutes >= 90) return 'Good activity level, close to weekly recommendations.'
    if (minutes >= 60) return 'You\'re getting some activity, but could increase weekly minutes.'
    return 'Your weekly activity level needs attention for optimal health.'
  }

  private getBMIContext(bmi: number): string {
    if (bmi >= 18.5 && bmi <= 24.9) return 'Your BMI indicates a healthy weight range.'
    if (bmi >= 17 && bmi <= 26) return 'Your BMI is close to the healthy range.'
    if (bmi >= 16 && bmi <= 27) return 'Your BMI may need attention.'
    if (bmi >= 15 && bmi <= 28) return 'Your BMI is outside the healthy range.'
    return 'Consider professional guidance for BMI management.'
  }

  // Cultural suggestions for different metrics
  private getCulturalStepsSuggestions(): string[] {
    const suggestions = []
    
    // Asian cultural practices
    suggestions.push('🏮 Morning tai chi or qigong for gentle movement')
    suggestions.push('🍃 Evening walking in nature (shinrin-yoku forest bathing)')
    suggestions.push('🚶‍♀️ Family walking traditions after meals')
    
    // Mediterranean cultural practices
    suggestions.push('🌅 Evening passeggiata (leisurely stroll)')
    suggestions.push('🏃‍♂️ Morning jogging along coastal paths')
    suggestions.push('🚶‍♂️ Walking to local markets and cafes')
    
    // Nordic cultural practices
    suggestions.push('❄️ Winter walking in nature (friluftsliv)')
    suggestions.push('🌲 Forest hiking and outdoor activities')
    suggestions.push('🚶‍♀️ Walking to work regardless of weather')
    
    // Latin American cultural practices
    suggestions.push('💃 Dance-based activities (salsa, merengue)')
    suggestions.push('⚽ Family soccer or sports activities')
    suggestions.push('🚶‍♂️ Walking to visit neighbors and family')
    
    return suggestions
  }

  private getCulturalCaloriesSuggestions(): string[] {
    const suggestions = []
    
    // Asian cultural practices
    suggestions.push('🧘‍♀️ Traditional yoga or martial arts')
    suggestions.push('🏮 Tai chi in the park for gentle exercise')
    suggestions.push('🍃 Morning qigong exercises')
    
    // Mediterranean cultural practices
    suggestions.push('🏊‍♂️ Swimming in local pools or beaches')
    suggestions.push('🚴‍♂️ Cycling through scenic routes')
    suggestions.push('🏃‍♀️ Group running clubs')
    
    // Nordic cultural practices
    suggestions.push('⛷️ Cross-country skiing in winter')
    suggestions.push('🚣‍♀️ Kayaking or canoeing in summer')
    suggestions.push('🏃‍♂️ Trail running in forests')
    
    return suggestions
  }

  private getCulturalSleepSuggestions(): string[] {
    const suggestions = []
    
    // Asian cultural practices
    suggestions.push('🍵 Evening herbal tea rituals (chamomile, lavender)')
    suggestions.push('🧘‍♀️ Pre-sleep meditation or mindfulness')
    suggestions.push('🛁 Warm bath with essential oils')
    
    // Mediterranean cultural practices
    suggestions.push('🍷 Evening wine and conversation (moderation)')
    suggestions.push('🌅 Siesta culture for afternoon rest')
    suggestions.push('🕯️ Relaxing evening routines')
    
    // Nordic cultural practices
    suggestions.push('🕯️ Hygge evening atmosphere with candles')
    suggestions.push('📚 Evening reading in cozy settings')
    suggestions.push('🌲 Nature sounds for relaxation')
    
    return suggestions
  }

  private getCulturalHeartRateSuggestions(): string[] {
    const suggestions = []
    
    // Asian cultural practices
    suggestions.push('🧘‍♀️ Deep breathing exercises (pranayama)')
    suggestions.push('🍵 Green tea for heart health')
    suggestions.push('🏮 Tai chi for stress reduction')
    
    // Mediterranean cultural practices
    suggestions.push('🫒 Olive oil and heart-healthy diet')
    suggestions.push('🍷 Moderate red wine consumption')
    suggestions.push('🌅 Relaxing sunset walks')
    
    // Nordic cultural practices
    suggestions.push('❄️ Cold exposure therapy (sauna + cold plunge)')
    suggestions.push('🌲 Forest therapy for stress reduction')
    suggestions.push('🏃‍♂️ Moderate outdoor exercise')
    
    return suggestions
  }

  private getCulturalWeightSuggestions(): string[] {
    const suggestions = []
    
    // Asian cultural practices
    suggestions.push('🍚 Balanced rice and vegetable meals')
    suggestions.push('🍵 Green tea for metabolism')
    suggestions.push('🧘‍♀️ Mindful eating practices')
    
    // Mediterranean cultural practices
    suggestions.push('🫒 Mediterranean diet principles')
    suggestions.push('🍷 Social dining experiences')
    suggestions.push('🌅 Active lifestyle integration')
    
    // Nordic cultural practices
    suggestions.push('🐟 Omega-3 rich fish consumption')
    suggestions.push('🌾 Whole grain and berry focus')
    suggestions.push('🏃‍♂️ Outdoor activity emphasis')
    
    return suggestions
  }

  private getCulturalActivitySuggestions(): string[] {
    const suggestions = []
    
    // Asian cultural practices
    suggestions.push('🏮 Morning tai chi in the park')
    suggestions.push('🍃 Evening walking meditation')
    suggestions.push('🧘‍♀️ Yoga classes with community')
    
    // Mediterranean cultural practices
    suggestions.push('🌅 Morning beach walks')
    suggestions.push('🏊‍♂️ Swimming in local pools')
    suggestions.push('🚴‍♂️ Cycling through scenic routes')
    
    // Nordic cultural practices
    suggestions.push('❄️ Winter sports and activities')
    suggestions.push('🌲 Forest hiking and exploration')
    suggestions.push('🚣‍♀️ Summer water activities')
    
    return suggestions
  }

  private getCulturalBMISuggestions(): string[] {
    const suggestions = []
    
    // Asian cultural practices
    suggestions.push('🍚 Traditional balanced meal planning')
    suggestions.push('🧘‍♀️ Mindful eating and portion control')
    suggestions.push('🏮 Regular tai chi or qigong practice')
    
    // Mediterranean cultural practices
    suggestions.push('🫒 Mediterranean diet principles')
    suggestions.push('🍷 Social and enjoyable eating')
    suggestions.push('🌅 Active lifestyle integration')
    
    // Nordic cultural practices
    suggestions.push('🐟 Healthy fish and lean protein')
    suggestions.push('🌾 Whole grain and vegetable focus')
    suggestions.push('🏃‍♂️ Regular outdoor activities')
    
    return suggestions
  }

  // General recommendations for different metrics
  private getStepsRecommendations(): string[] {
    const recommendations = []
    
    recommendations.push('Start with short 10-minute walks')
    recommendations.push('Take the stairs instead of elevators')
    recommendations.push('Park further from destinations')
    
    return recommendations
  }

  private getCaloriesRecommendations(): string[] {
    const recommendations = []
    
    recommendations.push('Start with 10-minute exercise sessions')
    recommendations.push('Take regular movement breaks')
    recommendations.push('Try gentle yoga or stretching')
    
    return recommendations
  }

  private getSleepRecommendations(): string[] {
    const recommendations = []
    
    recommendations.push('Establish consistent bedtime routine')
    recommendations.push('Limit screen time before bed')
    recommendations.push('Create a dark, quiet sleep environment')
    
    return recommendations
  }

  private getHeartRateRecommendations(): string[] {
    const recommendations = []
    
    recommendations.push('Practice deep breathing exercises')
    recommendations.push('Consider stress management techniques')
    recommendations.push('Consult healthcare provider if persistent')
    
    return recommendations
  }

  private getWeightRecommendations(): string[] {
    const recommendations = []
    
    recommendations.push('Focus on balanced nutrition')
    recommendations.push('Increase physical activity gradually')
    recommendations.push('Consider professional guidance')
    
    return recommendations
  }

  private getActivityRecommendations(): string[] {
    const recommendations = []
    
    recommendations.push('Start with 5-minute activity sessions')
    recommendations.push('Take regular movement breaks')
    recommendations.push('Try gentle stretching exercises')
    
    return recommendations
  }

  private getBMIRecommendations(): string[] {
    const recommendations = []
    
    recommendations.push('Consult healthcare provider')
    recommendations.push('Focus on lifestyle changes')
    recommendations.push('Consider professional support')
    
    return recommendations
  }

  /**
   * Get cultural health context for a region using SEALION LLM
   */
  async getCulturalHealthContext(region: string, metric: string): Promise<CulturalHealthContext | null> {
    try {
      if (!this.seaLionService || !this.seaLionService.isConfigured()) {
        console.warn('SEALION service not configured, falling back to basic context')
        return this.getFallbackCulturalContext(region, metric)
      }

      const messages: SeaLionMessage[] = [
        {
          role: 'system',
          content: `You are a cultural health expert specializing in Southeast Asian health practices. Provide detailed cultural health traditions for the specified region and health metric in JSON format with the following structure:
{
  "region": "Full region name",
  "traditionalPractices": ["practice1", "practice2", "practice3", "practice4"]
}

Focus on authentic, culturally appropriate health traditions that are specifically related to ${metric} health practices. For example:
- If metric is "steps": suggest walking traditions, temple walks, park visits, BTS usage, traditional walking practices
- If metric is "sleep": suggest traditional sleep practices, meditation, relaxation techniques
- If metric is "calories": suggest traditional foods, cooking methods, eating practices
- If metric is "heartRate": suggest traditional exercise, martial arts, breathing techniques
- If metric is "weight": suggest traditional body practices, herbal remedies, lifestyle habits
- If metric is "activity": suggest traditional physical activities, cultural sports, community practices
- If metric is "bmi": suggest traditional body wellness practices, herbal treatments, lifestyle approaches

Make the suggestions specific to the region and culturally authentic.`
        },
        {
          role: 'user',
          content: `Provide cultural health traditions for ${region} specifically related to ${metric} health practices. Focus on traditional practices that people in this region use for ${metric} health and wellness.`
        }
      ]

      const response = await this.seaLionService.sendMessage(messages, 0.7)
      
      try {
        const culturalContext = JSON.parse(response.content)
        
        // Validate the response structure
        if (culturalContext.region && 
            Array.isArray(culturalContext.traditionalPractices) &&
            Array.isArray(culturalContext.modernAdaptations) &&
            Array.isArray(culturalContext.culturalValues)) {
          return culturalContext as CulturalHealthContext
        } else {
          throw new Error('Invalid response structure')
        }
      } catch (parseError) {
        console.error('Failed to parse SEALION response:', parseError)
        return this.getFallbackCulturalContext(region, metric)
      }
    } catch (error) {
      console.error('Error getting cultural context from SEALION:', error)
      return this.getFallbackCulturalContext(region, metric)
    }
  }

  /**
   * Fallback cultural context when SEALION is unavailable
   */
  private getFallbackCulturalContext(region: string, metric: string): CulturalHealthContext | null {
    const getMetricSpecificPractices = (region: string, metric: string): string[] => {
      const practices: Record<string, Record<string, string[]>> = {
        thailand: {
          steps: [
            'Take a morning walk in Lumpini Park or Chatuchak Park',
            'Use BTS Skytrain for daily commuting and walking between stations',
            'Visit temples like Wat Pho for peaceful walking meditation',
            'Join local morning exercise groups in public parks'
          ],
          sleep: [
            'Practice Buddhist meditation before bedtime',
            'Use traditional herbal pillows with jasmine or lavender',
            'Follow traditional sleep schedule aligned with natural light',
            'Create a peaceful bedroom with Buddhist elements'
          ],
          calories: [
            'Enjoy traditional Thai street food in moderation',
            'Cook with fresh herbs like lemongrass and galangal',
            'Practice mindful eating during family meals',
            'Include traditional fermented foods like pickled vegetables'
          ],
          heartRate: [
            'Practice Muay Thai for cardiovascular fitness',
            'Learn traditional Thai breathing techniques',
            'Join community aerobics in public parks',
            'Practice traditional Thai dance for heart health'
          ],
          weight: [
            'Use traditional Thai herbal remedies for metabolism',
            'Practice portion control with traditional serving methods',
            'Include traditional Thai vegetables in daily meals',
            'Follow traditional meal timing and eating habits'
          ],
          activity: [
            'Participate in traditional Thai festivals and ceremonies',
            'Join community sports like takraw (traditional volleyball)',
            'Practice traditional Thai martial arts',
            'Engage in community gardening and farming activities'
          ],
          bmi: [
            'Consult with traditional Thai medicine practitioners',
            'Use traditional body measurement techniques',
            'Follow traditional dietary guidelines for body balance',
            'Practice traditional exercises for body harmony'
          ]
        },
        singapore: {
          steps: [
            'Walk through Marina Bay Sands and Gardens by the Bay',
            'Use MRT system for daily commuting with walking between stations',
            'Visit Singapore Botanic Gardens for nature walks',
            'Join community walking groups in East Coast Park'
          ],
          sleep: [
            'Practice mindfulness meditation in quiet spaces',
            'Use traditional Chinese herbal teas for better sleep',
            'Follow traditional sleep hygiene practices',
            'Create a calming bedroom environment with feng shui principles'
          ],
          calories: [
            'Enjoy diverse hawker center food in balanced portions',
            'Cook with traditional Chinese, Malay, and Indian spices',
            'Practice portion control with traditional serving sizes',
            'Include traditional fermented foods and probiotics'
          ],
          heartRate: [
            'Practice Tai Chi in public parks',
            'Join community fitness classes in HDB void decks',
            'Learn traditional breathing exercises',
            'Participate in cultural dance and martial arts'
          ],
          weight: [
            'Consult with traditional Chinese medicine practitioners',
            'Use traditional body measurement and assessment methods',
            'Follow traditional dietary principles for body balance',
            'Practice traditional exercises for weight management'
          ],
          activity: [
            'Participate in multi-cultural festivals and events',
            'Join community sports clubs and recreational activities',
            'Practice traditional martial arts and dance',
            'Engage in community gardening and urban farming'
          ],
          bmi: [
            'Seek advice from traditional medicine practitioners',
            'Use traditional body assessment techniques',
            'Follow cultural dietary guidelines for body harmony',
            'Practice traditional exercises for overall wellness'
          ]
        }
      }

      return practices[region]?.[metric] || [
        `Traditional ${metric} health practices in ${region}`,
        `Cultural approaches to ${metric} wellness`,
        `Community-based ${metric} health traditions`,
        `Traditional methods for ${metric} health management`
      ]
    }

    return {
      region: region.charAt(0).toUpperCase() + region.slice(1),
      traditionalPractices: getMetricSpecificPractices(region, metric)
    }
  }
}
