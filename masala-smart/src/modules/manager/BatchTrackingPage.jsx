import React, { useState, useEffect } from "react";
import ManagerNavbar from "../../components/ManagerNavbar";
import ManagerSidebar from "./managersidebar";
import Footer from "../../components/Footer";
import backgroundImg from "../../assets/img2.png";
import { getAllProductionBatches } from "../../services/api"; // ✅ IMPORT THIS

const BatchTracking = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const data = await getAllProductionBatches(); // ✅ USE API FUNCTION
      setBatches(data);
    } catch (err) {
      console.error("Failed to load batches:", err);
      alert("Error loading batches: " + (err.error || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const getStageColor = (stage) => {
    const colors = {
      "In Progress": "#fbbf24",
      "Blending Done": "#60a5fa",
      "Grinding Done": "#a78bfa",
      "Packing Done": "#34d399",
      "Completed": "#10b981"
    };
    return colors[stage] || "#94a3b8";
  };

  return (
    <> 
      <div className="manager-layout">
        <ManagerSidebar activePage="tracking" />
        
        <div className="main-content">
           <ManagerNavbar />
          <div className="dashboard">
            <div className="header">
              <h1>📦 Batch Tracking</h1>
              <p>Monitor production progress across all batches</p>
            </div>

            <div className="batches-grid">
              {loading ? (
                <p>Loading batches...</p>
              ) : batches.length === 0 ? (
                <div className="empty-state">
                  <h3>No Batches Yet</h3>
                  <p>Create a blend plan to start production</p>
                </div>
              ) : (
                batches.map(batch => (
                  <div key={batch._id} className="batch-card">
                    <div className="batch-header">
                      <h3>{batch.product_name}</h3>
                      <span className="batch-id">{batch.batch_id}</span>
                    </div>
                    
                    <div className="batch-info">
                      <div className="info-row">
                        <span>Planned:</span>
                        <strong>{batch.planned_qty} kg</strong>
                      </div>
                      <div className="info-row">
                        <span>Actual:</span>
                        <strong>{batch.actual_output || 'Pending'}</strong>
                      </div>
                      <div className="info-row">
                        <span>Status:</span>
                        <strong>{batch.status}</strong>
                      </div>
                    </div>

                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{
                          width: `${(batch.stages_completed / batch.total_stages) * 100}%`,
                          background: getStageColor(batch.current_stage)
                        }}
                      />
                    </div>

                    <div className="stage-badge" style={{ background: getStageColor(batch.current_stage) }}>
                      {batch.current_stage}
                    </div>

                    <div className="batch-footer">
                      <small>Created: {batch.created_at}</small>
                      <small>{batch.stages_completed}/{batch.total_stages} stages</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <Footer />
        </div>
      </div>

      <style>{`
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
          background: rgba(15, 23, 42, 0.85);
          z-index: 1;
        }
        .main-content {
          margin-left: 280px;
          width: calc(100% - 280px);
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
        }
        .dashboard {
          padding: 40px 60px 60px;
          flex: 1;
          color: white;
        }
        .header h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          background: linear-gradient(90deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .header p {
          color: #cbd5e1;
          font-size: 1.1rem;
          margin-bottom: 30px;
        }
        .batches-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
          margin-top: 30px;
        }
        .batch-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .batch-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
        }
        .batch-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .batch-header h3 {
          font-size: 1.3rem;
          margin: 0;
        }
        .batch-id {
          background: rgba(96, 165, 250, 0.2);
          padding: 4px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          color: #60a5fa;
          font-weight: 600;
        }
        .batch-info {
          margin: 16px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.95rem;
        }
        .info-row span {
          color: #94a3b8;
        }
        .info-row strong {
          color: white;
        }
        .progress-bar {
          height: 8px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
          margin: 16px 0;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }
        .stage-badge {
          padding: 10px 16px;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
          margin: 16px 0;
          font-size: 0.9rem;
        }
        .batch-footer {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: #94a3b8;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 40px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
        }
        .empty-state h3 {
          font-size: 2rem;
          color: #60a5fa;
          margin-bottom: 10px;
        }
        .empty-state p {
          color: #cbd5e1;
          font-size: 1.1rem;
        }
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0;
            width: 100%;
          }
          .dashboard {
            padding: 100px 20px 40px;
          }
          .batches-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default BatchTracking;