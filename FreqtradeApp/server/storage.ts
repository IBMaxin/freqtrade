import { type User, type InsertUser, type Strategy, type InsertStrategy, type Backtest, type InsertBacktest, type Trade, type InsertTrade, type Alert, type InsertAlert, type AiStrategy, type InsertAiStrategy } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Strategies
  getStrategies(userId?: string): Promise<Strategy[]>;
  getStrategy(id: string): Promise<Strategy | undefined>;
  createStrategy(strategy: InsertStrategy): Promise<Strategy>;
  updateStrategy(id: string, updates: Partial<Strategy>): Promise<Strategy | undefined>;
  deleteStrategy(id: string): Promise<boolean>;

  // Backtests
  getBacktests(strategyId?: string): Promise<Backtest[]>;
  getBacktest(id: string): Promise<Backtest | undefined>;
  createBacktest(backtest: InsertBacktest): Promise<Backtest>;
  updateBacktest(id: string, updates: Partial<Backtest>): Promise<Backtest | undefined>;

  // Trades
  getTrades(strategyId?: string, isOpen?: boolean): Promise<Trade[]>;
  getTrade(id: string): Promise<Trade | undefined>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  updateTrade(id: string, updates: Partial<Trade>): Promise<Trade | undefined>;

  // Alerts
  getAlerts(userId?: string, isRead?: boolean): Promise<Alert[]>;
  getAlert(id: string): Promise<Alert | undefined>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | undefined>;

  // AI Strategies
  getAiStrategies(userId?: string): Promise<AiStrategy[]>;
  getAiStrategy(id: string): Promise<AiStrategy | undefined>;
  createAiStrategy(aiStrategy: InsertAiStrategy): Promise<AiStrategy>;
  updateAiStrategy(id: string, updates: Partial<AiStrategy>): Promise<AiStrategy | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private strategies: Map<string, Strategy> = new Map();
  private backtests: Map<string, Backtest> = new Map();
  private trades: Map<string, Trade> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private aiStrategies: Map<string, AiStrategy> = new Map();

  constructor() {
    // Initialize with demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create demo user
    const demoUser: User = {
      id: "demo-user-1",
      username: "demo",
      password: "demo123",
      email: "demo@example.com",
      createdAt: new Date(),
    };
    this.users.set(demoUser.id, demoUser);

    // Create demo strategies
    const strategy1: Strategy = {
      id: "strategy-1",
      name: "RSI_MACD_v2",
      description: "RSI and MACD based strategy with dynamic thresholds",
      code: `# RSI MACD Strategy\nclass RSI_MACD_v2(IStrategy):\n    # Strategy implementation`,
      config: { rsi_period: 14, macd_fast: 12, macd_slow: 26 },
      isActive: true,
      userId: demoUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const strategy2: Strategy = {
      id: "strategy-2",
      name: "EMA_Cross_Pro",
      description: "EMA crossover strategy with volume confirmation",
      code: `# EMA Cross Strategy\nclass EMA_Cross_Pro(IStrategy):\n    # Strategy implementation`,
      config: { ema_fast: 12, ema_slow: 26, volume_threshold: 1.5 },
      isActive: true,
      userId: demoUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.strategies.set(strategy1.id, strategy1);
    this.strategies.set(strategy2.id, strategy2);

    // Create demo trades
    const trades = [
      { pair: "BTC/USDT", side: "sell", amount: 0.01, price: 45000, profit: 47.23, fee: 0.1 },
      { pair: "ETH/USDT", side: "sell", amount: 0.5, price: 3200, profit: 32.18, fee: 0.05 },
      { pair: "ADA/USDT", side: "sell", amount: 1000, price: 0.5, profit: -12.45, fee: 0.02 },
      { pair: "DOT/USDT", side: "buy", amount: 50, price: 25, profit: 28.91, fee: 0.03 },
      { pair: "SOL/USDT", side: "sell", amount: 10, price: 180, profit: 19.67, fee: 0.02 },
    ];

    trades.forEach((trade, index) => {
      const tradeRecord: Trade = {
        id: `trade-${index + 1}`,
        strategyId: index % 2 === 0 ? strategy1.id : strategy2.id,
        pair: trade.pair,
        side: trade.side,
        amount: trade.amount,
        price: trade.price,
        profit: trade.profit,
        fee: trade.fee,
        timestamp: new Date(Date.now() - (index * 5 * 60 * 1000)), // 5 minutes apart
        isOpen: false,
      };
      this.trades.set(tradeRecord.id, tradeRecord);
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  // Strategies
  async getStrategies(userId?: string): Promise<Strategy[]> {
    const strategies = Array.from(this.strategies.values());
    return userId ? strategies.filter(s => s.userId === userId) : strategies;
  }

  async getStrategy(id: string): Promise<Strategy | undefined> {
    return this.strategies.get(id);
  }

  async createStrategy(insertStrategy: InsertStrategy): Promise<Strategy> {
    const id = randomUUID();
    const strategy: Strategy = { 
      ...insertStrategy, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.strategies.set(id, strategy);
    return strategy;
  }

  async updateStrategy(id: string, updates: Partial<Strategy>): Promise<Strategy | undefined> {
    const strategy = this.strategies.get(id);
    if (!strategy) return undefined;
    
    const updated = { ...strategy, ...updates, updatedAt: new Date() };
    this.strategies.set(id, updated);
    return updated;
  }

  async deleteStrategy(id: string): Promise<boolean> {
    return this.strategies.delete(id);
  }

  // Backtests
  async getBacktests(strategyId?: string): Promise<Backtest[]> {
    const backtests = Array.from(this.backtests.values());
    return strategyId ? backtests.filter(b => b.strategyId === strategyId) : backtests;
  }

  async getBacktest(id: string): Promise<Backtest | undefined> {
    return this.backtests.get(id);
  }

  async createBacktest(insertBacktest: InsertBacktest): Promise<Backtest> {
    const id = randomUUID();
    const backtest: Backtest = { ...insertBacktest, id, createdAt: new Date() };
    this.backtests.set(id, backtest);
    return backtest;
  }

  async updateBacktest(id: string, updates: Partial<Backtest>): Promise<Backtest | undefined> {
    const backtest = this.backtests.get(id);
    if (!backtest) return undefined;
    
    const updated = { ...backtest, ...updates };
    this.backtests.set(id, updated);
    return updated;
  }

  // Trades
  async getTrades(strategyId?: string, isOpen?: boolean): Promise<Trade[]> {
    let trades = Array.from(this.trades.values());
    if (strategyId) trades = trades.filter(t => t.strategyId === strategyId);
    if (isOpen !== undefined) trades = trades.filter(t => t.isOpen === isOpen);
    return trades.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getTrade(id: string): Promise<Trade | undefined> {
    return this.trades.get(id);
  }

  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const id = randomUUID();
    const trade: Trade = { ...insertTrade, id, timestamp: new Date() };
    this.trades.set(id, trade);
    return trade;
  }

  async updateTrade(id: string, updates: Partial<Trade>): Promise<Trade | undefined> {
    const trade = this.trades.get(id);
    if (!trade) return undefined;
    
    const updated = { ...trade, ...updates };
    this.trades.set(id, updated);
    return updated;
  }

  // Alerts
  async getAlerts(userId?: string, isRead?: boolean): Promise<Alert[]> {
    let alerts = Array.from(this.alerts.values());
    if (userId) alerts = alerts.filter(a => a.userId === userId);
    if (isRead !== undefined) alerts = alerts.filter(a => a.isRead === isRead);
    return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getAlert(id: string): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = randomUUID();
    const alert: Alert = { ...insertAlert, id, createdAt: new Date() };
    this.alerts.set(id, alert);
    return alert;
  }

  async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const updated = { ...alert, ...updates };
    this.alerts.set(id, updated);
    return updated;
  }

  // AI Strategies
  async getAiStrategies(userId?: string): Promise<AiStrategy[]> {
    const aiStrategies = Array.from(this.aiStrategies.values());
    return userId ? aiStrategies.filter(s => s.userId === userId) : aiStrategies;
  }

  async getAiStrategy(id: string): Promise<AiStrategy | undefined> {
    return this.aiStrategies.get(id);
  }

  async createAiStrategy(insertAiStrategy: InsertAiStrategy): Promise<AiStrategy> {
    const id = randomUUID();
    const aiStrategy: AiStrategy = { ...insertAiStrategy, id, createdAt: new Date() };
    this.aiStrategies.set(id, aiStrategy);
    return aiStrategy;
  }

  async updateAiStrategy(id: string, updates: Partial<AiStrategy>): Promise<AiStrategy | undefined> {
    const aiStrategy = this.aiStrategies.get(id);
    if (!aiStrategy) return undefined;
    
    const updated = { ...aiStrategy, ...updates };
    this.aiStrategies.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
