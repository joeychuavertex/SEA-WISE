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
        let value = values[index] || ''
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
   * Check if sample data is loaded
   */
  isDataLoaded(): boolean {
    return this.sampleData !== null
  }
}
