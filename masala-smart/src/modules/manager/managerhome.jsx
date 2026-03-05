import React, { useState, useEffect } from "react";
import ManagerSidebar from "./managersidebar"; 
import ManagerNavbar from "../../components/ManagerNavbar";
import Footer from "../../components/Footer";
import backgroundImg from "../../assets/img2.png"; 
import { getStaffCount, fetchActiveProduction, fetchAllPacking } from "../../services/api"; 

function ManagerHome() {
  const [staffCount, setStaffCount] = useState(0);
  const [activeBatch, setActiveBatch] = useState(null);
  const [packingRecords, setPackingRecords] = useState([]); // ✅ Added state for real packing data

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Staff Count
        const countData = await getStaffCount();
        if (countData && countData.totalStaff !== undefined) {
          setStaffCount(countData.totalStaff);
        }

        // 2. Fetch Blending Line (Line A)
        const batchData = await fetchActiveProduction();
        setActiveBatch(batchData);

        // 3. Fetch Packing Line (Line B) - Real dynamic data
        const packingData = await fetchAllPacking();
        setPackingRecords(packingData);
      } catch (err) {
        console.log("Error fetching manager data:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="manager-layout">
      <ManagerSidebar />

      <div className="main-content">
        <ManagerNavbar/>

        <div className="dashboard">
          <div className="header-section">
            <h1>Manager Control Panel</h1>
            <p className="subtitle">
              Real-time oversight of production lines, quality control, inventory, and workforce performance.
            </p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="value">{staffCount} <span className="unit">Staff</span></p>
              <p className="trend up">↑ Live</p>
            </div>

            <div className="stat-card">
              <h3>Packed Units</h3>
              {/* ✅ Summing total units from all packing records */}
              <p className="value">
                {packingRecords.reduce((acc, curr) => acc + (parseInt(curr.total_units) || 0), 0)}
              </p>
              <p className="trend up">↑ Total finished goods</p>
            </div>
            
            <div className="stat-card">
              <h3>Overall Equipment Effectiveness</h3>
              <p className="value">88%</p>
              <p className="trend up">↑ 3% this week</p>
            </div>
            <div className="stat-card">
              <h3>Pending QC Approvals</h3>
              <p className="value">2 <span className="unit">Batches</span></p>
              <p className="trend alert">Requires immediate action</p>
            </div>
            <div className="stat-card">
              <h3>Active Production Lines</h3>
              <p className="value">5 / 6</p>
              <p className="trend warning">Line C under maintenance</p>
            </div>
          </div>

          <div className="section-card">
            <h2>Live Production Lines Status</h2>
            <div className="lines-grid">
              
              {/* Line A - Blending */}
              <div className="line-item">
                <div className="line-header">
                  <span>{activeBatch ? `Active: ${activeBatch.product_name}` : "Line A - Spices Blending"}</span>
                  <span className={`status ${activeBatch ? 'running' : 'maintenance'}`}>
                    {activeBatch ? activeBatch.status : "Idle"}
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: activeBatch ? "100%" : "0%" }}></div>
                </div>
                <p>
                    {activeBatch 
                        ? `Output: ${activeBatch.actual_output || 0} KG • Batch: ${activeBatch.batch_id}` 
                        : "No active production batch detected"}
                </p>
                {activeBatch?.notes && <p style={{fontSize: '12px', color: '#fca5a5', marginTop: '5px'}}>Note: {activeBatch.notes}</p>}
              </div>

              {/* ✅ Line B - RESTORED DESIGN with REAL Packing Records */}
              <div className="line-item">
                <div className="line-header">
                  <span>Line B - Packaging</span>
                  <span className="status running">Running</span>
                </div>
                <div style={{ maxHeight: '100px', overflowY: 'auto', marginTop: '10px' }}>
                    {packingRecords.length > 0 ? (
                        packingRecords.slice(-2).map((record, index) => (
                            <div key={index} style={{ marginBottom: '10px', fontSize: '0.9rem' }}>
                                <strong>{record.product}</strong>: {record.total_units} units ({record.unit_size})
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Exp: {record.expiry_date}</div>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: '#94a3b8' }}>No packaging history available.</p>
                    )}
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: packingRecords.length > 0 ? "100%" : "20%" }}></div>
                </div>
              </div>

              {/* Line C - Dummy Status */}
              <div className="line-item warning">
                <div className="line-header">
                  <span>Line C - Grinding</span>
                  <span className="status maintenance">Maintenance</span>
                </div>
                <p>Scheduled downtime until 4:00 PM</p>
              </div>
            </div>
          </div>

          {/* Action Modules Grid (Keeping your existing dummy structure) */}
          <div className="cards-grid">
            <div className="card highlight-cyan animate-alert">
              <div className="icon-box">📅</div>
              <div className="card-content">
                <h3>Production Planning</h3>
                <p>Create and schedule daily batch plans based on sales demand.</p>
                <span className="status-badge alert">3 Plans Pending</span>
              </div>
            </div>
            {/* ... other cards remain unchanged ... */}
          </div>
        </div>
        <Footer />
      </div>

      <style>{`
        /* Keeping your original layout styles */
        .manager-layout {
          display: flex;
          min-height: 100vh;
          background: url(${backgroundImg}) no-repeat center center fixed;
          background-size: cover;
          font-family: 'Inter', sans-serif;
          position: relative;
        }
        .manager-layout::before { content: ""; position: absolute; inset: 0; background: rgba(15, 23, 42, 0.85); z-index: 0; }
        .main-content { margin-left: 280px; width: calc(100% - 280px); display: flex; flex-direction: column; position: relative; z-index: 1; }
        .dashboard { padding: 30px 50px 50px; flex: 1; color: white; }
        .header-section h1 { font-size: 3.8rem; font-weight: 900; background: linear-gradient(135deg, #22d3ee, #e879f9); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 28px; margin-bottom: 60px; }
        .stat-card { background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 24px; padding: 32px; }
        .value { font-size: 3rem; font-weight: 800; color: white; }
        .section-card { background: rgba(255, 255, 255, 0.08); border-radius: 28px; padding: 40px; margin-bottom: 60px; }
        .lines-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }
        .line-item { background: rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 20px; }
        .status.running { background: rgba(52, 211, 153, 0.2); color: #34d399; }
        .status.maintenance { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
        .progress-bar { height: 12px; background: rgba(255, 255, 255, 0.1); border-radius: 6px; overflow: hidden; margin-bottom: 12px; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #22d3ee, #e879f9); border-radius: 6px; }
        .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px; }
        .card { background: rgba(255, 255, 255, 0.08); border-radius: 28px; padding: 36px; border: 1px solid rgba(255, 255, 255, 0.15); }
        .icon-box { font-size: 3rem; margin-bottom: 24px; }
      `}</style>
    </div>
  );
}

export default ManagerHome;