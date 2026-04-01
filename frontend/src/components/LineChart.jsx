import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

/**
 * Displays a line chart using the react-chartjs-2 library.
 * @param {chartData} props - the data for the chart
 * @param {chartOptions} props - the options for the chart
 * @returns {JSX.Element} - the line chart
 */

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({ chartData, chartOptions }) => {
  return (
    <>
      <div className='w-full md:col-span-2 relative lg:h-[70vh] h-[60vh] m-auto p-4 border rounded-lg bg-white'>
        <Line data={chartData} options={chartOptions} />
      </div>
    </>
  );
};

export default LineChart;
