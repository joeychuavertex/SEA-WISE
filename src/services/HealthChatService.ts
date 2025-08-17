import { TranslationModel } from './TranslationModel'
import { ReasoningModel } from './ReasoningModel'

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
  private conversationHistory: ChatMessage[] = []

  constructor() {
    this.translationModel = new TranslationModel()
    this.reasoningModel = new ReasoningModel()
  }

  /**
   * Send a message through the new two-model pipeline
   * Model B (Translation): Handle user communication and translate queries/responses
   * Model A (Reasoning): Process health data and generate insights
   */
  async sendMessage(userMessage: string): Promise<string> {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        type: 'user',
        text: userMessage,
        timestamp: new Date()
      })

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

      // Add AI response to conversation history
      this.conversationHistory.push({
        type: 'ai',
        text: translatedResponse.translatedResponse,
        timestamp: new Date()
      })

      return translatedResponse.translatedResponse
    } catch (error) {
      console.error('Error in new chat pipeline:', error)
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
} 