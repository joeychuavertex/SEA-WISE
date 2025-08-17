import axios from 'axios'
import { startOfDay, endOfDay } from 'date-fns'

export interface HealthData {
  steps: number
  calories: number
  activeMinutes: number
  heartRate: number
  // Sleep metrics
  totalSleepRecords?: number
  totalMinutesAsleep?: number
  totalTimeInBed?: number
  // Weight and body metrics
  weightKg?: number
  weightPounds?: number
  fat?: number
  bmi?: number
  // Detailed activity metrics
  totalDistance?: number
  veryActiveDistance?: number
  moderatelyActiveDistance?: number
  lightActiveDistance?: number
  sedentaryActiveDistance?: number
  veryActiveMinutes?: number
  fairlyActiveMinutes?: number
  lightlyActiveMinutes?: number
  sedentaryMinutes?: number
  // Hourly patterns
  hourlySteps?: { hour: string; steps: number }[]
  hourlyCalories?: { hour: string; calories: number }[]
  hourlyIntensities?: { hour: string; intensity: number }[]
}

export class GoogleFitService {
  private clientId: string
  private accessToken: string | null = null
  private refreshToken: string | null = null
  
  constructor() {
    // These would typically come from environment variables
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
    
    // Check for existing tokens in localStorage
    this.accessToken = localStorage.getItem('googleFit_accessToken')
    this.refreshToken = localStorage.getItem('googleFit_refreshToken')
  }

  /**
   * Check if user is connected to Google Fit
   */
  async isConnected(): Promise<boolean> {
    if (!this.accessToken) return false
    
    try {
      // Test the token by making a simple API call
      await this.makeApiCall('/users/me/profile')
      return true
    } catch (error) {
      // Token might be expired, try to refresh
      try {
        await this.refreshAccessToken()
        return true
      } catch {
        this.clearTokens()
        return false
      }
    }
  }

