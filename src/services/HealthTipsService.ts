import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore'
import { db } from './firebase'
import { OpenAIService } from './OpenAIService'

export interface HealthTip {
  id: string
  title: string
  description: string
  category: 'exercise' | 'nutrition' | 'sleep' | 'stress' | 'hydration' | 'general'
  priority: 'high' | 'medium' | 'low'
  basedOn: string[]
  timestamp: Date
}

export interface ChatAnalysis {
  topics: string[]
  concerns: string[]
  questions: string[]
  healthMentions: string[]
  timeRange: string
  messageCount: number
}

export class HealthTipsService {
  private openAIService: OpenAIService
  private currentUserId: string
  private cache: Map<string, { tips: HealthTip[], timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private pendingRequests: Map<string, Promise<HealthTip[]>> = new Map()

  constructor(userId: string = 'default-user') {
    this.currentUserId = userId
    try {
      this.openAIService = new OpenAIService()
    } catch (error) {
      console.warn('HealthTipsService: OpenAI service not available, will use default tips:', error)
      this.openAIService = null as any
    }
  }

  /**
   * Generate health tips based on recent chat history
   */
  async generateHealthTips(sessionId?: string): Promise<HealthTip[]> {
    const cacheKey = sessionId || 'default'
    
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      console.log('HealthTipsService: Returning cached tips')
      return cached.tips
    }
    
    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      console.log('HealthTipsService: Request already pending, returning existing promise')
      return this.pendingRequests.get(cacheKey)!
    }
    
    // Create new request
    const requestPromise = this.generateTipsInternal(sessionId)
    this.pendingRequests.set(cacheKey, requestPromise)
    
