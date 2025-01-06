import React from 'react'
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend 
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface CourseRegistrationChartProps {
  courseData: Array<{
    courseName: string
    count: number
  }>
}

const CourseRegistrationChart: React.FC<CourseRegistrationChartProps> = ({ courseData }) => {
  const chartData = {
    labels: courseData.map(course => course.courseName),
    datasets: [
      {
        label: 'Course Registrations',
        data: courseData.map(course => course.count),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(231, 76, 60, 0.6)',
          'rgba(155, 89, 182, 0.6)'
        ]
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
        text: 'Course Registration Distribution'
      }
    }
  }

  return <Bar data={chartData} options={options} />
}

export default CourseRegistrationChart
