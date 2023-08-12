from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import pandas as pd


app = Flask(__name__)
CORS(app)


@app.route("/stock")
def get_stock_data():
    symbol = request.args.get("symbol")
    start = request.args.get("start")
    end = request.args.get("end")
    if not symbol:
        return jsonify({"error": "missing symbol parameter"}), 400

    stock = yf.Ticker(symbol)
    data = stock.history(start=start, end=end)

    close_prices = {str(k.date()): v for k, v in data["Close"].items()}

    # convert the dictionary to a pandas Series
    prices = pd.Series(close_prices)

    # calculate daily returns
    daily_returns = prices.pct_change()

    # drop the first element, which is NaN
    daily_returns = daily_returns.dropna()

    # convert the Series back to a dictionary
    daily_returns_dict = daily_returns.to_dict()

    max_drawdown = calculate_max_drawdown(close_prices)
    beta = calculate_beta(close_prices, start, end)

    return jsonify(
        {
            "close_prices": close_prices,
            "daily_returns": daily_returns_dict,
            "max_drawdown": max_drawdown,
            "beta": beta,
        }
    )


def calculate_max_drawdown(stock_data):
    max_drawdown = 0
    peak = list(stock_data.values())[0]
    for date in stock_data:
        value = stock_data[date]
        if value > peak:
            peak = value
        else:
            drawdown = (peak - value) / peak
            if drawdown > max_drawdown:
                max_drawdown = drawdown
    return max_drawdown


def calculate_beta(stock_data, start, end):
    market_data = yf.Ticker("^GSPC").history(start=start, end=end)
    market_prices = {str(k.date()): v for k, v in market_data["Close"].items()}

    # Calculate average returns for stock and market
    stock_returns = []
    market_returns = []
    for date in stock_data:
        if date in market_prices:
            stock_value = stock_data[date]
            market_value = market_prices[date]
            if len(stock_returns) > 0:
                prev_stock_value = stock_returns[-1]
                prev_market_value = market_returns[-1]
                stock_return = (stock_value - prev_stock_value) / prev_stock_value
                market_return = (market_value - prev_market_value) / prev_market_value
                stock_returns.append(stock_return)
                market_returns.append(market_return)
            else:
                stock_returns.append(stock_value)
                market_returns.append(market_value)

    avg_stock_return = sum(stock_returns) / len(stock_returns)
    avg_market_return = sum(market_returns) / len(market_returns)

    # Calculate covariance and variance
    covariance = 0
    variance = 0
    for i in range(len(stock_returns)):
        covariance += (stock_returns[i] - avg_stock_return) * (
            market_returns[i] - avg_market_return
        )
        variance += (market_returns[i] - avg_market_return) ** 2
    covariance /= len(stock_returns)
    variance /= len(market_returns)

    # Calculate beta
    beta = covariance / variance
    return beta


if __name__ == "__main__":
    app.run(port=8000)
