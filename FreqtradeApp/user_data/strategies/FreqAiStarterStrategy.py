from freqtrade.strategy import IStrategy

class FreqAiStarterStrategy(IStrategy):
    # Minimal example, customize as needed
    timeframe = '1h'
    minimal_roi = {
        "0": 0.05,
        "10": 0.03,
        "20": 0.02,
        "30": 0.01
    }
    stoploss = -0.10
    trailing_stop = False

    def populate_indicators(self, dataframe, metadata):
        return dataframe

    def populate_buy_trend(self, dataframe, metadata):
        dataframe.loc[:, 'buy'] = 0
        dataframe.loc[
            (dataframe['close'] > dataframe['open']),
            'buy'
        ] = 1
        return dataframe

    def populate_sell_trend(self, dataframe, metadata):
        dataframe.loc[:, 'sell'] = 0
        dataframe.loc[
            (dataframe['close'] < dataframe['open']),
            'sell'
        ] = 1
        return dataframe
