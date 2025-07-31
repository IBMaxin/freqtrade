import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { freqtradeService } from "./services/freqtrade";
import { openaiService } from "./services/openai";
import { z } from "zod";
import { insertStrategySchema, insertBacktestSchema, insertTradeSchema, insertAlertSchema, insertAiStrategySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws'
  });

  // Store connected WebSocket clients
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('WebSocket client connected');

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('WebSocket message received:', message);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      console.log('WebSocket client disconnected');
    });
  });

  // Broadcast function for real-time updates
  function broadcast(message: any) {
    const payload = JSON.stringify(message);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  // Dashboard APIs
  app.get('/api/dashboard/metrics', async (req, res) => {
    try {
      // Get real data from Freqtrade
      let realData = {};
      try {
        const profit = await freqtradeService.getProfit();
        const trades = await freqtradeService.getTrades();
        const balance = await freqtradeService.getBalance();
        
        realData = {
          totalProfit: profit.profit_closed_coin || 0,
          activeTrades: trades.filter((t: any) => t.is_open).length,
          winRate: profit.winning_trades && profit.trade_count 
            ? (profit.winning_trades / profit.trade_count) * 100 
            : 0,
          totalTrades: profit.trade_count || 0,
          balance: balance.total || 0,
          currency: balance.symbol || 'USD'
        };
      } catch (freqtradeError) {
        console.log('Freqtrade not available, using fallback data:', freqtradeError.message);
      }

      // Fallback to local strategies for UI
      const strategies = await storage.getStrategies();
      const activeStrategies = strategies.filter(s => s.isActive);

      res.json({
        ...realData,
        activeStrategies: activeStrategies.length,
        strategies: activeStrategies
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/dashboard/recent-trades', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Try to get real trades from Freqtrade first
      try {
        const freqtradeTrades = await freqtradeService.getTrades(limit);
        
        // Format Freqtrade trades to match our interface
        const formattedTrades = freqtradeTrades.map((trade: any) => ({
          id: `ft-${trade.trade_id}`,
          strategyId: 'freqtrade-live',
          pair: trade.pair,
          side: trade.is_open ? 'open' : 'closed',
          amount: trade.amount,
          price: trade.open_rate || trade.close_rate,
          profit: trade.profit_abs || 0,
          fee: trade.fee_open + trade.fee_close || 0,
          timestamp: new Date(trade.open_date),
          isOpen: trade.is_open
        }));
        
        if (formattedTrades.length > 0) {
          return res.json(formattedTrades);
        }
      } catch (freqtradeError) {
        console.log('Freqtrade trades not available, using demo data:', freqtradeError.message);
      }
      
      // Fallback to demo data if no real trades
      const trades = await storage.getTrades();
      const recentTrades = trades.slice(0, limit);
      res.json(recentTrades);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Strategy APIs
  app.get('/api/strategies', async (req, res) => {
    try {
      const strategies = await storage.getStrategies();
      res.json(strategies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/strategies/:id', async (req, res) => {
    try {
      const strategy = await storage.getStrategy(req.params.id);
      if (!strategy) {
        return res.status(404).json({ error: 'Strategy not found' });
      }
      res.json(strategy);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/strategies', async (req, res) => {
    try {
      const validatedData = insertStrategySchema.parse(req.body);
      const strategy = await storage.createStrategy(validatedData);
      broadcast({ type: 'strategy_created', data: strategy });
      res.status(201).json(strategy);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put('/api/strategies/:id', async (req, res) => {
    try {
      const updates = req.body;
      const strategy = await storage.updateStrategy(req.params.id, updates);
      if (!strategy) {
        return res.status(404).json({ error: 'Strategy not found' });
      }
      broadcast({ type: 'strategy_updated', data: strategy });
      res.json(strategy);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/strategies/:id', async (req, res) => {
    try {
      const deleted = await storage.deleteStrategy(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Strategy not found' });
      }
      broadcast({ type: 'strategy_deleted', data: { id: req.params.id } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Strategy Generation APIs
  app.post('/api/ai/generate-strategy', async (req, res) => {
    try {
      const request = req.body;
      const result = await openaiService.generateTradingStrategy(request);
      
      // Save AI strategy to storage
      const aiStrategy = await storage.createAiStrategy({
        prompt: JSON.stringify(request),
        generatedCode: result.code,
        explanation: result.explanation,
        config: result.config,
        status: 'generated',
        userId: 'demo-user-1', // TODO: Get from authenticated user
      });

      res.json({ ...result, id: aiStrategy.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ai/analyze-market', async (req, res) => {
    try {
      const request = req.body;
      const analysis = await openaiService.analyzeMarket(request);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/ai/optimize-strategy', async (req, res) => {
    try {
      const { strategyCode, backtestResults } = req.body;
      const result = await openaiService.optimizeStrategy(strategyCode, backtestResults);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Freqtrade Integration APIs
  app.get('/api/freqtrade/status', async (req, res) => {
    try {
      const status = await freqtradeService.getStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/freqtrade/balance', async (req, res) => {
    try {
      const balance = await freqtradeService.getBalance();
      res.json(balance);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/freqtrade/trades', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const trades = await freqtradeService.getTrades(limit);
      res.json(trades);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/freqtrade/strategies', async (req, res) => {
    try {
      const strategies = await freqtradeService.getStrategies();
      res.json(strategies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/freqtrade/available-pairs', async (req, res) => {
    try {
      const { timeframe, stake_currency } = req.query;
      const pairs = await freqtradeService.getAvailablePairs(
        timeframe as string,
        stake_currency as string
      );
      res.json(pairs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Backtesting APIs
  app.post('/api/backtest/start', async (req, res) => {
    try {
      const request = req.body;
      const result = await freqtradeService.startBacktest(request);
      
      // Save backtest to storage
      const backtest = await storage.createBacktest({
        strategyId: request.strategyId,
        status: 'running',
        config: request,
      });

      broadcast({ type: 'backtest_started', data: backtest });
      res.json({ ...result, id: backtest.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/backtest/status', async (req, res) => {
    try {
      const status = await freqtradeService.getBacktestStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/backtest/result', async (req, res) => {
    try {
      const result = await freqtradeService.getBacktestResult();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/backtest/stop', async (req, res) => {
    try {
      const result = await freqtradeService.stopBacktest();
      broadcast({ type: 'backtest_stopped', data: result });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Hyperopt APIs
  app.post('/api/hyperopt/start', async (req, res) => {
    try {
      const request = req.body;
      const result = await freqtradeService.startHyperopt(request);
      broadcast({ type: 'hyperopt_started', data: result });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/hyperopt/status', async (req, res) => {
    try {
      const status = await freqtradeService.getHyperoptStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/hyperopt/stop', async (req, res) => {
    try {
      const result = await freqtradeService.stopHyperopt();
      broadcast({ type: 'hyperopt_stopped', data: result });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Data Management APIs
  app.post('/api/data/download', async (req, res) => {
    try {
      const { pairs, timeframes, days } = req.body;
      const result = await freqtradeService.downloadData(pairs, timeframes, days);
      broadcast({ type: 'data_download_started', data: result });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Trading Control APIs
  app.post('/api/trading/force-buy', async (req, res) => {
    try {
      const { pair, price } = req.body;
      const result = await freqtradeService.forceBuy(pair, price);
      broadcast({ type: 'force_buy', data: result });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/trading/force-sell', async (req, res) => {
    try {
      const { tradeId } = req.body;
      const result = await freqtradeService.forceSell(tradeId);
      broadcast({ type: 'force_sell', data: result });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bot Control APIs
  app.post('/api/freqtrade/start', async (req, res) => {
    try {
      const result = await freqtradeService.startBot();
      broadcast({ type: 'bot_started', data: result });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/freqtrade/stop', async (req, res) => {
    try {
      const result = await freqtradeService.stopBot();
      broadcast({ type: 'bot_stopped', data: result });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/freqtrade/reload-config', async (req, res) => {
    try {
      const result = await freqtradeService.reloadConfig();
      broadcast({ type: 'config_reloaded', data: result });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Performance and Analytics APIs
  app.get('/api/freqtrade/profit', async (req, res) => {
    try {
      const profit = await freqtradeService.getProfit();
      res.json(profit);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/freqtrade/performance', async (req, res) => {
    try {
      const performance = await freqtradeService.getPerformance();
      res.json(performance);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/freqtrade/daily-profit', async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : undefined;
      const dailyProfit = await freqtradeService.getDailyProfit(days);
      res.json(dailyProfit);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/freqtrade/logs', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const logs = await freqtradeService.getLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/freqtrade/open-trades', async (req, res) => {
    try {
      const openTrades = await freqtradeService.getOpenTrades();
      res.json(openTrades);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/freqtrade/ping', async (req, res) => {
    try {
      const ping = await freqtradeService.ping();
      res.json(ping);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Alerts APIs
  app.get('/api/alerts', async (req, res) => {
    try {
      const { isRead } = req.query;
      const alerts = await storage.getAlerts(
        'demo-user-1', // TODO: Get from authenticated user
        isRead ? isRead === 'true' : undefined
      );
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/alerts', async (req, res) => {
    try {
      const alertData = insertAlertSchema.parse({
        ...req.body,
        userId: 'demo-user-1' // TODO: Get from authenticated user
      });
      const alert = await storage.createAlert(alertData);
      broadcast({ type: 'new_alert', data: alert });
      res.status(201).json(alert);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put('/api/alerts/:id/read', async (req, res) => {
    try {
      const alert = await storage.updateAlert(req.params.id, { isRead: true });
      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
