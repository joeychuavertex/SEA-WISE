import type { HealthData } from './GoogleFitService'

export interface SampleDataMetrics {
  dailyActivity: any[]
  sleepData: any[]
  weightData: any[]
  hourlySteps: any[]
  hourlyCalories: any[]
  hourlyIntensities: any[]
}

export class SampleDataService {
  private sampleData: SampleDataMetrics | null = null
  private currentUserId: string | null = null

  constructor() {
    this.loadSampleData()
  }

  /**
   * Load sample data from CSV files
   */
  private async loadSampleData(): Promise<void> {
    try {
      // Load daily activity data
      const dailyActivityResponse = await fetch('/sampledata/dailyActivity_merged.csv')
      const dailyActivityText = await dailyActivityResponse.text()
      const dailyActivity = this.parseCSV(dailyActivityText)

      // Load sleep data
      const sleepResponse = await fetch('/sampledata/sleepDay_merged.csv')
      const sleepText = await sleepResponse.text()
      const sleepData = this.parseCSV(sleepText)

      // Load weight data
      const weightResponse = await fetch('/sampledata/weightLogInfo_merged.csv')
      const weightText = await weightResponse.text()
      const weightData = this.parseCSV(weightText)

      // Load hourly data
      const hourlyStepsResponse = await fetch('/sampledata/hourlySteps_merged.csv')
      const hourlyStepsText = await hourlyStepsResponse.text()
      const hourlySteps = this.parseCSV(hourlyStepsText)

      const hourlyCaloriesResponse = await fetch('/sampledata/hourlyCalories_merged.csv')
      const hourlyCaloriesText = await hourlyCaloriesResponse.text()
      const hourlyCalories = this.parseCSV(hourlyCaloriesText)

      const hourlyIntensitiesResponse = await fetch('/sampledata/hourlyIntensities_merged.csv')
      const hourlyIntensitiesText = await hourlyIntensitiesResponse.text()
      const hourlyIntensities = this.parseCSV(hourlyIntensitiesText)

      this.sampleData = {
        dailyActivity,
        sleepData,
        weightData,
        hourlySteps,
        hourlyCalories,
        hourlyIntensities
      }

      // Set default user ID (first user in the dataset)
      if (dailyActivity.length > 1) {
        this.currentUserId = dailyActivity[1].Id
      }
    } catch (error) {
      console.error('Failed to load sample data:', error)
      this.sampleData = null
    }
  }

  /**
   * Parse CSV text into array of objects
   */
  private parseCSV(csvText: string): any[] {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) return []

    const headers = lines[0].split(',')
    const data = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      const row: any = {}
      
      headers.forEach((header, index) => {
        let value: string | number = values[index] || ''
        // Try to parse numbers
        if (!isNaN(Number(value)) && value !== '') {
          value = Number(value)
        }
        row[header] = value
      })
      
