import type { HealthData } from './GoogleFitService'

export class DemoHealthService {
  private connected = false
  private demoData: HealthData = {
    steps: 0,
    calories: 0,
    activeMinutes: 0,
    heartRate: 0
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
    this.demoData = { steps: 0, calories: 0, activeMinutes: 0, heartRate: 0 }
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
  }
} 