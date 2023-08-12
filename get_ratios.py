# Stock ratios REST API that will return the sharpe ratio, treynor ratio, calmar ratio
# Given returns, risk_free_rate, beta, and max_drawdown.

# request body:
# {
# "returns": [number],
# "risk_free_rate": number,
# "beta": number,
# "max_drawdown": number
# }

# response body:
# {
# "sharpe_ratio": number,
# "treynor_ratio": number,
# "calmar_ratio": number
# }


from flask import Flask, request, jsonify
import statistics
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


class StockRatiosCalculator:
    def __init__(self):
        pass

    def get_excess_returns(self, returns, risk_free_rate):
        result = []
        for x in returns:
            excess_return = x - risk_free_rate
            result.append(excess_return)
        return result

    def sharpe_ratio(self, returns, risk_free_rate):
        excess_returns = self.get_excess_returns(returns, risk_free_rate)
        result = statistics.mean(excess_returns) / statistics.stdev(excess_returns)
        return result

    def treynor_ratio(self, returns, risk_free_rate, beta):
        excess_returns = self.get_excess_returns(returns, risk_free_rate)
        result = statistics.mean(excess_returns) / beta
        return result

    def calmar_ratio(self, returns, max_drawdown):
        result = statistics.mean(returns) / abs(max_drawdown)
        return result


@app.route("/get_ratios", methods=["POST"])
def get_ratios():
    data = request.get_json()
    print(data)

    returns = data["returns"]
    risk_free_rate = data["risk_free_rate"]
    beta = data["beta"]
    max_drawdown = data["max_drawdown"]

    calculator = StockRatiosCalculator()

    ratios = {
        "sharpe_ratio": calculator.sharpe_ratio(returns, risk_free_rate),
        "treynor_ratio": calculator.treynor_ratio(returns, risk_free_rate, beta),
        "calmar_ratio": calculator.calmar_ratio(returns, max_drawdown),
    }
    return jsonify(ratios)


if __name__ == "__main__":
    app.run(port=5001)
