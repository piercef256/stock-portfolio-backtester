import { useState, useEffect } from "react";
import axios from "axios";
import Data from "./Data";

interface StockDataProps {
  symbol: string;
  start: string;
  end: string;
}

interface StockData {
  close_prices: { [date: string]: number };
}

export default function StockData({ symbol, start, end }: StockDataProps) {
  const [data, setData] = useState<StockData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get<StockData>(
        `http://localhost:8000/stock?symbol=${symbol}&start=${start}&end=${end}`
      );
      setData(response.data);
      console.log("DEVMODE:", response.data["close_prices"]);
    };
    fetchData();
  }, [symbol, start, end]);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <Data data={data["close_prices"]} />
    </div>
  );
}
