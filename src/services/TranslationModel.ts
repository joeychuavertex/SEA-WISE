import { ModelSelectionService } from './ModelSelectionService'

export interface TranslatedQuery {
  originalQuery: string
  translatedQuery: string
  dataType: string
  timeRange: string
  metrics: string[]
  intent: string
  confidence: number
  detectedLanguage: string
  languageCode: string
}

export interface TranslatedResponse {
  originalResponse: string
  translatedResponse: string
}

export class TranslationModel {
  private modelService: ModelSelectionService

  constructor() {
    this.modelService = new ModelSelectionService()
  }

  /**
   * Detect the language of the input text
   */
  private detectLanguage(text: string): { detectedLanguage: string; languageCode: string } {
    // Simple language detection based on common patterns
    const lowerText = text.toLowerCase()
    
    // Common language indicators with more specific patterns
    if (/[àáâãäåçèéêëìíîïñòóôõöùúûüýÿ]/.test(text)) {
      return { detectedLanguage: 'Spanish', languageCode: 'es' }
    }
    if (/[äöüß]/.test(text)) {
      return { detectedLanguage: 'German', languageCode: 'de' }
    }
    if (/[àâäéèêëïîôùûüÿç]/.test(text)) {
      return { detectedLanguage: 'French', languageCode: 'fr' }
    }
    if (/[àèéìíîòóù]/.test(text)) {
      return { detectedLanguage: 'Italian', languageCode: 'it' }
    }
    if (/[а-яё]/.test(text)) {
      return { detectedLanguage: 'Russian', languageCode: 'ru' }
    }
    if (/[一-龯]/.test(text)) {
      return { detectedLanguage: 'Chinese', languageCode: 'zh' }
    }
    if (/[あ-ん]/.test(text)) {
      return { detectedLanguage: 'Japanese', languageCode: 'ja' }
    }
    if (/[가-힣]/.test(text)) {
      return { detectedLanguage: 'Korean', languageCode: 'ko' }
    }
    if (/[ก-๙]/.test(text)) {
      return { detectedLanguage: 'Thai', languageCode: 'th' }
    }
    if (/[ا-ي]/.test(text)) {
      return { detectedLanguage: 'Arabic', languageCode: 'ar' }
    }
    
    // Check for common words in different languages
    if (/\b(como|que|para|con|por|su|más|este|esa|uno|todo|muy|bien|hacer|tener|ir|ver|dar|saber|poder|deber)\b/.test(lowerText)) {
      return { detectedLanguage: 'Spanish', languageCode: 'es' }
    }
    if (/\b(comment|pour|avec|dans|sur|sous|entre|par|sans|chez|vers|depuis|pendant|avant|après|toujours|jamais|beaucoup|peu|très|assez)\b/.test(lowerText)) {
      return { detectedLanguage: 'French', languageCode: 'fr' }
    }
    if (/\b(wie|was|wo|wann|warum|für|mit|bei|nach|von|aus|durch|ohne|gegen|über|unter|zwischen|hinter|vor|neben|an)\b/.test(lowerText)) {
      return { detectedLanguage: 'German', languageCode: 'de' }
    }
    
    // Default to English if no specific patterns detected
    return { detectedLanguage: 'English', languageCode: 'en' }
  }

  /**
   * Translate user message into clear, structured query for Model A (Reasoning Model)
   */
  async translateUserInput(userMessage: string): Promise<TranslatedQuery> {
    try {
      if (this.modelService.isAnyModelAvailable()) {
        return await this.translateWithAI(userMessage)
      }
      
      // Fallback to local translation
      return this.translateLocally(userMessage)
    } catch (error) {
      console.error('Error translating user input:', error)
      // Return a safe fallback
      const { detectedLanguage, languageCode } = this.detectLanguage(userMessage)
      return {
        originalQuery: userMessage,
        translatedQuery: userMessage,
        dataType: 'general',
        timeRange: 'today',
        metrics: [],
        intent: 'query',
        confidence: 0.5,
        detectedLanguage,
        languageCode
      }
    }
  }

