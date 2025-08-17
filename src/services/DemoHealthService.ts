import type { HealthData } from './GoogleFitService'

export class DemoHealthService {
  private connected = false
  private demoData: HealthData = {
    steps: 0,
    calories: 0,
    activeMinutes: 0,
    heartRate: 0,
    // Sleep metrics
    totalSleepRecords: 1,
    totalMinutesAsleep: 0,
    totalTimeInBed: 0,
    // Weight and body metrics
    weightKg: 0,
    weightPounds: 0,
    fat: 0,
    bmi: 0,
    // Detailed activity metrics
    totalDistance: 0,
    veryActiveDistance: 0,
    moderatelyActiveDistance: 0,
    lightActiveDistance: 0,
    sedentaryActiveDistance: 0,
    veryActiveMinutes: 0,
    fairlyActiveMinutes: 0,
    lightlyActiveMinutes: 0,
    sedentaryMinutes: 0,
    // Hourly patterns
    hourlySteps: [],
    hourlyCalories: [],
    hourlyIntensities: []
  }

  /**
   * Check if demo mode is connected
   */
  async isConnected(): Promise<boolean> {
    return this.connected
  }

  /**
   * Connect to demo mode
   */
  async connect(): Promise<void> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    this.connected = true
    
    // Generate initial demo data
    this.generateDemoData()
  }

  /**
   * Disconnect from demo mode
   */
  async disconnect(): Promise<void> {
    this.connected = false
    this.demoData = {
      steps: 0,
      calories: 0,
      activeMinutes: 0,
      heartRate: 0,
      totalSleepRecords: 1,
      totalMinutesAsleep: 0,
      totalTimeInBed: 0,
      weightKg: 0,
      weightPounds: 0,
      fat: 0,
      bmi: 0,
      totalDistance: 0,
      veryActiveDistance: 0,
      moderatelyActiveDistance: 0,
      lightActiveDistance: 0,
      sedentaryActiveDistance: 0,
      veryActiveMinutes: 0,
      fairlyActiveMinutes: 0,
      lightlyActiveMinutes: 0,
      sedentaryMinutes: 0,
      hourlySteps: [],
      hourlyCalories: [],
      hourlyIntensities: []
    }
  }

  /**
   * Get demo health data
   */
  async getHealthData(): Promise<HealthData> {
    if (!this.connected) {
      throw new Error('Demo mode not connected')
    }

    // Update demo data to simulate real-time changes
    this.updateDemoData()
    
    return { ...this.demoData }
  }

  /**
   * Generate initial demo data
   */
  private generateDemoData(): void {
    const now = new Date()
    const hour = now.getHours()
    
    // Generate realistic demo data based on time of day
    if (hour >= 6 && hour <= 22) {
      // Daytime - more activity
      this.demoData.steps = Math.floor(Math.random() * 3000) + 2000
      this.demoData.calories = Math.floor(Math.random() * 200) + 150
      this.demoData.activeMinutes = Math.floor(Math.random() * 30) + 20
      this.demoData.heartRate = Math.floor(Math.random() * 20) + 70
    } else {
      // Nighttime - less activity
      this.demoData.steps = Math.floor(Math.random() * 500) + 100
      this.demoData.calories = Math.floor(Math.random() * 50) + 20
      this.demoData.activeMinutes = Math.floor(Math.random() * 10) + 5
      this.demoData.heartRate = Math.floor(Math.random() * 15) + 60
    }

    // Generate sleep data (simulate last night's sleep)
    this.demoData.totalSleepRecords = 1
    this.demoData.totalMinutesAsleep = Math.floor(Math.random() * 120) + 360 // 6-8 hours
    this.demoData.totalTimeInBed = this.demoData.totalMinutesAsleep + Math.floor(Math.random() * 30) + 10

    // Generate weight and body metrics
    this.demoData.weightKg = Math.random() * 30 + 60 // 60-90 kg
    this.demoData.weightPounds = this.demoData.weightKg * 2.20462
    this.demoData.fat = Math.random() * 15 + 15 // 15-30%
    this.demoData.bmi = this.demoData.weightKg / Math.pow(1.7, 2) // Assuming 1.7m height

    // Generate detailed activity metrics
    this.demoData.totalDistance = this.demoData.steps * 0.0008 // Rough conversion
    this.demoData.veryActiveDistance = this.demoData.totalDistance * 0.1
    this.demoData.moderatelyActiveDistance = this.demoData.totalDistance * 0.2
    this.demoData.lightActiveDistance = this.demoData.totalDistance * 0.4
    this.demoData.sedentaryActiveDistance = this.demoData.totalDistance * 0.3

    this.demoData.veryActiveMinutes = Math.floor(this.demoData.activeMinutes * 0.2)
    this.demoData.fairlyActiveMinutes = Math.floor(this.demoData.activeMinutes * 0.3)
    this.demoData.lightlyActiveMinutes = Math.floor(this.demoData.activeMinutes * 0.5)
    this.demoData.sedentaryMinutes = 1440 - this.demoData.activeMinutes // 24 hours - active minutes

    // Generate hourly patterns
    this.generateHourlyPatterns()
  }

  /**
   * Generate hourly activity patterns
   */
  private generateHourlyPatterns(): void {
    this.demoData.hourlySteps = []
    this.demoData.hourlyCalories = []
    this.demoData.hourlyIntensities = []

    for (let hour = 0; hour < 24; hour++) {
      let stepMultiplier = 0.1
      let calorieMultiplier = 0.1
      let intensityMultiplier = 0.1

      // Peak activity during typical active hours
      if (hour >= 7 && hour <= 9) { // Morning commute
        stepMultiplier = 0.8
        calorieMultiplier = 0.7
      } else if (hour >= 12 && hour <= 14) { // Lunch break
        stepMultiplier = 0.5
        calorieMultiplier = 0.4
      } else if (hour >= 17 && hour <= 19) { // Evening activity
        stepMultiplier = 0.9
        calorieMultiplier = 0.8
      } else if (hour >= 22 || hour <= 6) { // Sleep hours
        stepMultiplier = 0.05
        calorieMultiplier = 0.05
      }

      const hourLabel = `${hour.toString().padStart(2, '0')}:00`
      
      this.demoData.hourlySteps.push({
        hour: hourLabel,
        steps: Math.floor(this.demoData.steps * stepMultiplier / 24)
      })
      
      this.demoData.hourlyCalories.push({
        hour: hourLabel,
        calories: Math.floor(this.demoData.calories * calorieMultiplier / 24)
      })
      
      this.demoData.hourlyIntensities.push({
        hour: hourLabel,
        intensity: Math.floor(Math.random() * 3) + 1 // 1-3 intensity levels
      })
    }
  }

  /**
   * Update demo data to simulate real-time changes
   */
  private updateDemoData(): void {
    // Add some random variation to make it feel more realistic
    this.demoData.steps += Math.floor(Math.random() * 10) - 5
    this.demoData.steps = Math.max(0, this.demoData.steps)
    
    this.demoData.calories += Math.floor(Math.random() * 5) - 2
    this.demoData.calories = Math.max(0, this.demoData.calories)
    
    this.demoData.activeMinutes += Math.floor(Math.random() * 2) - 1
    this.demoData.activeMinutes = Math.max(0, this.demoData.activeMinutes)
    
    this.demoData.heartRate += Math.floor(Math.random() * 6) - 3
    this.demoData.heartRate = Math.max(50, Math.min(120, this.demoData.heartRate))

    // Update distance based on steps
    this.demoData.totalDistance = this.demoData.steps * 0.0008
    
    // Update hourly patterns
    this.generateHourlyPatterns()
  }
} 