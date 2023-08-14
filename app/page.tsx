"use client";
import UserInput from "../components/UserInput";
import StockChart from "../components/StockChart";
import AdvancedView from "../components/AdvancedView";
import StockData from "../components/StockData";

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
  const [undoList, setUndoList] = useState<string[][]>([]);
  const [redoList, setRedoList] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState<string>("2022-01-01");
  const [endDate, setEndDate] = useState<string>("2022-12-31");
  const [devMode, setDevMode] = useState<boolean>(false);
  const [extraStockData, setExtraStockData] = useState<{
    [symbol: string]: {
      max_drawdown: number;
      beta: number;
      daily_returns: { [date: string]: number };
    };
  } | null>(null);

  const [userConfig, setUserConfig] = useState<UserConfig>({
    advancedView: false,
  });

  const [stockData, setStockData] = useState<StockData | null>(null);
  const [stockRatios, setStockRatios] = useState<
    { symbol: string; data: RatiosResponseBody }[]
  >([]);

  const handleAddStock = (stock: string) => {
    if (stock === "") {
      // Handle empty string input
      alert("Error: stock cannot be an empty string");
      return;
    }
    if (stock == "devmode on") {
      setDevMode(true);
      return;
    }
    if (stock == "devmode off") {
      setDevMode(false);
      return;
    }
    stock = stock.toUpperCase();
    setStockList((prevStockList) => {
      if (!prevStockList.includes(stock)) {
        // Add current state to undo list
        setUndoList((prevUndoList) => [...prevUndoList, prevStockList]);
        // Clear redo list
        setRedoList([]);
        return [...prevStockList, stock];
      } else {
        return prevStockList;
      }
    });
  };

  const handleRemoveStock = (stock: string) => {
    setStockList((prevStockList) => {
      if (prevStockList.includes(stock)) {
        // Add current state to undo list
        setUndoList((prevUndoList) => [...prevUndoList, prevStockList]);
        // Clear redo list
        setRedoList([]);
        return prevStockList.filter((item) => item !== stock);
      } else {
        return prevStockList;
      }
    });
  };

  const handleRemoveAllStocks = () => {
    // Add current state to undo list
    setUndoList((prevUndoList) => [...prevUndoList, stockList]);
    // Clear redo list
    setRedoList([]);
    // Clear stock list
    setStockList([]);
  };

  const handleUndo = () => {
    if (undoList.length > 0) {
      // Add current state to redo list
      setRedoList((prevRedoList) => [...prevRedoList, stockList]);
      // Set stock list to last state in undo list
      setStockList(undoList[undoList.length - 1]);
      // Remove last state from undo list
      setUndoList((prevUndoList) => prevUndoList.slice(0, -1));
    }
  };

  const handleRedo = () => {
    if (redoList.length > 0) {
      // Add current state to undo list
      setUndoList((prevUndoList) => [...prevUndoList, stockList]);
      // Set stock list to last state in redo list
      setStockList(redoList[redoList.length - 1]);
      // Remove last state from redo list
      setRedoList((prevRedoList) => prevRedoList.slice(0, -1));
    }
  };

  const handleToggleAdvancedView = () => {
    setUserConfig((prevUserConfig) => ({
      ...prevUserConfig,
      advancedView: !prevUserConfig.advancedView,
    }));
  };

  interface ExtraStockData {
    [symbol: string]: {
      max_drawdown: number;
      beta: number;
      daily_returns: { [date: string]: number };
    };
  }

  interface ReturnsData {
    [symbol: string]: { [date: string]: number };
  }

  interface RatiosRequestBody {
    returns: number[];
    risk_free_rate: number;
    beta: number;
    max_drawdown: number;
  }

  interface RatiosResponseBody {
    sharpe_ratio: number;
    treynor_ratio: number;
    calmar_ratio: number;
  }

  async function fetchRatios(
    extraStockData: ExtraStockData,
    returnsData: ReturnsData
  ): Promise<{ symbol: string; data: RatiosResponseBody }[]> {
    // Extract the data from extraStockData and returnsData
    const risk_free_rate = 0;

    // Call the API for each stock in extraStockData and save the responses
    const res = await Promise.all(
      Object.entries(extraStockData).map(async ([symbol, stock]) => {
        const response = await fetch("http://localhost:5001/get_ratios", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            returns: Object.values(extraStockData[symbol].daily_returns),
            risk_free_rate: risk_free_rate,
            beta: stock.beta,
            max_drawdown: stock.max_drawdown,
          } as RatiosRequestBody),
        });
        return { symbol, data: (await response.json()) as RatiosResponseBody };
      })
    );

    // Return the data from the API
    return res;
  }

  async function handleFetchStockData() {
    setIsLoading(true); // this is for conditional rendering of the stock chart
    const fetchedStockData = await fetchStockData(
      stockList,
      startDate,
      endDate
    );
    setStockData(fetchedStockData.stockData);
    setExtraStockData(fetchedStockData.extraStockData);
    const ratios = await fetchRatios(
      fetchedStockData.extraStockData,
      fetchedStockData.stockData
    );
    setStockRatios(ratios);
    setIsLoading(false);
  }

  async function fetchStockData(
    stockList: string[],
    startDate: string,
    endDate: string
  ) {
    const responses = await Promise.all(
      stockList.map((stock) =>
        fetch(
          `http://localhost:8000/stock?symbol=${stock}&start=${startDate}&end=${endDate}`
        )
      )
    );
    const data = (await Promise.all(
      responses.map((response) => response.json())
    )) as {
      close_prices: { [date: string]: number };
      daily_returns: { [date: string]: number }; // Include daily_returns in the response
      max_drawdown: number;
      beta: number;
    }[];

    const stockDataResult: { [symbol: string]: { [date: string]: number } } =
      {};
    const extraStockDataResult: {
      [symbol: string]: {
        max_drawdown: number;
        beta: number;
        daily_returns: { [date: string]: number }; // Include daily_returns in the result
      };
    } = {};

    stockList.forEach((symbol, index) => {
      stockDataResult[symbol] = data[index].close_prices;
      extraStockDataResult[symbol] = {
        max_drawdown: data[index].max_drawdown,
        beta: data[index].beta,
        daily_returns: data[index].daily_returns, // Include daily_returns in the result
      };
    });

    return { stockData: stockDataResult, extraStockData: extraStockDataResult };
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
        <div>
          <UserInput
            onAddStock={handleAddStock}
            onRemoveStock={handleRemoveStock}
            onToggleAdvancedView={handleToggleAdvancedView}
            onFetchStockData={handleFetchStockData}
            stockList={stockList}
          />

          <button onClick={handleUndo}>Undo</button>
          <button onClick={handleRedo}>Redo</button>
          <button
            onClick={() => {
              if (
                window.confirm("Are you sure you want to remove all stocks?")
              ) {
                handleRemoveAllStocks();
              }
            }}
          >
            Remove All Stocks
          </button>
        </div>
        {!isLoading && stockData ? (
          <StockChart data={stockData} />
        ) : (
          <p>Stock chart:</p>
        )}
        {userConfig.advancedView ? <p>Advanced View Statistics:</p> : <></>}
        {userConfig.advancedView &&
        stockData &&
        extraStockData &&
        stockRatios ? (
          <AdvancedView
            data={stockData}
            extraStockData={extraStockData}
            stockRatios={stockRatios}
          />
        ) : (
          <></>
        )}
        {devMode ? <h1>DEVMODE ON</h1> : <></>}
        {devMode && stockList.length > 0 ? (
          <>
            <StockData symbol={stockList[0]} start={startDate} end={endDate} />
          </>
        ) : (
          <></>
        )}
      </div>
    </main>
  );
}
