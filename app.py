from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf

app = Flask(__name__)
CORS(app)


@app.route('/stock')
def get_stock_data():
    symbol = request.args.get('symbol')
    start = request.args.get('start')
    end = request.args.get('end')
    if not symbol:
        return jsonify({'error': 'missing symbol parameter'}), 400

    stock = yf.Ticker(symbol)
    data = stock.history(start=start, end=end)

    close_prices = {str(k.date()): v for k, v in data['Close'].items()}

    return jsonify(close_prices)


if __name__ == '__main__':
    app.run()
