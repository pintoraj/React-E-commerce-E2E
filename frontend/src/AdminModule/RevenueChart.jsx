import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import './ChartStyles.css';
import { useAuth } from '../user-authentication/context/AuthContext';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function RevenueChart() {
  const { token } = useAuth();
  const API_BASE = import.meta.env.VITE_API_URL;

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/products`).then(res => res.json()),
      fetch(`${API_BASE}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json())
    ])
      .then(([products, orders]) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const productMap = new Map();
        products.forEach(p => {
          productMap.set(String(p.id), parseFloat(p.price) || 0);
        });

        const revenueBuckets = [0, 0, 0, 0];
        let monthTotal = 0;

        orders.forEach(order => {
          const date = new Date(order.deliveryDate || order.orderedDate);
          if (date.getMonth() !== currentMonth || date.getFullYear() !== currentYear) return;

          const day = date.getDate();
          let weekIndex = 0;
          if (day <= 7) weekIndex = 0;
          else if (day <= 14) weekIndex = 1;
          else if (day <= 21) weekIndex = 2;
          else weekIndex = 3;

          if (Array.isArray(order.items)) {
            order.items.forEach(item => {
              const price = item.price || productMap.get(String(item.productId)) || 0;
              const qty = item.qty || 0;
              const revenue = price * qty;
              revenueBuckets[weekIndex] += revenue;
              monthTotal += revenue;
            });
          }
        });

        setChartData({
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [
            {
              label: 'Revenue (₹)',
              data: revenueBuckets,
              backgroundColor: 'rgba(30, 144, 255, 0.6)',
            }
          ]
        });
        setTotalRevenue(monthTotal);
      })
      .catch(err => console.error('Failed to fetch revenue data:', err));
  }, [API_BASE, token]);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: context => `₹${context.raw.toLocaleString()} earned`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue (₹)'
        },
        ticks: {
          callback: value => `₹${value.toLocaleString()}`,
          maxTicksLimit: 5
        }
      },
      x: {
        title: {
          display: true,
          text: 'Week of the Month'
        }
      }
    }
  };

  return (
    <div className="a-chart-wrapper">
      <h3>Weekly Revenue (This Month)</h3>
      <div className="a-monthly-sales-summary">
        Total Revenue This Month: <b>₹{totalRevenue.toLocaleString()}</b>
      </div>
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default RevenueChart;
