// Dashboard page for managing bot tasks
import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useWebSocket } from '../hooks/useWebSocket';

interface Metrics {
  totalProfit: number;
  activeTrades: number;
  winRate: number;
  totalTrades: number;
  balance: number;
  currency: string;
}

interface Trade {
  id: string;
  strategyId: string;
}

const Dashboard = () => {
  const { data: metrics, loading: metricsLoading, error: metricsError } = useApi<Metrics>('/api/dashboard/metrics');
  const { data: trades, loading: tradesLoading, error: tradesError } = useApi<Trade[]>('/api/dashboard/recent-trades');
  const { data: wsMessage, error: wsError } = useWebSocket('ws://localhost:5000/ws');

  const [realTimeUpdates, setRealTimeUpdates] = useState<string[]>([]);
  const { data: balance, error: balanceError, loading: balanceLoading } = useApi('/api/balance');

  useEffect(() => {
    if (wsMessage) {
      setRealTimeUpdates((prev) => [...prev, wsMessage]);
    }
  }, [wsMessage]);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Manage your bot tasks here.</p>

      <section>
        <h2>Metrics</h2>
        {metricsLoading && <p>Loading metrics...</p>}
        {metricsError && <p>Error: {metricsError.message}</p>}
        {metrics && (
          <ul>
            <li>Total Profit: {metrics.totalProfit}</li>
            <li>Active Trades: {metrics.activeTrades}</li>
            <li>Win Rate: {metrics.winRate}%</li>
            <li>Total Trades: {metrics.totalTrades}</li>
            <li>Balance: {metrics.balance} {metrics.currency}</li>
          </ul>
        )}
      </section>

      <section>
        <h2>Recent Trades</h2>
        {tradesLoading && <p>Loading recent trades...</p>}
        {tradesError && <p>Error: {tradesError.message}</p>}
        {trades && (
          <ul>
            {trades.map((trade, index) => (
              <li key={index}>{trade.id}: {trade.strategyId}</li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Real-Time Updates</h2>
        <p>WebSocket Connected: {wsError ? 'No (Error)' : 'Yes'}</p>
        <ul>
          {realTimeUpdates.map((update, index) => (
            <li key={index}>{update}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Balance</h2>
        {balanceLoading ? (
          <p>Loading...</p>
        ) : balanceError ? (
          <p>Error: {balanceError}</p>
        ) : (
          <p>{JSON.stringify(balance)}</p>
        )}
      </section>
      <section>
        <h2>Trades</h2>
        {tradesLoading ? (
          <p>Loading...</p>
        ) : tradesError ? (
          <p>Error: {tradesError}</p>
        ) : (
          <ul>
            {trades.map((trade: any, index: number) => (
              <li key={index}>{JSON.stringify(trade)}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