  /**
   * Connect to Google Fit using OAuth2
   */
  async connect(): Promise<void> {
    if (!this.clientId || this.clientId === 'your_google_client_id_here') {
      throw new Error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.')
    }

    // Google OAuth2 flow - use the redirect URI that matches Google Cloud Console
    const redirectUri = window.location.origin + '/oauth-callback'
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${this.clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent('https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.heart_rate.read')}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent`
    
    // Debug: Log the redirect URI being used
    console.log('OAuth Debug:', {
      origin: window.location.origin,
      pathname: window.location.pathname,
      redirectUri: redirectUri,
      fullAuthUrl: authUrl
    })

    // Open OAuth popup
    const popup = window.open(authUrl, 'googleFitAuth', 'width=500,height=600')
    
    return new Promise((resolve, reject) => {
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return
        
        if (event.data.type === 'GOOGLE_FIT_AUTH_SUCCESS') {
          const { code } = event.data
          try {
            await this.exchangeCodeForTokens(code)
            window.removeEventListener('message', handleMessage)
            popup?.close()
            resolve()
          } catch (error) {
            reject(error)
          }
        } else if (event.data.type === 'GOOGLE_FIT_AUTH_ERROR') {
          window.removeEventListener('message', handleMessage)
          popup?.close()
          reject(new Error('Authentication failed'))
        }
      }
      
      window.addEventListener('message', handleMessage)
      
      // Handle popup closed
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          window.removeEventListener('message', handleMessage)
          reject(new Error('Authentication cancelled'))
        }
      }, 1000)
    })
  }

  /**
   * Exchange authorization code for access and refresh tokens
   */
  private async exchangeCodeForTokens(code: string): Promise<void> {
    try {
      // Exchange authorization code for tokens using Google's token endpoint
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: this.clientId,
        client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: window.location.origin + '/oauth-callback'
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      // Extract tokens from response
      this.accessToken = tokenResponse.data.access_token || ''
      this.refreshToken = tokenResponse.data.refresh_token || ''
      
      // Store tokens (only if they exist)
      if (this.accessToken) {
        localStorage.setItem('googleFit_accessToken', this.accessToken)
      }
      if (this.refreshToken) {
        localStorage.setItem('googleFit_refreshToken', this.refreshToken)
      }
      
      console.log('Successfully exchanged code for tokens')
    } catch (error) {
      console.error('Failed to exchange code for tokens:', error)
      throw new Error('Failed to authenticate with Google Fit')
    }
  }

  /**
   * Refresh the access token using refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      // Refresh access token using Google's token endpoint
      const refreshResponse = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: this.clientId,
        client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token'
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      // Update access token
      this.accessToken = refreshResponse.data.access_token || ''
      if (this.accessToken) {
        localStorage.setItem('googleFit_accessToken', this.accessToken)
      }
      
      console.log('Successfully refreshed access token')
    } catch (error) {
      console.error('Failed to refresh access token:', error)
      throw new Error('Failed to refresh authentication')
    }
  }

  /**
   * Get health data from Google Fit
   */
  async getHealthData(): Promise<HealthData> {
    if (!this.accessToken) {
      throw new Error('Not connected to Google Fit')
    }

    try {
      const today = new Date()
      const startTime = startOfDay(today).getTime()
      const endTime = endOfDay(today).getTime()

      // Get steps data
      const stepsData = await this.getStepsData(startTime, endTime)
      
      // Get calories data
      const caloriesData = await this.getCaloriesData(startTime, endTime)
      
      // Get active minutes
      const activeMinutesData = await this.getActiveMinutesData(startTime, endTime)
      
      // Get heart rate data
      const heartRateData = await this.getHeartRateData(startTime, endTime)

      return {
        steps: stepsData,
        calories: caloriesData,
        activeMinutes: activeMinutesData,
        heartRate: heartRateData
      }
    } catch (error) {
      console.error('Error fetching health data:', error)
      throw error
    }
  }

  /**
   * Get steps data for a time range
   */
  private async getStepsData(startTime: number, endTime: number): Promise<number> {
    try {
      const response = await this.makeApiCall(
        `/users/me/dataset:aggregate`,
        {
          method: 'POST',
          data: {
            aggregateBy: [{
              dataTypeName: "com.google.step_count.delta",
              dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
            }],
            bucketByTime: { durationMillis: 86400000 }, // 24 hours
            startTimeMillis: startTime,
            endTimeMillis: endTime
          }
        }
      )

      // Parse the response to get total steps
      const buckets = response.bucket || []
      let totalSteps = 0
      
      for (const bucket of buckets) {
        const datasets = bucket.dataset || []
        for (const dataset of datasets) {
          const points = dataset.point || []
          for (const point of points) {
            totalSteps += point.value?.[0]?.intVal || 0
          }
        }
      }

      return totalSteps
    } catch (error) {
      console.error('Error fetching steps data:', error)
      return 0
    }
  }

  /**
   * Get calories data for a time range
   */
  private async getCaloriesData(startTime: number, endTime: number): Promise<number> {
    try {
      const response = await this.makeApiCall(
        `/users/me/dataset:aggregate`,
        {
          method: 'POST',
          data: {
            aggregateBy: [{
              dataTypeName: "com.google.calories.expended",
              dataSourceId: "derived:com.google.calories.expended:com.google.android.gms:from_activities"
            }],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis: startTime,
            endTimeMillis: endTime
          }
        }
      )

      const buckets = response.bucket || []
      let totalCalories = 0
      
      for (const bucket of buckets) {
        const datasets = bucket.dataset || []
        for (const dataset of datasets) {
          const points = dataset.point || []
          for (const point of points) {
            totalCalories += point.value?.[0]?.fpVal || 0
          }
        }
      }

      return Math.round(totalCalories)
    } catch (error) {
      console.error('Error fetching calories data:', error)
      return 0
    }
  }

  /**
   * Get active minutes data for a time range
   */
  private async getActiveMinutesData(startTime: number, endTime: number): Promise<number> {
    try {
      const response = await this.makeApiCall(
        `/users/me/dataset:aggregate`,
        {
          method: 'POST',
          data: {
            aggregateBy: [{
              dataTypeName: "com.google.active_minutes",
              dataSourceId: "derived:com.google.active_minutes:com.google.android.gms:from_activities"
            }],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis: startTime,
            endTimeMillis: endTime
          }
        }
      )

      const buckets = response.bucket || []
      let totalActiveMinutes = 0
      
      for (const bucket of buckets) {
        const datasets = bucket.dataset || []
        for (const dataset of datasets) {
          const points = dataset.point || []
          for (const point of points) {
            totalActiveMinutes += point.value?.[0]?.intVal || 0
          }
        }
      }

      return totalActiveMinutes
    } catch (error) {
      console.error('Error fetching active minutes data:', error)
      return 0
    }
  }

  /**
   * Get heart rate data for a time range
   */
  private async getHeartRateData(startTime: number, endTime: number): Promise<number> {
    try {
      const response = await this.makeApiCall(
        `/users/me/dataset:aggregate`,
        {
          method: 'POST',
          data: {
            aggregateBy: [{
              dataTypeName: "com.google.heart_rate.bpm",
              dataSourceId: "derived:com.google.heart_rate.bpm:com.google.android.gms:from_activities"
            }],
            bucketByTime: { durationMillis: 86400000 },
            startTimeMillis: startTime,
            endTimeMillis: endTime
          }
        }
      )

      const buckets = response.bucket || []
      let latestHeartRate = 0
      
      for (const bucket of buckets) {
        const datasets = bucket.dataset || []
        for (const dataset of datasets) {
          const points = dataset.point || []
          if (points.length > 0) {
            // Get the most recent heart rate reading
            const latestPoint = points[points.length - 1]
            latestHeartRate = latestPoint.value?.[0]?.fpVal || 0
          }
        }
      }

      return Math.round(latestHeartRate)
    } catch (error) {
      console.error('Error fetching heart rate data:', error)
      return 0
    }
  }

  /**
   * Make authenticated API calls to Google Fit
   */
  private async makeApiCall(endpoint: string, options: any = {}): Promise<any> {
    if (!this.accessToken) {
      throw new Error('No access token available')
    }

    const baseURL = 'https://www.googleapis.com/fitness/v1'
    const url = baseURL + endpoint

    const config = {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    try {
      const response = await axios(url, config)
      return response.data
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Token expired, try to refresh
        await this.refreshAccessToken()
        
        // Retry the request with new token
        config.headers.Authorization = `Bearer ${this.accessToken}`
        const retryResponse = await axios(url, config)
        return retryResponse.data
      }
      throw error
    }
  }

  /**
   * Disconnect from Google Fit
   */
  async disconnect(): Promise<void> {
    this.clearTokens()
    
    // In a real app, you might also want to revoke the token with Google
    // await this.revokeToken()
  }

  /**
   * Clear stored tokens
   */
  private clearTokens(): void {
    this.accessToken = null
    this.refreshToken = null
    localStorage.removeItem('googleFit_accessToken')
    localStorage.removeItem('googleFit_refreshToken')
  }

  /**
   * Revoke the access token with Google (optional)
   */
  // private async revokeToken(): Promise<void> {
  //   if (!this.accessToken) return
  //   
  //   try {
  //     await axios.get(`https://oauth2.googleapis.com/revoke?token=${this.accessToken}`)
  //     console.log('Token revoked successfully')
  //   } catch (error) {
  //     console.error('Error revoking token:', error)
  //   }
  // }
} 