    try {
      const tips = await requestPromise
      this.cache.set(cacheKey, { tips, timestamp: Date.now() })
      return tips
    } finally {
      this.pendingRequests.delete(cacheKey)
    }
  }

  /**
   * Internal method to generate tips
   */
  private async generateTipsInternal(sessionId?: string): Promise<HealthTip[]> {
    try {
      console.log('HealthTipsService: Generating health tips...')
      
      // Run operations in parallel for better performance
      const [chatHistory, healthContext] = await Promise.all([
        this.getRecentChatHistory(sessionId),
        this.getHealthDataContext()
      ])
      
      console.log('HealthTipsService: Retrieved chat history:', chatHistory.length, 'messages')
      
      // Analyze chat content
      const analysis = await this.analyzeChatHistory(chatHistory)
      console.log('HealthTipsService: Chat analysis:', analysis)
      
      // Generate tips using LLM (with fallback)
      const tips = await this.generateTipsWithLLM(analysis, healthContext)
      console.log('HealthTipsService: Generated tips:', tips.length)
      
      return tips
    } catch (error) {
      console.error('HealthTipsService: Failed to generate health tips:', error)
      // Return default tips immediately on error
      return this.getDefaultTips()
    }
  }

  /**
   * Clear cache for a specific session or all sessions
   */
  clearCache(sessionId?: string): void {
    if (sessionId) {
      this.cache.delete(sessionId)
    } else {
      this.cache.clear()
    }
  }

  /**
   * Get immediate fallback tips for instant display
   */
  getImmediateTips(): HealthTip[] {
    return [
      {
        id: 'immediate_hydration',
        title: 'Stay Hydrated',
        description: 'Drink at least 8 glasses of water throughout the day to maintain proper hydration.',
        category: 'hydration',
        priority: 'high',
        basedOn: ['General health recommendation'],
        timestamp: new Date()
      },
      {
        id: 'immediate_sleep',
        title: 'Get Quality Sleep',
        description: 'Aim for 7-9 hours of sleep per night for optimal health and recovery.',
        category: 'sleep',
        priority: 'high',
        basedOn: ['General health recommendation'],
        timestamp: new Date()
      },
      {
        id: 'immediate_breaks',
        title: 'Take Regular Breaks',
        description: 'Take short breaks every hour to stretch and rest your eyes.',
        category: 'general',
        priority: 'medium',
        basedOn: ['General health recommendation'],
        timestamp: new Date()
      }
    ]
  }

  /**
   * Get recent chat history from Firebase
   */
  private async getRecentChatHistory(sessionId?: string): Promise<any[]> {
    try {
      let q
      
      if (sessionId) {
        // Get specific session
        q = query(
          collection(db, 'chathistory'),
          where('userId', '==', this.currentUserId),
          where('sessionId', '==', sessionId)
        )
      } else {
        // Get most recent session
        q = query(
          collection(db, 'chathistory'),
          where('userId', '==', this.currentUserId),
          orderBy('updatedAt', 'desc'),
          limit(1)
        )
      }

      const querySnapshot = await getDocs(q)
      const documents = querySnapshot.docs.map(doc => doc.data())
      
      // Extract messages from the most recent document
      if (documents.length > 0) {
        const latestDoc = documents[0]
        return latestDoc.history || []
      }
      
      return []
    } catch (error) {
      console.error('HealthTipsService: Failed to get chat history:', error)
      return []
    }
  }

  /**
   * Analyze chat history to extract health-related topics
   */
  private async analyzeChatHistory(chatHistory: any[]): Promise<ChatAnalysis> {
    const userMessages = chatHistory
      .filter(msg => msg.messageType === 'user')
      .map(msg => msg.messageText)
      .join(' ')

    const aiMessages = chatHistory
      .filter(msg => msg.messageType === 'ai')
      .map(msg => msg.messageText)
      .join(' ')

    // Extract health-related keywords
    const healthKeywords = [
      'headache', 'pain', 'tired', 'sleep', 'exercise', 'workout', 'diet', 'food',
      'water', 'stress', 'anxiety', 'energy', 'fatigue', 'mood', 'depression',
      'blood pressure', 'heart', 'breathing', 'muscle', 'joint', 'back', 'neck',
      'stomach', 'digestion', 'weight', 'fitness', 'cardio', 'strength', 'flexibility'
    ]

    const mentionedTopics = healthKeywords.filter(keyword => 
      userMessages.toLowerCase().includes(keyword) || 
      aiMessages.toLowerCase().includes(keyword)
    )

    return {
      topics: mentionedTopics,
      concerns: this.extractConcerns(userMessages),
      questions: this.extractQuestions(userMessages),
      healthMentions: mentionedTopics,
      timeRange: this.calculateTimeRange(chatHistory),
      messageCount: chatHistory.length
    }
  }

  /**
   * Extract health concerns from user messages
   */
  private extractConcerns(messages: string): string[] {
    const concernPatterns = [
      /(?:i have|i'm having|i feel|i'm feeling|i'm experiencing|i'm dealing with)\s+([^.!?]+)/gi,
      /(?:my|the)\s+(head|back|neck|stomach|chest|legs?|arms?|hands?|feet?)\s+(hurts?|aches?|pain)/gi,
      /(?:i can't|i cannot|i'm unable to|i'm having trouble)\s+([^.!?]+)/gi
    ]

    const concerns: string[] = []
    
    concernPatterns.forEach(pattern => {
      const matches = messages.match(pattern)
      if (matches) {
        concerns.push(...matches.map(match => match.trim()))
      }
    })

    return concerns
  }

  /**
   * Extract questions from user messages
   */
  private extractQuestions(messages: string): string[] {
    const questionPattern = /\?[^?]*\?/g
    const questions = messages.match(questionPattern) || []
    return questions.map(q => q.trim())
  }

  /**
   * Calculate time range of chat history
   */
  private calculateTimeRange(chatHistory: any[]): string {
    if (chatHistory.length === 0) return 'No data'
    
    const timestamps = chatHistory.map(msg => msg.timestamp?.toDate?.() || new Date())
    const oldest = new Date(Math.min(...timestamps.map(t => t.getTime())))
    const newest = new Date(Math.max(...timestamps.map(t => t.getTime())))
    
    const diffHours = (newest.getTime() - oldest.getTime()) / (1000 * 60 * 60)
    
    if (diffHours < 1) return 'Last hour'
    if (diffHours < 24) return 'Last day'
    if (diffHours < 168) return 'Last week'
    return 'Last month'
  }

  /**
   * Get health data context for better recommendations
   */
  private async getHealthDataContext(): Promise<any> {
    // This would integrate with your existing health data services
    // For now, return a mock context
    return {
      hasRecentExercise: true,
      averageSteps: 8500,
      sleepQuality: 'good',
      hydrationLevel: 'moderate',
      stressLevel: 'medium'
    }
  }

  /**
   * Generate tips using LLM
   */
  private async generateTipsWithLLM(analysis: ChatAnalysis, healthContext: any): Promise<HealthTip[]> {
    try {
      if (!this.openAIService || !this.openAIService.isConfigured()) {
        console.log('HealthTipsService: OpenAI not configured, using default tips')
        return this.getDefaultTips(analysis)
      }

      // Skip LLM if no meaningful chat history
      if (analysis.messageCount < 2 || analysis.topics.length === 0) {
        console.log('HealthTipsService: Insufficient chat data, using contextual default tips')
        return this.getDefaultTips(analysis)
      }

      const prompt = this.buildPrompt(analysis, healthContext)
      
      // Set a timeout for LLM requests
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('LLM request timeout')), 10000) // 10 second timeout
      })
      
      const llmPromise = this.openAIService.sendMessage([
        {
          role: 'system',
          content: 'You are a health advisor. Provide personalized health tips based on chat history and health data. Always respond with valid JSON format. Keep responses concise.'
        },
        {
          role: 'user',
          content: prompt
        }
      ])
      
      const response = await Promise.race([llmPromise, timeoutPromise])
      return this.parseLLMResponse(response.content, analysis)
    } catch (error) {
      console.error('HealthTipsService: LLM generation failed:', error)
      return this.getDefaultTips(analysis)
    }
  }

  /**
   * Build prompt for LLM
   */
  private buildPrompt(analysis: ChatAnalysis, healthContext: any): string {
    return `
You are a health advisor. Based on the following chat history analysis and health data, provide 3-5 personalized health tips.

CHAT ANALYSIS:
- Topics discussed: ${analysis.topics.join(', ')}
- Health concerns mentioned: ${analysis.concerns.join(', ')}
- Questions asked: ${analysis.questions.join(', ')}
- Time range: ${analysis.timeRange}
- Message count: ${analysis.messageCount}

HEALTH DATA CONTEXT:
- Recent exercise: ${healthContext.hasRecentExercise ? 'Yes' : 'No'}
- Average steps: ${healthContext.averageSteps}
- Sleep quality: ${healthContext.sleepQuality}
- Hydration level: ${healthContext.hydrationLevel}
- Stress level: ${healthContext.stressLevel}

Please provide tips in this JSON format:
[
  {
    "title": "Tip title",
    "description": "Detailed description of the tip",
    "category": "exercise|nutrition|sleep|stress|hydration|general",
    "priority": "high|medium|low",
    "basedOn": ["reason1", "reason2"]
  }
]

Focus on actionable, specific advice based on what the user discussed. If they mentioned headaches, suggest hydration or stress relief. If they're already exercising, focus on other areas like sleep or nutrition.
`
  }

  /**
   * Parse LLM response into HealthTip objects
   */
  private parseLLMResponse(response: string, analysis?: ChatAnalysis): HealthTip[] {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const tips = JSON.parse(jsonMatch[0])
      
      return tips.map((tip: any, index: number) => ({
        id: `tip_${Date.now()}_${index}`,
        title: tip.title || 'Health Tip',
        description: tip.description || 'General health advice',
        category: tip.category || 'general',
        priority: tip.priority || 'medium',
        basedOn: tip.basedOn || ['Chat analysis'],
        timestamp: new Date()
      }))
    } catch (error) {
      console.error('HealthTipsService: Failed to parse LLM response:', error)
      return this.getDefaultTips(analysis)
    }
  }

  /**
   * Get default tips when LLM fails
   */
  private getDefaultTips(analysis?: ChatAnalysis): HealthTip[] {
    const tips: HealthTip[] = []
    
    // Add contextual tips based on analysis
    if (analysis) {
      if (analysis.topics.includes('headache') || analysis.topics.includes('pain')) {
        tips.push({
          id: 'default_headache',
          title: 'Headache Relief',
          description: 'Try drinking more water, taking a short walk, or practicing deep breathing exercises to help relieve headaches.',
          category: 'general',
          priority: 'high',
          basedOn: ['Chat analysis - headache mentioned'],
          timestamp: new Date()
        })
      }
      
      if (analysis.topics.includes('tired') || analysis.topics.includes('fatigue')) {
        tips.push({
          id: 'default_energy',
          title: 'Boost Your Energy',
          description: 'Get some fresh air, take a 10-minute walk, or try a healthy snack to naturally boost your energy levels.',
          category: 'general',
          priority: 'high',
          basedOn: ['Chat analysis - fatigue mentioned'],
          timestamp: new Date()
        })
      }
      
      if (analysis.topics.includes('stress') || analysis.topics.includes('anxiety')) {
        tips.push({
          id: 'default_stress',
          title: 'Manage Stress',
          description: 'Try 5 minutes of deep breathing, meditation, or gentle stretching to help reduce stress levels.',
          category: 'stress',
          priority: 'high',
          basedOn: ['Chat analysis - stress mentioned'],
          timestamp: new Date()
        })
      }
    }
    
    // Add general tips if we don't have enough contextual ones
    if (tips.length < 3) {
      tips.push({
        id: 'default_hydration',
        title: 'Stay Hydrated',
        description: 'Drink at least 8 glasses of water throughout the day to maintain proper hydration.',
        category: 'hydration',
        priority: 'high',
        basedOn: ['General health recommendation'],
        timestamp: new Date()
      })
    }
    
    if (tips.length < 3) {
      tips.push({
        id: 'default_sleep',
        title: 'Get Quality Sleep',
        description: 'Aim for 7-9 hours of sleep per night for optimal health and recovery.',
        category: 'sleep',
        priority: 'high',
        basedOn: ['General health recommendation'],
        timestamp: new Date()
      })
    }
    
    if (tips.length < 3) {
      tips.push({
        id: 'default_breaks',
        title: 'Take Regular Breaks',
        description: 'Take short breaks every hour to stretch and rest your eyes, especially if you work at a computer.',
        category: 'general',
        priority: 'medium',
        basedOn: ['General health recommendation'],
        timestamp: new Date()
      })
    }
    
    return tips.slice(0, 5) // Limit to 5 tips max
  }
}
