import { TranslationModel } from './TranslationModel'
import { ReasoningModel } from './ReasoningModel'
import { FirebaseAnalyticsService } from './FirebaseAnalyticsService'
import { SampleDataService } from './SampleDataService'

export interface ChatMessage {
  type: 'user' | 'ai'
  text: string
  timestamp: Date
}

export interface HealthDataContext {
  query: string
  relevantData: any
  dataType: string
  timeRange: string
}

export class HealthChatService {
  private translationModel: TranslationModel
  private reasoningModel: ReasoningModel
  private analyticsService?: FirebaseAnalyticsService
  private sampleDataService: SampleDataService
  private conversationHistory: ChatMessage[] = []
  private isAnalyticsEnabled: boolean = false
  private analyticsInitialized: boolean = false

  constructor(enableAnalytics: boolean = true) {
    this.translationModel = new TranslationModel()
    this.reasoningModel = new ReasoningModel()
    this.sampleDataService = new SampleDataService()
    this.isAnalyticsEnabled = enableAnalytics
    
    // Log model status for debugging
    console.log('HealthChatService: Model status - Translation:', this.translationModel.getModelStatus())
    console.log('HealthChatService: Model status - Reasoning:', this.reasoningModel.getModelStatus())
    
    if (this.isAnalyticsEnabled) {
      console.log('HealthChatService: Initializing Firebase Analytics')
      this.analyticsService = new FirebaseAnalyticsService()
      // Set a default user ID (you can modify this based on your auth system)
      this.analyticsService.setUserId('default-user')
      console.log('HealthChatService: User ID set to default-user')
      
      // Start session immediately
      this.analyticsService.startSession().then(sessionId => {
        console.log('HealthChatService: Analytics session started with ID:', sessionId)
        this.analyticsInitialized = true
      }).catch(error => {
        console.error('HealthChatService: Failed to start analytics session:', error)
        this.analyticsInitialized = false
      })
    } else {
      console.log('HealthChatService: Analytics disabled')
    }
  }

  /**
   * Send a message and get AI response with proper conversation context
   */
  async sendMessage(userMessage: string): Promise<string> {
    const startTime = Date.now()
    
    try {
      // Add user message to conversation history
      const userMessageObj = {
        type: 'user' as const,
        text: userMessage,
        timestamp: new Date()
      }
      this.conversationHistory.push(userMessageObj)

      // Log analytics for user message
      if (this.isAnalyticsEnabled && this.analyticsService) {
        try {
          if (!this.analyticsInitialized) {
            let attempts = 0
            while (!this.analyticsInitialized && attempts < 50) {
              await new Promise(resolve => setTimeout(resolve, 100))
              attempts++
            }
          }
          
          if (this.analyticsService.isReady()) {
            await this.analyticsService.logMessageSent(userMessage, {
              language: 'en',
              queryType: 'health_inquiry'
            })
          }
        } catch (error) {
          console.warn('HealthChatService: Failed to log user message analytics:', error)
        }
      }

      // Get conversation context for better responses
      const conversationContext = this.getConversationContext()
      
      // Get real health data to provide accurate insights
      const healthData = this.sampleDataService.getLatestHealthData()
      const healthDataContext = this.formatHealthDataForContext(healthData)
      
      // Create a comprehensive prompt that includes conversation history and real data
      const systemPrompt = `You are a helpful health assistant. You help users understand their health data, track progress, and provide insights.

Current Health Data:
${healthDataContext}

Conversation History:
${conversationContext}

Current User Message: "${userMessage}"

Instructions:
1. Respond naturally and conversationally
2. Reference the actual health data provided above when relevant
3. Reference previous conversation context when relevant
4. Provide specific insights based on the real data
5. Keep responses concise but informative
6. Ask follow-up questions when appropriate
7. If the user asks about specific metrics, use the actual data values

Respond as a friendly health assistant:`

      // Use the model selection service directly for a simpler approach
      const modelService = new (await import('./ModelSelectionService')).ModelSelectionService()
      
      let response = ''
      if (modelService.isAnyModelAvailable()) {
        const aiResponse = await modelService.sendMessage([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ], 0.7)
        response = aiResponse.content
      } else {
        // Fallback response
        response = this.generateFallbackResponse(userMessage)
      }

      const responseTime = Date.now() - startTime

      // Add AI response to conversation history
      const aiMessageObj = {
        type: 'ai' as const,
        text: response,
        timestamp: new Date()
      }
      this.conversationHistory.push(aiMessageObj)

      // Log analytics for AI response
      if (this.isAnalyticsEnabled && this.analyticsService) {
        try {
          if (this.analyticsService.isReady()) {
            await this.analyticsService.logMessageReceived(
              response,
              responseTime,
              {
                language: 'en',
                queryType: 'health_response'
              }
            )
          }
        } catch (error) {
          console.warn('HealthChatService: Failed to log AI response analytics:', error)
        }
      }

      return response
    } catch (error) {
      console.error('Error in chat service:', error)
      
      // Log error analytics
      if (this.isAnalyticsEnabled && this.analyticsService) {
        try {
          await this.analyticsService.logError(
            error instanceof Error ? error.message : 'Unknown error',
            'chat_processing_error',
            'sendMessage'
          )
        } catch (analyticsError) {
          console.warn('Failed to log error analytics:', analyticsError)
        }
      }
      
      // Return a helpful error message
      return "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment."
    }
  }

