import React, { useState, useEffect } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend } from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import Sidebar from "./Sidebar";
import AdminNavbar from "../../components/AdminNavbar";
import { fetchAdminAnalytics } from "../../services/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend);

function AdminReports() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchAdminAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error("Analytics fetch failed");
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  if (loading) return <div style={{ background: "#0f172a", color: "white", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><h2>Analyzing Data...</h2></div>;

  /* ================= CHART CONFIGS ================= */
  const productionData = {
    labels: analytics?.production.labels || [],
    datasets: [{
      label: "Batch Size (KG)",
      data: analytics?.production.data || [],
      backgroundColor: "rgba(34, 211, 238, 0.6)",
      borderColor: "#22d3ee",
      borderWidth: 1,
    }],
  };

  const batchStatusData = {
    labels: analytics?.status.labels || [],
    datasets: [{
      data: analytics?.status.data || [],
      backgroundColor: ["#f1c40f", "#3498db", "#2ecc71"],
      hoverOffset: 10
    }],
  };

  const inventoryStockData = {
    labels: analytics?.inventory.labels || [],
    datasets: [{
      label: "Current Stock (KG)",
      data: analytics?.inventory.data || [],
      borderColor: "#e879f9",
      backgroundColor: "rgba(232, 121, 249, 0.2)",
      fill: true,
      tension: 0.4,
    }],
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0f172a" }}>
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div style={{ flexGrow: 1, marginLeft: sidebarOpen ? 280 : 80, transition: "margin-left 0.3s" }}>
        <AdminNavbar />

        <div style={{ padding: "40px" }}>
          <h1 style={{ color: "#fff", marginBottom: "10px" }}>Business Analytics</h1>
          <p style={{ color: "#94a3b8", marginBottom: "40px" }}>Real-time data visualization of production and inventory.</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "30px" }}>

            {/* 1. Production Capacity Chart */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3>Production Output</h3>
                <span style={{ color: '#22d3ee', fontSize: '0.8rem' }}>RECENT BATCHES</span>
              </div>
              <div style={{ height: "300px" }}>
                <Bar data={productionData} options={chartOptions} />
              </div>
            </div>

            {/* 2. Batch Lifecycle Distribution */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3>Batch Status Distribution</h3>
                <span style={{ color: '#f1c40f', fontSize: '0.8rem' }}>LIVE LIFECYCLE</span>
              </div>
              <div style={{ height: "300px" }}>
                <Doughnut data={batchStatusData} options={chartOptions} />
              </div>
            </div>

            {/* 3. Inventory Stock Levels */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3>Raw Material Stock (KG)</h3>
                <span style={{ color: '#e879f9', fontSize: '0.8rem' }}>INVENTORY LEVELS</span>
              </div>
              <div style={{ height: "300px" }}>
                <Line data={inventoryStockData} options={chartOptions} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: "#94a3b8", font: { family: 'Inter' } } },
  },
  scales: {
    y: { ticks: { color: "#64748b" }, grid: { color: "rgba(255,255,255,0.05)" } },
    x: { ticks: { color: "#64748b" }, grid: { display: false } }
  }
};

const styles = {
  card: {
    background: "rgba(30, 41, 59, 0.7)",
    backdropFilter: "blur(10px)",
    padding: "25px",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
    color: "#fff",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    paddingBottom: "10px"
  }
};

export default AdminReports;