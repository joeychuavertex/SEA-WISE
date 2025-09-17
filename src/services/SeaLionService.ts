export interface SeaLionMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface SeaLionResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class SeaLionService {
  private apiKey: string
  private baseUrl: string
  private model: string

  constructor() {
    this.apiKey = import.meta.env.VITE_SEA_LION_API_KEY || ''
    this.baseUrl = 'https://api.sea-lion.ai/v1'
    this.model = import.meta.env.VITE_SEA_LION_MODEL || 'aisingapore/Llama-SEA-LION-v3.5-8B-R'
  }

  /**
   * Send a message to the SEA-LION API
   */
  async sendMessage(
    messages: SeaLionMessage[],
    temperature: number = 0.7
  ): Promise<SeaLionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'accept': 'text/plain',
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature,
          chat_template_kwargs: {
            thinking_mode: 'off'
          }
        })
      })

      if (!response.ok) {
        throw new Error(`SEA-LION API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      return {
        content: data.choices[0]?.message?.content || '',
        usage: data.usage
      }
    } catch (error) {
      console.error('Error calling SEA-LION API:', error)
      throw new Error('Failed to communicate with SEA-LION API')
    }
  }

  /**
   * Check if the SEA-LION service is properly configured
   */
  isConfigured(): boolean {
    return !!this.apiKey && !!this.baseUrl
  }

  /**
   * Get the current model being used
   */
  getModel(): string {
    return this.model
  }
} 