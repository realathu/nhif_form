import React from 'react'
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend 
} from 'chart.js'
import { Line } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
)

interface MonthlyRegistrationChartProps {
  monthlyData: Array<{
    month: string
    count: number
  }>
}

const MonthlyRegistrationChart: React.FC<MonthlyRegistrationChartProps> = ({ monthlyData }) => {
  const chartData = {
    labels: monthlyData.map(item => item.month),
    datasets: [
      {
        label: 'Monthly Registrations',
        data: monthlyData.map(item => item.count),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Registration Trend'
      }
    }
  }

  return <Line data={chartData} options={options} />
}

export default MonthlyRegistrationChart