  /**
   * Format health data for inclusion in AI context
   */
  private formatHealthDataForContext(healthData: any): string {
    if (!healthData) {
      return "No health data available at the moment."
    }

    let context = "Latest Health Metrics:\n"
    
    if (healthData.steps !== undefined) {
      context += `• Steps today: ${healthData.steps.toLocaleString()}\n`
    }
    
    if (healthData.calories !== undefined) {
      context += `• Calories burned: ${healthData.calories}\n`
    }
    
    if (healthData.activeMinutes !== undefined) {
      context += `• Active minutes: ${healthData.activeMinutes} minutes\n`
    }
    
    if (healthData.heartRate !== undefined) {
      context += `• Heart rate: ${healthData.heartRate} bpm\n`
    }
    
    if (healthData.totalMinutesAsleep !== undefined) {
      const sleepHours = Math.round(healthData.totalMinutesAsleep / 60 * 10) / 10
      context += `• Sleep duration: ${sleepHours} hours\n`
    }
    
    if (healthData.weightKg !== undefined && healthData.weightKg > 0) {
      context += `• Weight: ${healthData.weightKg} kg (${healthData.weightPounds} lbs)\n`
    }
    
    if (healthData.bmi !== undefined && healthData.bmi > 0) {
      context += `• BMI: ${healthData.bmi}\n`
    }
    
    if (healthData.totalDistance !== undefined) {
      context += `• Distance: ${Math.round(healthData.totalDistance * 100) / 100} km\n`
    }
    
    // Add activity breakdown if available
    if (healthData.veryActiveMinutes !== undefined || healthData.fairlyActiveMinutes !== undefined) {
      context += "\nActivity Breakdown:\n"
      if (healthData.veryActiveMinutes > 0) {
        context += `• Very active: ${healthData.veryActiveMinutes} minutes\n`
      }
      if (healthData.fairlyActiveMinutes > 0) {
        context += `• Fairly active: ${healthData.fairlyActiveMinutes} minutes\n`
      }
      if (healthData.lightlyActiveMinutes > 0) {
        context += `• Lightly active: ${healthData.lightlyActiveMinutes} minutes\n`
      }
      if (healthData.sedentaryMinutes > 0) {
        context += `• Sedentary: ${healthData.sedentaryMinutes} minutes\n`
      }
    }
    
    return context
  }

