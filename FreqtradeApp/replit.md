# replit.md

## Overview

This is a comprehensive trading bot platform built with React/TypeScript frontend and Node.js/Express backend, featuring AI-powered strategy generation through OpenAI integration. The application provides a complete trading ecosystem with real-time market data, backtesting capabilities, strategy management, and bot control interfaces.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom dark theme and trading-specific color variables
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Language**: TypeScript with ES modules
- **API**: RESTful API with WebSocket support for real-time updates
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: Connect-pg-simple for PostgreSQL session storage

### Database Schema
The application uses Drizzle ORM with PostgreSQL and includes the following main entities:
- **Users**: Authentication and user management
- **Strategies**: Trading strategy definitions with code and configuration
- **Backtests**: Historical testing results and performance metrics
- **Trades**: Individual trade records with profit/loss tracking
- **Alerts**: Notification system for trading events
- **AI Strategies**: AI-generated trading strategies with metadata

## Key Components

### Trading Engine Integration
- **FreqTrade Integration**: Complete API wrapper for FreqTrade bot management
- **Real-time Data**: WebSocket connections for live trading updates
- **Bot Control**: Start/stop trading, force buy/sell operations, strategy switching

### AI Strategy Generation
- **OpenAI Integration**: GPT-4 powered strategy generation based on market conditions
- **Strategy Wizard**: Step-by-step interface for creating AI-generated strategies
- **Market Analysis**: AI-powered market sentiment and technical analysis

### Data Management
- **Historical Data**: Download and manage market data for backtesting
- **Multiple Exchanges**: Support for various cryptocurrency exchanges
- **Data Validation**: Comprehensive data integrity checks

### User Interface
- **Dashboard**: Real-time metrics, performance charts, and quick actions
- **Strategy Editor**: Code editor for custom strategy development
- **Backtesting Interface**: Visual backtesting results with performance metrics
- **Alert System**: Configurable notifications for trading events

## Data Flow

1. **User Authentication**: Session-based authentication with PostgreSQL storage
2. **Strategy Creation**: Users create strategies manually or via AI wizard
3. **Backtesting**: Strategies are tested against historical data via FreqTrade
4. **Live Trading**: Approved strategies are deployed to FreqTrade bot
5. **Real-time Updates**: WebSocket connections provide live trading data
6. **Performance Tracking**: All trades and metrics are stored in PostgreSQL

## External Dependencies

### Core Services
- **OpenAI API**: Strategy generation and market analysis
- **FreqTrade**: Trading bot execution and market data
- **PostgreSQL**: Primary database for all application data
- **WebSocket**: Real-time communication between client and server

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **ESBuild**: Production build optimization
- **Vite**: Development server with hot module replacement

## Deployment Strategy

### Development Environment
- Uses Vite dev server with middleware mode for seamless frontend/backend integration
- Hot module replacement for rapid development
- TypeScript compilation with strict type checking
- WebSocket support for real-time features

### Production Build
- Frontend: Vite build outputs to `dist/public`
- Backend: ESBuild bundles server code to `dist/index.js`
- Static file serving integrated into Express server
- Environment variable configuration for database and API keys

### Database Management
- Drizzle migrations stored in `./migrations` directory
- Schema definitions in `shared/schema.ts` for type sharing
- Database URL configuration via environment variables
- Automatic UUID generation for primary keys

The application follows a monorepo structure with shared TypeScript types between frontend and backend, ensuring type safety across the entire stack. The real-time trading features are built around WebSocket connections that automatically handle reconnection and provide live updates to the dashboard and trading interfaces.