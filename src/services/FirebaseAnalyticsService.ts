import { 
  collection, 
  doc,
  addDoc, 
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  arrayUnion
} from 'firebase/firestore'
import { db, auth } from './firebase'

export interface ChatHistoryEntry {
  userId: string
  sessionId: string
  eventType: 'message_sent' | 'message_received' | 'session_started' | 'session_ended'
  messageType: 'user' | 'ai' | null
  messageText: string
  messageLength: number
  responseTime: number | null // in milliseconds
  timestamp: Timestamp
  metadata: {
    language?: string
    queryType?: string
    dataType?: string
    timeRange?: string
    errorOccurred?: boolean
    errorMessage?: string
  } | null
}

export interface ChatHistoryDocument {
  history: ChatHistoryEntry[]
  userId: string
  sessionId: string
  createdAt: Timestamp
  updatedAt: Timestamp
  totalMessages: number
}

export interface UserInteractionEvent {
  userId: string
  sessionId: string
  eventType: 'button_click' | 'input_focus' | 'input_blur' | 'scroll' | 'resize'
  elementId: string | null
  elementType: string | null
  timestamp: Timestamp
  metadata: {
    value?: string
    position?: { x: number; y: number }
    viewportSize?: { width: number; height: number }
  } | null
}

export interface HealthDataQueryEvent {
  userId: string
  sessionId: string
  query: string
  translatedQuery: any
  healthAnalysis: any
  responseTime: number
  timestamp: Timestamp
  metadata: {
    dataSource?: string
    dataTypes?: string[]
    processingTime?: number
    modelVersion?: string
  } | null
}

export class FirebaseAnalyticsService {
  private currentUserId: string | null = null
  private currentSessionId: string | null = null
  private sessionStartTime: Date | null = null
  private chatHistoryRef: any = null

  constructor() {
    // Listen for auth state changes
    auth.onAuthStateChanged((user) => {
      this.currentUserId = user?.uid || null
      console.log('Firebase Analytics: Auth state changed, userId:', this.currentUserId)
    })
    
    // Set a default user ID immediately for development
    this.currentUserId = 'default-user'
    console.log('Firebase Analytics: Constructor initialized with userId:', this.currentUserId)
  }

  /**
   * Set the current user ID (for when using without Firebase Auth)
   */
  setUserId(userId: string): void {
    this.currentUserId = userId
    console.log('Firebase Analytics: User ID set to:', this.currentUserId)
  }

  /**
   * Set the current session ID
   */
  setSessionId(sessionId: string): void {
    this.currentSessionId = sessionId
  }

  /**
   * Generate a new session ID
   */
  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Start a new analytics session
   */
  async startSession(): Promise<string> {
    console.log('Firebase Analytics: Starting new session')
    
    // Ensure user ID is set
    if (!this.currentUserId) {
      this.currentUserId = 'default-user'
      console.log('Firebase Analytics: Set default user ID:', this.currentUserId)
    }
    
    const sessionId = this.generateSessionId()
    this.currentSessionId = sessionId
    this.sessionStartTime = new Date()
    
    console.log('Firebase Analytics: Generated session ID:', sessionId)
    console.log('Firebase Analytics: Current user ID:', this.currentUserId)
    
    // Create or get chat history document
    await this.initializeChatHistory(sessionId)
    
    // Log session start event
    await this.logChatEvent('session_started')
    
    console.log('Firebase Analytics: Session started successfully')
    return sessionId
  }

  /**
   * Initialize chat history document
   */
  private async initializeChatHistory(sessionId: string): Promise<void> {
    if (!this.currentUserId) {
      console.warn('Analytics: User ID not set')
      return
    }

    try {
      const docId = `${this.currentUserId}_${sessionId}`
      this.chatHistoryRef = doc(db, 'chathistory', docId)
      console.log('Firebase Analytics: Initializing chat history for docId:', docId)
      
      const docSnap = await getDoc(this.chatHistoryRef)
      console.log('Firebase Analytics: Document exists:', docSnap.exists())
      
      if (!docSnap.exists()) {
        // Create new document
        const initialDoc: ChatHistoryDocument = {
          history: [],
          userId: this.currentUserId,
          sessionId: sessionId,
          createdAt: serverTimestamp() as Timestamp,
          updatedAt: serverTimestamp() as Timestamp,
          totalMessages: 0
        }
        
        console.log('Firebase Analytics: Creating new document with data:', initialDoc)
        await setDoc(this.chatHistoryRef, initialDoc)
        console.log('Firebase Analytics: Document created successfully')
      } else {
        console.log('Firebase Analytics: Document already exists, using existing document')
      }
    } catch (error) {
      console.error('Firebase Analytics: Failed to initialize chat history:', error)
    }
  }

  /**
   * End the current analytics session
   */
  async endSession(): Promise<void> {
    if (this.currentSessionId) {
      await this.logChatEvent('session_ended')
      this.currentSessionId = null
      this.sessionStartTime = null
      this.chatHistoryRef = null
    }
  }

