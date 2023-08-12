import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import * as d3 from "d3-scale-chromatic";

interface StockDataProps {
  data: { [symbol: string]: { [date: string]: number } };
}

function StockChart({ data }: StockDataProps) {
  const symbols = Object.keys(data);
  const chartData = Object.entries(data[symbols[0]]).map(([date, price]) => {
    const obj: { [key: string]: string | number } = { date };
    symbols.forEach((symbol) => {
      obj[symbol] = data[symbol][date];
    });
    return obj;
  });

  const colors = d3.schemeCategory10;

  return (
    <>
      <p>
        Hover your mouse over the graph to see the price on a particular date.
      </p>
      <LineChart width={600} height={300} data={chartData}>
        <XAxis dataKey="date" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        {symbols.map((symbol, index) => (
          <Line
            key={symbol}
            type="monotone"
            dataKey={symbol}
            stroke={colors[index % colors.length]}
            dot={false}
          />
        ))}
      </LineChart>
    </>
  );
}

export default StockChart;
