'use client'

import UserInput from "../components/UserInput"
import StockList from "../components/StockList"
import StockChart from "../components/StockChart"

import { useState } from "react";

interface UserConfig {
  advancedView: boolean
}

export default function Home() {
  const [stockList, setStockList] = useState<string[]>(["AMZN"])
  const [isLoading, setIsLoading] = useState(true);

  const [userConfig, setUserConfig] = useState<UserConfig>({
    advancedView: false,
  })
  // const [stockData, setStockData] = useState<StockData | null>(null);
  const [stockData, setStockData] = useState<StockData[] | null>(null);

  const stockDataApiKey = process.env.NEXT_PUBLIC_STOCK_DATA_API_KEY;



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
    )
  }

  const handleToggleAdvancedView = () => {
    setUserConfig((prevUserConfig) => ({
      ...prevUserConfig,
      advancedView: !prevUserConfig.advancedView,
    }))
  }

  async function handleFetchStockData() {
    setIsLoading(true);
    const fetchedStockData = await fetchStockData(stockList);
    // setStockData(JSON.parse(fetchedStockData));
    setStockData(fetchedStockData);
    setIsLoading(false);
  }

  interface TimeSeriesData {
    [date: string]: {
      "1. open": string;
      "2. high": string;
      "3. low": string;
      "4. close": string;
      "5. adjusted close": string;
      "6. volume": string;
      "7. dividend amount": string;
      "8. split coefficient": string;
    };
  }

  interface StockData {
    'Meta Data': {
      [key: string]: string;
    };
    'Time Series (Daily)': TimeSeriesData;
  }

  async function fetchStockData(stockList: string[]): Promise<StockData[]> {

    const responses = await Promise.all(
      stockList.map((stock) =>
        fetch(
          `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${stock}&outputsize=full&apikey=${stockDataApiKey}`
        )
      )
    );
    const data = (await Promise.all(responses.map((response) => response.json()))) as (
      | StockData
      | { 'Error Message': string }
      | { 'Note': string }
    )[];
    const filteredData = data.map((stockData) => {
      if ('Error Message' in stockData) {
        throw new Error(stockData['Error Message']);
      }
      if ('Note' in stockData) {
        throw new Error(stockData['Note']);
      }
      if (!('Time Series (Daily)' in stockData)) {
        throw new Error('Time series data not found');
      }
      const timeSeries = stockData['Time Series (Daily)'];
      const filteredTimeSeries = Object.keys(timeSeries)
        .filter((date) => date.startsWith('2019') || date.startsWith('2020') || date.startsWith('2021') || date.startsWith('2022') || date.startsWith('2023'))
        .reduce((obj, key) => {
          obj[key] = timeSeries[key];
          return obj;
        }, {} as TimeSeriesData);
      return { ...stockData, 'Time Series (Daily)': filteredTimeSeries };
    });
    // console.log(JSON.stringify(filteredData))
    // return JSON.stringify(filteredData);
    return filteredData
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div><h1>Stock Portfolio Backtester</h1>
        <UserInput
          onAddStock={handleAddStock}
          onRemoveStock={handleRemoveStock}
          onToggleAdvancedView={handleToggleAdvancedView}
          onFetchStockData={handleFetchStockData}
          stockList={stockList}
        />
        <StockList />
        {stockData && !isLoading ? <StockChart data={stockData} /> : <p>Chart...</p>}
        {/* <StockChart data={stockData} isLoading={isLoading} /> */}
      </div>
    </main>
  )
}

