# Deployment Checklist

## Pre-deployment Setup

### 1. Environment Configuration
- [ ] Set up PostgreSQL database
- [ ] Configure DATABASE_URL in .env
- [ ] Set up Freqtrade bot with API enabled
- [ ] Configure FREQTRADE_API_URL, USERNAME, PASSWORD in .env
- [ ] Add OpenAI API key (optional, for AI features)

### 2. Database Setup
```bash
npm run db:push
```

### 3. Test the Application
```bash
npm run test
```

## Development Deployment

### Start Development Server
```bash
npm run dev
```
- Frontend: React with Vite hot reloading
- Backend: Node.js with tsx for TypeScript execution
- WebSocket: Real-time updates enabled
- Access: http://localhost:5000

## Production Deployment

### 1. Build the Application
```bash
npm run build
```

### 2. Start Production Server
```bash
npm start
```

### 3. Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@host:port/db
FREQTRADE_API_URL=http://your-freqtrade-host:8080
FREQTRADE_USERNAME=your_username
FREQTRADE_PASSWORD=your_password
OPENAI_API_KEY=your_openai_key
```

## Docker Deployment (Optional)

### Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

### Build and Run
```bash
docker build -t freqtrade-app .
docker run -p 5000:5000 --env-file .env freqtrade-app
```

## Monitoring and Maintenance

### Health Checks
- [ ] API endpoints responding
- [ ] WebSocket connections working
- [ ] Database connectivity
- [ ] Freqtrade API integration
- [ ] OpenAI API integration (if used)

### Logs
- Server logs available in console
- API request/response logging enabled
- WebSocket connection logs

### Performance
- [ ] Database queries optimized
- [ ] API response times acceptable
- [ ] WebSocket message handling efficient
- [ ] Frontend bundle size optimized

## Security Considerations

### Production Security
- [ ] Use HTTPS in production
- [ ] Secure database connections
- [ ] Environment variables properly secured
- [ ] API rate limiting implemented
- [ ] CORS properly configured
- [ ] Authentication/authorization (if needed)

### Freqtrade Security
- [ ] Freqtrade API secured with strong credentials
- [ ] Network access restricted to application server
- [ ] Regular security updates

## Backup and Recovery

### Database Backups
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Configuration Backups
- [ ] .env file backed up securely
- [ ] Freqtrade configuration backed up
- [ ] Application configuration documented

## Troubleshooting

### Common Issues
1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify PostgreSQL is running
   - Check network connectivity

2. **Freqtrade API Connection Failed**
   - Verify Freqtrade bot is running
   - Check API configuration in Freqtrade
   - Verify network connectivity

3. **OpenAI API Errors**
   - Check API key validity
   - Verify API quota/credits
   - Check network connectivity

4. **WebSocket Connection Issues**
   - Check server is running
   - Verify WebSocket endpoint
   - Check firewall/proxy settings

### Debug Commands
```bash
# Check server status
curl http://localhost:5000/api/dashboard/metrics

# Test Freqtrade connection
curl http://localhost:5000/api/freqtrade/ping

# Check WebSocket
# Use browser dev tools or WebSocket client

# Database connection test
npm run db:push
```

## Post-Deployment Verification

### Functional Tests
- [ ] Dashboard loads and displays data
- [ ] Strategy creation/editing works
- [ ] Backtesting functionality works
- [ ] AI wizard generates strategies (if OpenAI configured)
- [ ] Bot control functions work
- [ ] Real-time updates via WebSocket
- [ ] Alerts system functions

### Performance Tests
- [ ] Page load times acceptable
- [ ] API response times under 2 seconds
- [ ] WebSocket messages delivered promptly
- [ ] Database queries perform well under load

## Maintenance Tasks

### Regular Maintenance
- [ ] Update dependencies monthly
- [ ] Monitor database performance
- [ ] Review and rotate API keys
- [ ] Check log files for errors
- [ ] Monitor disk space usage
- [ ] Backup database regularly

### Updates
- [ ] Test updates in development first
- [ ] Plan maintenance windows
- [ ] Have rollback plan ready
- [ ] Update documentation as needed