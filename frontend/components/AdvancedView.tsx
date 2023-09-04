import React from "react";

interface RatiosResponseBody {
  sharpe_ratio: number;
  treynor_ratio: number;
  calmar_ratio: number;
}

interface StockDataProps {
  data: { [symbol: string]: { [date: string]: number } };
  extraStockData: { [symbol: string]: { max_drawdown: number; beta: number } };
  stockRatios: { symbol: string; data: RatiosResponseBody }[];
}

function AdvancedView({ data, extraStockData, stockRatios }: StockDataProps) {
  // Calculate Sharpe ratio for each stock

  // Data format for each stock
  //   [
  //     {
  //         "symbol": "AMZN",
  //         "data": {
  //             "calmar_ratio": -0.004480417722775199,
  //             "sharpe_ratio": -0.07625842173767448,
  //             "treynor_ratio": -1.8519299885022409
  //         }
  //     },
  //     {
  //         "symbol": "SPY",
  //         "data": {
  //             "calmar_ratio": -0.002892384115201195,
  //             "sharpe_ratio": -0.051446305929940886,
  //             "treynor_ratio": -0.004302048558889198
  //         }
  //     }
  // ]

  return (
    <table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Calmar Ratio</th>
          <th>Sharpe Ratio</th>
          <th>Treynor Ratio</th>
        </tr>
      </thead>
      <tbody>
        {stockRatios.map((item) => (
          <tr key={item.symbol}>
            <td>{item.symbol}</td>
            <td>{item.data.calmar_ratio.toFixed(6)}</td>
            <td>{item.data.sharpe_ratio.toFixed(6)}</td>
            <td>{item.data.treynor_ratio.toFixed(6)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default AdvancedView;
