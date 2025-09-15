import { TranslationModel } from './TranslationModel'
import { ReasoningModel } from './ReasoningModel'
import { FirebaseAnalyticsService } from './FirebaseAnalyticsService'

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
  private conversationHistory: ChatMessage[] = []
  private isAnalyticsEnabled: boolean = false
  private analyticsInitialized: boolean = false

  constructor(enableAnalytics: boolean = true) {
    this.translationModel = new TranslationModel()
    this.reasoningModel = new ReasoningModel()
    this.isAnalyticsEnabled = enableAnalytics
    
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
   * Send a message through the new two-model pipeline
   * Model B (Translation): Handle user communication and translate queries/responses
   * Model A (Reasoning): Process health data and generate insights
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
          console.log('HealthChatService: Attempting to log user message analytics')
          // Wait for analytics to be initialized
          if (!this.analyticsInitialized) {
            console.log('HealthChatService: Waiting for analytics initialization...')
            // Wait up to 5 seconds for initialization
            let attempts = 0
            while (!this.analyticsInitialized && attempts < 50) {
              await new Promise(resolve => setTimeout(resolve, 100))
              attempts++
            }
          }
          
          if (this.analyticsService.isReady()) {
            await this.analyticsService.logMessageSent(userMessage, {
              language: 'en', // You can detect this from the message
              queryType: 'health_inquiry'
            })
            console.log('HealthChatService: User message analytics logged successfully')
          } else {
            console.warn('HealthChatService: Analytics service still not ready after waiting')
          }
        } catch (error) {
          console.warn('HealthChatService: Failed to log user message analytics:', error)
        }
      } else {
        console.log('HealthChatService: Analytics not available for user message')
      }

      // Step 1: Model B (Translation) - Translate user message into structured query
      const translatedQuery = await this.translationModel.translateUserInput(userMessage)
      
      // Step 2: Model A (Reasoning) - Process translated query and analyze health data
      const healthAnalysis = await this.reasoningModel.processHealthQuery(translatedQuery)
      
      // Step 3: Model B (Translation) - Translate technical response into user-friendly language
      const conversationContext = this.getConversationContext()
      const translatedResponse = await this.translationModel.translateModelResponse(
        JSON.stringify(healthAnalysis),
        userMessage,
        conversationContext,
        translatedQuery.languageCode
      )

      const responseTime = Date.now() - startTime

      // Add AI response to conversation history
      const aiMessageObj = {
        type: 'ai' as const,
        text: translatedResponse.translatedResponse,
        timestamp: new Date()
      }
      this.conversationHistory.push(aiMessageObj)

      // Log analytics for AI response and health data query
      if (this.isAnalyticsEnabled && this.analyticsService) {
        try {
          // Wait for analytics to be initialized
          if (!this.analyticsInitialized) {
            console.log('HealthChatService: Waiting for analytics initialization for AI message...')
            let attempts = 0
            while (!this.analyticsInitialized && attempts < 50) {
              await new Promise(resolve => setTimeout(resolve, 100))
              attempts++
            }
          }
          
          if (this.analyticsService.isReady()) {
            // Log message received event
            await this.analyticsService.logMessageReceived(
              translatedResponse.translatedResponse,
              responseTime,
              {
                language: translatedQuery.languageCode,
                queryType: translatedQuery.intent,
                dataType: translatedQuery.dataType,
                timeRange: translatedQuery.timeRange
              }
            )

            // Log detailed health data query analytics
            await this.analyticsService.logHealthDataQuery(
              userMessage,
              translatedQuery,
              healthAnalysis,
              responseTime,
              {
                dataSource: 'health_connect',
                dataTypes: [translatedQuery.dataType],
                processingTime: responseTime,
                modelVersion: '1.0'
              }
            )
          } else {
            console.warn('HealthChatService: Analytics service not ready for AI message after waiting')
          }
        } catch (error) {
          console.warn('HealthChatService: Failed to log AI response analytics:', error)
        }
      }

      return translatedResponse.translatedResponse
    } catch (error) {
      console.error('Error in new chat pipeline:', error)
      
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
      
      throw new Error('Failed to process message')
    }
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
    
    const recentMessages = this.conversationHistory.slice(-6) // Last 6 messages
    return recentMessages.map(msg => `${msg.type}: ${msg.text}`).join('\n')
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
} 