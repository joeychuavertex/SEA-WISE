# Firebase Analytics Setup Guide

This guide will help you set up Firebase for analytics data collection in your SEA-WISE health chat application.

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "sea-wise-analytics")
4. Follow the setup wizard steps
5. Enable Google Analytics (recommended for better insights)

## 2. Add a Web App to Your Project

1. In your Firebase project, click the web icon (`</>`)
2. Register your app with a nickname (e.g., "sea-wise-web")
3. Copy the Firebase configuration object

## 3. Configure Environment Variables

1. Copy the `env.example` file to `.env` in your project root:
   ```bash
   cp env.example .env
   ```

2. Update the `.env` file with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your-app-id
   ```

## 4. Set Up Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database
5. Click "Done"

## 5. Configure Firestore Security Rules

For development, you can use these permissive rules (update for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ Important**: These rules allow anyone to read/write your database. For production, implement proper authentication and authorization rules.

## 6. Analytics Collections

The application will automatically create these collections in Firestore:

- `chathistory` - Main collection for chat history with the following structure:
  - Document ID: `{userId}_{sessionId}`
  - Fields:
    - `history` (array) - Array of chat events and messages
    - `userId` (string) - User identifier
    - `sessionId` (string) - Session identifier
    - `createdAt` (timestamp) - Document creation time
    - `updatedAt` (timestamp) - Last update time
    - `totalMessages` (number) - Total number of messages in the session
- `userInteractions` - User interaction events (clicks, focus, etc.)
- `healthDataQueries` - Detailed health data query analytics

## 7. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the chat interface and send a message
3. Check your Firestore database to see the analytics data being collected

## 8. Analytics Data Structure

### Chat History Document Structure
```typescript
{
  history: ChatHistoryEntry[]
  userId: string
  sessionId: string
  createdAt: Timestamp
  updatedAt: Timestamp
  totalMessages: number
}
```

### Chat History Entry (within history array)
```typescript
{
  userId: string
  sessionId: string
  eventType: 'message_sent' | 'message_received' | 'session_started' | 'session_ended'
  messageType?: 'user' | 'ai'
  messageText: string
  messageLength?: number
  responseTime?: number
  timestamp: Timestamp
  metadata?: {
    language?: string
    queryType?: string
    dataType?: string
    timeRange?: string
    errorOccurred?: boolean
    errorMessage?: string
  }
}
```

### User Interaction Events
```typescript
{
  userId: string
  sessionId: string
  eventType: 'button_click' | 'input_focus' | 'input_blur' | 'scroll' | 'resize'
  elementId?: string
  elementType?: string
  timestamp: Timestamp
  metadata?: {
    value?: string
    position?: { x: number; y: number }
    viewportSize?: { width: number; height: number }
  }
}
```

### Health Data Query Events
```typescript
{
  userId: string
  sessionId: string
  query: string
  translatedQuery: any
  healthAnalysis: any
  responseTime: number
  timestamp: Timestamp
  metadata?: {
    dataSource?: string
    dataTypes?: string[]
    processingTime?: number
    modelVersion?: string
  }
}
```

## 9. Production Considerations

1. **Authentication**: Implement proper user authentication
2. **Security Rules**: Update Firestore rules to restrict access based on user authentication
3. **Data Privacy**: Ensure compliance with privacy regulations (GDPR, CCPA, etc.)
4. **Data Retention**: Set up data retention policies
5. **Monitoring**: Set up Firebase monitoring and alerts
6. **Backup**: Configure regular backups of your Firestore data

## 10. Analytics Dashboard

You can create custom dashboards in Firebase Console or export data to other analytics platforms like Google Analytics, BigQuery, or custom dashboards.

## Troubleshooting

- **Permission denied**: Check your Firestore security rules
- **Configuration errors**: Verify your environment variables are correct
- **Network errors**: Check your internet connection and Firebase project status
- **Data not appearing**: Check the browser console for error messages

## Support

For issues with this integration, check the browser console for error messages and ensure your Firebase configuration is correct.
