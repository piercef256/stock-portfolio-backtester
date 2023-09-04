import React from "react";

interface DataProps {
  data: { [date: string]: number };
}

const Data: React.FC<DataProps> = ({ data }) => {
  return (
    <div>
      {Object.entries(data).map(([date, value]) => (
        <div key={date}>
          {date}: {value}
        </div>
      ))}
    </div>
  );
};

export default Data;
