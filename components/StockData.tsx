import { useState, useEffect } from "react";
import axios from "axios";

interface StockDataProps {
  symbol: string;
  start: string;
  end: string;
}

interface StockData {
  [date: string]: number;
}

export default function StockData({ symbol, start, end }: StockDataProps) {
  const [data, setData] = useState<StockData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get<StockData>(
        "http://localhost:5000/stock",
        {
          params: { symbol, start, end },
        }
      );
      setData(response.data);
    };
    fetchData();
  }, [symbol, start, end]);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <h1>{symbol} Stock Data</h1>
      <ul>
        {Object.entries(data).map(([date, price]) => (
          <li key={date}>
            {date}: {price}
          </li>
        ))}
      </ul>
    </div>
  );
}
