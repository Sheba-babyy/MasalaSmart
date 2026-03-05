import React, { useState, useEffect } from 'react';
import Sidebar from "./Sidebar";
import StaffNavbar from "../../components/StaffNavbar";
import Footer from "../../components/Footer";
import backgroundImg from "../../assets/img1.png"; 
import { fetchBOMs, savePackingRecord } from "../../services/api"; // Added savePackingRecord

function PackingPage() {
  // --- Logic State ---
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State (Exactly as your original)
  const [formData, setFormData] = useState({
    batchId: "",
    product: "",
    unitSize: "100g",
    packedQty: "",
    mfgDate: new Date().toISOString().split('T')[0], // Default to today
    expiryDate: "", // Added to track calculated value
    batchNotes: ""
  });

  // --- Effects ---
  useEffect(() => {
    const getAvailableBatches = async () => {
      try {
        const data = await fetchBOMs(); 
        setBatches(data);
      } catch (err) {
        console.error("Failed to fetch batches");
      } finally {
        setLoading(false);
      }
    };
    getAvailableBatches();
    calculateExpiry(formData.mfgDate);
  }, []);

  const calculateExpiry = (mfgDate) => {
    const date = new Date(mfgDate);
    date.setFullYear(date.getFullYear() + 1); // Add 12 months
    setFormData(prev => ({ ...prev, expiryDate: date.toISOString().split('T')[0] }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "mfgDate") calculateExpiry(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Logic call
      await savePackingRecord(formData);
      alert(`✅ Packing Recorded Successfully!\nBatch: ${formData.batchId}\nQty: ${formData.packedQty} packets`);
      
      // Reset critical fields (Original reset logic)
      setFormData({ ...formData, packedQty: "", batchId: "", batchNotes: "" });
    } catch (err) {
      alert("Error saving packing record: " + (err.error || "Server Error"));
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
          <div className="page-header center-text">
            <h1>Packing Entry Station</h1>
            <p>Convert bulk production into finished retail units.</p>
          </div>

          <div className="packing-container">
            <div className="glass-card big-form-card">
                <div className="card-header">
                    <h3>📦 New Packing Record</h3>
                    <span className="date-badge">Today: {formData.mfgDate}</span>
                </div>
                
                <form onSubmit={handleSubmit}>
                    {/* Row 1: Batch & Product */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Select Production Batch</label>
                            <select 
                                name="batchId" 
                                value={formData.batchId} 
                                onChange={handleInputChange} 
                                className="staff-input" 
                                required
                            >
                                <option value="">Select Batch...</option>
                                {batches.map(b => (
                                    <option key={b._id} value={b._id}>{b.batch_id || b.productName}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Product Name</label>
                            <input 
                                type="text"
                                name="product"
                                value={formData.product}
                                onChange={handleInputChange}
                                placeholder="e.g. Garam Masala"
                                className="staff-input"
                                required
                            />
                        </div>
                    </div>

                    {/* Row 2: Specs */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Packaging Unit Size</label>
                            <select 
                                name="unitSize" 
                                value={formData.unitSize} 
                                onChange={handleInputChange}
                                className="staff-input"
                            >
                                <option value="50g">50g Pouch</option>
                                <option value="100g">100g Pouch</option>
                                <option value="200g">200g Pouch</option>
                                <option value="250g">250g Pouch</option>
                                <option value="500g">500g Pouch</option>
                                <option value="1 kg">1 kg Packet</option>
                                <option value="5 kg">5 kg Bulk Bag</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Total Quantity Packed (Units)</label>
                            <input 
                                type="number" 
                                name="packedQty" 
                                value={formData.packedQty} 
                                onChange={handleInputChange} 
                                placeholder="e.g. 500"
                                className="staff-input"
                                required
                                min="1"
                            />
                        </div>
                    </div>

                    {/* Row 3: Date & Notes */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Manufacturing Date (Print Date)</label>
                            <input 
                                type="date" 
                                name="mfgDate" 
                                value={formData.mfgDate} 
                                onChange={handleInputChange}
                                className="staff-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Expiry Date (Auto-calc)</label>
                            <input 
                                type="text" 
                                value={formData.expiryDate} 
                                disabled 
                                className="staff-input disabled" 
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Packing Notes / Quality Remarks</label>
                        <textarea
                            name="batchNotes"
                            rows="3"
                            value={formData.batchNotes}
                            onChange={handleInputChange}
                            placeholder="Note any wastage, sealing issues, or label corrections..."
                            className="staff-input"
                        ></textarea>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={() => setFormData({...formData, batchId: "", packedQty: "", product: ""})}>Clear</button>
                        <button type="submit" className="submit-btn big-btn">
                            ✅ Save & Complete Batch
                        </button>
                    </div>
                </form>
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
          width: 100%;
          box-sizing: border-box;
        }

        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .page-header h1 {
          font-size: 2.8rem; margin-bottom: 10px; font-weight: 800;
          background: linear-gradient(90deg, #d4af37, #f1c40f, #fff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .page-header p { font-size: 1.2rem; color: #b0bec5; }

        .packing-container { display: flex; justify-content: center; width: 100%; }

        .glass-card.big-form-card {
            background: rgba(30, 25, 20, 0.9); 
            backdrop-filter: blur(15px);
            border-radius: 16px;
            padding: 40px;
            border: 1px solid rgba(212, 175, 55, 0.25); 
            box-shadow: 0 15px 40px rgba(0,0,0,0.6);
            width: 100%;
            max-width: 800px;
        }

        .card-header { 
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 30px; 
        }
        .card-header h3 { margin: 0; color: #d4af37; font-size: 1.6rem; }
        .date-badge { background: rgba(255,255,255,0.1); padding: 5px 10px; border-radius: 4px; font-size: 0.9rem; color: #f1c40f; }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 25px; }
        .form-group label { display: block; margin-bottom: 10px; font-size: 1rem; color: #f1c40f; font-weight: 500; }
        
        .staff-input {
            width: 100%; padding: 16px;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid #5d4037;
            border-radius: 8px;
            color: white; font-size: 1.1rem; box-sizing: border-box;
        }
        .staff-input.disabled { background: rgba(255,255,255,0.05); color: #7f8c8d; cursor: not-allowed; }
        
        .form-actions { display: flex; gap: 20px; margin-top: 30px; }
        .submit-btn {
            flex: 2; padding: 16px;
            background: linear-gradient(135deg, #1f3a4d, #2c526d); 
            color: #d4af37; border: 1px solid #d4af37; border-radius: 8px;
            font-weight: bold; cursor: pointer;
        }
        .submit-btn:hover { background: #d4af37; color: #1f3a4d; }
        .cancel-btn { flex: 1; padding: 16px; background: transparent; border: 1px solid #7f8c8d; color: #bdc3c7; border-radius: 8px; cursor: pointer; }
      `}</style>
    </div>
  );
}

export default PackingPage;