import { useState } from "react";

import Tutorial from "./Tutorial";

interface UserInputProps {
  onAddStock: (stock: string) => void;
  onRemoveStock: (stock: string) => void;
  onToggleAdvancedView: () => void;
  onFetchStockData: () => void;
  stockList: string[];
}

function UserInput({
  onAddStock,
  onRemoveStock,
  onToggleAdvancedView,
  onFetchStockData,
  stockList,
}: UserInputProps) {
  const [stock, setStock] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);

  // Predefined list of stocks
  const stockOptions = ["MSFT", "AAPL", "NVDA"];

  const [showTutorial, setShowTutorial] = useState(false);

  const handleToggleTutorial = () => {
    setShowTutorial((prevShowTutorial) => !prevShowTutorial);
  };

  const handleAddStock = () => {
    onAddStock(stock);
    console.log(stock);
    setStock("");
  };

  const handleRemoveButtonClick = (stock: string) => {
    // this function is for handling a user clicking on a stock to remove it from the list
    onRemoveStock(stock);
  };

  const handleFetchButtonClick = () => {
    onFetchStockData();
  };

  const handleToggleAdvancedViewClick = () => {
    onToggleAdvancedView();
  };

  return (
    <div>
      <button onClick={handleToggleTutorial}>Help</button>
      {showTutorial && <Tutorial onDone={handleToggleTutorial} />}
      {/* ... */}
      <input
        type="text"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        placeholder="Enter stock symbol"
      />
      <button onClick={handleAddStock}>Add stock</button>
      <button onClick={handleFetchButtonClick}>Fetch stock data</button>
      <label style={{ position: "relative" }}>
        <input type="checkbox" onChange={handleToggleAdvancedViewClick} />
        Advanced view
        <span
          style={{ marginLeft: "5px" }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          ?
        </span>
        {showTooltip && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "0",
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              padding: "5px",
              zIndex: 1,
            }}
          >
            The advanced view will take up more space and may be confusing
          </div>
        )}
      </label>
      <select value={stock} onChange={(e) => setStock(e.target.value)}>
        <option value="">Select a stock</option>
        {stockOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <p>Click on a stock to remove it from the list</p>
      <ul>
        {stockList.map((stock) => (
          <li key={stock} onClick={() => handleRemoveButtonClick(stock)}>
            {stock}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserInput;
