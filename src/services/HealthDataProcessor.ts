import type { HealthDataContext } from './HealthChatService'
import { OpenAIService } from './OpenAIService'

export interface HealthMetric {
  type: 'steps' | 'calories' | 'sleep' | 'heartRate' | 'weight' | 'activity'
  value: number
  unit: string
  timestamp: string
  date?: string
}

export interface ProcessedHealthData {
  metrics: HealthMetric[]
  summary: string
  trends: string[]
  recommendations: string[]
}

export class HealthDataProcessor {
  private healthDataCache: Map<string, any> = new Map()
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
   * Process user query and extract relevant health data
   * This is Model A in the two-model pipeline
   */
  async processQuery(userQuery: string): Promise<HealthDataContext> {
    try {
      let queryAnalysis: any
      
      // Use OpenAI for query analysis if available
      if (this.openAIService && this.openAIService.isConfigured()) {
        queryAnalysis = await this.analyzeQueryWithAI(userQuery)
      } else {
        queryAnalysis = this.analyzeQuery(userQuery)
      }
      
      // Extract relevant health data based on the query
      const relevantData = await this.extractHealthData(queryAnalysis)
      
      // Process and structure the data
      const processedData = this.processHealthData(relevantData, queryAnalysis)
      
      return {
        query: userQuery,
        relevantData: processedData,
        dataType: queryAnalysis.dataType,
        timeRange: queryAnalysis.timeRange
      }
    } catch (error) {
      console.error('Error processing health data query:', error)
      throw new Error('Failed to process health data query')
    }
  }

