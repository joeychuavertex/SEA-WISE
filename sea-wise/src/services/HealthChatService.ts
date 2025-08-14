import { HealthDataProcessor } from './HealthDataProcessor'
import { ResponseGenerator } from './ResponseGenerator'

export interface ChatMessage {
  type: 'user' | 'ai'
  text: string
  timestamp: Date
}

export interface HealthDataContext {
  query: string
  relevantData: any
  dataType: string
  timeRange?: string
}

export class HealthChatService {
  private dataProcessor: HealthDataProcessor
  private responseGenerator: ResponseGenerator
  private conversationHistory: ChatMessage[] = []

  constructor() {
    this.dataProcessor = new HealthDataProcessor()
    this.responseGenerator = new ResponseGenerator()
  }

  /**
   * Send a message through the two-model pipeline
   * Model A: Process user query and extract health data
   * Model B: Generate human-readable response
   */
  async sendMessage(userMessage: string): Promise<string> {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        type: 'user',
        text: userMessage,
        timestamp: new Date()
      })

      // Model A: Process user query and extract health data
      const healthDataContext = await this.dataProcessor.processQuery(userMessage)
      
      // Model B: Generate response based on processed data
      const response = await this.responseGenerator.generateResponse(
        userMessage,
        healthDataContext,
        this.conversationHistory
      )

      // Add AI response to conversation history
      this.conversationHistory.push({
        type: 'ai',
        text: response,
        timestamp: new Date()
      })

      return response
    } catch (error) {
      console.error('Error in chat pipeline:', error)
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