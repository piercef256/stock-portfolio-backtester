from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import pandas as pd

app = Flask(__name__)
CORS(app)


class StockDataProvider:
    @staticmethod
    def get_stock_data(symbol, start, end):
        if not symbol:
            return None
        stock = yf.Ticker(symbol)
        data = stock.history(start=start, end=end)
        close_prices = {str(k.date()): v for k, v in data["Close"].items()}
        return close_prices


class ReturnsCalculator:
    @staticmethod
    def calculate_daily_returns(prices):
        prices_series = pd.Series(prices)
        daily_returns = prices_series.pct_change().dropna().to_dict()
        return daily_returns


class MaxDrawdownCalculator:
    @staticmethod
    def calculate_max_drawdown(stock_data):
        max_drawdown = 0
        peak = list(stock_data.values())[0]
        for value in stock_data.values():
            if value > peak:
                peak = value
            else:
                drawdown = (peak - value) / peak
                max_drawdown = max(max_drawdown, drawdown)
        return max_drawdown


class BetaCalculator:
    @staticmethod
    def calculate_beta(stock_data, market_data):
        stock_returns = [stock_data[date] for date in stock_data]
        market_returns = [market_data[date] for date in stock_data if date in market_data]

        avg_stock_return = sum(stock_returns) / len(stock_returns)
        avg_market_return = sum(market_returns) / len(market_returns)

        covariance = sum((stock - avg_stock_return) * (market - avg_market_return) for stock, market in zip(stock_returns, market_returns)) / len(stock_returns)
        variance = sum(
            (market - avg_market_return) ** 2 for market in market_returns) / len(market_returns)

        beta = covariance / variance
        return beta

class AdvancedViewValues:
    @staticmethod
    def get_extra_vals(stock_data, market_data):
        daily_returns = ReturnsCalculator.calculate_daily_returns(stock_data)
        max_drawdown = MaxDrawdownCalculator.calculate_max_drawdown(stock_data)
        beta = BetaCalculator.calculate_beta(stock_data, market_data)
        
        return {"daily_returns": daily_returns, "max_drawdown": max_drawdown, "beta":beta}

@app.route("/stock")
def get_stock_data_route():
    symbol = request.args.get("symbol")
    start = request.args.get("start")
    end = request.args.get("end")

    stock_data = StockDataProvider.get_stock_data(symbol, start, end)
    if stock_data is None: 
        return jsonify({"error": "missing symbol parameter"}), 400

    market_data = StockDataProvider.get_stock_data("^GSPC", start, end)
    
    extra_vals = AdvancedViewValues.get_extra_vals(stock_data, market_data)


    return jsonify(
        {
            "close_prices": stock_data,
            "daily_returns": extra_vals["daily_returns"],
            "max_drawdown": extra_vals["max_drawdown"],
            "beta": extra_vals["beta"],
        }
    )

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
