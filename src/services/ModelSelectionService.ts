import { SeaLionService } from './SeaLionService'
import { OpenAIService } from './OpenAIService'

export interface ModelMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ModelResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  modelUsed: string
}

export class ModelSelectionService {
  private seaLionService: SeaLionService
  private openAIService: OpenAIService
  private preferredModel: 'sea-lion' | 'openai' | 'none'

  constructor() {
    // Initialize SEA-LION service
    try {
      this.seaLionService = new SeaLionService()
    } catch (error) {
      console.warn('SEA-LION service not available:', error)
      this.seaLionService = null as any
    }

    // Initialize OpenAI service
    try {
      this.openAIService = new OpenAIService()
    } catch (error) {
      console.warn('OpenAI service not available:', error)
      this.openAIService = null as any
    }

    // Determine preferred model based on availability
    this.preferredModel = this.determinePreferredModel()
    console.log('ModelSelectionService: Preferred model set to:', this.preferredModel)
  }

  /**
   * Determine the preferred model based on availability
   * Priority: SEA-LION > OpenAI > None
   */
  private determinePreferredModel(): 'sea-lion' | 'openai' | 'none' {
    if (this.seaLionService && this.seaLionService.isConfigured()) {
      return 'sea-lion'
    }
    if (this.openAIService && this.openAIService.isConfigured()) {
      return 'openai'
    }
    return 'none'
  }

  /**
   * Send a message using the best available model
   * Tries SEA-LION first, falls back to OpenAI, then to local processing
   */
  async sendMessage(
    messages: ModelMessage[],
    temperature: number = 0.7
  ): Promise<ModelResponse> {
    // Try SEA-LION first (preferred model)
    if (this.preferredModel === 'sea-lion' && this.seaLionService && this.seaLionService.isConfigured()) {
      try {
        console.log('ModelSelectionService: Using SEA-LION model')
        const response = await this.seaLionService.sendMessage(messages, temperature)
        return {
          ...response,
          modelUsed: 'sea-lion'
        }
      } catch (error) {
        console.warn('SEA-LION failed, falling back to OpenAI:', error)
        // Fall through to OpenAI fallback
      }
    }

    // Try OpenAI as fallback
    if (this.openAIService && this.openAIService.isConfigured()) {
      try {
        console.log('ModelSelectionService: Using OpenAI model (fallback)')
        const response = await this.openAIService.sendMessage(messages, temperature)
        return {
          ...response,
          modelUsed: 'openai'
        }
      } catch (error) {
        console.warn('OpenAI failed, no AI models available:', error)
        throw new Error('No AI models available')
      }
    }

    throw new Error('No AI models configured')
  }

  /**
   * Check if any AI model is available
   */
  isAnyModelAvailable(): boolean {
    return this.preferredModel !== 'none'
  }

  /**
   * Check if SEA-LION is available
   */
  isSeaLionAvailable(): boolean {
    return this.seaLionService !== null && this.seaLionService.isConfigured()
  }

  /**
   * Check if OpenAI is available
   */
  isOpenAIAvailable(): boolean {
    return this.openAIService !== null && this.openAIService.isConfigured()
  }

  /**
   * Get the current preferred model
   */
  getPreferredModel(): string {
    return this.preferredModel
  }

  /**
   * Get the model that will be used for the next request
   */
  getModelToUse(): string {
    if (this.preferredModel === 'sea-lion' && this.isSeaLionAvailable()) {
      return 'sea-lion'
    }
    if (this.isOpenAIAvailable()) {
      return 'openai'
    }
    return 'none'
  }

  /**
   * Get detailed status of all models
   */
  getModelStatus(): {
    seaLion: { available: boolean; configured: boolean }
    openai: { available: boolean; configured: boolean }
    preferred: string
  } {
    return {
      seaLion: {
        available: this.seaLionService !== null,
        configured: this.isSeaLionAvailable()
      },
      openai: {
        available: this.openAIService !== null,
        configured: this.isOpenAIAvailable()
      },
      preferred: this.preferredModel
    }
  }
}
