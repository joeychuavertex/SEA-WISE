import axios from 'axios'
import { startOfDay, endOfDay } from 'date-fns'

export interface HealthData {
  steps: number
  calories: number
  activeMinutes: number
  heartRate: number
}

export class GoogleHealthConnectService {
  private clientId: string
  private accessToken: string | null = null
  private refreshToken: string | null = null
  
  constructor() {
    // These would typically come from environment variables
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
    
    // Check for existing tokens in localStorage
    this.accessToken = localStorage.getItem('healthConnect_accessToken')
    this.refreshToken = localStorage.getItem('healthConnect_refreshToken')
  }

  /**
   * Check if user is connected to Google Health Connect
   */
  async isConnected(): Promise<boolean> {
    if (!this.accessToken) return false
    
    try {
      // Test the token by making a simple API call
      await this.makeApiCall('/v1/users/me/profile')
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
   * Connect to Google Health Connect using OAuth2
   */
  async connect(): Promise<void> {
    if (!this.clientId || this.clientId === 'your_google_client_id_here') {
      throw new Error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.')
    }

    // Google Health Connect OAuth2 flow
    const redirectUri = window.location.origin + '/oauth-callback'
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${this.clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent('https://www.googleapis.com/auth/healthconnect.read')}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent`
    
    // Debug: Log the redirect URI being used
    console.log('Health Connect OAuth Debug:', {
      origin: window.location.origin,
      pathname: window.location.pathname,
      redirectUri: redirectUri,
      fullAuthUrl: authUrl
    })

    // Open OAuth popup
    const popup = window.open(authUrl, 'healthConnectAuth', 'width=500,height=600')
    
    return new Promise((resolve, reject) => {
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return
        
        if (event.data.type === 'GOOGLE_HEALTH_CONNECT_AUTH_SUCCESS') {
          const { code } = event.data
          try {
            await this.exchangeCodeForTokens(code)
            window.removeEventListener('message', handleMessage)
            popup?.close()
            resolve()
          } catch (error) {
            reject(error)
          }
        } else if (event.data.type === 'GOOGLE_HEALTH_CONNECT_AUTH_ERROR') {
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
        localStorage.setItem('healthConnect_accessToken', this.accessToken)
      }
      if (this.refreshToken) {
        localStorage.setItem('healthConnect_refreshToken', this.refreshToken)
      }
      
      console.log('Successfully exchanged code for Health Connect tokens')
    } catch (error) {
      console.error('Failed to exchange code for tokens:', error)
      throw new Error('Failed to authenticate with Google Health Connect')
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
        localStorage.setItem('healthConnect_accessToken', this.accessToken)
      }
      
      console.log('Successfully refreshed Health Connect access token')
    } catch (error) {
      console.error('Failed to refresh access token:', error)
      throw new Error('Failed to refresh authentication')
    }
  }

  /**
   * Get health data from Google Health Connect
   */
  async getHealthData(): Promise<HealthData> {
    if (!this.accessToken) {
      throw new Error('Not connected to Google Health Connect')
    }

    try {
      const today = new Date()
      const startTime = startOfDay(today).toISOString()
      const endTime = endOfDay(today).toISOString()

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
  private async getStepsData(startTime: string, endTime: string): Promise<number> {
    try {
      const response = await this.makeApiCall(
        `/v1/users/me/dataSources/derived:com.google.step_count.delta:com.google.android.gms:estimated_steps/datasets`,
        {
          method: 'GET',
          params: {
            startTime: startTime,
            endTime: endTime
          }
        }
      )

      // Parse the response to get total steps
      const datasets = response.dataset || []
      let totalSteps = 0
      
      for (const dataset of datasets) {
        const points = dataset.point || []
        for (const point of points) {
          totalSteps += point.value?.[0]?.intVal || 0
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
  private async getCaloriesData(startTime: string, endTime: string): Promise<number> {
    try {
      const response = await this.makeApiCall(
        `/v1/users/me/dataSources/derived:com.google.calories.expended:com.google.android.gms:from_activities/datasets`,
        {
          method: 'GET',
          params: {
            startTime: startTime,
            endTime: endTime
          }
        }
      )

      const datasets = response.dataset || []
      let totalCalories = 0
      
      for (const dataset of datasets) {
        const points = dataset.point || []
        for (const point of points) {
          totalCalories += point.value?.[0]?.fpVal || 0
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
  private async getActiveMinutesData(startTime: string, endTime: string): Promise<number> {
    try {
      const response = await this.makeApiCall(
        `/v1/users/me/dataSources/derived:com.google.active_minutes:com.google.android.gms:from_activities/datasets`,
        {
          method: 'GET',
          params: {
            startTime: startTime,
            endTime: endTime
          }
        }
      )

      const datasets = response.dataset || []
      let totalActiveMinutes = 0
      
      for (const dataset of datasets) {
        const points = dataset.point || []
        for (const point of points) {
          totalActiveMinutes += point.value?.[0]?.intVal || 0
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
  private async getHeartRateData(startTime: string, endTime: string): Promise<number> {
    try {
      const response = await this.makeApiCall(
        `/v1/users/me/dataSources/derived:com.google.heart_rate.bpm:com.google.android.gms:from_activities/datasets`,
        {
          method: 'GET',
          params: {
            startTime: startTime,
            endTime: endTime
          }
        }
      )

      const datasets = response.dataset || []
      let latestHeartRate = 0
      
      for (const dataset of datasets) {
        const points = dataset.point || []
        if (points.length > 0) {
          // Get the most recent heart rate reading
          const latestPoint = points[points.length - 1]
          latestHeartRate = latestPoint.value?.[0]?.fpVal || 0
        }
      }

      return Math.round(latestHeartRate)
    } catch (error) {
      console.error('Error fetching heart rate data:', error)
      return 0
    }
  }

  /**
   * Make authenticated API calls to Google Health Connect
   */
  private async makeApiCall(endpoint: string, options: any = {}): Promise<any> {
    if (!this.accessToken) {
      throw new Error('No access token available')
    }

    const baseURL = 'https://healthconnect.googleapis.com'
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
   * Disconnect from Google Health Connect
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
    localStorage.removeItem('healthConnect_accessToken')
    localStorage.removeItem('healthConnect_refreshToken')
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
  //   } catch (error {
  //     console.error('Error revoking token:', error)
  //   }
  // }
} 