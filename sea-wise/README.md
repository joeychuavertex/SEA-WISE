# SEA-WISE Health Connector

A modern Vue.js application that connects to health devices and displays health statistics. Currently supports Google Fit integration with a demo mode for testing.

## Features

- 🔗 **Google Fit Integration**: Connect to your Google Fit account to sync real health data
- 📊 **Health Data Display**: View steps, calories, active minutes, and heart rate
- 🎯 **Demo Mode**: Test the app with simulated health data when Google Fit is not configured
- 🎨 **Modern UI**: Beautiful, responsive interface with glassmorphism design
- ⚡ **Real-time Updates**: Automatic data syncing and refresh capabilities

## Health Data Supported

- **Steps**: Daily step count from fitness trackers
- **Calories**: Calories burned through activities
- **Active Minutes**: Minutes of moderate to vigorous activity
- **Heart Rate**: Latest heart rate readings (when available)

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- Google Cloud Console account (for Google Fit integration)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sea-wise
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

4. Configure Google Fit API (optional):
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Fitness API
   - Create OAuth 2.0 credentials
   - Add your domain to authorized origins
   - Update `.env` with your credentials

5. Start the development server:
```bash
npm run dev
```

## Google Fit Setup

### 1. Create Google Cloud Project

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing (required for API usage)

### 2. Enable Fitness API

1. Go to "APIs & Services" > "Library"
2. Search for "Fitness API"
3. Click "Enable"

### 3. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add authorized origins:
   - `http://localhost:5173` (development)
   - `http://localhost:3000` (if using different port)
   - Your production domain
5. Add authorized redirect URIs:
   - `http://localhost:5173/oauth-callback`
   - Your production callback URL

### 4. Update Environment Variables

```bash
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_API_KEY=your_api_key_here
```

## Demo Mode

When Google Fit is not configured, the app automatically switches to demo mode. Demo mode:

- Generates realistic health data based on time of day
- Simulates real-time updates
- Perfect for testing and development
- No external API calls required

## Usage

### Connecting to Health Device

1. Click the "Connect" button
2. If using Google Fit:
   - Sign in to your Google account
   - Grant permission to access fitness data
   - Wait for authentication to complete
3. If using demo mode:
   - Connection happens instantly
   - Sample data is generated automatically

### Viewing Health Data

Once connected, you'll see:
- **Connection Status**: Shows current connection state
- **Health Metrics**: Cards displaying your health data
- **Sync Button**: Manually refresh data when needed

### Disconnecting

Click the "Disconnect" button to:
- Remove access to health data
- Clear stored tokens
- Return to disconnected state

## Development

### Project Structure

```
src/
├── components/
│   ├── HealthConnector.vue    # Main health connector component
│   └── OAuthCallback.vue      # OAuth callback handler
├── services/
│   ├── GoogleFitService.ts    # Google Fit API integration
│   └── DemoHealthService.ts   # Demo mode simulation
└── App.vue                    # Main application component
```

### Adding New Health Data Types

1. Update the `HealthData` interface in `GoogleFitService.ts`
2. Add new data fetching methods
3. Update the UI components to display the new data
4. Add appropriate error handling

### Customizing the UI

The app uses CSS custom properties and modern CSS features:
- Glassmorphism design with backdrop filters
- Responsive grid layouts
- Smooth animations and transitions
- Mobile-first responsive design

## API Reference

### Google Fit Service

- `connect()`: Initiate OAuth2 flow
- `disconnect()`: Remove access and clear tokens
- `getHealthData()`: Fetch current health metrics
- `isConnected()`: Check connection status

### Demo Service

- `connect()`: Enable demo mode
- `disconnect()`: Disable demo mode
- `getHealthData()`: Get simulated health data

## Troubleshooting

### Common Issues

1. **"Google Client ID not configured"**
   - Check your `.env` file
   - Ensure `VITE_GOOGLE_CLIENT_ID` is set

2. **OAuth popup blocked**
   - Allow popups for your domain
   - Check browser popup blocker settings

3. **"Failed to connect" error**
   - Verify Google Cloud Console setup
   - Check authorized origins and redirect URIs
   - Ensure Fitness API is enabled

4. **No health data displayed**
   - Check if device is syncing to Google Fit
   - Verify API permissions
   - Try manual sync button

### Debug Mode

Enable debug logging by setting:
```bash
VITE_DEBUG=true
```

## Security Considerations

- OAuth2 tokens are stored in localStorage (consider more secure storage for production)
- API calls use HTTPS
- No health data is stored on the server
- Demo mode generates fake data only

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the troubleshooting section
- Review Google Fit API documentation
- Open an issue on GitHub

---

**Note**: This app is designed for educational and development purposes. For production health applications, ensure compliance with relevant health data regulations (HIPAA, GDPR, etc.).
