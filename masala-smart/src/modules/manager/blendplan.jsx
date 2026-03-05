import React, { useState, useEffect } from "react";
import ManagerNavbar from "../../components/ManagerNavbar";
import ManagerSidebar from "./managersidebar";
import Footer from "../../components/Footer";
import backgroundImg from "../../assets/img2.png";
import { generateBlendPlan, fetchMasalaTypes, startProduction } from '../../services/api';

const BlendPlan = () => {
  // --- Logic State ---
  const [masalaTypes, setMasalaTypes] = useState([]);
  const [selectedMasala, setSelectedMasala] = useState('');
  const [targetQty, setTargetQty] = useState('');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false); // State for production assignment

  // --- Effects ---
  useEffect(() => {
    loadMasalaTypes();
  }, []);

  const loadMasalaTypes = async () => {
    try {
      const data = await fetchMasalaTypes();
      setMasalaTypes(data);
    } catch (error) {
      console.error("Failed to load masala types", error);
    }
  };

  const handleCalculate = async () => {
    if (!selectedMasala || !targetQty) return;
    setLoading(true);
    try {
      const result = await generateBlendPlan(selectedMasala, targetQty);
      setPlan(result);
    } catch (err) {
      alert("Error generating plan");
    }
    setLoading(false);
  };

  // --- NEW: ASSIGN TO STAFF LOGIC ---
  // Update the handleSendToStaff function

const handleSendToStaff = async () => {
  if (!plan) return;
  
  setSending(true);
  try {
    const selectedType = masalaTypes.find(m => m.id === selectedMasala);
    
    const payload = {
      masala_id: selectedMasala,
      product_name: selectedType ? selectedType.name : "Custom Blend",
      target_qty: plan.target_quantity,
      bom_details: plan.plan.map(item => ({
        ingredient_id: item.ingredient_id,  // ✅ Now included from backend
        item: item.ingredient_name,
        required_qty: item.required_qty,
        target: `${item.required_qty} kg` 
      }))
    };

    await startProduction(payload);
    alert("✅ Plan sent! Inventory has been updated.");
    
    // Clear form
    setPlan(null);
    setTargetQty('');
    setSelectedMasala('');
    
    // Optional: Refresh ingredients to show new quantities
    loadMasalaTypes();
    
  } catch (err) {
    alert(err.error || "Error sending plan to staff");
  } finally {
    setSending(false);
  }
};
  return (
    <>
      {/* Layout */}
      <div className="manager-layout">
        {/* Sidebar */}
        <ManagerSidebar activePage="blendplan" />

        {/* Main Content */}
        <div className="main-content">
          {/* Navbar */}
          <ManagerNavbar />
          <div className="dashboard">
            
            {/* Input Section Card */}
            <div className="section-card">
              <h2>Blend Plan Generator</h2>
              <p className="subtitle">
                Select a masala type and target quantity to calculate raw material requirements.
              </p>

              <div className="control-panel">
                <select 
                  className="input-field"
                  onChange={(e) => setSelectedMasala(e.target.value)}
                  value={selectedMasala}
                >
                  <option value="">Select Masala Type</option>
                  {masalaTypes.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>

                <input 
                  type="number" 
                  placeholder="Target Quantity (kg)"
                  className="input-field"
                  value={targetQty}
                  onChange={(e) => setTargetQty(e.target.value)}
                />

                <button 
                  onClick={handleCalculate}
                  className="action-btn"
                  disabled={loading}
                >
                  {loading ? "Calculating..." : "Generate Plan"}
                </button>
              </div>
            </div>

            {/* Results Section (Conditional) */}
            {plan && (
              <div className="section-card result-card">
                <div className="result-header-flex">
                  <div className={`status-badge ${plan.is_feasible ? 'status-ok' : 'status-err'}`}>
                    <strong>Status:</strong> {plan.is_feasible ? "Production Possible" : "Insufficient Ingredients"}
                  </div>

                  {/* NEW: SEND TO STAFF BUTTON */}
                  {plan.is_feasible && (
                    <button 
                      className="send-staff-btn" 
                      onClick={handleSendToStaff}
                      disabled={sending}
                    >
                      {sending ? "Sending..." : "🚀 Send to Staff"}
                    </button>
                  )}
                </div>
                
                <h3 className="result-title">Recipe Breakdown for {plan.target_quantity}kg</h3>
                
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Ingredient</th>
                        <th>Required</th>
                        <th>Available</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.plan.map((item, idx) => (
                        <tr key={idx} className={item.status !== 'OK' ? 'row-warning' : ''}>
                          <td>{item.ingredient_name}</td>
                          <td>{item.required_qty} kg</td>
                          <td>{item.available_qty} kg</td>
                          <td>{item.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <Footer />
        </div>
      </div>

      {/* Scoped Styles */}
      <style>{`
        .manager-layout {
          display: flex;
          min-height: 100vh;
          background: url(${backgroundImg}) no-repeat center center fixed;
          background-size: cover;
          position: relative;
          font-family: "Inter", sans-serif;
        }

        .manager-layout::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.85);
          z-index: 0;
        }

        .main-content {
          margin-left: 280px;
          width: calc(100% - 280px);
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
        }

        .dashboard {
          padding: 120px 60px 60px;
          flex: 1;
          color: white;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .section-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          border-radius: 28px;
          padding: 40px;
          max-width: 900px;
          width: 100%;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        h2 { font-size: 2.2rem; margin-bottom: 10px; font-weight: 700; }
        .subtitle { color: #cbd5e1; font-size: 1.1rem; line-height: 1.6; margin-bottom: 30px; }

        .control-panel { display: flex; gap: 15px; flex-wrap: wrap; }

        .input-field {
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(0,0,0,0.3);
          color: white;
          font-size: 1rem;
          min-width: 200px;
          flex: 1;
        }

        .input-field:focus { outline: none; border-color: #60a5fa; background: rgba(0,0,0,0.5); }

        .action-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .action-btn:hover { background: #2563eb; }
        .action-btn:disabled { background: #94a3b8; cursor: not-allowed; }

        /* Results Styling */
        .result-card { animation: fadeIn 0.5s ease-out; }
        .result-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }

        .status-badge { padding: 12px; border-radius: 12px; font-weight: 500; }
        .status-ok { background: rgba(34, 197, 94, 0.2); color: #86efac; border: 1px solid rgba(34, 197, 94, 0.3); }
        .status-err { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); }

        .send-staff-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
        }
        .send-staff-btn:hover { background: #059669; transform: translateY(-2px); }
        .send-staff-btn:disabled { background: #4b5563; cursor: not-allowed; transform: none; }

        .result-title { font-size: 1.5rem; margin-bottom: 20px; font-weight: 600; }
        .table-container { overflow-x: auto; background: rgba(0,0,0,0.2); border-radius: 16px; }
        .custom-table { width: 100%; border-collapse: collapse; color: #e2e8f0; }
        .custom-table th { text-align: left; padding: 16px; background: rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.1); }
        .custom-table td { padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .row-warning { background: rgba(239, 68, 68, 0.1); color: #fca5a5; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 768px) {
          .main-content { margin-left: 0; width: 100%; }
          .dashboard { padding: 100px 24px 40px; }
          .control-panel { flex-direction: column; }
          .result-header-flex { flex-direction: column; align-items: stretch; }
        }
      `}</style>
    </>
  );
};

export default BlendPlan;