  /**
   * Translate Model A's technical response into user-friendly language
   */
  async translateModelResponse(
    originalResponse: any,
    userQuery: string,
    conversationContext: string,
    targetLanguage: string = 'en'
  ): Promise<TranslatedResponse> {
    try {
      // Convert object to string for processing
      const responseString = typeof originalResponse === 'string' ? originalResponse : JSON.stringify(originalResponse)
      
      if (this.modelService.isAnyModelAvailable()) {
        return await this.translateResponseWithAI(responseString, userQuery, conversationContext, targetLanguage)
      }
      
      // Fallback to local translation
      return this.translateResponseLocally(responseString, userQuery)
    } catch (error) {
      console.error('Error translating model response:', error)
      const responseString = typeof originalResponse === 'string' ? originalResponse : JSON.stringify(originalResponse)
      return {
        originalResponse: responseString,
        translatedResponse: responseString
      }
    }
  }

  /**
   * Use AI to translate user input into structured query
   */
  private async translateWithAI(userMessage: string): Promise<TranslatedQuery> {
    const systemPrompt = `You are a translation model that converts user health queries into structured formats.

Extract: data type, time range, metrics, and intent from health questions.

Respond with JSON:
{
  "translatedQuery": "Clear version of the question",
  "dataType": "steps|calories|sleep|heartRate|weight|activity|general",
  "timeRange": "today|yesterday|week|month|recent|general",
  "metrics": ["array", "of", "metrics"],
  "intent": "query|compare|trend|goal|general",
  "confidence": 0.0-1.0
}`

    const response = await this.modelService.sendMessage([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ], 0.1) // Low temperature for consistent parsing

    try {
      const translation = JSON.parse(response.content)
      const { detectedLanguage, languageCode } = this.detectLanguage(userMessage)
      return {
        originalQuery: userMessage,
        translatedQuery: translation.translatedQuery || userMessage,
        dataType: translation.dataType || 'general',
        timeRange: translation.timeRange || 'today',
        metrics: translation.metrics || [],
        intent: translation.intent || 'query',
        confidence: translation.confidence || 0.8,
        detectedLanguage,
        languageCode
      }
    } catch (parseError) {
      console.warn('Failed to parse AI translation, falling back to local:', parseError)
      return this.translateLocally(userMessage)
    }
  }

  /**
   * Use AI to translate technical response into user-friendly language
   */
  private async translateResponseWithAI(
    originalResponse: string,
    userQuery: string,
    conversationContext: string,
    targetLanguage: string
  ): Promise<TranslatedResponse> {
    const systemPrompt = `You are a translation model that converts technical health data responses into user-friendly, conversational language.

Your task is to:
1. Parse the JSON response from a health reasoning model
2. Convert it into natural, easy-to-understand language in ${targetLanguage === 'en' ? 'English' : `the language with code ${targetLanguage}`}
3. Structure the response in a conversational way that directly answers the user's question
4. Keep the tone helpful and encouraging
5. Present insights, trends, and recommendations in a natural flow

The JSON response contains:
- dataSummary: A summary of the health data
- insights: Array of key insights
- trends: Array of identified trends  
- recommendations: Array of actionable recommendations
- technicalDetails: Technical analysis (usually not needed for user)

User's Original Question: "${userQuery}"
Conversation Context: "${conversationContext}"
Target Language: ${targetLanguage}

Technical Response to Translate:
"${originalResponse}"

Convert this JSON response into a natural, conversational response that directly answers the user's question. Don't just list the fields - weave them together into a coherent, helpful response.`

    const response = await this.modelService.sendMessage([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Please translate this technical response into user-friendly language.' }
    ], 0.7) // Moderate temperature for natural language

    return {
      originalResponse,
      translatedResponse: response.content
    }
  }

