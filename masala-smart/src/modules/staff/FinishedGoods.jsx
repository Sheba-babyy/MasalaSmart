import React, { useState, useEffect } from 'react';
import Sidebar from "./Sidebar";
import StaffNavbar from "../../components/StaffNavbar";
import Footer from "../../components/Footer";
import backgroundImg from "../../assets/img1.png"; 
import { fetchAllPacking, savePackingRecord } from "../../services/api";

function FinishedGoods() {
  // --- Logic State ---
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State (Exactly as your original)
  const [formData, setFormData] = useState({
    batchId: "",
    product: "",
    unitSize: "100g",
    packedQty: "",
    mfgDate: new Date().toISOString().split('T')[0] // Default to today
  });

  // --- Load Data from Backend ---
  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const data = await fetchAllPacking();
      setInventory(data);
    } catch (err) {
      console.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // --- Submit Data to Backend ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await savePackingRecord(formData);
      alert("Packing details recorded successfully!");
      
      // Refresh list and reset form critical fields
      loadInventory();
      setFormData({ ...formData, packedQty: "", batchId: "" });
    } catch (err) {
      alert("Error saving record");
    }
  };

  return (
    <div className="staff-layout-container">
      {/* 1. Sidebar */}
      <Sidebar />

      {/* 2. Main Content */}
      <div className="main-content-area">
        <StaffNavbar />

        <div className="page-content animate-fade-in">
          <div className="page-header">
            <h1>Finished Goods & Packing</h1>
            <p>Record packing details and manage final inventory stock.</p>
          </div>

          <div className="fg-grid">
             {/* --- LEFT COLUMN: Packing Entry Form --- */}
            <div className="glass-card form-section">
                <div className="card-header">
                    <h3>📦 New Packing Entry</h3>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Batch ID (From Production)</label>
                        <input 
                            type="text" 
                            name="batchId" 
                            value={formData.batchId} 
                            onChange={handleInputChange} 
                            placeholder="e.g. BM-20231222-101"
                            className="staff-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Product Name</label>
                        <select 
                            name="product" 
                            value={formData.product} 
                            onChange={handleInputChange} 
                            className="staff-input"
                            required
                        >
                            <option value="">Select Product...</option>
                            <option value="Garam Masala">Garam Masala</option>
                            <option value="Turmeric Powder">Turmeric Powder</option>
                            <option value="Chilli Powder">Chilli Powder</option>
                            <option value="Chicken Masala">Chicken Masala</option>
                            <option value="Coriander Powder">Coriander Powder</option>
                        </select>
                    </div>

                    <div className="row-group">
                        <div className="form-group">
                            <label>Unit Size</label>
                            <select 
                                name="unitSize" 
                                value={formData.unitSize} 
                                onChange={handleInputChange} 
                                className="staff-input"
                            >
                                <option value="50g">50g Pouch</option>
                                <option value="100g">100g Pouch</option>
                                <option value="250g">250g Pouch</option>
                                <option value="500g">500g Pouch</option>
                                <option value="1 kg">1 kg Packet</option>
                                <option value="5 kg">5 kg Bulk</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Quantity Packed</label>
                            <input 
                                type="number" 
                                name="packedQty" 
                                value={formData.packedQty} 
                                onChange={handleInputChange} 
                                placeholder="Total packets"
                                className="staff-input" 
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>MFG Date</label>
                        <input 
                            type="date" 
                            name="mfgDate" 
                            value={formData.mfgDate} 
                            onChange={handleInputChange} 
                            className="staff-input"
                        />
                    </div>

                    <button type="submit" className="submit-btn">
                        Save Packing Record
                    </button>
                </form>
            </div>

             {/* --- RIGHT COLUMN: Inventory List --- */}
            <div className="glass-card list-section">
                <div className="card-header">
                    <h3>🏭 Recent Finished Stock</h3>
                    <button className="export-btn">Export Report</button>
                </div>

                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Batch ID</th>
                                <th>Product Details</th>
                                <th>Packed Qty</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map((item) => (
                                <tr key={item._id || item.id}>
                                    <td className="batch-cell">{item.batchId}</td>
                                    <td>
                                        <div className="product-name">{item.product}</div>
                                        <div className="unit-badge">{item.unitSize}</div>
                                    </td>
                                    <td className="qty-cell">{item.packedQty} <span className="small-text">units</span></td>
                                    <td>
                                        <span className={`status-badge ${(item.status || "Ready").toLowerCase().replace(" ", "-")}`}>
                                            {item.status || "Ready"}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="icon-btn" title="Print Label">🖨️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <style>{`
        /* --- Layout Structure --- */
        .staff-layout-container {
          position: relative;
          display: flex; 
          min-height: 100vh;
          width: 100vw;
          background: url(${backgroundImg}) no-repeat center center fixed;
          background-size: cover;
          overflow: hidden;
        }

        .staff-layout-container::before {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.75); 
          z-index: 0;
          pointer-events: none;
        }

        .main-content-area {
          flex: 1; 
          margin-left: 260px;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
          height: 100vh; 
          overflow-y: auto; 
        }

        .page-content {
          flex: 1;
          padding: 40px;
          color: white;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .page-header h1 {
          font-size: 2.5rem; margin-bottom: 10px; font-weight: 800;
          background: linear-gradient(90deg, #d4af37, #f1c40f, #fff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .page-header p { font-size: 1.1rem; color: #b0bec5; }

        .fg-grid {
            display: grid;
            grid-template-columns: 350px 1fr;
            gap: 30px;
            align-items: start;
        }

        .glass-card {
            background: rgba(30, 25, 20, 0.85); 
            backdrop-filter: blur(12px);
            border-radius: 16px;
            padding: 25px;
            border: 1px solid rgba(212, 175, 55, 0.2); 
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            color: #e0e0e0;
        }
        .card-header { 
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px; margin-bottom: 20px; 
        }
        .card-header h3 { margin: 0; color: #d4af37; font-size: 1.3rem; }

        .form-group { margin-bottom: 20px; }
        .row-group { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .form-group label { display: block; margin-bottom: 8px; font-size: 0.9rem; color: #f1c40f; }
        
        .staff-input {
            width: 100%; padding: 12px;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid #5d4037;
            border-radius: 8px;
            color: white; font-size: 0.95rem; box-sizing: border-box;
        }

        .submit-btn {
            width: 100%; padding: 12px;
            background: linear-gradient(135deg, #1f3a4d, #2c526d); 
            color: #d4af37; border: 1px solid #d4af37; border-radius: 8px;
            font-weight: bold; cursor: pointer; margin-top: 10px;
        }
        .submit-btn:hover { background: #d4af37; color: #1f3a4d; }

        .export-btn {
            background: transparent; border: 1px solid #a0a0a0; color: #a0a0a0;
            padding: 5px 12px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;
        }

        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 12px; color: #a0a0a0; font-size: 0.9rem; border-bottom: 2px solid #5d4037; }
        td { padding: 15px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        
        .batch-cell { font-family: monospace; color: #f1c40f; }
        .product-name { font-weight: bold; margin-bottom: 4px; }
        .unit-badge { font-size: 0.75rem; background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 10px; display: inline-block; }
        .qty-cell { font-size: 1.1rem; font-weight: bold; }

        .status-badge { padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; }
        .status-badge.ready { background: rgba(46, 204, 113, 0.15); color: #2ecc71; }
        .status-badge.qc-passed { background: rgba(52, 152, 219, 0.15); color: #3498db; }

        @media (max-width: 1024px) {
            .fg-grid { grid-template-columns: 1fr; }
            .main-content-area { margin-left: 0; }
        }
      `}</style>
    </div>
  );
}

export default FinishedGoods;