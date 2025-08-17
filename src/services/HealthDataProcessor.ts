import type { HealthDataContext } from './HealthChatService'
import { OpenAIService } from './OpenAIService'
import { SampleDataService } from './SampleDataService'

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
  private openAIService: OpenAIService
  private sampleDataService: SampleDataService

  constructor() {
    try {
      this.openAIService = new OpenAIService()
    } catch (error) {
      console.warn('OpenAI service not available, falling back to local processing:', error)
      this.openAIService = null as any
    }
    this.sampleDataService = new SampleDataService()
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
    
    // Wait for sample data to be loaded
    if (!this.sampleDataService.isDataLoaded()) {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for data to load
    }
    
    // Get real data from CSV files
    const realData = this.extractRealHealthData(dataType, timeRange, metrics)
    
    return realData
  }

  /**
   * Extract real health data from the CSV datasets
   */
  private extractRealHealthData(dataType: string, timeRange: string, metrics: string[]): any {
    const data: any = {}
    
    // Get latest health data
    const latestData = this.sampleDataService.getLatestHealthData()
    if (!latestData) {
      console.warn('No sample data available, falling back to simulated data')
      return this.generateSimulatedHealthData(dataType, timeRange, metrics)
    }

    // Extract data based on data type and time range
    if (dataType === 'steps' || metrics.includes('steps')) {
      data.steps = this.extractStepsData(latestData, timeRange)
    }
    
    if (dataType === 'calories' || metrics.includes('calories')) {
      data.calories = this.extractCaloriesData(latestData, timeRange)
    }
    
    if (dataType === 'sleep' || metrics.includes('sleep')) {
      data.sleep = this.extractSleepData(latestData, timeRange)
    }
    
    if (dataType === 'heartRate' || metrics.includes('heartRate')) {
      data.heartRate = this.extractHeartRateData(latestData, timeRange)
    }
    
    if (dataType === 'weight' || metrics.includes('weight')) {
      data.weight = this.extractWeightData(latestData, timeRange)
    }
    
    if (dataType === 'activity' || metrics.includes('activity')) {
      data.activity = this.extractActivityData(latestData, timeRange)
    }

    return data
  }

  /**
   * Extract real steps data from the dataset
   */
  private extractStepsData(latestData: any, timeRange: string): any {
    if (timeRange === 'today') {
      return {
        current: latestData.steps || 0,
        goal: 10000,
        average: this.calculateAverageSteps(timeRange),
        trend: this.determineStepsTrend(),
        hourly: latestData.hourlySteps || []
      }
    } else if (timeRange === 'week') {
      const weeklySummary = this.sampleDataService.getWeeklySummary()
      if (weeklySummary) {
        return {
          daily: this.sampleDataService.getMetricData('steps'),
          total: weeklySummary.totalSteps,
          average: weeklySummary.averageSteps,
          current: latestData.steps || 0,
          trend: weeklySummary.trend || 'stable'
        }
      }
      // Fallback to historical data method
      const historicalData = this.sampleDataService.getHistoricalData('TotalSteps', 7)
      return {
        daily: historicalData,
        total: historicalData.reduce((sum, day) => sum + day.value, 0),
        average: Math.floor(historicalData.reduce((sum, day) => sum + day.value, 0) / historicalData.length),
        current: latestData.steps || 0
      }
    } else if (timeRange === 'month') {
      const monthlySummary = this.sampleDataService.getMonthlySummary()
      if (monthlySummary) {
        return {
          daily: this.sampleDataService.getMetricData('steps'),
          total: monthlySummary.totalSteps,
          average: monthlySummary.averageSteps,
          current: latestData.steps || 0,
          trend: monthlySummary.trend || 'stable'
        }
      }
    }
    
    return {
      current: latestData.steps || 0,
      goal: 10000,
      hourly: latestData.hourlySteps || []
    }
  }

  /**
   * Extract real calories data from the dataset
   */
  private extractCaloriesData(latestData: any, timeRange: string): any {
    if (timeRange === 'today') {
      return {
        current: latestData.calories || 0,
        goal: 500,
        average: this.calculateAverageCalories(timeRange),
        hourly: latestData.hourlyCalories || []
      }
    } else if (timeRange === 'week') {
      const weeklySummary = this.sampleDataService.getWeeklySummary()
      if (weeklySummary) {
        return {
          daily: this.sampleDataService.getMetricData('calories'),
          total: weeklySummary.totalCalories,
          average: weeklySummary.averageCalories,
          current: latestData.calories || 0
        }
      }
    } else if (timeRange === 'month') {
      const monthlySummary = this.sampleDataService.getMonthlySummary()
      if (monthlySummary) {
        return {
          daily: this.sampleDataService.getMetricData('calories'),
          total: monthlySummary.totalCalories,
          average: monthlySummary.averageCalories,
          current: latestData.calories || 0
        }
      }
    }
    
    return {
      current: latestData.calories || 0,
      goal: 500,
      hourly: latestData.hourlyCalories || []
    }
  }

  /**
   * Extract real sleep data from the dataset
   */
  private extractSleepData(latestData: any, timeRange: string): any {
    const hoursAsleep = (latestData.totalMinutesAsleep || 0) / 60
    const hoursInBed = (latestData.totalTimeInBed || 0) / 60
    
    if (timeRange === 'today') {
      return {
        hours: hoursAsleep,
        quality: this.assessSleepQuality(hoursAsleep),
        goal: 8,
        deepSleep: Math.floor(hoursAsleep * 0.25 * 60),
        timeInBed: hoursInBed,
        efficiency: hoursAsleep > 0 ? Math.round((hoursAsleep / hoursInBed) * 100) : 0
      }
    } else if (timeRange === 'week') {
      const sleepData = this.sampleDataService.getMetricData('sleep')
      if (sleepData.length > 0) {
        const avgHours = sleepData.reduce((sum, day) => sum + day.value, 0) / sleepData.length
        return {
          hours: hoursAsleep,
          quality: this.assessSleepQuality(hoursAsleep),
          goal: 8,
          timeInBed: hoursInBed,
          weeklyAverage: avgHours,
          weeklyData: sleepData
        }
      }
    }
    
    return {
      hours: hoursAsleep,
      quality: this.assessSleepQuality(hoursAsleep),
      goal: 8,
      timeInBed: hoursInBed
    }
  }

  /**
   * Extract real heart rate data from the dataset
   */
  private extractHeartRateData(latestData: any, timeRange: string): any {
    if (timeRange === 'recent') {
      return {
        current: latestData.heartRate || 75,
        resting: 72, // Could be calculated from historical data
        max: 120, // Could be calculated from historical data
        average: latestData.heartRate || 75
      }
    }
    
    return {
      current: latestData.heartRate || 75,
      resting: 72
    }
  }

  /**
   * Extract real weight data from the dataset
   */
  private extractWeightData(latestData: any, timeRange: string): any {
    if (timeRange === 'month') {
      return {
        current: latestData.weightKg || 0,
        trend: 'stable', // Could be calculated from historical data
        goal: (latestData.weightKg || 0) - 2,
        change: 0 // Could be calculated from historical data
      }
    }
    
    return {
      current: latestData.weightKg || 0,
      trend: 'stable',
      bmi: latestData.bmi || 0,
      fat: latestData.fat || 0
    }
  }

  /**
   * Extract real activity data from the dataset
   */
  private extractActivityData(latestData: any, timeRange: string): any {
    if (timeRange === 'today') {
      return {
        activeMinutes: latestData.activeMinutes || 0,
        goal: 60,
        intensity: this.assessActivityIntensity(latestData),
        type: 'mixed',
        veryActive: latestData.veryActiveMinutes || 0,
        fairlyActive: latestData.fairlyActiveMinutes || 0,
        lightlyActive: latestData.lightlyActiveMinutes || 0,
        sedentary: latestData.sedentaryMinutes || 0,
        totalDistance: latestData.totalDistance || 0
      }
    } else if (timeRange === 'week') {
      const weeklySummary = this.sampleDataService.getWeeklySummary()
      if (weeklySummary) {
        return {
          activeMinutes: latestData.activeMinutes || 0,
          goal: 60,
          intensity: this.assessActivityIntensity(latestData),
          weeklyTotal: weeklySummary.totalActiveMinutes,
          weeklyAverage: weeklySummary.averageActiveMinutes,
          daily: this.sampleDataService.getMetricData('activity')
        }
      }
    } else if (timeRange === 'month') {
      const monthlySummary = this.sampleDataService.getMonthlySummary()
      if (monthlySummary) {
        return {
          activeMinutes: latestData.activeMinutes || 0,
          goal: 60,
          intensity: this.assessActivityIntensity(latestData),
          monthlyTotal: monthlySummary.totalActiveMinutes,
          monthlyAverage: monthlySummary.averageActiveMinutes,
          daily: this.sampleDataService.getMetricData('activity')
        }
      }
    }
    
    return {
      activeMinutes: latestData.activeMinutes || 0,
      goal: 60,
      intensity: this.assessActivityIntensity(latestData)
    }
  }

  /**
   * Calculate average steps for a given time range
   */
  private calculateAverageSteps(timeRange: string): number {
    if (timeRange === 'week') {
      const historicalData = this.sampleDataService.getHistoricalData('TotalSteps', 7)
      if (historicalData.length > 0) {
        return Math.floor(historicalData.reduce((sum, day) => sum + day.value, 0) / historicalData.length)
      }
    }
    return 8000 // Default fallback
  }

  /**
   * Calculate average calories for a given time range
   */
  private calculateAverageCalories(timeRange: string): number {
    if (timeRange === 'week') {
      const historicalData = this.sampleDataService.getHistoricalData('Calories', 7)
      if (historicalData.length > 0) {
        return Math.floor(historicalData.reduce((sum, day) => sum + day.value, 0) / historicalData.length)
      }
    }
    return 400 // Default fallback
  }

  /**
   * Determine steps trend based on recent data
   */
  private determineStepsTrend(): string {
    const historicalData = this.sampleDataService.getHistoricalData('TotalSteps', 3)
    if (historicalData.length >= 2) {
      const recent = historicalData[0].value
      const previous = historicalData[1].value
      if (recent > previous) return 'increasing'
      if (recent < previous) return 'decreasing'
    }
    return 'stable'
  }

  /**
   * Assess sleep quality based on hours slept
   */
  private assessSleepQuality(hours: number): string {
    if (hours >= 8) return 'excellent'
    if (hours >= 7) return 'good'
    if (hours >= 6) return 'adequate'
    return 'poor'
  }

  /**
   * Assess activity intensity based on activity minutes
   */
  private assessActivityIntensity(data: any): string {
    const veryActive = data.veryActiveMinutes || 0
    const fairlyActive = data.fairlyActiveMinutes || 0
    
    if (veryActive >= 20) return 'high'
    if (fairlyActive >= 30 || veryActive >= 10) return 'moderate'
    return 'low'
  }

  /**
   * Generate simulated health data for development/testing
   * In production, this would read actual CSV files from sampledata
   */
  private generateSimulatedHealthData(dataType: string, timeRange: string, metrics: string[]): any {
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

    // Generate trends and recommendations based on real data
    if (rawData.steps) {
      this.analyzeStepsData(rawData.steps, trends, recommendations)
    }

    if (rawData.sleep) {
      this.analyzeSleepData(rawData.sleep, trends, recommendations)
    }

    if (rawData.calories) {
      this.analyzeCaloriesData(rawData.calories, trends, recommendations)
    }

    if (rawData.activity) {
      this.analyzeActivityData(rawData.activity, trends, recommendations)
    }

    if (rawData.weight) {
      this.analyzeWeightData(rawData.weight, trends, recommendations)
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
   * Analyze steps data and generate insights
   */
  private analyzeStepsData(stepsData: any, trends: string[], recommendations: string[]): void {
    if (stepsData.current !== undefined) {
      if (stepsData.current < stepsData.goal) {
        const percentage = Math.round((stepsData.current / stepsData.goal) * 100)
        trends.push(`You are at ${percentage}% of your daily step goal`)
        if (stepsData.current < 5000) {
          recommendations.push('Try taking a short walk during breaks to increase your step count')
        } else {
          recommendations.push('You\'re close to your goal! A few more short walks should do it')
        }
      } else {
        trends.push('Great job! You\'ve met your daily step goal')
        recommendations.push('Keep up the excellent work!')
      }

      if (stepsData.trend === 'improving') {
        trends.push('Your step count is trending upward - excellent progress!')
      } else if (stepsData.trend === 'declining') {
        trends.push('Your step count has been decreasing recently')
        recommendations.push('Consider setting smaller daily goals to build momentum')
      }

      if (stepsData.average && stepsData.current > stepsData.average * 1.2) {
        trends.push('You\'re performing above your average today')
      }
    }
  }

  /**
   * Analyze sleep data and generate insights
   */
  private analyzeSleepData(sleepData: any, trends: string[], recommendations: string[]): void {
    if (sleepData.hours !== undefined) {
      if (sleepData.hours < sleepData.goal) {
        const deficit = sleepData.goal - sleepData.hours
        trends.push(`You\'re ${deficit.toFixed(1)} hours short of your sleep goal`)
        recommendations.push('Try going to bed 30 minutes earlier to improve sleep duration')
      } else {
        trends.push('Excellent! You\'ve met your sleep goal')
      }

      if (sleepData.quality === 'poor') {
        trends.push('Your sleep quality could be improved')
        recommendations.push('Consider creating a relaxing bedtime routine')
      }

      if (sleepData.efficiency && sleepData.efficiency < 85) {
        trends.push('Your sleep efficiency is below optimal levels')
        recommendations.push('Try to minimize time spent awake in bed')
      }

      if (sleepData.weeklyAverage && sleepData.hours > sleepData.weeklyAverage * 1.1) {
        trends.push('You\'re sleeping better than your weekly average today')
      }
    }
  }

  /**
   * Analyze calories data and generate insights
   */
  private analyzeCaloriesData(caloriesData: any, trends: string[], recommendations: string[]): void {
    if (caloriesData.current !== undefined) {
      if (caloriesData.current < caloriesData.goal) {
        const percentage = Math.round((caloriesData.current / caloriesData.goal) * 100)
        trends.push(`You\'ve burned ${percentage}% of your daily calorie goal`)
        recommendations.push('Consider adding some moderate exercise to reach your goal')
      } else {
        trends.push('Great job! You\'ve exceeded your daily calorie burn goal')
      }

      if (caloriesData.average && caloriesData.current > caloriesData.average * 1.2) {
        trends.push('You\'re burning more calories than your average today')
      }
    }
  }

  /**
   * Analyze activity data and generate insights
   */
  private analyzeActivityData(activityData: any, trends: string[], recommendations: string[]): void {
    if (activityData.activeMinutes !== undefined) {
      if (activityData.activeMinutes < activityData.goal) {
        const remaining = activityData.goal - activityData.activeMinutes
        trends.push(`You need ${remaining} more active minutes to reach your goal`)
        recommendations.push('Try taking a brisk walk or doing some light exercises')
      } else {
        trends.push('Excellent! You\'ve met your daily active minutes goal')
      }

      if (activityData.intensity === 'low') {
        trends.push('Your activity intensity is currently low')
        recommendations.push('Consider adding some moderate to vigorous activities')
      } else if (activityData.intensity === 'high') {
        trends.push('Great job maintaining high activity intensity!')
      }

      if (activityData.weeklyTotal && activityData.activeMinutes > activityData.weeklyAverage * 1.2) {
        trends.push('You\'re more active today than your weekly average')
      }
    }
  }

  /**
   * Analyze weight data and generate insights
   */
  private analyzeWeightData(weightData: any, trends: string[], recommendations: string[]): void {
    if (weightData.current !== undefined) {
      if (weightData.trend === 'improving') {
        trends.push('Your weight trend is positive - keep up the good work!')
      } else if (weightData.trend === 'declining') {
        trends.push('Your weight has been increasing recently')
        recommendations.push('Consider reviewing your diet and exercise routine')
      }

      if (weightData.bmi && weightData.bmi > 25) {
        trends.push('Your BMI indicates you may be overweight')
        recommendations.push('Focus on balanced nutrition and regular exercise')
      } else if (weightData.bmi && weightData.bmi < 18.5) {
        trends.push('Your BMI indicates you may be underweight')
        recommendations.push('Consider consulting with a nutritionist')
      }
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