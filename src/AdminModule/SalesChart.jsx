import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import './ChartStyles.css';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

function SalesChart() {
  const [weeklySales, setWeeklySales] = useState({
    thisMonth: [],
    completedWeeks: 0,
  });
  const [totalMonthSales, setTotalMonthSales] = useState(0);

  useEffect(() => {
    fetch('http://localhost:3001/users')
      .then(res => res.json())
      .then(users => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const today = now.getDate();
        const completedWeeks = Math.ceil(today / 7);

        const thisMonthSales = [0, 0, 0, 0];
        let monthTotal = 0;

        users.forEach(user => {
          if (!Array.isArray(user.orders)) return;

          user.orders.forEach(order => {
            const orderDate = new Date(order.orderDate || order.orderedDate);
            const month = orderDate.getMonth();
            const year = orderDate.getFullYear();
            const day = orderDate.getDate();

            if (month !== currentMonth || year !== currentYear) return;

            let weekIndex = 0;
            if (day <= 7) weekIndex = 0;
            else if (day <= 14) weekIndex = 1;
            else if (day <= 21) weekIndex = 2;
            else weekIndex = 3;

            if (Array.isArray(order.items)) {
              const soldUnits = order.items.reduce((sum, item) => sum + (item.qty || 0), 0);
              thisMonthSales[weekIndex] += soldUnits;
              monthTotal += soldUnits;
            }
          });
        });

        setWeeklySales({
          thisMonth: thisMonthSales.slice(0, completedWeeks),
          completedWeeks,
        });
        setTotalMonthSales(monthTotal);
      })
      .catch(err => console.error('Failed to fetch sales data:', err));
  }, []);

  const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

  const data = {
    labels,
    datasets: [
      {
        label: 'This Month',
        data: [
          ...weeklySales.thisMonth,
          ...Array(4 - weeklySales.completedWeeks).fill(null),
        ],
        borderColor: '#2ed573',
        backgroundColor: '#2ed57333',
        tension: 0.3,
      }
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: context => {
            const value = context.raw;
            return value !== null ? `${value} units sold` : 'Data not available';
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Units Sold',
        },
      },
    },
  };

  return (
    <div className="a-chart-wrapper">
      <h3>Monthly Sales Overview</h3>
      <div className="a-monthly-sales-summary">
        Total Sales This Month: <b>{totalMonthSales}</b>
      </div>
      <Line data={data} options={options} />
    </div>
  );
}

export default SalesChart;