  /**
   * Log a chat analytics event
   */
  async logChatEvent(
    eventType: ChatHistoryEntry['eventType'],
    messageType: 'user' | 'ai' | null = null,
    messageText: string = '',
    messageLength: number = 0,
    responseTime: number | null = null,
    metadata: ChatHistoryEntry['metadata'] = null
  ): Promise<void> {
    console.log('Firebase Analytics: logChatEvent called with:', {
      eventType,
      messageType,
      messageText,
      userId: this.currentUserId,
      sessionId: this.currentSessionId,
      chatHistoryRef: this.chatHistoryRef
    })
    
    if (!this.currentUserId || !this.currentSessionId || !this.chatHistoryRef) {
      console.warn('Analytics: User ID, Session ID, or Chat History Ref not set', {
        userId: this.currentUserId,
        sessionId: this.currentSessionId,
        chatHistoryRef: this.chatHistoryRef
      })
      return
    }

    try {
      const event: ChatHistoryEntry = {
        userId: this.currentUserId!,
        sessionId: this.currentSessionId!,
        eventType,
        messageType: messageType || null,
        messageText: messageText || '',
        messageLength: messageLength || 0,
        responseTime: responseTime || null,
        timestamp: Timestamp.fromDate(new Date()),
        metadata: metadata || null
      }

      console.log('Firebase Analytics: Logging chat event:', event)
      console.log('Firebase Analytics: Event messageText:', event.messageText)
      console.log('Firebase Analytics: Event messageType:', event.messageType)

      // Get current document to update totalMessages
      const currentDoc = await getDoc(this.chatHistoryRef)
      const currentData = currentDoc.data() as ChatHistoryDocument | undefined
      const currentTotal = currentData?.totalMessages || 0

      console.log('Firebase Analytics: Current document data:', currentData)
      console.log('Firebase Analytics: Current total messages:', currentTotal)

      // Add event to the history array
      await updateDoc(this.chatHistoryRef, {
        history: arrayUnion(event),
        updatedAt: serverTimestamp() as Timestamp,
        totalMessages: currentTotal + 1
      })
      
      console.log('Firebase Analytics: Event logged successfully')
      
      // Verify the update by reading the document again
      const updatedDoc = await getDoc(this.chatHistoryRef)
      const updatedData = updatedDoc.data() as ChatHistoryDocument | undefined
      console.log('Firebase Analytics: Updated document data:', updatedData)
      console.log('Firebase Analytics: History array length:', updatedData?.history?.length || 0)
      if (updatedData?.history && updatedData.history.length > 0) {
        const lastEvent = updatedData.history[updatedData.history.length - 1]
        console.log('Firebase Analytics: Last event in history:', lastEvent)
        console.log('Firebase Analytics: Last event messageText:', lastEvent.messageText)
      }
    } catch (error) {
      console.error('Firebase Analytics: Failed to log chat analytics event:', error)
    }
  }

  /**
   * Log a user interaction event
   */
  async logUserInteraction(
    eventType: UserInteractionEvent['eventType'],
    elementId?: string,
    elementType?: string,
    metadata?: UserInteractionEvent['metadata']
  ): Promise<void> {
    if (!this.currentUserId || !this.currentSessionId) {
      console.warn('Analytics: User ID or Session ID not set')
      return
    }

    try {
      const event: Omit<UserInteractionEvent, 'id'> = {
        userId: this.currentUserId,
        sessionId: this.currentSessionId,
        eventType,
        elementId: elementId || null,
        elementType: elementType || null,
        timestamp: Timestamp.fromDate(new Date()),
        metadata: metadata || null
      }

      await addDoc(collection(db, 'userInteractions'), event)
    } catch (error) {
      console.warn('Failed to log user interaction event:', error)
    }
  }

  /**
   * Log a health data query event
   */
  async logHealthDataQuery(
    query: string,
    translatedQuery: any,
    healthAnalysis: any,
    responseTime: number,
    metadata?: HealthDataQueryEvent['metadata']
  ): Promise<void> {
    if (!this.currentUserId || !this.currentSessionId) {
      console.warn('Analytics: User ID or Session ID not set')
      return
    }

    try {
      const event: Omit<HealthDataQueryEvent, 'id'> = {
        userId: this.currentUserId,
        sessionId: this.currentSessionId,
        query,
        translatedQuery,
        healthAnalysis,
        responseTime,
        timestamp: Timestamp.fromDate(new Date()),
        metadata: metadata || null
      }

      await addDoc(collection(db, 'healthDataQueries'), event)
    } catch (error) {
      console.warn('Failed to log health data query event:', error)
    }
  }

  /**
   * Log message sent event
   */
  async logMessageSent(message: string, metadata?: ChatHistoryEntry['metadata']): Promise<void> {
    console.log('Firebase Analytics: Logging user message:', message)
    await this.logChatEvent(
      'message_sent',
      'user',
      message,
      message.length,
      null,
      metadata || null
    )
  }

  /**
   * Log message received event
   */
  async logMessageReceived(
    message: string, 
    responseTime: number, 
    metadata?: ChatHistoryEntry['metadata']
  ): Promise<void> {
    console.log('Firebase Analytics: Logging AI message:', message)
    await this.logChatEvent(
      'message_received',
      'ai',
      message,
      message.length,
      responseTime,
      metadata || null
    )
  }

  /**
   * Log error event
   */
  async logError(
    errorMessage: string,
    errorType: string,
    context?: string
  ): Promise<void> {
    await this.logChatEvent(
      'message_received',
      'ai',
      `Error: ${errorMessage}`,
      errorMessage.length,
      null,
      {
        errorOccurred: true,
        errorMessage: `${errorType}: ${errorMessage}`,
        ...(context && { context })
      }
    )
  }

  /**
   * Get session duration in milliseconds
   */
  getSessionDuration(): number | null {
    if (!this.sessionStartTime) return null
    return Date.now() - this.sessionStartTime.getTime()
  }

  /**
   * Get current session info
   */
  getCurrentSession(): { userId: string | null; sessionId: string | null; duration: number | null } {
    return {
      userId: this.currentUserId,
      sessionId: this.currentSessionId,
      duration: this.getSessionDuration()
    }
  }

  /**
   * Check if analytics service is ready
   */
  isReady(): boolean {
    return !!(this.currentUserId && this.currentSessionId && this.chatHistoryRef)
  }
}
