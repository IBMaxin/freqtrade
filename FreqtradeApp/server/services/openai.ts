import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface StrategyGenerationRequest {
  marketConditions: string;
  tradingStyle: string;
  riskTolerance: string;
  timeframe: string;
  indicators?: string[];
  customRequirements?: string;
}

export interface StrategyGenerationResponse {
  code: string;
  explanation: string;
  config: Record<string, any>;
  backtest_params: {
    timerange: string;
    timeframe: string;
    stake_amount: number;
  };
  risk_management: {
    max_open_trades: number;
    stoploss: number;
    roi: Record<string, number>;
  };
}

export interface MarketAnalysisRequest {
  pairs: string[];
  timeframe: string;
  data?: any;
}

export interface MarketAnalysisResponse {
  analysis: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  recommendations: string[];
  key_levels: {
    support: number[];
    resistance: number[];
  };
}

export class OpenAIService {
  async generateTradingStrategy(request: StrategyGenerationRequest): Promise<StrategyGenerationResponse> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const prompt = this.buildStrategyPrompt(request);
        
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert quantitative trading strategy developer specializing in Freqtrade. You create profitable, well-tested trading strategies with proper risk management. Always respond with valid JSON containing the complete strategy code, explanation, and configuration."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 4000,
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        return this.validateStrategyResponse(result);
      } catch (error: any) {
        attempt++;
        if (attempt >= maxRetries) {
          throw new Error(`Failed to generate strategy after ${maxRetries} attempts: ${error.message}`);
        }
      }
    }

    throw new Error('Unexpected error in generateTradingStrategy');
  }

  async analyzeMarket(request: MarketAnalysisRequest): Promise<MarketAnalysisResponse> {
    try {
      const prompt = `Analyze the current market conditions for the following trading pairs: ${request.pairs.join(', ')} on ${request.timeframe} timeframe.

Provide a comprehensive market analysis including:
1. Overall market sentiment (bullish/bearish/neutral)
2. Confidence level (0-1)
3. Key support and resistance levels
4. Trading recommendations
5. Risk factors to consider

${request.data ? `Market data: ${JSON.stringify(request.data)}` : ''}

Respond with JSON in this format:
{
  "analysis": "detailed market analysis",
  "sentiment": "bullish|bearish|neutral",
  "confidence": 0.85,
  "recommendations": ["recommendation 1", "recommendation 2"],
  "key_levels": {
    "support": [price1, price2],
    "resistance": [price1, price2]
  }
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional crypto market analyst with expertise in technical analysis, market sentiment, and risk assessment."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 2000,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return this.validateMarketAnalysisResponse(result);
    } catch (error: any) {
      throw new Error(`Failed to analyze market: ${error.message}`);
    }
  }

  async optimizeStrategy(strategyCode: string, backtestResults: any): Promise<{ optimizedCode: string; explanation: string }> {
    try {
      const prompt = `Optimize the following Freqtrade strategy based on backtest results:

Strategy Code:
${strategyCode}

Backtest Results:
${JSON.stringify(backtestResults, null, 2)}

Analyze the performance and suggest improvements to:
1. Increase profitability
2. Reduce drawdown
3. Improve win rate
4. Better risk management

Respond with JSON containing the optimized code and explanation:
{
  "optimizedCode": "complete improved strategy code",
  "explanation": "detailed explanation of changes and expected improvements"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert in quantitative trading strategy optimization with deep knowledge of technical indicators, risk management, and backtesting analysis."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 3000,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error: any) {
      throw new Error(`Failed to optimize strategy: ${error.message}`);
    }
  }

  private buildStrategyPrompt(request: StrategyGenerationRequest): string {
    return `Create a professional Freqtrade trading strategy with the following requirements:

Market Conditions: ${request.marketConditions}
Trading Style: ${request.tradingStyle}
Risk Tolerance: ${request.riskTolerance}
Timeframe: ${request.timeframe}
${request.indicators ? `Preferred Indicators: ${request.indicators.join(', ')}` : ''}
${request.customRequirements ? `Custom Requirements: ${request.customRequirements}` : ''}

Generate a complete, production-ready Freqtrade strategy that includes:
1. Proper entry and exit signals
2. Risk management (stoploss, ROI)
3. Technical indicators
4. Position sizing
5. Comprehensive documentation

Respond with JSON in this exact format:
{
  "code": "complete Python strategy class code",
  "explanation": "detailed explanation of the strategy logic and expected performance",
  "config": {
    "timeframe": "5m",
    "stake_currency": "USDT",
    "stake_amount": 100,
    "max_open_trades": 5
  },
  "backtest_params": {
    "timerange": "20231001-20240301",
    "timeframe": "5m",
    "stake_amount": 100
  },
  "risk_management": {
    "max_open_trades": 5,
    "stoploss": -0.05,
    "roi": {
      "0": 0.10,
      "30": 0.05,
      "60": 0.02,
      "120": 0
    }
  }
}

The strategy code must be a complete Python class inheriting from IStrategy with all required methods implemented.`;
  }

  private validateStrategyResponse(response: any): StrategyGenerationResponse {
    if (!response.code || !response.explanation || !response.config) {
      throw new Error('Invalid strategy response format');
    }

    return {
      code: response.code,
      explanation: response.explanation,
      config: response.config,
      backtest_params: response.backtest_params || {
        timerange: "20231001-20240301",
        timeframe: "5m",
        stake_amount: 100
      },
      risk_management: response.risk_management || {
        max_open_trades: 5,
        stoploss: -0.05,
        roi: { "0": 0.10, "30": 0.05, "60": 0.02, "120": 0 }
      }
    };
  }

  private validateMarketAnalysisResponse(response: any): MarketAnalysisResponse {
    return {
      analysis: response.analysis || 'No analysis available',
      sentiment: response.sentiment || 'neutral',
      confidence: Math.max(0, Math.min(1, response.confidence || 0.5)),
      recommendations: response.recommendations || [],
      key_levels: response.key_levels || { support: [], resistance: [] }
    };
  }
}

export const openaiService = new OpenAIService();