  /**
   * Local fallback for translating user input
   */
  private translateLocally(userMessage: string): TranslatedQuery {
    const lowerMessage = userMessage.toLowerCase()
    
    // Simple keyword-based translation
    let dataType = 'general'
    let timeRange = 'today'
    let metrics: string[] = []
    let intent = 'query'
    
    // Detect data type
    if (lowerMessage.includes('step') || lowerMessage.includes('walk')) {
      dataType = 'steps'
      metrics.push('steps')
    } else if (lowerMessage.includes('calorie') || lowerMessage.includes('burn')) {
      dataType = 'calories'
      metrics.push('calories')
    } else if (lowerMessage.includes('sleep') || lowerMessage.includes('rest')) {
      dataType = 'sleep'
      metrics.push('sleep')
    } else if (lowerMessage.includes('heart') || lowerMessage.includes('bpm')) {
      dataType = 'heartRate'
      metrics.push('heartRate')
    } else if (lowerMessage.includes('weight')) {
      dataType = 'weight'
      metrics.push('weight')
    } else if (lowerMessage.includes('active') || lowerMessage.includes('exercise')) {
      dataType = 'activity'
      metrics.push('activity')
    }
    
    // Detect time range
    if (lowerMessage.includes('yesterday')) {
      timeRange = 'yesterday'
    } else if (lowerMessage.includes('week') || lowerMessage.includes('7 day')) {
      timeRange = 'week'
    } else if (lowerMessage.includes('month') || lowerMessage.includes('30 day')) {
      timeRange = 'month'
    } else if (lowerMessage.includes('recent') || lowerMessage.includes('lately')) {
      timeRange = 'recent'
    }
    
    // Detect intent
    if (lowerMessage.includes('compare') || lowerMessage.includes('vs')) {
      intent = 'compare'
    } else if (lowerMessage.includes('trend') || lowerMessage.includes('pattern')) {
      intent = 'trend'
    } else if (lowerMessage.includes('goal') || lowerMessage.includes('target')) {
      intent = 'goal'
    }
    
    const { detectedLanguage, languageCode } = this.detectLanguage(userMessage)
    return {
      originalQuery: userMessage,
      translatedQuery: userMessage,
      dataType,
      timeRange,
      metrics,
      intent,
      confidence: 0.6,
      detectedLanguage,
      languageCode
    }
  }

  /**
   * Local fallback for translating responses
   */
  private translateResponseLocally(
    originalResponse: string,
    _userQuery: string
  ): TranslatedResponse {
    try {
      // Try to parse JSON and convert to natural language
      const parsed = JSON.parse(originalResponse)
      
      let response = ''
      
      // Add data summary
      if (parsed.dataSummary) {
        response += parsed.dataSummary + '\n\n'
      }
      
      // Add insights
      if (parsed.insights && Array.isArray(parsed.insights) && parsed.insights.length > 0) {
        response += 'Key insights:\n'
        parsed.insights.forEach((insight: string, _index: number) => {
          response += `• ${insight}\n`
        })
        response += '\n'
      }
      
      // Add trends
      if (parsed.trends && Array.isArray(parsed.trends) && parsed.trends.length > 0) {
        response += 'Trends I noticed:\n'
        parsed.trends.forEach((trend: string, _index: number) => {
          response += `• ${trend}\n`
        })
        response += '\n'
      }
      
      // Add recommendations
      if (parsed.recommendations && Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0) {
        response += 'Recommendations:\n'
        parsed.recommendations.forEach((rec: string, _index: number) => {
          response += `• ${rec}\n`
        })
      }
      
      return {
        originalResponse,
        translatedResponse: response.trim() || originalResponse
      }
    } catch (error) {
      // If not JSON, return original
      return {
        originalResponse,
        translatedResponse: originalResponse
      }
    }
  }

  /**
   * Check if the translation model is available
   */
  isAvailable(): boolean {
    return this.modelService.isAnyModelAvailable()
  }

  /**
   * Get the model status for debugging
   */
  getModelStatus() {
    return this.modelService.getModelStatus()
  }
} 