  /**
   * Generate a fallback response when AI models are not available
   */
  private generateFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase()
    const healthData = this.sampleDataService.getLatestHealthData()
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm your health assistant. I can help you track your health metrics, analyze your data, and provide insights. What would you like to know about your health today?"
    }
    
    if (lowerMessage.includes('steps') || lowerMessage.includes('walking')) {
      if (healthData && healthData.steps !== undefined) {
        const goalStatus = healthData.steps >= 10000 ? "Great job!" : "Keep going!"
        return `I can see you've taken ${healthData.steps.toLocaleString()} steps today. ${goalStatus} The recommended daily goal is 10,000 steps. Would you like me to analyze your step patterns or help you set step goals?`
      }
      return "I can help you track your daily steps! On average, adults should aim for 10,000 steps per day. Would you like me to analyze your step patterns or help you set step goals?"
    }
    
    if (lowerMessage.includes('sleep')) {
      if (healthData && healthData.totalMinutesAsleep !== undefined) {
        const sleepHours = Math.round(healthData.totalMinutesAsleep / 60 * 10) / 10
        const sleepQuality = sleepHours >= 7 && sleepHours <= 9 ? "excellent" : sleepHours < 7 ? "could be better" : "might be too much"
        return `I can see you slept for ${sleepHours} hours last night. That's ${sleepQuality} sleep duration. Most adults need 7-9 hours of quality sleep per night. What specific aspect of your sleep would you like to discuss?`
      }
      return "Sleep is crucial for your health! I can help you track sleep duration, quality, and patterns. Most adults need 7-9 hours of quality sleep per night. What specific aspect of your sleep would you like to discuss?"
    }
    
    if (lowerMessage.includes('heart') || lowerMessage.includes('bpm')) {
      if (healthData && healthData.heartRate !== undefined) {
        return `Your current heart rate is ${healthData.heartRate} bpm. Heart rate monitoring is important for understanding your cardiovascular health. I can help you track resting heart rate, exercise heart rate, and identify patterns. What would you like to know about your heart rate data?`
      }
      return "Heart rate monitoring is important for understanding your cardiovascular health. I can help you track resting heart rate, exercise heart rate, and identify patterns. What would you like to know about your heart rate data?"
    }
    
    if (lowerMessage.includes('weight') || lowerMessage.includes('bmi')) {
      if (healthData && healthData.weightKg !== undefined && healthData.weightKg > 0) {
        const bmiText = healthData.bmi ? ` Your BMI is ${healthData.bmi}.` : ""
        return `I can see your current weight is ${healthData.weightKg} kg (${healthData.weightPounds} lbs).${bmiText} Weight tracking can help you monitor your health journey. I can help you analyze weight trends and provide insights about body composition changes. What would you like to explore about your weight data?`
      }
      return "Weight tracking can help you monitor your health journey. I can help you analyze weight trends, calculate BMI, and provide insights about body composition changes. What would you like to explore about your weight data?"
    }
    
    if (lowerMessage.includes('calorie') || lowerMessage.includes('burn')) {
      if (healthData && healthData.calories !== undefined) {
        return `I can see you've burned ${healthData.calories} calories today. Calorie tracking helps you understand your energy balance. I can help you analyze calorie burn patterns, activity levels, and provide recommendations for your fitness goals. What would you like to know about your calorie data?`
      }
      return "Calorie tracking helps you understand your energy balance. I can help you analyze calorie burn patterns, activity levels, and provide recommendations for your fitness goals. What would you like to know about your calorie data?"
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return "I can help you with:\n• Tracking daily steps and activity levels\n• Analyzing sleep patterns and quality\n• Monitoring heart rate and cardiovascular health\n• Tracking weight and BMI trends\n• Understanding calorie burn and energy expenditure\n• Setting and tracking health goals\n• Providing personalized health insights and recommendations\n\nWhat would you like to explore?"
    }
    
    return "I'm here to help you with your health data and provide insights. You can ask me about your steps, sleep, heart rate, weight, calories, or any other health metrics. What would you like to know?"
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory]
  }

  /**
   * Clear conversation history
   */
  clearConversationHistory(): void {
    this.conversationHistory = []
  }

  /**
   * Get conversation context for follow-up questions
   */
  getConversationContext(): string {
    if (this.conversationHistory.length === 0) return ''
    
    const recentMessages = this.conversationHistory.slice(-8) // Last 8 messages for better context
    return recentMessages.map(msg => {
      const role = msg.type === 'user' ? 'User' : 'Assistant'
      return `${role}: ${msg.text}`
    }).join('\n')
  }

  /**
   * Set user ID for analytics
   */
  setUserId(userId: string): void {
    if (this.isAnalyticsEnabled && this.analyticsService) {
      this.analyticsService.setUserId(userId)
    }
  }

  /**
   * Get current analytics session info
   */
  getAnalyticsSession() {
    if (this.isAnalyticsEnabled && this.analyticsService) {
      return this.analyticsService.getCurrentSession()
    }
    return null
  }

  /**
   * End analytics session
   */
  async endAnalyticsSession(): Promise<void> {
    if (this.isAnalyticsEnabled && this.analyticsService) {
      await this.analyticsService.endSession()
    }
  }

  /**
   * Log user interaction for analytics
   */
  async logUserInteraction(
    eventType: 'button_click' | 'input_focus' | 'input_blur' | 'scroll' | 'resize',
    elementId?: string,
    elementType?: string,
    metadata?: any
  ): Promise<void> {
    if (this.isAnalyticsEnabled && this.analyticsService) {
      try {
        // Ensure the analytics service is ready
        if (!this.analyticsService.isReady()) {
          console.log('HealthChatService: Analytics service not ready for user interaction, initializing...')
          await this.analyticsService.startSession()
        }
        await this.analyticsService.logUserInteraction(eventType, elementId, elementType, metadata)
      } catch (error) {
        console.warn('Failed to log user interaction:', error)
      }
    }
  }

  /**
   * Get latest health data for personalized responses
   */
  getLatestHealthData(): any {
    return this.sampleDataService.getLatestHealthData()
  }
} 