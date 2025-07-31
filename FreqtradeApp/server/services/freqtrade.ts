import axios, { AxiosInstance } from 'axios';

export interface FreqtradeConfig {
  baseUrl: string;
  username: string;
  password: string;
}

export interface FreqtradeStatus {
  state: string;
  trade_count: number;
  runmode: string;
  dry_run: boolean;
  strategy: string;
}

export interface FreqtradeBalance {
  currencies: Record<string, {
    free: number;
    used: number;
    total: number;
  }>;
  total: number;
  symbol: string;
}

export interface FreqtradeTrade {
  trade_id: number;
  pair: string;
  is_open: boolean;
  amount: number;
  stake_amount: number;
  profit_pct: number;
  profit_abs: number;
  open_date: string;
  close_date?: string;
}

export interface BacktestRequest {
  strategy: string;
  timerange?: string;
  timeframe?: string;
  enable_protections?: boolean;
  dry_run_wallet?: number;
}

export interface BacktestResult {
  strategy: string;
  profit_total: number;
  profit_total_abs: number;
  trade_count: number;
  winrate: number;
  max_drawdown: number;
  sharpe: number;
  trades: any[];
}

export interface HyperoptRequest {
  strategy: string;
  epochs: number;
  timerange?: string;
  spaces?: string[];
}

export interface ProfitData {
  profit_closed_coin: number;
  profit_closed_percent: number;
  profit_closed_fiat: number;
  profit_all_coin: number;
  profit_all_percent: number;
  profit_all_fiat: number;
  trade_count: number;
  closed_trade_count: number;
  first_trade_date: string;
  first_trade_timestamp: number;
  latest_trade_date: string;
  latest_trade_timestamp: number;
  avg_duration: string;
  best_pair: string;
  best_rate: number;
  winning_trades: number;
  losing_trades: number;
}

export interface PerformanceData {
  pair: string;
  profit: number;
  profit_pct: number;
  count: number;
}

export class FreqtradeService {
  private client: AxiosInstance;
  private config: FreqtradeConfig;