      data.push(row)
    }

    return data
  }

  /**
   * Get available user IDs from the sample data
   */
  getAvailableUsers(): string[] {
    if (!this.sampleData) return []
    
    const userIds = new Set<string>()
    this.sampleData.dailyActivity.forEach(row => {
      if (row.Id) userIds.add(row.Id)
    })
    
    return Array.from(userIds)
  }

  /**
   * Set current user ID
   */
  setCurrentUser(userId: string): void {
    this.currentUserId = userId
  }

  /**
   * Get current user ID
   */
  getCurrentUser(): string | null {
    return this.currentUserId
  }

  /**
   * Get latest health data for current user
   */
  getLatestHealthData(): HealthData | null {
    if (!this.sampleData || !this.currentUserId) return null

    try {
      // Get latest daily activity data
      const userActivity = this.sampleData.dailyActivity
        .filter(row => row.Id === this.currentUserId)
        .sort((a, b) => new Date(b.ActivityDate).getTime() - new Date(a.ActivityDate).getTime())

      if (userActivity.length === 0) return null

      const latestActivity = userActivity[0]

      // Get latest sleep data
      const userSleep = this.sampleData.sleepData
        .filter(row => row.Id === this.currentUserId)
        .sort((a, b) => new Date(b.SleepDay).getTime() - new Date(a.SleepDay).getTime())

      // Get latest weight data
      const userWeight = this.sampleData.weightData
        .filter(row => row.Id === this.currentUserId)
        .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime())

      // Get hourly data for the latest activity date
      const latestDate = latestActivity.ActivityDate
      const userHourlySteps = this.sampleData.hourlySteps
        .filter(row => row.Id === this.currentUserId && row.ActivityHour.includes(latestDate.split(' ')[0]))

      const userHourlyCalories = this.sampleData.hourlyCalories
        .filter(row => row.Id === this.currentUserId && row.ActivityHour.includes(latestDate.split(' ')[0]))

      const userHourlyIntensities = this.sampleData.hourlyIntensities
        .filter(row => row.Id === this.currentUserId && row.ActivityHour.includes(latestDate.split(' ')[0]))

      // Format hourly data
      const hourlySteps = userHourlySteps.map(row => ({
        hour: new Date(row.ActivityHour).getHours().toString().padStart(2, '0') + ':00',
        steps: row.StepTotal || 0
      }))

      const hourlyCalories = userHourlyCalories.map(row => ({
        hour: new Date(row.ActivityHour).getHours().toString().padStart(2, '0') + ':00',
        calories: row.Calories || 0
      }))

      const hourlyIntensities = userHourlyIntensities.map(row => ({
        hour: new Date(row.ActivityHour).getHours().toString().padStart(2, '0') + ':00',
        intensity: row.Intensity || 0
      }))

      return {
        steps: latestActivity.TotalSteps || 0,
        calories: latestActivity.Calories || 0,
        activeMinutes: (latestActivity.VeryActiveMinutes || 0) + (latestActivity.FairlyActiveMinutes || 0) + (latestActivity.LightlyActiveMinutes || 0),
        heartRate: 75, // Default since heart rate data is in seconds format
        
        // Sleep metrics
        totalSleepRecords: userSleep[0]?.TotalSleepRecords || 1,
        totalMinutesAsleep: userSleep[0]?.TotalMinutesAsleep || 0,
        totalTimeInBed: userSleep[0]?.TotalTimeInBed || 0,
        
        // Weight and body metrics
        weightKg: userWeight[0]?.WeightKg || 0,
        weightPounds: userWeight[0]?.WeightPounds || 0,
        fat: userWeight[0]?.Fat || 0,
        bmi: userWeight[0]?.BMI || 0,
        
        // Detailed activity metrics
        totalDistance: latestActivity.TotalDistance || 0,
        veryActiveDistance: latestActivity.VeryActiveDistance || 0,
        moderatelyActiveDistance: latestActivity.ModeratelyActiveDistance || 0,
        lightActiveDistance: latestActivity.LightActiveDistance || 0,
        sedentaryActiveDistance: latestActivity.SedentaryActiveDistance || 0,
        
        veryActiveMinutes: latestActivity.VeryActiveMinutes || 0,
        fairlyActiveMinutes: latestActivity.FairlyActiveMinutes || 0,
        lightlyActiveMinutes: latestActivity.LightlyActiveMinutes || 0,
        sedentaryMinutes: latestActivity.SedentaryMinutes || 0,
        
        // Hourly patterns
        hourlySteps,
        hourlyCalories,
        hourlyIntensities
      }
    } catch (error) {
      console.error('Error processing sample data:', error)
      return null
    }
  }

  /**
   * Get historical data for a specific metric
   */
  getHistoricalData(metric: string, days: number = 7): any[] {
    if (!this.sampleData || !this.currentUserId) return []

    try {
      const userActivity = this.sampleData.dailyActivity
        .filter(row => row.Id === this.currentUserId)
        .sort((a, b) => new Date(b.ActivityDate).getTime() - new Date(a.ActivityDate).getTime())
        .slice(0, days)

      return userActivity.map(row => ({
        date: row.ActivityDate,
        value: row[metric] || 0
      }))
    } catch (error) {
      console.error('Error getting historical data:', error)
      return []
    }
  }

  /**
   * Get data for a specific date range
   */
  getDataForDateRange(startDate: string, endDate: string): any {
    if (!this.sampleData || !this.currentUserId) return null

    try {
      const start = new Date(startDate)
      const end = new Date(endDate)

      const userActivity = this.sampleData.dailyActivity
        .filter(row => {
          if (row.Id !== this.currentUserId) return false
          const activityDate = new Date(row.ActivityDate)
          return activityDate >= start && activityDate <= end
        })
        .sort((a, b) => new Date(a.ActivityDate).getTime() - new Date(b.ActivityDate).getTime())

      const userSleep = this.sampleData.sleepData
        .filter(row => {
          if (row.Id !== this.currentUserId) return false
          const sleepDate = new Date(row.SleepDay)
          return sleepDate >= start && sleepDate <= end
        })
        .sort((a, b) => new Date(a.SleepDay).getTime() - new Date(b.SleepDay).getTime())

      const userWeight = this.sampleData.weightData
        .filter(row => {
          if (row.Id !== this.currentUserId) return false
          const weightDate = new Date(row.Date)
          return weightDate >= start && weightDate <= end
        })
        .sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime())

      return {
        activity: userActivity,
        sleep: userSleep,
        weight: userWeight,
        dateRange: { start: startDate, end: endDate }
      }
    } catch (error) {
      console.error('Error getting data for date range:', error)
      return null
    }
  }

  /**
   * Get weekly summary data
   */
  getWeeklySummary(): any {
    if (!this.sampleData || !this.currentUserId) return null

    try {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      const weeklyData = this.getDataForDateRange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0])
      
      if (!weeklyData || !weeklyData.activity || weeklyData.activity.length === 0) return null

      const totalSteps = weeklyData.activity.reduce((sum: number, day: any) => sum + (day.TotalSteps || 0), 0)
      const totalCalories = weeklyData.activity.reduce((sum: number, day: any) => sum + (day.Calories || 0), 0)
      const totalActiveMinutes = weeklyData.activity.reduce((sum: number, day: any) => 
        sum + (day.VeryActiveMinutes || 0) + (day.FairlyActiveMinutes || 0) + (day.LightlyActiveMinutes || 0), 0)
      
      const avgSteps = Math.floor(totalSteps / weeklyData.activity.length)
      const avgCalories = Math.floor(totalCalories / weeklyData.activity.length)
      const avgActiveMinutes = Math.floor(totalActiveMinutes / weeklyData.activity.length)

      return {
        totalSteps,
        totalCalories,
        totalActiveMinutes,
        averageSteps: avgSteps,
        averageCalories: avgCalories,
        averageActiveMinutes: avgActiveMinutes,
        daysTracked: weeklyData.activity.length,
        dateRange: weeklyData.dateRange
      }
    } catch (error) {
      console.error('Error getting weekly summary:', error)
      return null
    }
  }

  /**
   * Get monthly summary data
   */
  getMonthlySummary(): any {
    if (!this.sampleData || !this.currentUserId) return null

    try {
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      const monthlyData = this.getDataForDateRange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0])
      
      if (!monthlyData || !monthlyData.activity || monthlyData.activity.length === 0) return null

      const totalSteps = monthlyData.activity.reduce((sum: number, day: any) => sum + (day.TotalSteps || 0), 0)
      const totalCalories = monthlyData.activity.reduce((sum: number, day: any) => sum + (day.Calories || 0), 0)
      const totalActiveMinutes = monthlyData.activity.reduce((sum: number, day: any) => 
        sum + (day.VeryActiveMinutes || 0) + (day.FairlyActiveMinutes || 0) + (day.LightlyActiveMinutes || 0), 0)
      
      const avgSteps = Math.floor(totalSteps / monthlyData.activity.length)
      const avgCalories = Math.floor(totalCalories / monthlyData.activity.length)
      const avgActiveMinutes = Math.floor(totalActiveMinutes / monthlyData.activity.length)

      // Calculate trends
      const firstWeek = monthlyData.activity.slice(0, 7)
      const lastWeek = monthlyData.activity.slice(-7)
      
      const firstWeekAvg = firstWeek.reduce((sum: number, day: any) => sum + (day.TotalSteps || 0), 0) / firstWeek.length
      const lastWeekAvg = lastWeek.reduce((sum: number, day: any) => sum + (day.TotalSteps || 0), 0) / lastWeek.length
      
      let trend = 'stable'
      if (lastWeekAvg > firstWeekAvg * 1.1) trend = 'improving'
      else if (lastWeekAvg < firstWeekAvg * 0.9) trend = 'declining'

      return {
        totalSteps,
        totalCalories,
        totalActiveMinutes,
        averageSteps: avgSteps,
        averageCalories: avgCalories,
        averageActiveMinutes: avgActiveMinutes,
        daysTracked: monthlyData.activity.length,
        trend,
        dateRange: monthlyData.dateRange
      }
    } catch (error) {
      console.error('Error getting monthly summary:', error)
      return null
    }
  }

  /**
   * Get specific metric data for a user
   */
  getMetricData(metric: string, userId?: string): any[] {
    if (!this.sampleData) return []
    
    const targetUserId = userId || this.currentUserId
    if (!targetUserId) return []

    try {
      let data: any[] = []
      
      switch (metric) {
        case 'steps':
          data = this.sampleData.dailyActivity
            .filter(row => row.Id === targetUserId)
            .map(row => ({
              date: row.ActivityDate,
              value: row.TotalSteps || 0,
              goal: 10000
            }))
          break
          
        case 'calories':
          data = this.sampleData.dailyActivity
            .filter(row => row.Id === targetUserId)
            .map(row => ({
              date: row.ActivityDate,
              value: row.Calories || 0,
              goal: 500
            }))
          break
          
        case 'sleep':
          data = this.sampleData.sleepData
            .filter(row => row.Id === targetUserId)
            .map(row => ({
              date: row.SleepDay,
              value: (row.TotalMinutesAsleep || 0) / 60,
              goal: 8,
              timeInBed: (row.TotalTimeInBed || 0) / 60
            }))
          break
          
        case 'weight':
          data = this.sampleData.weightData
            .filter(row => row.Id === targetUserId)
            .map(row => ({
              date: row.Date,
              value: row.WeightKg || 0,
              bmi: row.BMI || 0,
              fat: row.Fat || 0
            }))
          break
          
        case 'activity':
          data = this.sampleData.dailyActivity
            .filter(row => row.Id === targetUserId)
            .map(row => ({
              date: row.ActivityDate,
              value: (row.VeryActiveMinutes || 0) + (row.FairlyActiveMinutes || 0) + (row.LightlyActiveMinutes || 0),
              goal: 60,
              veryActive: row.VeryActiveMinutes || 0,
              fairlyActive: row.FairlyActiveMinutes || 0,
              lightlyActive: row.LightlyActiveMinutes || 0,
              sedentary: row.SedentaryMinutes || 0
            }))
          break
      }
      
      return data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } catch (error) {
      console.error(`Error getting ${metric} data:`, error)
      return []
    }
  }

  /**
   * Check if sample data is loaded
   */
  isDataLoaded(): boolean {
    return this.sampleData !== null
  }
}
