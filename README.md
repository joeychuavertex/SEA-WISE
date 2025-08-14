# SEA-WISE Health Connector

A modern Vue.js application that displays health statistics with a demo mode for testing.

## Setup

### Prerequisites
- Node.js 16+ and npm

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
cp .template .env
```

4. Start the development server:
```bash
npm run dev
```

## Usage

The app runs in demo mode by default, displaying simulated health data including:
- Steps
- Calories burned
- Active minutes
- Heart rate

## Development

- **Build**: `npm run build`
- **Preview**: `npm run preview`

## Project Structure

```
src/
├── components/          # Vue components
├── services/           # Data services
└── App.vue            # Main application
```

## License

MIT License
