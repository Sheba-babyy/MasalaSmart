import React, { useState, useEffect } from 'react';
import Sidebar from "./Sidebar";
import StaffNavbar from "../../components/StaffNavbar";
import Footer from "../../components/Footer";
import backgroundImg from "../../assets/img1.png";
import { getStaffActiveBatches, updateProductionStage } from "../../services/api";

function StaffWorkflow() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [formData, setFormData] = useState({
    actualOutput: "",
    notes: ""
  });
  const [submitting, setSubmitting] = useState(false);
  
  const loginId = localStorage.getItem("login_id");

  useEffect(() => {
    loadActiveBatches();
  }, []);

  const loadActiveBatches = async () => {
    try {
      const data = await getStaffActiveBatches(loginId);
      setBatches(data);
    } catch (err) {
      console.error("Failed to load batches:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStageUpdate = async (batch, stage) => {
    if (!window.confirm(`Mark ${stage} as complete for batch ${batch.batch_id}?`)) {
      return;
    }

    setSubmitting(true);
    try {
      await updateProductionStage(
        batch._id,
        stage.toLowerCase().replace(" ", ""),
        loginId,
        formData.notes || `${stage} completed`
      );
      
      alert(`✓ ${stage} marked as complete!`);
      loadActiveBatches(); // Refresh list
      setFormData({ actualOutput: "", notes: "" });
    } catch (err) {
      alert("Error updating stage: " + (err.error || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const getStageButton = (batch) => {
    const action = batch.next_action;
    const stageMap = {
      "Start Blending": { label: "Complete Blending", stage: "blending", color: "#3b82f6" },
      "Start Grinding": { label: "Complete Grinding", stage: "grinding", color: "#f59e0b" },
      "Start Packing": { label: "Complete Packing", stage: "packing", color: "#8b5cf6" },
      "Mark Complete": { label: "Mark as Completed", stage: "completed", color: "#10b981" }
    };
    
    return stageMap[action] || null;
  };

  const Layout = ({ children }) => (
    <div className="staff-layout-container">
      <Sidebar />
      <div className="main-content-area">
        <StaffNavbar />
        <div className="page-content">
          {children}
        </div>
        <Footer />
      </div>
      <style>{`
        .staff-layout-container {
          position: relative;
          display: flex;
          min-height: 100vh;
          width: 100%;
          background: url(${backgroundImg}) no-repeat center center fixed;
          background-size: cover;
        }
        .staff-layout-container::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          z-index: 0;
        }
        .main-content-area {
          flex: 1;
          margin-left: 260px;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
        }
        .page-content {
          flex: 1;
          padding: 40px;
          color: white;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .page-header h1 {
          font-size: 2.8rem;
          margin-bottom: 10px;
          font-weight: 800;
          background: linear-gradient(90deg, #d4af37, #f1c40f, #fff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle { color: #cbd5e1; margin-bottom: 40px; font-size: 1.1rem; }

        .batch-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 25px;
          margin-top: 30px;
        }

        .batch-card {
          background: rgba(30, 25, 20, 0.85);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          padding: 25px;
          border: 1px solid rgba(212, 175, 55, 0.3);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          transition: transform 0.2s;
        }
        .batch-card:hover { transform: translateY(-5px); }

        .batch-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .batch-id-tag {
          background: #d4af37;
          color: #2a221b;
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: bold;
          font-size: 0.85rem;
        }
        .status-tag {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          background: rgba(59, 130, 246, 0.2);
          color: #93c5fd;
        }

        .product-name {
          font-size: 1.4rem;
          font-weight: 700;
          color: #f1c40f;
          margin-bottom: 15px;
        }

        .batch-detail {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          color: #cbd5e1;
        }
        .detail-label { color: #94a3b8; }
        .detail-value { font-weight: 600; color: white; }

        .bom-section {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .bom-title {
          font-size: 0.9rem;
          color: #d4af37;
          margin-bottom: 10px;
          font-weight: 600;
        }
        .bom-list {
          list-style: none;
          padding: 0;
          font-size: 0.85rem;
        }
        .bom-list li {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          color: #e0e0e0;
        }

        .action-section {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .notes-input {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid rgba(212, 175, 55, 0.4);
          background: rgba(0, 0, 0, 0.3);
          color: white;
          margin-bottom: 15px;
          font-size: 0.9rem;
          resize: vertical;
        }
        .notes-input::placeholder { color: #94a3b8; }

        .stage-btn {
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          border: none;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          color: white;
        }
        .stage-btn:hover { transform: scale(1.02); opacity: 0.9; }
        .stage-btn:disabled {
          background: #4b5563;
          cursor: not-allowed;
          transform: none;
        }

        .empty-state {
          text-align: center;
          padding: 100px 40px;
          background: rgba(255,255,255,0.05);
          border-radius: 16px;
          margin-top: 40px;
        }
        .empty-state h3 {
          font-size: 2rem;
          color: #d4af37;
          margin-bottom: 15px;
        }
        .empty-state p {
          color: #cbd5e1;
          font-size: 1.1rem;
        }

        @media (max-width: 1024px) {
          .main-content-area { margin-left: 0; }
          .batch-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div style={{textAlign:'center', marginTop:'100px'}}>
          <h2>Loading Active Batches...</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-header">
        <h1>Production Workflow</h1>
        <p className="subtitle">
          Track and complete production stages: Blending → Grinding → Packing → Complete
        </p>
      </div>

      {batches.length === 0 ? (
        <div className="empty-state">
          <h3>🎉 All Caught Up!</h3>
          <p>No active batches requiring your attention right now.</p>
        </div>
      ) : (
        <div className="batch-grid">
          {batches.map(batch => {
            const stageInfo = getStageButton(batch);
            return (
              <div key={batch._id} className="batch-card">
                <div className="batch-header">
                  <span className="batch-id-tag">{batch.batch_id}</span>
                  <span className="status-tag">{batch.next_action}</span>
                </div>

                <div className="product-name">{batch.product_name}</div>

                <div className="batch-detail">
                  <span className="detail-label">Planned Quantity:</span>
                  <span className="detail-value">{batch.planned_qty} KG</span>
                </div>

                <div className="batch-detail">
                  <span className="detail-label">Current Status:</span>
                  <span className="detail-value">{batch.status}</span>
                </div>

                {batch.bom && batch.bom.length > 0 && (
                  <div className="bom-section">
                    <div className="bom-title">Required Materials:</div>
                    <ul className="bom-list">
                      {batch.bom.map((item, idx) => (
                        <li key={idx}>
                          <span>{item.item}</span>
                          <span>{item.target}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="action-section">
                  <textarea
                    className="notes-input"
                    placeholder="Add notes (optional)..."
                    rows="2"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />

                  {stageInfo && (
                    <button
                      className="stage-btn"
                      style={{ background: stageInfo.color }}
                      onClick={() => handleStageUpdate(batch, stageInfo.label)}
                      disabled={submitting}
                    >
                      {submitting ? "Processing..." : `✓ ${stageInfo.label}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}

export default StaffWorkflow;