  /**
   * Analyze user query using OpenAI for better understanding
   */
  private async analyzeQueryWithAI(userQuery: string): Promise<{
    dataType: string
    timeRange: string
    metrics: string[]
    intent: string
  }> {
    try {
      const systemPrompt = `You are a health data analysis expert. Analyze the user's query and extract the following information in JSON format:
      - dataType: The primary health metric being asked about (steps, calories, sleep, heartRate, weight, activity, or general)
      - timeRange: The time period being asked about (today, yesterday, week, month, recent, or general)
      - metrics: Array of specific health metrics mentioned
      - intent: The user's intent (query, compare, trend, goal, or general)
      
      Respond only with valid JSON. Example:
      {"dataType": "steps", "timeRange": "today", "metrics": ["steps"], "intent": "query"}`

      const response = await this.openAIService.sendMessage([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userQuery }
      ], 0.1) // Low temperature for consistent parsing

      try {
        const analysis = JSON.parse(response.content)
        return {
          dataType: analysis.dataType || 'general',
          timeRange: analysis.timeRange || 'today',
          metrics: analysis.metrics || [],
          intent: analysis.intent || 'query'
        }
      } catch (parseError) {
        console.warn('Failed to parse AI response, falling back to local analysis:', parseError)
        return this.analyzeQuery(userQuery)
      }
    } catch (error) {
      console.warn('AI analysis failed, falling back to local analysis:', error)
      return this.analyzeQuery(userQuery)
    }
  }

  /**
   * Analyze user query to determine what health data is needed (fallback method)
   */
  private analyzeQuery(query: string): {
    dataType: string
    timeRange: string
    metrics: string[]
    intent: string
  } {
    const lowerQuery = query.toLowerCase()
    
    // Determine data type
    let dataType = 'general'
    if (lowerQuery.includes('step') || lowerQuery.includes('walk')) dataType = 'steps'
    else if (lowerQuery.includes('calori') || lowerQuery.includes('burn')) dataType = 'calories'
    else if (lowerQuery.includes('sleep') || lowerQuery.includes('rest')) dataType = 'sleep'
    else if (lowerQuery.includes('heart') || lowerQuery.includes('bpm')) dataType = 'heartRate'
    else if (lowerQuery.includes('weight') || lowerQuery.includes('kg') || lowerQuery.includes('lb')) dataType = 'weight'
    else if (lowerQuery.includes('active') || lowerQuery.includes('exercise')) dataType = 'activity'

    // Determine time range
    let timeRange = 'today'
    if (lowerQuery.includes('week') || lowerQuery.includes('7 day')) timeRange = 'week'
    else if (lowerQuery.includes('month') || lowerQuery.includes('30 day')) timeRange = 'month'
    else if (lowerQuery.includes('yesterday')) timeRange = 'yesterday'
    else if (lowerQuery.includes('hour') || lowerQuery.includes('recent')) timeRange = 'recent'

    // Extract metrics of interest
    const metrics: string[] = []
    if (dataType !== 'general') {
      metrics.push(dataType)
    } else {
      // For general queries, include common metrics
      metrics.push('steps', 'calories', 'sleep', 'heartRate')
    }

    // Determine user intent
    let intent = 'query'
    if (lowerQuery.includes('how') || lowerQuery.includes('what')) intent = 'query'
    else if (lowerQuery.includes('compare') || lowerQuery.includes('vs')) intent = 'compare'
    else if (lowerQuery.includes('trend') || lowerQuery.includes('progress')) intent = 'trend'
    else if (lowerQuery.includes('goal') || lowerQuery.includes('target')) intent = 'goal'

    return { dataType, timeRange, metrics, intent }
  }

  /**
   * Extract health data from sampledata directory based on query analysis
   */
  private async extractHealthData(queryAnalysis: any): Promise<any> {
    const { dataType, timeRange, metrics } = queryAnalysis
    
    // For now, we'll use simulated data since we can't directly access files in the browser
    // In a real implementation, this would read from the sampledata CSV files
    const simulatedData = this.generateSimulatedHealthData(dataType, timeRange, metrics)
    
    return simulatedData
  }

  /**
   * Generate simulated health data for development/testing
   * In production, this would read actual CSV files from sampledata
   */
  private generateSimulatedHealthData(dataType: string, timeRange: string, metrics: string[]): any {
    const now = new Date()
    const data: any = {}

    // Generate data based on data type and time range
    if (dataType === 'steps' || metrics.includes('steps')) {
      data.steps = this.generateStepsData(timeRange)
    }
    
    if (dataType === 'calories' || metrics.includes('calories')) {
      data.calories = this.generateCaloriesData(timeRange)
    }
    
    if (dataType === 'sleep' || metrics.includes('sleep')) {
      data.sleep = this.generateSleepData(timeRange)
    }
    
    if (dataType === 'heartRate' || metrics.includes('heartRate')) {
      data.heartRate = this.generateHeartRateData(timeRange)
    }
    
    if (dataType === 'weight' || metrics.includes('weight')) {
      data.weight = this.generateWeightData(timeRange)
    }
    
    if (dataType === 'activity' || metrics.includes('activity')) {
      data.activity = this.generateActivityData(timeRange)
    }

    return data
  }

  /**
   * Generate simulated steps data
   */
  private generateStepsData(timeRange: string): any {
    const baseSteps = 8000
    const variance = 2000
    
    if (timeRange === 'today') {
      return {
        current: Math.floor(baseSteps + (Math.random() - 0.5) * variance),
        goal: 10000,
        average: baseSteps,
        trend: 'increasing'
      }
    } else if (timeRange === 'week') {
      const weekData = []
      for (let i = 6; i >= 0; i--) {
        weekData.push({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString(),
          steps: Math.floor(baseSteps + (Math.random() - 0.5) * variance)
        })
      }
      return {
        daily: weekData,
        total: weekData.reduce((sum, day) => sum + day.steps, 0),
        average: Math.floor(weekData.reduce((sum, day) => sum + day.steps, 0) / 7)
      }
    }
    
    return { current: baseSteps, goal: 10000 }
  }

  /**
   * Generate simulated calories data
   */
  private generateCaloriesData(timeRange: string): any {
    const baseCalories = 400
    const variance = 100
    
    if (timeRange === 'today') {
      return {
        current: Math.floor(baseCalories + (Math.random() - 0.5) * variance),
        goal: 500,
        average: baseCalories
      }
    }
    
    return { current: baseCalories, goal: 500 }
  }

  /**
   * Generate simulated sleep data
   */
  private generateSleepData(timeRange: string): any {
    const baseHours = 7.5
    const variance = 1
    
    if (timeRange === 'today') {
      return {
        hours: baseHours + (Math.random() - 0.5) * variance,
        quality: 'good',
        goal: 8,
        deepSleep: Math.floor((baseHours + (Math.random() - 0.5) * variance) * 0.25 * 60)
      }
    }
    
    return { hours: baseHours, quality: 'good', goal: 8 }
  }

  /**
   * Generate simulated heart rate data
   */
  private generateHeartRateData(timeRange: string): any {
    const baseBPM = 72
    const variance = 10
    
    if (timeRange === 'recent') {
      return {
        current: Math.floor(baseBPM + (Math.random() - 0.5) * variance),
        resting: baseBPM,
        max: baseBPM + 50,
        average: baseBPM
      }
    }
    
    return { current: baseBPM, resting: baseBPM }
  }

  /**
   * Generate simulated weight data
   */
  private generateWeightData(timeRange: string): any {
    const baseWeight = 70 // kg
    const variance = 2
    
    if (timeRange === 'month') {
      return {
        current: baseWeight + (Math.random() - 0.5) * variance,
        trend: 'stable',
        goal: baseWeight - 2,
        change: (Math.random() - 0.5) * 1
      }
    }
    
    return { current: baseWeight, trend: 'stable' }
  }

  /**
   * Generate simulated activity data
   */
  private generateActivityData(timeRange: string): any {
    const baseMinutes = 45
    const variance = 15
    
    if (timeRange === 'today') {
      return {
        activeMinutes: Math.floor(baseMinutes + (Math.random() - 0.5) * variance),
        goal: 60,
        intensity: 'moderate',
        type: 'mixed'
      }
    }
    
    return { activeMinutes: baseMinutes, goal: 60 }
  }

  /**
   * Process raw health data into structured format
   */
  private processHealthData(rawData: any, queryAnalysis: any): ProcessedHealthData {
    const metrics: HealthMetric[] = []
    const trends: string[] = []
    const recommendations: string[] = []

    // Convert raw data to metrics
    Object.entries(rawData).forEach(([key, value]: [string, any]) => {
      if (value && typeof value === 'object') {
        if (value.current !== undefined) {
          metrics.push({
            type: key as any,
            value: value.current,
            unit: this.getUnitForMetric(key),
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString()
          })
        }
      }
    })

    // Generate trends and recommendations based on data
    if (rawData.steps) {
      if (rawData.steps.current < rawData.steps.goal) {
        trends.push('You are below your daily step goal')
        recommendations.push('Try taking a short walk during breaks')
      } else {
        trends.push('Great job! You\'ve met your step goal')
        recommendations.push('Keep up the good work!')
      }
    }

    if (rawData.sleep) {
      if (rawData.sleep.hours < rawData.sleep.goal) {
        trends.push('You\'re getting less sleep than recommended')
        recommendations.push('Try going to bed 30 minutes earlier')
      }
    }

    const summary = this.generateDataSummary(rawData, queryAnalysis)

    return {
      metrics,
      summary,
      trends,
      recommendations
    }
  }

  /**
   * Get appropriate unit for a metric
   */
  private getUnitForMetric(metric: string): string {
    switch (metric) {
      case 'steps': return 'steps'
      case 'calories': return 'cal'
      case 'sleep': return 'hours'
      case 'heartRate': return 'BPM'
      case 'weight': return 'kg'
      case 'activity': return 'minutes'
      default: return ''
    }
  }

  /**
   * Generate a summary of the health data
   */
  private generateDataSummary(data: any, queryAnalysis: any): string {
    const { dataType, timeRange } = queryAnalysis
    
    if (dataType === 'steps') {
      return `Your step count for ${timeRange} is ${data.steps?.current || 0} steps.`
    } else if (dataType === 'calories') {
      return `You've burned ${data.calories?.current || 0} calories ${timeRange}.`
    } else if (dataType === 'sleep') {
      return `You slept ${data.sleep?.hours?.toFixed(1) || 0} hours ${timeRange}.`
    } else if (dataType === 'heartRate') {
      return `Your current heart rate is ${data.heartRate?.current || 0} BPM.`
    }
    
    return `Here's your health data summary for ${timeRange}.`
  }
} 