  constructor(config: FreqtradeConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: `${config.baseUrl}/api/v1`,
      timeout: 30000,
      auth: {
        username: config.username,
        password: config.password,
      },
    });
  }

  async ping(): Promise<{ status: string }> {
    try {
      const response = await this.client.get('/ping');
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Ping failed with status ${error.response.status}: ${error.response.data}`);
      }
      throw new Error(`Failed to ping Freqtrade: ${error.message}`);
    }
  }

  async getStatus(): Promise<FreqtradeStatus> {
    try {
      const response = await this.client.get('/status');
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Status retrieval failed with status ${error.response.status}: ${error.response.data}`);
      }
      throw new Error(`Failed to get status: ${error.message}`);
    }
  }

  async getBalance(): Promise<FreqtradeBalance> {
    try {
      const response = await this.client.get('/balance');
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  async getTrades(limit?: number): Promise<FreqtradeTrade[]> {
    try {
      const params = limit ? { limit } : {};
      const response = await this.client.get('/trades', { params });
      return response.data.trades || [];
    } catch (error: any) {
      throw new Error(`Failed to get trades: ${error.message}`);
    }
  }

  async getOpenTrades(): Promise<FreqtradeTrade[]> {
    try {
      const response = await this.client.get('/trades');
      const trades = response.data.trades || [];
      return trades.filter((trade: FreqtradeTrade) => trade.is_open);
    } catch (error: any) {
      throw new Error(`Failed to get open trades: ${error.message}`);
    }
  }

  async getStrategies(): Promise<string[]> {
    try {
      const response = await this.client.get('/strategies');
      return response.data.strategies || [];
    } catch (error: any) {
      throw new Error(`Failed to get strategies: ${error.message}`);
    }
  }

  async getAvailablePairs(timeframe?: string, stakeCurrency?: string): Promise<string[]> {
    try {
      const params: any = {};
      if (timeframe) params.timeframe = timeframe;
      if (stakeCurrency) params.stake_currency = stakeCurrency;
      
      const response = await this.client.get('/available_pairs', { params });
      return response.data.pairs || [];
    } catch (error: any) {
      throw new Error(`Failed to get available pairs: ${error.message}`);
    }
  }

  async startBacktest(request: BacktestRequest): Promise<{ status: string }> {
    try {
      const response = await this.client.post('/backtest', request);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to start backtest: ${error.message}`);
    }
  }

  async getBacktestStatus(): Promise<{ status: string; running: boolean; step?: string; progress?: number }> {
    try {
      const response = await this.client.get('/backtest');
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get backtest status: ${error.message}`);
    }
  }

  async getBacktestResult(): Promise<BacktestResult> {
    try {
      const response = await this.client.get('/backtest');
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get backtest result: ${error.message}`);
    }
  }

  async stopBacktest(): Promise<{ status: string }> {
    try {
      const response = await this.client.delete('/backtest');
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to stop backtest: ${error.message}`);
    }
  }

  async startHyperopt(request: HyperoptRequest): Promise<{ status: string }> {
    try {
      const response = await this.client.post('/hyperopt', request);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to start hyperopt: ${error.message}`);
    }
  }

  async getHyperoptStatus(): Promise<{ status: string; running: boolean; current_epoch?: number; total_epochs?: number }> {
    try {
      const response = await this.client.get('/hyperopt');
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get hyperopt status: ${error.message}`);
    }
  }

  async stopHyperopt(): Promise<{ status: string }> {
    try {
      const response = await this.client.delete('/hyperopt');
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to stop hyperopt: ${error.message}`);
    }
  }

  async forceBuy(pair: string, price?: number): Promise<{ status: string; trade_id?: number }> {
    try {
      const data: any = { pair };
      if (price) data.price = price;
      
      const response = await this.client.post('/forcebuy', data);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to force buy: ${error.message}`);
    }
  }

  async forceSell(tradeId: number): Promise<{ status: string }> {
    try {
      const response = await this.client.post('/forcesell', { tradeid: tradeId });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to force sell: ${error.message}`);
    }
  }

  async downloadData(pairs: string[], timeframes: string[], days?: number): Promise<{ status: string }> {
    try {
      const data = {
        pairs,
        timeframes,
        days: days || 30,
      };
      
      const response = await this.client.post('/data/download', data);
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to download data: ${error.message}`);
    }
  }

  async startBot(): Promise<{ status: string }> {
    try {
      const response = await this.client.post('/start');
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to start bot: ${error.message}`);
    }
  }

  async stopBot(): Promise<{ status: string }> {
    try {
      const response = await this.client.post('/stop');
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to stop bot: ${error.message}`);
    }
  }

  async reloadConfig(): Promise<{ status: string }> {
    try {
      const response = await this.client.post('/reload_config');
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to reload config: ${error.message}`);
    }
  }

  async getProfit(): Promise<ProfitData> {
    try {
      const response = await this.client.get('/profit');
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get profit data: ${error.message}`);
    }
  }

  async getPerformance(): Promise<PerformanceData[]> {
    try {
      const response = await this.client.get('/performance');
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get performance data: ${error.message}`);
    }
  }

  async getDailyProfit(days?: number): Promise<any[]> {
    try {
      const params = days ? { timescale: days } : {};
      const response = await this.client.get('/daily', { params });
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(`Failed to get daily profit: ${error.message}`);
    }
  }

  async getLogs(limit?: number): Promise<any[]> {
    try {
      const params = limit ? { limit } : {};
      const response = await this.client.get('/logs', { params });
      return response.data.logs || [];
    } catch (error: any) {
      throw new Error(`Failed to get logs: ${error.message}`);
    }
  }
}

// Create service instance with environment configuration
export const freqtradeService = new FreqtradeService({
  baseUrl: process.env.FREQTRADE_API_URL || 'http://localhost:8080',
  username: process.env.FREQTRADE_USERNAME || 'freqtrader',
  password: process.env.FREQTRADE_PASSWORD || 'password',
});

// Export default for easier importing
export default freqtradeService;
