import type { HealthDataContext } from './HealthChatService'
import type { ChatMessage } from './HealthChatService'
import { OpenAIService } from './OpenAIService'

export class ResponseGenerator {
  private openAIService: OpenAIService

  constructor() {
    try {
      this.openAIService = new OpenAIService()
    } catch (error) {
      console.warn('OpenAI service not available, falling back to local processing:', error)
      this.openAIService = null as any
    }
  }

  /**
   * Generate human-readable response based on processed health data
   * This is Model B in the two-model pipeline
   */
  async generateResponse(
    userQuery: string,
    healthDataContext: HealthDataContext,
    conversationHistory: ChatMessage[]
  ): Promise<string> {
    try {
      const { relevantData } = healthDataContext
      
      // Use OpenAI for response generation if available
      if (this.openAIService && this.openAIService.isConfigured()) {
        return await this.generateResponseWithAI(userQuery, healthDataContext, conversationHistory)
      }
      
      // Fallback to local response generation
      let response = this.generateBaseResponse(userQuery, relevantData, healthDataContext.dataType || 'general', healthDataContext.timeRange || 'today')
      
      // Add insights and recommendations
      if (relevantData.trends && relevantData.trends.length > 0) {
        response += '\n\n' + this.formatTrends(relevantData.trends)
      }
      
      if (relevantData.recommendations && relevantData.recommendations.length > 0) {
        response += '\n\n' + this.formatRecommendations(relevantData.recommendations)
      }
      
      // Add follow-up suggestions
      response += '\n\n' + this.generateFollowUpSuggestions(healthDataContext.dataType || 'general', healthDataContext.timeRange || 'today')
      
      return response
    } catch (error) {
      console.error('Error generating response:', error)
      return "I'm sorry, I'm having trouble processing your request right now. Please try asking about your health data in a different way."
    }
  }

