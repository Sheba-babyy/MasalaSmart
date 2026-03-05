import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import ManagerNavbar from "../../components/ManagerNavbar";
import ManagerSidebar from "./managersidebar";
import Footer from "../../components/Footer";
import backgroundImg from "../../assets/img2.png";
import { fetchReportData } from "../../services/api";

const ManagerReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const reportData = await fetchReportData();
      setData(reportData);
    } catch (err) {
      console.error("Failed to load reports", err);
      setError(err.details || err.message || "Failed to load data"); 
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#00C49F", "#FFBB28", "#FF8042"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <h2 className="text-xl">Loading Dashboard...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="bg-red-900/50 p-8 rounded-xl border border-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Reports</h2>
          <p className="text-red-200 mb-4">{error}</p>
          <button onClick={loadData} className="bg-red-600 hover:bg-red-500 px-6 py-2 rounded text-white font-bold transition">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
     
      <div className="manager-layout">
        <ManagerSidebar activePage="reports" />
        <div className="main-content">
           <ManagerNavbar />
          <div className="dashboard">
            <h2 className="page-title">Reports & Audit Overview</h2>

            {/* 1. TOP STATS CARDS */}
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Staff</h3>
                <p className="stat-value">{data?.total_staff || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Masala Varieties</h3>
                <p className="stat-value">{data?.masala_count || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Total Ingredients</h3>
                <p className="stat-value">{data?.inventory?.length || 0}</p>
              </div>
            </div>

            {/* 2. GRAPHS SECTION */}
            <div className="charts-container">
              <div className="chart-card">
                <h3>Current Inventory Levels (kg)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data?.inventory || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                    <XAxis dataKey="name" stroke="#cbd5e1" fontSize={12} tickLine={false} />
                    <YAxis stroke="#cbd5e1" fontSize={12} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#fff" }} />
                    <Bar dataKey="quantity" fill="#6366f1" radius={[4, 4, 0, 0]} name="Quantity (kg)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3>Staff Status</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={data?.staff_stats || []}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={80}
                      fill="#8884d8" paddingAngle={5} dataKey="value"
                    >
                      {(data?.staff_stats || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. AUDIT LOG TABLE */}
            <div className="section-card">
              <h3>Recent Audit Logs</h3>
              <div className="table-container">
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Details</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.audit_logs || []).map((log, index) => (
                      <tr key={index}>
                        <td><span className="log-badge">{log.action}</span></td>
                        <td>{log.details}</td>
                        <td>{log.date}</td>
                      </tr>
                    ))}
                    {(!data?.audit_logs || data.audit_logs.length === 0) && (
                        <tr><td colSpan="3" className="text-center p-4 text-slate-400">No recent activity</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>

      <style jsx>{`
        .manager-layout {
          display: flex;
          min-height: 100vh;
          background: url(${backgroundImg}) no-repeat center center fixed;
          background-size: cover;
          position: relative;
        }
        .manager-layout::before {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.88);
          z-index: 0;
        }
        .main-content {
          margin-left: 280px; 
          width: calc(100% - 280px);
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
        }
        .dashboard {
          padding: 40px 40px 40px; /* Pulls content up: changed from 120px 60px 80px */
          flex: 1;
          color: white;
        }
        .page-title {
          font-size: 1.8rem;
          margin-bottom: 25px; /* Tightened margin */
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }
        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          padding: 18px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .stat-card h3 {
          font-size: 0.85rem;
          color: #94a3b8;
          margin-bottom: 4px;
        }
        .stat-value {
          font-size: 1.8rem;
          font-weight: 800;
        }

        .charts-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 25px;
        }
        .chart-card {
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 20px;
        }
        .chart-card h3 {
          margin-bottom: 15px;
          font-size: 1.1rem;
          color: #e2e8f0;
        }

        .section-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 25px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .section-card h3 {
            font-size: 1.1rem;
            margin-bottom: 15px;
        }
        
        .table-container { overflow-x: auto; }
        .audit-table { width: 100%; border-collapse: collapse; }
        .audit-table th, .audit-table td {
          padding: 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.05);
          font-size: 0.9rem;
        }
        .audit-table th { color: #94a3b8; font-weight: 500; }
        
        .log-badge {
            background: rgba(99, 102, 241, 0.15);
            color: #818cf8;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 600;
        }

        @media (max-width: 1024px) {
          .charts-container { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .main-content { margin-left: 0; width: 100%; }
          .dashboard { padding: 70px 20px 40px; }
        }
      `}</style>
    </>
  );
};

export default ManagerReports;