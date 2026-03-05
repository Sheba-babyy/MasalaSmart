import React, { useState, useEffect } from 'react';
import Sidebar from "./Sidebar";
import StaffNavbar from "../../components/StaffNavbar";
import Footer from "../../components/Footer";
import backgroundImg from "../../assets/img1.png"; 
// Updated import to use updateProductionRecord
import { fetchActiveProduction, updateProductionRecord } from "../../services/api"; 

function DailyProduction() {
  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    actualOutput: "",
    batchStatus: "In Progress",
    notes: "",
  });

  useEffect(() => {
    const getActiveTask = async () => {
      try {
        const data = await fetchActiveProduction();
        setTaskData(data);
      } catch (err) {
        console.log("No active production found in database.");
        setTaskData(null);
      } finally {
        setLoading(false);
      }
    };
    getActiveTask();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // --- UPDATED SUBMIT LOGIC ---
  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!taskData) return;

  try {
    const loginId = localStorage.getItem("login_id");
    
    // Map form status to workflow stage
    const stageMapping = {
      "In Progress": "blending",
      "Sent to Grinding": "grinding",
      "Sent to Packing": "packing",
      "Completed": "completed"
    };
    
    const stage = stageMapping[formData.batchStatus];
    
    // Update the workflow stage
    await fetch(`http://127.0.0.1:5000/production/stage/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        batch_id: taskData._id,
        stage: stage,
        staff_login_id: loginId,
        notes: formData.notes
      })
    });
    
    // Also update the main batch record with actual output
    await updateProductionRecord(taskData._id, {
      actual_output: formData.actualOutput,
      notes: formData.notes
    });
    
    alert(`✅ Stage "${formData.batchStatus}" recorded successfully!`);
    
    // Refresh to get next batch
    window.location.reload();
    
  } catch (err) {
    console.error("Submission error:", err);
    alert("Error updating production");
  }
};

  // --- Layout Helper ---
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
      {/* Removed 'jsx' attribute to resolve React DOM error */}
      <style>{`
        .staff-layout-container {
          position: relative;
          display: flex; 
          min-height: 100vh;
          width: 100%;
          background: url(${backgroundImg}) no-repeat center center fixed;
          background-size: cover;
          overflow-x: hidden;
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
        .page-content { flex: 1; padding: 40px; color: white; max-width: 1000px; margin: 0 auto; width: 100%; }
        
        .glass-card {
            background: rgba(30, 25, 20, 0.85); 
            backdrop-filter: blur(12px);
            border-radius: 16px;
            padding: 30px;
            border: 1px solid rgba(212, 175, 55, 0.3); 
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            margin-bottom: 30px;
        }

        .batch-id-badge { background: #d4af37; color: #2a221b; padding: 6px 12px; border-radius: 4px; font-weight: bold; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .bom-list { list-style: none; padding: 0; }
        .bom-list li { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
        .target-val { font-weight: bold; color: #f1c40f; }
        
        .staff-input { width: 100%; padding: 14px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 8px; color: white; margin-top: 10px; box-sizing: border-box; }
        .submit-btn { width: 100%; padding: 15px; background-color: #1f3a4d; color: #d4af37; border: 1px solid #d4af37; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 20px; }
        .submit-btn:hover { background-color: #2c526d; }

        .page-header h1 {
          font-size: 2.8rem; margin-bottom: 10px; font-weight: 800;
          background: linear-gradient(90deg, #d4af37, #f1c40f, #fff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .production-grid { 
            display: grid; 
            grid-template-columns: 1fr; 
            gap: 0px; 
            align-items: start; 
        }

        @media (max-width: 1024px) { .main-content-area { margin-left: 0; } }
      `}</style>
    </div>
  );

  if (loading) return <Layout><div style={{textAlign:'center', marginTop:'100px'}}><h2>Loading Active Batch...</h2></div></Layout>;

  if (!taskData) {
    return (
      <Layout>
        <div className="glass-card" style={{ textAlign: 'center', padding: '100px' }}>
          <h2 style={{ color: '#d4af37' }}>🎉 No Active Production</h2>
          <p style={{ color: '#e0e0e0', marginTop: '10px' }}>Wait for the Manager to send a Blend Plan.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="page-header">
          <h1>Daily Production Entry</h1>
          <p>Execute Blend Plan: Record material usage and final batch output.</p>
        </div>

        <div className="production-grid">
          {/* SECTION 1: Current Batch Details */}
          <div className="glass-card task-details-card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>📋 Current Batch Details</h3>
              <span className="batch-id-badge">{taskData.batch_id}</span>
            </div>
            
            <div className="detail-row">
              <div>
                <label style={{ color: '#aaa', fontSize: '0.9rem' }}>Product:</label>
                <h4 style={{ fontSize: '1.3rem' }}>{taskData.product_name}</h4>
              </div>
              <div style={{ textAlign: 'right' }}>
                <label style={{ color: '#aaa', fontSize: '0.9rem' }}>Planned Qty:</label>
                <h4 style={{ fontSize: '1.3rem' }}>{taskData.planned_qty} KG</h4>
              </div>
            </div>

            <div className="bom-section">
              <h4 style={{ color: '#d4af37', marginTop: '20px' }}>Target Bill of Materials (BOM)</h4>
              <ul className="bom-list">
                {taskData.bom && taskData.bom.map((item, index) => (
                  <li key={index}>
                    <span>{item.item}</span>
                    <span className="target-val">{item.target}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* SECTION 2: Record Production Data */}
          <div className="glass-card form-card">
            <h3 style={{ marginBottom: '20px' }}>⚙️ Record Production Data</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ color: '#d4af37', fontWeight: 'bold' }}>Total Actual Output (KG)</label>
                <input type="number" name="actualOutput" value={formData.actualOutput} onChange={handleInputChange} className="staff-input" required step="0.01" />
              </div>
              
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ color: '#d4af37', fontWeight: 'bold' }}>Batch Status</label>
                <select name="batchStatus" value={formData.batchStatus} onChange={handleInputChange} className="staff-input">
                  <option value="In Progress">Blending In Progress</option>
                  <option value="Sent to Grinding">Sent to Grinding</option>
                  <option value="Sent to Packing">Sent to Packing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ color: '#d4af37', fontWeight: 'bold' }}>Shift Notes</label>
                <textarea name="notes" rows="4" value={formData.notes} onChange={handleInputChange} className="staff-input" placeholder="Enter observations..."></textarea>
              </div>
              
              <button type="submit" className="submit-btn">Submit Batch Record</button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default DailyProduction;