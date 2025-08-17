import type { TranslatedQuery } from './TranslationModel'
import { OpenAIService } from './OpenAIService'

// This interface is no longer needed in this file
// It's defined in HealthChatService.ts

export interface HealthAnalysis {
  dataSummary: string
  insights: string[]
  trends: string[]
  recommendations: string[]
  technicalDetails: any
}

export class ReasoningModel {
  private openAIService: OpenAIService

  constructor() {
    try {
      this.openAIService = new OpenAIService()
    } catch (error) {
      console.warn('OpenAI service not available for reasoning model:', error)
      this.openAIService = null as any
    }
  }

  /**
   * Process translated query and generate comprehensive health analysis
   * This is Model A in the new architecture - focused purely on reasoning
   */
  async processHealthQuery(translatedQuery: TranslatedQuery): Promise<HealthAnalysis> {
    try {
      // Extract relevant health data based on the translated query
      const relevantData = await this.extractHealthData(translatedQuery)
      
      // Generate comprehensive analysis using AI if available
      if (this.openAIService && this.openAIService.isConfigured()) {
        return await this.analyzeWithAI(translatedQuery, relevantData)
      }
      
      // Fallback to local analysis
      return this.analyzeLocally(translatedQuery, relevantData)
    } catch (error) {
      console.error('Error in reasoning model:', error)
      throw new Error('Failed to process health query')
    }
  }

  /**
   * Use AI to generate comprehensive health analysis
   */
  private async analyzeWithAI(
    translatedQuery: TranslatedQuery,
    relevantData: any
  ): Promise<HealthAnalysis> {
    const systemPrompt = `You are a health data reasoning model. Analyze health data and provide insights.

Query: "${translatedQuery.originalQuery}" -> "${translatedQuery.translatedQuery}"
Type: ${translatedQuery.dataType}, Time: ${translatedQuery.timeRange}, Intent: ${translatedQuery.intent}

Health Data: ${JSON.stringify(relevantData, null, 2)}

Respond with JSON:
{
  "dataSummary": "Data summary",
  "insights": ["Key insights"],
  "trends": ["Identified trends"],
  "recommendations": ["Actionable recommendations"],
  "technicalDetails": "Technical analysis for translation"
}`

    const response = await this.openAIService.sendMessage([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Please analyze this health data and provide comprehensive insights.' }
    ], 0.3) // Low temperature for consistent analysis

    try {
      const analysis = JSON.parse(response.content)
      const insights = analysis.insights || []
      return {
        dataSummary: analysis.dataSummary || 'Data analysis completed',
        insights,
        trends: analysis.trends || [],
        recommendations: analysis.recommendations || [],
        technicalDetails: analysis.technicalDetails || {}
      }
    } catch (parseError) {
      console.warn('Failed to parse AI analysis, falling back to local:', parseError)
      return this.analyzeLocally(translatedQuery, relevantData)
    }
  }

  /**
   * Local fallback for health data analysis
   */
  private analyzeLocally(
    translatedQuery: TranslatedQuery,
    relevantData: any
  ): HealthAnalysis {
    const { dataType, timeRange, intent } = translatedQuery
    
    // Generate basic insights based on data type and intent
    const insights = this.generateBasicInsights(dataType, timeRange, intent, relevantData)
    const trends = this.identifyBasicTrends(dataType, relevantData)
    const recommendations = this.generateBasicRecommendations(dataType, insights)
    
    return {
      dataSummary: `Analyzed ${dataType} data for ${timeRange} period`,
      insights,
      trends,
      recommendations,
      technicalDetails: {
        dataType,
        timeRange,
        intent,
        dataPoints: relevantData?.metrics?.length || 0,
        confidence: translatedQuery.confidence
      }
    }
  }

  /**
   * Extract relevant health data based on translated query
   */
  private async extractHealthData(translatedQuery: TranslatedQuery): Promise<any> {
    // This would integrate with the existing health data processing logic
    // For now, return a mock structure
    const relevantData = {
      metrics: [
        { type: translatedQuery.dataType, value: 100, unit: 'count', timestamp: new Date().toISOString() }
      ],
      summary: `Sample ${translatedQuery.dataType} data for ${translatedQuery.timeRange}`,
      trends: [`${translatedQuery.dataType} shows consistent patterns`],
      recommendations: [`Consider monitoring ${translatedQuery.dataType} regularly`]
    }
    return relevantData
  }

  /**
   * Generate basic insights based on query parameters
   */
  private generateBasicInsights(
    dataType: string,
    timeRange: string,
    intent: string,
    _relevantData: any
  ): string[] {
    const insights: string[] = []
    
    if (dataType === 'steps') {
      insights.push(`Step count analysis for ${timeRange} period`)
      insights.push('Daily step patterns show activity levels')
    } else if (dataType === 'sleep') {
      insights.push(`Sleep quality assessment for ${timeRange}`)
      insights.push('Sleep duration and quality patterns identified')
    } else if (dataType === 'heartRate') {
      insights.push(`Heart rate variability analysis for ${timeRange}`)
      insights.push('Resting and active heart rate patterns')
    }
    
    if (intent === 'trend') {
      insights.push('Long-term patterns and trends identified')
    } else if (intent === 'compare') {
      insights.push('Comparative analysis between different periods')
    }
    
    return insights
  }

  /**
   * Identify basic trends in the data
   */
  private identifyBasicTrends(dataType: string, _relevantData: any): string[] {
    const trends: string[] = []
    
    if (dataType === 'steps') {
      trends.push('Daily step count shows consistent patterns')
      trends.push('Weekend vs weekday activity differences')
    } else if (dataType === 'sleep') {
      trends.push('Sleep duration consistency over time')
      trends.push('Sleep quality patterns')
    }
    
    return trends
  }

  /**
   * Generate basic health recommendations
   */
  private generateBasicRecommendations(dataType: string, _insights: string[]): string[] {
    const recommendations: string[] = []
    
    if (dataType === 'steps') {
      recommendations.push('Aim for 10,000 steps daily for optimal health')
      recommendations.push('Consider increasing activity on low-step days')
    } else if (dataType === 'sleep') {
      recommendations.push('Maintain consistent sleep schedule')
      recommendations.push('Aim for 7-9 hours of quality sleep')
    } else if (dataType === 'heartRate') {
      recommendations.push('Monitor heart rate during exercise')
      recommendations.push('Track resting heart rate trends')
    }
    
    return recommendations
  }



  /**
   * Check if the reasoning model is available
   */
  isAvailable(): boolean {
    return this.openAIService !== null && this.openAIService.isConfigured()
  }
} 