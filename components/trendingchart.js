import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const fetchHistoricalData = async (id) => {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7`
  );
  const data = await res.json();
  return data;
};

const aggregateHourlyData = (prices) => {
  const hourlyData = [];
  const hourInMillis = 3600000;

  let lastHourTimestamp = prices[0][0];

  for (let i = 0; i < prices.length; i++) {
    if (prices[i][0] >= lastHourTimestamp + hourInMillis) {
      hourlyData.push(prices[i]);
      lastHourTimestamp = prices[i][0];
    }
  }

  return hourlyData;
};

const selectTenPoints = (data) => {
  const step = Math.floor(data.length / 10);
  return data.filter((_, index) => index % step === 0).slice(0, 10);
};

const CryptoChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const [btcData, ethData, ltcData] = await Promise.all([
        fetchHistoricalData('bitcoin'),
        fetchHistoricalData('ethereum'),
        fetchHistoricalData('litecoin'),
      ]);

      const btcHourlyData = aggregateHourlyData(btcData.prices);
      const ethHourlyData = aggregateHourlyData(ethData.prices);
      const ltcHourlyData = aggregateHourlyData(ltcData.prices);

      const btcSelectedData = selectTenPoints(btcHourlyData);
      const ethSelectedData = selectTenPoints(ethHourlyData);
      const ltcSelectedData = selectTenPoints(ltcHourlyData);

      const data = {
        labels: btcSelectedData.map((price) => new Date(price[0]).toLocaleString()),
        datasets: [
          {
            label: 'BTC',
            data: btcSelectedData.map((price) => price[1]),
            borderColor: 'rgba(255, 99, 132, 1)',
            yAxisID: 'BTC',
            fill: false,
          },
          {
            label: 'ETH',
            data: ethSelectedData.map((price) => price[1]),
            borderColor: 'rgba(54, 162, 235, 1)',
            yAxisID: 'ETH',
            fill: false,
          },
          {
            label: 'LTC',
            data: ltcSelectedData.map((price) => price[1]),
            borderColor: 'rgba(75, 192, 192, 1)',
            yAxisID: 'LTC',
            fill: false,
          },
        ],
      };

      const options = {
        scales: {
          yAxes: [
            {
              id: 'BTC',
              type: 'linear',
              position: 'left',
              ticks: {
                callback: function (value) {
                  return '$' + value;
                },
              },
            },
            {
              id: 'ETH',
              type: 'linear',
              position: 'right',
              ticks: {
                callback: function (value) {
                  return '$' + value;
                },
              },
              gridLines: {
                display: false,
              },
            },
            {
              id: 'LTC',
              type: 'linear',
              position: 'right',
              ticks: {
                callback: function (value) {
                  return '$' + value;
                },
              },
              gridLines: {
                display: false,
              },
            },
          ],
        },
      };

      setChartData({ data, options });
    };

    fetchData();
  }, []);

  return (
    <div>
      {chartData ? <Line data={chartData.data} options={chartData.options} /> : 'Loading chart...'}
    </div>
  );
};

export default CryptoChart;
