import { useState } from "react";

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

  const handleAddStock = () => {
    onAddStock(stock);
    setStock("");
  };

  const handleRemoveButtonClick = (stock: string) => {
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
      <input
        type="text"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        placeholder="Enter stock symbol"
      />
      <button onClick={handleAddStock}>Add stock</button>
      <button onClick={handleFetchButtonClick}>Fetch stock data</button>
      <button onClick={handleToggleAdvancedViewClick}>
        Toggle advanced view
      </button>
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
