# FreqtradeApp Local Setup Guide

This guide will help you set up the FreqtradeApp for local development.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

## Setup Steps

### 1. Install Dependencies
```bash
cd FreqtradeApp
npm install
```

### 2. Set up Environment Variables
```bash
cp .env.example .env
# Edit .env file with your specific configurations
```

### 3. Set up PostgreSQL Database
```bash
# Start PostgreSQL service
sudo systemctl start postgresql

# Create user and database
sudo -u postgres createuser -s freqtrade
sudo -u postgres createdb freqtrade_db -O freqtrade
sudo -u postgres psql -c "ALTER USER freqtrade PASSWORD 'password';"
```

### 4. Initialize Database Schema
```bash
npm run db:push
```

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Troubleshooting

### Common Issues

1. **tsx command not found**: Run `npm install` to ensure all dependencies are installed
2. **Database connection error**: Ensure PostgreSQL is running and credentials are correct
3. **Port already in use**: Change the PORT in .env file or kill the process using the port

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment mode (development/production)
- `OPENAI_API_KEY`: Optional for AI features
- `FREQTRADE_API_URL`: Freqtrade bot API endpoint

## Development

The application consists of:
- **Frontend**: React + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: WebSocket for live updates

API endpoints are available at `/api/*` and the frontend is served from the root.