  /**
   * Generate response using OpenAI for more natural and contextual responses
   */
  private async generateResponseWithAI(
    userQuery: string,
    healthDataContext: HealthDataContext,
    conversationHistory: ChatMessage[]
  ): Promise<string> {
    try {
      const { relevantData, dataType, timeRange } = healthDataContext
      
      // Create a comprehensive system prompt
      const systemPrompt = `You are a helpful health assistant that provides insights about user health data. 

Your role is to:
1. Analyze the user's question about their health data
2. Provide helpful, accurate, and encouraging responses
3. Use the health data context to give personalized insights
4. Offer actionable recommendations when appropriate
5. Keep responses conversational and supportive

Health Data Context:
- Data Type: ${dataType}
- Time Range: ${timeRange}
- Available Metrics: ${JSON.stringify(relevantData.metrics)}
- Summary: ${relevantData.summary}
- Trends: ${relevantData.trends?.join(', ') || 'None detected'}
- Recommendations: ${relevantData.recommendations?.join(', ') || 'None provided'}

Conversation History: ${conversationHistory.slice(-3).map(msg => `${msg.type}: ${msg.text}`).join('\n')}

Respond in a helpful, conversational tone. Be encouraging and provide actionable insights when possible.`

      const response = await this.openAIService.sendMessage([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userQuery }
      ], 0.7) // Moderate temperature for creative but consistent responses

      return response.content
    } catch (error) {
      console.warn('AI response generation failed, falling back to local generation:', error)
      return this.generateBaseResponse(userQuery, healthDataContext.relevantData, healthDataContext.dataType || 'general', healthDataContext.timeRange || 'today')
    }
  }

  /**
   * Generate base response based on user query and health data
   */
  private generateBaseResponse(
    userQuery: string,
    relevantData: any,
    dataType: string,
    timeRange: string
  ): string {
    const lowerQuery = userQuery.toLowerCase()
    
    // Handle specific question types
    if (lowerQuery.includes('how many') || lowerQuery.includes('what is my')) {
      return this.generateMetricResponse(relevantData, dataType, timeRange)
    }
    
    if (lowerQuery.includes('compare') || lowerQuery.includes('vs')) {
      return this.generateComparisonResponse(relevantData, dataType, timeRange)
    }
    
    if (lowerQuery.includes('trend') || lowerQuery.includes('progress')) {
      return this.generateTrendResponse(relevantData, dataType, timeRange)
    }
    
    if (lowerQuery.includes('goal') || lowerQuery.includes('target')) {
      return this.generateGoalResponse(relevantData, dataType, timeRange)
    }
    
    // Default response
    return this.generateDefaultResponse(relevantData, dataType, timeRange)
  }

  /**
   * Generate response for metric-specific questions
   */
  private generateMetricResponse(relevantData: any, dataType: string, timeRange: string): string {
    if (dataType === 'steps') {
      const steps = relevantData.metrics.find((m: any) => m.type === 'steps')
      if (steps) {
        return `Your step count for ${timeRange} is ${steps.value.toLocaleString()} steps. This represents ${this.getStepPercentage(steps.value)} of your daily goal.`
      }
    }
    
    if (dataType === 'calories') {
      const calories = relevantData.metrics.find((m: any) => m.type === 'calories')
      if (calories) {
        return `You've burned ${calories.value} calories ${timeRange}. This is a great effort towards maintaining an active lifestyle!`
      }
    }
    
    if (dataType === 'sleep') {
      const sleep = relevantData.metrics.find((m: any) => m.type === 'sleep')
      if (sleep) {
        return `You slept ${sleep.value.toFixed(1)} hours ${timeRange}. ${this.getSleepQuality(sleep.value)}`
      }
    }
    
    if (dataType === 'heartRate') {
      const heartRate = relevantData.metrics.find((m: any) => m.type === 'heartRate')
      if (heartRate) {
        return `Your current heart rate is ${heartRate.value} BPM. ${this.getHeartRateContext(heartRate.value)}`
      }
    }
    
    return relevantData.summary || `Here's your health data for ${timeRange}.`
  }

  /**
   * Generate response for comparison questions
   */
  private generateComparisonResponse(relevantData: any, dataType: string, _timeRange: string): string {
    if (dataType === 'steps' && relevantData.steps) {
      const { current, average } = relevantData.steps
      if (current > average) {
        return `Great news! Your current step count of ${current.toLocaleString()} is above your average of ${average.toLocaleString()}. You're making excellent progress!`
      } else if (current < average) {
        return `Your current step count of ${current.toLocaleString()} is below your average of ${average.toLocaleString()}. Consider taking a short walk to catch up.`
      } else {
        return `Your current step count of ${current.toLocaleString()}) matches your average. You're maintaining consistency!`
      }
    }
    
    return `I can help you compare your health metrics. What specific comparison would you like to see?`
  }

  /**
   * Generate response for trend questions
   */
  private generateTrendResponse(relevantData: any, dataType: string, _timeRange: string): string {
    if (dataType === 'steps' && relevantData.steps) {
      const { trend, current, goal } = relevantData.steps
      if (trend === 'increasing') {
        return `Your step count is trending upward! You're currently at ${current.toLocaleString()} steps, which is excellent progress toward your ${goal.toLocaleString()} step goal.`
      } else if (trend === 'decreasing') {
        return `I notice your step count has been decreasing. You're currently at ${current.toLocaleString()} steps. Consider setting smaller daily goals to build momentum.`
      } else {
        return `Your step count is stable at ${current.toLocaleString()} steps. Consistency is key to maintaining good health habits.`
      }
    }
    
    return `I can analyze trends in your health data. What specific trends would you like to explore?`
  }

  /**
   * Generate response for goal-related questions
   */
  private generateGoalResponse(relevantData: any, dataType: string, _timeRange: string): string {
    if (dataType === 'steps' && relevantData.steps) {
      const { current, goal } = relevantData.steps
      const remaining = goal - current
      if (remaining > 0) {
        return `You're ${remaining.toLocaleString()} steps away from your daily goal of ${goal.toLocaleString()}. That's about ${Math.ceil(remaining / 1000)} more short walks!`
      } else {
        return `Congratulations! You've exceeded your daily step goal of ${goal.toLocaleString()} by ${Math.abs(remaining).toLocaleString()} steps. You're crushing it!`
      }
    }
    
    return `I can help you track your health goals. What specific goal would you like to check?`
  }

  /**
   * Generate default response
   */
  private generateDefaultResponse(relevantData: any, dataType: string, timeRange: string): string {
    return relevantData.summary || `Here's what I found about your health data for ${timeRange}. ${this.getGeneralInsight(dataType)}`
  }

  /**
   * Format trends for display
   */
  private formatTrends(trends: string[]): string {
    if (trends.length === 0) return ''
    
    let response = '📊 **Trends I noticed:**\n'
    trends.forEach(trend => {
      response += `• ${trend}\n`
    })
    
    return response
  }

  /**
   * Format recommendations for display
   */
  private formatRecommendations(recommendations: string[]): string {
    if (recommendations.length === 0) return ''
    
    let response = '💡 **Suggestions:**\n'
    recommendations.forEach(rec => {
      response += `• ${rec}\n`
    })
    
    return response
  }

  /**
   * Generate follow-up suggestions
   */
  private generateFollowUpSuggestions(_dataType: string, _timeRange: string): string {
    const suggestions = [
      "You can ask me about specific metrics like steps, calories, sleep, or heart rate.",
      "I can help you compare your data over different time periods.",
      "Ask me about trends or progress toward your health goals."
    ]
    
    return `💭 **What else would you like to know?**\n${suggestions.join(' ')}`
  }

  /**
   * Get step percentage relative to goal
   */
  private getStepPercentage(steps: number): string {
    const goal = 10000
    const percentage = Math.round((steps / goal) * 100)
    return `${percentage}%`
  }

  /**
   * Get sleep quality assessment
   */
  private getSleepQuality(hours: number): string {
    if (hours >= 8) return "This is excellent sleep duration!"
    if (hours >= 7) return "This is good sleep duration."
    if (hours >= 6) return "This is adequate sleep, but you might benefit from more."
    return "You're getting less sleep than recommended. Consider prioritizing rest."
  }

  /**
   * Get heart rate context
   */
  private getHeartRateContext(bpm: number): string {
    if (bpm < 60) return "This is a relatively low heart rate, which can be normal for athletes."
    if (bpm < 100) return "This is a normal resting heart rate."
    if (bpm < 120) return "This is an elevated heart rate, possibly due to recent activity."
    return "This is a high heart rate. If this persists, consider consulting a healthcare provider."
  }

  /**
   * Get general insight based on data type
   */
  private getGeneralInsight(dataType: string): string {
    switch (dataType) {
      case 'steps':
        return "Regular walking is excellent for cardiovascular health and maintaining a healthy weight."
      case 'calories':
        return "Calorie burn through activity helps create a healthy energy balance."
      case 'sleep':
        return "Quality sleep is crucial for recovery, mood, and overall health."
      case 'heartRate':
        return "Monitoring heart rate helps understand your cardiovascular fitness and stress levels."
      default:
        return "Your health data provides valuable insights into your wellness journey."
    }
  }
} 