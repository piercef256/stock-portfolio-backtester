"use client";
import UserInput from "../components/UserInput";
import StockList from "../components/StockList";
import StockChart from "../components/StockChart";

import { useState } from "react";

interface UserConfig {
  advancedView: boolean;
}

interface StockData {
  [symbol: string]: {
    [date: string]: number;
  };
}

export default function Home() {
  const [stockList, setStockList] = useState<string[]>(["AMZN"]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState("2022-01-01");
  const [endDate, setEndDate] = useState("2022-12-31");

  const [userConfig, setUserConfig] = useState<UserConfig>({
    advancedView: false,
  });
  const [stockData, setStockData] = useState<StockData | null>(null);

  const handleAddStock = (stock: string) => {
    setStockList((prevStockList) => {
      if (!prevStockList.includes(stock)) {
        return [...prevStockList, stock];
      } else {
        return prevStockList;
      }
    });
  };

  const handleRemoveStock = (stock: string) => {
    setStockList((prevStockList) =>
      prevStockList.filter((item) => item !== stock)
    );
  };

  const handleToggleAdvancedView = () => {
    setUserConfig((prevUserConfig) => ({
      ...prevUserConfig,
      advancedView: !prevUserConfig.advancedView,
    }));
  };

  async function handleFetchStockData() {
    setIsLoading(true);
    const fetchedStockData = await fetchStockData(
      stockList,
      startDate,
      endDate
    );
    setStockData(fetchedStockData);
    setIsLoading(false);
  }

  async function fetchStockData(
    stockList: string[],
    startDate: string,
    endDate: string
  ): Promise<StockData> {
    const responses = await Promise.all(
      stockList.map((stock) =>
        fetch(
          `http://localhost:5000/stock?symbol=${stock}&start=${startDate}&end=${endDate}`
        )
      )
    );
    const data = (await Promise.all(
      responses.map((response) => response.json())
    )) as { [date: string]: number }[];

    const result: StockData = {};
    stockList.forEach((symbol, index) => {
      result[symbol] = data[index];
    });

    return result;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <h1>Stock Portfolio Backtester</h1>
        <label htmlFor="start-date">Start Date:</label>
        <input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label htmlFor="end-date">End Date:</label>
        <input
          id="end-date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <UserInput
          onAddStock={handleAddStock}
          onRemoveStock={handleRemoveStock}
          onToggleAdvancedView={handleToggleAdvancedView}
          onFetchStockData={handleFetchStockData}
          stockList={stockList}
        />
        <StockList />
        {stockData && !isLoading ? (
          <StockChart data={stockData} />
        ) : (
          <p>Stoch chart:</p>
        )}
      </div>
    </main>
  );
}

// 1) Add comments
// 2) Make symbols captureRejectionSymbol
// 3) Add the CHS from the assignemnt i typed up
