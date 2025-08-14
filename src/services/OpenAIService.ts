export interface OpenAIResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class OpenAIService {
  private apiKey: string
  private model: string
  private baseUrl: string

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY
    this.model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4'
    this.baseUrl = 'https://api.openai.com/v1/chat/completions'
    
    if (!this.apiKey) {
      throw new Error('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file.')
    }
  }

  /**
   * Send a message to OpenAI API
   */
  async sendMessage(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    temperature: number = 0.7
  ): Promise<OpenAIResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature,
          max_tokens: 1000,
          stream: false
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`)
      }

      const data = await response.json()
      
      return {
        content: data.choices[0]?.message?.content || 'No response received',
        usage: data.usage
      }
    } catch (error) {
      console.error('OpenAI API call failed:', error)
      throw new Error(`Failed to get response from OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get the current model being used
   */
  getModel(): string {
    return this.model
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return !!this.apiKey
  }
} 