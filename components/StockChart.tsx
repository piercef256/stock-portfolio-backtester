import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, TooltipItem } from 'chart.js';
import { Line } from 'react-chartjs-2';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

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

const colors = ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 206, 86)', 'rgb(75, 192, 192)', 'rgb(153, 102, 255)'];
const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export default function StockChart({ data }: { data: StockData[] | null }) {
  if (!data) {
    return <div>No data</div>;
  }

  const firstStockData = data[0];
  const timeSeries = Object.entries(firstStockData['Time Series (Daily)'])
    .sort(([dateA], [dateB]) => (dateA < dateB ? -1 : 1));

  const maxDataPoints = Math.min(timeSeries.length / 2, timeSeries.length);

  const labels = timeSeries.filter((_, index) => index % Math.ceil(timeSeries.length / maxDataPoints) === 0).map(([date]) => date);

  const datasets = data.map((stockData, index) => {
    const stockTimeSeries = Object.entries(stockData['Time Series (Daily)'])
      .sort(([dateA], [dateB]) => (dateA < dateB ? -1 : 1));
    const values = stockTimeSeries.filter((_, index) => index % Math.ceil(stockTimeSeries.length / maxDataPoints) === 0).map(([, entry]) => entry['5. adjusted close']);

    return {
      label: stockData['Meta Data']['2. Symbol'],
      data: values,
      fill: false,
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length],
    };
  });

  const chartData = {
    labels,
    datasets,
  };

  const options = {
    animation: {
      duration: 0,
    },

    plugins: {
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<"line">) {
            var label = context.dataset.label || '';

            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += currencyFormatter.format(context.parsed.y);
            }
            return label;
          },
          title: function (context: TooltipItem<"line">[]) {
            return context[0].label;
          }
        }
      },
      legend: {
        display: true,
        position: 'left'
      }

    }
  };

  return <Line data={chartData} options={options} />;
}
