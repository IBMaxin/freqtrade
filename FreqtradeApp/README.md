# Freqtrade Full Stack Application

A comprehensive web-based interface for managing Freqtrade trading bots with AI-powered strategy generation.

## Features

- 📊 **Dashboard**: Real-time trading metrics and performance monitoring
- 🤖 **AI Strategy Wizard**: Generate trading strategies using OpenAI
- 📈 **Backtesting**: Test strategies against historical data
- 🎯 **Strategy Editor**: Create and modify trading strategies
- 🔧 **Bot Control**: Start, stop, and configure your Freqtrade bot
- 📱 **Real-time Updates**: WebSocket-powered live data
- 🚨 **Alerts**: Custom notifications for trading events
- 📊 **Data Management**: Download and manage historical market data

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **shadcn/ui** for UI components
- **React Query** for data fetching
- **Recharts** for data visualization
- **Wouter** for routing

### Backend
- **Node.js** with TypeScript
- **Express.js** for API server
- **WebSocket** for real-time communication
- **Drizzle ORM** with PostgreSQL
- **OpenAI API** for AI strategy generation
- **Freqtrade API** integration

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Freqtrade bot running with API enabled
- OpenAI API key (optional, for AI features)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd freqtrade-fullstack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the `.env` file and update the values:
   ```bash
   # OpenAI API Key for AI strategy generation
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Database connection string (PostgreSQL)
   DATABASE_URL=postgresql://username:password@localhost:5432/freqtrade_db
   
   # Freqtrade API Configuration
   FREQTRADE_API_URL=http://localhost:8080
   FREQTRADE_USERNAME=freqtrader
   FREQTRADE_PASSWORD=password
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

4. **Set up the database**
   
   Create a PostgreSQL database and run migrations:
   ```bash
   npm run db:push
   ```

5. **Configure Freqtrade**
   
   Ensure your Freqtrade bot is configured with API access. Add to your `config.json`:
   ```json
   {
     "api_server": {
       "enabled": true,
       "listen_ip_address": "0.0.0.0",
       "listen_port": 8080,
       "verbosity": "error",
       "enable_openapi": true,
       "jwt_secret_key": "your-secret-key",
       "CORS_origins": ["http://localhost:5000"],
       "username": "freqtrader",
       "password": "password"
     }
   }
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```
This starts both the frontend and backend in development mode with hot reloading.

### Production Mode
```bash
npm run build
npm start
```

The application will be available at `http://localhost:5000`

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Backend Node.js application
│   ├── services/           # Business logic services
│   │   ├── freqtrade.ts    # Freqtrade API integration
│   │   └── openai.ts       # OpenAI API integration
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database operations
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
└── migrations/             # Database migrations
```

## API Endpoints

### Dashboard
- `GET /api/dashboard/metrics` - Get trading metrics
- `GET /api/dashboard/recent-trades` - Get recent trades

### Strategies
- `GET /api/strategies` - List all strategies
- `POST /api/strategies` - Create new strategy
- `PUT /api/strategies/:id` - Update strategy
- `DELETE /api/strategies/:id` - Delete strategy

### AI Features
- `POST /api/ai/generate-strategy` - Generate strategy with AI
- `POST /api/ai/analyze-market` - Get market analysis
- `POST /api/ai/optimize-strategy` - Optimize existing strategy

### Freqtrade Integration
- `GET /api/freqtrade/status` - Get bot status
- `GET /api/freqtrade/balance` - Get account balance
- `GET /api/freqtrade/trades` - Get trade history
- `POST /api/freqtrade/start` - Start the bot
- `POST /api/freqtrade/stop` - Stop the bot
- `GET /api/freqtrade/profit` - Get profit data
- `GET /api/freqtrade/performance` - Get performance metrics

### Backtesting
- `POST /api/backtest/start` - Start backtest
- `GET /api/backtest/status` - Get backtest status
- `GET /api/backtest/result` - Get backtest results

## WebSocket Events

The application uses WebSocket for real-time updates:

- `strategy_created` - New strategy created
- `strategy_updated` - Strategy updated
- `backtest_started` - Backtest started
- `bot_started` - Bot started
- `bot_stopped` - Bot stopped
- `new_alert` - New alert created

## Development

### Database Schema Changes
When modifying the database schema in `shared/schema.ts`, run:
```bash
npm run db:push
```

### Adding New Features
1. Update the database schema if needed
2. Add API routes in `server/routes.ts`
3. Create frontend components in `client/src/components/`
4. Add pages in `client/src/pages/`

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env file
   - Verify database exists and credentials are correct

2. **Freqtrade API Connection Error**
   - Ensure Freqtrade bot is running
   - Check FREQTRADE_API_URL in .env file
   - Verify API is enabled in Freqtrade config

3. **OpenAI API Error**
   - Check OPENAI_API_KEY in .env file
   - Ensure you have sufficient API credits

### Logs
Check the console output for detailed error messages and API request logs.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.