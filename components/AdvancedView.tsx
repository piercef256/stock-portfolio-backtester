import React from "react";

interface StockDataProps {
  data: { [symbol: string]: { [date: string]: number } };
}

function AdvancedView({ data }: StockDataProps) {
  const riskFreeRate = 0.02;

  // Calculate Sharpe ratio for each stock
  const sharpeRatios: { [symbol: string]: number } = {};
  Object.keys(data).forEach((symbol) => {
    const prices = Object.values(data[symbol]);
    const dailyReturns = prices
      .slice(1)
      .map((price, i) => (price - prices[i]) / prices[i]);
    const meanDailyReturn =
      dailyReturns.reduce((a, b) => a + b) / dailyReturns.length;
    const stdDevDailyReturn = Math.sqrt(
      dailyReturns
        .map((x) => Math.pow(x - meanDailyReturn, 2))
        .reduce((a, b) => a + b) / dailyReturns.length
    );
    sharpeRatios[symbol] = (meanDailyReturn - riskFreeRate) / stdDevDailyReturn;
  });

  return (
    <>
      <h3>Sharpe Ratios</h3>
      <ul>
        {Object.entries(sharpeRatios).map(([symbol, sharpeRatio]) => (
          <li key={symbol}>
            {symbol}: {sharpeRatio.toFixed(2)}
          </li>
        ))}
      </ul>
    </>
  );
}

export default AdvancedView;
